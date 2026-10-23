# Test Plan: Search for Laptops Under ₹50,000 on Amazon.in

## 1. Scope
- **In scope:** home page load, keyword search, price filter (max ₹50,000), results inspection, sorting, result-card data verification, opening a product detail page (read-only).
- **Out of scope:** sign-in, add to cart, checkout, purchase, payments, reviews submission.
- **Environment:** https://www.amazon.in, Chromium (desktop 1280x720), guest user, no persisted session.
- **Tooling:** playwright-cli for exploration; Playwright Test for automation.

## 2. Assumptions and Risks
- Results, prices, ranking and sponsored placement change constantly, so assert on **rules** (price ≤ 50,000, fields present), never on specific products.
- Amazon may show CAPTCHA/bot checks, cookie or location prompts; tests must tolerate and report them rather than fail silently.
- Delivery location (observed: Bengaluru 562114) can change availability and price.
- Page is lazy-loaded: wait for `[data-component-type="s-search-result"]` before asserting.

## 3. Observed Baseline (from live inspection)
- Search `laptops` with price filter yields "1-16 of over 50,000 results" per page (16 cards).
- Price filter shows range slider ₹295 – ₹50,000.
- Sort options: Featured, Price: Low to High, Price: High to Low, Avg. Customer Review, Newest Arrivals, Best Sellers.
- Each card exposes: title (brand, CPU, RAM, SSD, screen size, OS), current price (`.a-price-whole`), rating ("x out of 5 stars"), "bought in past month", MRP and discount %, delivery date, bank offers, Sponsored label.
- Noted data-quality edge: a card with rating 1.0 and discount 47% appears in results, so ratings and discounts must be checked for validity, not quality.

## 4. Verifiable Product Details
| Detail | How to verify | Expected |
|---|---|---|
| Title | non-empty text | Contains a brand and spec keywords; relevant to "laptop" |
| Price | `.a-price-whole` parsed to number | Numeric, > 0, ≤ 50,000 |
| MRP / discount | strikethrough price and "% off" | MRP ≥ price; discount % ≈ (MRP-price)/MRP (±1%) |
| Rating | "x out of 5 stars" | 0 < value ≤ 5 |
| Review count | number beside rating | Non-negative integer |
| Image | `img.s-image` | Loaded (naturalWidth > 0), has alt text |
| Delivery info | delivery text | Present or explicitly "unavailable"; date not in the past |
| Sponsored tag | "Sponsored" label | Clearly labeled; still obeys price filter |
| Link | title anchor href | Opens `/dp/<ASIN>` page |
| Detail page consistency | PDP title, price, rating | Match the card (price within same value) |
| Specs | RAM, SSD, CPU, screen size in title | Parsable; consistent with PDP spec table |

## 5. Test Scenarios

### TC-01 Home page loads
- **Steps:** open https://www.amazon.in.
- **Expected:** title contains "Amazon.in"; search box, logo, nav bar visible; no blocking error.

### TC-02 Basic keyword search
- **Steps:** type `laptops` in search, press Enter.
- **Expected:** URL contains `k=laptops`; at least 1 result card; header shows "N results for "laptops"".

### TC-03 Apply price filter ≤ ₹50,000
- **Steps:** set max price 50000 (left-nav price filter, or `rh=p_36:-5000000` URL param); apply.
- **Expected:** filter chip/range shows ₹50,000 as max; result count updates; page reloads without error.

### TC-04 All visible prices within budget
- **Steps:** collect every `.a-price-whole` on page 1 (and page 2).
- **Expected:** every price ≤ 50,000; none > 50,000 (flag any exception, including sponsored cards).

### TC-05 Result card completeness
- **Steps:** for each card, read title, price, rating, image, link.
- **Expected:** title, price, image, link present on 100% of cards; rating and delivery present where applicable; no "undefined"/empty text.

### TC-06 Relevance
- **Steps:** check titles for laptop-ness.
- **Expected:** ≥ 90% of cards mention Laptop/Notebook/known laptop series; accessories (bags, stands, chargers) are not the majority.

### TC-07 Sort: Price Low to High
- **Expected:** prices non-decreasing (ignoring sponsored/ads blocks); all still ≤ 50,000.

### TC-08 Sort: Price High to Low
- **Expected:** prices non-increasing; max value ≤ 50,000.

### TC-09 Sort: Avg. Customer Review
- **Expected:** ratings broadly descending; sort control displays selected option.

### TC-10 Additional filters (brand / RAM / SSD)
- **Steps:** apply one brand (e.g., HP) on top of the price filter.
- **Expected:** all results match the brand; price filter still active; count decreases.

### TC-11 Discount and MRP consistency
- **Expected:** MRP > price for discounted cards; discount % matches calculation within ±1%.

### TC-12 Pagination
- **Steps:** go to page 2 via Next.
- **Expected:** new results shown, no duplicates of page 1 (by ASIN), price filter persists, page number highlighted.

### TC-13 Product detail page (read-only)
- **Steps:** click the first non-sponsored result.
- **Expected:** PDP opens (URL has `/dp/`); title, price, rating match the card; specs section visible. **Do not** click Add to Cart / Buy Now.

### TC-14 Negative / edge cases
- Price filter min > max → validation or no results message, no crash.
- Query `laptops under 50000` (natural language) → results returned, mostly ≤ 50,000.
- Query with no matches (`zzzxqlaptop`) → "No results" message with suggestions.
- Back navigation from PDP preserves filter and sort.

### TC-15 Non-functional (smoke)
- Page load of results < 5 s on broadband; no console errors that break functionality; keyboard focus reaches search box and results; images have alt text; mobile viewport (Pixel 10) renders results list.

## 6. Expected Outcomes for the Search Workflow (summary)
1. Home page loads and search is available to guests.
2. Searching "laptops" returns a paginated list of laptop products.
3. With the ≤ ₹50,000 filter, **every** displayed price is ≤ ₹50,000 and the filter state is visible and persistent across sort, pagination and back navigation.
4. Each card shows title, price, image and link; rating, discount and delivery appear when applicable and are internally consistent.
5. Sorting reorders results correctly without dropping the price filter.
6. PDP data matches the card data.
7. No sign-in, cart or purchase action is ever performed.

## 7. Entry / Exit Criteria
- **Entry:** site reachable, no CAPTCHA, browser session clean.
- **Exit:** all P1 cases (TC-01 to TC-05, TC-07, TC-13) pass; no price above ₹50,000 found in non-sponsored results; defects logged for the rest.

## 8. Automation Notes (Playwright)
- Locators: `#twotabsearchtextbox`, `#nav-search-submit-button`, `[data-component-type="s-search-result"]`, `.a-price-whole`, `#s-result-sort-select`, `getByRole('link', { name: 'Next' })`.
- Parse prices with `parseInt(text.replace(/[,₹]/g, ''))`.
- Use auto-waiting assertions; avoid fixed sleeps; run with 1 worker and retries=1 to reduce bot-detection flakiness.
