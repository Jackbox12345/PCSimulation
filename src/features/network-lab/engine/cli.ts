import {
  isHost,
  isRouted,
  ports,
  type DeviceData,
  type LabNode,
  type LabEdge,
} from "../data/types";
import { parseIP, validMask, sameSubnet, ping } from "./network";
import { probe, requestWebsite, validRouteMask } from "./routing";

export type CLISession = {
  mode: "user" | "privileged" | "config" | "interface";
  port?: string;
};
export type CLIResult = {
  session: CLISession;
  output: string;
  patch?: Partial<DeviceData>;
};
export const initialCLI = (): CLISession => ({ mode: "user" });
export function cliPrompt(node: LabNode, s: CLISession) {
  const name = node.data.name.replace(/\s+/g, "-");
  return isHost(node)
    ? `${name}>`
    : `${name}${s.mode === "interface" ? "(config-if)" : s.mode === "config" ? "(config)" : ""}${s.mode === "user" ? ">" : "#"}`;
}
export function cliHelp(node: LabNode, s: CLISession) {
  if (isHost(node))
    return "Host terminal\nipconfig | ipconfig /all\nping <host IPv4>\ntracert <host IPv4> (calculated path, not timed probes)\nLab-only configuration helpers:\n  ipconfig set <IPv4> <mask> [gateway]\n  dns-server <IPv4>\n  nslookup <name>\n  https <name>\nhelp | clear\nUse Save topology for browser persistence.";
  if (s.mode === "interface")
    return "ip address <IPv4> <mask> (routed ports only)\nno ip address\nshutdown | no shutdown\nexit | end | do show ip interface brief";
  if (s.mode === "config")
    return "hostname <name>\ninterface <port>\nip route <network> <mask> <next-hop>\nno ip route <network> <mask> <next-hop>\nexit | end | do show running-config";
  return "enable | disable\nconfigure terminal (privileged mode)\nshow ip interface brief\nshow interfaces\nshow running-config\nshow ip route (routed devices)\nhelp | clear\nAliases: en, conf t, int, sh run, sh ip int br\nUse endpoint terminals for ping, tracert, DNS, and HTTPS.\nThis is a supported IOS-style subset, not IOS emulation. VLANs, OSPF, ACL syntax, and startup-config are not implemented. Use Save topology for persistence.";
}
function canonicalPort(input: string, node: LabNode) {
  const p = input.toLowerCase();
  if (ports(node.data.kind).includes(p)) return p;
  const m = p.match(/^(?:g|gi|gigabitethernet)0\/(\d)$/);
  if (m && isRouted(node.data.kind) && Number(m[1]) < 2) return `eth${m[1]}`;
  const f = p.match(/^(?:f|fa|fastethernet)0\/([1-4])$/);
  return f && node.data.kind === "switch" ? `p${f[1]}` : null;
}
const dotted = (n: number) =>
  [24, 16, 8, 0].map((b) => (n >>> b) & 255).join(".");
const validHost = (ip: string, mask: string) => {
  const n = parseIP(ip),
    m = parseIP(mask);
  return (
    n !== null &&
    m !== null &&
    validMask(mask) &&
    n >>> 24 > 0 &&
    n >>> 24 !== 127 &&
    n >>> 24 < 224 &&
    n !== (n & m) >>> 0 &&
    n !== (n | ~m) >>> 0
  );
};
function brief(node: LabNode, nodes: LabNode[], edges: LabEdge[]) {
  return [
    "Interface  IP address       Status",
    ...ports(node.data.kind).map((port) => {
      const edge = edges.find(
        (e) =>
          (e.source === node.id && e.sourceHandle === port) ||
          (e.target === node.id && e.targetHandle === port),
      );
      const peer = edge
        ? nodes.find(
            (n) =>
              n.id === (edge.source === node.id ? edge.target : edge.source),
          )
        : undefined;
      const peerPort = edge
        ? edge.source === node.id
          ? edge.targetHandle
          : edge.sourceHandle
        : "";
      const status = node.data.disabledPorts?.includes(port)
        ? "administratively down"
        : edge && !peer?.data.disabledPorts?.includes(peerPort ?? "")
          ? "up / up"
          : "down / down";
      const ip = isRouted(node.data.kind)
        ? node.data.interfaces[port as "eth0" | "eth1"].ip
        : isHost(node)
          ? node.data.ip
          : "";
      return `${port.padEnd(10)} ${(ip || "unassigned").padEnd(16)} ${status}`;
    }),
  ].join("\n");
}
function running(node: LabNode) {
  const d = node.data;
  return [
    `hostname ${d.name}`,
    ...ports(d.kind).flatMap((port) => [
      `interface ${port}`,
      ...(isRouted(d.kind) && d.interfaces[port as "eth0" | "eth1"].ip
        ? [
            ` ip address ${d.interfaces[port as "eth0" | "eth1"].ip} ${d.interfaces[port as "eth0" | "eth1"].mask}`,
          ]
        : []),
      d.disabledPorts?.includes(port) ? " shutdown" : " no shutdown",
      "!",
    ]),
    ...d.routes.map((r) => `ip route ${r.network} ${r.mask} ${r.nextHop}`),
    ...(d.kind === "firewall"
      ? [`! Lab service policy: ${JSON.stringify(d.policy)}`]
      : []),
    "end",
  ].join("\n");
}
export function executeCLI(
  raw: string,
  node: LabNode,
  nodes: LabNode[],
  edges: LabEdge[],
  session: CLISession,
): CLIResult {
  const result = (
    output: string,
    patch?: Partial<DeviceData>,
    next = session,
  ): CLIResult => ({ output, patch, session: next });
  const line = raw.trim().replace(/\s+/g, " "),
    lower = line.toLowerCase(),
    words = line.split(" ");
  if (!line) return result("");
  if (line.length > 400) return result("% Command too long.");
  if (lower === "?" || lower === "help") return result(cliHelp(node, session));
  if (lower === "clear" || lower === "cls") return result("");
  if (isHost(node)) {
    if (lower === "ipconfig" || lower === "ipconfig /all")
      return result(
        `Ethernet eth0\nIPv4: ${node.data.ip || "unassigned"}\nMask: ${node.data.mask}\nGateway: ${node.data.gateway || "none"}\nDNS: ${node.data.dns || "none"}\n${brief(node, nodes, edges)}`,
      );
    if (lower.startsWith("ipconfig set ")) {
      const [, , ip, mask, gateway = ""] = words;
      if (
        ![4, 5].includes(words.length) ||
        !validHost(ip, mask) ||
        (gateway &&
          (!validHost(gateway, mask) || !sameSubnet(ip, gateway, mask)))
      )
        return result(
          "% Usage: ipconfig set <usable IPv4> <mask> [local gateway].",
        );
      return result("Host addressing updated.", { ip, mask, gateway });
    }
    if (words[0].toLowerCase() === "dns-server" && words.length === 2) {
      if (parseIP(words[1]) === null)
        return result("% Invalid DNS IPv4 address.");
      return result("DNS server updated.", { dns: words[1] });
    }
    if (
      ["ping", "tracert", "traceroute"].includes(words[0].toLowerCase()) &&
      words.length === 2
    ) {
      const target = nodes.find(
        (n) =>
          isHost(n) &&
          parseIP(n.data.ip) !== null &&
          parseIP(n.data.ip) === parseIP(words[1]),
      );
      if (!target)
        return result(
          "% Destination must be the IPv4 address of an endpoint in this topology. Router interface probes are not supported.",
        );
      const r = ping(node.id, target.id, nodes, edges);
      return result(
        `${r.success ? "SUCCESS" : "FAILED"}: ${r.title}\n${r.detail}\n${r.path.length ? "Calculated path: " + r.path.join(" -> ") : ""}`,
      );
    }
    if (words[0].toLowerCase() === "https" && words.length === 2) {
      const r = requestWebsite(node.id, words[1], nodes, edges);
      return result(`${r.title}\n${r.detail}`);
    }
    if (words[0].toLowerCase() === "nslookup" && words.length === 2) {
      const dns = nodes.find(
        (n) =>
          n.data.kind === "dns" &&
          parseIP(n.data.ip) !== null &&
          parseIP(n.data.ip) === parseIP(node.data.dns),
      );
      if (!dns)
        return result(
          "DNS server unavailable. Configure a DNS server in this topology.",
        );
      if (dns.id !== node.id) {
        const r = probe(node.id, dns.id, nodes, edges, "dns");
        if (!r.success)
          return result(`DNS query failed: ${r.title}\n${r.detail}`);
      }
      const record = dns.data.records.find(
        (r) => r.name.toLowerCase().trim() === words[1].toLowerCase(),
      );
      return result(
        record
          ? `Server: ${dns.data.ip}\nName: ${record.name}\nAddress: ${record.address}`
          : "DNS name not found.",
      );
    }
    return result(
      "% Unsupported host command. Type help. Configuration helpers are lab syntax, not Windows shell commands.",
    );
  }
  if (lower === "enable" || lower === "en")
    return session.mode === "user"
      ? result("", undefined, { mode: "privileged" })
      : result("% Already in privileged/configuration mode.");
  if (lower === "end") return result("", undefined, { mode: "privileged" });
  if (lower === "exit")
    return result("", undefined, {
      mode:
        session.mode === "interface"
          ? "config"
          : session.mode === "config"
            ? "privileged"
            : "user",
    });
  if (lower === "disable" && session.mode === "privileged")
    return result("", undefined, { mode: "user" });
  if (lower === "configure terminal" || lower === "conf t")
    return session.mode === "privileged"
      ? result("Enter configuration commands, one per line.", undefined, {
          mode: "config",
        })
      : result("% Enter enable mode first.");
  let show = lower;
  if (lower.startsWith("do ") && ["config", "interface"].includes(session.mode))
    show = lower.slice(3);
  else if (
    ["config", "interface"].includes(session.mode) &&
    /^(show|sh) /.test(lower)
  )
    return result("% Use do show ... in configuration mode, or end first.");
  if (
    ["show ip interface brief", "sh ip int br", "show interfaces"].includes(
      show,
    )
  )
    return result(brief(node, nodes, edges));
  if (show === "show running-config" || show === "sh run")
    return session.mode === "user"
      ? result("% Enter enable mode first.")
      : result(running(node));
  if (show === "show ip route") {
    if (!isRouted(node.data.kind))
      return result("% This Layer 2 switch has no routing table.");
    return result(
      [
        "C = connected, S = static (configured; next-hop availability is checked during forwarding)",
        ...Object.entries(node.data.interfaces)
          .filter(
            ([p, c]) =>
              parseIP(c.ip) !== null &&
              validMask(c.mask) &&
              !node.data.disabledPorts?.includes(p) &&
              edges.some((e) => {
                if (!(
                  (e.source === node.id && e.sourceHandle === p) ||
                  (e.target === node.id && e.targetHandle === p)
                ))
                  return false;
                const peer = nodes.find(
                  (n) => n.id === (e.source === node.id ? e.target : e.source),
                );
                return (
                  !!peer &&
                  !peer.data.disabledPorts?.includes(
                    (e.source === node.id ? e.targetHandle : e.sourceHandle) ??
                      "",
                  )
                );
              }),
          )
          .map(
            ([p, c]) =>
              `C ${dotted((parseIP(c.ip)! & parseIP(c.mask)!) >>> 0)} ${c.mask} directly connected, ${p}`,
          ),
        ...node.data.routes.map(
          (r) => `S ${r.network} ${r.mask} via ${r.nextHop}`,
        ),
      ].join("\n"),
    );
  }
  if (session.mode === "config") {
    if (
      words[0].toLowerCase() === "hostname" &&
      words.length === 2 &&
      /^[a-zA-Z][\w-]{0,59}$/.test(words[1])
    )
      return result("", { name: words[1] });
    if (
      ["interface", "int"].includes(words[0].toLowerCase()) &&
      words.length === 2
    ) {
      const port = canonicalPort(words[1], node);
      return port
        ? result("", undefined, { mode: "interface", port })
        : result(
            `% Available ports: ${ports(node.data.kind).join(", ")}. Routed aliases: g0/0 = eth0, g0/1 = eth1; switch aliases: fa0/1..4 = p1..4.`,
          );
    }
    const match = line.match(/^(no )?ip route (\S+) (\S+) (\S+)$/i);
    if (match && isRouted(node.data.kind)) {
      const [, remove, network, mask, nextHop] = match;
      if (
        parseIP(network) === null ||
        !validRouteMask(mask) ||
        parseIP(nextHop) === null ||
        (parseIP(network)! & parseIP(mask)!) >>> 0 !== parseIP(network)
      )
        return result(
          "% Invalid route. Supply an aligned network, mask, and IPv4 next hop. Default: 0.0.0.0 0.0.0.0 <next-hop>.",
        );
      const same = (r: DeviceData["routes"][number]) =>
        r.network === network && r.mask === mask && r.nextHop === nextHop;
      if (remove)
        return result("Static route removed.", {
          routes: node.data.routes.filter((r) => !same(r)),
        });
      if (node.data.routes.some(same))
        return result("Route already configured.");
      if (node.data.routes.length >= 32)
        return result("% Maximum 32 static routes.");
      return result("Static route configured.", {
        routes: [...node.data.routes, { network, mask, nextHop }],
      });
    }
  }
  if (session.mode === "interface" && session.port) {
    const port = session.port;
    if (lower === "shutdown" || lower === "no shutdown")
      return result("", {
        disabledPorts:
          lower === "shutdown"
            ? [...new Set([...(node.data.disabledPorts ?? []), port])]
            : (node.data.disabledPorts ?? []).filter((p) => p !== port),
      });
    if (
      (lower.startsWith("ip address ") || lower === "no ip address") &&
      isRouted(node.data.kind)
    ) {
      const [, , ip, mask] = words;
      if (
        lower !== "no ip address" &&
        (words.length !== 4 || !validHost(ip, mask))
      )
        return result(
          "% Supply a usable unicast IPv4 address and contiguous /1 through /30 mask.",
        );
      return result("", {
        interfaces: {
          ...node.data.interfaces,
          [port]: {
            ip: lower === "no ip address" ? "" : ip,
            mask: lower === "no ip address" ? "255.255.255.0" : mask,
          },
        },
      });
    }
  }
  return result(
    "% Unsupported command or incorrect mode. Type ? for commands available here. Nothing changed.",
  );
}
