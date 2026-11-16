import {
  byId,
  caseSpec,
  required,
  type Build,
  type HardwareComponent,
} from "../data/hardware";
export type Diagnostic = {
  code: string;
  severity: "error" | "missing" | "warning" | "valid";
  title: string;
  explanation: string;
};
export function estimatedPower(build: Build) {
  return (
    Object.values(build).reduce(
      (sum, id) => sum + (id ? byId[id]?.powerConsumption || 0 : 0),
      0,
    ) + 15
  );
}
export function validateBuild(build: Build): Diagnostic[] {
  const issues: Diagnostic[] = [];
  const add = (
    code: string,
    severity: Diagnostic["severity"],
    title: string,
    explanation: string,
  ) => issues.push({ code, severity, title, explanation });
  for (const key of required)
    if (!build[key])
      add(
        `missing-${key}`,
        "missing",
        `Install ${key === "psu" ? "a power supply" : key === "ram" ? "memory" : `a ${key}`}`,
        "This component is required to complete the desktop mission.",
      );
  const board = byId[build.motherboard || ""],
    cpu = byId[build.cpu || ""],
    ram = byId[build.ram || ""],
    cooler = byId[build.cooler || ""],
    storage = byId[build.storage || ""],
    psu = byId[build.psu || ""];
  if (board && !caseSpec.formFactors.includes(board.formFactor || ""))
    add(
      "form-factor",
      "error",
      "Motherboard does not fit this case",
      `${board.formFactor} is not supported by the ${caseSpec.name} case. Use ${caseSpec.formFactors.join(", ")}.`,
    );
  if (board && cpu && board.socket !== cpu.socket)
    add(
      "socket",
      "error",
      "CPU socket mismatch",
      `${cpu.name} uses ${cpu.socket}; this motherboard uses ${board.socket}. The physical and electrical connections differ.`,
    );
  if (board && ram && board.memoryType !== ram.memoryType)
    add(
      "memory",
      "error",
      `${ram.memoryType} memory cannot fit this motherboard`,
      `${board.memoryType} and ${ram.memoryType} use different notch positions and electrical configurations. They are not interchangeable.`,
    );
  if (
    board &&
    storage &&
    !storage.interfaces?.some((i) => board.interfaces?.includes(i))
  )
    add(
      "storage",
      "error",
      "Unsupported storage interface",
      `This drive uses ${storage.interfaces?.join("/")}. The motherboard supports ${board.interfaces?.join("/")} without an additional controller.`,
    );
  if (cpu && cooler && !cooler.supportedSockets?.includes(cpu.socket || ""))
    add(
      "cooler-socket",
      "error",
      "Cooler mount is incompatible",
      `This cooler supports ${cooler.supportedSockets?.join("/")}, but the CPU socket is ${cpu.socket}.`,
    );
  if (cpu && cooler && (cooler.coolingCapacity || 0) < cpu.powerConsumption)
    add(
      "cooling",
      "error",
      "Insufficient CPU cooling",
      `The cooler’s simulated budget is ${cooler.coolingCapacity} W; the processor’s estimated maximum is ${cpu.powerConsumption} W. Choose a larger cooler.`,
    );
  const power = estimatedPower(build);
  if (psu && (psu.wattage || 0) < power)
    add(
      "power",
      "error",
      "Power supply capacity exceeded",
      `Estimated load is ${power} W, above the ${psu.wattage} W supply. Upgrade the PSU or reduce component load.`,
    );
  else if (psu && power > (psu.wattage || 0) * 0.8)
    add(
      "headroom",
      "warning",
      "Limited power headroom",
      `${power} W uses more than 80% of the ${psu.wattage} W supply. More headroom is recommended for transient loads.`,
    );
  if (cpu && !cpu.integratedGraphics && !build.gpu)
    add(
      "graphics",
      "missing",
      "No graphics output",
      "Install a graphics card when the CPU has no integrated graphics.",
    );
  if (!issues.some((i) => i.severity === "error" || i.severity === "missing"))
    add(
      "ready",
      "valid",
      "Configuration ready for POST",
      "All required components are present and pass the supported compatibility checks.",
    );
  return issues;
}
export function installationIssues(
  build: Build,
  part: HardwareComponent,
): Diagnostic[] {
  if (
    ["cpu", "ram", "gpu", "cooler"].includes(part.category) &&
    !build.motherboard
  )
    return [
      {
        code: "order",
        severity: "error",
        title: "Install the motherboard first",
        explanation:
          "The motherboard provides the mounting points for this component.",
      },
    ];
  if (part.category === "cooler" && !build.cpu)
    return [
      {
        code: "order",
        severity: "error",
        title: "Install the CPU first",
        explanation: "The cooler mounts above the processor.",
      },
    ];
  const prior = new Set(
    validateBuild(build)
      .filter((i) => i.severity === "error")
      .map((i) => `${i.code}:${i.explanation}`),
  );
  return validateBuild({ ...build, [part.category]: part.id }).filter(
    (i) => i.severity === "error" && !prior.has(`${i.code}:${i.explanation}`),
  );
}
export function runPost(build: Build) {
  const diagnostics = validateBuild(build);
  const groups = [
    { label: "Power delivery", codes: ["missing-psu", "power"] },
    {
      label: "Mainboard & processor",
      codes: ["missing-motherboard", "form-factor", "missing-cpu", "socket"],
    },
    {
      label: "Cooling system",
      codes: ["missing-cooler", "cooler-socket", "cooling"],
    },
    { label: "Memory initialization", codes: ["missing-ram", "memory"] },
    { label: "Storage detection", codes: ["missing-storage", "storage"] },
    { label: "Display output", codes: ["graphics"] },
  ];
  return {
    checks: groups.map((g) => ({
      ...g,
      passed: !diagnostics.some((d) => g.codes.includes(d.code)),
    })),
    diagnostics,
    success: !diagnostics.some(
      (d) => d.severity === "error" || d.severity === "missing",
    ),
  };
}
