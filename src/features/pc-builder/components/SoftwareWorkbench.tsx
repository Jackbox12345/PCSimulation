import { useState } from "react";
import {
  HardDrive,
  Usb,
  Monitor,
  RotateCcw,
  ShieldCheck,
  Download,
} from "lucide-react";
import { Panel, CheckItem } from "../../../components/ui/Shared";
import { ui } from "../../../styles/ui";
import { usePCStore } from "../store/usePCStore";
import {
  driverKinds,
  hasDriver,
  imageNames,
  softwareChecks,
  type OSImage,
} from "../engine/software";
import { byId } from "../data/hardware";
import { runPost } from "../engine/compatibility";

export default function SoftwareWorkbench() {
  const { software: s, softwareAction: act, installed } = usePCStore();
  const [image, setImage] = useState<OSImage>("windows");
  const [filesystem, setFilesystem] = useState<"ntfs" | "ext4">("ntfs");
  const [confirm, setConfirm] = useState<"format" | "recovery" | null>(null);
  const [hostname, setHostname] = useState("LAB-PC01");
  const hardwareReady = runPost(installed).success,
    installer = s.screen === "installer",
    desktop = s.screen === "desktop";
  const checks = softwareChecks(s, installed),
    ready = checks.every((c) => c.done);
  const disk = byId[installed.storage ?? ""];
  const stage =
    s.installStep === 1
      ? "Register bootloader"
      : s.installStep === 2
        ? "Finalize installation"
        : "Copy OS files";
  return (
    <section
      id="software"
      className="scroll-mt-5 space-y-5"
      aria-label="Software workbench"
    >
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <span className={ui("eyebrow")}>DEPLOYMENT / AFTER POST</span>
          <h2 className="text-xl my-2">
            From assembled hardware to a working desktop
          </h2>
          <p className="text-sm text-lab-muted">
            Install, configure, and verify. Everything here runs on simulated
            disks; no real disk or operating system is modified.
          </p>
        </div>
        <button
          className={ui("button secondary")}
          disabled={!hardwareReady}
          onClick={() => setConfirm("recovery")}
        >
          Load reinstall ticket
        </button>
      </div>
      {s.recovery && (
        <div className={ui("hint")}>
          <strong>
            Service desk: preserve employee files during a clean reinstall
          </strong>
          <p>
            The bootloader is damaged. Boot the USB recovery environment, back
            up employee files, reformat, install the OS, restore files, and
            complete the handoff checks. Boot repair is available as a
            non-destructive alternative to explore, but this ticket requires a
            clean reinstall.
          </p>
        </div>
      )}
      {confirm && (
        <div className={ui("confirm-bar")} role="alert">
          <div>
            <strong>
              {confirm === "format"
                ? "Erase simulated system disk?"
                : "Replace the current software exercise?"}
            </strong>
            <p className="text-xs mt-2">
              {confirm === "format"
                ? `${disk?.name ?? "System disk"}: formatting removes the OS, apps, and employee files. ${s.documents && !s.backup ? "Employee files have no backup. They will be lost." : "External backup copies are retained."}`
                : "This loads a used workstation disk with employee files and a damaged bootloader. Your hardware stays installed."}
            </p>
          </div>
          <button
            className={ui("button danger")}
            onClick={() => {
              act(
                confirm === "format"
                  ? { type: "format", filesystem, confirmed: true }
                  : { type: "recovery" },
              );
              setConfirm(null);
            }}
          >
            {confirm === "format"
              ? "Confirm simulated erase"
              : "Replace software and start"}
          </button>
          <button
            className={ui("button ghost")}
            onClick={() => setConfirm(null)}
          >
            Cancel
          </button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          { label: "01 · Hardware POST", done: hardwareReady },
          {
            label: "02 · OS installation",
            done: !!s.os && s.bootloader && s.installStep === 0,
          },
          {
            label: "03 · Desktop configuration",
            done: checks.slice(2, 8).every((c) => c.done),
          },
          { label: "04 · Handoff", done: s.report && ready },
        ].map((item) => (
          <div
            key={item.label}
            className="border border-lab-border rounded bg-lab-panel p-3"
          >
            <CheckItem done={item.done}>{item.label}</CheckItem>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="space-y-5">
          <Panel title="UEFI boot desk">
            <p className="text-xs text-lab-muted mb-4">
              POST checks hardware; firmware then looks for an OS bootloader.
              The installer USB and the system disk are different boot devices.
            </p>
            <label className={ui("form-field")}>
              Training installation image
              <select
                value={image}
                onChange={(e) => setImage(e.target.value as OSImage)}
              >
                <option value="windows">Windows training image</option>
                <option value="linux">Linux training image</option>
              </select>
            </label>
            <button
              className={ui("button secondary")}
              onClick={() => act({ type: "media", image })}
            >
              <Usb size={16} />
              Prepare installer USB
            </button>
            <p className="text-xs text-lab-muted my-3">
              USB: {s.media ? imageNames[s.media] : "No media"}
            </p>
            <label className={ui("form-field")}>
              Next boot device
              <select
                value={s.bootTarget}
                onChange={(e) =>
                  act({
                    type: "target",
                    target: e.target.value as "disk" | "usb",
                  })
                }
              >
                <option value="disk">System disk · OS bootloader</option>
                <option value="usb">UEFI USB · installer / recovery</option>
              </select>
            </label>
            <button
              className={ui("button primary")}
              onClick={() => act({ type: "boot" })}
            >
              <RotateCcw size={16} />
              Restart simulated PC
            </button>
          </Panel>
          <Panel title="Disk manager">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive size={24} />
              <div>
                <h3>{disk?.name ?? "No storage installed"}</h3>
                <p className="text-xs text-lab-muted mt-1">
                  {s.filesystem ? "GPT partition layout" : "Unallocated disk"}
                </p>
              </div>
            </div>
            {s.filesystem ? (
              <div className="flex gap-1 text-xs mb-4">
                <div className="rounded border border-lab-accent p-3">
                  EFI
                  <br />
                  FAT32
                </div>
                <div className="rounded border border-lab-border p-3 flex-1">
                  OS volume · {s.filesystem.toUpperCase()}
                  <br />
                  <span className="text-lab-muted">
                    {s.os ? imageNames[s.os] : "Empty filesystem"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-lab-border p-5 text-xs text-lab-muted mb-4">
                Space must be partitioned and formatted before installation.
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <span>
                Employee files:{" "}
                <strong>{s.documents ? "Present" : "None"}</strong>
              </span>
              <span>
                External backup:{" "}
                <strong>{s.backup ? "Available" : "None"}</strong>
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                className={ui("button ghost")}
                disabled={!(installer || desktop) || !s.documents}
                onClick={() => act({ type: "backup" })}
              >
                Back up employee files
              </button>
              <button
                className={ui("button ghost")}
                disabled={!desktop || !s.backup}
                onClick={() => act({ type: "restore" })}
              >
                Restore employee files
              </button>
            </div>
            <label className={ui("form-field")}>
              OS volume filesystem
              <select
                value={filesystem}
                onChange={(e) =>
                  setFilesystem(e.target.value as "ntfs" | "ext4")
                }
              >
                <option value="ntfs">NTFS · Windows exercise</option>
                <option value="ext4">ext4 · Linux exercise</option>
              </select>
            </label>
            <button
              className={ui("button secondary")}
              disabled={!installer}
              onClick={() => setConfirm("format")}
            >
              Partition and format disk
            </button>
            <p className="text-xs text-lab-muted mt-3">
              This exercise creates GPT + an EFI partition automatically. The OS
              volume uses NTFS or ext4. Formatting is not OS installation, and
              it is not a secure disk sanitization method.
            </p>
          </Panel>
        </div>
        <div className="space-y-5">
          <Panel title="Virtual display">
            <div className="rounded border border-lab-border bg-lab-bg p-5">
              <div className="flex items-center justify-between gap-3">
                <Monitor size={24} className="text-lab-accent" />
                <span className="text-xs uppercase font-mono text-lab-muted">
                  {s.screen === "desktop" ? s.os + " desktop" : s.screen}
                </span>
              </div>
              <h3 className="text-lg mt-5 mb-3">
                {!hardwareReady
                  ? "Hardware repair required"
                  : s.screen === "desktop"
                    ? "Welcome to the training desktop"
                    : installer
                      ? "OS setup & recovery"
                      : s.screen === "off"
                        ? "Ready to power on"
                        : "Firmware boot diagnostics"}
              </h3>
              <p className="text-sm text-lab-accent leading-6" role="status">
                {s.log[0]}
              </p>
              {installer && (
                <div className="mt-5">
                  <div className="flex gap-2 mb-3">
                    {["Copy files", "Bootloader", "Finalize"].map(
                      (label, i) => (
                        <span
                          key={label}
                          className={`rounded px-2 py-1 text-xs ${s.installStep > i || (s.os && s.installStep === 0) ? "bg-cyan-950 text-lab-accent" : "bg-lab-panel text-lab-muted"}`}
                        >
                          {i + 1}. {label}
                        </span>
                      ),
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={ui("button primary")}
                      onClick={() => act({ type: "install" })}
                    >
                      <Download size={16} />
                      {stage}
                    </button>
                    <button
                      className={ui("button ghost")}
                      onClick={() => act({ type: "repair" })}
                    >
                      Repair bootloader
                    </button>
                  </div>
                  <p className="text-xs text-lab-muted mt-4">
                    Complete all three installation stages, select the system
                    disk, then restart. These are deliberate checkpoints, not
                    timed download progress.
                  </p>
                </div>
              )}
              {desktop && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded border border-lab-border p-3 text-xs">
                    {s.hostname || "Unnamed workstation"}
                    <p className="text-lab-muted mt-2">
                      {s.documents
                        ? "Employee documents available"
                        : "No employee documents"}
                    </p>
                  </div>
                  <div className="rounded border border-lab-border p-3 text-xs">
                    {s.apps
                      ? "Browser + productivity suite"
                      : "Applications not installed"}
                    <p className="text-lab-muted mt-2">Updates: {s.updates}</p>
                  </div>
                </div>
              )}
            </div>
            <details className="mt-3 text-xs text-lab-muted">
              <summary className="cursor-pointer">Operation log</summary>
              <ol className="list-decimal pl-5 space-y-2 mt-3">
                {s.log.map((line, i) => (
                  <li key={`${i}-${line}`}>{line}</li>
                ))}
              </ol>
            </details>
          </Panel>
          <Panel title="Desktop setup & device manager">
            <p className="text-xs text-lab-muted mb-4">
              Start the installed desktop to configure it. Driver packages come
              from an offline lab bundle; updates and applications require the
              training network link.
            </p>
            <div className="space-y-2 mb-4">
              {driverKinds.map((kind) => (
                <div
                  key={kind}
                  className="flex items-center justify-between gap-3 rounded border border-lab-border p-3"
                >
                  <div className="text-xs capitalize">
                    {kind}
                    <span
                      className={`block mt-1 ${hasDriver(s, kind, installed) ? "text-lab-accent" : "text-lab-muted"}`}
                    >
                      {hasDriver(s, kind, installed)
                        ? "Matching package installed"
                        : "Driver package needed"}
                    </span>
                  </div>
                  <button
                    className={ui("button ghost")}
                    disabled={!desktop}
                    onClick={() => act({ type: "driver", driver: kind })}
                  >
                    Install {kind} driver
                  </button>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-3 text-sm mb-4">
              <input
                type="checkbox"
                checked={s.cable}
                onChange={(e) =>
                  act({ type: "cable", connected: e.target.checked })
                }
              />
              Connect training Ethernet link
            </label>
            <div className="flex flex-wrap items-end gap-2 mb-4">
              <label className={ui("form-field")}>
                Device name
                <input
                  value={hostname}
                  maxLength={15}
                  onChange={(e) => setHostname(e.target.value)}
                />
              </label>
              <button
                className={ui("button secondary")}
                disabled={!desktop}
                onClick={() => act({ type: "hostname", value: hostname })}
              >
                Apply device name
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={ui("button secondary")}
                disabled={!desktop}
                onClick={() => act({ type: "updates" })}
              >
                Install system updates
              </button>
              <button
                className={ui("button secondary")}
                disabled={!desktop}
                onClick={() => act({ type: "firewall" })}
              >
                <ShieldCheck size={16} />
                Enable host firewall
              </button>
              <button
                className={ui("button secondary")}
                disabled={!desktop}
                onClick={() => act({ type: "apps" })}
              >
                Install productivity tools
              </button>
            </div>
          </Panel>
        </div>
      </div>
      <Panel title="Workstation handoff">
        <div className="grid gap-2 md:grid-cols-2">
          {checks.map((c) => (
            <CheckItem key={c.label} done={c.done}>
              {c.label}
            </CheckItem>
          ))}
        </div>
        <button
          className={ui("button primary mt-4")}
          disabled={!desktop}
          onClick={() => act({ type: "check" })}
        >
          Run handoff checks
        </button>
        {s.report && (
          <p
            className={`mt-4 text-sm ${ready ? "text-lab-accent" : "text-amber-300"}`}
            role="status"
          >
            {ready
              ? "Workstation ready for handoff. Software deployment complete."
              : "Not ready for handoff. Review the incomplete checks."}
          </p>
        )}
      </Panel>
      <details className={ui("hint")}>
        <summary className="cursor-pointer">
          How this relates to a real installation
        </summary>
        <p>
          Real installers may bundle drivers and create more partitions. This
          lab separates the steps for practice. It does not execute an OS,
          download packages, model licensing, TPM requirements, user accounts,
          or connect to the Network Lab topology.
        </p>
        <p>
          Reference workflows:{" "}
          <a
            className="underline"
            href="https://support.microsoft.com/en-us/windows/deployment/install-upgrade/reinstall-windows-with-the-installation-media"
            target="_blank"
            rel="noreferrer"
          >
            Microsoft installation media
          </a>{" "}
          ·{" "}
          <a
            className="underline"
            href="https://ubuntu.com/tutorials/install-ubuntu-desktop"
            target="_blank"
            rel="noreferrer"
          >
            Ubuntu Desktop installation
          </a>
          .
        </p>
      </details>
    </section>
  );
}
