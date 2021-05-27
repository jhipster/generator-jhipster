import { element, by, ElementFinder, ElementArrayFinder } from 'protractor';

import { waitUntilAnyDisplayed, waitUntilDisplayed, click, waitUntilHidden, isVisible } from '../../../util/utils';

import NavBarPage from './../../../page-objects/navbar-page';

import ChannelUpdatePage from './channel-update.page-object';

const expect = chai.expect;
export class ChannelDeleteDialog {
  deleteModal = element(by.className('modal'));
  private dialogTitle: ElementFinder = element(by.id('adminApp.recorderChannel.delete.question'));
  private confirmButton = element(by.id('jhi-confirm-delete-channel'));

  getDialogTitle() {
    return this.dialogTitle;
  }

  async clickOnConfirmButton() {
    await this.confirmButton.click();
  }
}

export default class ChannelComponentsPage {
  createButton: ElementFinder = element(by.id('jh-create-entity'));
  deleteButtons = element.all(by.css('div table .btn-danger'));
  title: ElementFinder = element(by.id('channel-heading'));
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
    await navBarPage.getEntityPage('channel');
    await waitUntilAnyDisplayed([this.noRecords, this.table]);
    return this;
  }

  async goToCreateChannel() {
    await this.createButton.click();
    return new ChannelUpdatePage();
  }

  async deleteChannel() {
    const deleteButton = this.getDeleteButton(this.records.last());
    await click(deleteButton);

    const channelDeleteDialog = new ChannelDeleteDialog();
    await waitUntilDisplayed(channelDeleteDialog.deleteModal);
    expect(await channelDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/adminApp.recorderChannel.delete.question/);
    await channelDeleteDialog.clickOnConfirmButton();

    await waitUntilHidden(channelDeleteDialog.deleteModal);

    expect(await isVisible(channelDeleteDialog.deleteModal)).to.be.false;
  }
}
