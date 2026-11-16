export const categories = [
  "motherboard",
  "cpu",
  "cooler",
  "ram",
  "storage",
  "psu",
  "gpu",
] as const;
export type Category = (typeof categories)[number];
export const categoryLabels: Record<Category, string> = {
  motherboard: "Motherboards",
  cpu: "Processors",
  cooler: "CPU cooling",
  ram: "Memory",
  storage: "Storage",
  psu: "Power supplies",
  gpu: "Graphics cards",
};
export interface HardwareComponent {
  id: string;
  name: string;
  category: Category;
  manufacturer: string;
  socket?: string;
  memoryType?: string;
  formFactor?: string;
  powerConsumption: number;
  specifications: Record<string, string | number>;
  interfaces?: string[];
  supportedSockets?: string[];
  coolingCapacity?: number;
  wattage?: number;
  integratedGraphics?: boolean;
}
export const hardware: HardwareComponent[] = [
  {
    id: "b650",
    name: "B650 · AM5",
    category: "motherboard",
    manufacturer: "Lab reference",
    socket: "AM5",
    memoryType: "DDR5",
    formFactor: "ATX",
    interfaces: ["SATA", "NVMe"],
    powerConsumption: 40,
    specifications: {
      Chipset: "B650",
      Socket: "AM5",
      Memory: "DDR5",
      Format: "ATX",
    },
  },
  {
    id: "b760",
    name: "B760 · LGA1700",
    category: "motherboard",
    manufacturer: "Lab reference",
    socket: "LGA1700",
    memoryType: "DDR4",
    formFactor: "mATX",
    interfaces: ["SATA", "NVMe"],
    powerConsumption: 35,
    specifications: {
      Chipset: "B760",
      Socket: "LGA1700",
      Memory: "DDR4",
      Format: "mATX",
    },
  },
  {
    id: "workstation",
    name: "X670 · Extended ATX",
    category: "motherboard",
    manufacturer: "Lab reference",
    socket: "AM5",
    memoryType: "DDR5",
    formFactor: "E-ATX",
    interfaces: ["NVMe"],
    powerConsumption: 60,
    specifications: {
      Socket: "AM5",
      Memory: "DDR5",
      Format: "E-ATX",
      Note: "Too wide for this case",
    },
  },
  {
    id: "r7600",
    name: "Ryzen 5 7600",
    category: "cpu",
    manufacturer: "AMD",
    socket: "AM5",
    integratedGraphics: true,
    powerConsumption: 88,
    specifications: {
      Cores: 6,
      Threads: 12,
      Socket: "AM5",
      "Estimated max draw": "88 W",
      Graphics: "Integrated",
    },
  },
  {
    id: "i12400",
    name: "Core i5-12400",
    category: "cpu",
    manufacturer: "Intel",
    socket: "LGA1700",
    integratedGraphics: true,
    powerConsumption: 117,
    specifications: {
      Cores: 6,
      Threads: 12,
      Socket: "LGA1700",
      "Estimated max draw": "117 W",
      Graphics: "Integrated",
    },
  },
  {
    id: "r7900x",
    name: "Ryzen 9 7900X",
    category: "cpu",
    manufacturer: "AMD",
    socket: "AM5",
    integratedGraphics: true,
    powerConsumption: 230,
    specifications: {
      Cores: 12,
      Threads: 24,
      Socket: "AM5",
      "Estimated max draw": "230 W",
    },
  },
  {
    id: "ddr5",
    name: "16 GB DDR5-5200",
    category: "ram",
    manufacturer: "Lab reference",
    memoryType: "DDR5",
    powerConsumption: 6,
    specifications: {
      Capacity: "16 GB",
      Generation: "DDR5",
      Speed: "5200 MT/s",
    },
  },
  {
    id: "ddr4",
    name: "16 GB DDR4-3200",
    category: "ram",
    manufacturer: "Lab reference",
    memoryType: "DDR4",
    powerConsumption: 6,
    specifications: {
      Capacity: "16 GB",
      Generation: "DDR4",
      Speed: "3200 MT/s",
    },
  },
  {
    id: "nvme",
    name: "1 TB NVMe SSD",
    category: "storage",
    manufacturer: "Lab reference",
    interfaces: ["NVMe"],
    powerConsumption: 7,
    specifications: { Capacity: "1 TB", Interface: "NVMe", Format: "M.2 2280" },
  },
  {
    id: "sata",
    name: "500 GB SATA SSD",
    category: "storage",
    manufacturer: "Lab reference",
    interfaces: ["SATA"],
    powerConsumption: 4,
    specifications: {
      Capacity: "500 GB",
      Interface: "SATA",
      Format: "2.5 inch",
    },
  },
  {
    id: "sas",
    name: "2 TB SAS drive",
    category: "storage",
    manufacturer: "Lab reference",
    interfaces: ["SAS"],
    powerConsumption: 12,
    specifications: {
      Capacity: "2 TB",
      Interface: "SAS",
      Note: "Requires a SAS controller",
    },
  },
  {
    id: "psu550",
    name: "550 W ATX supply",
    category: "psu",
    manufacturer: "Lab reference",
    wattage: 550,
    powerConsumption: 0,
    specifications: { Output: "550 W", Format: "ATX" },
  },
  {
    id: "psu250",
    name: "250 W ATX supply",
    category: "psu",
    manufacturer: "Lab reference",
    wattage: 250,
    powerConsumption: 0,
    specifications: { Output: "250 W", Format: "ATX" },
  },
  {
    id: "psu850",
    name: "850 W ATX supply",
    category: "psu",
    manufacturer: "Lab reference",
    wattage: 850,
    powerConsumption: 0,
    specifications: { Output: "850 W", Format: "ATX" },
  },
  {
    id: "tower",
    name: "Tower air cooler",
    category: "cooler",
    manufacturer: "Lab reference",
    supportedSockets: ["AM5", "LGA1700"],
    coolingCapacity: 180,
    powerConsumption: 4,
    specifications: { "Cooling budget": "180 W", Mounts: "AM5 / LGA1700" },
  },
  {
    id: "compact",
    name: "Compact AM5 cooler",
    category: "cooler",
    manufacturer: "Lab reference",
    supportedSockets: ["AM5"],
    coolingCapacity: 95,
    powerConsumption: 3,
    specifications: { "Cooling budget": "95 W", Mounts: "AM5" },
  },
  {
    id: "dual",
    name: "Dual tower cooler",
    category: "cooler",
    manufacturer: "Lab reference",
    supportedSockets: ["AM5", "LGA1700"],
    coolingCapacity: 250,
    powerConsumption: 6,
    specifications: { "Cooling budget": "250 W", Mounts: "AM5 / LGA1700" },
  },
  {
    id: "rtx4060",
    name: "GeForce RTX 4060",
    category: "gpu",
    manufacturer: "NVIDIA",
    powerConsumption: 115,
    specifications: {
      VRAM: "8 GB",
      Interface: "PCIe x16",
      "Board power": "115 W",
    },
  },
  {
    id: "rtx4080",
    name: "GeForce RTX 4080",
    category: "gpu",
    manufacturer: "NVIDIA",
    powerConsumption: 320,
    specifications: {
      VRAM: "16 GB",
      Interface: "PCIe x16",
      "Board power": "320 W",
    },
  },
];
export const byId = Object.fromEntries(
  hardware.map((h) => [h.id, h]),
) as Record<string, HardwareComponent>;
export type Build = Partial<Record<Category, string>>;
export const caseSpec = {
  name: "LAB / M1",
  formFactors: ["ATX", "mATX", "Mini-ITX"],
};
export const required: Category[] = [
  "motherboard",
  "cpu",
  "cooler",
  "ram",
  "storage",
  "psu",
];
