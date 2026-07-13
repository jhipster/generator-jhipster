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

import { before, describe, it } from 'esmocha';

import { clientFrameworkTypes } from '../../lib/jhipster/index.ts';
import { CLIENT_WEBPACK_DIR } from '../generator-constants.ts';

import ClientGenerator from './index.ts';

import { dryRunHelpers as helpers, result as runResult } from '#testing';

const { ANGULAR, REACT } = clientFrameworkTypes;

type MockBlueprintSubGenConstructorParamsT = ConstructorParameters<typeof ClientGenerator>;

const mockBlueprintSubGen: any = class extends ClientGenerator {
  constructor(
    args: MockBlueprintSubGenConstructorParamsT[0],
    opts: MockBlueprintSubGenConstructorParamsT[1],
    features: MockBlueprintSubGenConstructorParamsT[2],
  ) {
    super(args, opts, { ...features, sbsBlueprint: true });
  }

  get [ClientGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      webpackPhase({ source }) {
        source.addWebpackConfig!({ config: '{devServer:{}}' });
      },
    });
  }
};

describe('needle API Webpack: JHipster client generator with blueprint', () => {
  function generateAppWithClientFramework(
    clientFramework: Exclude<(typeof clientFrameworkTypes)[keyof typeof clientFrameworkTypes], 'svelte'>,
  ) {
    return helpers
      .runJHipster('client')
      .withOptions({
        blueprint: ['myblueprint'],
      })
      .withJHipsterConfig({
        buildTool: 'maven',
        authenticationType: 'jwt',
        prodDatabaseType: 'mysql',
        skipServer: true,
        baseName: 'jhipster',
        clientFramework,
        enableTranslation: true,
        nativeLanguage: 'en',
        languages: ['en', 'fr'],
        clientBundler: 'webpack',
      })
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:client' }]]);
  }

  describe('Angular clientFramework', () => {
    before(() => {
      return generateAppWithClientFramework(ANGULAR);
    });

    it('should add webpack config to webpack.custom.js', async () => {
      runResult.assertFileContent(`${CLIENT_WEBPACK_DIR}webpack.custom.js`, '{ devServer: {} }');
    });
  });

  describe('React clientFramework', () => {
    before(() => {
      return generateAppWithClientFramework(REACT);
    });

    it('should add webpack config to webpack.common.js', async () => {
      runResult.assertFileContent(`${CLIENT_WEBPACK_DIR}webpack.common.js`, '{ devServer: {} }');
    });
  });
});
