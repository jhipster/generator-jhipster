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

        accountMenu.click();
        login.click();

        username.sendKeys('admin');
        password.sendKeys('admin');
        element(by.css('button[type=submit]')).click();
    });

    it('should load <%= entityClassPlural %>', function () {
        entityMenu.click();
        element.all(by.css('[ui-sref="<%= entityStateName %>"]')).first().click().then(function() {
            <%_ if (enableTranslation) { _%>
            element.all(by.css('h2')).first().getAttribute('data-translate').then(function (value) {
                expect(value).toMatch(/<%= angularAppName %>.<%= entityTranslationKey %>.home.title/);
            });
            <%_ } else { _%>
            expect(element.all(by.css('h2')).first().getText()).toMatch(/<%= entityClassPluralHumanized %>/);
            <%_ } _%>
        });
    });

    it('should load create <%= entityClass %> dialog', function () {
        element(by.css('[ui-sref="<%= entityStateName %>.new"]')).click().then(function() {
            <%_ if (enableTranslation) { _%>
            element(by.css('h4.modal-title')).getAttribute('data-translate').then(function (value) {
                expect(value).toMatch(/<%= angularAppName %>.<%= entityTranslationKey %>.home.createOrEditLabel/);
            });
            <%_ } else { _%>
            expect(element(by.css('h4.modal-title')).getText()).toMatch(/Create or edit a <%= entityClassHumanized %>/);
            <%_ } _%>
            element(by.css('button.close')).click();
        });
    });

    afterAll(function () {
        accountMenu.click();
        logout.click();
    });
});
