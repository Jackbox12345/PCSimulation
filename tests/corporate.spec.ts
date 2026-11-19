import { test, expect } from "@playwright/test";
test("hard corporate outage: configure routes, DNS and firewall through the UI", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/network-lab");
  await page.getByLabel("Choose a ticket").selectOption("corporate");
  await page
    .getByRole("button", { name: "Load scenario", exact: true })
    .click();
  async function select(id: string) {
    await page.locator(`.react-flow__node[data-id="${id}"]`).click();
  }
  await select("core");
  await page.getByRole("button", { name: "Add static route" }).click();
  await page.getByLabel("Route 1 nextHop").fill("10.255.0.2");
  await select("client");
  await page.getByLabel(/DNS server/).fill("10.10.10.53");
  await select("dns");
  await page.getByLabel("DNS record 1 address").fill("203.0.113.10");
  await select("firewall");
  await page.getByLabel("Allow HTTPS").check();
  await expect(page.getByLabel("Allow ICMP")).not.toBeChecked();
  await page.getByLabel("Ping source").selectOption("client");
  await page.getByRole("button", { name: "Test DNS + HTTPS" }).click();
  await expect(page.locator(".ping-console")).toContainText(
    "HTTPS request successful",
  );
  await expect(
    page.getByText("Ticket resolved. All live acceptance checks pass."),
  ).toBeVisible();
  await page.getByLabel("Ping destination").selectOption("web");
  await page.getByRole("button", { name: "Run ping", exact: true }).click();
  await expect(page.locator(".ping-console")).toContainText(
    "Blocked by firewall",
  );
  await page.getByRole("button", { name: "Save topology" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByText("Ticket resolved. All live acceptance checks pass."),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/corporate-network.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("repair workstation ticket through the inventory and POST", async ({
  page,
}) => {
  await page.goto("/pc-builder");
  await page.getByLabel("Choose difficulty").selectOption("repair");
  await page.getByRole("button", { name: "Start PC ticket" }).click();
  await page.getByRole("button", { name: "Power on", exact: true }).click();
  await expect(page.getByText("BOOT HALTED", { exact: false })).toBeVisible();
  for (const [category, name] of [
    ["Power supplies", "850 W ATX supply"],
    ["Memory", "16 GB DDR5-5200"],
    ["CPU cooling", "Dual tower cooler"],
  ]) {
    await page.getByRole("button", { name: category, exact: true }).click();
    await page.locator(".inventory-item").filter({ hasText: name }).click();
    await page
      .getByRole("button", { name: "Install selected component" })
      .click();
  }
  await page.getByRole("button", { name: "Power on", exact: true }).click();
  await expect(
    page.getByText(
      "Hardware ticket resolved. Continue software deployment below.",
    ),
  ).toBeVisible();
});
test("learning visualizations update layers, packet steps and subnet arithmetic", async ({
  page,
}) => {
  await page.goto("/guide");
  await page.getByRole("button", { name: "Visual walkthroughs", exact: true }).click();
  await page
    .getByRole("button", { name: "PC → another subnet", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "1. Choose the default gateway" }),
  ).toBeVisible();
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Next step" }).click();
  await expect(
    page.getByText("Ethernet CORE-SERVER-MAC → B-MAC", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "OSI layer 2: Data link", exact: true })
    .click();
  await expect(page.getByText("Frame", { exact: true })).toBeVisible();
  await page.getByLabel("Prefix length").selectOption("26");
  await expect(
    page.getByText("255.255.255.192", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("192.168.10.63", { exact: true })).toBeVisible();
  await page.screenshot({
    path: "test-results/learning-visuals.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
