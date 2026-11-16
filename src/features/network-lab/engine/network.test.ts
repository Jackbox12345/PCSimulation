import { describe, it, expect } from "vitest";
import { makeDevice, type LabNode, type LabEdge } from "../data/types";
import {
  parseIP,
  validMask,
  ping,
  validateNetwork,
  missionComplete,
  canConnect,
} from "./network";
import { decodeTopology } from "./storage";
function fixture() {
  const a = makeDevice("desktop", 0),
    b = makeDevice("desktop", 1),
    s = makeDevice("switch", 2);
  a.data.ip = "192.168.1.10";
  b.data.ip = "192.168.1.20";
  const nodes = [a, b, s];
  const edges: LabEdge[] = [
    {
      id: "a",
      source: a.id,
      target: s.id,
      sourceHandle: "eth0",
      targetHandle: "p1",
    },
    {
      id: "b",
      source: b.id,
      target: s.id,
      sourceHandle: "eth0",
      targetHandle: "p2",
    },
  ];
  return { a, b, s, nodes, edges };
}
describe("IPv4 parsing", () => {
  it.each(["256.1.1.1", "1.2.3", "01.2.3.4", "1.2.3.-1", "1.2.3.4.5", "abc"])(
    "rejects %s",
    (ip) => expect(parseIP(ip)).toBeNull(),
  );
  it("parses valid addresses unsigned", () =>
    expect(parseIP("192.168.1.10")).toBe(3232235786));
  it.each(["255.0.255.0", "255.255.255.255", "0.0.0.0", "255.255.255.254"])(
    "rejects unsupported mask %s",
    (mask) => expect(validMask(mask)).toBe(false),
  );
});
describe("local Ethernet", () => {
  it("accepts pasted IP addresses and masks with surrounding whitespace", () => {
    const f = fixture();
    f.a.data.ip = " 192.168.1.10 ";
    f.a.data.mask = " 255.255.255.0 ";
    expect(ping(f.a.id, f.b.id, f.nodes, f.edges).success).toBe(true);
  });
  it("identifies an invalid mask without mislabeling a valid host address", () => {
    const f = fixture();
    f.a.data.mask = "255.255.255.10";
    const issues = validateNetwork(f.nodes, f.edges).filter(
      (i) => i.nodeId === f.a.id,
    );
    expect(issues.some((i) => i.code === "ip")).toBe(false);
    expect(issues.find((i) => i.code === "mask")?.message).toContain(
      '"255.255.255.10"',
    );
    expect(ping(f.a.id, f.b.id, f.nodes, f.edges).detail).toContain(
      "255.255.255.0",
    );
  });
  it("explains the actual reserved address and usable host range", () => {
    const f = fixture();
    f.a.data.ip = "192.168.1.0";
    expect(ping(f.a.id, f.b.id, f.nodes, f.edges).detail).toContain(
      "network address for mask 255.255.255.0",
    );
    expect(ping(f.a.id, f.b.id, f.nodes, f.edges).detail).toContain(
      "192.168.1.1 to 192.168.1.254",
    );
  });
  it("still detects duplicate addresses with different whitespace", () => {
    const f = fixture();
    f.a.data.ip = " 192.168.1.20 ";
    expect(
      validateNetwork(f.nodes, f.edges).some((i) => i.code === "duplicate"),
    ).toBe(true);
  });
  it("completes Mission 02 using two configured PCs through a switch", () => {
    const f = fixture();
    expect(ping(f.a.id, f.b.id, f.nodes, f.edges).success).toBe(true);
    expect(missionComplete(f.nodes, f.edges)).toBe(true);
  });
  it("requires switch for mission even when a direct cable can ping", () => {
    const f = fixture();
    const edges = [
      {
        id: "direct",
        source: f.a.id,
        target: f.b.id,
        sourceHandle: "eth0",
        targetHandle: "eth0",
      },
    ];
    expect(ping(f.a.id, f.b.id, f.nodes, edges).success).toBe(true);
    expect(missionComplete(f.nodes, edges)).toBe(false);
  });
  it("detects duplicate IP addresses", () => {
    const f = fixture();
    f.b.data.ip = f.a.data.ip;
    expect(ping(f.a.id, f.b.id, f.nodes, f.edges).success).toBe(false);
    expect(
      validateNetwork(f.nodes, f.edges).some((i) => i.code === "duplicate"),
    ).toBe(true);
  });
  it("does not let a switch route different subnets", () => {
    const f = fixture();
    f.b.data.ip = "192.168.2.20";
    expect(ping(f.a.id, f.b.id, f.nodes, f.edges).title).toBe(
      "Missing gateway",
    );
    expect(
      validateNetwork(f.nodes, f.edges).some((i) => i.code === "subnet"),
    ).toBe(true);
  });
  it("detects disconnected hosts", () => {
    const f = fixture();
    expect(ping(f.a.id, f.b.id, f.nodes, []).title).toBe("Disconnected device");
  });
  it("does not require DNS or a gateway for a local IP ping", () => {
    const f = fixture();
    f.a.data.dns = "invalid";
    f.a.data.gateway = "10.0.0.1";
    expect(ping(f.a.id, f.b.id, f.nodes, f.edges).success).toBe(true);
    expect(
      validateNetwork(f.nodes, f.edges).some((i) => i.code === "dns"),
    ).toBe(true);
  });
  it("requires a physical path even for matching subnets", () => {
    const f = fixture();
    const other = makeDevice("switch", 3);
    f.edges[1].target = other.id;
    expect(ping(f.a.id, f.b.id, [...f.nodes, other], f.edges).title).toBe(
      "Destination unreachable",
    );
  });
  it("rejects broadcast and network addresses", () => {
    const f = fixture();
    for (const ip of [
      "192.168.1.0",
      "192.168.1.255",
      "127.0.0.1",
      "224.0.0.1",
    ]) {
      f.a.data.ip = ip;
      expect(ping(f.a.id, f.b.id, f.nodes, f.edges).success).toBe(false);
    }
  });
  it("rejects inconsistent masks", () => {
    const f = fixture();
    f.a.data.mask = "255.255.0.0";
    expect(ping(f.a.id, f.b.id, f.nodes, f.edges).title).toBe(
      "Wrong subnet mask",
    );
  });
  it("allows only one Ethernet cable per port", () => {
    const f = fixture();
    expect(canConnect(f.a.id, f.b.id, "eth0", "eth0", f.nodes, f.edges)).toBe(
      false,
    );
    expect(canConnect(f.a.id, f.b.id, "eth0", "eth0", f.nodes, [])).toBe(true);
  });
});
function routed() {
  const f = fixture(),
    r = makeDevice("router", 3);
  f.b.data.ip = "192.168.2.20";
  f.a.data.gateway = "192.168.1.1";
  f.b.data.gateway = "192.168.2.1";
  r.data.interfaces = {
    eth0: { ip: "192.168.1.1", mask: "255.255.255.0" },
    eth1: { ip: "192.168.2.1", mask: "255.255.255.0" },
  };
  const nodes: LabNode[] = [...f.nodes, r];
  const edges: LabEdge[] = [
    f.edges[0],
    {
      id: "r0",
      source: f.s.id,
      target: r.id,
      sourceHandle: "p2",
      targetHandle: "eth0",
    },
    {
      id: "r1",
      source: f.b.id,
      target: r.id,
      sourceHandle: "eth0",
      targetHandle: "eth1",
    },
  ];
  return { ...f, r, nodes, edges };
}
describe("one-hop routing", () => {
  it("routes between explicitly configured connected interfaces", () => {
    const f = routed();
    expect(ping(f.a.id, f.b.id, f.nodes, f.edges).success).toBe(true);
  });
  it("requires a return gateway", () => {
    const f = routed();
    f.b.data.gateway = "";
    expect(ping(f.a.id, f.b.id, f.nodes, f.edges).title).toBe(
      "Missing gateway",
    );
  });
  it("checks actual router port attachments", () => {
    const f = routed();
    f.edges[2].targetHandle = "eth0";
    expect(ping(f.a.id, f.b.id, f.nodes, f.edges).success).toBe(false);
  });
  it("rejects a router with invalid interface mask", () => {
    const f = routed();
    f.r.data.interfaces.eth1.mask = "255.0.255.0";
    expect(ping(f.a.id, f.b.id, f.nodes, f.edges).success).toBe(false);
  });
  it("diagnoses overlapping router interface networks", () => {
    const f = routed();
    f.r.data.interfaces.eth1.ip = "192.168.1.2";
    expect(
      validateNetwork(f.nodes, f.edges).some((i) => i.code === "overlap"),
    ).toBe(true);
  });
});
describe("localStorage schema", () => {
  it("round trips topology", () => {
    const f = fixture();
    const loaded = decodeTopology(
      JSON.stringify({ version: 1, nodes: f.nodes, edges: f.edges }),
    );
    expect(missionComplete(loaded.nodes, loaded.edges)).toBe(true);
  });
  it.each(["{}", "null", "{broken", '{"version":2,"nodes":[],"edges":[]}'])(
    "rejects invalid envelope %s",
    (raw) => expect(() => decodeTopology(raw)).toThrow(),
  );
  it("rejects duplicate IDs, invalid positions, missing interface data, dangling edges and port reuse", () => {
    for (const change of [
      (f: ReturnType<typeof fixture>) => {
        f.b.id = f.a.id;
      },
      (f: ReturnType<typeof fixture>) => {
        f.a.position.x = NaN;
      },
      (f: ReturnType<typeof fixture>) => {
        f.edges[0].target = "missing";
      },
      (f: ReturnType<typeof fixture>) => {
        f.edges[1].targetHandle = "p1";
      },
    ]) {
      const f = fixture();
      change(f);
      expect(() =>
        decodeTopology(
          JSON.stringify({ version: 1, nodes: f.nodes, edges: f.edges }),
        ),
      ).toThrow();
    }
  });
});
