import { ui } from "../../styles/ui";
import { useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { PageHeading } from "../../components/ui/Shared";
import { lessons as basics } from "./content";
import { ccnaLessons } from "./ccna";
import NetworkVisuals from "./NetworkVisuals";
import { softwareLessons } from "./softwareContent";
const lessons = [...basics, ...softwareLessons, ...ccnaLessons];
export default function LearningGuide() {
  const [query, setQuery] = useState("");
  return (
    <div className={ui("page")}>
      <PageHeading
        eyebrow="THE FIELD NOTES"
        title="Understand what you’re building."
        description="Short explanations for the concepts you’ll encounter in your lab."
      />
      <NetworkVisuals />
      <p className="text-sm text-lab-muted mb-5">
        CCNA study field notes covering the six domains of{" "}
        <a
          className="text-lab-accent underline"
          href="https://learningnetwork.cisco.com/s/ccna-exam-topics"
          target="_blank"
          rel="noreferrer"
        >
          Cisco?s official CCNA exam outline
        </a>
        . These introductory lessons complement hands-on study; they are not a
        complete exam course. Each note identifies which behaviors the lab
        simulates.
      </p>
      <label className={ui("search-field")}>
        <Search size={16} />
        <input
          aria-label="Search learning guide"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search sockets, subnets, power…"
        />
      </label>
      <div className={ui("lesson-grid")}>
        {lessons
          .filter((l) =>
            `${l.title} ${l.text}`.toLowerCase().includes(query.toLowerCase()),
          )
          .map((l) => (
            <article className={ui("panel lesson")} id={l.id} key={l.id}>
              <div className={ui("eyebrow")}>
                <BookOpen size={13} />
                {l.group}
              </div>
              <h2>{l.title}</h2>
              <p>{l.text}</p>
              <div className={ui("hint")}>{l.tip}</div>
            </article>
          ))}
      </div>
      {!lessons.some((l) =>
        `${l.title} ${l.text}`.toLowerCase().includes(query.toLowerCase()),
      ) && (
        <p className={ui("empty-state")}>
          No matching field notes. Try a different term.
        </p>
      )}
    </div>
  );
}
