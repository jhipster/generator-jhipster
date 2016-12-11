import { browser, element, by, $ } from 'protractor';

describe('account', () => {

    var username = element(by.id('username'));
    var password = element(by.id('password'));
    var accountMenu = element(by.id('account-menu'));
    var login = element(by.id('login'));
    var logout = element(by.id('logout'));

    beforeAll(() => {
        browser.get('/');
    });

    it('should fail to login with bad password', () => {
        expect(element.all(by.css('h1')).first().getText()).toMatch(/Welcome, Java Hipster!/);
        accountMenu.click();
        login.click();

        username.sendKeys('admin');
        password.sendKeys('foo');
        element(by.css('button[type=submit]')).click();

        var error = $('.alert-danger').getText();
        expect(error).toMatch(/Failed to sign in!/);
    });

    it('should login successfully with admin account', () => {
        expect(element.all(by.css('h1')).first().getText()).toMatch(/Welcome, Java Hipster!/);

        username.clear();
        username.sendKeys('admin');
        password.clear();
        password.sendKeys('admin');
        element(by.css('button[type=submit]')).click();
        browser.waitForAngular();

        expect($('.alert-success').getText()).toMatch(/You are logged in as user "admin"/);
    });

    it('should be able to update settings', () => {
        accountMenu.click();
        element(by.css('[uisref="settings"]')).click();

        expect(element(by.css('h2')).getText()).toMatch(/User settings for \[admin\]/);
        element(by.css('button[type=submit]')).click();

        var message = $('.alert-success').getText();
        expect(message).toMatch(/Settings saved!/);
    });

    it('should be able to update password', () => {
        accountMenu.click();
        element(by.css('[uisref="password"]')).click();

        expect(element.all(by.css('h2')).first().getText()).toMatch(/Password for \[admin\]/);
        password.sendKeys('newpassword');
        element(by.id('confirmPassword')).sendKeys('newpassword');
        element(by.css('button[type=submit]')).click();

        var message = $('.alert-success').getText();
        expect(message).toMatch(/Password changed!/);
        accountMenu.click();
        logout.click();

        accountMenu.click();
        login.click();

        username.sendKeys('admin');
        password.sendKeys('newpassword');
        element(by.css('button[type=submit]')).click();

        accountMenu.click();
        element(by.css('[uisref="password"]')).click();
        // change back to default
        password.clear();
        password.sendKeys('admin');
        element(by.id('confirmPassword')).clear();
        element(by.id('confirmPassword')).sendKeys('admin');
        element(by.css('button[type=submit]')).click();
    });

    afterAll(() => {
        accountMenu.click();
        logout.click();
    });
});
