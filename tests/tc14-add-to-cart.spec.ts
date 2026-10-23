import { test, expect } from '@playwright/test';
import { SearchResultsPage } from '../pages/search-results.page';

// TC-14: search "iphone 17", open a result, add it to the cart (guest) and validate the cart.
// Never signs in, never proceeds to checkout or buys.

const QUERY = 'iphone 17';

test('TC-14 add iPhone 17 to cart and validate cart', async ({ page }) => {
  const results = new SearchResultsPage(page);
  await results.goto(QUERY);

  const card = results.firstOrganicResult(/iphone 17/i);
  const asin = await card.asin();
  expect(asin).toBeTruthy();
  const cardPrice = await card.price();

  const detail = await card.open();
  await detail.expectUrlForAsin(asin);
  const title = await detail.getTitle();
  expect(title.toLowerCase()).toContain('iphone 17');
  const price = await detail.getPrice();
  expect(price).toBeGreaterThan(0);
  expect(price).toBe(cardPrice);

  await detail.addToCart();

  const cart = await detail.openCart();
  await cart.expectLoaded();
  expect(await cart.itemCount()).toBe(1);
  await cart.expectItemInCart(asin);
  await cart.expectTitleStartsWith(asin, title);
  await cart.expectQuantity(asin, 1);
  await cart.expectSubtotalLabel(1);
  expect(await cart.getSubtotal()).toBe(price);

  await detail.close();
});
