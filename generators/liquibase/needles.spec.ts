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

import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { asPostWritingTask } from '../base-application/support/task-type-inference.ts';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.ts';

const GENERATOR_LIQUIBASE = 'liquibase';

const addNeedlesTask = asPostWritingTask(function ({ source }) {
  source.addLiquibaseChangelog?.({ changelogName: 'aNewChangeLog' });
  source.addLiquibaseConstraintsChangelog?.({ changelogName: 'aNewConstraintsChangeLog' });
  source.addLiquibaseIncrementalChangelog?.({ changelogName: 'incrementalChangeLogWithNeedle' });
  source.addLiquibaseIncrementalChangelog?.({ changelogName: 'incrementalChangeLogWithNeedle2' });
});

describe('generator - liquibase - needles', () => {
  before(async () => {
    await helpers
      .runJHipster(GENERATOR_LIQUIBASE)
      .withFiles({
        'src/main/resources/config/liquibase/master.xml': `
<databaseChangeLog>
    <!-- jhipster-needle-liquibase-add-changelog - JHipster will add liquibase changelogs here -->
    <!-- jhipster-needle-liquibase-add-constraints-changelog - JHipster will add liquibase constraints changelogs here -->
    <!-- jhipster-needle-liquibase-add-incremental-changelog - JHipster will add incremental liquibase changelogs here -->
</databaseChangeLog>
`,
      })
      .withJHipsterConfig({
        clientFramework: 'no',
      })
      .withOptions({
        skipPriorities: ['writing'],
      })
      .withTask('postWriting', addNeedlesTask);
  });

  it('Assert changelog is added to master.xml', () => {
    runResult.assertFileContent(
      `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
      '<include file="config/liquibase/changelog/aNewChangeLog.xml" relativeToChangelogFile="false"/>',
    );
  });

  it('Assert incremental changelog is added to master.xml', () => {
    runResult.assertFileContent(
      `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
      '<include file="config/liquibase/changelog/incrementalChangeLogWithNeedle.xml" relativeToChangelogFile="false"/>',
    );
    runResult.assertFileContent(
      `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
      '<include file="config/liquibase/changelog/incrementalChangeLogWithNeedle2.xml" relativeToChangelogFile="false"/>',
    );
  });

  it('Assert constraints changelog is added to master.xml', () => {
    runResult.assertFileContent(
      `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
      '<include file="config/liquibase/changelog/aNewConstraintsChangeLog.xml" relativeToChangelogFile="false"/>',
    );
  });
});
