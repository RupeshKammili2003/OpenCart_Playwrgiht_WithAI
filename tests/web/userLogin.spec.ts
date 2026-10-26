/**
 * Test Case: Successful customer login
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Navigate to My Account > Login
 * 2) Sign in using the configured valid customer credentials
 * 3) Verify the authenticated My Account area
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Customer login test @master @sanity @regression @web', async ({
    homePage,
    loginPage,
    myAccountPage,
    page,
}) => {
    const { email, password } = Helper.getLoginDetails();

    await test.step('1) Navigate to My Account > Login', async () => {
        await homePage.clickMyAccount();
        await homePage.clickLogin();
        await page.waitForURL(/route=account\/login/);
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
    });

    await test.step('2) Submit the configured valid customer credentials', async () => {
        await loginPage.login(email, password);
    });

    await test.step('3) Verify successful authentication and My Account dashboard', async () => {
        await page.waitForURL(/route=account\/account/);
        expect(await myAccountPage.isMyAccountPageExists()).toBeTruthy();
        await homePage.clickMyAccount();
        expect(await homePage.isCustomerAccountMenuAvailable()).toBeTruthy();
    });

    console.log('✅ Customer login completed successfully.');
});
