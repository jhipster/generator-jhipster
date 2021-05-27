import { element, by, ElementFinder, protractor } from 'protractor';
import { waitUntilDisplayed, waitUntilHidden, isVisible } from '../../../util/utils';

const expect = chai.expect;

export default class RecordUpdatePage {
  pageTitle: ElementFinder = element(by.id('adminApp.recorderRecord.home.createOrEditLabel'));
  saveButton: ElementFinder = element(by.id('save-entity'));
  cancelButton: ElementFinder = element(by.id('cancel-save'));
  dateInput: ElementFinder = element(by.css('input#record-date'));
  lengthInput: ElementFinder = element(by.css('input#record-length'));
  throwAwayInput: ElementFinder = element(by.css('input#record-throwAway'));
  threatInput: ElementFinder = element(by.css('input#record-threat'));
  channelSelect: ElementFinder = element(by.css('select#record-channel'));

  getPageTitle() {
    return this.pageTitle;
  }

  async setDateInput(date) {
    await this.dateInput.sendKeys(date);
  }

  async getDateInput() {
    return this.dateInput.getAttribute('value');
  }

  async setLengthInput(length) {
    await this.lengthInput.sendKeys(length);
  }

  async getLengthInput() {
    return this.lengthInput.getAttribute('value');
  }

  getThrowAwayInput() {
    return this.throwAwayInput;
  }
  getThreatInput() {
    return this.threatInput;
  }
  async channelSelectLastOption() {
    await this.channelSelect.all(by.tagName('option')).last().click();
  }

  async channelSelectOption(option) {
    await this.channelSelect.sendKeys(option);
  }

  getChannelSelect() {
    return this.channelSelect;
  }

  async getChannelSelectedOption() {
    return this.channelSelect.element(by.css('option:checked')).getText();
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
    await this.setDateInput('01/01/2001' + protractor.Key.TAB + '02:30AM');
    expect(await this.getDateInput()).to.contain('2001-01-01T02:30');
    await waitUntilDisplayed(this.saveButton);
    await this.setLengthInput('5');
    expect(await this.getLengthInput()).to.eq('5');
    await waitUntilDisplayed(this.saveButton);
    const selectedThrowAway = await this.getThrowAwayInput().isSelected();
    if (selectedThrowAway) {
      await this.getThrowAwayInput().click();
      expect(await this.getThrowAwayInput().isSelected()).to.be.false;
    } else {
      await this.getThrowAwayInput().click();
      expect(await this.getThrowAwayInput().isSelected()).to.be.true;
    }
    await waitUntilDisplayed(this.saveButton);
    const selectedThreat = await this.getThreatInput().isSelected();
    if (selectedThreat) {
      await this.getThreatInput().click();
      expect(await this.getThreatInput().isSelected()).to.be.false;
    } else {
      await this.getThreatInput().click();
      expect(await this.getThreatInput().isSelected()).to.be.true;
    }
    await this.channelSelectLastOption();
    await this.save();
    await waitUntilHidden(this.saveButton);
    expect(await isVisible(this.saveButton)).to.be.false;
  }
}
