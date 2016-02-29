'use strict';

describe('<%= entityClass %> e2e test', function () {

    var username = element(by.id('username'));
    var password = element(by.id('password'));
    var entityMenu = element(by.id('entity-menu'));
    var accountMenu = element(by.id('account-menu'));
    var login = element(by.id('login'));
    var logout = element(by.id('logout'));

    beforeAll(function () {
        browser.get('/');
        browser.driver.wait(protractor.until.elementIsVisible(element(by.css('h1'))));

        accountMenu.click();
        login.click();

        username.sendKeys('admin');
        password.sendKeys('admin');
        element(by.css('button[type=submit]')).click();
    });

    beforeEach(function () {
        accountMenu.click();
    });

    it('should load user management', function () {
        element(by.css('[ui-sref="user-management"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Users/);
    });

    it('should load metrics', function () {
        element(by.css('[ui-sref="metrics"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Application Metrics/);
    });

    it('should load health', function () {
        element(by.css('[ui-sref="health"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Health Checks/);
    });

    it('should load configuration', function () {
        element(by.css('[ui-sref="configuration"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Configuration/);
    });

    it('should load audits', function () {
        element(by.css('[ui-sref="audits"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Audits/);
    });

    it('should load logs', function () {
        element(by.css('[ui-sref="logs"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Logs/);
    });

    it('should load api docs', function () {
        element(by.css('[ui-sref="docs"]')).click();
        expect(element.all(by.css('iframe')).isDisplayed()).toBeTruthy();
    });

    afterAll(function () {
        accountMenu.click();
        logout.click();
    });
});
