import { browser, element, by } from 'protractor';

import NavBarPage from './../../../page-objects/navbar-page';
import SignInPage from './../../../page-objects/signin-page';
import MachineLabelComponentsPage from './machine-label.page-object';
import MachineLabelUpdatePage from './machine-label-update.page-object';
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

describe('MachineLabel e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let machineLabelComponentsPage: MachineLabelComponentsPage;
  let machineLabelUpdatePage: MachineLabelUpdatePage;
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
    machineLabelComponentsPage = new MachineLabelComponentsPage();
    machineLabelComponentsPage = await machineLabelComponentsPage.goToPage(navBarPage);
  });

  it('should load MachineLabels', async () => {
    expect(await machineLabelComponentsPage.title.getText()).to.match(/Machine Labels/);
    expect(await machineLabelComponentsPage.createButton.isEnabled()).to.be.true;
  });

  it('should create and delete MachineLabels', async () => {
    const beforeRecordsCount = (await isVisible(machineLabelComponentsPage.noRecords))
      ? 0
      : await getRecordsCount(machineLabelComponentsPage.table);
    machineLabelUpdatePage = await machineLabelComponentsPage.goToCreateMachineLabel();
    await machineLabelUpdatePage.enterData();

    expect(await machineLabelComponentsPage.createButton.isEnabled()).to.be.true;
    await waitUntilDisplayed(machineLabelComponentsPage.table);
    await waitUntilCount(machineLabelComponentsPage.records, beforeRecordsCount + 1);
    expect(await machineLabelComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);

    await machineLabelComponentsPage.deleteMachineLabel();
    if (beforeRecordsCount !== 0) {
      await waitUntilCount(machineLabelComponentsPage.records, beforeRecordsCount);
      expect(await machineLabelComponentsPage.records.count()).to.eq(beforeRecordsCount);
    } else {
      await waitUntilDisplayed(machineLabelComponentsPage.noRecords);
    }
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
