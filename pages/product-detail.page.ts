import { expect, type Locator, type Page } from '@playwright/test';
import { CartPage } from './cart.page';
import { parsePrice } from '../utils/price';

export class ProductDetailPage {
  private readonly title: Locator;
  private readonly price: Locator;
  private readonly rating: Locator;
  private readonly productInfo: Locator;
  private readonly addToCartButton: Locator;
  private readonly addedConfirmation: Locator;

  constructor(private readonly page: Page) {
    this.title = page.locator('span#productTitle');
    this.price = page.locator('#corePrice_feature_div .a-price-whole, .priceToPay .a-price-whole').first();
    // the id is duplicated on the page
    this.rating = page.locator('#acrPopover').first();
    this.productInfo = page
      .locator('#feature-bullets, #productDetails_techSpec_section_1, #poExpander')
      .first();
    this.addToCartButton = page.locator('#add-to-cart-button');
    this.addedConfirmation = page.getByText('Added to cart', { exact: true }).locator('visible=true').first();
  }

  async waitUntilLoaded() {
    await this.page.waitForLoadState('domcontentloaded');
    // Amazon sometimes interposes a "Continue shopping" gate before the product page.
    const gate = this.page.getByRole('button', { name: 'Continue shopping' });
    if (await gate.isVisible()) {
      // The button lands on the home page, so reopen the product afterwards.
      const productUrl = this.page.url();
      await gate.click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.goto(productUrl);
    }
  }

  async expectUrlForAsin(asin: string | null) {
    await expect(this.page).toHaveURL(new RegExp(`/dp/${asin}`));
  }

  async expectTitleStartsWith(cardTitle: string) {
    await expect(this.title).toBeVisible();
    const firstWords = cardTitle.split(/\s+/).slice(0, 2).join(' ');
    await expect(this.title).toContainText(firstWords, { ignoreCase: true });
  }

  async getPrice(): Promise<number> {
    await expect(this.price).toBeVisible();
    return parsePrice(await this.price.innerText());
  }

  /** Returns the rating out of 5, or null when the product has none. */
  async getRating(): Promise<number | null> {
    if (!(await this.rating.count())) return null;
    return parseFloat((await this.rating.getAttribute('title')) ?? '');
  }

  async expectProductInfoVisible() {
    await expect(this.productInfo).toBeVisible();
  }

  async getTitle() {
    await expect(this.title).toBeVisible();
    return (await this.title.innerText()).replace(/\s+/g, ' ').trim();
  }

  async addToCart() {
    await expect(this.addToCartButton).toBeVisible();
    await this.addToCartButton.click();
    await expect(this.addedConfirmation).toBeVisible();
  }

  async openCart(): Promise<CartPage> {
    // The nav cart link is covered by the add-to-cart side sheet, so go by URL.
    await this.page.goto('/cart');
    return new CartPage(this.page);
  }

  async close() {
    await this.page.close();
  }
}
