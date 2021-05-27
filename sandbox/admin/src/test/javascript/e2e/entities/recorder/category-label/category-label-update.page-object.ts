import { element, by, ElementFinder } from 'protractor';
import { waitUntilDisplayed, waitUntilHidden, isVisible } from '../../../util/utils';

const expect = chai.expect;

export default class CategoryLabelUpdatePage {
  pageTitle: ElementFinder = element(by.id('adminApp.recorderCategoryLabel.home.createOrEditLabel'));
  saveButton: ElementFinder = element(by.id('save-entity'));
  cancelButton: ElementFinder = element(by.id('cancel-save'));
  nameInput: ElementFinder = element(by.css('input#category-label-name'));
  descriptionInput: ElementFinder = element(by.css('input#category-label-description'));
  authorityAttachInput: ElementFinder = element(by.css('input#category-label-authorityAttach'));
  recordSelect: ElementFinder = element(by.css('select#category-label-record'));

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

  async setAuthorityAttachInput(authorityAttach) {
    await this.authorityAttachInput.sendKeys(authorityAttach);
  }

  async getAuthorityAttachInput() {
    return this.authorityAttachInput.getAttribute('value');
  }

  async recordSelectLastOption() {
    await this.recordSelect.all(by.tagName('option')).last().click();
  }

  async recordSelectOption(option) {
    await this.recordSelect.sendKeys(option);
  }

  getRecordSelect() {
    return this.recordSelect;
  }

  async getRecordSelectedOption() {
    return this.recordSelect.element(by.css('option:checked')).getText();
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
    await waitUntilDisplayed(this.saveButton);
    await this.setAuthorityAttachInput('authorityAttach');
    expect(await this.getAuthorityAttachInput()).to.match(/authorityAttach/);
    // this.recordSelectLastOption();
    await this.save();
    await waitUntilHidden(this.saveButton);
    expect(await isVisible(this.saveButton)).to.be.false;
  }
}
