import {
  isHost,
  isRouted,
  type LabNode,
  type LabEdge,
  type Protocol,
} from "../data/types";
import {
  parseIP,
  validMask,
  sameSubnet,
  l2Reachable,
  validateNetwork,
  type PingResult,
} from "./network";
export const validRouteMask = (mask: string) =>
  mask.trim() === "0.0.0.0" || validMask(mask);
const prefixLength = (mask: string) =>
  (parseIP(mask) ?? 0).toString(2).replaceAll("0", "").length;
const matches = (ip: string, network: string, mask: string) =>
  validRouteMask(mask) && sameSubnet(ip, network, mask);
type Hop = { node: LabNode; port: string; ip: string; mask: string };
const interfaces = (nodes: LabNode[]): Hop[] =>
  nodes
    .filter((n) => isRouted(n.data.kind))
    .flatMap((node) =>
      Object.entries(node.data.interfaces)
        .filter(([port]) => !node.data.disabledPorts?.includes(port))
        .map(([port, c]) => ({
          node,
          port,
          ...c,
        })),
    );

/** Forward one datagram. Switches bridge only; routed interfaces terminate each LAN. */
function forward(
  source: LabNode,
  target: LabNode,
  nodes: LabNode[],
  edges: LabEdge[],
  protocol: Protocol,
): PingResult {
  const path = [source.data.name];
  const fail = (title: string, detail: string): PingResult => ({
    success: false,
    title,
    detail,
    path,
  });
  const hops = interfaces(nodes);
  const gateway = hops.find(
    (h) =>
      parseIP(h.ip) !== null &&
      parseIP(h.ip) === parseIP(source.data.gateway) &&
      sameSubnet(source.data.ip, h.ip, source.data.mask) &&
      sameSubnet(source.data.ip, h.ip, h.mask) &&
      l2Reachable(source.id, h.node.id, nodes, edges, h.port),
  );
  if (!gateway)
    return fail(
      "Gateway unreachable",
      `${source.data.name}: gateway ${source.data.gateway || "(empty)"} must be on its local subnet and connected to the correct router port.`,
    );
  let current = gateway.node;
  const visited = new Set<string>();
  for (let ttl = 16; ttl > 0; ttl--) {
    if (visited.has(current.id))
      return fail(
        "Routing loop",
        `The packet revisited ${current.data.name}. Check static/default routes.`,
      );
    visited.add(current.id);
    path.push(current.data.name);
    const errors = validateNetwork(nodes, edges).filter(
      (i) => i.nodeId === current.id && i.severity === "error",
    );
    if (errors.length)
      return fail(
        "Router configuration error",
        errors.map((i) => i.message).join(" "),
      );
    if (current.data.kind === "firewall" && !current.data.policy[protocol])
      return fail(
        "Blocked by firewall",
        `${current.data.name} denies ${protocol.toUpperCase()}. A successful ping does not imply DNS or HTTPS is allowed.`,
      );
    const own = hops.filter(
      (h) => h.node.id === current.id && parseIP(h.ip) !== null,
    );
    const routes = [
      ...own.map((h) => ({
        network: h.ip,
        mask: h.mask,
        nextHop: "",
        port: h.port,
      })),
      ...current.data.routes.map((r) => ({ ...r, port: "" })),
    ]
      .filter((r) => matches(target.data.ip, r.network, r.mask))
      .sort(
        (a, b) =>
          prefixLength(b.mask) - prefixLength(a.mask) ||
          Number(!a.port) - Number(!b.port),
      );
    const route = routes[0];
    if (!route)
      return fail(
        "No matching route",
        `${current.data.name} has no connected or static route to ${target.data.ip}. Add a specific route or 0.0.0.0 / 0.0.0.0 default route.`,
      );
    if (route.port) {
      const out = own.find((h) => h.port === route.port)!;
      if (
        sameSubnet(out.ip, target.data.ip, target.data.mask) &&
        l2Reachable(current.id, target.id, nodes, edges, undefined, out.port)
      )
        return {
          success: true,
          title: "Path found",
          detail: "",
          path: [...path, target.data.name],
        };
      return fail(
        "Destination unreachable",
        `${current.data.name}: destination is in a connected subnet but cannot be reached through ${out.port}. Check cabling and the destination mask.`,
      );
    }
    const outgoing = own.filter((h) => sameSubnet(h.ip, route.nextHop, h.mask));
    const next = hops.find(
      (h) =>
        h.node.id !== current.id &&
        parseIP(h.ip) !== null &&
        parseIP(h.ip) === parseIP(route.nextHop) &&
        outgoing.some(
          (out) =>
            sameSubnet(out.ip, h.ip, h.mask) &&
            l2Reachable(current.id, h.node.id, nodes, edges, h.port, out.port),
        ),
    );
    if (!next)
      return fail(
        "Next hop unreachable",
        `${current.data.name}: next hop ${route.nextHop} is not reachable on a connected interface.`,
      );
    current = next.node;
  }
  return fail(
    "TTL expired",
    "The teaching simulator limits forwarding to 16 routed hops.",
  );
}
export function probe(
  sourceId: string,
  targetId: string,
  nodes: LabNode[],
  edges: LabEdge[],
  protocol: Protocol = "icmp",
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
    return fail("Select two different hosts", "Choose two endpoint devices.");
  const bad = validateNetwork(nodes, edges).filter(
    (i) =>
      [a.id, b.id].includes(i.nodeId) &&
      i.severity === "error" &&
      ["ip", "mask", "duplicate"].includes(i.code),
  );
  if (bad.length)
    return fail(
      "Invalid IP configuration",
      bad.map((i) => i.message).join(" "),
    );
  const localA = sameSubnet(a.data.ip, b.data.ip, a.data.mask),
    localB = sameSubnet(a.data.ip, b.data.ip, b.data.mask);
  if (localA && localB) {
    if (parseIP(a.data.mask) !== parseIP(b.data.mask))
      return fail(
        "Wrong subnet mask",
        "Use matching masks in this local-LAN model.",
      );
    return l2Reachable(a.id, b.id, nodes, edges)
      ? {
          success: true,
          title: protocol === "icmp" ? "Ping successful" : "Service reachable",
          detail: `${protocol.toUpperCase()} path to ${b.data.ip} is reachable on the local Ethernet segment.`,
          path: [a.data.name, "Local Ethernet", b.data.name],
        }
      : fail(
          "Destination unreachable",
          "No Ethernet path connects these hosts.",
        );
  }
  if (localA !== localB)
    return fail(
      "Wrong subnet",
      "The hosts disagree about whether the destination is local.",
    );
  if (!a.data.gateway.trim() || !b.data.gateway.trim())
    return fail(
      "Missing gateway",
      "Both hosts need a gateway for a routed exchange, including the return path.",
    );
  const outbound = forward(a, b, nodes, edges, protocol);
  if (!outbound.success) return outbound;
  const inbound = forward(b, a, nodes, edges, protocol);
  if (!inbound.success)
    return {
      ...inbound,
      title: `Return path: ${inbound.title}`,
      detail: `Request reached ${b.data.name}, but the reply failed. ${inbound.detail}`,
    };
  return {
    success: true,
    title: protocol === "icmp" ? "Ping successful" : "Service reachable",
    detail: `${protocol.toUpperCase()} reached ${b.data.ip}. Forward and return routes passed; ${outbound.path.length - 2} routed hops.`,
    path: outbound.path,
  };
}
export function requestWebsite(
  sourceId: string,
  hostname: string,
  nodes: LabNode[],
  edges: LabEdge[],
): PingResult {
  const source = nodes.find((n) => n.id === sourceId);
  const fail = (title: string, detail: string): PingResult => ({
    success: false,
    title,
    detail,
    path: [],
  });
  if (!source || !isHost(source))
    return fail("Choose a client", "Select a host before resolving a name.");
  const dns = nodes.find(
    (n) =>
      n.data.kind === "dns" &&
      parseIP(n.data.ip) !== null &&
      parseIP(n.data.ip) === parseIP(source.data.dns),
  );
  if (!dns)
    return fail(
      "DNS server unavailable",
      `${source.data.name} must point to the IP address of a configured DNS server in this topology.`,
    );
  const dnsPath =
    source.id === dns.id ? null : probe(source.id, dns.id, nodes, edges, "dns");
  if (dnsPath && !dnsPath.success)
    return { ...dnsPath, title: `DNS query failed: ${dnsPath.title}` };
  const record = dns.data.records.find(
    (r) => r.name.trim().toLowerCase() === hostname.trim().toLowerCase(),
  );
  if (!record)
    return fail(
      "DNS name not found",
      `${dns.data.name} has no A record for ${hostname}. Add an exact name-to-IPv4 record.`,
    );
  const server = nodes.find(
    (n) =>
      n.data.kind === "server" &&
      parseIP(n.data.ip) !== null &&
      parseIP(n.data.ip) === parseIP(record.address),
  );
  if (!server)
    return fail(
      "Web server unavailable",
      `${hostname} resolves to ${record.address}, but no web server endpoint has that address.`,
    );
  const result = probe(source.id, server.id, nodes, edges, "https");
  return {
    ...result,
    title: result.success ? "HTTPS request successful" : result.title,
    detail: `DNS: ${hostname} → ${record.address}. ${result.detail}`,
  };
}
