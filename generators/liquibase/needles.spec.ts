import { before, describe, it } from 'esmocha';
import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.js';
import BaseApplicationGenerator from '../base-application/index.js';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.js';
import { GENERATOR_LIQUIBASE } from '../generator-list.js';

class mockBlueprintSubGen extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      addChangelogStep({ source }) {
        source.addLiquibaseChangelog?.({ changelogName: 'aNewChangeLog' });
        source.addLiquibaseConstraintsChangelog?.({ changelogName: 'aNewConstraintsChangeLog' });
      },
      addIncrementalChangelog({ source }) {
        source.addLiquibaseIncrementalChangelog?.({ changelogName: 'incrementalChangeLogWithNeedle' });
        source.addLiquibaseIncrementalChangelog?.({ changelogName: 'incrementalChangeLogWithNeedle2' });
      },
    });
  }
}

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
        blueprint: ['myblueprint'],
        skipPriorities: ['writing'],
      })
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:liquibase' }]]);
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
