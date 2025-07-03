/* eslint-disable @typescript-eslint/no-namespace */

import {
  accountMenuSelector,
  adminMenuSelector,
  entityItemSelector,
  loginItemSelector,
  logoutItemSelector,
  navbarSelector,
  passwordItemSelector,
  registerItemSelector,
  settingsItemSelector,
} from './commands';

Cypress.Commands.add('clickOnLoginItem', () => {
  cy.get(navbarSelector).get(accountMenuSelector).click();
  return cy.get(navbarSelector).get(accountMenuSelector).get(loginItemSelector).click();
});

Cypress.Commands.add('clickOnLogoutItem', () => {
  cy.get(navbarSelector).get(accountMenuSelector).click();
  return cy.get(navbarSelector).get(accountMenuSelector).get(logoutItemSelector).click();
});

Cypress.Commands.add('clickOnRegisterItem', () => {
  cy.get(navbarSelector).get(accountMenuSelector).click();
  return cy.get(navbarSelector).get(accountMenuSelector).get(registerItemSelector).click();
});

Cypress.Commands.add('clickOnSettingsItem', () => {
  cy.get(navbarSelector).get(accountMenuSelector).click();
  return cy.get(navbarSelector).get(accountMenuSelector).get(settingsItemSelector).click();
});

Cypress.Commands.add('clickOnPasswordItem', () => {
  cy.get(navbarSelector).get(accountMenuSelector).click();
  return cy.get(navbarSelector).get(accountMenuSelector).get(passwordItemSelector).click();
});

Cypress.Commands.add('clickOnAdminMenuItem', (item: string) => {
  cy.get(navbarSelector).get(adminMenuSelector).click();
  return cy.get(navbarSelector).get(adminMenuSelector).get(`.dropdown-item[href="/admin/${item}"]`).click();
});

Cypress.Commands.add('clickOnEntityMenuItem', (entityName: string) => {
  cy.get(navbarSelector).get(entityItemSelector).click();
  return cy.get(navbarSelector).get(entityItemSelector).get(`.dropdown-item[href="/${entityName}"]`).click({ force: true });
});

declare global {
  namespace Cypress {
    interface Chainable {
      clickOnLoginItem(): Cypress.Chainable;
      clickOnLogoutItem(): Cypress.Chainable;
      clickOnRegisterItem(): Cypress.Chainable;
      clickOnSettingsItem(): Cypress.Chainable;
      clickOnPasswordItem(): Cypress.Chainable;
      clickOnAdminMenuItem(item: string): Cypress.Chainable;
      clickOnEntityMenuItem(entityName: string): Cypress.Chainable;
    }
  }
}

// Convert this to a module instead of a script (allows import/export)
export {};
