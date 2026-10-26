/**
 * Test Case: Add a product to the shopping cart
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Search for a known product and open its details
 * 2) Set the quantity and add the product to the cart
 * 3) Verify the cart summary, product, and quantity
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Add product to cart test @master @sanity @regression @web', async ({
    productSearchPage,
    productDetailsPage,
    shoppingCartPage,
    page,
}) => {
    const { productName, productQuantity, totalPrice } = Helper.getProductDetails();

    await test.step('1) Search for the known product and open its details', async () => {
        await productSearchPage.searchForProduct(productName);
        await page.waitForURL(/route=product\/search/);
        await productSearchPage.openProduct(productName);
        await page.waitForURL(/route=product\/product/);
        expect(await productDetailsPage.isProductDetailsPageExists(productName)).toBeTruthy();
    });

    await test.step('2) Set the requested quantity and add the product to the cart', async () => {
        await productDetailsPage.setQuantity(productQuantity);
        await productDetailsPage.addToCart();
        await expect.poll(() => productDetailsPage.getCartSummary()).toBe(
            `${productQuantity} item(s) - ${totalPrice}`,
        );
    });

    await test.step('3) Verify the product and quantity in the shopping cart', async () => {
        await shoppingCartPage.openShoppingCart();
        await page.waitForURL(/route=checkout\/cart/);
        expect(await shoppingCartPage.isShoppingCartPageExists()).toBeTruthy();
        expect(await shoppingCartPage.isProductInCart(productName)).toBeTruthy();
        expect(await shoppingCartPage.getProductQuantity(productName)).toBe(productQuantity);
    });

    console.log('✅ Product was added to the shopping cart with the requested quantity.');
});
