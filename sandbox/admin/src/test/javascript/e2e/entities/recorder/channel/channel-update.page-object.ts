import { element, by, ElementFinder } from 'protractor';
import { waitUntilDisplayed, waitUntilHidden, isVisible } from '../../../util/utils';

const expect = chai.expect;

export default class ChannelUpdatePage {
  pageTitle: ElementFinder = element(by.id('adminApp.recorderChannel.home.createOrEditLabel'));
  saveButton: ElementFinder = element(by.id('save-entity'));
  cancelButton: ElementFinder = element(by.id('cancel-save'));
  mediaTypeSelect: ElementFinder = element(by.css('select#channel-mediaType'));
  nameInput: ElementFinder = element(by.css('input#channel-name'));
  throwAwayAllowedInput: ElementFinder = element(by.css('input#channel-throwAwayAllowed'));
  threatAllowedInput: ElementFinder = element(by.css('input#channel-threatAllowed'));
  nodesSelect: ElementFinder = element(by.css('select#channel-nodes'));

  getPageTitle() {
    return this.pageTitle;
  }

  async setMediaTypeSelect(mediaType) {
    await this.mediaTypeSelect.sendKeys(mediaType);
  }

  async getMediaTypeSelect() {
    return this.mediaTypeSelect.element(by.css('option:checked')).getText();
  }

  async mediaTypeSelectLastOption() {
    await this.mediaTypeSelect.all(by.tagName('option')).last().click();
  }
  async setNameInput(name) {
    await this.nameInput.sendKeys(name);
  }

  async getNameInput() {
    return this.nameInput.getAttribute('value');
  }

  getThrowAwayAllowedInput() {
    return this.throwAwayAllowedInput;
  }
  getThreatAllowedInput() {
    return this.threatAllowedInput;
  }
  async nodesSelectLastOption() {
    await this.nodesSelect.all(by.tagName('option')).last().click();
  }

  async nodesSelectOption(option) {
    await this.nodesSelect.sendKeys(option);
  }

  getNodesSelect() {
    return this.nodesSelect;
  }

  async getNodesSelectedOption() {
    return this.nodesSelect.element(by.css('option:checked')).getText();
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
    await this.mediaTypeSelectLastOption();
    await waitUntilDisplayed(this.saveButton);
    await this.setNameInput('name');
    expect(await this.getNameInput()).to.match(/name/);
    await waitUntilDisplayed(this.saveButton);
    const selectedThrowAwayAllowed = await this.getThrowAwayAllowedInput().isSelected();
    if (selectedThrowAwayAllowed) {
      await this.getThrowAwayAllowedInput().click();
      expect(await this.getThrowAwayAllowedInput().isSelected()).to.be.false;
    } else {
      await this.getThrowAwayAllowedInput().click();
      expect(await this.getThrowAwayAllowedInput().isSelected()).to.be.true;
    }
    await waitUntilDisplayed(this.saveButton);
    const selectedThreatAllowed = await this.getThreatAllowedInput().isSelected();
    if (selectedThreatAllowed) {
      await this.getThreatAllowedInput().click();
      expect(await this.getThreatAllowedInput().isSelected()).to.be.false;
    } else {
      await this.getThreatAllowedInput().click();
      expect(await this.getThreatAllowedInput().isSelected()).to.be.true;
    }
    // this.nodesSelectLastOption();
    await this.save();
    await waitUntilHidden(this.saveButton);
    expect(await isVisible(this.saveButton)).to.be.false;
  }
}
