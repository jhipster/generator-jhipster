import { kebabCase, startCase, upperFirst } from 'lodash-es';
import { customCamelCase } from '../../../lib/utils/string-utils.ts';
import { getHipster } from '../internal/index.ts';
import { upperFirstCamelCase } from '../../../lib/utils/index.js';

export const baseNameProperties = {
  camelizedBaseName: ({ baseName }) => customCamelCase(baseName),
  hipster: ({ baseName }) => getHipster(baseName),
  capitalizedBaseName: ({ baseName }) => upperFirst(baseName),
  dasherizedBaseName: ({ baseName }) => kebabCase(baseName),
  lowercaseBaseName: ({ baseName }) => baseName?.toLowerCase(),
  upperFirstCamelCaseBaseName: ({ baseName }) => upperFirstCamelCase(baseName),
  humanizedBaseName: ({ baseName }) => (baseName.toLowerCase() === 'jhipster' ? 'JHipster' : startCase(baseName)),
} as const;
