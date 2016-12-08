'use strict';

describe('administration', function () {

    var username = element(by.id('username'));
    var password = element(by.id('password'));
    var accountMenu = element(by.id('account-menu'));
    var adminMenu = element(by.id('admin-menu'));
    var login = element(by.id('login'));
    var logout = element(by.id('logout'));

    beforeAll(function () {
        browser.get('/');

        accountMenu.click();
        login.click();

        username.sendKeys('admin');
        password.sendKeys('admin');
        element(by.css('button[type=submit]')).click();
    });

    beforeEach(function () {
        adminMenu.click();
    });

    it('should load user management', function () {
        element(by.css('[uisref="user-management"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Users/);
    });

    it('should load metrics', function () {
        element(by.css('[uisref="<%=jhiPrefix%>-metrics"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Application Metrics/);
    });

    it('should load health', function () {
        element(by.css('[uisref="<%=jhiPrefix%>-health"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Health Checks/);
    });

    it('should load configuration', function () {
        element(by.css('[uisref="<%=jhiPrefix%>-configuration"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Configuration/);
    });

    it('should load audits', function () {
        element(by.css('[uisref="audits"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Audits/);
    });

    it('should load logs', function () {
        element(by.css('[uisref="logs"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Logs/);
    });

    afterAll(function () {
        accountMenu.click();
        logout.click();
    });
});
