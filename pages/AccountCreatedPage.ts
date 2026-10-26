import { Locator, Page } from '@playwright/test';

export class AccountCreatedPage {
    // Locators
    private readonly confirmationHeading: Locator;

    constructor(page: Page) {
        // Initialize locators with CSS selectors
        this.confirmationHeading = page.getByRole('heading', {
            name: 'Your Account Has Been Created!',
            exact: true,
        });
    }

    /**
     * Verifies that the account-created confirmation is displayed.
     * @returns Promise<boolean> - true when the confirmation heading is visible
     */
    async isAccountCreatedPageExists(): Promise<boolean> {
        return this.confirmationHeading.isVisible();
    }
}
