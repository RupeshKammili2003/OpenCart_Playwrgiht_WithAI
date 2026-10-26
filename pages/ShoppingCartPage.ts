import { Locator, Page } from '@playwright/test';

export class ShoppingCartPage {
    // Locators
    private readonly page: Page;
    private readonly shoppingCartLink: Locator;
    private readonly cartHeading: Locator;
    private readonly cartRows: Locator;
    private readonly cartTotalRow: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.shoppingCartLink = page.getByRole('navigation').getByRole('link', { name: /Shopping Cart/ }).first();
        this.cartHeading = page.locator('#content').getByRole('heading', { level: 1 });
        this.cartRows = page.locator('#content table tbody tr');
        this.cartTotalRow = page.getByRole('row').filter({
            has: page.getByText('Total:', { exact: true }),
        });
    }

    /**
     * Opens the shopping cart from the storefront navigation.
     */
    async openShoppingCart(): Promise<void> {
        await this.shoppingCartLink.click();
    }

    /**
     * Verifies that the shopping cart page is displayed.
     * @returns Promise<boolean> - true when the cart heading is visible
     */
    async isShoppingCartPageExists(): Promise<boolean> {
        return this.cartHeading.isVisible();
    }

    /**
     * Checks that the requested product is present in the cart.
     * @param productName - Expected product name
     * @returns Promise<boolean> - true when a cart row contains the exact product link
     */
    async isProductInCart(productName: string): Promise<boolean> {
        const productRow = this.getProductRow(productName);
        return productRow.getByText(productName, { exact: true }).isVisible();
    }

    /**
     * Returns the quantity shown for the requested product.
     * @param productName - Product name whose cart quantity should be read
     * @returns Promise<string> - Cart quantity
     */
    async getProductQuantity(productName: string): Promise<string> {
        const productRow = this.getProductRow(productName);
        return productRow.locator('input[name^="quantity"]').inputValue();
    }

    /**
     * Returns the displayed unit price for the requested product.
     * @param productName - Product whose unit price should be read
     * @returns Promise<string> - Displayed unit price
     */
    async getProductUnitPrice(productName: string): Promise<string> {
        return (await this.getProductRow(productName).locator('td').nth(4).innerText()).trim();
    }

    /**
     * Returns the displayed line total for the requested product.
     * @param productName - Product whose line total should be read
     * @returns Promise<string> - Displayed product line total
     */
    async getProductLineTotal(productName: string): Promise<string> {
        return (await this.getProductRow(productName).locator('td').nth(5).innerText()).trim();
    }

    /**
     * Returns the final total displayed in the cart totals table.
     * @returns Promise<string> - Displayed cart total
     */
    async getCartTotal(): Promise<string> {
        return (await this.cartTotalRow.locator('td').nth(1).innerText()).trim();
    }

    private getProductRow(productName: string): Locator {
        return this.cartRows.filter({
            has: this.page.getByRole('link', { name: productName, exact: true }),
        });
    }
}
