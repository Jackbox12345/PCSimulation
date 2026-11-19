import { test, expect } from "@playwright/test";
test("beginner course: diagram, explained retry, deliberate completion, saved progress and navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/guide#memory");
  await expect(
    page.getByRole("heading", {
      name: "RAM and Memory Compatibility",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel("Remember learning progress on this browser").check();
  await expect(
    page.getByRole("button", { name: "Mark lesson complete" }),
  ).toBeDisabled();
  await page.getByLabel("RAM module", { exact: true }).selectOption("ddr4");
  await expect(page.getByText("Incompatible:", { exact: false })).toBeVisible();
  await page.getByLabel("Motherboard", { exact: true }).selectOption("b760");
  await expect(
    page.getByText("Compatible in this lab:", { exact: false }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "16 GB DDR4", exact: true }).check();
  await expect(page.getByText("Not quite.", { exact: true })).toBeVisible();
  await expect(
    page.getByText("The equal capacity does not matter:", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mark lesson complete" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await page.getByRole("radio", { name: "16 GB DDR5", exact: true }).check();
  await expect(page.getByText("Correct.", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Completed lessons", exact: true }),
  ).toHaveAttribute("value", "0");
  await page.getByRole("button", { name: "Mark lesson complete" }).click();
  await expect(
    page.getByRole("progressbar", { name: "Completed lessons", exact: true }),
  ).toHaveAttribute("value", "1");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Lesson completed", exact: true }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Next Lesson", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Storage Devices", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Mark lesson complete" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Hide course navigation" }).click();
  await expect(
    page.getByRole("navigation", { name: "Course lessons" }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Show course navigation" }).click();
  await page.screenshot({
    path: "test-results/learning-course.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Reset learning progress", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm reset progress" }).click();
  await expect(
    page.getByRole("progressbar", { name: "Course completion" }).first(),
  ).toHaveAttribute("value", "0");
  expect(errors).toEqual([]);
});
test("practice links preserve the existing build and reference material stays searchable", async ({
  page,
}) => {
  await page.goto("/pc-builder");
  await page.getByRole("button", { name: /B650/ }).click();
  await page
    .getByRole("button", { name: "Install selected component" })
    .click();
  await page.getByRole("link", { name: "Learning Guide", exact: true }).click();
  await page.getByLabel("Search learning guide").fill("socket");
  await page
    .locator("article")
    .filter({
      has: page.getByRole("heading", {
        name: "What is a CPU socket?",
        exact: true,
      }),
    })
    .getByRole("link", { name: "Open guided lesson", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Explore the Motherboard", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Remove motherboard", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Learning Guide", exact: true }).click();
  await page
    .getByRole("button", { name: "Reference library", exact: true })
    .click();
  await page.getByLabel("Reference category").selectOption("software");
  await expect(
    page.getByRole("heading", { name: "Repair or reinstall?", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Reference category").selectOption("advanced");
  await expect(
    page.getByRole("heading", { name: "Single-area OSPF", exact: true }),
  ).toBeVisible();
  await page.goto("/guide?lesson=ip");
  await page.getByLabel("PC B address").selectOption("192.168.2.20");
  await expect(
    page.getByText("Different subnets.", { exact: false }),
  ).toBeVisible();
  await page.getByLabel("PC B address").selectOption("192.168.1.10");
  await expect(
    page.getByText("Duplicate address.", { exact: false }),
  ).toBeVisible();
});
