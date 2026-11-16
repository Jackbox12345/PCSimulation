import { test, expect } from "@playwright/test";
test("PC software: preserve files, reformat, install, configure and hand off", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/pc-builder");
  await page.getByLabel("Choose difficulty").selectOption("repair");
  await page.getByRole("button", { name: "Start PC ticket" }).click();
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
  await page
    .getByRole("link", { name: /Software setup & OS installation/ })
    .click();
  const workbench = page.getByRole("region", { name: "Software workbench" });
  await page.getByRole("button", { name: "Load reinstall ticket" }).click();
  await page
    .getByRole("button", { name: "Replace software and start" })
    .click();
  await page.getByRole("button", { name: "Prepare installer USB" }).click();
  await page.getByLabel("Next boot device").selectOption("usb");
  await page.getByRole("button", { name: "Restart simulated PC" }).click();
  await page.getByRole("button", { name: "Back up employee files" }).click();
  await page.getByRole("button", { name: "Partition and format disk" }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(workbench.getByText("Present", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Partition and format disk" }).click();
  await page.getByRole("button", { name: "Confirm simulated erase" }).click();
  for (const name of [
    "Copy OS files",
    "Register bootloader",
    "Finalize installation",
  ])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByLabel("Next boot device").selectOption("disk");
  await page.getByRole("button", { name: "Restart simulated PC" }).click();
  await page.getByRole("button", { name: "Install system updates" }).click();
  await expect(workbench.getByRole("status").first()).toContainText(
    "Network unavailable",
  );
  for (const driver of ["chipset", "network", "graphics"])
    await page
      .getByRole("button", { name: `Install ${driver} driver` })
      .click();
  await page.getByLabel("Connect training Ethernet link").check();
  await page.getByLabel("Device name", { exact: true }).fill("DESIGN-01");
  await page.getByRole("button", { name: "Apply device name" }).click();
  for (const name of [
    "Install system updates",
    "Enable host firewall",
    "Install productivity tools",
    "Restore employee files",
  ])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: "Run handoff checks" }).click();
  await expect(
    page.getByText("Not ready for handoff. Review the incomplete checks."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Restart simulated PC" }).click();
  await page.getByRole("button", { name: "Run handoff checks" }).click();
  await expect(
    page.getByText(
      "Workstation ready for handoff. Software deployment complete.",
    ),
  ).toBeVisible();
  await workbench.screenshot({ path: "test-results/software-handoff.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
