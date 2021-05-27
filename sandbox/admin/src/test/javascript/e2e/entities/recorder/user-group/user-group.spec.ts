import { browser, element, by } from 'protractor';

import NavBarPage from './../../../page-objects/navbar-page';
import SignInPage from './../../../page-objects/signin-page';
import UserGroupComponentsPage from './user-group.page-object';
import UserGroupUpdatePage from './user-group-update.page-object';
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

describe('UserGroup e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let userGroupComponentsPage: UserGroupComponentsPage;
  let userGroupUpdatePage: UserGroupUpdatePage;
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
    userGroupComponentsPage = new UserGroupComponentsPage();
    userGroupComponentsPage = await userGroupComponentsPage.goToPage(navBarPage);
  });

  it('should load UserGroups', async () => {
    expect(await userGroupComponentsPage.title.getText()).to.match(/User Groups/);
    expect(await userGroupComponentsPage.createButton.isEnabled()).to.be.true;
  });

  it('should create and delete UserGroups', async () => {
    const beforeRecordsCount = (await isVisible(userGroupComponentsPage.noRecords))
      ? 0
      : await getRecordsCount(userGroupComponentsPage.table);
    userGroupUpdatePage = await userGroupComponentsPage.goToCreateUserGroup();
    await userGroupUpdatePage.enterData();

    expect(await userGroupComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilDisplayed(userGroupComponentsPage.table);
    await waitUntilCount(userGroupComponentsPage.records, beforeRecordsCount + 1);
    expect(await userGroupComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);

    await userGroupComponentsPage.deleteUserGroup();
    if (beforeRecordsCount !== 0) {
      await waitUntilCount(userGroupComponentsPage.records, beforeRecordsCount);
      expect(await userGroupComponentsPage.records.count()).to.eq(beforeRecordsCount);
    } else {
      await waitUntilDisplayed(userGroupComponentsPage.noRecords);
    }
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
