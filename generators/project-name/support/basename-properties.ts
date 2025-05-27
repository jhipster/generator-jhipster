import { kebabCase, startCase } from 'lodash-es';
import { camelCase, upperFirst } from '../../../lib/jdl/core/utils/string-utils.js';
import getHipster from '../../base/support/hipster.js';
import { upperFirstCamelCase } from '../../base/support/index.js';

export const baseNameProperties = {
  camelizedBaseName: ({ baseName }) => camelCase(baseName),
  hipster: ({ baseName }) => getHipster(baseName),
  capitalizedBaseName: ({ baseName }) => upperFirst(baseName),
  dasherizedBaseName: ({ baseName }) => kebabCase(baseName),
  lowercaseBaseName: ({ baseName }) => baseName?.toLowerCase(),
  upperFirstCamelCaseBaseName: ({ baseName }) => upperFirstCamelCase(baseName),
  humanizedBaseName: ({ baseName }) => (baseName.toLowerCase() === 'jhipster' ? 'JHipster' : startCase(baseName)),
} as const;
