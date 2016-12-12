import {browser, element, by, $} from 'protractor';

describe('administration', () => {

    var username = element(by.id('username'));
    var password = element(by.id('password'));
    var accountMenu = element(by.id('account-menu'));
    var adminMenu = element(by.id('admin-menu'));
    var login = element(by.id('login'));
    var logout = element(by.id('logout'));

    beforeAll(() => {
        browser.get('/');

        accountMenu.click();
        login.click();

        username.sendKeys('admin');
        password.sendKeys('admin');
        element(by.css('button[type=submit]')).click();
        browser.waitForAngular();
    });

    beforeEach(() => {
        adminMenu.click();
    });

    it('should load user management', () => {
        element(by.css('[uisref="user-management"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Users/);
    });

    it('should load metrics', () => {
        element(by.css('[uisref="jhi-metrics"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Application Metrics/);
    });

    it('should load health', () => {
        element(by.css('[uisref="jhi-health"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Health Checks/);
    });

    it('should load configuration', () => {
        element(by.css('[uisref="jhi-configuration"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Configuration/);
    });

    it('should load audits', () => {
        element(by.css('[uisref="audits"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Audits/);
    });

    it('should load logs', () => {
        element(by.css('[uisref="logs"]')).click();
        expect(element.all(by.css('h2')).first().getText()).toMatch(/Logs/);
    });

    afterAll(() => {
        accountMenu.click();
        logout.click();
    });
});
