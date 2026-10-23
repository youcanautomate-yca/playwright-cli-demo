import { expect, type Locator, type Page } from '@playwright/test';
import { ProductDetailPage } from './product-detail.page';
import { parsePrice } from '../utils/price';

export class ResultCard {
  private readonly priceWhole: Locator;
  private readonly titleText: Locator;
  private readonly titleLink: Locator;

  constructor(
    private readonly page: Page,
    private readonly card: Locator,
  ) {
    this.priceWhole = card.locator('.a-price-whole').first();
    this.titleText = card.locator('[data-cy="title-recipe"], h2').first();
    this.titleLink = card.locator('a:has(h2)').first();
  }

  asin() {
    return this.card.getAttribute('data-asin');
  }

  async price() {
    return parsePrice(await this.priceWhole.innerText());
  }

  async title() {
    return (await this.titleText.innerText()).replace(/\s+/g, ' ').trim();
  }

  /** The title link opens the product in a new tab. */
  async open(): Promise<ProductDetailPage> {
    const [tab] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.titleLink.click(),
    ]);
    const detail = new ProductDetailPage(tab);
    await detail.waitUntilLoaded();
    return detail;
  }
}

export class SearchResultsPage {
  private readonly cards: Locator;

  constructor(private readonly page: Page) {
    this.cards = page.locator('[data-component-type="s-search-result"]');
  }

  async goto(query: string, maxPriceRupees?: number) {
    const rh = maxPriceRupees ? `&rh=${encodeURIComponent(`p_36:-${maxPriceRupees * 100}`)}` : '';
    await this.page.goto(`/s?k=${encodeURIComponent(query)}${rh}`);
    await expect(this.cards.first()).toBeVisible();
  }

  firstOrganicResult(titleMatch?: RegExp): ResultCard {
    let organic = this.cards.filter({ hasNotText: 'Sponsored' });
    if (titleMatch) organic = organic.filter({ hasText: titleMatch });
    return new ResultCard(this.page, organic.first());
  }
}
