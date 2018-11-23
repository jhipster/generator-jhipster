import { ElementFinder, browser, $ } from 'protractor';

import BasePage from './base-component';

const selector: ElementFinder = $('#password-form');
export default class PasswordPage extends BasePage {
  selector: ElementFinder;
  currentPassword: ElementFinder = this.selector.$('#currentPassword');
  newPassword: ElementFinder = this.selector.$('#newPassword');
  confirmPassword: ElementFinder = this.selector.$('#confirmPassword');
  saveButton: ElementFinder = this.selector.$('button[type=submit]');
  title: ElementFinder = $('#password-title');

  constructor() {
    super(selector);
    this.selector = selector;
  }

  async get() {
    await browser.get('#/account/password');
    await this.waitUntilDisplayed();
  }

  async getTitle() {
    return this.title.getAttribute('id');
  }

  async setCurrentPassword(password: string) {
    await this.currentPassword.sendKeys(password);
  }

  async clearCurrentPassword() {
    await this.currentPassword.clear();
  }

  async setNewPassword(newPassword: string) {
    await this.newPassword.sendKeys(newPassword);
  }

  async clearNewPassword() {
    await this.newPassword.clear();
  }

  async setConfirmPassword(confirmPassword: string) {
    await this.confirmPassword.sendKeys(confirmPassword);
  }

  async clearConfirmPassword() {
    await this.confirmPassword.clear();
  }

  async autoChangePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    await this.setCurrentPassword(currentPassword);
    await this.setNewPassword(newPassword);
    await this.setConfirmPassword(confirmPassword);
    await this.save();
  }

  async save() {
    await this.saveButton.click();
  }
}
