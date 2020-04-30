import { ElementFinder } from 'protractor';

import { isDisplayed, isHidden, waitUntilDisplayed, waitUntilHidden } from '../util/utils';
/**
 * Base ui component class that other components should inherit from.
 */
export default class BasePage {
  /**
   * This class property enables use of specific functions 'isDisplayed' and 'waitUntilDisplayed'
   */
  selector: ElementFinder = undefined;

  constructor(selector?) {
    this.selector = selector;
  }

  checkSelectorExist() {
    if (this.selector === undefined) {
      throw new TypeError(
        `Class '${this.constructor.name}' ` +
          `extends 'UIComponent' possibly 'Page' Object Class and have to implement abstract property 'selector' ` +
          `when 'isDisplayed' or 'waitUntilDisplayed' are used`
      );
    }
  }

  /**
   * @returns Function which resolves to boolean
   */
  isDisplayed() {
    this.checkSelectorExist();
    return isDisplayed(this.selector);
  }

  isHidden() {
    this.checkSelectorExist();
    return isHidden(this.selector);
  }

  /**
   * Wait until this page is displayed.
   */
  async waitUntilDisplayed() {
    this.checkSelectorExist();
    await waitUntilDisplayed(this.selector, this.constructor.name);
  }

  async waitUntilHidden() {
    this.checkSelectorExist();
    await waitUntilHidden(this.selector, this.constructor.name);
  }
}
