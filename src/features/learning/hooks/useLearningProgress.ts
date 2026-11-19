import { create } from "zustand";
import { lessonById } from "../courses/catalog";
export type LearningProgress = {
  completed: string[];
  passed: string[];
  current: string | null;
  remember: boolean;
};
export const emptyProgress = (): LearningProgress => ({
  completed: [],
  passed: [],
  current: null,
  remember: false,
});
export const progressKey = "itlab.learning.v1";
export function decodeProgress(raw: string): LearningProgress {
  if (raw.length > 20000) throw new Error("Progress data is too large.");
  const v = JSON.parse(raw);
  const validIds = (ids: unknown): ids is string[] =>
    Array.isArray(ids) &&
    ids.length <= Object.keys(lessonById).length &&
    ids.every((id) => typeof id === "string" && Object.hasOwn(lessonById, id));
  if (
    v?.version !== 1 ||
    v.remember !== true ||
    !validIds(v.completed) ||
    !validIds(v.passed) ||
    (v.current !== null &&
      (typeof v.current !== "string" ||
        !Object.hasOwn(lessonById, v.current))) ||
    !v.completed.every((id: string) => v.passed.includes(id))
  )
    throw new Error("Invalid saved learning progress.");
  return {
    remember: true,
    current: v.current,
    completed: [...new Set<string>(v.completed)],
    passed: [...new Set<string>(v.passed)],
  };
}
function read() {
  try {
    const raw = localStorage.getItem(progressKey);
    return raw ? decodeProgress(raw) : emptyProgress();
  } catch {
    return emptyProgress();
  }
}
type State = LearningProgress & {
  storageNotice: string;
  visit: (id: string) => void;
  answer: (id: string, index: number) => void;
  complete: (id: string) => void;
  setRemember: (enabled: boolean) => void;
  reset: () => void;
};
export const useLearningProgress = create<State>((set, get) => {
  const commit = (patch: Partial<LearningProgress>) => {
    const { completed, passed, current, remember } = { ...get(), ...patch };
    let storageNotice = "";
    try {
      if (remember)
        localStorage.setItem(
          progressKey,
          JSON.stringify({ version: 1, completed, passed, current, remember }),
        );
      else localStorage.removeItem(progressKey);
    } catch {
      storageNotice =
        "Browser storage is unavailable. Progress works for this session, but saved changes could not be confirmed.";
    }
    set({ completed, passed, current, remember, storageNotice });
  };
  return {
    ...read(),
    storageNotice: "",
    visit: (id) => {
      if (Object.hasOwn(lessonById, id)) commit({ current: id });
    },
    answer: (id, index) => {
      if (Object.hasOwn(lessonById, id) && lessonById[id].quiz.answer === index)
        commit({ passed: [...new Set([...get().passed, id])] });
    },
    complete: (id) => {
      if (get().passed.includes(id))
        commit({ completed: [...new Set([...get().completed, id])] });
    },
    setRemember: (remember) => commit({ remember }),
    reset: () => commit({ ...emptyProgress(), remember: get().remember }),
  };
});
