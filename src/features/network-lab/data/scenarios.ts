import {
  makeDevice,
  type LabNode,
  type LabEdge,
  type DeviceKind,
} from "./types";
import { ping } from "../engine/network";
import { probe, requestWebsite } from "../engine/routing";
export type Difficulty = "Easy" | "Medium" | "Hard";
export const networkMissions = [
  {
    id: "office",
    difficulty: "Easy" as Difficulty,
    title: "Onboard the finance desk",
    brief:
      "A new employee cannot reach the local file server. Check the patch cable and workstation IPv4 settings.",
    tasks: [
      "Connect Finance PC eth0 to Access switch p1.",
      "Set Finance PC to 10.10.10.10 with mask 255.255.255.0.",
      "Verify the file server at 10.10.10.20 responds.",
    ],
    hint: "A local exchange needs a working cable and same-subnet addresses, not a gateway.",
  },
  {
    id: "branch",
    difficulty: "Medium" as Difficulty,
    title: "Restore access to the server network",
    brief:
      "A replacement core switch has lost its LAN addressing, and the server has an incorrect return gateway. Restore connectivity across the routed distribution layer.",
    tasks: [
      "Set Core eth0 to 10.10.10.1 / 255.255.255.0.",
      "Set File server gateway to 10.20.20.1.",
      "Verify Finance PC can ping the server across the core switch.",
    ],
    hint: "The request and reply each need a route. The core uses two routed ports, not VLAN trunks, in this exercise.",
  },
  {
    id: "corporate",
    difficulty: "Hard" as Difficulty,
    title: "Corporate edge outage",
    brief:
      "Users can work locally, but cannot open the vendor portal after a firewall change. Follow the path from access switch to core, perimeter firewall, and ISP.",
    tasks: [
      "Restore Core default route via 10.255.0.2.",
      "Set Finance PC DNS to 10.10.10.53.",
      "Publish portal.example → 203.0.113.10 on Corporate DNS.",
      "Permit HTTPS on the firewall while keeping ICMP blocked.",
      "Verify the portal opens and a direct ping remains blocked.",
    ],
    hint: "Work in layers: routing, DNS, then service policy. The ISP has an explicit return route to the simulated corporate network; NAT is deliberately not part of this exercise.",
  },
] as const;
export type NetworkMissionId = (typeof networkMissions)[number]["id"];
export function scenario(id: NetworkMissionId): {
  nodes: LabNode[];
  edges: LabEdge[];
} {
  const nodes: LabNode[] = [],
    edges: LabEdge[] = [];
  const add = (
    key: string,
    kind: DeviceKind,
    name: string,
    x: number,
    y: number,
    ip = "",
    gateway = "",
  ) => {
    const n = makeDevice(kind, nodes.length, { x, y });
    n.id = key;
    n.data = { ...n.data, name, ip, gateway };
    nodes.push(n);
    return n;
  };
  const wire = (a: string, ap: string, b: string, bp: string) =>
    edges.push({
      id: `${a}-${ap}-${b}-${bp}`,
      source: a,
      sourceHandle: ap,
      target: b,
      targetHandle: bp,
      type: "smoothstep",
    });
  const routed = (n: LabNode, a: string, b: string) => {
    n.data.interfaces = {
      eth0: { ip: a, mask: "255.255.255.0" },
      eth1: { ip: b, mask: "255.255.255.0" },
    };
  };
  const client = add(
    "client",
    "desktop",
    "Finance PC",
    40,
    40,
    "10.10.10.10",
    id === "office" ? "" : "10.10.10.1",
  );
  add("access", "switch", "Access switch", 270, 150);
  if (id === "office") {
    client.data.ip = "10.10.20.10";
    add("files", "server", "File server", 500, 40, "10.10.10.20");
    wire("files", "eth0", "access", "p2");
    return { nodes, edges };
  }
  wire("client", "eth0", "access", "p1");
  const core = add("core", "core", "Core switch", 500, 150);
  routed(core, "10.10.10.1", id === "branch" ? "10.20.20.1" : "10.255.0.1");
  wire("access", "p4", "core", "eth0");
  if (id === "branch") {
    core.data.interfaces.eth0.ip = "";
    add(
      "files",
      "server",
      "File server",
      730,
      40,
      "10.20.20.20",
      "10.20.20.254",
    );
    wire("core", "eth1", "files", "eth0");
    return { nodes, edges };
  }
  const dns = add(
    "dns",
    "dns",
    "Corporate DNS",
    40,
    280,
    "10.10.10.53",
    "10.10.10.1",
  );
  dns.data.records = [{ name: "portal.example", address: "203.0.113.99" }];
  wire("dns", "eth0", "access", "p2");
  client.data.dns = "10.10.10.99";
  const fw = add("firewall", "firewall", "Perimeter firewall", 730, 150);
  routed(fw, "10.255.0.2", "198.51.100.2");
  fw.data.policy = { icmp: false, dns: true, https: false };
  fw.data.routes = [
    { network: "10.10.10.0", mask: "255.255.255.0", nextHop: "10.255.0.1" },
    { network: "0.0.0.0", mask: "0.0.0.0", nextHop: "198.51.100.1" },
  ];
  wire("core", "eth1", "firewall", "eth0");
  const isp = add("isp", "isp", "ISP edge", 960, 150);
  routed(isp, "198.51.100.1", "203.0.113.1");
  isp.data.routes = [
    { network: "10.10.10.0", mask: "255.255.255.0", nextHop: "198.51.100.2" },
  ];
  wire("firewall", "eth1", "isp", "eth0");
  add(
    "web",
    "server",
    "Vendor portal",
    1190,
    150,
    "203.0.113.10",
    "203.0.113.1",
  );
  wire("isp", "eth1", "web", "eth0");
  return { nodes, edges };
}
export function evaluateNetworkMission(
  id: NetworkMissionId,
  nodes: LabNode[],
  edges: LabEdge[],
) {
  if (id === "corporate") {
    const web = requestWebsite("client", "portal.example", nodes, edges),
      blocked = probe("client", "web", nodes, edges, "icmp");
    return [
      {
        label:
          "Resolve portal.example and complete HTTPS through the corporate edge",
        done:
          web.success &&
          ["core", "firewall", "isp"].every((id) => {
            const n = nodes.find((n) => n.id === id);
            return !!n && n.data.kind === id && web.path.includes(n.data.name);
          }),
      },
      {
        label: "Keep ICMP denied by the perimeter firewall",
        done: blocked.title === "Blocked by firewall",
      },
    ];
  }
  const result = ping("client", "files", nodes, edges);
  return [
    {
      label:
        id === "office"
          ? "File server reachable from the new workstation"
          : "Server reachable across the core with a working return path",
      done:
        result.success &&
        (id === "office"
          ? nodes.some((n) => n.id === "access" && n.data.kind === "switch") &&
            !ping(
              "client",
              "files",
              nodes.filter((n) => n.id !== "access"),
              edges.filter(
                (e) => e.source !== "access" && e.target !== "access",
              ),
            ).success
          : !!nodes.find(
              (n) =>
                n.id === "core" &&
                n.data.kind === "core" &&
                result.path.includes(n.data.name),
            )),
    },
  ];
}
