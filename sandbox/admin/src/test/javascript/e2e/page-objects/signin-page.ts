import { $, browser, ElementFinder } from 'protractor';

import BasePage from './base-component';

const selector: ElementFinder = $('#login-page');
export default class SignInPage extends BasePage {
  selector: ElementFinder;
  username: ElementFinder = this.selector.$('#username');
  password: ElementFinder = this.selector.$('#password');
  loginButton: ElementFinder = this.selector.$('button[type=submit]');
  title: ElementFinder = this.selector.$('#login-title');

  constructor() {
    super(selector);
    this.selector = selector;
  }

  async get() {
    await browser.get('/login');
    await this.waitUntilDisplayed();
  }

  async getTitle() {
    return this.title.getAttribute('id');
  }

  async setUserName(username: string) {
    await this.username.sendKeys(username);
  }

  async clearUserName() {
    await this.username.clear();
  }

  async setPassword(password: string) {
    await this.password.sendKeys(password);
  }

  async clearPassword() {
    await this.password.clear();
  }

  async autoSignInUsing(username: string, password: string) {
    await this.setUserName(username);
    await this.setPassword(password);
    await this.login();
  }

  async autoSignOut() {
    await browser.get('/logout');
  }

  async login() {
    await this.loginButton.click();
  }
}
