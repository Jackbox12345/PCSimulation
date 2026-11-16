import { ui } from "../../../styles/ui";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Monitor,
  Laptop,
  Server,
  Router,
  Network,
  Shield,
  Globe,
} from "lucide-react";
import { ports, isRouted, type LabNode, type DeviceKind } from "../data/types";
const deviceIcons = {
  desktop: Monitor,
  laptop: Laptop,
  server: Server,
  switch: Network,
  router: Router,
  core: Network,
  firewall: Shield,
  isp: Globe,
  dns: Server,
};
export function DeviceIcon({
  kind,
  size = 22,
}: {
  kind: DeviceKind;
  size?: number;
}) {
  const Icon = deviceIcons[kind];
  return <Icon size={size} />;
}
export default function DeviceNode({ data, selected }: NodeProps<LabNode>) {
  return (
    <div
      className={ui(`device-node ${selected ? "selected" : ""} ${data.kind}`)}
    >
      <div className={ui("device-node-top")}>
        <span className={ui("device-icon")}>
          <DeviceIcon kind={data.kind} />
        </span>
        <span className={ui("node-kind")}>{data.kind}</span>
      </div>
      <strong>{data.name}</strong>
      <span className={ui("node-ip")}>
        {data.kind === "switch"
          ? "Layer 2 · Ethernet"
          : isRouted(data.kind)
            ? "2 routed interfaces"
            : data.ip || "Not configured"}
      </span>
      <div className={ui("node-ports")}>
        {ports(data.kind).map((p, i) => (
          <div
            key={p}
            className={ui("port-label")}
            style={{
              left: `${((i + 1) / (ports(data.kind).length + 1)) * 100}%`,
            }}
          >
            {p}
            <Handle
              type="source"
              position={Position.Bottom}
              id={p}
              title={`${data.name} ${p}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
