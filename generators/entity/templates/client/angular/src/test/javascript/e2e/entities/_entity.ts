import { browser, element, by, $ } from 'protractor';

describe('<%= entityClass %> e2e test', () => {

    const username = element(by.id('username'));
    const password = element(by.id('password'));
    const entityMenu = element(by.id('entity-menu'));
    const accountMenu = element(by.id('account-menu'));
    const login = element(by.id('login'));
    const logout = element(by.id('logout'));

    beforeAll(() => {
        browser.get('/');

        accountMenu.click();
        login.click();

        username.sendKeys('admin');
        password.sendKeys('admin');
        element(by.css('button[type=submit]')).click();
    });

    it('should load <%= entityClassPlural %>', () => {
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
