import { ElementFinder, browser, $ } from 'protractor';

import BasePage from './base-component';

const selector: ElementFinder = $('#register-form');
export default class RegisterPage extends BasePage {
  selector: ElementFinder;
  username: ElementFinder = this.selector.$('#username');
  email: ElementFinder = this.selector.$('#email');
  firstPassword: ElementFinder = this.selector.$('#firstPassword');
  secondPassword: ElementFinder = this.selector.$('#secondPassword');
  saveButton: ElementFinder = this.selector.$('button[type=submit]');
  title: ElementFinder = $('#register-title');

  constructor() {
    super(selector);
    this.selector = selector;
  }

  get() {
    browser.get('#/register');
    this.waitUntilDisplayed();
  }

  getTitle() {
    return this.title.getAttribute('id');
  }

  setUserName(username: string) {
    return this.username.sendKeys(username);
  }

  setEmail(email: string) {
    return this.email.sendKeys(email);
  }

  setFirstPassword(password: string) {
    return this.firstPassword.sendKeys(password);
  }

  setSecondPassword(password: string) {
    return this.secondPassword.sendKeys(password);
  }

  autoSignUpUsing(username: string, email: string, password: string) {
    this.setUserName(username);
    this.setEmail(email);
    this.setFirstPassword(password);
    this.setSecondPassword(password);
    return this.save();
  }

  save() {
    return this.saveButton.click();
  }
}
