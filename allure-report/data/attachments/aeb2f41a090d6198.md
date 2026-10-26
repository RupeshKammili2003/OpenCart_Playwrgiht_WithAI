# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web\addProductToCart.spec.ts >> Add product to cart test @master @sanity @regression @web
- Location: tests\web\addProductToCart.spec.ts:15:5

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "1 item(s) - $602.00"
Received: " 1 item(s) - $602.00"

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
```

# Test source

```ts
  1  | /**
  2  |  * Test Case: Add a product to the shopping cart
  3  |  *
  4  |  * Tags: @master @sanity @regression @web
  5  |  *
  6  |  * Steps:
  7  |  * 1) Search for a known product and open its details
  8  |  * 2) Set the quantity and add the product to the cart
  9  |  * 3) Verify the cart summary, product, and quantity
  10 |  */
  11 | 
  12 | import { test, expect } from '../../fixtures/pageFixtures';
  13 | import { Helper } from '../../utils/helper';
  14 | 
  15 | test('Add product to cart test @master @sanity @regression @web', async ({
  16 |     productSearchPage,
  17 |     productDetailsPage,
  18 |     shoppingCartPage,
  19 |     page,
  20 | }) => {
  21 |     const { productName, productQuantity, totalPrice } = Helper.getProductDetails();
  22 | 
  23 |     await test.step('1) Search for the known product and open its details', async () => {
  24 |         await productSearchPage.searchForProduct(productName);
  25 |         await page.waitForURL(/route=product\/search/);
  26 |         await productSearchPage.openProduct(productName);
  27 |         await page.waitForURL(/route=product\/product/);
  28 |         expect(await productDetailsPage.isProductDetailsPageExists(productName)).toBeTruthy();
  29 |     });
  30 | 
  31 |     await test.step('2) Set the requested quantity and add the product to the cart', async () => {
  32 |         await productDetailsPage.setQuantity(productQuantity);
  33 |         await productDetailsPage.addToCart();
> 34 |         await expect.poll(() => productDetailsPage.getCartSummary()).toBe(
     |                                                                      ^ Error: expect(received).toBe(expected) // Object.is equality
  35 |             `${productQuantity} item(s) - ${totalPrice}`,
  36 |         );
  37 |     });
  38 | 
  39 |     await test.step('3) Verify the product and quantity in the shopping cart', async () => {
  40 |         await shoppingCartPage.openShoppingCart();
  41 |         await page.waitForURL(/route=checkout\/cart/);
  42 |         expect(await shoppingCartPage.isShoppingCartPageExists()).toBeTruthy();
  43 |         expect(await shoppingCartPage.isProductInCart(productName)).toBeTruthy();
  44 |         expect(await shoppingCartPage.getProductQuantity(productName)).toBe(productQuantity);
  45 |     });
  46 | 
  47 |     console.log('✅ Product was added to the shopping cart with the requested quantity.');
  48 | });
  49 | 
```