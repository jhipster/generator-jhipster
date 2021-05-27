import { browser, element, by } from 'protractor';

import NavBarPage from './../../../page-objects/navbar-page';
import SignInPage from './../../../page-objects/signin-page';
import RecordComponentsPage from './record.page-object';
import RecordUpdatePage from './record-update.page-object';
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

describe('Record e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let recordComponentsPage: RecordComponentsPage;
  let recordUpdatePage: RecordUpdatePage;
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
    recordComponentsPage = new RecordComponentsPage();
    recordComponentsPage = await recordComponentsPage.goToPage(navBarPage);
  });

  it('should load Records', async () => {
    expect(await recordComponentsPage.title.getText()).to.match(/Records/);
    expect(await recordComponentsPage.createButton.isEnabled()).to.be.true;
  });

  /* it('should create and delete Records', async () => {
        const beforeRecordsCount = await isVisible(recordComponentsPage.noRecords) ? 0 : await getRecordsCount(recordComponentsPage.table);
        recordUpdatePage = await recordComponentsPage.goToCreateRecord();
        await recordUpdatePage.enterData();

        expect(await recordComponentsPage.createButton.isEnabled()).to.be.true;
        await waitUntilDisplayed(recordComponentsPage.table);
        await waitUntilCount(recordComponentsPage.records, beforeRecordsCount + 1);
        expect(await recordComponentsPage.records.count()).to.eq(beforeRecordsCount + 1);

        await recordComponentsPage.deleteRecord();
        if(beforeRecordsCount !== 0) {
          await waitUntilCount(recordComponentsPage.records, beforeRecordsCount);
          expect(await recordComponentsPage.records.count()).to.eq(beforeRecordsCount);
        } else {
          await waitUntilDisplayed(recordComponentsPage.noRecords);
        }
    }); */

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
