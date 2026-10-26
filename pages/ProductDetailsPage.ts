import { Locator, Page } from '@playwright/test';

export class ProductDetailsPage {
    // Locators
    private readonly productHeading: Locator;
    private readonly quantityInput: Locator;
    private readonly addToCartButton: Locator;
    private readonly cartSummary: Locator;

    constructor(page: Page) {
        // Initialize locators with CSS selectors
        this.productHeading = page.locator('#content').getByRole('heading', { level: 1 });
        this.quantityInput = page.getByRole('textbox', { name: 'Qty', exact: true });
        this.addToCartButton = page.getByRole('button', { name: 'Add to Cart', exact: true });
        this.cartSummary = page.locator('#cart-total');
    }

    /**
     * Verifies that the expected product details are displayed.
     * @param productName - Expected product name
     * @returns Promise<boolean> - true when the product heading matches
     */
    async isProductDetailsPageExists(productName: string): Promise<boolean> {
        return (await this.productHeading.isVisible()) && (await this.productHeading.innerText()) === productName;
    }

    /**
     * Sets the product quantity.
     * @param quantity - Quantity to add
     */
    async setQuantity(quantity: string): Promise<void> {
        await this.quantityInput.fill(quantity);
    }

    /**
     * Adds the product to the cart.
     */
    async addToCart(): Promise<void> {
        await this.addToCartButton.click();
    }

    /**
     * Returns the cart summary shown after adding the product.
     * @returns Promise<string> - Cart item count and total
     */
    async getCartSummary(): Promise<string> {
        return (await this.cartSummary.innerText()).trim();
    }
}
