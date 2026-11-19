import { describe, it, expect } from "vitest";
import { executeCLI, initialCLI } from "./cli";
import { scenario } from "../data/scenarios";
import { ping } from "./network";
import { decodeTopology } from "./storage";
function lab() {
  const s = scenario("branch");
  let session = initialCLI();
  const run = (line: string, id = "core") => {
    const n = s.nodes.find((n) => n.id === id)!;
    const r = executeCLI(line, n, s.nodes, s.edges, session);
    session = r.session;
    if (r.patch) n.data = { ...n.data, ...r.patch };
    return r;
  };
  return { ...s, run };
}
describe("Device CLI", () => {
  it("repairs a routed mission using real mode transitions and host commands", () => {
    const s = lab();
    for (const cmd of [
      "enable",
      "conf t",
      "int g0/0",
      "ip address 10.10.10.1 255.255.255.0",
      "no shutdown",
      "end",
    ])
      s.run(cmd);
    s.run("ipconfig set 10.20.20.20 255.255.255.0 10.20.20.1", "files");
    expect(s.run("ping 10.20.20.20", "client").output).toContain("SUCCESS");
    expect(s.run("show running-config").output).toContain(
      "ip address 10.10.10.1",
    );
  });
  it("shutdown blocks actual traffic and no shutdown restores it", () => {
    const s = lab();
    for (const cmd of [
      "en",
      "conf t",
      "int eth0",
      "ip address 10.10.10.1 255.255.255.0",
      "shutdown",
    ])
      s.run(cmd);
    s.run("ipconfig set 10.20.20.20 255.255.255.0 10.20.20.1", "files");
    expect(ping("client", "files", s.nodes, s.edges).success).toBe(false);
    expect(s.run("do show ip interface brief").output).toContain(
      "administratively down",
    );
    s.run("no shutdown");
    expect(ping("client", "files", s.nodes, s.edges).success).toBe(true);
  });
  it("rejects incorrect mode, invalid interfaces, subnet addresses and unsupported commands without mutations", () => {
    const s = lab();
    expect(s.run("configure terminal").patch).toBeUndefined();
    s.run("enable");
    s.run("conf t");
    expect(s.run("interface vlan 10").session.mode).toBe("config");
    s.run("int eth0");
    expect(s.run("ip address 10.10.10.0 255.255.255.0").patch).toBeUndefined();
    expect(s.run("router ospf 1").patch).toBeUndefined();
    expect(s.run("show ip route").output).toContain("do show");
  });
  it("adds and removes actual static routes, validates network alignment", () => {
    const s = lab();
    s.run("enable");
    s.run("conf t");
    s.run("ip route 0.0.0.0 0.0.0.0 10.20.20.2");
    expect(s.nodes.find((n) => n.id === "core")!.data.routes).toHaveLength(1);
    expect(
      s.run("ip route 10.30.0.2 255.255.255.0 10.20.20.2").patch,
    ).toBeUndefined();
    s.run("no ip route 0.0.0.0 0.0.0.0 10.20.20.2");
    expect(s.nodes.find((n) => n.id === "core")!.data.routes).toHaveLength(0);
  });
  it("switch port shutdown disables forwarding and survives save/load validation", () => {
    const s = lab();
    s.run("enable", "access");
    s.run("conf t", "access");
    s.run("interface fa0/1", "access");
    s.run("shutdown", "access");
    expect(s.nodes.find((n) => n.id === "access")!.data.disabledPorts).toEqual([
      "p1",
    ]);
    expect(
      s.run("ip address 10.10.10.2 255.255.255.0", "access").patch,
    ).toBeUndefined();
    const saved = decodeTopology(
      JSON.stringify({ version: 1, nodes: s.nodes, edges: s.edges }),
    );
    expect(
      saved.nodes.find((n) => n.id === "access")!.data.disabledPorts,
    ).toEqual(["p1"]);
    s.nodes[0].data.disabledPorts = ["bad"];
    expect(() =>
      decodeTopology(
        JSON.stringify({ version: 1, nodes: s.nodes, edges: s.edges }),
      ),
    ).toThrow();
  });
  it("nslookup evaluates DNS connectivity and records independently of HTTPS", () => {
    const s = scenario("corporate"),
      n = s.nodes.find((n) => n.id === "client")!;
    n.data.dns = "10.10.10.53";
    const run = (line: string) =>
      executeCLI(line, n, s.nodes, s.edges, initialCLI());
    expect(run("nslookup portal.example").output).toContain("203.0.113.99");
    expect(run("https portal.example").output).toContain(
      "Web server unavailable",
    );
    s.nodes.find((n) => n.id === "access")!.data.disabledPorts = ["p2"];
    expect(run("nslookup portal.example").output).toContain("DNS query failed");
  });
});
