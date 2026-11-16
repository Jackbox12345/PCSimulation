export const softwareLessons = [
  {
    id: "boot-process",
    group: "Software deployment",
    title: "From POST to the desktop",
    text: "After checking hardware, firmware selects a boot device. In a UEFI installation, firmware can load a bootloader from an EFI system partition. The bootloader starts the operating system, which initializes its kernel, drivers, and services. A blank drive can pass hardware checks and still have nothing to boot.",
    tip: "Boot the USB to enter setup; after installation, choose the system disk and restart. Booting the USB again returns you to the installer.",
  },
  {
    id: "formatting",
    group: "Software deployment",
    title: "Partitioning, formatting, and installing are different",
    text: "A partition table describes disk regions. Formatting prepares a filesystem within a volume. OS installation writes operating system files and boot configuration. None of these steps automatically preserves your documents. A clean reinstall differs from a repair that keeps the existing installation.",
    tip: "The lab creates a GPT layout and FAT32 EFI partition automatically, then uses NTFS for its Windows exercise or ext4 for Linux. Back up files before erasing a used disk. Formatting alone is not secure sanitization.",
  },
  {
    id: "driver-deployment",
    group: "Software deployment",
    title: "Why a desktop can still be unfinished",
    text: "Drivers connect the operating system to hardware. Generic drivers may provide basic functionality, while supported vendor packages can supply additional capabilities. Real operating systems often bundle many drivers. A missing network driver can prevent downloading the very package you need, so an offline driver bundle is useful.",
    tip: "The lab makes chipset, network, and graphics package installation explicit. Hardware replacement can invalidate a package match. Stage updates, restart, enable the host firewall, install tools, and run handoff checks.",
  },
  {
    id: "recovery-backup",
    group: "Software deployment",
    title: "Repair or reinstall?",
    text: "A boot failure does not always mean the operating system or user files are gone. Repairing boot configuration may restore access without formatting. If a clean installation is required, first verify an external backup, then reinstall and restore the files. A backup on the disk being erased is not protection from that erase.",
    tip: "Load the reinstall ticket in PC Builder. Try bootloader repair to preserve files, or complete the requested clean reinstall with backup and restore. The simulated external copy survives a disk format.",
  },
];
