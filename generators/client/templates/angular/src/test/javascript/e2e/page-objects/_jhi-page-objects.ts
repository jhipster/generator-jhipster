import { element, by, ElementFinder<% if (authenticationType === 'oauth2') { _%>, browser<%_ } %> } from 'protractor';

<%_
let elementGetter = `getText()`;
if (enableTranslation) {
    elementGetter = `getAttribute('jhiTranslate')`;
} _%>
export class NavBarPage {
    entityMenu = element(by.id('entity-menu'));
    accountMenu = element(by.id('account-menu'));
    adminMenu: ElementFinder;
    signIn = element(by.id('login'));
    register = element(by.css('[routerLink="register"]'));
    signOut = element(by.id('logout'));
    passwordMenu = element(by.css('[routerLink="password"]'));
    settingsMenu = element(by.css('[routerLink="settings"]'));

    constructor(asAdmin?: Boolean) {
        if (asAdmin) {
            this.adminMenu = element(by.id('admin-menu'));
        }
    }

    clickOnEntityMenu() {
        return this.entityMenu.click();
    }

    clickOnAccountMenu() {
        return this.accountMenu.click();
    }

    clickOnAdminMenu() {
        return this.adminMenu.click();
    }

    clickOnSignIn() {
        return this.signIn.click();
    }

    clickOnRegister() {
        return this.signIn.click();
    }

    clickOnSignOut() {
        return this.signOut.click();
    }

    clickOnPasswordMenu() {
        return this.passwordMenu.click();
    }

    clickOnSettingsMenu() {
        return this.settingsMenu.click();
    }

    clickOnEntity(entityName: string) {
        return element(by.css('[routerLink="' + entityName + '"]')).click();
    }

    clickOnAdmin(entityName: string) {
        return element(by.css('[routerLink="' + entityName + '"]')).click();
    }

    getSignInPage() {
        this.clickOnAccountMenu();
        this.clickOnSignIn();
        return new SignInPage();
    }
    <%_ if (authenticationType !== 'oauth2') { _%>
    getPasswordPage() {
        this.clickOnAccountMenu();
        this.clickOnPasswordMenu();
        return new PasswordPage();
    }

    getSettingsPage() {
        this.clickOnAccountMenu();
        this.clickOnSettingsMenu();
        return new SettingsPage();
    }
    <%_ } _%>

    goToEntity(entityName: string) {
        this.clickOnEntityMenu();
        return this.clickOnEntity(entityName);
    }

    goToSignInPage() {
        this.clickOnAccountMenu();
        this.clickOnSignIn();
    }

    goToPasswordMenu() {
        this.clickOnAccountMenu();
        this.clickOnPasswordMenu();
    }

    autoSignOut() {
        this.clickOnAccountMenu();
        this.clickOnSignOut();
    }
}

export class SignInPage {
    <%_ if (authenticationType !== 'oauth2') { _%>
    username = element(by.id('username'));
    password = element(by.id('password'));
    loginButton = element(by.css('button[type=submit]'));
    <%_ } else { _%>
    username = element(by.name('username'));
    password = element(by.name('password'));
    loginButton = element(by.css('input[type=submit]'));
    <%_ } _%>

    setUserName(username) {
        this.username.sendKeys(username);
    }

    getUserName() {
        return this.username.getAttribute('value');
    }

    clearUserName() {
        this.username.clear();
    }

    setPassword(password) {
        this.password.sendKeys(password);
    }

    getPassword() {
        return this.password.getAttribute('value');
    }

    clearPassword() {
        this.password.clear();
    }
    <%_ if (authenticationType !== 'oauth2') { _%>

    autoSignInUsing(username: string, password: string) {
        this.setUserName(username);
        this.setPassword(password);
        return this.login();
    }
    <%_ } else { _%>

    loginWithOAuth(username: string, password: string) {

        // Entering non angular site, tell webdriver to switch to synchronous mode.
        browser.waitForAngularEnabled(false);

        this.username.isPresent().then(() => {
            this.username.sendKeys(username);
            this.password.sendKeys(password);
            this.loginButton.click();
        }).catch((error) => {
            browser.waitForAngularEnabled(true);
        });
    }
    <%_ } _%>

    login() {
        return this.loginButton.click();
    }
}
<%_ if (authenticationType !== 'oauth2') { _%>
export class PasswordPage {
    password = element(by.id('password'));
    confirmPassword = element(by.id('confirmPassword'));
    saveButton = element(by.css('button[type=submit]'));
    title = element.all(by.css('h2')).first();

    setPassword(password) {
        this.password.sendKeys(password);
    }

    getPassword() {
        return this.password.getAttribute('value');
    }

    clearPassword() {
        this.password.clear();
    }

    setConfirmPassword(confirmPassword) {
        this.confirmPassword.sendKeys(confirmPassword);
    }

    getConfirmPassword() {
        return this.confirmPassword.getAttribute('value');
    }

    clearConfirmPassword() {
        this.confirmPassword.clear();
    }

    getTitle() {
        return this.title.<%- elementGetter %>;
    }

    save() {
        return this.saveButton.click();
    }
}

export class SettingsPage {
    firstName = element(by.id('firstName'));
    lastName = element(by.id('lastName'));
    email = element(by.id('email'));
    saveButton = element(by.css('button[type=submit]'));
    title = element.all(by.css('h2')).first();

    setFirstName(firstName) {
        this.firstName.sendKeys(firstName);
    }

    getFirstName() {
        return this.firstName.getAttribute('value');
    }

    clearFirstName() {
        this.firstName.clear();
    }

    setLastName(lastName) {
        this.lastName.sendKeys(lastName);
    }

    getLastName() {
        return this.lastName.getAttribute('value');
    }

    clearLastName() {
        this.lastName.clear();
    }

    setEmail(email) {
        this.email.sendKeys(email);
    }

    getEmail() {
        return this.email.getAttribute('value');
    }

    clearEmail() {
        this.email.clear();
    }

    getTitle() {
        return this.title.<%- elementGetter %>;
    }

    save() {
        return this.saveButton.click();
    }
}
<%_ } _%>
