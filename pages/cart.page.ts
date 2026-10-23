import { expect, type Locator, type Page } from '@playwright/test';
import { parsePrice } from '../utils/price';

export class CartPage {
  private readonly items: Locator;
  private readonly subtotal: Locator;
  private readonly subtotalLabel: Locator;

  constructor(private readonly page: Page) {
    this.items = page.locator('[data-name="Active Items"] [data-asin]');
    this.subtotal = page.locator('#sc-subtotal-amount-activecart, #sc-subtotal-amount-buybox').first();
    this.subtotalLabel = page.locator('#sc-subtotal-label-activecart, #sc-subtotal-label-buybox').first();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/cart/);
    await expect(this.items.first()).toBeVisible();
  }

  async itemCount() {
    return this.items.count();
  }

  item(asin: string | null) {
    return this.items.and(this.page.locator(`[data-asin="${asin}"]`));
  }

  async expectItemInCart(asin: string | null) {
    await expect(this.item(asin)).toHaveCount(1);
  }

  async expectTitleStartsWith(asin: string | null, productTitle: string) {
    const firstWords = productTitle.split(/\\s+/).slice(0, 3).join(' ');
    await expect(this.item(asin)).toContainText(firstWords, { ignoreCase: true });
  }

  async expectQuantity(asin: string | null, quantity: number) {
    await expect(this.item(asin)).toHaveAttribute('data-quantity', String(quantity));
  }

  async getSubtotal(): Promise<number> {
    await expect(this.subtotal).toBeVisible();
    return parsePrice(await this.subtotal.innerText());
  }

  async expectSubtotalLabel(itemCount: number) {
    const noun = itemCount === 1 ? 'item' : 'items';
    await expect(this.subtotalLabel).toContainText(`(${itemCount} ${noun})`);
  }
}
