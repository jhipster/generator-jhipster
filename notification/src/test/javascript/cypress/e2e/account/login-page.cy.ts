import {
  errorLoginSelector,
  passwordLoginSelector,
  submitLoginSelector,
  titleLoginSelector,
  usernameLoginSelector,
} from '../../support/commands';

describe('login page', () => {
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';

  beforeEach(() => {
    cy.visit('');
    cy.clickOnLoginItem();
  });

  beforeEach(() => {
    cy.intercept('POST', '/api/authenticate').as('authenticate');
  });

  it('greets with signin', () => {
    cy.get(titleLoginSelector).should('be.visible');
  });

  it('greets visiting /login directly', () => {
    cy.visit('/login');
    cy.get(titleLoginSelector).should('be.visible');
  });

  it('requires username', () => {
    cy.get(passwordLoginSelector).type('a-password');
    cy.get(submitLoginSelector).click();
    cy.wait('@authenticate').then(({ response }) => expect(response?.statusCode).to.equal(400));
    // login page should stay open when login fails
    cy.get(titleLoginSelector).should('be.visible');
  });

  it('requires password', () => {
    cy.get(usernameLoginSelector).type('a-login');
    cy.get(submitLoginSelector).click();
    cy.wait('@authenticate').then(({ response }) => expect(response?.statusCode).to.equal(400));
    cy.get(errorLoginSelector).should('be.visible');
  });

  it('errors when password is incorrect', () => {
    cy.get(usernameLoginSelector).type(username);
    cy.get(passwordLoginSelector).type('bad-password');
    cy.get(submitLoginSelector).click();
    cy.wait('@authenticate').then(({ response }) => expect(response?.statusCode).to.equal(401));
    cy.get(errorLoginSelector).should('be.visible');
  });

  it('go to home page when successfully logs in', () => {
    cy.get(usernameLoginSelector).type(username);
    cy.get(passwordLoginSelector).type(password);
    cy.get(submitLoginSelector).click();
    cy.wait('@authenticate').then(({ response }) => expect(response?.statusCode).to.equal(200));
    cy.hash().should('eq', '');
  });
});
