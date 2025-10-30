/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { startCase } from 'lodash-es';

import { getFrontendAppName } from '../../lib/utils/basename.ts';
import type { MutateDataParam, MutateDataPropertiesWithRequiredProperties } from '../../lib/utils/object.ts';
import { CLIENT_TEST_SRC_DIR, LOGIN_REGEX_JS } from '../generator-constants.js';

import type { GetWebappTranslationCallback } from './translation.ts';
import type { Application as ClientApplication, Entity as ClientEntity } from './types.ts';

export type ClientAddedApplicationProperties = {
  clientI18nDir: string;
  webappLoginRegExp: string;
  clientThemeNone: boolean;
  clientThemeAny: boolean;
  webappEnumerationsDir?: string;
  clientFrameworkBuiltIn: boolean;
  frontendAppName: string;
  filterEntitiesForClient?: <const E extends ClientEntity>(entity: E[]) => E[];
  filterEntitiesAndPropertiesForClient?: <const E extends ClientEntity>(entity: E[]) => E[];
  filterEntityPropertiesForClient?: <const E extends ClientEntity>(entity: E) => E;
  getWebappTranslation?: GetWebappTranslationCallback;
  clientBundlerName: string;
  clientTestFrameworkName: string;
  withAdminUi: boolean;
};

export const mutateApplication = {
  __override__: false,
  clientI18nDir: data => `${data.clientSrcDir}i18n/`,
  webappLoginRegExp: LOGIN_REGEX_JS,
  clientDistDir: 'dist/',
  clientTestDir: ({ clientRootDir }) => `${clientRootDir}${clientRootDir ? 'test/' : CLIENT_TEST_SRC_DIR}`,
  frontendAppName: ({ baseName }) => getFrontendAppName({ baseName }),
  microfrontend: application => {
    if (application.applicationTypeMicroservice) {
      return application.clientFrameworkAny ?? false;
    }
    if (application.applicationTypeGateway) {
      return application.microfrontends && application.microfrontends.length > 0;
    }
    return false;
  },
  clientFrameworkBuiltIn: ({ clientFramework }) => ['angular', 'vue', 'react'].includes(clientFramework!),
  clientThemeNone: ({ clientTheme }) => !clientTheme || clientTheme === 'none',
  clientThemeAny: ({ clientThemeNone }) => !clientThemeNone,
  clientBundlerName: ctx => (ctx.clientBundlerEsbuild ? 'esbuild' : startCase(ctx.clientBundler)),
  clientTestFrameworkName: ctx => startCase(ctx.clientTestFramework),
  withAdminUi: ctx => ctx.applicationTypeMicroservice,
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<ClientApplication>, ClientAddedApplicationProperties>;
