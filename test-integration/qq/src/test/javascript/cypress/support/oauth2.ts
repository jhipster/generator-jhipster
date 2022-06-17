// eslint-disable-next-line spaced-comment
/// <reference types="cypress" />

Cypress.Commands.add('getOauth2Data', () => {
  cy.request({
    url: '/oauth2/authorization/oidc',
    followRedirect: false,
  }).then(response => {
    const data = {
      url: response.headers['location'],
    };
    cy.wrap(data).as('oauth2Data');
  });
});

Cypress.Commands.add('oauthLogin', (oauth2Data: any, username: string, password: string) => {
  const url = new URL(oauth2Data.url);
  if (url.origin.includes('okta')) {
    cy.oktaLogin(oauth2Data, username, password);
  } else if (url.origin.includes('auth0')) {
    cy.auth0Login(oauth2Data, username, password);
  } else {
    cy.keycloakLogin(oauth2Data, username, password);
  }
});

Cypress.Commands.add('keycloakLogin', (oauth2Data: any, username: string, password: string) => {
  cy.request({
    url: `${oauth2Data.url}`,
    followRedirect: false,
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
          username: username,
          password: password,
        },
      });
    })
    .then(() => {
      cy.request({
        url: '/oauth2/authorization/oidc',
        followRedirect: true,
      }).then(() => {
        cy.visit('/');
      });
    });
});

Cypress.Commands.add('auth0Login', (oauth2Data: any, username: string, password: string) => {
  cy.request({
    url: `${oauth2Data.url}`,
    followRedirect: true,
  })
    .then(response => {
      const html = document.createElement('html');
      html.innerHTML = response.body;
      const state = html.querySelector('input[name="state"]').value;
      return cy.request({
        method: 'POST',
        url: `${new URL(oauth2Data.url).origin}/u/login`,
        followRedirect: true,
        form: true,
        body: {
          state: state,
          action: 'default',
          username: username,
          password: password,
        },
      });
    })
    .then(() => {
      cy.request({
        url: '/oauth2/authorization/oidc',
        followRedirect: true,
      }).then(() => {
        cy.visit('/');
      });
    });
});

Cypress.Commands.add('oktaLogin', (oauth2Data: any, username, password) => {
  const url = new URL(oauth2Data.url);
  cy.request({
    method: 'POST',
    url: `${url.origin}/api/v1/authn`,
    followRedirect: false,
    body: {
      username,
      password,
    },
  })
    .its('body.sessionToken')
    .as('sessionToken')
    .then(function () {
      cy.request({
        url: `${oauth2Data.url}&sessionToken=${this.sessionToken}`,
        followRedirect: true,
      }).then(() => {
        cy.visit('/');
      });
    });
});

Cypress.Commands.add('oauthLogout', () => {
  cy.getCookie('XSRF-TOKEN')
    .then(csrfCookie =>
      cy.location().then(loc$ =>
        cy.request({
          method: 'POST',
          url: `api/logout`,
          headers: {
            'X-XSRF-TOKEN': csrfCookie?.value,
            origin: loc$.origin,
          },
        })
      )
    )
    .then(res => {
      expect(res.status).to.eq(200);
      return cy.request({
        url: res.body.logoutUrl,
        followRedirect: true,
      });
    })
    .then(res => {
      expect(res.status).to.eq(200);
      cy.visit('/');
    });
});

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      getOauth2Data(): Cypress.Chainable;
      oauthLogin(oauth2Data: any, username: string, password: string): Cypress.Chainable;
      keycloakLogin(oauth2Data: any, username: string, password: string): Cypress.Chainable;
      auth0Login(oauth2Data: any, username: string, password: string): Cypress.Chainable;
      oktaLogin(oauth2Data: any, username: string, password: string): Cypress.Chainable;
      oauthLogout(): Cypress.Chainable;
    }
  }
}

// Convert this to a module instead of script (allows import/export)
export {};
