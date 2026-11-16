import { describe, it, expect } from "vitest";
import { scenario, evaluateNetworkMission } from "../data/scenarios";
import { ping } from "./network";
import { probe, requestWebsite } from "./routing";
import { decodeTopology } from "./storage";
function repaired() {
  const s = scenario("corporate"),
    node = (id: string) => s.nodes.find((n) => n.id === id)!;
  node("client").data.dns = "10.10.10.53";
  node("dns").data.records[0].address = "203.0.113.10";
  node("core").data.routes = [
    { network: "0.0.0.0", mask: "0.0.0.0", nextHop: "10.255.0.2" },
  ];
  node("firewall").data.policy.https = true;
  return { ...s, node };
}
describe("Corporate missions and routing", () => {
  it.each(["office", "branch", "corporate"] as const)(
    "%s starts with an unresolved ticket",
    (id) => {
      const s = scenario(id);
      expect(
        evaluateNetworkMission(id, s.nodes, s.edges).every((c) => c.done),
      ).toBe(false);
    },
  );
  it("completes the local onboarding repair", () => {
    const s = scenario("office");
    s.nodes[0].data.ip = "10.10.10.10";
    s.edges.push({
      id: "patch",
      source: "client",
      sourceHandle: "eth0",
      target: "access",
      targetHandle: "p1",
    });
    expect(
      evaluateNetworkMission("office", s.nodes, s.edges).every((c) => c.done),
    ).toBe(true);
  });
  it("requires the server return gateway in the medium mission", () => {
    const s = scenario("branch");
    s.nodes.find((n) => n.id === "core")!.data.interfaces.eth0.ip =
      "10.10.10.1";
    expect(ping("client", "files", s.nodes, s.edges).success).toBe(false);
    s.nodes.find((n) => n.id === "files")!.data.gateway = "10.20.20.1";
    expect(
      evaluateNetworkMission("branch", s.nodes, s.edges).every((c) => c.done),
    ).toBe(true);
  });
  it("permits HTTPS through three routers while ICMP stays blocked", () => {
    const s = repaired();
    expect(
      requestWebsite("client", "portal.example", s.nodes, s.edges),
    ).toMatchObject({
      success: true,
      path: [
        "Finance PC",
        "Core switch",
        "Perimeter firewall",
        "ISP edge",
        "Vendor portal",
      ],
    });
    expect(probe("client", "web", s.nodes, s.edges).title).toBe(
      "Blocked by firewall",
    );
    expect(
      evaluateNetworkMission("corporate", s.nodes, s.edges).every(
        (c) => c.done,
      ),
    ).toBe(true);
  });
  it("rejects a missing ISP return route", () => {
    const s = repaired();
    s.node("isp").data.routes = [];
    expect(
      requestWebsite("client", "portal.example", s.nodes, s.edges).title,
    ).toContain("Return path: No matching route");
  });
  it("uses a more specific route ahead of the default", () => {
    const s = repaired();
    s.node("core").data.routes.push({
      network: "203.0.113.0",
      mask: "255.255.255.0",
      nextHop: "10.255.0.99",
    });
    expect(
      requestWebsite("client", "portal.example", s.nodes, s.edges).title,
    ).toBe("Next hop unreachable");
  });
  it("detects a routing loop", () => {
    const s = repaired();
    s.node("firewall").data.routes[1].nextHop = "10.255.0.1";
    expect(
      requestWebsite("client", "portal.example", s.nodes, s.edges).title,
    ).toBe("Routing loop");
  });
  it("checks DNS and firewall policy independently", () => {
    const s = repaired();
    s.node("dns").data.records = [];
    expect(
      requestWebsite("client", "portal.example", s.nodes, s.edges).title,
    ).toBe("DNS name not found");
    s.node("dns").data.records = [
      { name: "portal.example", address: "203.0.113.10" },
    ];
    s.node("firewall").data.policy.https = false;
    expect(
      requestWebsite("client", "portal.example", s.nodes, s.edges).title,
    ).toBe("Blocked by firewall");
  });
  it("persists routes, DNS, and policies and rejects invalid nested data", () => {
    const s = repaired();
    const encode = () =>
      JSON.stringify({ version: 1, nodes: s.nodes, edges: s.edges });
    const saved = decodeTopology(encode());
    expect(
      evaluateNetworkMission("corporate", saved.nodes, saved.edges).every(
        (c) => c.done,
      ),
    ).toBe(true);
    const bad = JSON.parse(encode());
    bad.nodes[0].data.policy.https = "yes";
    expect(() => decodeTopology(JSON.stringify(bad))).toThrow();
  });
  it("invalidates mission completion after a required cable is removed", () => {
    const s = repaired();
    s.edges = s.edges.filter((e) => e.source !== "isp");
    expect(
      evaluateNetworkMission("corporate", s.nodes, s.edges).every(
        (c) => c.done,
      ),
    ).toBe(false);
  });
});
