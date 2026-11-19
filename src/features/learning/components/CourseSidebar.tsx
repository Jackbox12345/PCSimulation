import { Link } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";
import { courses } from "../courses/catalog";
import { useLearningProgress } from "../hooks/useLearningProgress";
export function ProgressIndicator({
  ids,
  label,
}: {
  ids: string[];
  label: string;
}) {
  const completed = useLearningProgress((s) => s.completed);
  const count = ids.filter((id) => completed.includes(id)).length;
  return (
    <div>
      <div className="flex justify-between gap-2 text-xs text-lab-muted mb-2">
        <span>{label}</span>
        <span>
          {count} / {ids.length} completed
        </span>
      </div>
      <progress
        className="block w-full h-1.5 appearance-none overflow-hidden rounded bg-lab-border [&::-webkit-progress-bar]:bg-lab-border [&::-webkit-progress-value]:bg-lab-accent [&::-moz-progress-bar]:bg-lab-accent"
        aria-label={label}
        max={ids.length || 1}
        value={count}
      />
    </div>
  );
}
export default function CourseSidebar({ current }: { current?: string }) {
  const completed = useLearningProgress((s) => s.completed);
  return (
    <nav
      aria-label="Course lessons"
      className="rounded-lg border border-lab-border bg-lab-panel p-4 lg:sticky lg:top-5 lg:max-h-[85vh] lg:overflow-y-auto"
    >
      <p className="text-xs font-mono text-lab-accent mb-4">
        YOUR LEARNING PATH
      </p>
      {courses.map((course, index) => (
        <details
          key={course.id}
          open={course.lessons.some((l) => l.id === current) || undefined}
          className="border-t border-lab-border py-4"
        >
          <summary className="cursor-pointer text-sm font-semibold leading-6">
            {index + 1}. {course.title}
          </summary>
          <div className="mt-4">
            <ProgressIndicator
              ids={course.lessons.map((l) => l.id)}
              label="Course progress"
            />
            <ol className="mt-4 space-y-1">
              {course.lessons.map((lesson, i) => (
                <li key={lesson.id}>
                  <Link
                    to={`/guide?lesson=${lesson.id}`}
                    aria-current={current === lesson.id ? "step" : undefined}
                    className={`flex items-start gap-2 rounded p-2.5 text-xs leading-5 ${current === lesson.id ? "bg-cyan-950/40 text-lab-accent" : "text-lab-muted hover:text-white hover:bg-white/5"}`}
                  >
                    {completed.includes(lesson.id) ? (
                      <CheckCircle2
                        size={14}
                        className="shrink-0 mt-1 text-lab-accent"
                        aria-label="Completed"
                      />
                    ) : (
                      <Circle size={14} className="shrink-0 mt-1" />
                    )}
                    <span>
                      {i + 1}. {lesson.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </details>
      ))}
    </nav>
  );
}
