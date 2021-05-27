import { browser, element, by } from 'protractor';

import NavBarPage from './../../../page-objects/navbar-page';
import SignInPage from './../../../page-objects/signin-page';
import NodeComponentsPage from './node.page-object';
import NodeUpdatePage from './node-update.page-object';
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

describe('Node e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let nodeComponentsPage: NodeComponentsPage;
  let nodeUpdatePage: NodeUpdatePage;
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
    nodeComponentsPage = new NodeComponentsPage();
    nodeComponentsPage = await nodeComponentsPage.goToPage(navBarPage);
  });

  it('should load Nodes', async () => {
    expect(await nodeComponentsPage.title.getText()).to.match(/Nodes/);
    expect(await nodeComponentsPage.createButton.isEnabled()).to.be.true;
  });

  it('should create and delete Nodes', async () => {
    const beforeRecordsCount = (await isVisible(nodeComponentsPage.noRecords)) ? 0 : await getRecordsCount(nodeComponentsPage.table);
    nodeUpdatePage = await nodeComponentsPage.goToCreateNode();
    await nodeUpdatePage.enterData();

    expect(await nodeComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilDisplayed(nodeComponentsPage.table);
    await waitUntilCount(nodeComponentsPage.records, beforeRecordsCount + 1);
    expect(await nodeComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);

    await nodeComponentsPage.deleteNode();
    if (beforeRecordsCount !== 0) {
      await waitUntilCount(nodeComponentsPage.records, beforeRecordsCount);
      expect(await nodeComponentsPage.records.count()).to.eq(beforeRecordsCount);
    } else {
      await waitUntilDisplayed(nodeComponentsPage.noRecords);
    }
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
