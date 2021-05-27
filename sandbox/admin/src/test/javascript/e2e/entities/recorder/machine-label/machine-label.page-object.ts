import { element, by, ElementFinder, ElementArrayFinder } from 'protractor';

import { waitUntilAnyDisplayed, waitUntilDisplayed, click, waitUntilHidden, isVisible } from '../../../util/utils';

import NavBarPage from './../../../page-objects/navbar-page';

import MachineLabelUpdatePage from './machine-label-update.page-object';

const expect = chai.expect;
export class MachineLabelDeleteDialog {
  deleteModal = element(by.className('modal'));
  private dialogTitle: ElementFinder = element(by.id('adminApp.recorderMachineLabel.delete.question'));
  private confirmButton = element(by.id('jhi-confirm-delete-machineLabel'));

  getDialogTitle() {
    return this.dialogTitle;
  }

  async clickOnConfirmButton() {
    await this.confirmButton.click();
  }
}

export default class MachineLabelComponentsPage {
  createButton: ElementFinder = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('div table .btn-danger'));
  title: ElementFinder = element(by.id('machine-label-heading'));
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
    await navBarPage.getEntityPage('machine-label');
    await waitUntilAnyDisplayed([this.noRecords, this.table]);
    return this;
  }

  async goToCreateMachineLabel() {
    await this.createButton.click();
    return new MachineLabelUpdatePage();
  }

  async deleteMachineLabel() {
    const deleteButton = this.getDeleteButton(this.records.last());
    await click(deleteButton);

    const machineLabelDeleteDialog = new MachineLabelDeleteDialog();
    await waitUntilDisplayed(machineLabelDeleteDialog.deleteModal);
    expect(await machineLabelDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/adminApp.recorderMachineLabel.delete.question/);
    await machineLabelDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(machineLabelDeleteDialog.deleteModal);

    expect(await isVisible(machineLabelDeleteDialog.deleteModal)).to.be.false;
  }
}
