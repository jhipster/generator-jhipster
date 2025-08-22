import { kebabCase, startCase, upperFirst } from 'lodash-es';

import { type MutateDataParam, type MutateDataPropertiesWithRequiredProperties, upperFirstCamelCase } from '../../lib/utils/index.ts';
import { customCamelCase } from '../../lib/utils/string-utils.ts';

import { getHipster } from './internal/index.ts';

export type ProjectNameAddedApplicationProperties = {
  baseName: string;
  camelizedBaseName: string;
  capitalizedBaseName: string;
  dasherizedBaseName: string;
  humanizedBaseName: string;
  hipster: string;
  lowercaseBaseName: string;
  upperFirstCamelCaseBaseName: string;
};

export const mutateApplication = {
  baseName: 'JHipster',
  camelizedBaseName: ({ baseName }) => customCamelCase(baseName),
  capitalizedBaseName: ({ baseName }) => upperFirst(baseName),
  dasherizedBaseName: ({ baseName }) => kebabCase(baseName),
  hipster: ({ baseName }) => getHipster(baseName),
  humanizedBaseName: ({ baseName }) => (baseName.toLowerCase() === 'jhipster' ? 'JHipster' : startCase(baseName)),
  lowercaseBaseName: ({ baseName }) => baseName?.toLowerCase(),
  upperFirstCamelCaseBaseName: ({ baseName }) => upperFirstCamelCase(baseName),
} as const satisfies MutateDataPropertiesWithRequiredProperties<
  MutateDataParam<ProjectNameAddedApplicationProperties>,
  ProjectNameAddedApplicationProperties
>;
