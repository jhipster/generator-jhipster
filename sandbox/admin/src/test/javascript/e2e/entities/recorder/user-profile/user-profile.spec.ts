import { browser, element, by } from 'protractor';

import NavBarPage from './../../../page-objects/navbar-page';
import SignInPage from './../../../page-objects/signin-page';
import UserProfileComponentsPage from './user-profile.page-object';
import UserProfileUpdatePage from './user-profile-update.page-object';
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

describe('UserProfile e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let userProfileComponentsPage: UserProfileComponentsPage;
  let userProfileUpdatePage: UserProfileUpdatePage;
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
    userProfileComponentsPage = new UserProfileComponentsPage();
    userProfileComponentsPage = await userProfileComponentsPage.goToPage(navBarPage);
  });

  it('should load UserProfiles', async () => {
    expect(await userProfileComponentsPage.title.getText()).to.match(/User Profiles/);
    expect(await userProfileComponentsPage.createButton.isEnabled()).to.be.true;
  });

  it('should create and delete UserProfiles', async () => {
    const beforeRecordsCount = (await isVisible(userProfileComponentsPage.noRecords))
      ? 0
      : await getRecordsCount(userProfileComponentsPage.table);
    userProfileUpdatePage = await userProfileComponentsPage.goToCreateUserProfile();
    await userProfileUpdatePage.enterData();

    expect(await userProfileComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilDisplayed(userProfileComponentsPage.table);
    await waitUntilCount(userProfileComponentsPage.records, beforeRecordsCount + 1);
    expect(await userProfileComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);

    await userProfileComponentsPage.deleteUserProfile();
    if (beforeRecordsCount !== 0) {
      await waitUntilCount(userProfileComponentsPage.records, beforeRecordsCount);
      expect(await userProfileComponentsPage.records.count()).to.eq(beforeRecordsCount);
    } else {
      await waitUntilDisplayed(userProfileComponentsPage.noRecords);
    }
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
