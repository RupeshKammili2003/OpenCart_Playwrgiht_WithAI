/**
 * Test Case: Data-driven customer login
 *
 * Tags: @master @sanity @regression @datadriven @web
 *
 * Each test uses one independent row from testdata/opencart_logindata.json.
 */

import { test, expect } from '../../fixtures/pageFixtures';
import { DataProvider } from '../../utils/DataReader';
import path from 'node:path';

type LoginTestData = {
    testName?: string;
    TestName?: string;
    email: string;
    password: string;
    expected: string;
};

type NormalizedLoginTestData = {
    testName: string;
    email: string;
    password: string;
    expected: 'success' | 'failure';
};

function isLoginTestData(value: unknown): value is LoginTestData {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const row = value as Record<string, unknown>;
    const expected = typeof row.expected === 'string' ? row.expected.trim().toLowerCase() : '';

    return (
        (typeof row.testName === 'string' || typeof row.TestName === 'string') &&
        typeof row.email === 'string' &&
        typeof row.password === 'string' &&
        (expected === 'success' || expected === 'failure')
    );
}

const loginDataPath = path.join(process.cwd(), 'testdata', 'opencart_logindata.json');
const rawLoginData: unknown = DataProvider.readJson(loginDataPath);

if (!Array.isArray(rawLoginData) || !rawLoginData.every(isLoginTestData)) {
    throw new Error(`Login test data must be an array of valid rows: ${loginDataPath}`);
}

const loginData: NormalizedLoginTestData[] = rawLoginData.map((row) => ({
    testName: row.testName || row.TestName || 'Login scenario',
    email: row.email,
    password: row.password,
    expected: row.expected.trim().toLowerCase() as NormalizedLoginTestData['expected'],
}));

if (loginData.length === 0) {
    throw new Error(`No login test rows were found in ${loginDataPath}`);
}

loginData.forEach((loginCase, index) => {
    const email = loginCase.email.trim() === '' ? '' : loginCase.email;
    const password = loginCase.password.trim() === '' ? '' : loginCase.password;
    const testName = `${loginCase.testName} - row ${index + 1} @master @regression @datadriven @web`;

    test(testName, async ({ homePage, loginPage, myAccountPage, page }) => {
        await test.step('1) Navigate to My Account > Login', async () => {
            await homePage.clickMyAccount();
            await homePage.clickLogin();
            await page.waitForURL(/route=account\/login/);
            expect(await loginPage.isLoginPageExists()).toBeTruthy();
        });

        await test.step('2) Submit credentials from this test-data row', async () => {
            await loginPage.login(email, password);
        });

        if (loginCase.expected === 'success') {
            await test.step('3) Verify successful login and the My Account page', async () => {
                await page.waitForURL(/route=account\/account/);
                expect(await myAccountPage.isMyAccountPageExists()).toBeTruthy();
                await homePage.clickMyAccount();
                expect(await homePage.isCustomerAccountMenuAvailable()).toBeTruthy();
            });
        } else {
            await test.step('3) Verify login failure and guest account navigation', async () => {
                await expect(page).toHaveURL(/route=account\/login/);
                expect(await loginPage.getLoginWarningText()).toBe(
                    'Warning: No match for E-Mail Address and/or Password.',
                );
                await homePage.clickMyAccount();
                expect(await homePage.isGuestAccountMenuAvailable()).toBeTruthy();
            });
        }

        console.log(`✅ Data-driven login case completed: ${loginCase.testName} (row ${index + 1}).`);
    });
});
