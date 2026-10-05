import { test, expect } from "@playwright/test";

test("teacher can create, read, edit and delete a word list", async ({ page }) => {
  const name = "Playwright list " + Date.now();
  await page.goto("/lists");

  // create
  await page.getByLabel("New list name").fill(name);
  await page.getByRole("button", { name: "Create list" }).click();
  await expect(page.getByText("Created " + name + ".")).toBeVisible();

  // add chip
  await page.locator("li", { hasText: name }).getByRole("button", { name: "Open" }).click();
  const addBox = page.locator(".box", { hasText: "Add a word" });
  await addBox.getByLabel("English spelling").fill("chip");
  for (const sound of ["tʃ", "ɪ", "p"]) {
    await addBox.getByRole("button", { name: new RegExp("^" + sound) }).click();
  }
  await addBox.getByRole("button", { name: "Add word" }).click();
  await expect(page.getByText("Added chip.")).toBeVisible();

  // read - still there after a refresh
  await page.reload();
  await page.locator("li", { hasText: name }).getByRole("button", { name: "Open" }).click();
  await expect(page.locator("li", { hasText: "chip" })).toBeVisible();

  // edit chip to chop
  await page.locator("li", { hasText: "chip" }).getByRole("button", { name: "Edit" }).click();
  // the heading changes as you type, so find the box by its spelling box instead
  const editBox = page.locator(".box", { has: page.locator("#spellingEdit") });
  await editBox.getByLabel("English spelling").fill("chop");
  await editBox.getByRole("button", { name: "Delete sound" }).click();
  await editBox.getByRole("button", { name: "Delete sound" }).click();
  for (const sound of ["ɔ", "p"]) {
    await editBox.getByRole("button", { name: new RegExp("^" + sound) }).click();
  }
  await editBox.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved chop.")).toBeVisible();

  // delete (the page asks to confirm first)
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("li", { hasText: name }).getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page.getByText("Deleted " + name + ".")).toBeVisible();
});
