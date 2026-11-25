import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Financial Overview" }),
  ).toBeVisible();
});
test("record expense and find it in transaction history", async ({ page }) => {
  await page.getByRole("link", { name: "Record Expense", exact: true }).click();
  await page.getByLabel("Merchant / description").fill("Test groceries");
  await page.getByLabel("Amount (EUR)").fill("15.25");
  await page.getByLabel("Category", { exact: true }).selectOption("food");
  await page.getByRole("button", { name: "Save transaction" }).click();
  await expect(
    page.getByRole("heading", { name: "Transactions", exact: true }),
  ).toBeVisible();
  await page.getByPlaceholder("Search transactions").fill("Test groceries");
  await expect(
    page.getByRole("cell", { name: "Test groceries" }),
  ).toBeVisible();
  await expect(page.getByRole("cell", { name: "−€15.25" })).toBeVisible();
});
test("create a budget and view progress on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("link", { name: "Budgets", exact: true }).click();
  await page.getByLabel("Expense category").selectOption("shopping");
  await page.getByLabel("Monthly limit (EUR)").fill("200");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByText("Shopping", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("€200.00 remaining", { exact: true }),
  ).toBeVisible();
});
