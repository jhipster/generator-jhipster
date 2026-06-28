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

import type { ConfigAll } from '../../types/command-all.ts';

import { MatrixMicroserviceGateway, MatrixMonolith } from './application-samples.ts';
import { type Matrix, buildSamplesFromMatrix, extendFilteredMatrix, extendMatrix, fromMatrix } from './matrix-utils.ts';

const CLIENT_ADDITIONAL_CONFIG_MATRIX = {
  withAdminUi: [false, true],
  skipJhipsterDependencies: [false, true],
  enableTranslation: [false, true],
  clientRootDir: [undefined, { value: 'clientRoot/' }, { value: '' }],
  websocket: [false, true],
};

export const buildClientSamples = (commonConfig?: ConfigAll): Matrix => {
  let clientMatrix: Matrix = {
    ...fromMatrix(MatrixMonolith),
    ...fromMatrix(MatrixMicroserviceGateway),
  };

  clientMatrix = extendFilteredMatrix(clientMatrix, sample => sample.authenticationType !== 'oauth2', {
    skipUserManagement: [false, true],
  });

  clientMatrix = extendMatrix(clientMatrix, CLIENT_ADDITIONAL_CONFIG_MATRIX);

  return buildSamplesFromMatrix(clientMatrix, { commonConfig });
};

export const clientSamples = buildClientSamples();
