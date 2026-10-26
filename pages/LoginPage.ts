import { Locator, Page } from '@playwright/test';

export class LoginPage {
    // Locators
    private readonly loginFormHeading: Locator;
    private readonly emailInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly loginWarning: Locator;

    constructor(page: Page) {
        // Initialize locators with CSS selectors
        this.loginFormHeading = page.getByText('I am a returning customer', { exact: true });
        this.emailInput = page.getByPlaceholder('E-Mail Address');
        this.passwordInput = page.getByPlaceholder('Password', { exact: true });
        this.loginButton = page.getByRole('button', { name: 'Login', exact: true });
        this.loginWarning = page.locator('.alert-danger');
    }

    /**
     * Verifies that the returning-customer login form is displayed.
     * @returns Promise<boolean> - true when the login form heading is visible
     */
    async isLoginPageExists(): Promise<boolean> {
        return this.loginFormHeading.isVisible();
    }

    /**
     * Enters credentials and submits the login form.
     * @param email - Customer email address
     * @param password - Customer password
     */
    async login(email: string, password: string): Promise<void> {
        try {
            await this.emailInput.fill(email);
            await this.passwordInput.fill(password);
            await this.loginButton.click();
        } catch (error) {
            console.log(`Error submitting customer login: ${error}`);
            throw error;
        }
    }

    /**
     * Waits for and returns the login warning displayed after a rejected attempt.
     * @returns Promise<string> - The visible login warning text
     */
    async getLoginWarningText(): Promise<string> {
        await this.loginWarning.waitFor({ state: 'visible' });
        return this.loginWarning.innerText();
    }
}
