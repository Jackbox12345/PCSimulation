import { useState } from "react";
import { ArrowRight, Cpu, CircuitBoard, Monitor, Network } from "lucide-react";
import { byId } from "../../pc-builder/data/hardware";
import type { Lesson } from "../courses/types";
import { ui } from "../../../styles/ui";
export default function InteractiveDiagram({
  visual,
}: {
  visual: Lesson["visual"];
}) {
  const [step, setStep] = useState(0),
    [board, setBoard] = useState("b650"),
    [part, setPart] = useState(visual.kind === "memory" ? "ddr5" : "r7600"),
    [target, setTarget] = useState("192.168.1.20");
  if (visual.kind === "memory" || visual.kind === "socket") {
    const memory = visual.kind === "memory",
      motherboard = byId[board],
      component = byId[part],
      compatible = memory
        ? motherboard.memoryType === component.memoryType
        : motherboard.socket === component.socket;
    return (
      <figure className="rounded-lg border border-lab-border bg-lab-bg p-5">
        <figcaption className="text-sm text-lab-muted mb-5">
          {visual.caption}
        </figcaption>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={ui("form-field")}>
            Motherboard
            <select
              aria-label="Motherboard"
              value={board}
              onChange={(e) => setBoard(e.target.value)}
            >
              {["b650", "b760"].map((id) => (
                <option key={id} value={id}>
                  {byId[id].name}
                </option>
              ))}
            </select>
          </label>
          <label className={ui("form-field")}>
            {memory ? "RAM module" : "Processor"}
            <select
              aria-label={memory ? "RAM module" : "Processor"}
              value={part}
              onChange={(e) => setPart(e.target.value)}
            >
              {(memory ? ["ddr5", "ddr4"] : ["r7600", "i12400"]).map((id) => (
                <option key={id} value={id}>
                  {byId[id].name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 my-5">
          <div className="rounded border border-lab-border p-4 text-center">
            <Cpu className="mx-auto mb-3" />
            <span className="text-sm">
              {memory ? component.memoryType : component.socket}
            </span>
          </div>
          <ArrowRight
            aria-hidden="true"
            className={compatible ? "text-lab-accent" : "text-amber-300"}
          />
          <div className="rounded border border-lab-accent p-4 text-center">
            <CircuitBoard className="mx-auto mb-3" />
            <span className="text-sm">
              {memory ? motherboard.memoryType : motherboard.socket}
            </span>
          </div>
        </div>
        <p
          role="status"
          className={`text-sm leading-6 ${compatible ? "text-lab-accent" : "text-amber-300"}`}
        >
          {compatible
            ? "Compatible in this lab: the required connection matches."
            : `Incompatible: ${memory ? "DDR generations have different notches and electrical requirements." : "The CPU socket differs from the motherboard socket."} Matching the connector is required.`}
        </p>
        <p className="text-xs text-lab-muted mt-3">
          Conceptual diagram, not a physical pin layout. This exploration does
          not change your PC build.
        </p>
      </figure>
    );
  }
  if (visual.kind === "subnet") {
    const duplicate = target === "192.168.1.10",
      reserved = target === "192.168.1.0",
      local = target === "192.168.1.20";
    return (
      <figure className="rounded-lg border border-lab-border bg-lab-bg p-5">
        <figcaption className="text-sm text-lab-muted mb-5">
          {visual.caption}
        </figcaption>
        <label className={ui("form-field")}>
          PC B address
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            {[
              "192.168.1.20",
              "192.168.2.20",
              "192.168.1.10",
              "192.168.1.0",
            ].map((ip) => (
              <option key={ip}>{ip}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center justify-center gap-3 py-5">
          {[
            { label: "PC A", ip: "192.168.1.10", icon: Monitor },
            { label: "Switch", ip: "Layer 2", icon: Network },
            { label: "PC B", ip: target, icon: Monitor },
          ].map((n, i) => (
            <div key={n.label} className="flex items-center gap-3">
              {i > 0 && <span className="w-4 border-t-2 border-lab-accent" />}
              <div className="border border-lab-border rounded p-3 text-center">
                <n.icon className="mx-auto mb-2" />
                <p className="text-sm">{n.label}</p>
                <p className="font-mono text-xs mt-2">{n.ip}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs font-mono text-lab-muted mb-3">
          Both masks: 255.255.255.0 (/24) · no router
        </p>
        <p
          role="status"
          className={`text-sm leading-7 ${local ? "text-lab-accent" : "text-amber-300"}`}
        >
          {duplicate
            ? "Duplicate address. Both hosts have the same address; assign a different usable host address."
            : reserved
              ? "Network address. 192.168.1.0 identifies this /24 subnet and cannot be assigned to a host in this exercise."
              : local
                ? "Same subnet, unique usable addresses. With enabled links, this local IP exchange needs no gateway."
                : "Different subnets. 192.168.1.0/24 and 192.168.2.0/24 require routing; this switch alone cannot connect them at IP level."}
        </p>
        <p className="text-xs text-lab-muted mt-3">
          Guided example; your Network Lab topology stays unchanged.
        </p>
      </figure>
    );
  }
  return (
    <figure className="rounded-lg border border-lab-border bg-lab-bg p-5">
      <figcaption className="text-sm text-lab-muted mb-5">
        {visual.caption}
      </figcaption>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {visual.steps.map((item, index) => (
          <button
            key={item.label}
            aria-pressed={index === step}
            onClick={() => setStep(index)}
            className={`rounded border p-4 text-left text-sm ${index === step ? "border-lab-accent bg-cyan-950/30" : "border-lab-border hover:bg-white/5"}`}
          >
            <span className="block text-xs font-mono text-lab-accent mb-3">
              {String(index + 1).padStart(2, "0")} →
            </span>
            {item.label}
          </button>
        ))}
      </div>
      <p className="text-sm leading-7 mt-5" aria-live="polite">
        {visual.steps[step]?.detail}
      </p>
    </figure>
  );
}
