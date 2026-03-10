import { test, expect } from "@playwright/test";

/**
 * LexCard E2E: Critical User Path
 *
 * Covers the most important user journey:
 *   1. Homepage loads correctly
 *   2. Search for a law (民法)
 *   3. View a law page directly (/law/405AC0000000088 — 行政手続法)
 *
 * These tests hit the live e-Gov API through the Next.js dev server,
 * so generous timeouts are used throughout.
 */

test.describe("Homepage", () => {
  test("page loads with correct title", async ({ page }) => {
    await page.goto("/");

    // The layout metadata sets title to "LexCard — 法令アクセス支援システム"
    await expect(page).toHaveTitle(/LexCard/);
  });

  test("search input is visible and has correct placeholder", async ({ page }) => {
    await page.goto("/");

    // The homepage has a search input with id="hero-search"
    const searchInput = page.locator("#hero-search");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute(
      "placeholder",
      /法令名で検索/,
    );
  });

  test("hero heading is visible", async ({ page }) => {
    await page.goto("/");

    // The main heading says "現行法令の検索・条文閲覧"
    const heading = page.getByRole("heading", { name: /現行法令の検索/ });
    await expect(heading).toBeVisible();
  });

  test("popular law links are rendered", async ({ page }) => {
    await page.goto("/");

    // The homepage renders links for popular laws (六法 etc.)
    // Check that at least one of the popular law links exists
    const minpoLink = page.getByRole("link", { name: /民法/ }).first();
    await expect(minpoLink).toBeVisible();
  });
});

test.describe("Search flow", () => {
  test("searching for 民法 shows results on homepage", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.locator("#hero-search");
    await searchInput.fill("民法");

    // Click the search button (text: "検索")
    const searchButton = page.getByRole("button", { name: "検索", exact: true });
    await searchButton.click();

    // Wait for results to appear — the homepage shows inline results
    // after search. Results contain links to /law/ pages.
    // The heading "「民法」の検索結果" appears when results are loaded.
    await expect(
      page.getByText(/「民法」の検索結果/),
    ).toBeVisible({ timeout: 30_000 });

    // At least one result link should exist pointing to a law page
    const resultLinks = page.locator('a[href^="/law/"]');
    await expect(resultLinks.first()).toBeVisible({ timeout: 10_000 });
  });

  test("cross-search page loads from /search?q=民法", async ({ page }) => {
    await page.goto("/search?q=民法");

    // The cross-search page title is "横断検索"
    const heading = page.getByRole("heading", { name: /横断検索/ });
    await expect(heading).toBeVisible();

    // Wait for law results to load (tab bar with counts appears)
    // The tab bar has "法令" tab with a count badge
    const lawTab = page.getByRole("tab", { name: /法令/ });
    await expect(lawTab).toBeVisible({ timeout: 30_000 });

    // Results should appear as links to law pages
    const resultLinks = page.locator('a[href^="/law/"]');
    await expect(resultLinks.first()).toBeVisible({ timeout: 30_000 });
  });
});

test.describe("Law viewing", () => {
  // Use 行政手続法 (405AC0000000088) — a relatively small law,
  // statically generated, and fast to load.
  // CI環境ではe-Gov APIコールが遅いため長めのタイムアウト
  test.slow();
  const LAW_ID = "405AC0000000088";
  const LAW_TITLE = "行政手続法";

  test("law page loads with correct title and content", async ({ page }) => {
    await page.goto(`/law/${LAW_ID}`, { timeout: 30_000 });

    // The law title should appear as an h1
    const lawTitle = page.getByRole("heading", { name: LAW_TITLE, level: 1 });
    await expect(lawTitle).toBeVisible({ timeout: 30_000 });

    // The page title (browser tab) should contain the law name
    await expect(page).toHaveTitle(new RegExp(LAW_TITLE));
  });

  test("law metadata is displayed", async ({ page }) => {
    await page.goto(`/law/${LAW_ID}`, { timeout: 30_000 });

    // Wait for the law to load
    await expect(
      page.getByRole("heading", { name: LAW_TITLE, level: 1 }),
    ).toBeVisible({ timeout: 30_000 });

    // Law number should be visible (e.g. "平成5年法律第88号")
    await expect(page.getByText(/平成5年法律第88号/)).toBeVisible({ timeout: 15_000 });

    // The article count ("全 N 条") should be visible
    await expect(page.getByText(/全 \d+ 条/)).toBeVisible({ timeout: 15_000 });
  });

  test("article content renders", async ({ page }) => {
    await page.goto(`/law/${LAW_ID}`, { timeout: 30_000 });

    // Wait for the law to fully load
    await expect(
      page.getByRole("heading", { name: LAW_TITLE, level: 1 }),
    ).toBeVisible({ timeout: 30_000 });

    // The law page renders article titles as links.
    // 行政手続法 starts with 第1条 (目的等).
    // Look for the first article link containing "第1条"
    const firstArticle = page.getByText("第1条").first();
    await expect(firstArticle).toBeVisible({ timeout: 15_000 });
  });

  test("e-Gov external link is present", async ({ page }) => {
    await page.goto(`/law/${LAW_ID}`, { timeout: 30_000 });

    await expect(
      page.getByRole("heading", { name: LAW_TITLE, level: 1 }),
    ).toBeVisible({ timeout: 30_000 });

    // The e-Gov external link should be visible
    const egovLink = page.getByRole("link", { name: /e-Gov/ });
    await expect(egovLink).toBeVisible({ timeout: 15_000 });
    await expect(egovLink).toHaveAttribute(
      "href",
      `https://laws.e-gov.go.jp/law/${LAW_ID}`,
    );
  });

  test("back to search link works", async ({ page }) => {
    await page.goto(`/law/${LAW_ID}`, { timeout: 30_000 });

    await expect(
      page.getByRole("heading", { name: LAW_TITLE, level: 1 }),
    ).toBeVisible({ timeout: 30_000 });

    // Click "← 検索に戻る" link
    const backLink = page.getByRole("link", { name: /検索に戻る/ });
    await expect(backLink).toBeVisible();
    await backLink.click();

    // Should navigate back to homepage
    await expect(page).toHaveURL("/");
    await expect(page.locator("#hero-search")).toBeVisible();
  });
});

test.describe("Full user journey", () => {
  test.slow(); // CI: e-Gov API + search
  test("homepage → search → click result → view law", async ({ page }) => {
    // 1. Start at homepage
    await page.goto("/");
    await expect(page.locator("#hero-search")).toBeVisible();

    // 2. Search for "行政手続法"
    await page.locator("#hero-search").fill("行政手続法");
    await page.getByRole("button", { name: "検索", exact: true }).click();

    // 3. Wait for results
    await expect(
      page.getByText(/「行政手続法」の検索結果/),
    ).toBeVisible({ timeout: 30_000 });

    // 4. Click the first result link that leads to the law page
    const lawLink = page.locator('a[href*="/law/405AC0000000088"]').first();
    await expect(lawLink).toBeVisible({ timeout: 10_000 });
    await lawLink.click();

    // 5. Verify law page loaded
    await expect(
      page.getByRole("heading", { name: "行政手続法", level: 1 }),
    ).toBeVisible({ timeout: 30_000 });

    // 6. Verify article content is rendered
    await expect(page.getByText("第1条").first()).toBeVisible({ timeout: 15_000 });
  });
});
