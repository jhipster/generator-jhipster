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
        element(by.css('[ui-sref="user-management"]')).click();
        <%_ if (enableTranslation) { _%>
        element.all(by.css('h2')).first().getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/userManagement.home.title/);
        });
        <%_ } else { _%>
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Users/);
        <%_ } _%>
    });

    it('should load metrics', function () {
        element(by.css('[ui-sref="<%=jhiPrefix%>-metrics"]')).click();
        <%_ if (enableTranslation) { _%>
        element.all(by.css('h2')).first().getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/metrics.title/);
        });
        <%_ } else { _%>
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Application Metrics/);
        <%_ } _%>
    });

    it('should load health', function () {
        element(by.css('[ui-sref="<%=jhiPrefix%>-health"]')).click();
        <%_ if (enableTranslation) { _%>
        element.all(by.css('h2')).first().getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/health.title/);
        });
        <%_ } else { _%>
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Health Checks/);
        <%_ } _%>
    });

    it('should load configuration', function () {
        element(by.css('[ui-sref="<%=jhiPrefix%>-configuration"]')).click();
        <%_ if (enableTranslation) { _%>
        element.all(by.css('h2')).first().getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/configuration.title/);
        });
        <%_ } else { _%>
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Configuration/);
        <%_ } _%>
    });

    it('should load audits', function () {
        element(by.css('[ui-sref="audits"]')).click();
        <%_ if (enableTranslation) { _%>
        element.all(by.css('h2')).first().getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/audits.title/);
        });
        <%_ } else { _%>
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Audits/);
        <%_ } _%>
    });

    it('should load logs', function () {
        element(by.css('[ui-sref="logs"]')).click();
        <%_ if (enableTranslation) { _%>
        element.all(by.css('h2')).first().getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/logs.title/);
        });
        <%_ } else { _%>
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Logs/);
        <%_ } _%>
    });

    afterAll(function () {
        accountMenu.click();
        logout.click();
    });
});
