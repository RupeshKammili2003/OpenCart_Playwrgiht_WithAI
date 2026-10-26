import { Locator, Page } from '@playwright/test';

export class MyAccountPage {
    // Locators
    private readonly accountHeading: Locator;
    private readonly editAccountInformationLink: Locator;

    constructor(page: Page) {
        // Initialize locators with CSS selectors
        this.accountHeading = page.locator('#content').getByRole('heading', { name: 'My Account', exact: true });
        this.editAccountInformationLink = page.getByRole('link', {
            name: 'Edit your account information',
            exact: true,
        });
    }

    /**
     * Verifies that the customer account page is displayed.
     * @returns Promise<boolean> - true when the account heading and edit link are visible
     */
    async isMyAccountPageExists(): Promise<boolean> {
        return (await this.accountHeading.isVisible()) && (await this.editAccountInformationLink.isVisible());
    }
}
