# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\productSearch.spec.ts >> Product search test @master @sanity @regression @web
- Location: tests\web\productSearch.spec.ts:14:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('textbox', { name: 'Search', exact: true })

```

# Test source

```ts
  1  | import { Locator, Page } from '@playwright/test';
  2  | 
  3  | export class ProductSearchPage {
  4  |     // Locators
  5  |     private readonly searchInput: Locator;
  6  |     private readonly searchButton: Locator;
  7  |     private readonly resultsHeading: Locator;
  8  |     private readonly productResultNames: Locator;
  9  | 
  10 |     constructor(page: Page) {
  11 |         // Initialize locators with CSS selectors
  12 |         this.searchInput = page.getByRole('textbox', { name: 'Search', exact: true });
  13 |         this.searchButton = page.locator('#search').getByRole('button');
  14 |         this.resultsHeading = page.locator('#content').getByRole('heading', { level: 1 });
  15 |         this.productResultNames = page.locator('#content .product-thumb h4 a');
  16 |     }
  17 | 
  18 |     /**
  19 |      * Searches the catalog for the specified product.
  20 |      * @param productName - Product name to search for
  21 |      */
  22 |     async searchForProduct(productName: string): Promise<void> {
> 23 |         await this.searchInput.fill(productName);
     |                                ^ Error: locator.fill: Target page, context or browser has been closed
  24 |         await this.searchButton.click();
  25 |     }
  26 | 
  27 |     /**
  28 |      * Returns the search results heading.
  29 |      * @returns Promise<string> - Heading text
  30 |      */
  31 |     async getResultsHeading(): Promise<string> {
  32 |         return this.resultsHeading.innerText();
  33 |     }
  34 | 
  35 |     /**
  36 |      * Checks for an exact product name in the search results.
  37 |      * @param productName - Expected product name
  38 |      * @returns Promise<boolean> - true when an exact product result is visible
  39 |      */
  40 |     async isProductDisplayed(productName: string): Promise<boolean> {
  41 |         return this.productResultNames.getByText(productName, { exact: true }).isVisible();
  42 |     }
  43 | }
  44 | 
```