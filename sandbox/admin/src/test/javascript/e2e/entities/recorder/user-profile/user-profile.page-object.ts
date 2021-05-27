import { element, by, ElementFinder, ElementArrayFinder } from 'protractor';

import { waitUntilAnyDisplayed, waitUntilDisplayed, click, waitUntilHidden, isVisible } from '../../../util/utils';

import NavBarPage from './../../../page-objects/navbar-page';

import UserProfileUpdatePage from './user-profile-update.page-object';

const expect = chai.expect;
export class UserProfileDeleteDialog {
  deleteModal = element(by.className('modal'));
  private dialogTitle: ElementFinder = element(by.id('adminApp.recorderUserProfile.delete.question'));
  private confirmButton = element(by.id('jhi-confirm-delete-userProfile'));

  getDialogTitle() {
    return this.dialogTitle;
  }

  async clickOnConfirmButton() {
    await this.confirmButton.click();
  }
}

export default class UserProfileComponentsPage {
  createButton: ElementFinder = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('div table .btn-danger'));
  title: ElementFinder = element(by.id('user-profile-heading'));
  noRecords: ElementFinder = element(by.css('#app-view-container .table-responsive div.alert.alert-warning'));
  table: ElementFinder = element(by.css('#app-view-container div.table-responsive > table'));

  records: ElementArrayFinder = this.table.all(by.css('tbody tr'));

  getDetailsButton(record: ElementFinder) {
    return record.element(by.css('a.btn.btn-info.btn-sm'));
  }

  getEditButton(record: ElementFinder) {
    return record.element(by.css('a.btn.btn-primary.btn-sm'));
  }

  getDeleteButton(record: ElementFinder) {
    return record.element(by.css('a.btn.btn-danger.btn-sm'));
  }

  async goToPage(navBarPage: NavBarPage) {
    await navBarPage.getEntityPage('user-profile');
    await waitUntilAnyDisplayed([this.noRecords, this.table]);
    return this;
  }

  async goToCreateUserProfile() {
    await this.createButton.click();
    return new UserProfileUpdatePage();
  }

  async deleteUserProfile() {
    const deleteButton = this.getDeleteButton(this.records.last());
    await click(deleteButton);

    const userProfileDeleteDialog = new UserProfileDeleteDialog();
    await waitUntilDisplayed(userProfileDeleteDialog.deleteModal);
    expect(await userProfileDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/adminApp.recorderUserProfile.delete.question/);
    await userProfileDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(userProfileDeleteDialog.deleteModal);

    expect(await isVisible(userProfileDeleteDialog.deleteModal)).to.be.false;
  }
}
