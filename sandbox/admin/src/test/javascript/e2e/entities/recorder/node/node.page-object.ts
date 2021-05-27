import { element, by, ElementFinder, ElementArrayFinder } from 'protractor';

import { waitUntilAnyDisplayed, waitUntilDisplayed, click, waitUntilHidden, isVisible } from '../../../util/utils';

import NavBarPage from './../../../page-objects/navbar-page';

import NodeUpdatePage from './node-update.page-object';

const expect = chai.expect;
export class NodeDeleteDialog {
  deleteModal = element(by.className('modal'));
  private dialogTitle: ElementFinder = element(by.id('adminApp.recorderNode.delete.question'));
  private confirmButton = element(by.id('jhi-confirm-delete-node'));

  getDialogTitle() {
    return this.dialogTitle;
  }

  async clickOnConfirmButton() {
    await this.confirmButton.click();
  }
}

export default class NodeComponentsPage {
  createButton: ElementFinder = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('div table .btn-danger'));
  title: ElementFinder = element(by.id('node-heading'));
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
    await navBarPage.getEntityPage('node');
    await waitUntilAnyDisplayed([this.noRecords, this.table]);
    return this;
  }

  async goToCreateNode() {
    await this.createButton.click();
    return new NodeUpdatePage();
  }

  async deleteNode() {
    const deleteButton = this.getDeleteButton(this.records.last());
    await click(deleteButton);

    const nodeDeleteDialog = new NodeDeleteDialog();
    await waitUntilDisplayed(nodeDeleteDialog.deleteModal);
    expect(await nodeDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/adminApp.recorderNode.delete.question/);
    await nodeDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(nodeDeleteDialog.deleteModal);

    expect(await isVisible(nodeDeleteDialog.deleteModal)).to.be.false;
  }
}
