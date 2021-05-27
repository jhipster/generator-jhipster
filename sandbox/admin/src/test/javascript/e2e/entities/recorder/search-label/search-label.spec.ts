import { browser, element, by } from 'protractor';

import NavBarPage from './../../../page-objects/navbar-page';
import SignInPage from './../../../page-objects/signin-page';
import SearchLabelComponentsPage from './search-label.page-object';
import SearchLabelUpdatePage from './search-label-update.page-object';
import {
  waitUntilDisplayed,
  waitUntilAnyDisplayed,
  click,
  getRecordsCount,
  waitUntilHidden,
  waitUntilCount,
  isVisible,
} from '../../../util/utils';

const expect = chai.expect;

describe('SearchLabel e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let searchLabelComponentsPage: SearchLabelComponentsPage;
  let searchLabelUpdatePage: SearchLabelUpdatePage;
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
    await waitUntilDisplayed(navBarPage.entityMenu);
    await waitUntilDisplayed(navBarPage.adminMenu);
    await waitUntilDisplayed(navBarPage.accountMenu);
  });

  beforeEach(async () => {
    await browser.get('/');
    await waitUntilDisplayed(navBarPage.entityMenu);
    searchLabelComponentsPage = new SearchLabelComponentsPage();
    searchLabelComponentsPage = await searchLabelComponentsPage.goToPage(navBarPage);
  });

  it('should load SearchLabels', async () => {
    expect(await searchLabelComponentsPage.title.getText()).to.match(/Search Labels/);
    expect(await searchLabelComponentsPage.createButton.isEnabled()).to.be.true;
  });

  it('should create and delete SearchLabels', async () => {
    const beforeRecordsCount = (await isVisible(searchLabelComponentsPage.noRecords))
      ? 0
      : await getRecordsCount(searchLabelComponentsPage.table);
    searchLabelUpdatePage = await searchLabelComponentsPage.goToCreateSearchLabel();
    await searchLabelUpdatePage.enterData();

    expect(await searchLabelComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilDisplayed(searchLabelComponentsPage.table);
    await waitUntilCount(searchLabelComponentsPage.records, beforeRecordsCount + 1);
    expect(await searchLabelComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);

    await searchLabelComponentsPage.deleteSearchLabel();
    if (beforeRecordsCount !== 0) {
      await waitUntilCount(searchLabelComponentsPage.records, beforeRecordsCount);
      expect(await searchLabelComponentsPage.records.count()).to.eq(beforeRecordsCount);
    } else {
      await waitUntilDisplayed(searchLabelComponentsPage.noRecords);
    }
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
