import { test, expect } from "@playwright/test";
test("configure a routed network through CLI and disable/restore a real link", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/network-lab");
  await page.getByLabel("Choose a ticket").selectOption("branch");
  await page
    .getByRole("button", { name: "Load scenario", exact: true })
    .click();
  const select = async (id: string) => {
    await page.locator(`.react-flow__node[data-id="${id}"]`).click();
  };
  const command = async (text: string) => {
    await page.getByLabel("Device command").fill(text);
    await page
      .getByRole("button", { name: "Run commands", exact: true })
      .click();
  };
  await select("core");
  await command(
    "enable\nconfigure terminal\ninterface g0/0\nip address 10.10.10.1 255.255.255.0\nno shutdown\nend\nshow ip interface brief",
  );
  await expect(page.getByLabel("Console output")).toContainText("10.10.10.1");
  await expect(page.getByLabel("eth0 ip", { exact: true })).toHaveValue(
    "10.10.10.1",
  );
  await select("files");
  await command("ipconfig set 10.20.20.20 255.255.255.0 10.20.20.1");
  await select("client");
  await command("ping 10.20.20.20");
  await expect(page.getByLabel("Console output")).toContainText(
    "SUCCESS: Ping successful",
  );
  await select("core");
  await command("en\nconf t\nint eth0\nshutdown\ndo show ip interface brief");
  await expect(page.getByLabel("Console output")).toContainText(
    "administratively down",
  );
  await expect(page.getByLabel("Enable eth0")).not.toBeChecked();
  await select("client");
  await command("ping 10.20.20.20");
  await expect(page.getByLabel("Console output")).toContainText("FAILED");
  await select("core");
  await command("en\nconf t\nint eth0\nno shutdown");
  await expect(page.getByLabel("Enable eth0")).toBeChecked();
  await select("client");
  await command("ping 10.20.20.20");
  await expect(page.getByLabel("Console output")).toContainText("SUCCESS");
  await page.getByLabel("Device command").press("ArrowUp");
  await expect(page.getByLabel("Device command")).toHaveValue(
    "ping 10.20.20.20",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
