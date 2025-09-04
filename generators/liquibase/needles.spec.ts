import { before, describe, it } from 'esmocha';

import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { asPostWritingTask } from '../base-application/support/task-type-inference.ts';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.js';

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
