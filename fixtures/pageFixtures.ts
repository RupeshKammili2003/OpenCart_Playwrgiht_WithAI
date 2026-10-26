import { test as base } from '@playwright/test';
import dotenv from 'dotenv';
import { AccountCreatedPage } from '../pages/AccountCreatedPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { LogoutPage } from '../pages/LogoutPage';
import { MyAccountPage } from '../pages/MyAccountPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { ProductSearchPage } from '../pages/ProductSearchPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ShoppingCartPage } from '../pages/ShoppingCartPage';

dotenv.config();

const APP_URL = process.env.WEB_APP_URL;

if (!APP_URL) {
    throw new Error('WEB_APP_URL must be configured to run web tests.');
}

type PageFixtures = {
    homePage: HomePage;
    loginPage: LoginPage;
    logoutPage: LogoutPage;
    registerPage: RegisterPage;
    accountCreatedPage: AccountCreatedPage;
    myAccountPage: MyAccountPage;
    productSearchPage: ProductSearchPage;
    productDetailsPage: ProductDetailsPage;
    shoppingCartPage: ShoppingCartPage;
};

export const test = base.extend<PageFixtures>({
    homePage: async ({ page }, use) => {
        await page.goto(APP_URL);
        await use(new HomePage(page));
    },
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    logoutPage: async ({ page }, use) => {
        await use(new LogoutPage(page));
    },
    registerPage: async ({ page }, use) => {
        await use(new RegisterPage(page));
    },
    accountCreatedPage: async ({ page }, use) => {
        await use(new AccountCreatedPage(page));
    },
    myAccountPage: async ({ page }, use) => {
        await use(new MyAccountPage(page));
    },
    productSearchPage: async ({ page, homePage: _homePage }, use) => {
        await use(new ProductSearchPage(page));
    },
    productDetailsPage: async ({ page, homePage: _homePage }, use) => {
        await use(new ProductDetailsPage(page));
    },
    shoppingCartPage: async ({ page, homePage: _homePage }, use) => {
        await use(new ShoppingCartPage(page));
    },
});

test.afterEach(async ({ page, context }) => {
    if (!page.isClosed()) {
        await page.close();
    }
    if (!context.pages().length) {
        await context.close();
    }
});

export { expect } from '@playwright/test';
