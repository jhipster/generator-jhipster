import type { APIResponse } from '@playwright/test';

export type Account = Record<string, string | boolean | number>;

interface AuthenticatedRequester {
  authenticatedRequest(options: { method?: 'GET' | 'POST'; url: string; body?: unknown }): Promise<APIResponse>;
}

/** Ports the Cypress `getAccount` command. */
export const getAccount = async (jhi: AuthenticatedRequester): Promise<Account> => {
  const response = await jhi.authenticatedRequest({ method: 'GET', url: '/api/account' });
  return (await response.json()) as Account;
};

/** Ports the Cypress `saveAccount` command. */
export const saveAccount = (jhi: AuthenticatedRequester, account: Account): Promise<APIResponse> =>
  jhi.authenticatedRequest({ method: 'POST', url: '/api/account', body: account });
