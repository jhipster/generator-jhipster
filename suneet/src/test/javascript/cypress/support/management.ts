/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */

Cypress.Commands.add('getManagementInfo', () => {
  return cy
    .request({
      method: 'GET',
      url: '/management/info',
    })
    .then(response => response.body);
});

declare global {
  namespace Cypress {
    interface Chainable {
      getManagementInfo(): Cypress.Chainable;
    }
  }
}

// Convert this to a module instead of script (allows import/export)
export {};
