'use strict';

describe('account', function () {

    var username = element(by.id('username'));
    var password = element(by.id('password'));
    var accountMenu = element(by.id('account-menu'));
    var login = element(by.id('login'));
    var logout = element(by.id('logout'));

    beforeAll(function () {
        browser.get('/');
    });

    it('should fail to login with bad password', function () {
        <%_ if (enableTranslation) { _%>
        element.all(by.css('h1')).first().getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/home.title/);
        });
        <%_ } else { _%>
        expect(element.all(by.css('h1')).first().getText()).toMatch(/Welcome, Java Hipster!/);
        <%_ } _%>
        accountMenu.click();
        login.click();

        username.sendKeys('admin');
        password.sendKeys('foo');
        element(by.css('button[type=submit]')).click();

        <%_ if (enableTranslation) { _%>
        element(by.css('.alert-danger')).getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/login.messages.error.authentication/);
        });
        <%_ } else { _%>
        expect(element(by.css('.alert-danger')).getText()).toMatch(/Failed to sign in!/);
        <%_ } _%>
    });

    it('should login successfully with admin account', function () {
        <%_ if (enableTranslation) { _%>
        element.all(by.css('h1')).first().getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/login.title/);
        });
        <%_ } else { _%>
        expect(element.all(by.css('h1')).first().getText()).toMatch(/Sign in/);
        <%_ } _%>

        username.clear().sendKeys('admin');
        password.clear().sendKeys('admin');
        element(by.css('button[type=submit]')).click();

        <%_ if (enableTranslation) { _%>
        element(by.css('.alert-success')).getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/home.logged.message/);
        });
        <%_ } else { _%>
        expect(element(by.css('.alert-success')).getText()).toMatch(/You are logged in as user "admin"/);
        <%_ } _%>
    });

    it('should be able to update settings', function () {
        accountMenu.click();
        element(by.css('[ui-sref="settings"]')).click();

        <%_ if (enableTranslation) { _%>
        element(by.css('h2')).getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/settings.title/);
        });
        <%_ } else { _%>
        expect(element(by.css('h2')).getText()).toMatch(/User settings for \[admin\]/);
        <%_ } _%>
        element(by.css('button[type=submit]')).click();

        <%_ if (enableTranslation) { _%>
        element(by.css('.alert-success')).getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/settings.messages.success/);
        });
        <%_ } else { _%>
        expect(element(by.css('.alert-success')).getText()).toMatch(/Settings saved!/);
        <%_ } _%>
    });

    it('should be able to update password', function () {
        accountMenu.click();
        element(by.css('[ui-sref="password"]')).click();

        <%_ if (enableTranslation) { _%>
        element.all(by.css('h2')).first().getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/password.title/);
        });
        <%_ } else { _%>
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Password for \[admin\]/);
        <%_ } _%>
        password.sendKeys('newpassword');
        element(by.id('confirmPassword')).sendKeys('newpassword');
        element(by.css('button[type=submit]')).click();

        <%_ if (enableTranslation) { _%>
        element(by.css('.alert-success')).getAttribute('data-translate').then(function (value) {
            expect(value).toMatch(/password.messages.success/);
        });
        <%_ } else { _%>
        expect(element(by.css('.alert-success')).getText()).toMatch(/Password changed!/);
        <%_ } _%>
        accountMenu.click();
        logout.click();

        accountMenu.click();
        login.click();

        username.sendKeys('admin');
        password.sendKeys('newpassword');
        element(by.css('button[type=submit]')).click();

        accountMenu.click();
        element(by.css('[ui-sref="password"]')).click();
        // change back to default
        password.clear().sendKeys('admin');
        element(by.id('confirmPassword')).clear().sendKeys('admin');
        element(by.css('button[type=submit]')).click();
    });

    afterAll(function () {
        accountMenu.click();
        logout.click();
    });
});
