import { element, by, ElementFinder, ElementArrayFinder } from 'protractor';

import { waitUntilAnyDisplayed, waitUntilDisplayed, click, waitUntilHidden, isVisible } from '../../../util/utils';

import NavBarPage from './../../../page-objects/navbar-page';

import RecordUpdatePage from './record-update.page-object';

const expect = chai.expect;
export class RecordDeleteDialog {
  deleteModal = element(by.className('modal'));
  private dialogTitle: ElementFinder = element(by.id('adminApp.recorderRecord.delete.question'));
  private confirmButton = element(by.id('jhi-confirm-delete-record'));

  getDialogTitle() {
    return this.dialogTitle;
  }

  async clickOnConfirmButton() {
    await this.confirmButton.click();
  }
}

export default class RecordComponentsPage {
  createButton: ElementFinder = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('div table .btn-danger'));
  title: ElementFinder = element(by.id('record-heading'));
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
    await navBarPage.getEntityPage('record');
    await waitUntilAnyDisplayed([this.noRecords, this.table]);
    return this;
  }

  async goToCreateRecord() {
    await this.createButton.click();
    return new RecordUpdatePage();
  }

  async deleteRecord() {
    const deleteButton = this.getDeleteButton(this.records.last());
    await click(deleteButton);

    const recordDeleteDialog = new RecordDeleteDialog();
    await waitUntilDisplayed(recordDeleteDialog.deleteModal);
    expect(await recordDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/adminApp.recorderRecord.delete.question/);
    await recordDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(recordDeleteDialog.deleteModal);

    expect(await isVisible(recordDeleteDialog.deleteModal)).to.be.false;
  }
}
