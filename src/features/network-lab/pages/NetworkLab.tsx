import { ui } from "../../../styles/ui";
import { useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  ConnectionMode,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Download,
  Save,
  RotateCcw,
  Play,
  Trash2,
  Info,
  CheckCircle2,
} from "lucide-react";
import { PageHeading, Panel, CheckItem } from "../../../components/ui/Shared";
import {
  deviceKinds,
  deviceLabels,
  isHost,
  isRouted,
  type DeviceKind,
  type LabNode,
} from "../data/types";
import { useNetworkStore } from "../store/useNetworkStore";
import {
  missionComplete,
  validateNetwork,
  canConnect,
} from "../engine/network";
import DeviceNode, { DeviceIcon } from "../components/DeviceNode";
import { usePreferences } from "../../../utils/preferences";
import {
  NetworkMissions,
  CorporateInspector,
} from "../components/CorporateControls";
const nodeTypes = { device: DeviceNode };
function NetworkWorkspace() {
  const s = useNetworkStore();
  const flow = useReactFlow();
  const [hostname, setHostname] = useState("portal.example");
  const canvasRef = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState(""),
    [target, setTarget] = useState(""),
    [confirm, setConfirm] = useState<"reset" | "load" | null>(null);
  const selected = s.nodes.find((n) => n.id === s.selectedId),
    hosts = s.nodes.filter(isHost),
    issues = validateNetwork(s.nodes, s.edges),
    complete = missionComplete(s.nodes, s.edges);
  const hints = usePreferences((p) => p.hints);
  const field = (
    key: "name" | "ip" | "mask" | "gateway" | "dns",
    label: string,
    placeholder: string,
  ) => (
    <label className={ui("form-field")} key={key}>
      {label}
      <input
        value={selected!.data[key]}
        maxLength={key === "name" ? 60 : 40}
        placeholder={placeholder}
        onChange={(e) => s.update(selected!.id, { [key]: e.target.value })}
      />
    </label>
  );
  return (
    <div className={ui("page simulator-page")}>
      <PageHeading
        eyebrow="NETWORK LAB / 02"
        title="Network Lab"
        description="Connect the dots. Understand the network."
      >
        <div className={ui("heading-actions")}>
          <button
            className={ui("button ghost")}
            onClick={() => setConfirm("reset")}
          >
            <RotateCcw size={15} />
            Reset
          </button>
          <button
            className={ui("button ghost")}
            onClick={() => setConfirm("load")}
          >
            <Download size={15} />
            Load
          </button>
          <button className={ui("button secondary")} onClick={s.save}>
            <Save size={15} />
            Save topology
          </button>
        </div>
      </PageHeading>
      <NetworkMissions />
      {confirm && (
        <div className={ui("confirm-bar")}>
          {confirm === "reset"
            ? "Clear this canvas?"
            : "Replace this canvas with the saved topology?"}
          <button
            className={ui("button danger")}
            onClick={() => {
              if (confirm === "reset") s.reset();
              else s.load();
              setConfirm(null);
            }}
          >
            Continue
          </button>
          <button
            className={ui("button ghost")}
            onClick={() => setConfirm(null)}
          >
            Cancel
          </button>
        </div>
      )}
      <div className={ui("network-layout")}>
        <div className={ui("network-main")}>
          <div className={ui("device-palette")}>
            <span className={ui("eyebrow")}>ADD DEVICE</span>
            {deviceKinds.map((kind) => (
              <button
                key={kind}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/itlab-device", kind);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onClick={() => {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (rect)
                    s.add(
                      kind,
                      flow.screenToFlowPosition({
                        x:
                          rect.x +
                          35 +
                          (s.nodes.length % 3) *
                            Math.min(190, (rect.width - 195) / 2),
                        y:
                          rect.y +
                          65 +
                          (Math.floor(s.nodes.length / 3) % 3) * 130,
                      }),
                    );
                }}
                title={`Click to add or drag ${deviceLabels[kind]} onto canvas`}
              >
                <DeviceIcon kind={kind} size={18} />
                {deviceLabels[kind]}
                <span>+</span>
              </button>
            ))}
          </div>
          <div
            ref={canvasRef}
            className={ui("network-canvas")}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={(e) => {
              e.preventDefault();
              const kind = e.dataTransfer.getData(
                "application/itlab-device",
              ) as DeviceKind;
              if (deviceKinds.includes(kind))
                s.add(
                  kind,
                  flow.screenToFlowPosition({ x: e.clientX, y: e.clientY }),
                );
            }}
          >
            <ReactFlow<LabNode>
              nodes={s.nodes}
              edges={s.edges}
              nodeTypes={nodeTypes}
              onNodesChange={s.changeNodes}
              onEdgesChange={s.changeEdges}
              onConnect={s.connect}
              connectionMode={ConnectionMode.Loose}
              isValidConnection={(c) =>
                canConnect(
                  c.source,
                  c.target,
                  c.sourceHandle,
                  c.targetHandle,
                  s.nodes,
                  s.edges,
                )
              }
              onNodeClick={(_, n) => s.select(n.id)}
              onPaneClick={() => s.select(null)}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              minZoom={0.25}
              maxZoom={2}
              className={ui("dark")}
              deleteKeyCode={["Backspace", "Delete"]}
              defaultEdgeOptions={{
                style: { stroke: "#61c9c4", strokeWidth: 2 },
                type: "smoothstep",
              }}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={22}
                size={1}
                color="#344455"
              />
              <Controls />
              <MiniMap nodeColor="#356273" maskColor="rgba(10,18,27,.7)" />
            </ReactFlow>
            {s.nodes.length === 0 && (
              <div className={ui("canvas-empty")}>
                <DeviceIcon kind="switch" size={36} />
                <h3>A network starts with a connection.</h3>
                <p>Click a device above or drag it onto the canvas.</p>
                <span>For your first mission: 2 desktops + 1 switch</span>
              </div>
            )}
            <div className={ui("canvas-label")}>
              ETHERNET WORKSPACE{" "}
              <span>
                {s.nodes.length} devices / {s.edges.length} cables
              </span>
            </div>
          </div>
          <div className={ui("workspace-controls")}>
            <span>Drag ports to connect</span>
            <span>Click a device to configure</span>
            <span>Select + Delete to remove</span>
          </div>
          <div className={ui("status-message")} role="status">
            <Info size={16} />
            {s.message}
          </div>
          <Panel title="Connectivity test" className={ui("ping-panel")}>
            <div className={ui("ping-controls")}>
              <label className={ui("form-field")}>
                Source host
                <select
                  aria-label="Ping source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  <option value="">Choose source</option>
                  {hosts.map((n) => (
                    <option value={n.id} key={n.id}>
                      {n.data.name}
                    </option>
                  ))}
                </select>
              </label>
              <span className={ui("ping-arrow")}>→</span>
              <label className={ui("form-field")}>
                Destination host
                <select
                  aria-label="Ping destination"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="">Choose destination</option>
                  {hosts.map((n) => (
                    <option value={n.id} key={n.id}>
                      {n.data.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className={ui("button primary")}
                onClick={() => s.test(source, target)}
              >
                <Play size={15} />
                Run ping
              </button>
            </div>
            <div className="flex flex-wrap items-end gap-3 mb-4">
              <label className={ui("form-field")}>
                Website hostname
                <input
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                />
              </label>
              <button
                className={ui("button secondary")}
                onClick={() => s.website(source, hostname)}
              >
                Test DNS + HTTPS
              </button>
            </div>
            <div className={ui("ping-console")} role="status">
              {s.result ? (
                <>
                  <strong
                    className={ui(
                      s.result.success ? "text-cyan" : "text-amber",
                    )}
                  >
                    {s.result.success ? "✓" : "×"} {s.result.title}
                  </strong>
                  <p>{s.result.detail}</p>
                  {s.result.path.length > 0 && (
                    <div className={ui("path-line")}>
                      {s.result.path.join(" → ")}
                    </div>
                  )}
                </>
              ) : (
                <span>
                  Select two hosts to evaluate their Ethernet path and IPv4
                  configuration.
                </span>
              )}
            </div>
          </Panel>
        </div>
        <div className={ui("right-stack")}>
          <Panel title="Device configuration" collapsible>
            {selected ? (
              <>
                <div className={ui("config-title")}>
                  <DeviceIcon kind={selected.data.kind} />
                  <span>{deviceLabels[selected.data.kind]}</span>
                  <button
                    className={ui("icon-button")}
                    aria-label="Delete selected device"
                    onClick={() => s.remove(selected.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                {field("name", "Device name", "Device name")}
                {selected.data.kind === "switch" ? (
                  <div className={ui("hint")}>
                    This unmanaged switch forwards Ethernet traffic. No IP
                    configuration is required.
                  </div>
                ) : isRouted(selected.data.kind) ? (
                  <>
                    {(["eth0", "eth1"] as const).map((port) => (
                      <fieldset key={port}>
                        <legend>{port} interface</legend>
                        {(["ip", "mask"] as const).map((k) => (
                          <label className={ui("form-field")} key={k}>
                            {k === "ip" ? "IPv4 address" : "Subnet mask"}
                            <input
                              aria-label={`${port} ${k}`}
                              value={selected.data.interfaces[port][k]}
                              maxLength={40}
                              placeholder={
                                k === "ip" ? "192.168.1.1" : "255.255.255.0"
                              }
                              onChange={(e) =>
                                s.update(selected.id, {
                                  interfaces: {
                                    ...selected.data.interfaces,
                                    [port]: {
                                      ...selected.data.interfaces[port],
                                      [k]: e.target.value,
                                    },
                                  },
                                })
                              }
                            />
                          </label>
                        ))}
                      </fieldset>
                    ))}
                    <p className={ui("muted-note")}>
                      Connected and static routes across multiple hops. Each
                      interface must belong to a different subnet.
                    </p>
                  </>
                ) : (
                  <>
                    {field("ip", "IPv4 address", "192.168.1.10")}
                    {field("mask", "Subnet mask", "255.255.255.0")}
                    {field(
                      "gateway",
                      "Default gateway · optional",
                      "192.168.1.1",
                    )}
                    {field("dns", "DNS server · optional", "1.1.1.1")}
                  </>
                )}
                <CorporateInspector node={selected} />
                <div className={ui("saved-label")}>
                  Changes apply immediately to the simulation.
                </div>
              </>
            ) : (
              <div className={ui("inventory-help")}>
                <DeviceIcon kind="desktop" size={28} />
                <p>
                  Select a device on the canvas to configure its network
                  settings.
                </p>
              </div>
            )}
          </Panel>
          {!s.mission && (
            <Panel title="Mission 02" collapsible>
              <span className={ui("mission-badge")}>FIRST CONNECTION</span>
              <h3>Connect Two Computers</h3>
              <p className={ui("panel-description")}>
                Connect two desktop PCs through a switch and configure them to
                communicate.
              </p>
              <div className={ui("checklist")}>
                <CheckItem
                  done={
                    s.nodes.filter((n) => n.data.kind === "desktop").length >= 2
                  }
                >
                  Add two desktop PCs
                </CheckItem>
                <CheckItem done={s.nodes.some((n) => n.data.kind === "switch")}>
                  Add an Ethernet switch
                </CheckItem>
                <CheckItem done={complete}>
                  Connect both PCs through a switch with valid addresses
                </CheckItem>
              </div>
              {complete && (
                <div className={ui("feedback success")}>
                  <CheckCircle2 size={18} />
                  <strong>Mission complete. Your local network works.</strong>
                </div>
              )}
              {hints && (
                <div className={ui("hint")}>
                  <strong>Try this configuration</strong>
                  <p>
                    PC 1: 192.168.1.10
                    <br />
                    PC 2: 192.168.1.20
                    <br />
                    Both masks: 255.255.255.0
                  </p>
                  Connect each eth0 to a different switch port, then run a ping.
                </div>
              )}
            </Panel>
          )}
        </div>
      </div>
      <Panel title="Network diagnostics">
        <div className={ui("diagnostic-list")}>
          {issues.length ? (
            issues.map((i, index) => (
              <div
                className={ui(`diagnostic ${i.severity}`)}
                key={`${i.nodeId}-${i.code}-${index}`}
              >
                <Info size={16} />
                <p>{i.message}</p>
                <span>{i.severity}</span>
              </div>
            ))
          ) : (
            <div className={ui("diagnostic valid")}>
              <CheckCircle2 size={17} />
              <p>
                {s.nodes.length
                  ? "No configuration issues detected. Use ping to test a specific path."
                  : "Add devices to begin validation."}
              </p>
            </div>
          )}
        </div>
      </Panel>
      <p className={ui("muted-note")}>
        Deterministic reachability checks, not packet emulation. Supports local
        Ethernet, static/default routing, DNS A records, and service-based
        firewall policies. Core switches use routed ports. No DHCP, VLAN trunks,
        NAT, dynamic routing, or stateful packet inspection.
      </p>
    </div>
  );
}
export default function NetworkLab() {
  return (
    <ReactFlowProvider>
      <NetworkWorkspace />
    </ReactFlowProvider>
  );
}
