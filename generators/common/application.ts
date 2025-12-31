/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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
import type { MutateDataParam, MutateDataPropertiesWithRequiredProperties } from '../../lib/utils/object.ts';
import { LOGIN_REGEX, MAIN_DIR, TEST_DIR } from '../generator-constants.ts';

import type { Application as CommonApplication } from './types.ts';

export type CommonAddedApplicationProperties = {
  srcMain: string;
  srcTest: string;

  gatewayServicesApiAvailable?: boolean;

  endpointPrefix?: string;
  authenticationUsesCsrf: boolean;
  gatewayRoutes?: { route: string; host: string; serverPort: string }[];

  devServerPort?: number;
  serverPort?: number;
  backendType?: string;
  backendTypeJavaAny?: boolean;
  backendTypeSpringBoot?: boolean;
  temporaryDir?: string;

  loginRegex?: string;

  skipClient?: boolean;
  skipServer?: boolean;

  /**
   * True if the application has at least one non-builtin entity.
   */
  hasNonBuiltInEntity?: boolean;
};

export const mutateApplication = {
  __override__: false,
  srcMain: MAIN_DIR,
  srcTest: TEST_DIR,

  loginRegex: LOGIN_REGEX,
  backendType: 'Java',
  backendTypeSpringBoot: ({ backendType }) => backendType === 'Java',
  backendTypeJavaAny: ({ backendTypeSpringBoot }) => backendTypeSpringBoot,

  temporaryDir: ({ backendType, buildTool }) => {
    if (['Java'].includes(backendType!)) {
      return buildTool === 'gradle' ? 'build/' : 'target/';
    }
    return 'temp/';
  },
  clientDistDir: ({ backendType, temporaryDir, buildTool }) => {
    if (['Java'].includes(backendType!)) {
      return `${temporaryDir}${buildTool === 'gradle' ? 'resources/main/' : 'classes/'}static/`;
    }
    return 'dist/';
  },

  authenticationTypeSession: data => data.authenticationType === 'session',
  authenticationTypeJwt: data => data.authenticationType === 'jwt',
  authenticationTypeOauth2: data => data.authenticationType === 'oauth2',

  authenticationUsesCsrf: ({ authenticationType }) => ['oauth2', 'session'].includes(authenticationType!),
  endpointPrefix: ({ applicationType, lowercaseBaseName }) => (applicationType === 'microservice' ? `services/${lowercaseBaseName}` : ''),

  devServerPort: 9060,
  serverPort: ({ applicationTypeMicroservice }) => (applicationTypeMicroservice ? 8081 : 8080),
} as const satisfies MutateDataPropertiesWithRequiredProperties<MutateDataParam<CommonApplication>, CommonAddedApplicationProperties>;
