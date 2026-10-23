---
name: playwright-pom
description: Automate a web scenario as Playwright Test code using the Page Object Model. Use whenever the user asks to automate, script, or generate a test for a scenario or test case (e.g. "automate TC-13", "write a test that searches for X"). Creates or extends page objects in pages/ and keeps specs free of raw locators.
allowed-tools: Bash(playwright-cli:*) Bash(npx playwright:*) Bash(npx --no-install playwright:*)
---

# Playwright tests with Page Object Model

Whenever the user asks to automate a scenario, produce **page objects + a thin spec**, never a linear spec with inline locators.

## Project layout
- `pages/<name>.page.ts`: one class per page or major component (`SearchResultsPage`, `ProductDetailPage`). All locators and UI interactions live here.
- `tests/<id>-<slug>.spec.ts`: the scenario only. Calls page-object methods and holds assertions on business outcomes.
- `utils/`: pure helpers shared by pages and tests (e.g. `parsePrice`).
- Reference implementation: `pages/search-results.page.ts`, `pages/product-detail.page.ts`, `tests/tc13-product-detail.spec.ts`.

## Workflow
1. **Check what exists.** List `pages/` and `utils/`. Reuse and extend existing page objects; do not duplicate one for the same page.
2. **Explore the live site** with the `playwright-cli` skill (`open`, `snapshot`, `eval`) to confirm real locators. Do not guess selectors. Watch for duplicate ids, new-tab links (`target=_blank`), and lazy loading.
3. **Write or extend page objects:**
   - Define locators as `private readonly` fields in the constructor; prefer role/test-id/semantic locators, fall back to stable CSS.
   - Expose intent-level methods (`goto`, `search`, `applyMaxPrice`, `firstOrganicResult`), not raw locators.
   - Methods that open a new page/tab return the next page object.
   - Put web-first waits (`expect(locator).toBeVisible()`) inside methods that need them; never use fixed sleeps.
   - Assertion helpers specific to a page may live on the page object (`expectTitleMatches`); scenario-level assertions stay in the spec.
4. **Write the spec** in `tests/`: use `baseURL` from `playwright.config.ts` (relative URLs only), keep test data in constants at the top, one `test()` per case.
5. **Run it** with `npx playwright test tests/<file> --reporter=line` (no `--project` flag; config has no named projects). Fix failures and rerun until green. Report the real result.

## Rules
- No raw locators, selectors, or `page.locator(...)` in spec files.
- No hard-coded URLs with the domain; use `baseURL`.
- Assert rules, not specific live data (prices, ranking and stock change).
- Read-only on shopping sites: never sign in, add to cart, or purchase unless the user explicitly asks.
- Match the existing code style (TypeScript, 2-space indent, single quotes, short comments only where behaviour is non-obvious).
- Mention which page objects were created or extended when reporting back.
