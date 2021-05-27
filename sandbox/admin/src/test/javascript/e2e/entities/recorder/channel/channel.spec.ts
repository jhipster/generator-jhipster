import { browser, element, by } from 'protractor';

import NavBarPage from './../../../page-objects/navbar-page';
import SignInPage from './../../../page-objects/signin-page';
import ChannelComponentsPage from './channel.page-object';
import ChannelUpdatePage from './channel-update.page-object';
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

describe('Channel e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let channelComponentsPage: ChannelComponentsPage;
  let channelUpdatePage: ChannelUpdatePage;
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
    channelComponentsPage = new ChannelComponentsPage();
    channelComponentsPage = await channelComponentsPage.goToPage(navBarPage);
  });

  it('should load Channels', async () => {
    expect(await channelComponentsPage.title.getText()).to.match(/Channels/);
    expect(await channelComponentsPage.createButton.isEnabled()).to.be.true;
  });

  it('should create and delete Channels', async () => {
    const beforeRecordsCount = (await isVisible(channelComponentsPage.noRecords)) ? 0 : await getRecordsCount(channelComponentsPage.table);
    channelUpdatePage = await channelComponentsPage.goToCreateChannel();
    await channelUpdatePage.enterData();

    expect(await channelComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilDisplayed(channelComponentsPage.table);
    await waitUntilCount(channelComponentsPage.records, beforeRecordsCount + 1);
    expect(await channelComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);

    await channelComponentsPage.deleteChannel();
    if (beforeRecordsCount !== 0) {
      await waitUntilCount(channelComponentsPage.records, beforeRecordsCount);
      expect(await channelComponentsPage.records.count()).to.eq(beforeRecordsCount);
    } else {
      await waitUntilDisplayed(channelComponentsPage.noRecords);
    }
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
