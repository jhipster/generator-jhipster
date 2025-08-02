import { kebabCase, startCase, upperFirst } from 'lodash-es';
import { customCamelCase } from '../../../lib/utils/string-utils.ts';
import { getHipster } from '../internal/index.ts';
import { upperFirstCamelCase } from '../../../lib/utils/index.ts';
import type { Application as BaseSimpleApplication } from '../../base-simple-application/types.js';

export const baseNameProperties = {
  camelizedBaseName: ({ baseName }: BaseSimpleApplication) => customCamelCase(baseName),
  hipster: ({ baseName }: BaseSimpleApplication) => getHipster(baseName),
  capitalizedBaseName: ({ baseName }: BaseSimpleApplication) => upperFirst(baseName),
  dasherizedBaseName: ({ baseName }: BaseSimpleApplication) => kebabCase(baseName),
  lowercaseBaseName: ({ baseName }: BaseSimpleApplication) => baseName?.toLowerCase(),
  upperFirstCamelCaseBaseName: ({ baseName }: BaseSimpleApplication) => upperFirstCamelCase(baseName),
  humanizedBaseName: ({ baseName }: BaseSimpleApplication) => (baseName.toLowerCase() === 'jhipster' ? 'JHipster' : startCase(baseName)),
} as const;
