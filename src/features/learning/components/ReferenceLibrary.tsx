import { Link } from "react-router-dom";
import { useState } from "react";
import { lessons } from "../content";
import { softwareLessons } from "../softwareContent";
import { ccnaLessons } from "../ccna";
import { courseLessons, lessonById, lessonAliases } from "../courses/catalog";
import { ui } from "../../../styles/ui";
const original = [...lessons, ...softwareLessons, ...ccnaLessons];
const references = [
  ...original,
  ...courseLessons
    .filter((l) => !original.some((n) => n.id === l.id))
    .map((l) => ({
      id: l.id,
      title: l.title,
      text: l.objective,
      tip: l.summary,
      group: l.practice.route === "/pc-builder" ? "Hardware" : "Networking",
    })),
];
export default function ReferenceLibrary({ query = "" }: { query?: string }) {
  const [group, setGroup] = useState("all");
  const visible = references.filter((l) =>
    query
      ? `${l.title} ${l.text} ${l.tip} ${l.group}`
          .toLowerCase()
          .includes(query.toLowerCase())
      : group === "all" ||
        (group === "software"
          ? l.group === "Software deployment"
          : group === "advanced"
            ? ccnaLessons.some((c) => c.id === l.id)
            : lessons.some((c) => c.id === l.id)),
  );
  return (
    <section aria-label="Reference library">
      <h2 className="text-xl font-semibold mb-3">
        {query ? "Search results" : "Reference library"}
      </h2>
      <p className="text-sm leading-7 text-lab-muted mb-5">
        {query
          ? `${visible.length} matching lessons and field notes.`
          : "The original hardware, software, and CCNA notes remain available here. Advanced topics are reference material, separate from the beginner courses."}
      </p>
      {!query && (
        <>
          <label className={ui("form-field")}>
            Reference category
            <select value={group} onChange={(e) => setGroup(e.target.value)}>
              <option value="all">All field notes</option>
              <option value="basics">Beginner field notes</option>
              <option value="software">Software setup</option>
              <option value="advanced">CCNA networking · further study</option>
            </select>
          </label>
          <p className="text-xs text-lab-muted mb-5">
            CCNA scope:{" "}
            <a
              className="underline text-lab-accent"
              href="https://learningnetwork.cisco.com/s/ccna-exam-topics"
              target="_blank"
              rel="noreferrer"
            >
              Cisco exam outline
            </a>
            . These notes are not a complete exam course. Unsupported simulation
            features are labeled in each note.
          </p>
        </>
      )}
      <div className="grid gap-4 xl:grid-cols-2">
        {visible.map((l) => {
          const lessonId = lessonAliases[l.id] ?? l.id;
          return (
            <article
              className="rounded-lg border border-lab-border bg-lab-panel p-5"
              key={l.id}
            >
              <span className="text-xs text-lab-accent">{l.group}</span>
              <h3 className="text-lg font-semibold mt-2 mb-3">{l.title}</h3>
              <p className="text-sm leading-7 text-[#b8c7d5]">{l.text}</p>
              <div className={ui("hint mt-4")}>{l.tip}</div>
              {Object.hasOwn(lessonById, lessonId) && (
                <Link
                  className={ui("button secondary mt-4")}
                  to={`/guide?lesson=${lessonId}`}
                >
                  Open guided lesson
                </Link>
              )}
            </article>
          );
        })}
      </div>
      {!visible.length && (
        <p className={ui("empty-state")}>
          No matching field notes. Try a different term.
        </p>
      )}
    </section>
  );
}
