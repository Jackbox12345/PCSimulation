import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import type { Course, Lesson } from "../courses/types";
import { useLearningProgress } from "../hooks/useLearningProgress";
import { ui } from "../../../styles/ui";
import InteractiveDiagram from "./InteractiveDiagram";
import KnowledgeCheck from "./KnowledgeCheck";
import { ProgressIndicator } from "./CourseSidebar";
export default function LessonViewer({
  course,
  lesson,
}: {
  course: Course;
  lesson: Lesson;
}) {
  const progress = useLearningProgress(),
    heading = useRef<HTMLHeadingElement>(null);
  const visit = progress.visit;
  const index = course.lessons.findIndex((l) => l.id === lesson.id),
    passed = progress.passed.includes(lesson.id),
    completed = progress.completed.includes(lesson.id);
  useEffect(() => {
    visit(lesson.id);
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start" });
  }, [lesson.id, visit]);
  return (
    <article className="min-w-0 rounded-lg border border-lab-border bg-lab-panel p-5 sm:p-8">
      <div className="flex flex-wrap justify-between gap-3 mb-5 text-xs text-lab-muted">
        <span>{course.title}</span>
        <span>
          Lesson {index + 1} of {course.lessons.length}
        </span>
      </div>
      <ProgressIndicator
        ids={course.lessons.map((l) => l.id)}
        label="Completed lessons"
      />
      <h2
        ref={heading}
        tabIndex={-1}
        className="text-2xl sm:text-3xl font-semibold mt-7 mb-6 scroll-mt-6 outline-none"
      >
        {lesson.title}
      </h2>
      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-semibold mb-3">
            01 / What you will learn
          </h3>
          <p className="text-base leading-8 text-[#b8c7d5] max-w-3xl">
            {lesson.objective}
          </p>
        </section>
        <section>
          <h3 className="text-lg font-semibold mb-3">
            02 / Understand the concept
          </h3>
          <div className="space-y-4 max-w-3xl">
            {lesson.concepts.map((text) => (
              <p key={text} className="text-base leading-8 text-[#b8c7d5]">
                {text}
              </p>
            ))}
          </div>
        </section>
        <section>
          <h3 className="text-lg font-semibold mb-4">03 / Explore the idea</h3>
          <InteractiveDiagram key={lesson.id} visual={lesson.visual} />
        </section>
        <section className="border-l-2 border-lab-accent pl-5">
          <h3 className="text-lg font-semibold mb-3">
            04 / A practical example
          </h3>
          <p className="text-base leading-8 text-[#b8c7d5]">{lesson.example}</p>
        </section>
        <section>
          <h3 className="text-lg font-semibold mb-3">05 / Try it yourself</h3>
          <ol className="list-decimal pl-5 space-y-3 text-sm leading-7 text-[#b8c7d5]">
            {lesson.practice.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <Link
            className={ui("button secondary mt-5")}
            to={lesson.practice.route}
          >
            {lesson.practice.label}
            <ExternalLink size={14} />
          </Link>
          <p className="text-xs text-lab-muted mt-3">
            Opens your existing workspace without replacing its configuration.
            Return to the guide to continue this lesson.
          </p>
        </section>
        <KnowledgeCheck key={lesson.id} lesson={lesson} />
        <section>
          <h3 className="text-lg font-semibold mb-3">07 / Take it with you</h3>
          <p className="text-base leading-8 text-[#b8c7d5]">{lesson.summary}</p>
          <button
            className={ui("button primary mt-5")}
            disabled={!passed || completed}
            onClick={() => progress.complete(lesson.id)}
          >
            {completed ? "Lesson completed" : "Mark lesson complete"}
          </button>
          <p className="text-xs text-lab-muted mt-3" role="status">
            {completed
              ? "Your completion is recorded. Revisit the lesson whenever you need."
              : passed
                ? "Knowledge check passed. Mark complete when you have reviewed the lesson."
                : "Answer the knowledge check correctly to unlock completion."}
          </p>
        </section>
      </div>
      <nav
        aria-label="Lesson navigation"
        className="flex flex-wrap justify-between gap-3 border-t border-lab-border pt-5 mt-8"
      >
        {index > 0 ? (
          <Link
            className={ui("button ghost")}
            to={`/guide?lesson=${course.lessons[index - 1].id}`}
          >
            <ArrowLeft size={14} />
            Previous Lesson
          </Link>
        ) : (
          <span className="text-xs self-center text-lab-muted">
            First lesson
          </span>
        )}
        <Link className={ui("button ghost")} to="/guide">
          Back to Courses
        </Link>
        {index < course.lessons.length - 1 ? (
          <Link
            className={ui("button secondary")}
            to={`/guide?lesson=${course.lessons[index + 1].id}`}
          >
            Next Lesson
            <ArrowRight size={14} />
          </Link>
        ) : (
          <Link className={ui("button secondary")} to="/guide">
            Explore another course
            <ArrowRight size={14} />
          </Link>
        )}
      </nav>
    </article>
  );
}
