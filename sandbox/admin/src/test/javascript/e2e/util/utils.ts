import { ExpectedConditions, ElementArrayFinder, ElementFinder, browser, by, element } from 'protractor';

const waitUntilDisplayedTimeout = browser.params.waitTimeoutInMillis || 30000;
const logWaitErrors = browser.params.logWaitErrors || false;

export const checkSelectorExist = (selector: ElementFinder) => selector !== undefined;

/**
 * @returns Function which resolves to boolean
 */
export const isDisplayed = (selector: ElementFinder) => {
  if (!checkSelectorExist(selector)) return;
  return ExpectedConditions.visibilityOf(selector);
};

export const isHidden = (selector: ElementFinder) => {
  if (!checkSelectorExist(selector)) return;
  return ExpectedConditions.invisibilityOf(selector);
};

/**
 * Wait until this page is displayed.
 */
export const waitUntilDisplayed = async (selector: ElementFinder, classname = '', timeout = waitUntilDisplayedTimeout) => {
  if (!checkSelectorExist(selector)) return;

  await browser.wait(
    isDisplayed(selector),
    timeout,
    `Failed while waiting for "${selector.locator()}" of Page Object Class '${classname}' to display.`
  );
};

/**
 * Wait until element is clickable
 */
export const waitUntilClickable = async (selector: ElementFinder, classname = '', timeout = waitUntilDisplayedTimeout) => {
  if (!checkSelectorExist(selector)) return;

  await browser.wait(
    ExpectedConditions.elementToBeClickable(selector),
    timeout,
    `Failed while waiting for "${selector.locator()}" of Page Object Class '${classname}' to be clickable.`
  );
};

export const waitUntilHidden = async (selector: ElementFinder, classname = '', timeout = waitUntilDisplayedTimeout) => {
  if (!checkSelectorExist(selector)) return;

  await browser.wait(
    isHidden(selector),
    timeout,
    `Failed while waiting for "${selector.locator()}" of Page Object Class '${classname}' to be hidden.`
  );
};

export const waitForCount = (elementArrayFinder: ElementArrayFinder, expectedCount: number) => () => {
  return elementArrayFinder.count().then(actualCount => expectedCount === actualCount);
};

export const waitUntilCount = async (
  elementArrayFinder: ElementArrayFinder,
  expectedCount: number,
  timeout = waitUntilDisplayedTimeout
) => {
  await browser.wait(
    waitForCount(elementArrayFinder, expectedCount),
    timeout,
    `Failed while waiting for "${elementArrayFinder.locator()}" to have ${expectedCount} elements.`
  );
};

export const getModifiedDateSortButton = (): ElementFinder => element(by.id('modified-date-sort'));

export const getUserDeactivatedButtonByLogin = (login: string): ElementFinder =>
  element(by.css('table > tbody')).element(by.id(login)).element(by.buttonText('Deactivated'));

export const getToastByInnerText = (text: string): ElementFinder =>
  element(by.css('.toastify-container')).element(by.cssContainingText('div[role=alert]', text));

/**
 * Returns a void promise on any element present inside an array to become
 * visible. If no element is visible within threshold time, promise will
 * be rejected.
 */
export const waitUntilAnyDisplayed = async (selectors: ElementFinder[], timeout = waitUntilDisplayedTimeout): Promise<void> => {
  await browser.wait(
    ExpectedConditions.or(...selectors.map(selector => ExpectedConditions.visibilityOf(selector))),
    timeout,
    `"${selectors.map(selector => selector.locator())}" are not visible.`
  );
};

/**
 * Returns a boolean if an element is visible on screen. It's a wrapper on
 * isDisplayed() to gracefully handle the scenario when an element is not
 * present in the DOM.
 */
export const isVisible = async (selector: ElementFinder) => {
  try {
    return await selector.isDisplayed();
  } catch (e) {
    if (logWaitErrors) {
      console.warn(e.message);
    }
  }
  return false;
};

/**
 * Waits for an element to be clickable and trigger click event.
 *
 * @param selector
 */
export const click = async (selector: ElementFinder) => {
  await waitUntilClickable(selector);
  await selector.click();
};

/**
 * Returns a promise that evaluates to the number of rows inside table body.
 */
export const getRecordsCount = async (table: ElementFinder): Promise<number> => {
  return await table.all(by.css('tbody tr')).count();
};
