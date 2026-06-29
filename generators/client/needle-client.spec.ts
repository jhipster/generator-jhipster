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

import { dryRunHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.ts';

import ClientGenerator from './index.ts';

type MockBlueprintSubGenConstructorParamsT = ConstructorParameters<typeof ClientGenerator>;

const mockBlueprintSubGen: any = class extends ClientGenerator {
  constructor(...args: MockBlueprintSubGenConstructorParamsT) {
    super(...args);

    if (!this.jhipsterContext) {
      throw new Error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [ClientGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      async additionalResource({ source }) {
        source.addExternalResourceToRoot!({
          resource: '<link rel="stylesheet" href="content/css/my.css">',
          comment: 'Comment added by JHipster API',
        });
      },
    });
  }
};

describe('needle API Client: JHipster client generator with blueprint', () => {
  before(async () => {
    await helpers
      .runJHipster('client')
      .withJHipsterConfig({
        skipServer: true,
      })
      .withOptions({
        blueprint: ['myblueprint'],
      })
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:client' }]]);
  });

  it('Assert index.html contain the comment and the resource added', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}index.html`, '<!-- Comment added by JHipster API -->');
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}index.html`, '<link rel="stylesheet" href="content/css/my.css" />');
  });
});
