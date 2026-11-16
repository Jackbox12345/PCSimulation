# IT Lab Simulator

A browser-only educational workbench built with React, TypeScript, Vite, Tailwind CSS, React Three Fiber, Three.js, React Flow, Zustand, and React Router. No backend, accounts, API keys, or database.

## Run locally

Use Node.js 24 LTS (the version used for verification).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Production output is generated in `dist/`:

```sh
npm run build
npm run preview
```

A static host needs an SPA fallback to `index.html` for direct links to `/pc-builder`, `/network-lab`, `/guide`, and `/settings`.

## Play Mission 01

1. Open PC Builder. Select **B650 - AM5** from the inventory.
2. Click the cyan installation target in the real 3D case, or the keyboard-accessible Install button.
3. Install **Ryzen 5 7600**, **Tower air cooler**, **16 GB DDR5-5200**, **1 TB NVMe SSD**, and **550 W ATX supply**.
4. Select **Power on** to run POST. All checks pass and the hardware mission completes. Continue to Software setup to make the workstation usable.
5. Try DDR4 with B650, an Intel processor in AM5, a SAS drive, or an undersized PSU to inspect compatibility explanations. Invalid installation attempts preserve your current build.

Drag to orbit, scroll to zoom, and right-drag to pan. The camera-reset control restores the initial view. Selecting another component in an occupied category replaces it if compatible. Removing the motherboard also returns its attached CPU, cooler, RAM, and GPU to inventory; removing a CPU also removes its cooler. Any build change invalidates the previous POST result.

## PC software deployment

After hardware POST, open **Software setup & OS installation** in PC Builder. A successful POST no longer claims that a desktop is ready.

1. Prepare a Windows or Linux training USB, select **UEFI USB**, and restart the simulated PC.
2. Inspect the disk. For an existing installation, back up employee files before erasure.
3. Partition and format using NTFS (Windows exercise) or ext4 (Linux exercise). Confirm the simulated erase. GPT and an EFI system partition are created automatically.
4. Complete **Copy OS files**, **Register bootloader**, and **Finalize installation**. Select **System disk** and restart.
5. Install chipset, network, and graphics drivers from the offline lab bundle. Connect the training Ethernet link, apply a device name, install system updates, enable the host firewall, and install productivity tools.
6. Restart to finish updates, then run **handoff checks**. All checks use the current hardware and software state.

**Load reinstall ticket** creates a used disk with employee documents and a broken bootloader, preserving your assembled hardware. Back up its files from the USB environment, clean-install the OS, restore files, and complete handoff. Formatting without backup loses the simulated files and prevents a successful ticket. Bootloader repair is also available as a non-destructive alternative to explore, but does not satisfy the ticket's clean-install requirement.

Changing the system disk clears its installation while retaining the external backup and USB. Other hardware changes turn the simulated PC off; drivers are matched against the installed motherboard and graphics hardware. A new PC ticket or full reset clears software state. Like hardware, software remains in memory during navigation and resets on a full browser reload.

No host disks are touched, files downloaded, or actual OS images executed. The training network link is independent of the Network Lab topology. Reference workflows: [Microsoft installation media](https://support.microsoft.com/en-us/windows/deployment/install-upgrade/reinstall-windows-with-the-installation-media) and [Ubuntu Desktop installation](https://ubuntu.com/tutorials/install-ubuntu-desktop).

## Play Mission 02

1. Open Network Lab and add two Desktop PCs plus a Switch, using the palette buttons or drag-and-drop.
2. Drag each PC's `eth0` handle to a different switch port. A port accepts one cable. Handles also support click-to-connect.
3. Select each PC. Set their addresses to **192.168.1.10** and **192.168.1.20**, with **255.255.255.0** on both. Leave gateway and DNS empty for this local exercise.
4. Choose the two PCs in Connectivity test and run Ping. Mission completion is derived from an actual working same-subnet path through a switch.
5. Move nodes freely. Select a cable or device and press Delete/Backspace to remove it, or use the device inspector's delete control.
6. Save explicitly to browser localStorage. Load validates the saved schema before replacing the canvas. Invalid saved data leaves the current topology intact.

### Supported routing exercise

Use one router with `eth0 = 192.168.1.1 / 255.255.255.0` and `eth1 = 192.168.2.1 / 255.255.255.0`. Connect one LAN to each port. Configure hosts as `192.168.1.10` and `192.168.2.20`, both with `/24` masks, and set each gateway to its local router interface. Both forward and return paths must exist. Ping uses actual port attachments and addressing, never random results.

## Corporate service desk missions

Each lab now offers Easy, Medium, and Hard tickets in addition to the original introductory missions. Loading a ticket creates a fresh configuration; completion is recalculated from current hardware or topology, not a stored badge.

| Lab | Easy | Medium | Hard |
| --- | --- | --- | --- |
| PC Builder | Office deployment using integrated graphics, at most 200 W | CAD workstation with 6+ cores, 8+ GB GPU memory, 20% PSU headroom | Repair an existing 12-core/16 GB GPU build with bad RAM, cooler, and PSU |
| Network Lab | Cable and address a new finance PC | Repair core LAN addressing and a server return gateway | Restore a corporate portal through DNS, core, firewall, and ISP |

### Example repairs

- PC Easy: the Mission 01 AMD build above meets the office requirements.
- PC Medium: add an RTX 4060 to that build, then run POST again.
- PC Hard: replace the PSU with 850 W first, then install DDR5 and the Dual tower cooler. Power on. Compute-capacity requirements prevent solving the repair by downgrading the CPU/GPU.
- Network Easy: connect Finance PC eth0 to Access switch p1 and change its IP to 10.10.10.10/24.
- Network Medium: configure Core eth0 as 10.10.10.1/24 and File server gateway as 10.20.20.1.
- Network Hard: add Core default route 0.0.0.0 / 0.0.0.0 via 10.255.0.2; set Finance PC DNS to 10.10.10.53; change Corporate DNS portal.example A record to 203.0.113.10; allow HTTPS on the firewall while leaving ICMP denied. Select Finance PC as source and test DNS + HTTPS. A ping to Vendor portal should remain blocked.

The hard network is an explicitly routed teaching environment. ISP return routes to the private corporate LAN are preconfigured; it does **not** claim to reproduce a typical public Internet deployment with NAT. Network saves include route tables, firewall policies, DNS records, and the active ticket. Older saved topologies receive safe defaults for the new fields.

## CCNA visual learning

The Learning Guide includes a selectable seven-layer OSI model, an IPv4 subnet calculator, and three step-through journeys: local PC-to-PC ping, routed PC-to-PC ping, and DNS-to-HTTPS portal access. It shows ARP scope, gateway selection, frame rewriting, TTL, independent return routing, DNS, TCP, TLS, and HTTP responsibilities. These diagrams are guided examples independent of the current topology.

Field notes cover all six domains in [Cisco's official CCNA exam outline](https://learningnetwork.cisco.com/s/ccna-exam-topics), including VLANs, STP, EtherChannel, IPv6, OSPF, services, security, wireless, and automation. This is introductory study material, not a complete exam preparation course. Unsupported protocols are explicitly labeled as conceptual lessons.

## Structure and decisions

- `src/app`: routing and application entry. Simulator routes are lazy-loaded, so the dashboard does not download the 3D runtime immediately.
- `src/components`: shared layout, panels, checklists, and original SVG dashboard diagrams.
- `src/styles/ui.ts`: reusable, statically declared Tailwind utility recipes for component layout, appearance, responsive breakpoints, and interaction states. The `ui()` helper combines recipes and ordinary utilities while retaining semantic hooks for tests and canvas integration. Add full Tailwind class names here or in JSX so the scanner can discover them; do not construct utility names dynamically.
- `src/styles/index.css`: Tailwind import and theme tokens, shared base typography/accessibility defaults, and the isolated React Flow integration overrides. Application component styling lives in Tailwind recipes rather than custom CSS selectors.
- `src/features/pc-builder/data`: structured hardware and case capabilities. Hardware power values are educational estimates.
- `src/features/pc-builder/engine`: pure compatibility, POST, and software deployment state machines; errors, missing parts, warnings, and valid states are distinct.
- `src/features/pc-builder/scene`: procedural 3D geometry, orbit controls, installation targets, and component animations. NVMe mounts on the board; SATA uses the storage bay.
- `src/features/pc-builder/store`: independent PC session state and mutation rules.
- `src/features/network-lab/engine`: IPv4 validation, switch traversal, multi-hop static routing, service-policy evaluation, DNS resolution, mission validation, and saved-data decoding.
- `src/features/network-lab/store`: independent network state, React Flow 13 changesets, device configuration, ping results, and explicit save/load.
- `src/features/learning`: beginner and CCNA field notes, OSI and packet-journey data, and interactive visualizations kept separately from simulator code.
- `src/utils/preferences.ts`: validated local preferences, with graceful handling of unavailable storage.

Mission status is derived from current simulation state rather than stored as a potentially stale achievement. PC builds remain in memory while navigating and reset on a full reload. Network saving is explicit. UI preferences persist automatically when browser storage is available.

## Verification

```sh
npm test
npm run test:e2e
npm run build
```

The engine suite covers CPU sockets, DDR generations, form factors, storage interfaces, cooling, PSU limits/headroom, installation order, POST invalidation, IP parsing, duplicate addresses, subnet errors, disconnected LANs, local and routed ping, port occupancy, mission completion, and malformed saved topology rejection.

Browser tests use installed Microsoft Edge in headless mode (`playwright.config.ts`). They complete the original missions and both hard corporate tickets through the UI, exercise 3D target installation, compatibility rejection, POST/removal, Ethernet cabling, ping, save/reload, settings persistence, a complete backup/reinstall/driver/update/handoff workflow, interactive OSI/subnet/packet lessons, and overflow checks at 390, 768, and 1440 pixels. On another platform, install a Playwright browser and change the configured channel accordingly.

## Deliberate simulation limits

- Simplified procedural hardware, one component per category, one fixed case. Graphics cards are optional when the selected CPU has integrated graphics.
- PC cabling, thermal paste, firmware versions, real thermal behavior, connectors, PCIe lane allocation, are abstracted. Software setup is a deterministic teaching state machine, not actual firmware or OS execution. Training images do not model version-specific system requirements, licensing, TPM, user accounts, or package managers.
- All network links are Ethernet. Switches have four ports; routers have two. IPv4 masks /1 through /30 are supported; /31 and /32 are intentionally excluded.
- Connected and static/default IPv4 routes use longest-prefix matching with forward and return checks, loop detection, and a 16-hop teaching limit. Core switches use two routed physical ports, not SVIs or VLAN trunks. Firewall policy permits/denies ICMP, DNS, and HTTPS in both directions; it does not emulate connection tracking, ACL syntax, NAT, or TLS. DNS uses exact A records in configured DNS nodes; every server endpoint represents an available HTTPS service. No DHCP, OSPF, STP, VLANs, Wi-Fi, actual packets, or Internet access. A local IP ping does not depend on gateway or DNS settings.
- Saved topologies are limited to 100 devices and 200 cables by the decoder. There is one saved topology slot per browser origin.
- WebGL is required for the 3D scene; a fallback explains unavailable rendering. Display preferences include reduced motion and lower render quality.
- The production build emits a size advisory for the lazy-loaded Three.js/R3F bundle and an upstream React Compiler directive advisory. Neither prevents the build or the verified browser flows.

All five requested phases are implemented. There are no placeholder simulator modules. Larger hardware catalogs, richer physical assembly steps, and more advanced routing would be separate extensions.
