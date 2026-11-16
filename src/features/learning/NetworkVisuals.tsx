import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Panel } from "../../components/ui/Shared";
import { ui } from "../../styles/ui";
import { osiLayers, walks } from "./ccna";
import { parseIP } from "../network-lab/engine/network";
const dotted = (n: number) =>
  [24, 16, 8, 0].map((shift) => (n >>> shift) & 255).join(".");
export default function NetworkVisuals() {
  const [layer, setLayer] = useState(3),
    [mode, setMode] = useState<keyof typeof walks>("local"),
    [step, setStep] = useState(0);
  const [ip, setIP] = useState("192.168.10.42"),
    [prefix, setPrefix] = useState(24);
  const selected = osiLayers.find((l) => l.n === layer)!,
    walk = walks[mode],
    current = walk.steps[step];
  const value = parseIP(ip),
    mask = (0xffffffff << (32 - prefix)) >>> 0,
    network = value === null ? 0 : (value & mask) >>> 0,
    broadcast = (network | ~mask) >>> 0;
  return (
    <div className="space-y-5 mb-7">
      <Panel title="Packet journey · follow an actual exchange">
        <div
          className="flex flex-wrap gap-2 mb-5"
          role="group"
          aria-label="Communication scenario"
        >
          {Object.entries(walks).map(([key, w]) => (
            <button
              key={key}
              className={ui(`button ${mode === key ? "primary" : "ghost"}`)}
              aria-pressed={mode === key}
              onClick={() => {
                setMode(key as keyof typeof walks);
                setStep(0);
              }}
            >
              {w.title}
            </button>
          ))}
        </div>
        <p className="text-lab-muted text-xs mb-4">
          Illustrated protocol sequence. MAC labels are symbolic; this
          walkthrough is independent of your lab topology.
        </p>
        <div
          className="flex flex-wrap items-center justify-center gap-2 rounded border border-lab-border bg-lab-bg p-5"
          aria-label="Communication path"
        >
          {walk.nodes.map((name, i) => (
            <div className="flex items-center gap-2" key={name}>
              <div
                className={`rounded border px-4 py-5 text-center text-xs transition-colors ${current.active.includes(name) ? "border-lab-accent bg-cyan-950/40 text-lab-accent" : "border-lab-border text-lab-muted"}`}
              >
                <span className="block text-[10px] mb-2">
                  {current.active.includes(name) ? "ACTIVE" : "WAITING"}
                </span>
                {name}
              </div>
              {i < walk.nodes.length - 1 && (
                <ArrowRight size={16} className="text-lab-muted" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-5" aria-live="polite">
          <span className="text-xs font-mono text-lab-accent">
            {current.layer}
          </span>
          <h3 className="text-lg mt-2">{current.title}</h3>
          <p className="text-sm leading-7 text-lab-muted my-3 max-w-4xl">
            {current.text}
          </p>
          <div className="rounded bg-lab-bg border border-lab-border p-4 text-xs font-mono text-cyan-200 leading-6">
            {current.headers}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button
            className={ui("button ghost")}
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            <ChevronLeft size={15} />
            Back
          </button>
          <span className="text-xs text-lab-muted">
            {step + 1} / {walk.steps.length}
          </span>
          <button
            className={ui("button primary")}
            disabled={step === walk.steps.length - 1}
            onClick={() => setStep(step + 1)}
          >
            Next step
            <ChevronRight size={15} />
          </button>
          <button
            className={ui("icon-button")}
            aria-label="Restart packet journey"
            onClick={() => setStep(0)}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="OSI model · inspect each layer">
          <p className="text-sm text-lab-muted mb-4">
            Sending adds protocol headers down the stack; receiving processes
            them up the stack. OSI is a reference model, not seven separate
            programs.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              {osiLayers.map((l) => (
                <button
                  key={l.n}
                  aria-label={`OSI layer ${l.n}: ${l.name}`}
                  aria-pressed={l.n === layer}
                  className={`w-full text-left rounded border px-3 py-2 text-xs transition-colors ${l.n === layer ? "border-lab-accent bg-cyan-950/40 text-lab-accent" : "border-lab-border hover:bg-white/5"}`}
                  onClick={() => setLayer(l.n)}
                >
                  <span className="font-mono mr-3">L{l.n}</span>
                  {l.name}
                </button>
              ))}
            </div>
            <div aria-live="polite">
              <span className="text-xs text-lab-accent">
                LAYER {selected.n}
              </span>
              <h3 className="my-2">{selected.name}</h3>
              <p className="text-xs leading-6 text-lab-muted">
                {selected.text}
              </p>
              <dl className="mt-3 text-xs space-y-2">
                <dt className="text-lab-muted">Protocol data unit</dt>
                <dd>{selected.pdu}</dd>
                <dt className="text-lab-muted">Examples / responsibilities</dt>
                <dd>{selected.example}</dd>
              </dl>
            </div>
          </div>
          <p className="text-xs text-lab-muted mt-4">
            TCP/IP commonly groups OSI 5–7 into Application, keeps Transport and
            Internet, and combines 1–2 as Link. Not every protocol fits a single
            OSI box exactly.
          </p>
        </Panel>
        <Panel title="IPv4 subnet explorer">
          <div className="flex gap-3 flex-wrap">
            <label className={ui("form-field")}>
              Host IPv4
              <input
                value={ip}
                onChange={(e) => setIP(e.target.value)}
                maxLength={40}
              />
            </label>
            <label className={ui("form-field")}>
              Prefix length
              <select
                value={prefix}
                onChange={(e) => setPrefix(Number(e.target.value))}
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={p}>
                    /{p}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {value === null ? (
            <p role="status" className="text-amber-300">
              Enter four decimal octets, each from 0 to 255.
            </p>
          ) : (
            <div aria-live="polite">
              <dl className="grid grid-cols-2 gap-3 text-xs font-mono my-5">
                <dt className="text-lab-muted">Subnet mask</dt>
                <dd>{dotted(mask)}</dd>
                <dt className="text-lab-muted">Network</dt>
                <dd>{dotted(network)}</dd>
                <dt className="text-lab-muted">Broadcast</dt>
                <dd>{dotted(broadcast)}</dd>
                <dt className="text-lab-muted">Usable range</dt>
                <dd>
                  {dotted(network + 1)} – {dotted(broadcast - 1)}
                </dd>
                <dt className="text-lab-muted">Host capacity</dt>
                <dd>{(2 ** (32 - prefix) - 2).toLocaleString()}</dd>
              </dl>
              <p className="text-xs text-lab-accent">
                {value === network
                  ? "This address identifies the network."
                  : value === broadcast
                    ? "This address is the subnet broadcast."
                    : "This address is within the subnet host range."}
              </p>
            </div>
          )}
          <p className="text-xs leading-6 text-lab-muted mt-4">
            Bitwise IP AND mask gives the network. A longer prefix leaves fewer
            host bits. This explorer covers conventional /1–/30 subnet
            arithmetic; special-use address ranges still have restrictions. /31
            point-to-point links and /32 host routes use different host-count
            rules.
          </p>
        </Panel>
      </div>
    </div>
  );
}
