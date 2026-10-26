/**
 * Test Case: Invalid customer login
 *
 * Tags: @master @sanity @regression @web
 *
 * Steps:
 * 1) Navigate to My Account > Login
 * 2) Submit invalid customer credentials from the configured test data
 * 3) Verify the warning and confirm the customer remains unauthenticated
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { DataProvider } from '../../utils/DataReader';
import path from 'node:path';

type LoginTestData = {
    testName: string;
    email: string;
    password: string;
    expected: string;
};

const loginData = DataProvider.readJson(
    path.join(process.cwd(), 'testdata', 'opencart_logindata.json'),
) as LoginTestData[];

const invalidLoginData = loginData.find(
    (data) => data.expected === 'failure' && data.email.trim() !== '' && data.password.trim() !== '',
);

if (!invalidLoginData) {
    throw new Error('No invalid login data with non-empty credentials was found in opencart_logindata.json.');
}

test('Customer invalid login test @master @sanity @regression @web', async ({
    homePage,
    loginPage,
    page,
}) => {
    await test.step('1) Navigate to My Account > Login', async () => {
        await homePage.clickMyAccount();
        await homePage.clickLogin();
        await page.waitForURL(/route=account\/login/);
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
    });

    await test.step('2) Submit invalid credentials from the configured test data', async () => {
        await loginPage.login(invalidLoginData.email, invalidLoginData.password);
    });

    await test.step('3) Verify the expected warning and rejected authentication', async () => {
        await expect(page).toHaveURL(/route=account\/login/);
        expect(await loginPage.getLoginWarningText()).toBe(
            'Warning: No match for E-Mail Address and/or Password.',
        );
        await homePage.clickMyAccount();
        expect(await homePage.isGuestAccountMenuAvailable()).toBeTruthy();
    });

    console.log('✅ Invalid customer login was rejected as expected.');
});
