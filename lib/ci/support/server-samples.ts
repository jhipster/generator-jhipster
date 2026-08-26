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

import { MatrixGateway, MatrixMicroservice, MatrixMonolith, ReactiveMatrix } from './application-samples.ts';
import { type Matrix, type MatrixInput, buildSamplesFromMatrix, extendFilteredMatrix, extendMatrix, fromMatrix } from './matrix-utils.ts';

export const buildServerMatrix = (matrix: MatrixInput = {}): Matrix => {
  let serverMatrix = extendMatrix(
    {
      ...fromMatrix({
        ...MatrixMonolith,
        ...matrix,
        ...ReactiveMatrix,
      }),
      ...fromMatrix({
        ...MatrixMicroservice,
        ...matrix,
        ...ReactiveMatrix,
      }),
      ...fromMatrix({
        ...MatrixGateway,
        ...matrix,
        ...ReactiveMatrix,
      }),
    },
    {
      buildTool: ['maven', 'gradle'],
      enableTranslation: [false, true],
      packageName: ['tech.jhipster', 'com.mycompany'],
      jhiPrefix: ['jhi', 'fix'],
      entitySuffix: ['Entity', ''],
      dtoSuffix: ['DTO', 'Rest'],
      skipCommitHook: [false, true],
      testFrameworks: [[], ['gatling'], ['cucumber']],
      enableSwaggerCodegen: [false, true],
    },
  );

  serverMatrix = extendFilteredMatrix(serverMatrix, sample => !sample.reactive, {
    websocket: [undefined, 'spring-websocket'],
  });

  serverMatrix = extendFilteredMatrix(serverMatrix, sample => sample.authenticationType !== 'oauth2', {
    skipUserManagement: [false, true],
  });

  serverMatrix = extendFilteredMatrix(serverMatrix, sample => sample.authenticationType === 'session', {
    serviceDiscoveryType: ['no', 'consul'],
  });

  serverMatrix = extendFilteredMatrix(serverMatrix, sample => sample.authenticationType !== 'session', {
    serviceDiscoveryType: ['no', 'consul', 'eureka'],
  });

  return serverMatrix;
};

export const buildServerSamples = (commonConfig?: Record<string, unknown>, matrix?: Record<string, unknown>) =>
  buildSamplesFromMatrix(buildServerMatrix(matrix), { commonConfig });
