import { test, expect } from '@playwright/test';
import { SearchResultsPage } from '../pages/search-results.page';

// TC-13: open the first non-sponsored result and verify the detail page (read-only).
// Never clicks Add to Cart / Buy Now and never signs in.

const QUERY = 'laptops';
const MAX_PRICE = 50000;

test('TC-13 product detail page matches search result card', async ({ page }) => {
  const results = new SearchResultsPage(page);
  await results.goto(QUERY, MAX_PRICE);

  const card = results.firstOrganicResult();
  const asin = await card.asin();
  const cardPrice = await card.price();
  const cardTitle = await card.title();
  expect(cardPrice).toBeLessThanOrEqual(MAX_PRICE);

  const detail = await card.open();

  await detail.expectUrlForAsin(asin);
  await detail.expectTitleStartsWith(cardTitle);

  // Price is numeric, within budget and the same as on the card
  const detailPrice = await detail.getPrice();
  expect(detailPrice).toBeGreaterThan(0);
  expect(detailPrice).toBeLessThanOrEqual(MAX_PRICE);
  expect(detailPrice).toBe(cardPrice);

  // Rating, if the product has one, is between 0 and 5
  const rating = await detail.getRating();
  if (rating !== null) {
    expect(rating).toBeGreaterThan(0);
    expect(rating).toBeLessThanOrEqual(5);
  }

  await detail.expectProductInfoVisible();
  await detail.close();
});
