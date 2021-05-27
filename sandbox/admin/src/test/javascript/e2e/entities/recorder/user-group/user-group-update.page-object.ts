import { element, by, ElementFinder } from 'protractor';
import { waitUntilDisplayed, waitUntilHidden, isVisible } from '../../../util/utils';

const expect = chai.expect;

export default class UserGroupUpdatePage {
  pageTitle: ElementFinder = element(by.id('adminApp.recorderUserGroup.home.createOrEditLabel'));
  saveButton: ElementFinder = element(by.id('save-entity'));
  cancelButton: ElementFinder = element(by.id('cancel-save'));
  nameInput: ElementFinder = element(by.css('input#user-group-name'));
  descriptionInput: ElementFinder = element(by.css('input#user-group-description'));
  userProfileSelect: ElementFinder = element(by.css('select#user-group-userProfile'));
  machineLabelSelect: ElementFinder = element(by.css('select#user-group-machineLabel'));

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

  async machineLabelSelectLastOption() {
    await this.machineLabelSelect.all(by.tagName('option')).last().click();
  }

  async machineLabelSelectOption(option) {
    await this.machineLabelSelect.sendKeys(option);
  }

  getMachineLabelSelect() {
    return this.machineLabelSelect;
  }

  async getMachineLabelSelectedOption() {
    return this.machineLabelSelect.element(by.css('option:checked')).getText();
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
    // this.userProfileSelectLastOption();
    // this.machineLabelSelectLastOption();
    await this.save();
    await waitUntilHidden(this.saveButton);
    expect(await isVisible(this.saveButton)).to.be.false;
  }
}
