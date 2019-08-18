const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const ServerGenerator = require('../../generators/server');
const constants = require('../../generators/generator-constants');

const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

const serverFiles = {
    serverResource: [
        {
            path: `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/`,
            templates: [
                {
                    file: 'dummy_changelog.xml'
                }
            ]
        }
    ]
};

const mockBlueprintSubGen = class extends ServerGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error('This is a JHipster blueprint and should be used only like jhipster --blueprint myblueprint');
        }

        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupServerOptions(this, jhContext);
    }

    get initializing() {
        return super._initializing();
    }

    get prompting() {
        return super._prompting();
    }

    get configuring() {
        return super._configuring();
    }

    get default() {
        return super._default();
    }

    get writing() {
        const phaseFromJHipster = super._writing();
        const customPhaseSteps = {
            writeTestFiles() {
                this.writeFilesToDisk(serverFiles, this, false);
            },
            addChangelogStep() {
                this.addChangelogToLiquibase('aNewChangeLog');
                this.addConstraintsChangelogToLiquibase('aNewConstraintsChangeLog');
                this.addLiquibaseChangelogToMaster('aNewChangeLogWithNeedle', 'jhipster-needle-liquibase-add-changelog');
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
            }
        };
        return { ...phaseFromJHipster, ...customPhaseSteps };
    }
};

describe('needle API server liquibase: JHipster server generator with blueprint', () => {
    before(done => {
        helpers
            .run(path.join(__dirname, '../../generators/server'))
            .inTmpDir(dir => {
                fse.copySync(
                    path.join(__dirname, 'templates/src/main/resources/config/liquibase/changelog/'),
                    `${dir}/templates/src/main/resources/config/liquibase/changelog/`
                );
            })
            .withOptions({
                'from-cli': true,
                skipInstall: true,
                blueprint: 'myblueprint',
                skipChecks: true
            })
            .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:server']])
            .withPrompts({
                baseName: 'jhipster',
                packageName: 'com.mycompany.myapp',
                packageFolder: 'com/mycompany/myapp',
                serviceDiscoveryType: false,
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
                serverSideOptions: []
            })
            .on('end', done);
    });

    it('Assert changelog is added to master.xml', () => {
        assert.fileContent(
            `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
            '<include file="config/liquibase/changelog/aNewChangeLog.xml" relativeToChangelogFile="false"/>'
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
