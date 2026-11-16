import { ui } from "../../../styles/ui";
import { useState } from "react";
import {
  Box,
  CheckCircle2,
  Cpu,
  Info,
  Power,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeading, Panel, CheckItem } from "../../../components/ui/Shared";
import {
  byId,
  categories,
  categoryLabels,
  hardware,
  required,
  type Category,
} from "../data/hardware";
import { usePCStore } from "../store/usePCStore";
import {
  estimatedPower,
  installationIssues,
  validateBuild,
} from "../engine/compatibility";
import PCScene from "../scene/PCScene";
import { usePreferences } from "../../../utils/preferences";
import SoftwareWorkbench from "../components/SoftwareWorkbench";
import PCMissionPanel from "../components/PCMissionPanel";
export default function PCBuilder() {
  const state = usePCStore();
  const [category, setCategory] = useState<Category>("motherboard");
  const [resetKey, setResetKey] = useState(0);
  const [query, setQuery] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const hints = usePreferences((s) => s.hints);
  const selected = state.selectedId ? byId[state.selectedId] : null;
  const diagnostics = validateBuild(state.installed);
  const errors = diagnostics.filter((d) => d.severity === "error");
  const selectedIssues = selected
    ? installationIssues(state.installed, selected)
    : [];
  return (
    <div className={ui("page simulator-page")}>
      <PageHeading
        eyebrow="HARDWARE LAB / 01"
        title="PC Builder"
        description="Piece by piece. Build a computer that works."
      >
        <div className={ui("heading-actions")}>
          <button
            className={ui("button ghost")}
            onClick={() => setConfirmReset(true)}
          >
            <RotateCcw size={15} /> Reset build
          </button>
          <button className={ui("button primary")} onClick={state.power}>
            <Power size={16} /> Power on
          </button>
        </div>
      </PageHeading>
      <div className="flex flex-wrap gap-3 mb-4">
        <a className={ui("button secondary")} href="#software">
          Software setup & OS installation ?
        </a>
        <span className="text-xs text-lab-muted self-center">
          Hardware POST ? Install OS ? Configure desktop ? Handoff
        </span>
      </div>
      <PCMissionPanel />
      {confirmReset && (
        <div className={ui("confirm-bar")}>
          Return all components to inventory?
          <button
            className={ui("button danger")}
            onClick={() => {
              state.reset();
              setConfirmReset(false);
            }}
          >
            Reset build
          </button>
          <button
            className={ui("button ghost")}
            onClick={() => setConfirmReset(false)}
          >
            Cancel
          </button>
        </div>
      )}
      <div className={ui("pc-layout")}>
        <Panel
          title="Hardware inventory"
          className={ui("inventory-panel")}
          collapsible
        >
          <label className={ui("search-field compact")}>
            <Search size={14} />
            <input
              aria-label="Search hardware"
              placeholder="Find a component…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className={ui("category-tabs")}>
            {categories.map((c) => (
              <button
                key={c}
                className={ui(category === c ? "selected" : "")}
                onClick={() => setCategory(c)}
              >
                {categoryLabels[c]}
              </button>
            ))}
          </div>
          <div className={ui("inventory-list")}>
            {hardware
              .filter(
                (h) =>
                  h.category === category &&
                  h.name.toLowerCase().includes(query.toLowerCase()),
              )
              .map((h) => (
                <button
                  key={h.id}
                  className={ui(
                    `inventory-item ${state.selectedId === h.id ? "selected" : ""}`,
                  )}
                  onClick={() => state.select(h.id)}
                >
                  <span className={ui("part-icon")}>
                    <Cpu size={20} />
                  </span>
                  <span>
                    <strong>{h.name}</strong>
                    <small>
                      {h.manufacturer} ·{" "}
                      {h.socket ||
                        h.memoryType ||
                        h.specifications.Interface ||
                        h.specifications.Output ||
                        h.specifications.Mounts ||
                        h.specifications.VRAM}
                    </small>
                  </span>
                  {state.installed[h.category] === h.id && (
                    <CheckCircle2 size={14} className={ui("text-cyan")} />
                  )}
                </button>
              ))}
          </div>
          {selected ? (
            <div className={ui("part-details")}>
              <div className={ui("eyebrow")}>SELECTED COMPONENT</div>
              <h3>{selected.name}</h3>
              <dl>
                {Object.entries(selected.specifications).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              {selectedIssues.length > 0 ? (
                <div className={ui("feedback error")}>
                  {selectedIssues.map((i) => (
                    <p key={i.code}>
                      <strong>{i.title}</strong>
                      <br />
                      {i.explanation}
                    </p>
                  ))}
                </div>
              ) : (
                <div className={ui("hint")}>
                  Click the cyan target in the case to install. Selecting an
                  occupied category replaces its component.
                </div>
              )}
              <button
                className={ui("button secondary full")}
                disabled={selectedIssues.length > 0}
                onClick={state.install}
              >
                Install selected component
              </button>
            </div>
          ) : (
            <div className={ui("inventory-help")}>
              <Box size={24} />
              <p>
                Select a component to inspect its specifications and
                installation target.
              </p>
            </div>
          )}
        </Panel>
        <section className={ui("workbench")}>
          <div className={ui("workspace-toolbar")}>
            <span>
              <span className={ui("status-dot")} /> LAB / M1{" "}
              <span className={ui("text-muted")}>· ATX mid-tower</span>
            </span>
            <button
              className={ui("icon-button")}
              title="Reset camera"
              aria-label="Reset camera"
              onClick={() => setResetKey((k) => k + 1)}
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <div className={ui("scene")}>
            <PCScene resetKey={resetKey} />
            <div className={ui("scene-caption")}>
              ASSEMBLY VIEW <span>01 / OPEN CHASSIS</span>
            </div>
          </div>
          <div className={ui("workspace-controls")}>
            <span>Drag to orbit</span>
            <span>Scroll to zoom</span>
            <span>Right-drag to pan</span>
          </div>
          <div className={ui("status-message")} role="status">
            <Info size={16} />
            {state.message}
          </div>
          <div className={ui("build-summary")}>
            <div>
              <span className={ui("eyebrow")}>ESTIMATED LOAD</span>
              <strong>
                {estimatedPower(state.installed)} <small>W</small>
              </strong>
            </div>
            <div>
              <span className={ui("eyebrow")}>INSTALLED</span>
              <strong>
                {Object.keys(state.installed).length} <small>components</small>
              </strong>
            </div>
            <div>
              <span className={ui("eyebrow")}>COMPATIBILITY</span>
              <strong
                className={ui(errors.length ? "text-amber" : "text-cyan")}
              >
                {errors.length
                  ? `${errors.length} issue(s)`
                  : diagnostics.some((d) => d.severity === "missing")
                    ? "In progress"
                    : "Ready"}
              </strong>
            </div>
          </div>
        </section>
        <div className={ui("right-stack")}>
          {!state.mission && (
            <Panel title="Mission 01" collapsible>
              <span className={ui("mission-badge")}>GUIDED BUILD</span>
              <h3>Build Your First Computer</h3>
              <p className={ui("panel-description")}>
                Assemble a functioning desktop PC using compatible hardware.
              </p>
              <div className={ui("checklist")}>
                {required.map((c) => (
                  <CheckItem key={c} done={!!state.installed[c]}>
                    Install{" "}
                    {c === "psu"
                      ? "power supply"
                      : c === "ram"
                        ? "compatible RAM"
                        : c === "cooler"
                          ? "CPU cooler"
                          : c}
                  </CheckItem>
                ))}
                <CheckItem done={!!state.post?.success}>
                  Successfully complete POST
                </CheckItem>
              </div>
              {state.post?.success && (
                <div className={ui("feedback success")}>
                  <CheckCircle2 size={18} />
                  <strong>
                    Hardware mission complete. Continue with software setup.
                  </strong>
                </div>
              )}
              {hints && (
                <div className={ui("hint")}>
                  <strong>Workbench tip</strong>
                  <p>
                    Start with B650, Ryzen 5 7600, and DDR5 memory. Add a
                    cooler, drive, and PSU before powering on.
                  </p>
                  <Link to="/guide#socket">What is a CPU socket? →</Link>
                </div>
              )}
            </Panel>
          )}
          <Panel title="Installed components" collapsible>
            {Object.entries(state.installed).length ? (
              Object.entries(state.installed).map(([cat, id]) => (
                <div className={ui("installed-row")} key={cat}>
                  <span>
                    <small>{cat.toUpperCase()}</small>
                    {byId[id!].name}
                  </span>
                  <button
                    className={ui("icon-button")}
                    title={`Remove ${cat}`}
                    aria-label={`Remove ${cat}`}
                    onClick={() => state.remove(cat as Category)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            ) : (
              <p className={ui("panel-description")}>
                Your case is empty. Every build starts with one component.
              </p>
            )}
          </Panel>
        </div>
      </div>
      <Panel
        title={state.post ? "POST diagnostic report" : "Build diagnostics"}
        className={ui("diagnostic-panel")}
      >
        <div className={ui("diagnostic-grid")}>
          {state.post && (
            <div className={ui("post-console")}>
              <div className={ui("eyebrow")}>LAB BIOS / DETERMINISTIC POST</div>
              {state.post.checks.map((c) => (
                <div key={c.label}>
                  <span className={ui(c.passed ? "text-cyan" : "text-amber")}>
                    {c.passed ? "[ PASS ]" : "[ FAIL ]"}
                  </span>{" "}
                  {c.label}
                </div>
              ))}
              <strong
                className={ui(state.post.success ? "text-cyan" : "text-amber")}
              >
                {state.post.success
                  ? "BOOT SUCCESSFUL · Simulated desktop ready"
                  : "BOOT HALTED · Resolve the checks above"}
              </strong>
            </div>
          )}
          <div className={ui("diagnostic-list")}>
            {(state.post?.diagnostics || diagnostics).map((d) => (
              <div className={ui(`diagnostic ${d.severity}`)} key={d.code}>
                {d.severity === "valid" ? (
                  <CheckCircle2 size={17} />
                ) : d.severity === "error" ? (
                  <AlertTriangle size={17} />
                ) : (
                  <Info size={17} />
                )}
                <div>
                  <strong>{d.title}</strong>
                  <p>{d.explanation}</p>
                </div>
                <span>{d.severity}</span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
      <SoftwareWorkbench />
      <p className={ui("muted-note")}>
        Educational models and estimated power budgets. Cabling, firmware
        versions and thermal paste are abstracted. Software deployment is a
        guided simulation, not operating system emulation.
      </p>
    </div>
  );
}
