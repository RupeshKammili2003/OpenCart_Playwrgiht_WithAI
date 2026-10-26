/**
 * Test Case: Product search
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Search for a known product
 * 2) Verify the search results page and exact product name
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Product search test @master @sanity @regression @web', async ({ productSearchPage, page }) => {
    const { productName } = Helper.getProductDetails();

    await test.step('1) Search for the known product', async () => {
        await productSearchPage.searchForProduct(productName);
        await page.waitForURL(/route=product\/search/);
        await expect(page).toHaveTitle(`Search - ${productName}`);
    });

    await test.step('2) Verify the search results and exact product match', async () => {
        await expect(page.locator('#content').getByRole('heading', { level: 1 })).toHaveText(
            `Search - ${productName}`,
        );
        expect(await productSearchPage.isProductDisplayed(productName)).toBeTruthy();
    });

    console.log('✅ Product search returned the expected product.');
});
