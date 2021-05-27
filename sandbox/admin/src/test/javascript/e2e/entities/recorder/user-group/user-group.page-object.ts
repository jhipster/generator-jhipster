import { element, by, ElementFinder, ElementArrayFinder } from 'protractor';

import { waitUntilAnyDisplayed, waitUntilDisplayed, click, waitUntilHidden, isVisible } from '../../../util/utils';

import NavBarPage from './../../../page-objects/navbar-page';

import UserGroupUpdatePage from './user-group-update.page-object';

const expect = chai.expect;
export class UserGroupDeleteDialog {
  deleteModal = element(by.className('modal'));
  private dialogTitle: ElementFinder = element(by.id('adminApp.recorderUserGroup.delete.question'));
  private confirmButton = element(by.id('jhi-confirm-delete-userGroup'));

  getDialogTitle() {
    return this.dialogTitle;
  }

  async clickOnConfirmButton() {
    await this.confirmButton.click();
  }
}

export default class UserGroupComponentsPage {
  createButton: ElementFinder = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('div table .btn-danger'));
  title: ElementFinder = element(by.id('user-group-heading'));
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
    await navBarPage.getEntityPage('user-group');
    await waitUntilAnyDisplayed([this.noRecords, this.table]);
    return this;
  }

  async goToCreateUserGroup() {
    await this.createButton.click();
    return new UserGroupUpdatePage();
  }

  async deleteUserGroup() {
    const deleteButton = this.getDeleteButton(this.records.last());
    await click(deleteButton);

    const userGroupDeleteDialog = new UserGroupDeleteDialog();
    await waitUntilDisplayed(userGroupDeleteDialog.deleteModal);
    expect(await userGroupDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/adminApp.recorderUserGroup.delete.question/);
    await userGroupDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(userGroupDeleteDialog.deleteModal);

    expect(await isVisible(userGroupDeleteDialog.deleteModal)).to.be.false;
  }
}
