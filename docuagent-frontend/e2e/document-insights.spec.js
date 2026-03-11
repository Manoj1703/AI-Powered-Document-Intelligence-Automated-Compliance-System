import { expect, test } from "@playwright/test";

test("open and close document insights modal", async ({ page }) => {
  const docs = [
    {
      id: "d1",
      filename: "msa.pdf",
      title: "Master Service Agreement",
      document_type: "Contract",
      overall_risk_level: "medium",
      uploaded_at: new Date().toISOString(),
    },
  ];

  await page.addInitScript(() => {
    localStorage.setItem(
      "docagent-session",
      JSON.stringify({
        token: "mock-token",
        remember: true,
        user: {
          id: "u1",
          name: "Admin",
          username: "admin",
          email: "admin@example.com",
          role: "super_admin",
        },
      }),
    );
  });

  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "u1",
        username: "admin",
        email: "admin@example.com",
        role: "super_admin",
      }),
    });
  });

  await page.route("**/api/dashboard/stats", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });

  await page.route("**/api/documents/d1", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "d1",
        filename: "msa.pdf",
        content_length: 2048,
        uploaded_at: new Date().toISOString(),
        analysis: {
          title: "Master Service Agreement",
          document_type: "Contract",
          author: "Legal",
          date: "2026-03-06",
          summary: "Summary text.",
          detailed_summary: "Detailed summary text.",
          key_clauses: ["Term and termination"],
          risk_types: ["Compliance"],
          key_topics: ["Liability"],
          obligations: ["Notify within 30 days"],
          compliance_issues: ["Missing SLA clause"],
          risks: [
            {
              risk_type: "Compliance",
              severity: "medium",
              description: "SLA requirements are incomplete.",
            },
          ],
          overall_risk_level: "medium",
          confidence_score: 88,
        },
      }),
    });
  });

  await page.route("**/api/documents", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(docs) });
  });

  await page.route("**/api/users", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([]) });
  });

  await page.goto("/");

  await page.getByRole("button", { name: "Open Documents" }).click();
  await page.getByRole("button", { name: /View msa\.pdf/i }).click();

  const dialog = page.getByRole("dialog", { name: /Document Insights/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Master Service Agreement")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
