import { describe, it, expect, beforeEach } from "vitest";
import {
  freshSoftware,
  softwareTransition,
  softwareChecks,
  softwareAfterHardwareChange,
  hasDriver,
  type SoftwareAction,
  type OSImage,
} from "./software";
import { usePCStore } from "../store/usePCStore";
const build = {
  motherboard: "b650",
  cpu: "r7600",
  ram: "ddr5",
  cooler: "tower",
  storage: "nvme",
  psu: "psu550",
};
let s = freshSoftware();
const act = (action: SoftwareAction) => {
  s = softwareTransition(s, action, build);
};
function install(image: OSImage = "windows") {
  act({ type: "media", image });
  act({ type: "target", target: "usb" });
  act({ type: "boot" });
  act({
    type: "format",
    filesystem: image === "windows" ? "ntfs" : "ext4",
    confirmed: true,
  });
  act({ type: "install" });
  act({ type: "install" });
  act({ type: "install" });
  act({ type: "target", target: "disk" });
  act({ type: "boot" });
}
function configure() {
  for (const driver of ["chipset", "network", "graphics"] as const)
    act({ type: "driver", driver });
  act({ type: "cable", connected: true });
  act({ type: "hostname", value: "FINANCE-01" });
  act({ type: "updates" });
  act({ type: "firewall" });
  act({ type: "apps" });
  act({ type: "boot" });
  act({ type: "check" });
}
beforeEach(() => {
  s = freshSoftware();
});
describe("Software deployment state machine", () => {
  it("does not bypass recovery requirements by replacing the system disk", () => {
    act({ type: "recovery" });
    const replaced = softwareAfterHardwareChange(s, build, {
      ...build,
      storage: "sata",
    });
    expect(replaced.recovery).toBe(true);
    expect(replaced.lostFiles).toBe(true);
    expect(replaced.reinstalled).toBe(false);
  });
  it.each(["windows", "linux"] as const)(
    "installs and verifies the %s training image",
    (image) => {
      install(image);
      expect(s.screen).toBe("desktop");
      expect(softwareChecks(s, build).every((c) => c.done)).toBe(false);
      configure();
      expect(s.report).toBe(true);
      expect(softwareChecks(s, build).every((c) => c.done)).toBe(true);
    },
  );
  it("distinguishes POST from booting an OS and requires complete hardware", () => {
    act({ type: "boot" });
    expect(s.screen).toBe("firmware");
    expect(s.log[0]).toContain("No bootable");
    s = softwareTransition(s, { type: "boot" }, {});
    expect(s.log[0]).toContain("Hardware POST");
  });
  it("requires USB media and rejects mismatched filesystems", () => {
    act({ type: "target", target: "usb" });
    act({ type: "boot" });
    expect(s.screen).toBe("firmware");
    act({ type: "media", image: "linux" });
    act({ type: "boot" });
    act({ type: "format", filesystem: "ntfs", confirmed: true });
    act({ type: "install" });
    expect(s.os).toBeNull();
    expect(s.log[0]).toContain("ext4");
  });
  it("requires disk erasure confirmation", () => {
    install();
    act({ type: "target", target: "usb" });
    act({ type: "boot" });
    act({ type: "format", filesystem: "ntfs", confirmed: false });
    expect(s.os).toBe("windows");
  });
  it("cannot boot an installation before finalization", () => {
    act({ type: "media", image: "windows" });
    act({ type: "target", target: "usb" });
    act({ type: "boot" });
    act({ type: "format", filesystem: "ntfs", confirmed: true });
    act({ type: "install" });
    act({ type: "install" });
    act({ type: "target", target: "disk" });
    act({ type: "boot" });
    expect(s.screen).toBe("firmware");
  });
  it("requires driver plus link for updates and requires restart to apply updates", () => {
    install();
    act({ type: "updates" });
    expect(s.updates).toBe("missing");
    act({ type: "cable", connected: true });
    act({ type: "updates" });
    expect(s.updates).toBe("missing");
    act({ type: "driver", driver: "network" });
    act({ type: "updates" });
    expect(s.updates).toBe("restart");
    act({ type: "boot" });
    expect(s.updates).toBe("current");
  });
  it("backs up, clean-installs, and restores files to resolve a reinstall ticket", () => {
    act({ type: "recovery" });
    act({ type: "media", image: "windows" });
    act({ type: "target", target: "usb" });
    act({ type: "boot" });
    act({ type: "backup" });
    install();
    expect(s.documents).toBe(false);
    configure();
    expect(softwareChecks(s, build).every((c) => c.done)).toBe(false);
    act({ type: "restore" });
    act({ type: "check" });
    expect(softwareChecks(s, build).every((c) => c.done)).toBe(true);
  });
  it("reports data loss when formatting without backup", () => {
    act({ type: "recovery" });
    install();
    configure();
    act({ type: "restore" });
    expect(s.lostFiles).toBe(true);
    expect(s.documents).toBe(false);
    expect(softwareChecks(s, build).every((c) => c.done)).toBe(false);
  });
  it("repairs boot without erasing files but does not mark the reinstall exercise complete", () => {
    act({ type: "recovery" });
    act({ type: "media", image: "windows" });
    act({ type: "target", target: "usb" });
    act({ type: "boot" });
    act({ type: "repair" });
    act({ type: "target", target: "disk" });
    act({ type: "boot" });
    expect(s.screen).toBe("desktop");
    expect(s.documents).toBe(true);
    expect(s.reinstalled).toBe(false);
  });
  it("invalidates changed hardware drivers and installed software when replacing the disk", () => {
    install();
    configure();
    const upgrade = { ...build, gpu: "rtx4060" };
    const changed = softwareAfterHardwareChange(s, build, upgrade);
    expect(changed.screen).toBe("off");
    expect(changed.os).toBe("windows");
    expect(hasDriver(changed, "graphics", upgrade)).toBe(false);
    const diskChange = softwareAfterHardwareChange(
      { ...s, backup: true },
      build,
      { ...build, storage: "sata" },
    );
    expect(diskChange.os).toBeNull();
    expect(diskChange.backup).toBe(true);
  });
  it("invalidates prior handoff when the network link is removed", () => {
    install();
    configure();
    act({ type: "cable", connected: false });
    expect(s.report).toBe(false);
    expect(softwareChecks(s, build).every((c) => c.done)).toBe(false);
  });
  it("integrates hardware changes and reset with the PC store", () => {
    usePCStore.setState({ installed: build, software: freshSoftware() });
    usePCStore.getState().power();
    expect(usePCStore.getState().post?.success).toBe(true);
    expect(usePCStore.getState().software.screen).toBe("firmware");
    usePCStore.getState().softwareAction({ type: "media", image: "windows" });
    usePCStore.getState().remove("storage");
    expect(usePCStore.getState().software.os).toBeNull();
    expect(usePCStore.getState().software.media).toBe("windows");
    usePCStore.getState().reset();
    expect(usePCStore.getState().software).toEqual(freshSoftware());
  });
});
