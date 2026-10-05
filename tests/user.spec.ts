import { test, expect } from "@playwright/test";
import { pathToFileURL } from "url";

test("student can play a wordle the teacher generated", async ({ page }, testInfo) => {
  const name = "Playwright wordle " + Date.now();
  await page.goto("/wordle");

  // build it from the Three sounds list with chin as the answer
  const list = await page.locator("#list option", { hasText: "Three sounds" }).getAttribute("value");
  await page.getByLabel("Word list").selectOption(list || "");
  // wait for that list's words to load before picking one
  await expect(page.getByLabel("Target word")).toContainText("chin");
  await page.getByLabel("Target word").selectOption({ label: "chin - /tʃ ɪ n/" });
  await page.getByLabel("Save this activity as").fill(name);

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save and generate" }).click();
  // save it as a .html file so the browser opens it as a page
  const file = testInfo.outputPath("game.html");
  await (await download).saveAs(file);

  // open the downloaded game like a student would and guess chin
  await page.goto(pathToFileURL(file).href);
  for (const sound of ["tʃ", "ɪ", "n"]) {
    await page.locator('button.key[data-sym="' + sound + '"]').click();
  }
  await page.getByRole("button", { name: "Check" }).click();
  await expect(page.locator("#msg")).toHaveText("Correct!");

  // it should show up on the dashboard too
  await page.goto("/dashboard");
  await expect(page.locator("li", { hasText: name })).toBeVisible();

  // tidy up so the test doesn't leave anything behind
  const activities = await (await page.request.get("/api/activities")).json();
  const made = activities.find((a: { name: string }) => a.name === name);
  await page.request.delete("/api/activities/" + made.id);
});
