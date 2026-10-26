import { Locator, Page } from '@playwright/test';

export class ProductSearchPage {
    // Locators
    private readonly searchInput: Locator;
    private readonly searchButton: Locator;
    private readonly resultsHeading: Locator;
    private readonly productResultNames: Locator;

    constructor(page: Page) {
        // Initialize locators with CSS selectors
        this.searchInput = page.getByRole('textbox', { name: 'Search', exact: true });
        this.searchButton = page.locator('#search').getByRole('button');
        this.resultsHeading = page.locator('#content').getByRole('heading', { level: 1 });
        this.productResultNames = page.locator('#content .product-thumb h4 a');
    }

    /**
     * Searches the catalog for the specified product.
     * @param productName - Product name to search for
     */
    async searchForProduct(productName: string): Promise<void> {
        await this.searchInput.fill(productName);
        await this.searchButton.click();
    }

    /**
     * Returns the search results heading.
     * @returns Promise<string> - Heading text
     */
    async getResultsHeading(): Promise<string> {
        return this.resultsHeading.innerText();
    }

    /**
     * Checks for an exact product name in the search results.
     * @param productName - Expected product name
     * @returns Promise<boolean> - true when an exact product result is visible
     */
    async isProductDisplayed(productName: string): Promise<boolean> {
        return this.productResultNames.getByText(productName, { exact: true }).isVisible();
    }

    /**
     * Opens the exact product result.
     * @param productName - Product name to open
     */
    async openProduct(productName: string): Promise<void> {
        await this.productResultNames.getByText(productName, { exact: true }).click();
    }
}
