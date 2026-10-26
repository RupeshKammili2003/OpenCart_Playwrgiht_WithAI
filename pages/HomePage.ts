import { Page, Locator } from '@playwright/test';

export class HomePage {
    private readonly page: Page;

    // Locators
    private readonly myAccountLink: Locator;
    private readonly registerLink: Locator;
    private readonly loginLink: Locator;
    private readonly accountMenuLoginLink: Locator;
    private readonly accountPageLink: Locator;
    private readonly accountMenuLogoutLink: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.myAccountLink = page.getByRole('navigation').getByRole('link', { name: /My Account/ }).first();
        this.registerLink = page.getByRole('link', { name: 'Register', exact: true }).first();
        this.loginLink = page.getByRole('link', { name: 'Login', exact: true }).first();
        this.accountMenuLoginLink = page.locator('#top-links').getByRole('link', { name: 'Login', exact: true });
        this.accountPageLink = page.locator('#top-links').getByRole('link', { name: 'My Account', exact: true });
        this.accountMenuLogoutLink = page.locator('#top-links').getByRole('link', { name: 'Logout', exact: true });
    }

    /**
     * Opens the My Account navigation menu.
     */
    async clickMyAccount(): Promise<void> {
        await this.myAccountLink.click();
    }

    /**
     * Navigates to the registration page.
     */
    async clickRegister(): Promise<void> {
        await this.registerLink.click();
    }

    /**
     * Navigates to the customer login page.
     */
    async clickLogin(): Promise<void> {
        await this.loginLink.click();
    }

    /**
     * Navigates to the customer's account page from the account menu.
     */
    async clickAccountPage(): Promise<void> {
        await this.accountPageLink.click();
    }

    /**
     * Navigates to the logout confirmation page from the account menu.
     */
    async clickLogout(): Promise<void> {
        await this.accountMenuLogoutLink.click();
    }

    /**
     * Checks that the signed-in account menu exposes its Logout link.
     * @returns Promise<boolean> - true when the account menu indicates an authenticated session
     */
    async isCustomerAccountMenuAvailable(): Promise<boolean> {
        return this.accountMenuLogoutLink.isVisible();
    }

    /**
     * Checks that the expanded account menu shows guest options but no authenticated option.
     * @returns Promise<boolean> - true when Login is visible and Logout is not visible
     */
    async isGuestAccountMenuAvailable(): Promise<boolean> {
        return (await this.accountMenuLoginLink.isVisible()) && !(await this.accountMenuLogoutLink.isVisible());
    }
}
