import { emailSettingsSelector, firstNameSettingsSelector, lastNameSettingsSelector, submitSettingsSelector } from '../../support/commands';
import type { Account } from '../../support/account';

describe('/account/settings', () => {
  const adminUsername = Cypress.env('E2E_USERNAME') ?? 'admin';
  const adminPassword = Cypress.env('E2E_PASSWORD') ?? 'admin';
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';

  const testUserEmail = 'user@localhost.fr';
  let originalUserAccount: Account;
  let testUserAccount: Account;

  before(() => {
    cy.login(username, password);

    cy.getAccount().then(account => {
      originalUserAccount = account;
      testUserAccount = { ...account, email: testUserEmail };

      // need to modify email because default email does not match regex in some frameworks
      cy.saveAccount(testUserAccount).its('status').should('eq', 200);
    });
  });

  beforeEach(() => {
    cy.login(username, password);
    cy.visit('/account/settings');
    cy.get(emailSettingsSelector).should('have.value', testUserEmail);

    cy.intercept('POST', '/api/account').as('settingsSave');
  });

  afterEach(() => {
    cy.login(username, password);
    cy.saveAccount(testUserAccount).its('status').should('eq', 200);
  });

  after(() => {
    cy.login(username, password);
    cy.saveAccount(originalUserAccount).its('status').should('eq', 200);
  });

  it('should be accessible through menu', () => {
    cy.visit('');
    cy.clickOnSettingsItem();
    cy.url().should('match', /\/account\/settings$/);
  });

  it("should be able to change 'user' firstname settings", () => {
    cy.get(firstNameSettingsSelector).clear();
    cy.get(firstNameSettingsSelector).type('jhipster');
    cy.get(submitSettingsSelector).click();
    cy.wait('@settingsSave').then(({ response }) => expect(response?.statusCode).to.equal(200));
  });

  it("should be able to change 'user' lastname settings", () => {
    cy.get(lastNameSettingsSelector).clear();
    cy.get(firstNameSettingsSelector).type('jhipster');
    cy.get(lastNameSettingsSelector).type('retspihj');
    cy.get(submitSettingsSelector).click();
    cy.wait('@settingsSave').then(({ response }) => expect(response?.statusCode).to.equal(200));
  });

  it("should be able to change 'user' email settings", () => {
    cy.get(emailSettingsSelector).clear();
    cy.get(firstNameSettingsSelector).type('jhipster');
    cy.get(emailSettingsSelector).type('user@localhost.fr');
    cy.get(submitSettingsSelector).click();
    cy.wait('@settingsSave').then(({ response }) => expect(response?.statusCode).to.equal(200));
  });

  describe('if there is another user with an email', () => {
    let originalAdminAccount: Account;
    const testAdminEmail = 'admin@localhost.fr';

    before(() => {
      cy.login(adminUsername, adminPassword);
      cy.getAccount().then(account => {
        originalAdminAccount = account;

        // need to modify email because default email does not match regex in some frameworks
        cy.saveAccount({ ...account, email: testAdminEmail })
          .its('status')
          .should('eq', 200);
      });
    });

    after(() => {
      cy.login(adminUsername, adminPassword);
      cy.saveAccount(originalAdminAccount).its('status').should('eq', 200);
    });

    it("should not be able to change 'user' email to same value", () => {
      cy.get(emailSettingsSelector).clear();
      cy.get(firstNameSettingsSelector).type('jhipster');
      cy.get(emailSettingsSelector).type(testAdminEmail);
      cy.get(submitSettingsSelector).click();
      cy.wait('@settingsSave').then(({ response }) => expect(response?.statusCode).to.equal(400));
    });
  });
});
