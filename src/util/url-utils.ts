/**
 * Get base path from current window location
 */
export const getBasePath = (): string => window.location.href.split('#')[0];
