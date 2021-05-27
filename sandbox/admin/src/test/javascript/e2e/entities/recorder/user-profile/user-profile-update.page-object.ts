import { element, by, ElementFinder } from 'protractor';
import { waitUntilDisplayed, waitUntilHidden, isVisible } from '../../../util/utils';

const expect = chai.expect;

export default class UserProfileUpdatePage {
  pageTitle: ElementFinder = element(by.id('adminApp.recorderUserProfile.home.createOrEditLabel'));
  saveButton: ElementFinder = element(by.id('save-entity'));
  cancelButton: ElementFinder = element(by.id('cancel-save'));
  principalInput: ElementFinder = element(by.css('input#user-profile-principal'));
  actualNodeSelect: ElementFinder = element(by.css('select#user-profile-actualNode'));
  assignedNodesSelect: ElementFinder = element(by.css('select#user-profile-assignedNodes'));
  assignedCategoriesSelect: ElementFinder = element(by.css('select#user-profile-assignedCategories'));
  machineLabelSelect: ElementFinder = element(by.css('select#user-profile-machineLabel'));

  getPageTitle() {
    return this.pageTitle;
  }

  async setPrincipalInput(principal) {
    await this.principalInput.sendKeys(principal);
  }

  async getPrincipalInput() {
    return this.principalInput.getAttribute('value');
  }

  async actualNodeSelectLastOption() {
    await this.actualNodeSelect.all(by.tagName('option')).last().click();
  }

  async actualNodeSelectOption(option) {
    await this.actualNodeSelect.sendKeys(option);
  }

  getActualNodeSelect() {
    return this.actualNodeSelect;
  }

  async getActualNodeSelectedOption() {
    return this.actualNodeSelect.element(by.css('option:checked')).getText();
  }

  async assignedNodesSelectLastOption() {
    await this.assignedNodesSelect.all(by.tagName('option')).last().click();
  }

  async assignedNodesSelectOption(option) {
    await this.assignedNodesSelect.sendKeys(option);
  }

  getAssignedNodesSelect() {
    return this.assignedNodesSelect;
  }

  async getAssignedNodesSelectedOption() {
    return this.assignedNodesSelect.element(by.css('option:checked')).getText();
  }

  async assignedCategoriesSelectLastOption() {
    await this.assignedCategoriesSelect.all(by.tagName('option')).last().click();
  }

  async assignedCategoriesSelectOption(option) {
    await this.assignedCategoriesSelect.sendKeys(option);
  }

  getAssignedCategoriesSelect() {
    return this.assignedCategoriesSelect;
  }

  async getAssignedCategoriesSelectedOption() {
    return this.assignedCategoriesSelect.element(by.css('option:checked')).getText();
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
    await this.setPrincipalInput('principal');
    expect(await this.getPrincipalInput()).to.match(/principal/);
    await this.actualNodeSelectLastOption();
    // this.assignedNodesSelectLastOption();
    // this.assignedCategoriesSelectLastOption();
    // this.machineLabelSelectLastOption();
    await this.save();
    await waitUntilHidden(this.saveButton);
    expect(await isVisible(this.saveButton)).to.be.false;
  }
}
