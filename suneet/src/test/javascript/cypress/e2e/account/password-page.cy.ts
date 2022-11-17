import {
  currentPasswordSelector,
  newPasswordSelector,
  confirmPasswordSelector,
  submitPasswordSelector,
  classInvalid,
  classValid,
} from '../../support/commands';

describe('/account/password', () => {
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';

  beforeEach(() => {
    cy.login(username, password);
    cy.visit('/account/password');
  });

  beforeEach(() => {
    cy.intercept('POST', '/api/account/change-password').as('passwordSave');
  });

  it('should be accessible through menu', () => {
    cy.visit('');
    cy.clickOnPasswordItem();
    cy.url().should('match', /\/account\/password$/);
  });

  it('requires current password', () => {
    cy.get(currentPasswordSelector)
      .should('have.class', classInvalid)
      .type('wrong-current-password')
      .blur()
      .should('have.class', classValid);
  });

  it('requires new password', () => {
    cy.get(newPasswordSelector).should('have.class', classInvalid).type('jhipster').blur().should('have.class', classValid);
  });

  it('requires confirm new password', () => {
    cy.get(newPasswordSelector).type('jhipster');
    cy.get(confirmPasswordSelector).should('have.class', classInvalid).type('jhipster').blur().should('have.class', classValid);
  });

  it('should fail to update password when using incorrect current password', () => {
    cy.get(currentPasswordSelector).type('wrong-current-password');
    cy.get(newPasswordSelector).type('jhipster');
    cy.get(confirmPasswordSelector).type('jhipster');
    cy.get(submitPasswordSelector).click();
    cy.wait('@passwordSave').then(({ response }) => expect(response.statusCode).to.equal(400));
  });

  it('should be able to update password', () => {
    cy.get(currentPasswordSelector).type(password);
    cy.get(newPasswordSelector).type(password);
    cy.get(confirmPasswordSelector).type(password);
    cy.get(submitPasswordSelector).click();
    cy.wait('@passwordSave').then(({ response }) => expect(response.statusCode).to.equal(200));
  });
});
