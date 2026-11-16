import { describe, it, expect, beforeEach } from "vitest";
import { validateBuild, installationIssues, runPost } from "./compatibility";
import { byId, type Build } from "../data/hardware";
import { usePCStore } from "../store/usePCStore";
const valid: Build = {
  motherboard: "b650",
  cpu: "r7600",
  cooler: "tower",
  ram: "ddr5",
  storage: "nvme",
  psu: "psu550",
};
describe("PC compatibility and mission", () => {
  it("boots the beginner AMD build", () =>
    expect(runPost(valid).success).toBe(true));
  it("boots a compatible Intel DDR4 build", () =>
    expect(
      runPost({ ...valid, motherboard: "b760", cpu: "i12400", ram: "ddr4" })
        .success,
    ).toBe(true));
  it.each([
    ["socket", { cpu: "i12400" }],
    ["memory", { ram: "ddr4" }],
    ["form-factor", { motherboard: "workstation" }],
    ["storage", { storage: "sas" }],
    ["power", { psu: "psu250", gpu: "rtx4080" }],
    ["cooling", { cpu: "r7900x", cooler: "compact" }],
    [
      "cooler-socket",
      { motherboard: "b760", cpu: "i12400", ram: "ddr4", cooler: "compact" },
    ],
  ])("diagnoses %s from component data", (code, change) =>
    expect(
      validateBuild({ ...valid, ...change }).some(
        (d) => d.code === code && d.severity === "error",
      ),
    ).toBe(true),
  );
  it("reports every missing required part", () =>
    expect(
      validateBuild({}).filter((d) => d.severity === "missing"),
    ).toHaveLength(6));
  it("warns for headroom without preventing POST", () => {
    const b = {
      ...valid,
      psu: "psu250",
      cpu: "i12400",
      motherboard: "b760",
      ram: "ddr4",
    };
    expect(runPost(b).success).toBe(true);
    const heavy = { ...valid, psu: "psu550", gpu: "rtx4080" };
    expect(validateBuild(heavy).some((d) => d.code === "headroom")).toBe(true);
    expect(runPost(heavy).success).toBe(true);
  });
  it("requires a motherboard before installing a CPU", () =>
    expect(installationIssues({}, byId.r7600)[0].code).toBe("order"));
  it("requires CPU before cooler", () =>
    expect(
      installationIssues({ motherboard: "b650" }, byId.tower)[0].code,
    ).toBe("order"));
});
describe("PC gameplay state", () => {
  beforeEach(() => usePCStore.getState().reset());
  it("completes the mission through install actions and invalidates POST on removal", () => {
    for (const id of Object.values(valid)) {
      usePCStore.getState().select(id!);
      usePCStore.getState().install();
    }
    usePCStore.getState().power();
    expect(usePCStore.getState().post?.success).toBe(true);
    usePCStore.getState().remove("cpu");
    expect(usePCStore.getState().installed.cooler).toBeUndefined();
    expect(usePCStore.getState().post).toBeNull();
  });
  it("rejects an incompatible installation and preserves installed hardware", () => {
    usePCStore.getState().select("b650");
    usePCStore.getState().install();
    usePCStore.getState().select("i12400");
    usePCStore.getState().install();
    expect(usePCStore.getState().installed.cpu).toBeUndefined();
    expect(usePCStore.getState().message).toContain("socket mismatch");
  });
  it("removes board-mounted components together", () => {
    usePCStore.setState({ installed: valid });
    usePCStore.getState().remove("motherboard");
    expect(usePCStore.getState().installed).toEqual({
      storage: "nvme",
      psu: "psu550",
    });
  });
});
