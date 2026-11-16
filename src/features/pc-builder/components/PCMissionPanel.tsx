import { useState } from "react";
import { Panel, CheckItem } from "../../../components/ui/Shared";
import { ui } from "../../../styles/ui";
import {
  pcMissions,
  pcMissionChecks,
  type PCMissionId,
} from "../data/missions";
import { usePCStore } from "../store/usePCStore";
export default function PCMissionPanel() {
  const s = usePCStore(),
    [choice, setChoice] = useState<PCMissionId>(s.mission ?? "office"),
    [confirm, setConfirm] = useState(false);
  const mission = pcMissions.find((m) => m.id === s.mission),
    checks = s.mission
      ? pcMissionChecks(s.mission, s.installed, !!s.post?.success)
      : [];
  return (
    <Panel title="Workplace deployment tickets">
      <div className="flex flex-wrap gap-3 items-end">
        <label className={ui("form-field")}>
          Choose difficulty
          <select
            value={choice}
            onChange={(e) => {
              setChoice(e.target.value as PCMissionId);
              setConfirm(false);
            }}
          >
            {pcMissions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.difficulty} · {m.title}
              </option>
            ))}
          </select>
        </label>
        <button
          className={ui("button secondary")}
          onClick={() => {
            if (Object.keys(s.installed).length && !confirm) {
              setConfirm(true);
              return;
            }
            s.startMission(choice);
            setConfirm(false);
          }}
        >
          {confirm ? "Replace build and start" : "Start PC ticket"}
        </button>
        {confirm && (
          <button
            className={ui("button ghost")}
            onClick={() => setConfirm(false)}
          >
            Cancel
          </button>
        )}
      </div>
      {mission && (
        <div className="mt-4">
          <span className={ui("mission-badge")}>
            {mission.difficulty} / SERVICE DESK
          </span>
          <h3>{mission.title}</h3>
          <p className="text-lab-muted my-3">{mission.brief}</p>
          <div className="grid gap-2 md:grid-cols-2">
            {checks.map((c) => (
              <CheckItem key={c.label} done={c.done}>
                {c.label}
              </CheckItem>
            ))}
          </div>
          {checks.every((c) => c.done) && (
            <p className="text-lab-accent mt-3" role="status">
              Hardware ticket resolved. Continue software deployment below.
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}
