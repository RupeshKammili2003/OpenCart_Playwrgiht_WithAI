/**
 * Test Case: End-to-end customer shopping journey
 *
 * Tags: @master @regression @end-to-end @web
 *
 * Steps:
 * 1) Register a new customer
 * 2) Log out and log in using the new account
 * 3) Search for a known product and add it to the cart
 * 4) Verify the product, quantity, price, and cart total
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

test('End-to-end shopping journey @master @regression @end-to-end @web', async ({
    homePage,
    registerPage,
    accountCreatedPage,
    logoutPage,
    loginPage,
    myAccountPage,
    productSearchPage,
    productDetailsPage,
    shoppingCartPage,
    page,
}) => {
    const customer = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: RandomDataUtil.getUniqueEmail(),
        telephone: RandomDataUtil.getPhoneNumber(),
        password: RandomDataUtil.getPassword(12),
    };
    const { productName, productQuantity, totalPrice } = Helper.getProductDetails();

    await test.step('1) Register a new customer with unique details', async () => {
        await homePage.clickMyAccount();
        await homePage.clickRegister();
        await page.waitForURL(/route=account\/register/);
        expect(await registerPage.isRegistrationPageExists()).toBeTruthy();
        await registerPage.completeRegistration(customer);
        await registerPage.submitRegistration();
        await page.waitForURL(/route=account\/success/);
        expect(await accountCreatedPage.isAccountCreatedPageExists()).toBeTruthy();
    });

    await test.step('2) Log out and sign back in with the new customer credentials', async () => {
        await homePage.clickMyAccount();
        expect(await homePage.isCustomerAccountMenuAvailable()).toBeTruthy();
        await homePage.clickLogout();
        await page.waitForURL(/route=account\/logout/);
        expect(await logoutPage.isLogoutPageExists()).toBeTruthy();
        await logoutPage.clickContinue();
        await page.waitForURL(/route=common\/home/);

        await homePage.clickMyAccount();
        await homePage.clickLogin();
        await page.waitForURL(/route=account\/login/);
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
        await loginPage.login(customer.email, customer.password);
        await page.waitForURL(/route=account\/account/);
        expect(await myAccountPage.isMyAccountPageExists()).toBeTruthy();
    });

    await test.step('3) Search for the known product and add it to the cart', async () => {
        await productSearchPage.searchForProduct(productName);
        await page.waitForURL(/route=product\/search/);
        expect(await productSearchPage.isProductDisplayed(productName)).toBeTruthy();
        await productSearchPage.openProduct(productName);
        await page.waitForURL(/route=product\/product/);
        expect(await productDetailsPage.isProductDetailsPageExists(productName)).toBeTruthy();
        await productDetailsPage.setQuantity(productQuantity);
        await productDetailsPage.addToCart();
        await expect.poll(() => productDetailsPage.getCartSummary()).toBe(
            `${productQuantity} item(s) - ${totalPrice}`,
        );
    });

    await test.step('4) Verify the product, quantity, price, and cart total', async () => {
        await shoppingCartPage.openShoppingCart();
        await page.waitForURL(/route=checkout\/cart/);
        expect(await shoppingCartPage.isShoppingCartPageExists()).toBeTruthy();
        expect(await shoppingCartPage.isProductInCart(productName)).toBeTruthy();
        expect(await shoppingCartPage.getProductQuantity(productName)).toBe(productQuantity);
        expect(await shoppingCartPage.getProductUnitPrice(productName)).toBe(totalPrice);
        expect(await shoppingCartPage.getProductLineTotal(productName)).toBe(totalPrice);
        expect(await shoppingCartPage.getCartTotal()).toBe(totalPrice);
    });

    console.log('✅ End-to-end shopping journey completed successfully.');
});
