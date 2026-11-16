import { it, expect } from "vitest";
import { pcScenario, pcMissionChecks } from "../data/missions";
import { usePCStore } from "../store/usePCStore";
const office = {
  motherboard: "b650",
  cpu: "r7600",
  ram: "ddr5",
  cooler: "tower",
  storage: "nvme",
  psu: "psu550",
};
it("requires actual boot and deployment constraints for easy and medium tickets", () => {
  expect(pcMissionChecks("office", office, false).every((c) => c.done)).toBe(
    false,
  );
  expect(pcMissionChecks("office", office, true).every((c) => c.done)).toBe(
    true,
  );
  expect(pcMissionChecks("cad", office, true).every((c) => c.done)).toBe(false);
  expect(
    pcMissionChecks("cad", { ...office, gpu: "rtx4060" }, true).every(
      (c) => c.done,
    ),
  ).toBe(true);
});
it("repairs the hard ticket incrementally through the real installation store", () => {
  usePCStore.getState().startMission("repair");
  usePCStore.getState().power();
  expect(usePCStore.getState().post?.success).toBe(false);
  for (const id of ["psu850", "ddr5", "dual"]) {
    usePCStore.getState().select(id);
    usePCStore.getState().install();
  }
  usePCStore.getState().power();
  const s = usePCStore.getState();
  expect(
    pcMissionChecks("repair", s.installed, !!s.post?.success).every(
      (c) => c.done,
    ),
  ).toBe(true);
  s.remove("ram");
  expect(
    pcMissionChecks(
      "repair",
      usePCStore.getState().installed,
      !!usePCStore.getState().post?.success,
    ).every((c) => c.done),
  ).toBe(false);
});
it("cannot resolve a render ticket by downgrading its compute capacity", () => {
  expect(
    pcMissionChecks("repair", { ...office, gpu: "rtx4060" }, true).every(
      (c) => c.done,
    ),
  ).toBe(false);
  expect(
    pcMissionChecks("repair", pcScenario("repair"), true).every((c) => c.done),
  ).toBe(false);
});
