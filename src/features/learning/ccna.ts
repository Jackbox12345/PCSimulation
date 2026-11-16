export const osiLayers = [
  {
    n: 7,
    name: "Application",
    pdu: "Data",
    example: "DNS, HTTP",
    text: "Network services used by applications. A browser asks DNS for an address and uses HTTP to request a resource. The browser itself is not an OSI layer.",
  },
  {
    n: 6,
    name: "Presentation",
    pdu: "Data",
    example: "Representation, encoding",
    text: "Describes representation, compression, and encryption of data. Real TCP/IP implementations do not map perfectly to OSI: TLS is commonly discussed here conceptually, but runs above TCP.",
  },
  {
    n: 5,
    name: "Session",
    pdu: "Data",
    example: "Dialog and session management",
    text: "Describes establishing and managing dialogs. Real application protocols often implement these responsibilities together with application and presentation functions.",
  },
  {
    n: 4,
    name: "Transport",
    pdu: "TCP segment / UDP datagram",
    example: "TCP ports, UDP ports",
    text: "Ports identify application endpoints. TCP establishes a connection, acknowledges bytes, and retransmits loss. UDP supplies datagrams without TCP reliability or a handshake. ICMP has no TCP or UDP ports.",
  },
  {
    n: 3,
    name: "Network",
    pdu: "Packet",
    example: "IPv4, IPv6, ICMP",
    text: "IP addresses identify network-layer endpoints. Routers choose the longest matching route, decrement IPv4 TTL, and forward toward a next hop. ICMP reports control information and carries echo requests.",
  },
  {
    n: 2,
    name: "Data link",
    pdu: "Frame",
    example: "Ethernet, 802.1Q",
    text: "Ethernet uses source and destination MAC addresses on a local link. Switches learn source MAC addresses and forward using their MAC tables. Routers replace link-layer headers for each outgoing link.",
  },
  {
    n: 1,
    name: "Physical",
    pdu: "Bits as signals",
    example: "Copper, fiber, radio",
    text: "Electrical, optical, or radio signals carry encoded bits. Link speed, media, connectors, and signal quality matter here. An unplugged cable cannot be repaired by changing an IP address.",
  },
];
export const ccnaLessons = [
  {
    id: "ethernet",
    group: "Network fundamentals",
    title: "Ethernet, ARP, and the first packet",
    text: "A host uses its subnet mask and routing table to decide whether a destination is local. For a local IPv4 destination, ARP resolves the destination MAC. For a remote destination, ARP resolves the next-hop gateway MAC instead. A switch learns the source MAC and ingress port of received frames; broadcasts and unknown unicasts are flooded within the VLAN.",
    tip: "Visual walkthrough: compare local and routed ping. A remote server MAC never needs to appear in the client’s ARP cache.",
  },
  {
    id: "ipv6",
    group: "Network fundamentals",
    title: "IPv6 and Neighbor Discovery",
    text: "IPv6 addresses are 128 bits. A typical LAN prefix is /64. Link-local addresses use fe80::/10 and are significant on one link. ICMPv6 Neighbor Discovery uses multicast to discover neighbors and routers; IPv6 has no ARP or broadcast. SLAAC uses router advertisements, while DHCPv6 can supply configuration according to the deployment.",
    tip: "Concept lesson: the interactive network engine currently models IPv4 only.",
  },
  {
    id: "vlans",
    group: "Network access",
    title: "VLANs and 802.1Q trunks",
    text: "A VLAN separates a Layer 2 broadcast domain. An access port normally carries one data VLAN; a trunk carries multiple VLANs, usually identified with 802.1Q tags. Hosts in different VLANs need routing, such as switch virtual interfaces on a multilayer switch. Native VLAN handling must agree at both ends of a trunk.",
    tip: "Our core device uses routed physical ports. VLAN tags, access VLANs, and SVIs are concepts here, not simulated configuration commands.",
  },
  {
    id: "stp",
    group: "Network access",
    title: "STP and EtherChannel",
    text: "Redundant Layer 2 links can form loops. Spanning Tree selects a root bridge and blocks selected paths to keep an active loop-free topology. RSTP improves convergence. EtherChannel groups compatible links into a logical port channel; LACP negotiates membership. Traffic is commonly distributed by a flow hash, so a single flow does not necessarily use every member link.",
    tip: "Concept lesson: the lab traverses an Ethernet graph; it does not simulate STP convergence or LACP negotiation.",
  },
  {
    id: "routes",
    group: "IP connectivity",
    title: "Route selection and return paths",
    text: "Forwarding uses the longest matching destination prefix. A /24 match is preferred over a /16 or /0 default. When routing sources compete for the same prefix, administrative distance helps select the source and protocol metrics select paths within a protocol. A reply needs its own route back; a valid outbound route alone is insufficient.",
    tip: "Practice the hard corporate ticket: restore the core default route, then inspect the ISP return route.",
  },
  {
    id: "ospf",
    group: "IP connectivity",
    title: "Single-area OSPF",
    text: "OSPF is a link-state routing protocol. Neighbors exchange topology information and compute shortest paths using cost. Router IDs identify participants. Area 0 is the backbone; broadcast multiaccess networks elect a designated router and backup to reduce adjacency overhead. Neighbor formation depends on compatible parameters including area, timers, and subnet.",
    tip: "Concept lesson: configure static routes in this app. OSPF adjacency, elections, and dynamic route convergence are not emulated.",
  },
  {
    id: "services",
    group: "IP services",
    title: "DHCP, DNS, and NAT have different jobs",
    text: "DHCPv4 commonly uses Discover, Offer, Request, and Acknowledge to lease addresses and supply options such as a gateway and DNS resolver. DNS translates names into records; A records supply IPv4 addresses. NAT changes addresses, and PAT can multiplex flows using ports. DNS does not provide a route and a gateway does not automatically resolve names.",
    tip: "DNS A records are simulated. DHCP leases and NAT/PAT are conceptual; the corporate scenario instead uses explicit ISP return routing.",
  },
  {
    id: "operations",
    group: "IP services",
    title: "Operate and observe a network",
    text: "NTP synchronizes clocks so logs can be correlated. Syslog transports event messages with severity levels. SNMP can expose management data; SNMPv3 supports authentication and privacy. QoS classifies and schedules traffic under contention; it cannot create bandwidth. TCP retransmission and flow control differ from network congestion avoidance.",
    tip: "Troubleshooting order: link, addressing, route, name resolution, then application policy. A failed ping does not prove that HTTPS is unavailable.",
  },
  {
    id: "security",
    group: "Security fundamentals",
    title: "ACLs, firewalls, and AAA",
    text: "An ordered ACL matches traffic against rules; traditional Cisco IP ACLs have an implicit deny at the end. A stateful firewall tracks connection state, unlike a basic stateless filter. AAA separates authentication, authorization, and accounting. Use SSH for encrypted management, restrict access, and disable unused services. Layer 2 protections include DHCP snooping and dynamic ARP inspection.",
    tip: "The lab firewall is a simplified transit service allow/deny policy for ICMP, DNS, and HTTPS, not a Cisco ACL interpreter or stateful firewall.",
  },
  {
    id: "wireless",
    group: "Network access",
    title: "Wireless access in an office",
    text: "An SSID identifies a wireless network. Access points bridge client traffic into the distribution network; enterprise deployments may use controllers. Channel planning, interference, signal strength, and security affect connectivity. WPA2/WPA3 Enterprise can use 802.1X and an authentication server, unlike a shared personal passphrase.",
    tip: "Concept lesson: wireless radio behavior and controller configuration are not simulated.",
  },
  {
    id: "automation",
    group: "Automation and programmability",
    title: "Controllers, APIs, and JSON",
    text: "A controller can centralize policy and expose APIs, while devices still forward traffic. REST-style interfaces commonly use GET to retrieve, POST to create, PATCH to modify, and DELETE to remove resources. JSON encodes objects, arrays, strings, numbers, booleans, and null. Configuration tools can describe desired state and compare it with actual state.",
    tip: "Compare intent with evidence: “allow the portal” is a requirement; successful DNS and HTTPS checks verify the outcome. AI suggestions still need validation against actual configuration.",
  },
];
export type WalkStep = {
  title: string;
  text: string;
  active: string[];
  layer: string;
  headers: string;
};
export const walks: Record<
  "local" | "routed" | "web",
  { title: string; nodes: string[]; steps: WalkStep[] }
> = {
  local: {
    title: "Local PC → PC ping",
    nodes: ["PC A", "Access switch", "PC B"],
    steps: [
      {
        title: "1. Decide whether B is local",
        text: "A is 192.168.10.10/24 and B is 192.168.10.20/24. Both are in 192.168.10.0/24, so no gateway is needed.",
        active: ["PC A"],
        layer: "L3 · subnet decision",
        headers: "IPv4 destination: 192.168.10.20 | next hop: B",
      },
      {
        title: "2. Resolve B’s MAC with ARP",
        text: "Assume empty caches. A broadcasts “Who has 192.168.10.20?” The switch learns A’s source MAC on its ingress port and floods the request to other ports in the VLAN.",
        active: ["PC A", "Access switch", "PC B"],
        layer: "L2 · ARP broadcast",
        headers: "Ethernet A-MAC → ff:ff:ff:ff:ff:ff | ARP has no TCP/UDP port",
      },
      {
        title: "3. Receive a unicast ARP reply",
        text: "B replies with B-MAC. The switch learns B’s source MAC, and A caches the address mapping. ARP resolution precedes the ICMP echo in this example.",
        active: ["PC B", "Access switch", "PC A"],
        layer: "L2 · neighbor learned",
        headers: "Ethernet B-MAC → A-MAC | ARP: 192.168.10.20 is at B-MAC",
      },
      {
        title: "4. Forward the echo request",
        text: "A encapsulates an ICMP echo request in an IPv4 packet and then an Ethernet frame. The switch forwards it to B using its MAC table. It does not decrement the IP TTL.",
        active: ["PC A", "Access switch", "PC B"],
        layer: "L3 inside L2 · encapsulation",
        headers:
          "Ethernet A-MAC → B-MAC | IP .10 → .20 | TTL 64 | ICMP Echo request",
      },
      {
        title: "5. Return the echo reply",
        text: "B decapsulates the frame and packet, processes ICMP, and sends a separate reply. Successful ping confirms this ICMP exchange, not application availability.",
        active: ["PC B", "Access switch", "PC A"],
        layer: "L3 · ICMP reply",
        headers: "Ethernet B-MAC → A-MAC | IP .20 → .10 | ICMP Echo reply",
      },
    ],
  },
  routed: {
    title: "PC → another subnet",
    nodes: ["PC A", "Access switch", "Core router", "PC B"],
    steps: [
      {
        title: "1. Choose the default gateway",
        text: "A is 10.10.10.10/24; B is 10.20.20.20/24. B is remote. A selects gateway 10.10.10.1, while the IP destination remains B.",
        active: ["PC A"],
        layer: "L3 · route lookup",
        headers: "IP 10.10.10.10 → 10.20.20.20 | next hop 10.10.10.1",
      },
      {
        title: "2. ARP for the gateway",
        text: "A resolves the gateway’s LAN MAC, not B’s MAC. The ARP broadcast stays in A’s LAN; the router does not forward it into B’s subnet.",
        active: ["PC A", "Access switch", "Core router"],
        layer: "L2 · local ARP",
        headers: "ARP target 10.10.10.1 | gateway reply: CORE-LAN-MAC",
      },
      {
        title: "3. Send the frame to the router",
        text: "The Ethernet destination is the router, but the enclosed IP destination is B. The access switch forwards the frame toward the gateway.",
        active: ["PC A", "Access switch", "Core router"],
        layer: "L2 + L3 · two destinations",
        headers: "Ethernet A-MAC → CORE-LAN-MAC | IP A → B | TTL 64",
      },
      {
        title: "4. Route and re-encapsulate",
        text: "The core removes the incoming frame, finds its connected 10.20.20.0/24 route, decrements TTL, updates the IPv4 header checksum, and resolves B with ARP if needed. It creates a new Ethernet frame on the server link.",
        active: ["Core router", "PC B"],
        layer: "L3 forwarding → new L2 frame",
        headers:
          "Ethernet CORE-SERVER-MAC → B-MAC | IP A → B unchanged | TTL 63",
      },
      {
        title: "5. Route the reply back",
        text: "B sees A is remote and sends its reply to 10.20.20.1. The core routes it back to A. A wrong gateway on B breaks this return path even if the request arrived.",
        active: ["PC B", "Core router", "Access switch", "PC A"],
        layer: "L3 · independent return route",
        headers:
          "IP B → A | new reply TTL 64, then 63 after core | no NAT in this example",
      },
    ],
  },
  web: {
    title: "Open a corporate web portal",
    nodes: ["PC", "DNS", "Core", "Firewall", "ISP", "Web server"],
    steps: [
      {
        title: "1. Resolve the hostname",
        text: "Assume no cached answer. The PC queries its configured local DNS server for portal.example. DNS commonly starts with UDP destination port 53; TCP is also supported and is used when needed. Local ARP resolution is assumed complete.",
        active: ["PC", "DNS"],
        layer: "L7 DNS → L4 UDP → L3 IP → L2 Ethernet",
        headers: "DNS query portal.example | UDP client ephemeral port → 53",
      },
      {
        title: "2. Use the A-record answer",
        text: "DNS returns 203.0.113.10. This is an address, not a guarantee of reachability. The PC recognizes a remote destination and selects its local gateway.",
        active: ["DNS", "PC"],
        layer: "L7 answer → L3 route decision",
        headers: "DNS A: portal.example = 203.0.113.10 | gateway 10.10.10.1",
      },
      {
        title: "3. Establish TCP through the edge",
        text: "The PC sends SYN toward TCP 443. Core, firewall, and ISP each need routes; the reply needs return routes. A real stateful firewall evaluates policy and tracks connection state. Our lab checks a simplified HTTPS transit policy in both directions.",
        active: ["PC", "Core", "Firewall", "ISP", "Web server"],
        layer: "L4 · SYN → SYN-ACK → ACK",
        headers:
          "TCP ephemeral port → 443 | destination IP stays 203.0.113.10 | MAC addresses change per routed link",
      },
      {
        title: "4. Negotiate TLS",
        text: "After TCP connects, the client and server negotiate TLS, authenticate the server certificate against the hostname and trust configuration, and establish encryption keys. DNS success alone says nothing about certificate validity.",
        active: ["PC", "Web server"],
        layer: "TLS over TCP · encrypted application channel",
        headers:
          "TLS handshake | endpoint-to-endpoint channel | no certificate emulation in lab",
      },
      {
        title: "5. Exchange HTTP securely",
        text: "The browser sends an HTTP request inside TLS. The server returns the response, transported as encrypted TCP data. ICMP may remain blocked while this application works.",
        active: ["PC", "Core", "Firewall", "ISP", "Web server"],
        layer: "L7 · HTTP inside TLS/TCP",
        headers:
          "HTTPS request / response | TCP acknowledgments | firewall can permit 443 while denying ICMP",
      },
    ],
  },
};
