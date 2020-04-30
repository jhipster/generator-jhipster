import { $, browser, ElementFinder } from 'protractor';

import BasePage from './base-component';

const selector: ElementFinder = $('#settings-form');
export default class SettingsPage extends BasePage {
  selector: ElementFinder;
  firstName: ElementFinder = this.selector.$('#firstName');
  lastName: ElementFinder = this.selector.$('#lastName');
  email: ElementFinder = this.selector.$('#email');
  saveButton: ElementFinder = this.selector.$('button[type=submit]');
  title: ElementFinder = $('#settings-title');

  constructor() {
    super(selector);
    this.selector = selector;
  }

  async get() {
    await browser.get('/account/settings');
    await this.waitUntilDisplayed();
  }

  async getTitle() {
    return this.title.getAttribute('id');
  }

  async setFirstName(firstName) {
    await this.firstName.sendKeys(firstName);
  }

  async setLastName(lastName) {
    await this.lastName.sendKeys(lastName);
  }

  async setEmail(email) {
    await this.email.sendKeys(email);
  }

  async clearEmail() {
    await this.email.clear();
  }

  async save() {
    await this.saveButton.click();
  }
}
