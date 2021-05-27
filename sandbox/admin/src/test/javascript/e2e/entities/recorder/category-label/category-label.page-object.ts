import { element, by, ElementFinder, ElementArrayFinder } from 'protractor';

import { waitUntilAnyDisplayed, waitUntilDisplayed, click, waitUntilHidden, isVisible } from '../../../util/utils';

import NavBarPage from './../../../page-objects/navbar-page';

import CategoryLabelUpdatePage from './category-label-update.page-object';

const expect = chai.expect;
export class CategoryLabelDeleteDialog {
  deleteModal = element(by.className('modal'));
  private dialogTitle: ElementFinder = element(by.id('adminApp.recorderCategoryLabel.delete.question'));
  private confirmButton = element(by.id('jhi-confirm-delete-categoryLabel'));

  getDialogTitle() {
    return this.dialogTitle;
  }

  async clickOnConfirmButton() {
    await this.confirmButton.click();
  }
}

export default class CategoryLabelComponentsPage {
  createButton: ElementFinder = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('div table .btn-danger'));
  title: ElementFinder = element(by.id('category-label-heading'));
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
    await navBarPage.getEntityPage('category-label');
    await waitUntilAnyDisplayed([this.noRecords, this.table]);
    return this;
  }

  async goToCreateCategoryLabel() {
    await this.createButton.click();
    return new CategoryLabelUpdatePage();
  }

  async deleteCategoryLabel() {
    const deleteButton = this.getDeleteButton(this.records.last());
    await click(deleteButton);

    const categoryLabelDeleteDialog = new CategoryLabelDeleteDialog();
    await waitUntilDisplayed(categoryLabelDeleteDialog.deleteModal);
    expect(await categoryLabelDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/adminApp.recorderCategoryLabel.delete.question/);
    await categoryLabelDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(categoryLabelDeleteDialog.deleteModal);

    expect(await isVisible(categoryLabelDeleteDialog.deleteModal)).to.be.false;
  }
}
