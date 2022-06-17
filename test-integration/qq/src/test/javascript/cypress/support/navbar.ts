/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */

import {
  navbarSelector,
  adminMenuSelector,
  accountMenuSelector,
  registerItemSelector,
  loginItemSelector,
  logoutItemSelector,
  settingsItemSelector,
  passwordItemSelector,
  entityItemSelector,
} from './commands';

Cypress.Commands.add('clickOnLoginItem', () => {
  return cy.get(navbarSelector).get(accountMenuSelector).click().get(loginItemSelector).click();
});

Cypress.Commands.add('clickOnLogoutItem', () => {
  return cy.get(navbarSelector).get(accountMenuSelector).click().get(logoutItemSelector).click();
});

Cypress.Commands.add('clickOnRegisterItem', () => {
  return cy.get(navbarSelector).get(accountMenuSelector).click().get(registerItemSelector).click();
});

Cypress.Commands.add('clickOnSettingsItem', () => {
  return cy.get(navbarSelector).get(accountMenuSelector).click().get(settingsItemSelector).click();
});

Cypress.Commands.add('clickOnPasswordItem', () => {
  return cy.get(navbarSelector).get(accountMenuSelector).click().get(passwordItemSelector).click();
});

Cypress.Commands.add('clickOnAdminMenuItem', (item: string) => {
  return cy.get(navbarSelector).get(adminMenuSelector).click().get(`.dropdown-item[href="/admin/${item}"]`).click();
});

Cypress.Commands.add('clickOnEntityMenuItem', (entityName: string) => {
  return cy.get(navbarSelector).get(entityItemSelector).click().get(`.dropdown-item[href="/${entityName}"]`).click({ force: true });
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

// Convert this to a module instead of script (allows import/export)
export {};
