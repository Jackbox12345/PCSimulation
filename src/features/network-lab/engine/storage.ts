import {
  deviceKinds,
  ports,
  type LabNode,
  type LabEdge,
  type DeviceData,
} from "../data/types";
import { canConnect } from "./network";
export function decodeTopology(raw: string): {
  nodes: LabNode[];
  edges: LabEdge[];
} {
  const value = JSON.parse(raw);
  if (
    value?.version !== 1 ||
    !Array.isArray(value.nodes) ||
    !Array.isArray(value.edges) ||
    value.nodes.length > 100 ||
    value.edges.length > 200
  )
    throw new Error("Unsupported or oversized topology file.");
  const ids = new Set<string>();
  const nodes: LabNode[] = value.nodes.map((n: LabNode) => {
    const d = n?.data;
    if (
      typeof n?.id !== "string" ||
      ids.has(n.id) ||
      !n.position ||
      !Number.isFinite(n.position.x) ||
      !Number.isFinite(n.position.y) ||
      !d ||
      !deviceKinds.includes(d.kind) ||
      !["name", "ip", "mask", "gateway", "dns"].every(
        (k) =>
          typeof d[k as keyof DeviceData] === "string" &&
          String(d[k as keyof DeviceData]).length <= 120,
      ) ||
      !["eth0", "eth1"].every((p) => {
        const c = d.interfaces?.[p as "eth0" | "eth1"];
        return (
          c &&
          typeof c.ip === "string" &&
          c.ip.length <= 40 &&
          typeof c.mask === "string" &&
          c.mask.length <= 40
        );
      })
    )
      throw new Error("Saved device data is invalid.");
    ids.add(n.id);
    const routes = d.routes ?? [],
      records = d.records ?? [],
      policy = d.policy ?? { icmp: true, dns: true, https: true };
    if (
      !Array.isArray(routes) ||
      routes.length > 32 ||
      !routes.every(
        (r) =>
          r &&
          (["network", "mask", "nextHop"] as const).every(
            (k) => typeof r[k] === "string" && r[k].length <= 40,
          ),
      ) ||
      !Array.isArray(records) ||
      records.length > 64 ||
      !records.every(
        (r) =>
          r &&
          typeof r.name === "string" &&
          r.name.length <= 120 &&
          typeof r.address === "string" &&
          r.address.length <= 40,
      ) ||
      !["icmp", "dns", "https"].every(
        (k) => typeof (policy as Record<string, unknown>)[k] === "boolean",
      )
    )
      throw new Error("Invalid routing, firewall, or DNS configuration.");
    return {
      id: n.id,
      type: "device",
      position: { x: n.position.x, y: n.position.y },
      data: {
        kind: d.kind,
        name: d.name,
        ip: d.ip,
        mask: d.mask,
        gateway: d.gateway,
        dns: d.dns,
        routes: routes.map((r) => ({
          network: r.network,
          mask: r.mask,
          nextHop: r.nextHop,
        })),
        records: records.map((r) => ({ name: r.name, address: r.address })),
        policy: { icmp: policy.icmp, dns: policy.dns, https: policy.https },
        interfaces: {
          eth0: { ...d.interfaces.eth0 },
          eth1: { ...d.interfaces.eth1 },
        },
      },
    };
  });
  const edges: LabEdge[] = [];
  const edgeIds = new Set<string>();
  for (const e of value.edges) {
    if (
      typeof e?.id !== "string" ||
      edgeIds.has(e.id) ||
      !ids.has(e.source) ||
      !ids.has(e.target) ||
      !canConnect(
        e.source,
        e.target,
        e.sourceHandle,
        e.targetHandle,
        nodes,
        edges,
      )
    )
      throw new Error("Saved cable data is invalid.");
    edgeIds.add(e.id);
    edges.push({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      type: "smoothstep",
    });
  }
  // A valid schema may contain unfinished IP settings; those belong to lab diagnostics.
  if (nodes.some((n) => ports(n.data.kind).length === 0))
    throw new Error("Unknown device type.");
  return { nodes, edges };
}
