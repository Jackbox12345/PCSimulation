import type { Course, Lesson, Quiz } from "./types";
import { lessons as notes } from "../content";
const note = (id: string) => notes.find((n) => n.id === id)!.text;
const quiz = (
  question: string,
  correct: [string, string],
  wrong: [string, string],
  answer = 0,
): Quiz => ({
  question,
  choices:
    answer === 0
      ? [
          { label: correct[0], explanation: correct[1] },
          { label: wrong[0], explanation: wrong[1] },
        ]
      : [
          { label: wrong[0], explanation: wrong[1] },
          { label: correct[0], explanation: correct[1] },
        ],
  answer,
});
type Entry = Omit<Lesson, "practice" | "visual"> & {
  steps: string[];
  diagram: [string, string][];
  visualKind?: Lesson["visual"]["kind"];
  caption: string;
  practiceLabel: string;
};
function lesson(route: Lesson["practice"]["route"], e: Entry): Lesson {
  const { steps, diagram, visualKind, caption, practiceLabel, ...rest } = e;
  return {
    ...rest,
    visual: {
      kind: visualKind ?? "flow",
      caption,
      steps: diagram.map(([label, detail]) => ({ label, detail })),
    },
    practice: { route, label: practiceLabel, steps },
  };
}
const pc = (e: Entry) => lesson("/pc-builder", e),
  net = (e: Entry) => lesson("/network-lab", e);
export const courses: Course[] = [
  {
    id: "hardware",
    title: "PC Hardware Fundamentals",
    description:
      "Learn what each part does, choose compatible hardware, and assemble a computer that passes POST.",
    outcome:
      "Build compatible hardware and explain the difference between POST and starting an operating system.",
    lessons: [
      pc({
        id: "computer-intro",
        title: "Introduction to Computers",
        objective:
          "Understand how input becomes useful output, and why hardware needs software.",
        concepts: [
          "Hardware is the physical equipment: processors, memory, drives, and peripherals. Software is the set of instructions that tells that equipment what to do.",
          "A computer receives input, processes information, and produces output. RAM holds active work; storage keeps files when power is off.",
        ],
        caption: "Select each stage to follow a simple task.",
        diagram: [
          ["Input", "You type a sentence using a keyboard."],
          [
            "Processing",
            "The CPU runs the editor instructions, using RAM for active work.",
          ],
          ["Output", "The display shows your sentence."],
          [
            "Storage",
            "Saving writes the document to a drive so it survives power-off.",
          ],
        ],
        example:
          "An office PC can have every part installed and still have no desktop: it needs a bootable operating system on its drive.",
        practiceLabel: "Explore the PC Builder",
        steps: [
          "Open PC Builder and inspect the inventory categories.",
          "Find the processor, RAM, and storage categories. Compare their roles before installing anything.",
        ],
        quiz: quiz(
          "Which part keeps a saved document when the PC is switched off?",
          [
            "Storage drive",
            "A storage drive retains saved files without power.",
          ],
          [
            "RAM",
            "RAM is temporary working memory. Unsaved work in RAM is lost when power is removed.",
          ],
        ),
        summary:
          "Hardware performs the work; software supplies instructions. RAM and storage have different jobs.",
      }),
      pc({
        id: "components",
        title: "Understanding PC Components",
        objective:
          "Identify the main components and explain how they work together.",
        concepts: [
          "The motherboard connects the main parts. The CPU executes instructions; RAM holds active data; storage holds the operating system and saved files.",
          "The power supply provides electrical power, and cooling carries heat away. A graphics processor prepares images; some CPUs have integrated graphics, so a separate card is optional in this lab.",
        ],
        caption: "Inspect the parts of a working system.",
        diagram: [
          [
            "Motherboard",
            "Provides sockets, memory slots, expansion slots, and data connections.",
          ],
          [
            "CPU + RAM",
            "The CPU processes instructions using data held in memory.",
          ],
          [
            "Storage + graphics",
            "The drive retains files; integrated or dedicated graphics supplies display output.",
          ],
          [
            "Power + cooling",
            "The PSU supplies regulated power while the cooler removes CPU heat.",
          ],
        ],
        example:
          "The lab Ryzen 5 7600 has integrated graphics. An office build can pass POST without an RTX graphics card.",
        practiceLabel: "Inspect PC components",
        steps: [
          "Select a component in the inventory and read its specifications.",
          "Notice that selecting a part does not install it; the highlighted target or Install button performs installation.",
        ],
        quiz: quiz(
          "Does every lab PC require a separate graphics card?",
          [
            "No, a supported CPU with integrated graphics can provide display output.",
            "The reference Ryzen 5 7600 and Core i5-12400 include integrated graphics.",
          ],
          [
            "Yes, without a separate GPU no computer can display anything.",
            "Integrated graphics can provide display output. A separate GPU is useful for workloads such as 3D design, but is not always required.",
          ],
          1,
        ),
        summary:
          "Choose parts for their roles and the workload, not just their names or prices.",
      }),
      pc({
        id: "socket",
        title: "Motherboards and CPU Sockets",
        objective:
          "Match a CPU to a motherboard socket before trying to install it.",
        concepts: [
          note("socket"),
          "A form factor describes a board’s physical size and mounting layout. This lab case accepts ATX, mATX, and Mini-ITX, but not EATX. Real CPU support also depends on the exact board and firmware; the lab models socket matching.",
        ],
        visualKind: "socket",
        caption:
          "Choose a board and processor. The labels use the simulator’s actual hardware data.",
        diagram: [],
        example:
          "B650 uses AM5, so the lab Ryzen 5 7600 fits. The Core i5-12400 uses LGA1700 and is rejected on B650.",
        practiceLabel: "Explore the Motherboard",
        steps: [
          "Select and install a B650 motherboard if your workbench is empty.",
          "Select Core i5-12400 to inspect the mismatch warning; then choose Ryzen 5 7600 for a compatible AM5 build.",
        ],
        quiz: quiz(
          "Can the Core i5-12400 be installed in the lab B650 board?",
          [
            "No: the CPU is LGA1700 and the board is AM5.",
            "The socket is a physical and electrical connection. Different sockets are not interchangeable.",
          ],
          [
            "Yes: all desktop CPUs use the same socket.",
            "Desktop CPUs use different sockets. Match the CPU’s socket to the board before installation.",
          ],
        ),
        summary:
          "Check socket support and case form factor before building around a motherboard.",
      }),
      pc({
        id: "memory",
        title: "RAM and Memory Compatibility",
        objective:
          "Explain temporary memory and distinguish capacity from RAM generation.",
        concepts: [
          note("memory"),
          "Capacity, such as 16 GB, tells you how much data RAM can hold. DDR generation describes the memory technology. Matching capacity does not make different generations compatible.",
        ],
        visualKind: "memory",
        caption:
          "Swap the RAM generation and motherboard to see whether their interfaces match.",
        diagram: [],
        example:
          "Both lab RAM modules hold 16 GB, but B650 accepts DDR5 while B760 accepts DDR4.",
        practiceLabel: "Practice RAM compatibility",
        steps: [
          "Select the Memory category after installing a motherboard.",
          "Compare DDR4 and DDR5 compatibility feedback. Install the generation your board supports.",
        ],
        quiz: quiz(
          "Which memory works with the lab B650 motherboard?",
          [
            "16 GB DDR5",
            "B650’s memoryType is DDR5. Matching the supported generation is required.",
          ],
          [
            "16 GB DDR4",
            "The equal capacity does not matter: DDR4 and DDR5 have different physical and electrical configurations.",
          ],
          1,
        ),
        summary:
          "RAM is working space. Check both capacity needs and motherboard-supported generation.",
      }),
      pc({
        id: "storage",
        title: "Storage Devices",
        objective:
          "Identify persistent storage and match its interface to the motherboard.",
        concepts: [
          "Storage retains the operating system, applications, and saved documents when power is off. An SSD is a solid-state drive, with no spinning disk.",
          "An interface is how a device connects and communicates. SATA and NVMe are supported by both lab B650 and B760 boards. The SAS example is incompatible with these boards.",
        ],
        caption: "Follow the checks before choosing a drive.",
        diagram: [
          ["Drive", "Choose storage for the OS and saved data."],
          [
            "Interface",
            "Match SATA or NVMe support; do not assume every drive uses the same connection.",
          ],
          [
            "Mount",
            "The lab mounts NVMe on the board and SATA in the storage bay.",
          ],
          [
            "Software",
            "A blank drive still needs formatting and OS installation after POST.",
          ],
        ],
        example:
          "A 1 TB NVMe drive can be installed on B650. Replacing it with a SAS drive does not add SAS support to the board.",
        practiceLabel: "Install a storage device",
        steps: [
          "Open Storage and compare NVMe, SATA, and SAS specifications.",
          "Select a supported drive and inspect its installation target. After POST, explore the Software setup section.",
        ],
        quiz: quiz(
          "Does installing a blank SSD automatically install an operating system?",
          [
            "No, software installation is a separate step.",
            "The drive provides storage space. The software workbench handles formatting, OS files, and boot configuration.",
          ],
          [
            "Yes, any new drive already contains a working desktop.",
            "A blank drive contains no operating system. Hardware readiness and software readiness are different.",
          ],
        ),
        summary:
          "A compatible drive provides persistent space; it does not create a working OS by itself.",
      }),
      pc({
        id: "power-cooling",
        title: "Power Supplies and Cooling",
        objective:
          "Choose sufficient power and cooling, and understand why both matter.",
        concepts: [
          note("psu"),
          note("cooling"),
          "The lab uses estimated maximum draw and cooler capacity for teaching. Real cooling performance also depends on airflow, mounting, and the environment.",
        ],
        caption:
          "Power and heat are related, but require different components.",
        diagram: [
          [
            "Wall power",
            "The PSU converts AC electricity into regulated DC outputs.",
          ],
          [
            "Components",
            "CPU, GPU, memory, and drives consume electrical power.",
          ],
          ["Heat", "Some of that energy becomes heat in the components."],
          [
            "Cooler",
            "The CPU cooler transfers heat to a heatsink and the surrounding air.",
          ],
        ],
        example:
          "The high-power Ryzen 9 7900X exceeds the Compact AM5 cooler’s budget. A Dual tower cooler and adequate PSU are needed for the render-workstation ticket.",
        practiceLabel: "Compare power and cooling",
        steps: [
          "Inspect the estimated system draw and PSU wattage in PC Builder.",
          "Compare cooler capacity with CPU draw and review any power or cooling diagnostics.",
        ],
        quiz: quiz(
          "Will a higher-wattage PSU fix an undersized CPU cooler?",
          [
            "No, cooling capacity must also be sufficient.",
            "Power delivery and heat removal are separate requirements.",
          ],
          [
            "Yes, more PSU wattage always lowers the CPU temperature.",
            "A PSU supplies power. A cooler must transfer the heat away; increasing PSU capacity does not replace cooling.",
          ],
          1,
        ),
        summary:
          "Allow power headroom and install a socket-compatible cooler with enough capacity.",
      }),
      pc({
        id: "assembly",
        title: "PC Assembly Process",
        objective:
          "Follow the lab installation sequence without confusing selection with installation.",
        concepts: [
          "Start with the motherboard because it provides the CPU socket, RAM slots, and expansion connections. Install the CPU before its cooler.",
          "Select a component, inspect its specifications and compatibility, then click its highlighted 3D target or the accessible Install button. Invalid attempts leave the current build intact.",
        ],
        caption:
          "Step through the assembly sequence supported by the simulator.",
        diagram: [
          ["Board", "Install a motherboard that fits the case."],
          ["CPU + RAM", "Match the CPU socket and RAM generation."],
          [
            "Cooler + storage + PSU",
            "Mount a suitable cooler, add a supported drive, and provide enough power.",
          ],
          ["POST", "Use Power on and read the hardware diagnostic report."],
        ],
        example:
          "A starter build is B650, Ryzen 5 7600, DDR5, Tower air cooler, NVMe SSD, and a 550 W PSU.",
        practiceLabel: "Practice PC Assembly",
        steps: [
          "Use your current workbench, or explicitly reset it only if you want a fresh build.",
          "Install the starter components one at a time.",
          "Power on and inspect each POST check.",
        ],
        quiz: quiz(
          "You selected a CPU and saw a highlighted target. Is it installed yet?",
          [
            "No, click the installation target or Install button.",
            "Selection lets you inspect the component; installation changes the actual build.",
          ],
          [
            "Yes, selecting an inventory item installs it.",
            "Selection is a preview. The separate installation action checks compatibility and places the part.",
          ],
        ),
        summary:
          "Inspect before installing. The lab abstracts physical cables and thermal paste; its sequence is not a complete real-world assembly manual.",
      }),
      pc({
        id: "post",
        title: "Troubleshooting and POST",
        objective:
          "Use diagnostic evidence to distinguish missing parts, incompatibility, and software problems.",
        concepts: [
          note("post"),
          "Read the failing check before replacing parts. Missing RAM requires installing RAM; a socket mismatch requires compatible CPU and board choices. A passing POST still does not mean the OS is installed.",
        ],
        caption: "Troubleshoot one layer at a time.",
        diagram: [
          ["Observe", "Read the diagnostic title and its explanation."],
          [
            "Identify",
            "Decide whether hardware is missing, incompatible, or below its power/cooling requirement.",
          ],
          ["Repair", "Change the relevant component and run POST again."],
          [
            "Deploy",
            "After hardware passes, install and configure the OS in the software workbench.",
          ],
        ],
        example:
          "If CPU cooling fails, swapping storage will not fix it. Inspect the CPU draw, cooler mount support, and cooling budget.",
        practiceLabel: "Build a Working Computer",
        steps: [
          "Run Power on and review the report.",
          "Resolve the specific failing hardware check.",
          "When POST passes, open Software setup and distinguish a missing OS from a hardware fault.",
        ],
        quiz: quiz(
          "POST passes, but the firmware reports no bootable OS. What should you inspect next?",
          [
            "Boot media and operating system installation",
            "The hardware checks passed. A blank drive or missing bootloader can still prevent OS startup.",
          ],
          [
            "Replace the RAM automatically",
            "Passing POST does not prove every real fault impossible, but this lab’s no-OS message calls for software setup, not arbitrary RAM replacement.",
          ],
          1,
        ),
        summary:
          "Use the diagnostic evidence. Hardware POST and desktop software readiness are separate milestones.",
      }),
    ],
  },
  {
    id: "networking",
    title: "Computer Networking Fundamentals",
    description:
      "Connect devices, give them usable addresses, and reason about local and routed communication.",
    outcome:
      "Connect two hosts through a switch, configure addresses, and troubleshoot a deterministic ping.",
    lessons: [
      net({
        id: "network-intro",
        title: "Introduction to Networking",
        objective:
          "Understand a network as connected devices exchanging information.",
        concepts: [
          "A network connects devices so they can exchange data and share resources, such as a file server or printer. A local area network (LAN) covers a limited area such as an office.",
          "A working connection needs both a path and configuration. A cable alone does not assign the right IP addresses. A local network can work without Internet access.",
        ],
        caption: "Select each part of a small office exchange.",
        diagram: [
          ["PC A", "An employee requests a shared file."],
          [
            "Local connection",
            "The network carries the request to the destination.",
          ],
          ["Server", "A server provides a shared service or file."],
          ["Reply", "The response needs a working path back to the employee."],
        ],
        example:
          "Two office PCs can communicate through a switch without an ISP device, if they have valid local addresses.",
        practiceLabel: "Explore Network Lab",
        steps: [
          "Inspect the device palette and identify Desktop PC, Server, and Switch.",
          "Observe any existing topology before adding or deleting devices.",
        ],
        quiz: quiz(
          "Must two PCs on the same local network have Internet service to communicate?",
          [
            "No, local communication can work without the Internet.",
            "A connected LAN and correct local settings are enough for this exchange.",
          ],
          [
            "Yes, every exchange must travel through an ISP.",
            "An ISP connects networks beyond the local site. Local traffic does not need to leave the LAN.",
          ],
        ),
        summary:
          "Networking combines a physical path, addressing, and a return path; Internet access is a separate service.",
      }),
      net({
        id: "network-devices",
        title: "Network Devices",
        objective:
          "Distinguish endpoints, switches, routers, and supporting services.",
        concepts: [
          "Endpoints, such as PCs and servers, send and receive application data. A switch connects devices in a LAN. A router forwards traffic between IP networks.",
          "A firewall applies traffic policy. A DNS server maps names to records such as IPv4 addresses. An ISP provides connectivity beyond the organization. In this lab, core switches use routed ports and firewall policies are simplified.",
        ],
        caption: "Inspect the roles in a corporate path.",
        diagram: [
          [
            "Endpoint",
            "The PC originates a request; a server supplies a service.",
          ],
          ["Access switch", "Connects local devices using Ethernet links."],
          [
            "Core / router",
            "Connects IP subnets using configured interfaces and routes.",
          ],
          [
            "Firewall / ISP",
            "Policy can permit a service, while the ISP edge provides a routed path to the remote server.",
          ],
        ],
        example:
          "In the corporate ticket, a PC asks Corporate DNS for portal.example, then reaches a server through the core, firewall, and ISP.",
        practiceLabel: "Inspect network devices",
        steps: [
          "Select devices on the canvas to compare their configuration fields.",
          "Inspect the DNS A-record controls and firewall service policy if these devices are present. Do not load a ticket over existing work unless you choose to replace it.",
        ],
        quiz: quiz(
          "Which service resolves portal.example to an IPv4 address?",
          ["DNS", "A DNS A record maps a hostname to an IPv4 address."],
          [
            "The power supply",
            "The PSU provides electrical power, not name resolution.",
          ],
          1,
        ),
        summary:
          "Devices have different roles. DNS resolves names; routing provides a path; a firewall applies policy.",
      }),
      net({
        id: "ethernet-basics",
        title: "Ethernet Connections",
        objective:
          "Create a physical path and distinguish a cabled port from an enabled port.",
        concepts: [
          "An Ethernet port is a connection point on a device. In this lab each physical port accepts one cable. Connect a PC’s eth0 to an unused switch port.",
          "A connected port can still be administratively down: an administrator has disabled it. The CLI command no shutdown or the inspector’s Enable control restores it.",
        ],
        caption: "Inspect the two links required for a switched connection.",
        diagram: [
          ["PC A eth0", "One end of the first cable connects here."],
          ["Switch p1", "The first cable occupies this switch port."],
          ["Switch p2", "A second, different port holds the cable to PC B."],
          [
            "PC B eth0",
            "Both endpoints now have a physical path through the switch.",
          ],
        ],
        example:
          "Connecting both PCs to the same switch port is rejected. The four-port lab switch needs two different available ports.",
        practiceLabel: "Connect Two Computers",
        steps: [
          "Add two Desktop PCs and one Switch if you need a practice topology.",
          "Drag each PC eth0 to a different switch port.",
          "Check that the inspector shows both ports enabled.",
        ],
        quiz: quiz(
          "A cable is present but its port is administratively down. What restores that link?",
          [
            "Enable the port or use no shutdown.",
            "An administrative shutdown blocks forwarding even when a cable exists.",
          ],
          [
            "Change the PC’s DNS server.",
            "DNS cannot enable a physical port. Fix the disabled link first.",
          ],
        ),
        summary:
          "Check cable endpoints and port state before diagnosing IP addressing.",
      }),
      net({
        id: "ip",
        title: "IP Addresses",
        objective:
          "Give two devices unique, usable addresses and recognize the role of the subnet mask.",
        concepts: [
          "An IPv4 address is usually written as four numbers separated by dots, such as 192.168.1.10. Each number ranges from 0 to 255. Two active devices on the same LAN must not share the same address.",
          "The address alone does not tell the host which destinations are local; the subnet mask supplies that boundary. For our first LAN, use 255.255.255.0 on both PCs.",
        ],
        visualKind: "subnet",
        caption:
          "With both masks fixed at 255.255.255.0, compare PC B with PC A.",
        diagram: [],
        example:
          "PC A at 192.168.1.10 and PC B at 192.168.1.20, both with mask 255.255.255.0, have unique addresses in the same subnet.",
        practiceLabel: "Configure IP Addresses",
        steps: [
          "Select the first PC and set 192.168.1.10 with mask 255.255.255.0.",
          "Set the second PC to 192.168.1.20 with the same mask.",
          "Leave gateway and DNS empty for this local IP-ping exercise.",
        ],
        quiz: quiz(
          "Both PCs use 192.168.1.10. What is wrong?",
          [
            "The address is duplicated; give each PC a unique host address.",
            "An IP address must identify the intended endpoint unambiguously in this LAN.",
          ],
          [
            "Nothing: sharing an address is how devices join a subnet.",
            "Devices share a subnet, not a host address. For example, .10 and .20 can share the same /24 network.",
          ],
          1,
        ),
        summary:
          "Assign distinct host addresses, then check the subnet masks rather than guessing from the IP alone.",
      }),
      net({
        id: "subnet",
        title: "Subnet Masks",
        objective:
          "Decide whether another host is local using a simple /24 example.",
        concepts: [
          "A subnet is a group of IP addresses treated as a local network. The subnet mask tells the host which part of an address identifies that group.",
          "With 255.255.255.0, also called /24, the first three numbers identify the subnet. This shortcut applies to /24, not every mask. In 192.168.1.0/24, .0 is the network address and .255 is broadcast; use .1 through .254 for hosts.",
        ],
        visualKind: "subnet",
        caption:
          "Try same-subnet, different-subnet, duplicate, and network-address examples.",
        diagram: [],
        example:
          "192.168.1.10/24 treats 192.168.2.20 as remote. A Layer 2 switch cannot route between these two subnets.",
        practiceLabel: "Compare subnet configurations",
        steps: [
          "Use two PCs connected through a switch. Set both masks to 255.255.255.0.",
          "Compare ping with PC B set to 192.168.1.20 and then 192.168.2.20.",
          "Restore matching local-subnet settings after the experiment.",
        ],
        quiz: quiz(
          "With mask 255.255.255.0 on both, are 192.168.1.10 and 192.168.2.20 local to each other?",
          [
            "No, their /24 network portions differ.",
            "The networks are 192.168.1.0 and 192.168.2.0. Routing is needed between them.",
          ],
          [
            "Yes, all addresses starting with 192.168 are in the same subnet.",
            "The mask matters. With /24, all three first numbers must match.",
          ],
          1,
        ),
        summary:
          "The mask defines local versus remote. Explore binary subnet arithmetic later in Visual walkthroughs.",
      }),
      net({
        id: "switch",
        title: "Switches and Routers",
        objective:
          "Explain why a switch connects a LAN while a router connects IP networks.",
        concepts: [
          "Ethernet carries data in units called frames. A MAC address identifies a network interface on the local link. A switch learns source MAC addresses and forwards frames using its port table.",
          "A router examines IP destinations to choose another network. It creates a new link-layer frame for the outgoing link. The lab access switch does not route; the core device has routed ports.",
        ],
        caption: "Compare a same-LAN exchange with a routed exchange.",
        diagram: [
          [
            "PC A",
            "Decides whether the destination is local using its address and mask.",
          ],
          [
            "Access switch",
            "Forwards Ethernet frames within the LAN. It does not change the destination IP.",
          ],
          [
            "Router",
            "Needed for a remote subnet; chooses a route and a next hop.",
          ],
          ["PC B", "Receives the request and needs a route for its reply."],
        ],
        example:
          "Two 192.168.1.x/24 hosts can use a switch alone. A host in 192.168.2.0/24 requires correctly configured routing.",
        practiceLabel: "Compare switching and routing",
        steps: [
          "First verify the two-PC switched LAN using matching /24 addresses.",
          "Inspect a Router or Core device: each routed port needs its own subnet.",
          "Use the medium network ticket only when you choose to replace your current topology.",
        ],
        quiz: quiz(
          "Can the lab access switch alone route from 192.168.1.0/24 to 192.168.2.0/24?",
          [
            "No, a routed device is required.",
            "A Layer 2 switch forwards frames within a LAN. Routing between IP subnets requires Layer 3 functionality.",
          ],
          [
            "Yes, any spare switch port creates a new route.",
            "A spare port adds a connection, not IP routing. Configure a router or routed core for different networks.",
          ],
        ),
        summary:
          "Switching and routing solve different problems. A physical connection does not automatically create an IP route.",
      }),
      net({
        id: "gateway",
        title: "Default Gateways",
        objective:
          "Choose the local router interface as a host’s gateway and account for replies.",
        concepts: [
          note("gateway"),
          "The host sends traffic for a remote network to its next hop, usually its default gateway. The packet still names the remote IP destination. The gateway is not the remote server and does not replace a DNS server.",
        ],
        caption: "Follow the request and its return path.",
        diagram: [
          ["Client", "10.10.10.10/24 uses local gateway 10.10.10.1."],
          [
            "Core",
            "One port serves 10.10.10.0/24; the other serves 10.20.20.0/24.",
          ],
          ["Server", "10.20.20.20/24 uses its own local gateway 10.20.20.1."],
          ["Return path", "The reply must be routed back toward 10.10.10.10."],
        ],
        example:
          "Setting the server gateway to 10.20.20.254 fails when the actual router interface is 10.20.20.1.",
        practiceLabel: "Inspect default gateways",
        steps: [
          "Inspect the gateway field on a host in an existing routed topology.",
          "Compare it with the router interface attached to that host’s LAN.",
          "Check the destination’s gateway too; then run ping in both directions.",
        ],
        quiz: quiz(
          "A PC at 10.10.10.10/24 connects to router interface 10.10.10.1. Which is its local gateway?",
          [
            "10.10.10.1",
            "Use the reachable router interface on the PC’s own subnet.",
          ],
          [
            "The remote server at 10.20.20.20",
            "The remote destination is not a local next hop. The PC first sends the frame to its local router.",
          ],
          1,
        ),
        summary:
          "Each host needs a reachable local gateway for remote destinations, and replies need their own valid path.",
      }),
      net({
        id: "network-troubleshooting",
        title: "Basic Network Troubleshooting",
        objective:
          "Test one layer at a time and interpret ping without overclaiming what it proves.",
        concepts: [
          "Start with cables and enabled ports. Then check usable, unique IP addresses and masks. For remote subnets, verify gateways and routes in both directions.",
          "Ping tests an ICMP echo exchange, not every application. DNS name lookup and HTTPS can fail independently. The lab calculates results from topology and configuration; it does not send real packets.",
        ],
        caption:
          "Follow a troubleshooting sequence instead of changing random settings.",
        diagram: [
          ["Link", "Are cables connected to the intended, enabled ports?"],
          [
            "Address",
            "Are host addresses usable, unique, and in the intended subnets?",
          ],
          ["Route", "Do remote requests and replies have gateways and routes?"],
          [
            "Service",
            "Check DNS and firewall policy for the application you need.",
          ],
        ],
        example:
          "The corporate exercise can allow HTTPS while blocking ICMP. A failed ping does not automatically prove that the web portal is down.",
        practiceLabel: "Test Network Connectivity",
        steps: [
          "Choose two hosts and Run ping; read the specific diagnostic.",
          "Fix the reported link, address, or gateway issue and repeat the test.",
          "For a configured DNS/portal topology, compare Test DNS + HTTPS with ping.",
        ],
        quiz: quiz(
          "The firewall blocks ping but allows HTTPS. Can the web portal still work?",
          [
            "Yes, the protocols can have different policies.",
            "ICMP and HTTPS are different services. Test the application path rather than using ping as proof of all connectivity.",
          ],
          [
            "No, every application requires ping to succeed first.",
            "Applications do not require a successful ICMP echo. Their own protocols and policies determine whether they work.",
          ],
        ),
        summary:
          "Troubleshoot from link to application. Read the evidence and verify the return path.",
      }),
    ],
  },
];
export const courseLessons = courses.flatMap((c) => c.lessons);
export const lessonById = Object.fromEntries(
  courseLessons.map((l) => [l.id, l]),
) as Record<string, Lesson>;
export const lessonAliases: Record<string, string> = {
  psu: "power-cooling",
  cooling: "power-cooling",
};
