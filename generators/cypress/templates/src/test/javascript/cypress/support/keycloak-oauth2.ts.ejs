/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
// eslint-disable-next-line spaced-comment
/// <reference types="cypress" />

Cypress.Commands.add('getOauth2Data', () => {
  cy.request({
    method: 'GET',
    url: '/oauth2/authorization/oidc',
    followRedirect: false,
  }).then(response => {
    const url = new URL(response.headers['location']);
    const realm = url.pathname.split('/', 4)[3];
    const clientId = url.searchParams.get('client_id');
    const data = {
      url,
      realmPath: `${url.origin}/auth/realms/${realm}`,
      realm,
      clientId,
    };
    cy.wrap(data).as('oauth2Data');
  });
});

Cypress.Commands.add('keycloackLogin', (oauth2Data: any, user: string) => {
  Cypress.log({ name: 'Login' });

  cy.fixture(`users/${user}`).then(userData => {
    cy.request({
      url: `${oauth2Data.realmPath}/protocol/openid-connect/auth`,
      followRedirect: false,
      qs: {
        scope: 'openid',
        response_type: 'code',
        approval_prompt: 'auto',
        redirect_uri: Cypress.config('baseUrl'),
        client_id: oauth2Data.clientId,
      },
    })
      .then(response => {
        const html = document.createElement('html');
        html.innerHTML = response.body;

        const form = html.getElementsByTagName('form')[0];
        const url = form.action;

        return cy.request({
          method: 'POST',
          url,
          followRedirect: false,
          form: true,
          body: {
            username: userData.username,
            password: userData.password,
          },
        });
      })
      .then(() => {
        // Get an oauth2 login request
        cy.request({
          method: 'GET',
          url: '/oauth2/authorization/oidc',
          followRedirect: true,
        }).then(() => {
          cy.visit('/');
        });
      });
  });
});

Cypress.Commands.add('keycloackLogout', (oauth2Data: any) => {
  return cy.request({
    url: `${oauth2Data.realmPath}/protocol/openid-connect/logout`,
  });
});

Cypress.Commands.add('clearCache', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then(win => {
    win.sessionStorage.clear();
  });
});

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      getOauth2Data(): Cypress.Chainable;
      keycloackLogin(oauth2Data: any, user: string): Cypress.Chainable;
      keycloackLogout(oauth2Data: any): Cypress.Chainable;
      clearCache(): Cypress.Chainable;
    }
  }
}

// Convert this to a module instead of script (allows import/export)
export {};
