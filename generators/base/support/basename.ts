import { camelCase } from 'lodash-es';

/**
 * get the frontend application name.
 */
export const getFrontendAppName = ({ baseName }: { baseName: string }) => {
  const name = camelCase(baseName) + (baseName.endsWith('App') ? '' : 'App');
  return name.match(/^\d/) ? 'App' : name;
};

export const getMicroserviceAppName = ({ microserviceName }: { microserviceName: string }) => {
  return camelCase(microserviceName) + (microserviceName.endsWith('App') ? '' : 'App');
};
