import { element, by, ElementFinder, ElementArrayFinder } from 'protractor';

import { waitUntilAnyDisplayed, waitUntilDisplayed, click, waitUntilHidden, isVisible } from '../../../util/utils';

import NavBarPage from './../../../page-objects/navbar-page';

import SearchLabelUpdatePage from './search-label-update.page-object';

const expect = chai.expect;
export class SearchLabelDeleteDialog {
  deleteModal = element(by.className('modal'));
  private dialogTitle: ElementFinder = element(by.id('adminApp.recorderSearchLabel.delete.question'));
  private confirmButton = element(by.id('jhi-confirm-delete-searchLabel'));

  getDialogTitle() {
    return this.dialogTitle;
  }

  async clickOnConfirmButton() {
    await this.confirmButton.click();
  }
}

export default class SearchLabelComponentsPage {
  createButton: ElementFinder = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('div table .btn-danger'));
  title: ElementFinder = element(by.id('search-label-heading'));
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
    await navBarPage.getEntityPage('search-label');
    await waitUntilAnyDisplayed([this.noRecords, this.table]);
    return this;
  }

  async goToCreateSearchLabel() {
    await this.createButton.click();
    return new SearchLabelUpdatePage();
  }

  async deleteSearchLabel() {
    const deleteButton = this.getDeleteButton(this.records.last());
    await click(deleteButton);

    const searchLabelDeleteDialog = new SearchLabelDeleteDialog();
    await waitUntilDisplayed(searchLabelDeleteDialog.deleteModal);
    expect(await searchLabelDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/adminApp.recorderSearchLabel.delete.question/);
    await searchLabelDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(searchLabelDeleteDialog.deleteModal);

    expect(await isVisible(searchLabelDeleteDialog.deleteModal)).to.be.false;
  }
}
