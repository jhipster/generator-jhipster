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

import { asWriteFilesSection } from '../../../base-application/support/task-type-inference.ts';
import { SERVER_MAIN_SRC_DIR, SERVER_TEST_SRC_DIR } from '../../../generator-constants.ts';
import { moveToJavaPackageSrcDir, moveToJavaPackageTestDir } from '../../../java/support/index.ts';
import type { Application as JavaApplication } from '../../../java/types.ts';

export const feignFiles = asWriteFilesSection<JavaApplication>({
  microserviceFeignFiles: [
    {
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['config/FeignConfiguration.java'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: [
        'client/AuthorizationHeaderUtil.java',
        'client/AuthorizedFeignClient.java',
        'client/OAuth2InterceptedFeignConfiguration.java',
        'client/TokenRelayRequestInterceptor.java',
        'client/OAuthIdpTokenResponseDTO.java',
      ],
    },
    {
      condition: generator => generator.authenticationTypeJwt,
      path: `${SERVER_MAIN_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageSrcDir,
      templates: ['client/UserFeignClientInterceptor_jwt.java'],
    },
    {
      condition: generator => generator.authenticationTypeOauth2,
      path: `${SERVER_TEST_SRC_DIR}_package_/`,
      renameTo: moveToJavaPackageTestDir,
      templates: ['client/AuthorizationHeaderUtilTest.java'],
    },
  ],
});
