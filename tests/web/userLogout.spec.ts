/**
 * Test Case: Customer logout
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Log in with the configured valid customer credentials
 * 2) Navigate to Logout and verify the logout confirmation
 * 3) Continue to the homepage and verify guest account navigation
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Customer logout test @master @sanity @regression @web', async ({
    homePage,
    loginPage,
    logoutPage,
    myAccountPage,
    page,
}) => {
    const { email, password } = Helper.getLoginDetails();

    await test.step('1) Log in with the configured valid customer credentials', async () => {
        await homePage.clickMyAccount();
        await homePage.clickLogin();
        await page.waitForURL(/route=account\/login/);
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
        await loginPage.login(email, password);
        await page.waitForURL(/route=account\/account/);
        expect(await myAccountPage.isMyAccountPageExists()).toBeTruthy();
    });

    await test.step('2) Navigate to Logout and verify the logout confirmation', async () => {
        await homePage.clickMyAccount();
        expect(await homePage.isCustomerAccountMenuAvailable()).toBeTruthy();
        await homePage.clickLogout();
        await page.waitForURL(/route=account\/logout/);
        expect(await logoutPage.isLogoutPageExists()).toBeTruthy();
    });

    await test.step('3) Continue to the homepage and verify authenticated options are unavailable', async () => {
        await logoutPage.clickContinue();
        await page.waitForURL(/route=common\/home/);
        await expect(page).toHaveTitle('Your Store');
        await homePage.clickMyAccount();
        expect(await homePage.isGuestAccountMenuAvailable()).toBeTruthy();
    });

    console.log('✅ Customer logout completed successfully.');
});
