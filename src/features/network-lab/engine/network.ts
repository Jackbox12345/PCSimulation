import {
  isHost,
  isRouted,
  ports,
  type LabNode,
  type LabEdge,
} from "../data/types";
import { probe, validRouteMask } from "./routing";
export function parseIP(value: string): number | null {
  const pieces = value.trim().split(".");
  if (
    pieces.length !== 4 ||
    pieces.some((p) => !/^(0|[1-9]\d{0,2})$/.test(p) || Number(p) > 255)
  )
    return null;
  return pieces.reduce((v, p) => (v * 256 + Number(p)) >>> 0, 0);
}
export function validMask(value: string): boolean {
  const mask = parseIP(value);
  if (mask === null) return false;
  const inverse = ~mask >>> 0;
  return mask !== 0 && inverse >= 3 && (inverse & (inverse + 1)) === 0;
}
export function sameSubnet(a: string, b: string, mask: string): boolean {
  const x = parseIP(a),
    y = parseIP(b),
    m = parseIP(mask);
  return (
    x !== null && y !== null && m !== null && (x & m) >>> 0 === (y & m) >>> 0
  );
}
function formatIP(value: number): string {
  return [24, 16, 8, 0].map((shift) => (value >>> shift) & 255).join(".");
}
function hostAddressIssue(ip: string, mask: string): string | null {
  const n = parseIP(ip);
  if (n === null)
    return `IPv4 address ${JSON.stringify(ip)} must contain four numbers from 0 to 255, for example 192.168.1.10.`;
  const first = n >>> 24;
  if (first === 0 || first === 127 || first >= 224)
    return `${formatIP(n)} is not a supported unicast host address. Use a private LAN address such as 192.168.1.10.`;
  // An invalid mask is diagnosed separately; it cannot classify a host address.
  if (!validMask(mask)) return null;
  const m = parseIP(mask)!;
  const network = (n & m) >>> 0;
  const broadcast = (network | ~m) >>> 0;
  if (n === network || n === broadcast)
    return `${formatIP(n)} is the ${n === network ? "network" : "broadcast"} address for mask ${mask.trim()}. Choose a host address from ${formatIP(network + 1)} to ${formatIP(broadcast - 1)}.`;
  return null;
}
export type NetworkIssue = {
  code: string;
  nodeId: string;
  message: string;
  severity: "error" | "warning";
};
export function addresses(nodes: LabNode[]) {
  return nodes.flatMap((n) =>
    n.data.kind === "switch"
      ? []
      : isRouted(n.data.kind)
        ? Object.entries(n.data.interfaces).map(([port, c]) => ({
            node: n,
            port,
            ...c,
          }))
        : [{ node: n, port: "eth0", ip: n.data.ip, mask: n.data.mask }],
  );
}
export function validateNetwork(
  nodes: LabNode[],
  edges: LabEdge[],
): NetworkIssue[] {
  const issues: NetworkIssue[] = [];
  const add = (
    n: LabNode,
    code: string,
    message: string,
    severity: "error" | "warning" = "error",
  ) =>
    issues.push({
      nodeId: n.id,
      code,
      message: `${n.data.name}: ${message}`,
      severity,
    });
  for (const n of nodes) {
    if (!edges.some((e) => e.source === n.id || e.target === n.id))
      add(n, "disconnected", "no cable is connected.", "warning");
    if (isRouted(n.data.kind)) {
      const { eth0, eth1 } = n.data.interfaces;
      if (
        eth0.ip &&
        eth1.ip &&
        (sameSubnet(eth0.ip, eth1.ip, eth0.mask) ||
          sameSubnet(eth0.ip, eth1.ip, eth1.mask))
      )
        add(
          n,
          "overlap",
          "router interfaces must use non-overlapping subnets.",
        );
      for (const route of n.data.routes) {
        if (
          parseIP(route.network) === null ||
          !validRouteMask(route.mask) ||
          parseIP(route.nextHop) === null
        )
          add(
            n,
            "route",
            "static routes need a valid destination, contiguous mask (or 0.0.0.0 for default), and next-hop IPv4 address.",
          );
      }
    }
    if (isHost(n)) {
      if (n.data.gateway && parseIP(n.data.gateway) === null)
        add(n, "gateway", "default gateway is not a valid IPv4 address.");
      else if (
        n.data.gateway &&
        !sameSubnet(n.data.ip, n.data.gateway, n.data.mask)
      )
        add(
          n,
          "gateway",
          "default gateway must be in the host’s local subnet.",
        );
      if (n.data.dns && parseIP(n.data.dns) === null)
        add(n, "dns", "DNS server is not a valid IPv4 address.");
    }
  }
  const all = addresses(nodes);
  for (const a of all) {
    const active =
      !isRouted(a.node.data.kind) ||
      a.ip ||
      edges.some(
        (e) =>
          (e.source === a.node.id && e.sourceHandle === a.port) ||
          (e.target === a.node.id && e.targetHandle === a.port),
      );
    if (!active) continue;
    if (!validMask(a.mask))
      add(
        a.node,
        "mask",
        `${a.port} subnet mask ${JSON.stringify(a.mask)} is invalid or unsupported. Use a contiguous dotted-decimal mask from /1 through /30; for this mission, set both PCs to 255.255.255.0.`,
      );
    const addressIssue = hostAddressIssue(a.ip, a.mask);
    if (addressIssue) add(a.node, "ip", `${a.port}: ${addressIssue}`);
    if (
      parseIP(a.ip) !== null &&
      all.some((b) => b !== a && parseIP(b.ip) === parseIP(a.ip))
    )
      add(
        a.node,
        "duplicate",
        `${a.ip} is assigned to another interface. Addresses must be unique in this lab.`,
      );
  }
  const hosts = nodes.filter(isHost);
  for (let i = 0; i < hosts.length; i++)
    for (let j = i + 1; j < hosts.length; j++) {
      const a = hosts[i],
        b = hosts[j];
      if (
        l2Reachable(a.id, b.id, nodes, edges) &&
        a.data.ip &&
        b.data.ip &&
        (parseIP(a.data.mask) !== parseIP(b.data.mask) ||
          !sameSubnet(a.data.ip, b.data.ip, a.data.mask))
      )
        add(
          a,
          "subnet",
          `shares a LAN with ${b.data.name}, but their subnet configurations differ. A switch cannot route between subnets.`,
          "warning",
        );
    }
  return issues;
}
// Only switches forward at layer 2. Routers and endpoints stop this traversal.
export function l2Reachable(
  source: string,
  target: string,
  nodes: LabNode[],
  edges: LabEdge[],
  targetPort?: string,
  sourcePort?: string,
): boolean {
  const seen = new Set([source]);
  const queue = [source];
  while (queue.length) {
    const id = queue.shift()!;
    for (const e of edges) {
      if (e.source !== id && e.target !== id) continue;
      if (
        id === source &&
        sourcePort &&
        (e.source === id ? e.sourceHandle : e.targetHandle) !== sourcePort
      )
        continue;
      const neighbor = e.source === id ? e.target : e.source;
      const port = e.source === id ? e.targetHandle : e.sourceHandle;
      if (neighbor === target && (!targetPort || port === targetPort))
        return true;
      if (
        !seen.has(neighbor) &&
        nodes.find((n) => n.id === neighbor)?.data.kind === "switch"
      ) {
        seen.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return false;
}
export type PingResult = {
  success: boolean;
  title: string;
  detail: string;
  path: string[];
};
export function ping(
  sourceId: string,
  targetId: string,
  nodes: LabNode[],
  edges: LabEdge[],
): PingResult {
  const fail = (title: string, detail: string): PingResult => ({
    success: false,
    title,
    detail,
    path: [],
  });
  const a = nodes.find((n) => n.id === sourceId),
    b = nodes.find((n) => n.id === targetId);
  if (!a || !b || !isHost(a) || !isHost(b) || a.id === b.id)
    return fail(
      "Select two different hosts",
      "Choose a desktop, laptop, or server as both source and destination.",
    );
  const relevant = validateNetwork(nodes, edges).filter(
    (i) =>
      [a.id, b.id].includes(i.nodeId) &&
      i.severity === "error" &&
      ["ip", "mask", "duplicate"].includes(i.code),
  );
  if (relevant.length)
    return fail(
      "Invalid IP configuration",
      relevant.map((i) => i.message).join(" "),
    );
  if (
    [a, b].some(
      (n) => !edges.some((e) => e.source === n.id || e.target === n.id),
    )
  )
    return fail(
      "Disconnected device",
      "Connect both hosts to the topology before sending a simulated ping.",
    );
  const localA = sameSubnet(a.data.ip, b.data.ip, a.data.mask),
    localB = sameSubnet(a.data.ip, b.data.ip, b.data.mask);
  if (localA && localB) {
    if (parseIP(a.data.mask) !== parseIP(b.data.mask))
      return fail(
        "Wrong subnet mask",
        "Use matching subnet masks for this lab’s local LAN simulation.",
      );
    return l2Reachable(a.id, b.id, nodes, edges)
      ? {
          success: true,
          title: "Ping successful",
          detail: `Reply from ${b.data.ip}. Both hosts are on the same connected subnet. Gateway and DNS are not required.`,
          path: [a.data.name, "Local Ethernet", b.data.name],
        }
      : fail(
          "Destination unreachable",
          "The addresses share a subnet, but no Ethernet path connects the hosts.",
        );
  }
  if (localA !== localB)
    return fail(
      "Wrong subnet",
      "The hosts disagree about whether the destination is local. Correct their subnet masks.",
    );
  if (!a.data.gateway || !b.data.gateway)
    return fail(
      "Missing gateway",
      "Different subnets need a router. Configure each host’s default gateway with its local router interface address, including the return path.",
    );
  return probe(sourceId, targetId, nodes, edges);
}
export function missionComplete(nodes: LabNode[], edges: LabEdge[]) {
  const pcs = nodes.filter((n) => n.data.kind === "desktop");
  return pcs.some((a, i) =>
    pcs
      .slice(i + 1)
      .some(
        (b) =>
          nodes.some(
            (s) =>
              s.data.kind === "switch" &&
              l2Reachable(a.id, s.id, nodes, edges) &&
              l2Reachable(b.id, s.id, nodes, edges),
          ) &&
          sameSubnet(a.data.ip, b.data.ip, a.data.mask) &&
          ping(a.id, b.id, nodes, edges).success,
      ),
  );
}
export function canConnect(
  source: string,
  target: string,
  sourceHandle: string | null | undefined,
  targetHandle: string | null | undefined,
  nodes: LabNode[],
  edges: LabEdge[],
) {
  const a = nodes.find((n) => n.id === source),
    b = nodes.find((n) => n.id === target);
  return (
    !!a &&
    !!b &&
    source !== target &&
    ports(a.data.kind).includes(sourceHandle || "") &&
    ports(b.data.kind).includes(targetHandle || "") &&
    !edges.some(
      (e) =>
        (e.source === source && e.sourceHandle === sourceHandle) ||
        (e.target === source && e.targetHandle === sourceHandle) ||
        (e.source === target && e.sourceHandle === targetHandle) ||
        (e.target === target && e.targetHandle === targetHandle),
    )
  );
}
