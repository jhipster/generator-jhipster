import _ from 'lodash';
import { getMicroserviceAppName } from '../../base/support/index.mjs';

const { upperFirst } = _;

/**
 * get the java main class name.
 */
export const getMainClassName = ({ baseName }: { baseName: string }) => {
  const main = upperFirst(getMicroserviceAppName({ microserviceName: baseName }));
  const acceptableForJava = new RegExp('^[A-Z][a-zA-Z0-9_]*$');

  return acceptableForJava.test(main) ? main : 'Application';
};
