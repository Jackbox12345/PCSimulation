import { byId, type Build } from "./hardware";
import { estimatedPower, runPost } from "../engine/compatibility";
export const pcMissions = [
  {
    id: "office",
    difficulty: "Easy",
    title: "Deploy an office desktop",
    brief:
      "Prepare a quiet finance workstation using integrated graphics and a power budget of 200 W. Install all essentials and pass POST.",
  },
  {
    id: "cad",
    difficulty: "Medium",
    title: "Equip the design team",
    brief:
      "Build a CAD workstation with at least 6 CPU cores, 8 GB dedicated graphics memory, and 20% PSU headroom. Finish with a successful POST.",
  },
  {
    id: "repair",
    difficulty: "Hard",
    title: "Repair the render workstation",
    brief:
      "A rushed upgrade left this 12-core, 16 GB graphics workstation with incompatible memory, inadequate cooling, and an undersized PSU. Start with PSU capacity, then repair memory and cooling. Preserve its compute capacity and restore reliable POST.",
  },
] as const;
export type PCMissionId = (typeof pcMissions)[number]["id"];
export function pcScenario(id: PCMissionId): Build {
  return id === "repair"
    ? {
        motherboard: "b650",
        cpu: "r7900x",
        ram: "ddr4",
        cooler: "compact",
        storage: "nvme",
        psu: "psu250",
        gpu: "rtx4080",
      }
    : {};
}
export function pcMissionChecks(
  id: PCMissionId,
  build: Build,
  booted: boolean,
) {
  const cpu = byId[build.cpu ?? ""],
    gpu = byId[build.gpu ?? ""],
    psu = byId[build.psu ?? ""];
  const cores = Number(cpu?.specifications.Cores ?? 0),
    vram = parseFloat(String(gpu?.specifications.VRAM ?? 0));
  const checks =
    id === "office"
      ? [
          {
            label: "Integrated graphics, no dedicated GPU",
            done: !!cpu?.integratedGraphics && !gpu,
          },
          {
            label: "Estimated system draw at most 200 W",
            done: !!cpu && estimatedPower(build) <= 200,
          },
        ]
      : [
          {
            label: `At least ${id === "repair" ? 12 : 6} CPU cores`,
            done: cores >= (id === "repair" ? 12 : 6),
          },
          {
            label: `At least ${id === "repair" ? 16 : 8} GB dedicated graphics memory`,
            done: vram >= (id === "repair" ? 16 : 8),
          },
          {
            label: "PSU capacity covers draw with 20% headroom",
            done: !!psu && Number(psu.wattage) >= estimatedPower(build) * 1.2,
          },
        ];
  return [
    ...checks,
    {
      label: "Current configuration passes simulated POST",
      done: booted && runPost(build).success,
    },
  ];
}
