import path, { dirname } from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import fse from 'fs-extra';
import { fileURLToPath } from 'url';
import ServerGenerator from '../../generators/server/index.mjs';
import { SERVER_MAIN_RES_DIR } from '../../generators/generator-constants.mjs';
import { getGenerator } from '../support/index.mjs';
import { serviceDiscoveryTypes } from '../../jdl/jhipster/index.mjs';

const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serverFiles = {
  serverResource: [
    {
      path: `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/`,
      templates: [
        {
          file: 'dummy_changelog.xml',
        },
      ],
    },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends ServerGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

    if (!jhContext) {
      this.error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [ServerGenerator.POST_WRITING]() {
    const customPhaseSteps = {
      writeTestFiles() {
        return this.writeFiles({ sections: serverFiles });
      },
      addChangelogStep() {
        this.addChangelogToLiquibase('aNewChangeLog');
        this.addConstraintsChangelogToLiquibase('aNewConstraintsChangeLog');
        this.addLiquibaseChangelogToMaster('aNewChangeLogWithNeedle', 'jhipster-needle-liquibase-add-changelog');
      },
      addIncrementalChangelog() {
        this.addIncrementalChangelogToLiquibase('incrementalChangeLogWithNeedle');
        this.addIncrementalChangelogToLiquibase('incrementalChangeLogWithNeedle2');
      },
      addColumnStep() {
        this.addColumnToLiquibaseEntityChangeset(
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/dummy_changelog.xml`,
          '            <column name="test" type="varchar(255)">\n' +
            '                <constraints nullable="false" />\n' +
            '            </column>'
        );

        this.addChangesetToLiquibaseEntityChangelog(
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/dummy_changelog.xml`,
          '    <changeSet id="20180328000000-2" author="jhipster">\n' +
            '        <createTable tableName="test">\n' +
            '            <column name="id" type="bigint" autoIncrement="${autoIncrement}">\n' + // eslint-disable-line
            '                <constraints primaryKey="true" nullable="false"/>\n' +
            '            </column>\n' +
            '        </createTable>\n' +
            '    </changeSet>'
        );
      },
      addLoadColumnStep() {
        this.addLoadColumnToLiquibaseEntityChangeSet(
          `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/dummy_changelog.xml`,
          '            <column name="loadColumn" type="string" />'
        );
      },
    };
    return { ...customPhaseSteps };
  }
};

describe('needle API server liquibase: JHipster server generator with blueprint', () => {
  before(async () => {
    await helpers
      .run(getGenerator('server'))
      .inTmpDir(dir => {
        fse.copySync(
          path.join(__dirname, 'templates/src/main/resources/config/liquibase/changelog/'),
          `${dir}/templates/src/main/resources/config/liquibase/changelog/`
        );
      })
      .withOptions({
        skipInstall: true,
        blueprint: 'myblueprint',
        skipChecks: true,
        skipPriorities: ['prompting'],
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:server']])
      .withPrompts({
        baseName: 'jhipster',
        packageName: 'com.mycompany.myapp',
        packageFolder: 'com/mycompany/myapp',
        serviceDiscoveryType: NO_SERVICE_DISCOVERY,
        authenticationType: 'jwt',
        cacheProvider: 'ehcache',
        enableHibernateCache: true,
        databaseType: 'sql',
        devDatabaseType: 'h2Memory',
        prodDatabaseType: 'mysql',
        enableTranslation: true,
        nativeLanguage: 'en',
        languages: ['fr'],
        buildTool: 'maven',
        rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
        serverSideOptions: [],
      });
  });

  it('Assert changelog is added to master.xml', () => {
    assert.fileContent(
      `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
      '<include file="config/liquibase/changelog/aNewChangeLog.xml" relativeToChangelogFile="false"/>'
    );
  });

  it('Assert incremental changelog is added to master.xml', () => {
    assert.fileContent(
      `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
      '<include file="config/liquibase/changelog/incrementalChangeLogWithNeedle.xml" relativeToChangelogFile="false"/>'
    );
    assert.fileContent(
      `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
      '<include file="config/liquibase/changelog/incrementalChangeLogWithNeedle2.xml" relativeToChangelogFile="false"/>'
    );
  });

  it('Assert constraints changelog is added to master.xml', () => {
    assert.fileContent(
      `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
      '<include file="config/liquibase/changelog/aNewConstraintsChangeLog.xml" relativeToChangelogFile="false"/>'
    );
  });

  it('Assert constraints with needle changelog is added to master.xml', () => {
    assert.fileContent(
      `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
      '<include file="config/liquibase/changelog/aNewChangeLogWithNeedle.xml" relativeToChangelogFile="false"/>'
    );
  });

  it('Assert that column is added to an existing changelog', () => {
    assert.fileContent(
      `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/dummy_changelog.xml`,
      '            <column name="test" type="varchar(255)">\n' +
        '                <constraints nullable="false" />\n' +
        '            </column>'
    );
  });

  it('Assert that load column is added to an existing changelog', () => {
    assert.fileContent(
      `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/dummy_changelog.xml`,
      '            <column name="loadColumn" type="string" />'
    );
  });

  it('Assert that changeSet is added to an existing changelog', () => {
    assert.fileContent(
      `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/dummy_changelog.xml`,
      '    <changeSet id="20180328000000-2" author="jhipster">\n' +
        '        <createTable tableName="test">\n' +
        '            <column name="id" type="bigint" autoIncrement="${autoIncrement}">\n' + // eslint-disable-line
        '                <constraints primaryKey="true" nullable="false"/>\n' +
        '            </column>\n' +
        '        </createTable>\n' +
        '    </changeSet>'
    );
  });
});
