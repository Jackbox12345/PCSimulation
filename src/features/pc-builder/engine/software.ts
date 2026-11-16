import { type Build } from "../data/hardware";
import { runPost } from "./compatibility";

export type OSImage = "windows" | "linux";
export type DriverKind = "chipset" | "network" | "graphics";
export type SoftwareState = {
  media: OSImage | null;
  bootTarget: "disk" | "usb";
  screen: "off" | "firmware" | "installer" | "desktop";
  filesystem: "ntfs" | "ext4" | null;
  os: OSImage | null;
  installStep: 0 | 1 | 2;
  bootloader: boolean;
  drivers: Partial<Record<DriverKind, string>>;
  cable: boolean;
  updates: "missing" | "restart" | "current";
  firewall: boolean;
  hostname: string;
  apps: boolean;
  documents: boolean;
  backup: boolean;
  recovery: boolean;
  reinstalled: boolean;
  lostFiles: boolean;
  report: boolean;
  log: string[];
};
export type SoftwareAction =
  | { type: "media"; image: OSImage }
  | { type: "target"; target: "disk" | "usb" }
  | { type: "boot" }
  | { type: "format"; filesystem: "ntfs" | "ext4"; confirmed: boolean }
  | { type: "install" }
  | { type: "driver"; driver: DriverKind }
  | { type: "cable"; connected: boolean }
  | { type: "hostname"; value: string }
  | {
      type:
        | "backup"
        | "restore"
        | "updates"
        | "firewall"
        | "apps"
        | "repair"
        | "check"
        | "recovery";
    };
export const imageNames: Record<OSImage, string> = {
  windows: "Windows training image",
  linux: "Linux training image",
};
export const driverKinds: DriverKind[] = ["chipset", "network", "graphics"];
export function freshSoftware(): SoftwareState {
  return {
    media: null,
    bootTarget: "disk",
    screen: "off",
    filesystem: null,
    os: null,
    installStep: 0,
    bootloader: false,
    drivers: {},
    cable: false,
    updates: "missing",
    firewall: false,
    hostname: "",
    apps: false,
    documents: false,
    backup: false,
    recovery: false,
    reinstalled: false,
    lostFiles: false,
    report: false,
    log: [
      "No operating system installed. Assemble the hardware and complete POST first.",
    ],
  };
}
export function driverSignature(kind: DriverKind, build: Build) {
  return kind === "graphics"
    ? (build.gpu ?? build.cpu ?? "")
    : (build.motherboard ?? "");
}
export function hasDriver(s: SoftwareState, kind: DriverKind, build: Build) {
  return (
    !!driverSignature(kind, build) &&
    s.drivers[kind] === driverSignature(kind, build)
  );
}
export function softwareChecks(s: SoftwareState, build: Build) {
  return [
    { label: "Hardware passes POST", done: runPost(build).success },
    {
      label: "Installed OS starts from the system disk",
      done:
        s.screen === "desktop" &&
        s.bootTarget === "disk" &&
        !!s.os &&
        s.bootloader &&
        s.installStep === 0,
    },
    {
      label: "Chipset, network, and graphics drivers match installed hardware",
      done: driverKinds.every((k) => hasDriver(s, k, build)),
    },
    {
      label: "Training network link is connected",
      done: s.cable && hasDriver(s, "network", build),
    },
    {
      label: "Updates applied and restart completed",
      done: s.updates === "current",
    },
    { label: "Host firewall enabled", done: s.firewall },
    {
      label: "Workstation has a valid device name",
      done: /^[a-zA-Z][a-zA-Z0-9-]{0,14}$/.test(s.hostname),
    },
    { label: "Productivity tools installed", done: s.apps },
    ...(s.recovery
      ? [
          { label: "Clean OS reinstallation completed", done: s.reinstalled },
          {
            label: "Employee files backed up before erasure and restored",
            done: s.backup && s.documents && !s.lostFiles,
          },
        ]
      : []),
  ];
}
/** Pure teaching state machine; no host disks, downloads, or real OS execution. */
export function softwareTransition(
  s: SoftwareState,
  a: SoftwareAction,
  build: Build,
): SoftwareState {
  const say = (
    message: string,
    patch: Partial<SoftwareState> = {},
  ): SoftwareState => ({
    ...s,
    report: false,
    ...patch,
    log: [message, ...s.log].slice(0, 8),
  });
  if (a.type === "media")
    return say(
      `${imageNames[a.image]} written to the simulated USB. Select USB and restart to use it.`,
      { media: a.image },
    );
  if (a.type === "target")
    return say(
      `Next boot device: ${a.target === "usb" ? "UEFI USB installer" : "system disk"}. Restart to apply.`,
      { bootTarget: a.target },
    );
  if (a.type === "cable")
    return say(
      a.connected
        ? "Training Ethernet link connected. A network driver is still required."
        : "Training Ethernet link disconnected.",
      { cable: a.connected },
    );
  if (!runPost(build).success)
    return say(
      "Hardware POST must pass before software setup. Repair the hardware first.",
      { screen: "firmware" },
    );
  if (a.type === "boot") {
    if (s.bootTarget === "usb")
      return s.media
        ? say(
            "UEFI booted the USB installer. Inspect the disk before modifying it.",
            { screen: "installer" },
          )
        : say(
            "No bootable USB. Prepare installation media or select the system disk.",
            { screen: "firmware" },
          );
    if (!s.os || !s.bootloader || s.installStep !== 0)
      return say(
        "No bootable operating system. Boot a USB installer to install an OS or repair its bootloader.",
        { screen: "firmware" },
      );
    return say(
      `${imageNames[s.os]} started from disk.${s.updates === "restart" ? " Pending updates are now applied." : ""}`,
      {
        screen: "desktop",
        updates: s.updates === "restart" ? "current" : s.updates,
      },
    );
  }
  if (a.type === "recovery")
    return say(
      "Reinstall ticket loaded: employee files remain on disk, but the bootloader is damaged. Back up files from USB before a clean install.",
      {
        ...freshSoftware(),
        media: s.media,
        bootTarget: "disk",
        screen: "firmware",
        os: "windows",
        filesystem: "ntfs",
        documents: true,
        recovery: true,
      },
    );
  if (a.type === "backup") {
    if (!["desktop", "installer"].includes(s.screen) || !s.documents)
      return say(
        "Backup needs accessible employee files. Boot the USB recovery environment or the installed desktop first.",
      );
    return say(
      "Employee files copied to the simulated external backup. This copy survives formatting.",
      { backup: true },
    );
  }
  if (
    ["format", "install", "repair"].includes(a.type) &&
    s.screen !== "installer"
  )
    return say(
      "Boot the USB installer before performing disk setup or recovery.",
    );
  if (a.type === "format") {
    if (!a.confirmed)
      return say(
        "Confirm erasure of the simulated system disk before formatting.",
      );
    const lost = s.lostFiles || (s.documents && !s.backup);
    return say(
      lost
        ? "Disk formatted. Unbacked employee files were lost; restart the reinstall ticket to practice a safe recovery."
        : "Disk prepared: GPT partition table, FAT32 EFI system partition, and a new OS volume. Existing OS, apps, and files erased.",
      {
        filesystem: a.filesystem,
        os: null,
        bootloader: false,
        installStep: 0,
        drivers: {},
        updates: "missing",
        firewall: false,
        hostname: "",
        apps: false,
        documents: false,
        lostFiles: lost,
        reinstalled: false,
      },
    );
  }
  if (a.type === "install") {
    if (!s.media) return say("Prepare a training image first.");
    if (s.filesystem !== (s.media === "windows" ? "ntfs" : "ext4"))
      return say(
        `${imageNames[s.media]} needs ${s.media === "windows" ? "NTFS" : "ext4"} for its OS volume in this exercise. Format with the matching filesystem.`,
      );
    if (s.os && s.installStep === 0)
      return say(
        "An OS is already installed. Format first for a clean reinstall, or repair the bootloader to preserve files.",
      );
    if (s.os && s.os !== s.media)
      return say(
        "The USB image changed during installation. Reformat the target to start this image cleanly.",
      );
    if (s.installStep === 0)
      return say("Stage 1/3: OS files copied to the selected volume.", {
        os: s.media,
        installStep: 1,
      });
    if (s.installStep === 1)
      return say("Stage 2/3: EFI boot files and bootloader registered.", {
        bootloader: true,
        installStep: 2,
      });
    return say(
      "Stage 3/3: installation finalized. Select system disk and restart to enter the desktop.",
      { installStep: 0, reinstalled: true },
    );
  }
  if (a.type === "repair")
    return s.os && s.installStep === 0
      ? say(
          "EFI bootloader repaired without formatting. Select system disk and restart. This preserves employee files.",
          { bootloader: true },
        )
      : say(
          "No complete OS installation found to repair. Complete installation first.",
        );
  if (s.screen !== "desktop")
    return say(
      "Start the installed desktop before configuring drivers, updates, or applications.",
    );
  if (a.type === "driver")
    return say(
      `${a.driver} package installed for ${driverSignature(a.driver, build)} from the offline lab driver bundle.`,
      {
        drivers: { ...s.drivers, [a.driver]: driverSignature(a.driver, build) },
      },
    );
  if (a.type === "hostname")
    return say(
      "Device name saved. Use 1–15 letters, digits, or hyphens, starting with a letter.",
      { hostname: a.value.trim().slice(0, 60) },
    );
  if (a.type === "restore")
    return s.backup
      ? say("Employee files restored from external backup.", {
          documents: true,
        })
      : say("No backup is available. Formatting does not create a backup.");
  if (a.type === "firewall")
    return say(
      "Host firewall enabled. This protects the endpoint; the network lab firewall protects transit traffic.",
      { firewall: true },
    );
  if (a.type === "updates" || a.type === "apps") {
    if (!s.cable || !hasDriver(s, "network", build))
      return say(
        "Network unavailable. Install the network driver and connect the training Ethernet link first.",
      );
    if (a.type === "apps")
      return say(
        "Productivity suite and browser installed from the simulated software catalog.",
        { apps: true },
      );
    return s.updates === "current"
      ? say("System is already up to date.")
      : say(
          "Updates staged. Restart from the system disk to finish applying them.",
          { updates: "restart" },
        );
  }
  if (a.type === "check")
    return say(
      softwareChecks(s, build).every((c) => c.done)
        ? "Handoff passed. Hardware, operating system, drivers, security, and applications are ready."
        : "Handoff failed. Resolve the unchecked items below.",
      { report: true },
    );
  return s;
}

export function softwareAfterHardwareChange(
  s: SoftwareState,
  before: Build,
  after: Build,
): SoftwareState {
  if (before.storage !== after.storage)
    return {
      ...freshSoftware(),
      media: s.media,
      backup: s.backup,
      cable: s.cable,
      recovery: s.recovery,
      lostFiles: s.lostFiles || (s.recovery && s.documents && !s.backup),
      log: [
        "System disk changed. This disk has no installed OS; any external backup is retained.",
      ],
    };
  return { ...s, screen: "off", report: false };
}
