import { useState } from "react";
import { ui } from "../../../styles/ui";
import type { Lesson } from "../courses/types";
import { useLearningProgress } from "../hooks/useLearningProgress";
export default function KnowledgeCheck({ lesson }: { lesson: Lesson }) {
  const [choice, setChoice] = useState<number | null>(null);
  const progress = useLearningProgress();
  const correct = choice === lesson.quiz.answer;
  return (
    <section
      aria-labelledby="knowledge-title"
      className="rounded-lg border border-lab-border bg-lab-bg p-5 sm:p-6"
    >
      <h3 id="knowledge-title" className="text-lg font-semibold mb-4">
        06 / Knowledge check
      </h3>
      <fieldset>
        <legend className="text-base mb-4">{lesson.quiz.question}</legend>
        <div className="space-y-3">
          {lesson.quiz.choices.map((option, index) => (
            <label
              key={option.label}
              className={`flex cursor-pointer items-start gap-3 rounded border p-4 text-sm leading-6 ${choice === index ? "border-lab-accent bg-cyan-950/30" : "border-lab-border hover:bg-white/5"}`}
            >
              <input
                className="mt-1.5"
                type="radio"
                name={`question-${lesson.id}`}
                checked={choice === index}
                disabled={choice !== null}
                onChange={() => {
                  setChoice(index);
                  progress.answer(lesson.id, index);
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      {choice !== null && (
        <div className="mt-4" role="status">
          <strong className={correct ? "text-lab-accent" : "text-amber-300"}>
            {correct ? "Correct." : "Not quite."}
          </strong>
          <p className="text-sm leading-7 mt-1">
            {lesson.quiz.choices[choice].explanation}
          </p>
          <button
            className={ui("button ghost mt-3")}
            onClick={() => setChoice(null)}
          >
            Try again
          </button>
        </div>
      )}
      {choice === null && progress.passed.includes(lesson.id) && (
        <p className="mt-3 text-xs text-lab-accent">
          You have passed this check before. You can practice it again.
        </p>
      )}
    </section>
  );
}
