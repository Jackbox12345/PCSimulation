import { test, expect } from "@playwright/test";
test("PC mission: 3D target installation, rejection, POST and removal", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Start PC simulation" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: /B650 · AM5/ }).click();
  await page.locator(".slot-label").click();
  await page.getByRole("button", { name: "Processors", exact: true }).click();
  await page.getByRole("button", { name: /Core i5-12400/ }).click();
  await expect(
    page.getByText("CPU socket mismatch", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Install selected component" }),
  ).toBeDisabled();
  for (const [category, name] of [
    ["Processors", "Ryzen 5 7600"],
    ["CPU cooling", "Tower air cooler"],
    ["Memory", "16 GB DDR5-5200"],
    ["Storage", "1 TB NVMe SSD"],
    ["Power supplies", "550 W ATX supply"],
  ]) {
    await page.getByRole("button", { name: category, exact: true }).click();
    await page.locator(".inventory-item").filter({ hasText: name }).click();
    await page
      .getByRole("button", { name: "Install selected component" })
      .click();
  }
  await page.getByRole("button", { name: "Power on", exact: true }).click();
  await expect(
    page.getByText("Hardware mission complete. Continue with software setup."),
  ).toBeVisible();
  await expect(
    page.getByText("BOOT SUCCESSFUL · Simulated desktop ready"),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/pc-complete.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Remove cpu", exact: true }).click();
  await page.getByRole("button", { name: "Power on", exact: true }).click();
  await expect(
    page.getByText("BOOT HALTED · Resolve the checks above"),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("Network mission: add, cable, configure, ping, save and reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/network-lab");
  const canvas = page.locator(".network-canvas");
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Missing canvas");
  async function add(kind: string, x: number, y: number) {
    await canvas.scrollIntoViewIfNeeded();
    const current = await canvas.boundingBox();
    const transfer = await page.evaluateHandle((k) => {
      const dt = new DataTransfer();
      dt.setData("application/itlab-device", k);
      return dt;
    }, kind);
    await canvas.dispatchEvent("drop", {
      dataTransfer: transfer,
      clientX: current!.x + x,
      clientY: current!.y + y,
    });
  }
  await add("desktop", 80, 70);
  await page.getByLabel("IPv4 address", { exact: true }).fill("192.168.1.10");
  await add("desktop", 360, 70);
  await page.getByLabel("IPv4 address", { exact: true }).fill("192.168.1.20");
  await add("switch", 220, 280);
  const nodes = page.locator(".react-flow__node");
  await expect(nodes).toHaveCount(3);
  async function cable(from: number, to: number, port: string) {
    const a = nodes.nth(from).locator(".react-flow__handle").first();
    const b = nodes.nth(to).locator(`[data-handleid="${port}"]`);
    await a.dragTo(b);
  }
  await cable(0, 2, "p1");
  await cable(1, 2, "p2");
  await expect(page.locator(".react-flow__edge")).toHaveCount(2);
  await expect(
    page.getByText("Mission complete. Your local network works."),
  ).toBeVisible();
  await page.getByLabel("Ping source").selectOption({ label: "Desktop PC 1" });
  await page
    .getByLabel("Ping destination")
    .selectOption({ label: "Desktop PC 2" });
  await page.getByRole("button", { name: "Run ping" }).click();
  await expect(page.getByText("✓ Ping successful")).toBeVisible();
  await page.getByRole("button", { name: "Save topology" }).click();
  await page.screenshot({
    path: "test-results/network-complete.png",
    fullPage: true,
  });
  await page.reload();
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator(".react-flow__node")).toHaveCount(3);
  await expect(
    page.getByText("Mission complete. Your local network works."),
  ).toBeVisible();
  await page.locator(".react-flow__node").first().click();
  await page.getByLabel("IPv4 address", { exact: true }).fill("192.168.1.20");
  await expect(
    page.getByText("Mission complete. Your local network works."),
  ).toHaveCount(0);
  await page.getByLabel("IPv4 address", { exact: true }).fill("192.168.1.10");
  await page.getByRole("button", { name: "Delete selected device" }).click();
  await expect(page.locator(".react-flow__node")).toHaveCount(2);
  await expect(page.locator(".react-flow__edge")).toHaveCount(1);
  expect(errors).toEqual([]);
});
test("responsive navigation, guide and saved settings", async ({ page }) => {
  await page.goto("/");
  await page.screenshot({ path: "test-results/dashboard.png", fullPage: true });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/pc-builder",
      "/network-lab",
      "/guide",
      "/settings",
    ]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.getByRole("switch", { name: /Reduce motion/ }).check();
  await page.reload();
  await expect(
    page.getByRole("switch", { name: /Reduce motion/ }),
  ).toBeChecked();
  await page.goto("/guide");
  await page.getByLabel("Search learning guide").fill("socket");
  await expect(
    page.getByRole("heading", { name: "What is a CPU socket?" }),
  ).toBeVisible();
});
