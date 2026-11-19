import { useEffect, useState } from "react";
import { useReactFlow } from "@xyflow/react";
import { CheckItem, Panel } from "../../../components/ui/Shared";
import { ui } from "../../../styles/ui";
import { useNetworkStore } from "../store/useNetworkStore";
import {
  networkMissions,
  evaluateNetworkMission,
  type NetworkMissionId,
} from "../data/scenarios";
import { isRouted, ports, type LabNode, type Protocol } from "../data/types";
export function NetworkMissions() {
  const s = useNetworkStore(),
    flow = useReactFlow();
  const [choiceOverride, setChoice] = useState<NetworkMissionId | null>(null),
    [confirm, setConfirm] = useState(false);
  const choice = choiceOverride ?? s.mission ?? "office";
  useEffect(() => {
    if (!s.mission) return;
    const timer = setTimeout(
      () => void flow.fitView({ padding: 0.2, maxZoom: 1 }),
      100,
    );
    return () => clearTimeout(timer);
  }, [s.mission, s.nodes.length, flow]);
  const mission = networkMissions.find((m) => m.id === s.mission),
    checks = mission
      ? evaluateNetworkMission(mission.id, s.nodes, s.edges)
      : [];
  return (
    <Panel title="Corporate service desk · scenarios" className="mb-[20px]">
      <div className="flex flex-wrap items-end gap-[12px]">
        <label className={ui("form-field flex-1 !m-0")}>
          Choose a ticket
          <select
            value={choice}
            onChange={(e) => {
              setChoice(e.target.value as NetworkMissionId);
              setConfirm(false);
            }}
          >
            {networkMissions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.difficulty} · {m.title}
              </option>
            ))}
          </select>
        </label>
        <button
          className={ui("button secondary")}
          onClick={() =>
            s.nodes.length ? setConfirm(true) : s.startMission(choice)
          }
        >
          Load scenario
        </button>
        <span className="text-[11px] text-lab-muted">
          Sandbox and the original introductory mission remain available.
        </span>
      </div>
      {confirm && (
        <div className={ui("confirm-bar mt-[14px]")}>
          Replace the current topology? Save it first if you want to keep it.
          <button
            className={ui("button primary")}
            onClick={() => {
              s.startMission(choice);
              setConfirm(false);
            }}
          >
            Replace and start
          </button>
          <button
            className={ui("button ghost")}
            onClick={() => setConfirm(false)}
          >
            Cancel
          </button>
        </div>
      )}
      {mission && (
        <div className="mt-[18px] grid gap-[18px] lg:grid-cols-2">
          <div>
            <span className={ui("mission-badge")}>
              {mission.difficulty} · ACTIVE TICKET
            </span>
            <h3>{mission.title}</h3>
            <p className={ui("panel-description")}>{mission.brief}</p>
            <ol className="list-decimal space-y-[7px] pl-[18px] text-[12px] text-[#aac0cb]">
              {mission.tasks.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
          </div>
          <div>
            {checks.map((c) => (
              <CheckItem key={c.label} done={c.done}>
                {c.label}
              </CheckItem>
            ))}
            {checks.every((c) => c.done) && (
              <p className={ui("feedback success")}>
                Ticket resolved. All live acceptance checks pass.
              </p>
            )}
            <details className={ui("hint")}>
              <summary className="cursor-pointer">Troubleshooting hint</summary>
              <p>{mission.hint}</p>
            </details>
          </div>
        </div>
      )}
    </Panel>
  );
}
export function CorporateInspector({ node }: { node: LabNode }) {
  const update = useNetworkStore((s) => s.update);
  return (
    <>
      <fieldset>
        <legend>Administrative port state</legend>
        {ports(node.data.kind).map((port) => (
          <label
            className="my-3 flex items-center justify-between gap-2 text-xs"
            key={port}
          >
            Enable {port}
            <input
              type="checkbox"
              checked={!node.data.disabledPorts?.includes(port)}
              onChange={(e) =>
                update(node.id, {
                  disabledPorts: e.target.checked
                    ? (node.data.disabledPorts ?? []).filter((p) => p !== port)
                    : [...new Set([...(node.data.disabledPorts ?? []), port])],
                })
              }
            />
          </label>
        ))}
      </fieldset>
      {isRouted(node.data.kind) && (
        <div className="mt-[16px] border-t border-lab-border pt-[12px]">
          <h3>Static routes</h3>
          <p className={ui("muted-note")}>
            Longest prefix wins. Use 0.0.0.0 / 0.0.0.0 for a default route.
            Connected routes are automatic.
          </p>
          {node.data.routes.map((r, i) => (
            <div
              key={i}
              className="my-[10px] rounded border border-lab-border p-[8px]"
            >
              {(["network", "mask", "nextHop"] as const).map((k) => (
                <label className={ui("form-field")} key={k}>
                  {k === "network"
                    ? "Destination network"
                    : k === "mask"
                      ? "Route mask"
                      : "Next hop"}
                  <input
                    aria-label={`Route ${i + 1} ${k}`}
                    value={r[k]}
                    maxLength={40}
                    onChange={(e) =>
                      update(node.id, {
                        routes: node.data.routes.map((v, j) =>
                          i === j ? { ...v, [k]: e.target.value } : v,
                        ),
                      })
                    }
                  />
                </label>
              ))}
              <button
                className={ui("button ghost")}
                onClick={() =>
                  update(node.id, {
                    routes: node.data.routes.filter((_, j) => j !== i),
                  })
                }
              >
                Remove route {i + 1}
              </button>
            </div>
          ))}
          <button
            className={ui("button secondary mt-[10px]")}
            disabled={node.data.routes.length >= 32}
            onClick={() =>
              update(node.id, {
                routes: [
                  ...node.data.routes,
                  { network: "0.0.0.0", mask: "0.0.0.0", nextHop: "" },
                ],
              })
            }
          >
            Add static route
          </button>
        </div>
      )}
      {node.data.kind === "firewall" && (
        <fieldset>
          <legend>Transit service policy</legend>
          {(["icmp", "dns", "https"] as Protocol[]).map((p) => (
            <label
              key={p}
              className="my-[12px] flex items-center justify-between gap-[8px] text-[12px]"
            >
              Allow {p.toUpperCase()}
              <input
                type="checkbox"
                checked={node.data.policy[p]}
                onChange={(e) =>
                  update(node.id, {
                    policy: { ...node.data.policy, [p]: e.target.checked },
                  })
                }
              />
            </label>
          ))}
          <p className={ui("muted-note")}>
            Applies to traffic crossing this firewall in either direction. This
            is a service-policy model, not a full stateful firewall or NAT
            implementation.
          </p>
        </fieldset>
      )}
      {node.data.kind === "dns" && (
        <div className="mt-[16px]">
          <h3>DNS A records</h3>
          {node.data.records.map((r, i) => (
            <div key={i} className="my-[10px] border-t border-lab-border">
              {(["name", "address"] as const).map((k) => (
                <label className={ui("form-field")} key={k}>
                  {k === "name" ? "Hostname" : "Answer IPv4"}
                  <input
                    aria-label={`DNS record ${i + 1} ${k}`}
                    value={r[k]}
                    maxLength={k === "name" ? 120 : 40}
                    onChange={(e) =>
                      update(node.id, {
                        records: node.data.records.map((v, j) =>
                          i === j ? { ...v, [k]: e.target.value } : v,
                        ),
                      })
                    }
                  />
                </label>
              ))}
              <button
                className={ui("button ghost")}
                onClick={() =>
                  update(node.id, {
                    records: node.data.records.filter((_, j) => j !== i),
                  })
                }
              >
                Remove record {i + 1}
              </button>
            </div>
          ))}
          <button
            className={ui("button secondary")}
            disabled={node.data.records.length >= 64}
            onClick={() =>
              update(node.id, {
                records: [
                  ...node.data.records,
                  { name: "portal.example", address: "" },
                ],
              })
            }
          >
            Add A record
          </button>
        </div>
      )}
    </>
  );
}
