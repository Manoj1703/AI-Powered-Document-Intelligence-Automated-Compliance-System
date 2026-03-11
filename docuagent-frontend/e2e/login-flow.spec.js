import { expect, test } from "@playwright/test";

test("login flow with mocked API", async ({ page }) => {
  await page.addInitScript(() => {
    window.turnstile = {
      render(_element, options) {
        window.setTimeout(() => options?.callback?.("mock-turnstile-token"), 0);
        return "mock-widget-id";
      },
      reset() {},
      remove() {},
    };
  });

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Not authenticated" }),
    });
  });

  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "mock-token",
        token_type: "bearer",
        user: {
          id: "u1",
          username: "admin",
          email: "admin@example.com",
          role: "super_admin",
        },
      }),
    });
  });

  await page.route("**/api/dashboard/stats", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });

  await page.route("**/api/documents", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });

  await page.route("**/api/users", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });

  await page.goto("/");

  await page.getByLabel(/Email or Username/i).fill("admin@example.com");
  await page.getByLabel(/^Password$/i).fill("Admin@123");
  await page.locator(".green-cta").click();

  await expect(page.getByText("DocAgent Platform")).toBeVisible();
  await expect(page.getByText(/Backend:\s*(Online|Unknown)/i)).toBeVisible();
});
