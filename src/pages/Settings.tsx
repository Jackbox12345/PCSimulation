import { ui } from "../styles/ui";
import { PageHeading, Panel } from "../components/ui/Shared";
import { usePreferences } from "../utils/preferences";
export default function Settings() {
  const p = usePreferences();
  return (
    <div className={ui("page narrow")}>
      <PageHeading
        eyebrow="MAKE IT YOURS"
        title="Lab settings"
        description="Preferences are saved in this browser when local storage is available."
      />
      <Panel title="Workspace preferences">
        {(
          [
            {
              key: "highQuality",
              title: "High-quality 3D rendering",
              text: "Use device pixel density up to 2×. Turn off for lower-powered devices.",
            },
            {
              key: "reducedMotion",
              title: "Reduce motion",
              text: "Disable installation transitions and interface animations.",
            },
            {
              key: "hints",
              title: "Show instructional hints",
              text: "Display beginner-friendly tips in simulator workspaces.",
            },
          ] as const
        ).map(({ key, title, text }) => (
          <label className={ui("setting-row")} key={key}>
            <span>
              <strong>{title}</strong>
              <p>{text}</p>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={p[key]}
              onChange={(e) => p.update(key, e.target.checked)}
            />
          </label>
        ))}
      </Panel>
      <p className={ui("muted-note")}>
        PC builds stay in memory during this session. Network topologies are
        saved only when you select Save in the Network Lab.
      </p>
    </div>
  );
}
