import { Locator, Page } from '@playwright/test';

export class LogoutPage {
    // Locators
    private readonly logoutHeading: Locator;
    private readonly logoutConfirmation: Locator;
    private readonly continueLink: Locator;

    constructor(page: Page) {
        // Initialize locators with CSS selectors
        this.logoutHeading = page.locator('#content').getByRole('heading', { name: 'Account Logout', exact: true });
        this.logoutConfirmation = page.getByText(
            'You have been logged off your account. It is now safe to leave the computer.',
            { exact: true },
        );
        this.continueLink = page.locator('#content').getByRole('link', { name: 'Continue', exact: true });
    }

    /**
     * Verifies the logout confirmation page is displayed.
     * @returns Promise<boolean> - true when the heading and logged-off confirmation are visible
     */
    async isLogoutPageExists(): Promise<boolean> {
        return (await this.logoutHeading.isVisible()) && (await this.logoutConfirmation.isVisible());
    }

    /**
     * Returns to the storefront by clicking Continue.
     */
    async clickContinue(): Promise<void> {
        await this.continueLink.click();
    }
}
