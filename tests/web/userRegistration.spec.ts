/**
 * Test Case: Successful customer registration
 *
 * Tags: @master @sanity @regression @end-to-end @web
 *
 * Steps:
 * 1) Navigate to My Account > Register
 * 2) Complete the registration form and accept the Privacy Policy
 * 3) Verify account creation and account navigation
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('Customer registration test @master @sanity @regression @end-to-end @web', async ({
    homePage,
    registerPage,
    accountCreatedPage,
    myAccountPage,
    page,
}) => {
    const registrationData = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: RandomDataUtil.getUniqueEmail(),
        telephone: RandomDataUtil.getPhoneNumber(),
        password: RandomDataUtil.getPassword(12),
    };

    await test.step('1) Navigate to My Account > Register', async () => {
        await homePage.clickMyAccount();
        await homePage.clickRegister();
        await page.waitForURL(/route=account\/register/);
        expect(await registerPage.isRegistrationPageExists()).toBeTruthy();
    });

    await test.step('2) Complete valid customer details and accept the Privacy Policy', async () => {
        await registerPage.completeRegistration(registrationData);
    });

    await test.step('3) Submit the registration form', async () => {
        await registerPage.submitRegistration();
        await expect(page).toHaveURL(/route=account\/success/);
    });

    await test.step('4) Verify the account-created confirmation', async () => {
        expect(await accountCreatedPage.isAccountCreatedPageExists()).toBeTruthy();
    });

    await test.step('5) Verify the new account is available in account navigation', async () => {
        await homePage.clickMyAccount();
        await expect.poll(() => homePage.isCustomerAccountMenuAvailable()).toBeTruthy();
        await homePage.clickAccountPage();
        await expect.poll(() => myAccountPage.isMyAccountPageExists()).toBeTruthy();
    });

    console.log('✅ Customer registration completed successfully.');
});
