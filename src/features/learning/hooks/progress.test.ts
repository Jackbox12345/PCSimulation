import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { courses, courseLessons } from "../courses/catalog";
import {
  decodeProgress,
  emptyProgress,
  useLearningProgress,
  progressKey,
} from "./useLearningProgress";
beforeEach(() => {
  const data = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => data.set(k, v),
    removeItem: (k: string) => data.delete(k),
  });
  useLearningProgress.setState({ ...emptyProgress(), storageNotice: "" });
});
afterEach(() => vi.unstubAllGlobals());
describe("Learning completion and persistence", () => {
  it("records only correct checks and requires an explicit completion action", () => {
    const lesson = courseLessons[0],
      s = useLearningProgress.getState();
    s.visit(lesson.id);
    s.complete(lesson.id);
    expect(useLearningProgress.getState().completed).toEqual([]);
    s.answer(lesson.id, 1 - lesson.quiz.answer);
    expect(useLearningProgress.getState().passed).toEqual([]);
    s.answer(lesson.id, lesson.quiz.answer);
    expect(useLearningProgress.getState().completed).toEqual([]);
    s.complete(lesson.id);
    s.complete(lesson.id);
    expect(useLearningProgress.getState().completed).toEqual([lesson.id]);
    expect(localStorage.getItem(progressKey)).toBeNull();
  });
  it("saves validated actual progress when opted in and removes the save when opted out", () => {
    const s = useLearningProgress.getState();
    s.setRemember(true);
    s.visit("socket");
    s.answer("socket", 0);
    s.complete("socket");
    const decoded = decodeProgress(localStorage.getItem(progressKey)!);
    expect(decoded).toMatchObject({
      completed: ["socket"],
      passed: ["socket"],
      current: "socket",
      remember: true,
    });
    s.setRemember(false);
    expect(localStorage.getItem(progressKey)).toBeNull();
    expect(useLearningProgress.getState().completed).toEqual(["socket"]);
  });
  it("rejects malformed, unsupported and fabricated completion data", () => {
    for (const value of [
      "{",
      JSON.stringify({ version: 2 }),
      JSON.stringify({
        version: 1,
        remember: true,
        completed: ["socket"],
        passed: [],
        current: null,
      }),
      JSON.stringify({
        version: 1,
        remember: true,
        completed: [],
        passed: ["__proto__"],
        current: null,
      }),
    ])
      expect(() => decodeProgress(value)).toThrow();
  });
  it("resets saved completion and current lesson and handles unavailable storage", () => {
    const s = useLearningProgress.getState();
    s.setRemember(true);
    s.visit("memory");
    s.answer("memory", 1);
    s.complete("memory");
    s.reset();
    expect(decodeProgress(localStorage.getItem(progressKey)!)).toMatchObject({
      completed: [],
      passed: [],
      current: null,
    });
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("disabled");
      },
      removeItem: () => {
        throw new Error("disabled");
      },
    });
    s.visit("ip");
    expect(useLearningProgress.getState().current).toBe("ip");
    expect(useLearningProgress.getState().storageNotice).toContain(
      "unavailable",
    );
  });
  it("provides complete beginner lessons with valid questions and supported practice routes", () => {
    expect(courses.map((c) => c.lessons.length)).toEqual([8, 8]);
    expect(new Set(courseLessons.map((l) => l.id)).size).toBe(16);
    for (const l of courseLessons) {
      expect(l.objective.length).toBeGreaterThan(20);
      expect(l.concepts.length).toBeGreaterThan(1);
      expect(l.example.length).toBeGreaterThan(20);
      expect(l.practice.steps.length).toBeGreaterThan(1);
      expect(["/pc-builder", "/network-lab"]).toContain(l.practice.route);
      expect(l.quiz.choices[l.quiz.answer]).toBeDefined();
      expect(l.quiz.choices.every((c) => c.explanation.length > 20)).toBe(true);
      expect(
        l.visual.kind === "flow"
          ? l.visual.steps.length > 1
          : !!l.visual.caption,
      ).toBe(true);
    }
  });
});
