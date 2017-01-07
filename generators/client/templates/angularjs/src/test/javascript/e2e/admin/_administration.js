'use strict';
<%_
let elementGetter = `getText()`;
if (enableTranslation) {
    elementGetter = `getAttribute('data-translate')`;
} _%>

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
        const expect1 = /userManagement.home.title/;
        <%_ } else { _%>
        const expect1 = /Users/;
        <%_ } _%>
        element.all(by.css('h2')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
    });

    it('should load metrics', function () {
        element(by.css('[ui-sref="<%=jhiPrefix%>-metrics"]')).click();
        <%_ if (enableTranslation) { _%>
        const expect1 = /metrics.title/;
        <%_ } else { _%>
        const expect1 = /Application Metrics/;
        <%_ } _%>
        element.all(by.css('h2')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
    });

    it('should load health', function () {
        element(by.css('[ui-sref="<%=jhiPrefix%>-health"]')).click();
        <%_ if (enableTranslation) { _%>
        const expect1 = /health.title/;
        <%_ } else { _%>
        const expect1 = /Health Checks/;
        <%_ } _%>
        element.all(by.css('h2')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
    });

    it('should load configuration', function () {
        element(by.css('[ui-sref="<%=jhiPrefix%>-configuration"]')).click();
        <%_ if (enableTranslation) { _%>
        const expect1 = /configuration.title/;
        <%_ } else { _%>
        const expect1 = /Configuration/;
        <%_ } _%>
        element.all(by.css('h2')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
    });

    it('should load audits', function () {
        element(by.css('[ui-sref="audits"]')).click();
        <%_ if (enableTranslation) { _%>
        const expect1 = /audits.title/;
        <%_ } else { _%>
        const expect1 = /Audits/;
        <%_ } _%>
        element.all(by.css('h2')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
    });

    it('should load logs', function () {
        element(by.css('[ui-sref="logs"]')).click();
        <%_ if (enableTranslation) { _%>
        const expect1 = /logs.title/;
        <%_ } else { _%>
        const expect1 = /Logs/;
        <%_ } _%>
        element.all(by.css('h2')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
    });

    afterAll(function () {
        accountMenu.click();
        logout.click();
    });
});
