import type { Page } from '@playwright/test';

/**
 * Ports the Cypress oauth2 commands. Cypress follows the redirect chain with `cy.request`; Playwright drives the
 * identity provider's form in the browser, which keeps the session cookies the application expects and works the
 * same way for Keycloak, Okta and Auth0.
 */
export const oauthLogin = async (page: Page, username: string, password: string): Promise<void> => {
  await page.goto('/oauth2/authorization/oidc');

  const url = new URL(page.url());
  if (url.origin.includes('okta')) {
    await oktaLogin(page, username, password);
  } else if (url.origin.includes('auth0')) {
    await auth0Login(page, username, password);
  } else {
    await keycloakLogin(page, username, password);
  }

  await page.waitForURL(pageUrl => !/okta|auth0|\/realms\//.test(pageUrl.href));
};

export const keycloakLogin = async (page: Page, username: string, password: string): Promise<void> => {
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.locator('#kc-login').click();
};

export const oktaLogin = async (page: Page, username: string, password: string): Promise<void> => {
  await page.locator('input[name="identifier"]').fill(username);
  await page.locator('input[name="credentials.passcode"]').fill(password);
  await page.locator('input[type="submit"]').click();
};

export const auth0Login = async (page: Page, username: string, password: string): Promise<void> => {
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
};

export const oauthLogout = async (page: Page): Promise<void> => {
  await page.goto('/');
};
