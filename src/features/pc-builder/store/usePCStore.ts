import { create } from "zustand";
import { byId, type Build, type Category } from "../data/hardware";
import { installationIssues, runPost } from "../engine/compatibility";
import { pcScenario, type PCMissionId } from "../data/missions";
import {
  freshSoftware,
  softwareTransition,
  softwareAfterHardwareChange,
  type SoftwareState,
  type SoftwareAction,
} from "../engine/software";
type PCState = {
  software: SoftwareState;
  softwareAction: (action: SoftwareAction) => void;
  mission: PCMissionId | null;
  startMission: (id: PCMissionId) => void;
  selectedId: string | null;
  installed: Build;
  message: string;
  post: ReturnType<typeof runPost> | null;
  select: (id: string) => void;
  install: () => void;
  remove: (category: Category) => void;
  power: () => void;
  reset: () => void;
};
export const usePCStore = create<PCState>((set, get) => ({
  software: freshSoftware(),
  softwareAction: (action) =>
    set((s) => ({
      software: softwareTransition(s.software, action, s.installed),
      ...(action.type === "boot" ? { post: runPost(s.installed) } : {}),
    })),
  mission: null,
  startMission: (id) =>
    set({
      mission: id,
      installed: pcScenario(id),
      software: freshSoftware(),
      selectedId: null,
      post: null,
      message:
        "Workplace ticket loaded. Inspect the requirements and diagnose the build.",
    }),
  selectedId: null,
  installed: {},
  message: "Select a motherboard to start your build.",
  post: null,
  select: (id) => {
    if (byId[id])
      set({
        selectedId: id,
        message: `${byId[id].name} selected. Inspect the specs, then click its highlighted installation target.`,
      });
  },
  install: () => {
    const { selectedId, installed } = get();
    if (!selectedId) return;
    const part = byId[selectedId];
    const issues = installationIssues(installed, part);
    if (issues.length) {
      set({ message: `${issues[0].title}. ${issues[0].explanation}` });
      return;
    }
    const next = { ...installed, [part.category]: part.id };
    set({
      installed: next,
      software: softwareAfterHardwareChange(get().software, installed, next),
      selectedId: null,
      post: null,
      message: `${part.name} installed. Select your next component.`,
    });
  },
  remove: (category) => {
    const installed = { ...get().installed };
    delete installed[category];
    if (category === "motherboard") {
      delete installed.cpu;
      delete installed.cooler;
      delete installed.ram;
      delete installed.gpu;
    }
    if (category === "cpu") delete installed.cooler;
    set({
      installed,
      software: softwareAfterHardwareChange(
        get().software,
        get().installed,
        installed,
      ),
      post: null,
      message:
        category === "motherboard"
          ? "Motherboard and attached CPU, cooler, RAM, and graphics returned to inventory."
          : `${category.toUpperCase()} removed${category === "cpu" ? " with its cooler" : ""}.`,
    });
  },
  power: () =>
    set({
      post: runPost(get().installed),
      software: softwareTransition(
        get().software,
        { type: "boot" },
        get().installed,
      ),
      message: "POST complete. Review the diagnostic report.",
    }),
  reset: () =>
    set({
      mission: null,
      installed: {},
      software: freshSoftware(),
      selectedId: null,
      post: null,
      message: "Workbench reset. Select a motherboard to begin.",
    }),
}));
