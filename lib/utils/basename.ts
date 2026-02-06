import { camelCase } from 'lodash-es';

/**
 * Get the frontend application name.
 */
export const getFrontendAppName = ({ baseName }: { baseName: string }) => {
  const name = camelCase(baseName) + (baseName.endsWith('App') ? '' : 'App');
  return /^\d/.test(name) ? 'App' : name;
};

export const getMicroserviceAppName = ({ microserviceName }: { microserviceName: string }) =>
  camelCase(microserviceName) + (microserviceName.endsWith('App') ? '' : 'App');
