import { element, by, browser } from 'protractor';

import NavBarPage from '../../page-objects/navbar-page';
import SignInPage from '../../page-objects/signin-page';
import { waitUntilDisplayed } from '../../util/utils';

const expect = chai.expect;

describe('Administration', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  const username = process.env.E2E_USERNAME ?? 'admin';
  const password = process.env.E2E_PASSWORD ?? 'admin';

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.waitUntilDisplayed();

    await signInPage.username.sendKeys(username);
    await signInPage.password.sendKeys(password);
    await signInPage.loginButton.click();
    await signInPage.waitUntilHidden();

    await waitUntilDisplayed(navBarPage.adminMenu);
  });

  it('should load user management', async () => {
    await navBarPage.clickOnAdminMenuItem('user-management');
    const heading = element(by.id('user-management-page-heading'));
    await waitUntilDisplayed(heading);
    // Title should be equal to 'Users'
    expect(await heading.isPresent()).to.be.true;
  });

  it('should load metrics', async () => {
    await navBarPage.clickOnAdminMenuItem('metrics');
    await waitUntilDisplayed(element(by.id('metrics-page-heading')));
    expect(await element(by.id('metrics-page-heading')).getText()).to.eq('Application Metrics');
  });

  it('should load health', async () => {
    await navBarPage.clickOnAdminMenuItem('health');
    expect(await element(by.id('health-page-heading')).getText()).to.eq('Health Checks');
  });

  it('should load configuration', async () => {
    await navBarPage.clickOnAdminMenuItem('configuration');
    expect(await element(by.id('configuration-page-heading')).getText()).to.eq('Configuration');
  });

  it('should load logs', async () => {
    await navBarPage.clickOnAdminMenuItem('logs');
    expect(await element(by.id('logs-page-heading')).getText()).to.eq('Logs');
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
