import { browser, element, by } from 'protractor';
<%_
let elementGetter = `getText()`;
if (enableTranslation) {
    elementGetter = `getAttribute('jhiTranslate')`;
} _%>

describe('account', () => {

    const username = element(by.id('username'));
    const password = element(by.id('password'));
    const accountMenu = element(by.id('account-menu'));
    const login = element(by.id('login'));
    const logout = element(by.id('logout'));

    beforeAll(() => {
        browser.get('/');
    });

    it('should fail to login with bad password', () => {
        <%_ if (enableTranslation) { _%>
        const expect1 = /home.title/;
        <%_ } else { _%>
        const expect1 = /Welcome, Java Hipster!/;
        <%_ } _%>
        element.all(by.css('h1')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
        accountMenu.click();
        login.click();

        username.sendKeys('admin');
        password.sendKeys('foo');
        element(by.css('button[type=submit]')).click();

        <%_ if (enableTranslation) { _%>
        const expect2 = /login.messages.error.authentication/;
        <%_ } else { _%>
        const expect2 = /Failed to sign in!/;
        <%_ } _%>
        element.all(by.css('.alert-danger')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect2);
        });
    });

    it('should login successfully with admin account', () => {
        <%_ if (enableTranslation) { _%>
        const expect1 = /login.title/;
        <%_ } else { _%>
        const expect1 = /Sign in/;
        <%_ } _%>
        element.all(by.css('.modal-content h1')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
        username.clear();
        username.sendKeys('admin');
        password.clear();
        password.sendKeys('admin');
        element(by.css('button[type=submit]')).click();

        browser.waitForAngular();

        <%_ if (enableTranslation) { _%>
        const expect2 = /home.logged.message/;
        <%_ } else { _%>
        const expect2 = /You are logged in as user "admin"/;
        <%_ } _%>
        element.all(by.css('.alert-success span')).<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect2);
        });
    });

    it('should be able to update settings', () => {
        accountMenu.click();
        element(by.css('[routerLink="settings"]')).click();

        <%_ if (enableTranslation) { _%>
        const expect1 = /settings.title/;
        <%_ } else { _%>
        const expect1 = /User settings for \[admin\]/;
        <%_ } _%>
        element.all(by.css('h2')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
        element(by.css('button[type=submit]')).click();

        <%_ if (enableTranslation) { _%>
        const expect2 = /settings.messages.success/;
        <%_ } else { _%>
        const expect2 = /Settings saved!/;
        <%_ } _%>
        element.all(by.css('.alert-success')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect2);
        });
    });

    it('should be able to update password', () => {
        accountMenu.click();
        element(by.css('[routerLink="password"]')).click();

        <%_ if (enableTranslation) { _%>
        const expect1 = /password.title/;
        <%_ } else { _%>
        const expect1 = /Password for \[admin\]/;
        <%_ } _%>
        element.all(by.css('h2')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect1);
        });
        password.sendKeys('newpassword');
        element(by.id('confirmPassword')).sendKeys('newpassword');
        element(by.css('button[type=submit]')).click();

        <%_ if (enableTranslation) { _%>
        const expect2 = /password.messages.success/;
        <%_ } else { _%>
        const expect2 = /Password changed!/;
        <%_ } _%>
        element.all(by.css('.alert-success')).first().<%- elementGetter %>.then((value) => {
            expect(value).toMatch(expect2);
        });
        accountMenu.click();
        logout.click();

        accountMenu.click();
        login.click();

        username.sendKeys('admin');
        password.sendKeys('newpassword');
        element(by.css('button[type=submit]')).click();

        accountMenu.click();
        element(by.css('[routerLink="password"]')).click();
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
