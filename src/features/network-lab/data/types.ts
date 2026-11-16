import type { Node, Edge } from "@xyflow/react";
export const deviceKinds = [
  "desktop",
  "laptop",
  "server",
  "switch",
  "router",
  "core",
  "firewall",
  "isp",
  "dns",
] as const;
export type DeviceKind = (typeof deviceKinds)[number];
export interface InterfaceConfig {
  ip: string;
  mask: string;
}
export type Protocol = "icmp" | "dns" | "https";
export type StaticRoute = { network: string; mask: string; nextHop: string };
export type DNSRecord = { name: string; address: string };
export type DeviceData = {
  kind: DeviceKind;
  name: string;
  ip: string;
  mask: string;
  gateway: string;
  dns: string;
  interfaces: Record<"eth0" | "eth1", InterfaceConfig>;
  routes: StaticRoute[];
  policy: Record<Protocol, boolean>;
  records: DNSRecord[];
};
export type LabNode = Node<DeviceData, "device">;
export type LabEdge = Edge;
export const deviceLabels: Record<DeviceKind, string> = {
  desktop: "Desktop PC",
  laptop: "Laptop",
  server: "Server",
  switch: "Switch",
  router: "Router",
  core: "Core L3 switch",
  firewall: "Firewall",
  isp: "ISP router",
  dns: "DNS server",
};
export const isRouted = (kind: DeviceKind) =>
  ["router", "core", "firewall", "isp"].includes(kind);
export const ports = (kind: DeviceKind) =>
  kind === "switch"
    ? ["p1", "p2", "p3", "p4"]
    : isRouted(kind)
      ? ["eth0", "eth1"]
      : ["eth0"];
export const isHost = (n: LabNode) =>
  n.data.kind !== "switch" && !isRouted(n.data.kind);
export function makeDevice(
  kind: DeviceKind,
  index: number,
  position = {
    x: 140 + (index % 3) * 210,
    y: 100 + Math.floor(index / 3) * 140,
  },
): LabNode {
  return {
    id: crypto.randomUUID(),
    type: "device",
    position,
    data: {
      kind,
      name: `${deviceLabels[kind]} ${index + 1}`,
      ip: "",
      mask: "255.255.255.0",
      gateway: "",
      dns: "",
      routes: [],
      policy: { icmp: true, dns: true, https: true },
      records: [],
      interfaces: {
        eth0: { ip: "", mask: "255.255.255.0" },
        eth1: { ip: "", mask: "255.255.255.0" },
      },
    },
  };
}
