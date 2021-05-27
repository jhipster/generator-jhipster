import { element, by, ElementFinder } from 'protractor';
import { waitUntilDisplayed, waitUntilHidden, isVisible } from '../../../util/utils';

const expect = chai.expect;

export default class SearchLabelUpdatePage {
  pageTitle: ElementFinder = element(by.id('adminApp.recorderSearchLabel.home.createOrEditLabel'));
  saveButton: ElementFinder = element(by.id('save-entity'));
  cancelButton: ElementFinder = element(by.id('cancel-save'));
  nameInput: ElementFinder = element(by.css('input#search-label-name'));
  descriptionInput: ElementFinder = element(by.css('input#search-label-description'));
  recordsSelect: ElementFinder = element(by.css('select#search-label-records'));
  userProfileSelect: ElementFinder = element(by.css('select#search-label-userProfile'));

  getPageTitle() {
    return this.pageTitle;
  }

  async setNameInput(name) {
    await this.nameInput.sendKeys(name);
  }

  async getNameInput() {
    return this.nameInput.getAttribute('value');
  }

  async setDescriptionInput(description) {
    await this.descriptionInput.sendKeys(description);
  }

  async getDescriptionInput() {
    return this.descriptionInput.getAttribute('value');
  }

  async recordsSelectLastOption() {
    await this.recordsSelect.all(by.tagName('option')).last().click();
  }

  async recordsSelectOption(option) {
    await this.recordsSelect.sendKeys(option);
  }

  getRecordsSelect() {
    return this.recordsSelect;
  }

  async getRecordsSelectedOption() {
    return this.recordsSelect.element(by.css('option:checked')).getText();
  }

  async userProfileSelectLastOption() {
    await this.userProfileSelect.all(by.tagName('option')).last().click();
  }

  async userProfileSelectOption(option) {
    await this.userProfileSelect.sendKeys(option);
  }

  getUserProfileSelect() {
    return this.userProfileSelect;
  }

  async getUserProfileSelectedOption() {
    return this.userProfileSelect.element(by.css('option:checked')).getText();
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  getSaveButton() {
    return this.saveButton;
  }

  async enterData() {
    await waitUntilDisplayed(this.saveButton);
    await this.setNameInput('name');
    expect(await this.getNameInput()).to.match(/name/);
    await waitUntilDisplayed(this.saveButton);
    await this.setDescriptionInput('description');
    expect(await this.getDescriptionInput()).to.match(/description/);
    // this.recordsSelectLastOption();
    await this.userProfileSelectLastOption();
    await this.save();
    await waitUntilHidden(this.saveButton);
    expect(await isVisible(this.saveButton)).to.be.false;
  }
}
