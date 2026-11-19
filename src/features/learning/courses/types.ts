export type Quiz = {
  question: string;
  choices: { label: string; explanation: string }[];
  answer: number;
};
export type Lesson = {
  id: string;
  title: string;
  objective: string;
  concepts: string[];
  visual: {
    kind: "flow" | "socket" | "memory" | "subnet";
    caption: string;
    steps: { label: string; detail: string }[];
  };
  example: string;
  practice: {
    label: string;
    route: "/pc-builder" | "/network-lab";
    steps: string[];
  };
  quiz: Quiz;
  summary: string;
};
export type Course = {
  id: string;
  title: string;
  description: string;
  outcome: string;
  lessons: Lesson[];
};
