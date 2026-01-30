import { upperFirst } from 'lodash-es';

import { getMicroserviceAppName } from '../../../lib/utils/index.ts';

/**
 * get the java main class name.
 */
export const getMainClassName = ({ baseName }: { baseName: string }) => {
  const main = upperFirst(getMicroserviceAppName({ microserviceName: baseName }));
  const acceptableForJava = /^[A-Z]\w*$/;

  return acceptableForJava.test(main) ? main : 'Application';
};
