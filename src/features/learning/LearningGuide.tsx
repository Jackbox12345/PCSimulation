import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CircuitBoard,
  Network,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { PageHeading } from "../../components/ui/Shared";
import { ui } from "../../styles/ui";
import { courses, lessonById, lessonAliases } from "./courses/catalog";
import { useLearningProgress } from "./hooks/useLearningProgress";
import CourseSidebar, { ProgressIndicator } from "./components/CourseSidebar";
import LessonViewer from "./components/LessonViewer";
import ReferenceLibrary from "./components/ReferenceLibrary";
import NetworkVisuals from "./NetworkVisuals";

export default function LearningGuide() {
  const location = useLocation(),
    navigate = useNavigate(),
    [params] = useSearchParams();
  const progress = useLearningProgress();
  const [sidebar, setSidebar] = useState(true),
    [confirmReset, setConfirmReset] = useState(false);
  const [search, setSearch] = useState({ key: "", text: "" });
  const query = search.key === location.key ? search.text.trim() : "";
  const hash = location.hash.slice(1),
    id = params.get("lesson") ?? lessonAliases[hash] ?? hash;
  const selected =
    id && Object.hasOwn(lessonById, id) ? lessonById[id] : undefined;
  const course = selected
    ? courses.find((c) => c.lessons.some((l) => l.id === selected.id))
    : undefined;
  const view =
    params.get("view") ?? (hash && !selected ? "reference" : "courses");
  const resume = progress.current ? lessonById[progress.current] : undefined;
  return (
    <div className={ui("page")}>
      <PageHeading
        eyebrow="LEARNING GUIDE / BEGINNER COURSES"
        title="Learn it. Try it. Build it."
        description="Short lessons, hands-on explanations, and a clear path from your first component to your first network."
      />
      <div
        className="flex flex-wrap gap-2 mb-5"
        role="group"
        aria-label="Learning sections"
      >
        <button
          className={ui(
            `button ${!selected && view === "courses" ? "primary" : "secondary"}`,
          )}
          onClick={() => navigate("/guide")}
        >
          Courses
        </button>
        <button
          className={ui(
            `button ${view === "reference" ? "primary" : "secondary"}`,
          )}
          onClick={() => navigate("/guide?view=reference")}
        >
          Reference library
        </button>
        <button
          className={ui(
            `button ${view === "visuals" ? "primary" : "secondary"}`,
          )}
          onClick={() => navigate("/guide?view=visuals")}
        >
          Visual walkthroughs
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <label className={ui("search-field !mb-0")}>
          <Search size={16} />
          <input
            aria-label="Search learning guide"
            placeholder="Find a lesson or field note..."
            value={search.key === location.key ? search.text : ""}
            onChange={(e) =>
              setSearch({ key: location.key, text: e.target.value })
            }
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-lab-muted">
          <input
            type="checkbox"
            checked={progress.remember}
            onChange={(e) => progress.setRemember(e.target.checked)}
          />
          Remember learning progress on this browser
        </label>
      </div>
      <div className="flex flex-wrap justify-between gap-2 text-xs text-lab-muted mb-5">
        <span>
          {progress.remember
            ? "Progress saves locally; no account is needed."
            : "Progress is session-only. Enable local saving to resume after a reload."}
        </span>
        <button
          className="underline hover:text-white"
          onClick={() => setConfirmReset(true)}
        >
          Reset learning progress
        </button>
      </div>
      {progress.storageNotice && (
        <p role="status" className="text-amber-300 text-sm mb-4">
          {progress.storageNotice}
        </p>
      )}
      {confirmReset && (
        <div className={ui("confirm-bar")} role="alert">
          Clear completed lessons, knowledge checks, and the saved current
          lesson?
          <button
            className={ui("button danger")}
            onClick={() => {
              progress.reset();
              setConfirmReset(false);
              navigate("/guide");
            }}
          >
            Confirm reset progress
          </button>
          <button
            className={ui("button ghost")}
            onClick={() => setConfirmReset(false)}
          >
            Cancel
          </button>
        </div>
      )}
      {query ? (
        <ReferenceLibrary query={query} />
      ) : selected && course ? (
        <>
          <button
            className={ui("button ghost mb-4")}
            aria-expanded={sidebar}
            aria-controls="lesson-sidebar"
            onClick={() => setSidebar(!sidebar)}
          >
            {sidebar ? (
              <PanelLeftClose size={16} />
            ) : (
              <PanelLeftOpen size={16} />
            )}{" "}
            {sidebar ? "Hide course navigation" : "Show course navigation"}
          </button>
          <div
            className={
              sidebar
                ? "grid items-start gap-5 xl:grid-cols-[260px_minmax(0,1fr)]"
                : "min-w-0"
            }
          >
            {sidebar && (
              <aside id="lesson-sidebar">
                <CourseSidebar key={course.id} current={selected.id} />
              </aside>
            )}
            <LessonViewer key={selected.id} course={course} lesson={selected} />
          </div>
        </>
      ) : params.has("lesson") ? (
        <div className={ui("empty-state")}>
          This lesson could not be found.{" "}
          <Link className="underline" to="/guide">
            Back to Courses
          </Link>
        </div>
      ) : view === "visuals" ? (
        <NetworkVisuals />
      ) : view === "reference" ? (
        <ReferenceLibrary />
      ) : (
        <>
          <section className="rounded-lg border border-lab-border bg-lab-panel p-5 sm:p-7 mb-6">
            <div className="flex items-start gap-4">
              <BookOpen className="shrink-0 text-lab-accent mt-1" />
              <div>
                <span className="text-xs font-mono text-lab-accent">
                  START HERE / NO EXPERIENCE NEEDED
                </span>
                <h2 className="text-xl font-semibold my-3">
                  A small lesson. A practical next step.
                </h2>
                <p className="text-sm leading-7 text-[#b8c7d5] max-w-3xl">
                  Choose a beginner course. Explore the diagram, answer a
                  knowledge check, and practice in your existing simulator
                  workspace. You decide when a lesson is complete; opening a
                  page never adds progress.
                </p>
                {resume && (
                  <Link
                    className={ui("button secondary mt-4")}
                    to={`/guide?lesson=${resume.id}`}
                  >
                    Resume: {resume.title}
                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </div>
          </section>
          <div className="grid gap-5 lg:grid-cols-2">
            {courses.map((c, i) => {
              const Icon = i === 0 ? CircuitBoard : Network;
              const next =
                c.lessons.find((l) => !progress.completed.includes(l.id)) ??
                c.lessons[0];
              return (
                <article
                  className="rounded-lg border border-lab-border bg-lab-panel p-6"
                  key={c.id}
                >
                  <div className="flex items-center justify-between mb-5">
                    <Icon size={28} className="text-lab-accent" />
                    <span className="text-xs font-mono text-lab-muted">
                      COURSE {i + 1} / BEGINNER
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold mb-3">{c.title}</h2>
                  <p className="text-sm leading-7 text-[#b8c7d5] mb-4">
                    {c.description}
                  </p>
                  <p className="text-xs leading-6 text-lab-muted mb-5">
                    By the end: {c.outcome}
                  </p>
                  <ProgressIndicator
                    ids={c.lessons.map((l) => l.id)}
                    label="Course completion"
                  />
                  <Link
                    className={ui("button primary mt-5")}
                    to={`/guide?lesson=${next.id}`}
                  >
                    {progress.completed.some((id) =>
                      c.lessons.some((l) => l.id === id),
                    )
                      ? "Continue course"
                      : "Start course"}
                    <ArrowRight size={15} />
                  </Link>
                  <details className="mt-5 border-t border-lab-border pt-4">
                    <summary className="cursor-pointer text-sm">
                      View {c.lessons.length} lessons
                    </summary>
                    <ol className="mt-3 space-y-2 list-decimal pl-5 text-sm leading-6">
                      {c.lessons.map((l) => (
                        <li key={l.id}>
                          <Link
                            className="text-lab-muted underline decoration-lab-border hover:text-lab-accent"
                            to={`/guide?lesson=${l.id}`}
                          >
                            {l.title}
                          </Link>
                        </li>
                      ))}
                    </ol>
                  </details>
                </article>
              );
            })}
          </div>
          <p className="text-xs text-lab-muted mt-5">
            Already know the basics? Open the reference library for software
            deployment and CCNA field notes, or use the visual walkthroughs for
            OSI and subnet exploration.
          </p>
        </>
      )}
    </div>
  );
}
