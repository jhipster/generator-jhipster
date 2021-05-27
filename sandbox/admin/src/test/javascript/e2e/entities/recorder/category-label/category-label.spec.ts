import { browser, element, by } from 'protractor';

import NavBarPage from './../../../page-objects/navbar-page';
import SignInPage from './../../../page-objects/signin-page';
import CategoryLabelComponentsPage from './category-label.page-object';
import CategoryLabelUpdatePage from './category-label-update.page-object';
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

describe('CategoryLabel e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let categoryLabelComponentsPage: CategoryLabelComponentsPage;
  let categoryLabelUpdatePage: CategoryLabelUpdatePage;
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
    categoryLabelComponentsPage = new CategoryLabelComponentsPage();
    categoryLabelComponentsPage = await categoryLabelComponentsPage.goToPage(navBarPage);
  });

  it('should load CategoryLabels', async () => {
    expect(await categoryLabelComponentsPage.title.getText()).to.match(/Category Labels/);
    expect(await categoryLabelComponentsPage.createButton.isEnabled()).to.be.true;
  });

  it('should create and delete CategoryLabels', async () => {
    const beforeRecordsCount = (await isVisible(categoryLabelComponentsPage.noRecords))
      ? 0
      : await getRecordsCount(categoryLabelComponentsPage.table);
    categoryLabelUpdatePage = await categoryLabelComponentsPage.goToCreateCategoryLabel();
    await categoryLabelUpdatePage.enterData();

    expect(await categoryLabelComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilDisplayed(categoryLabelComponentsPage.table);
    await waitUntilCount(categoryLabelComponentsPage.records, beforeRecordsCount + 1);
    expect(await categoryLabelComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);

    await categoryLabelComponentsPage.deleteCategoryLabel();
    if (beforeRecordsCount !== 0) {
      await waitUntilCount(categoryLabelComponentsPage.records, beforeRecordsCount);
      expect(await categoryLabelComponentsPage.records.count()).to.eq(beforeRecordsCount);
    } else {
      await waitUntilDisplayed(categoryLabelComponentsPage.noRecords);
    }
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
