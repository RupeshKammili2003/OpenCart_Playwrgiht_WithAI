import { Locator, Page } from '@playwright/test';

export type RegistrationData = {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    password: string;
};

export class RegisterPage {
    // Locators
    private readonly page: Page;
    private readonly firstNameInput: Locator;
    private readonly lastNameInput: Locator;
    private readonly emailInput: Locator;
    private readonly telephoneInput: Locator;
    private readonly passwordInput: Locator;
    private readonly passwordConfirmInput: Locator;
    private readonly privacyPolicyCheckbox: Locator;
    private readonly continueButton: Locator;
    private readonly pageHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.firstNameInput = page.getByPlaceholder('First Name');
        this.lastNameInput = page.getByPlaceholder('Last Name');
        this.emailInput = page.getByPlaceholder('E-Mail');
        this.telephoneInput = page.getByPlaceholder('Telephone');
        this.passwordInput = page.getByPlaceholder('Password', { exact: true });
        this.passwordConfirmInput = page.getByPlaceholder('Password Confirm');
        this.privacyPolicyCheckbox = page.getByRole('checkbox');
        this.continueButton = page.getByRole('button', { name: 'Continue', exact: true });
        this.pageHeading = page.getByRole('heading', { name: 'Register Account', exact: true });
    }

    /**
     * Verifies that the registration page is displayed.
     * @returns Promise<boolean> - true when the registration heading is visible
     */
    async isRegistrationPageExists(): Promise<boolean> {
        return this.pageHeading.isVisible();
    }

    /**
     * Fills the registration form and accepts the Privacy Policy.
     * @param registrationData - Customer details for the new account
     */
    async completeRegistration(registrationData: RegistrationData): Promise<void> {
        try {
            await this.firstNameInput.fill(registrationData.firstName);
            await this.lastNameInput.fill(registrationData.lastName);
            await this.emailInput.fill(registrationData.email);
            await this.telephoneInput.fill(registrationData.telephone);
            await this.passwordInput.fill(registrationData.password);
            await this.passwordConfirmInput.fill(registrationData.password);
            await this.privacyPolicyCheckbox.check();
        } catch (error) {
            console.log(`Error completing registration form: ${error}`);
            throw error;
        }
    }

    /**
     * Submits the registration form.
     */
    async submitRegistration(): Promise<void> {
        await this.continueButton.click();
    }
}
