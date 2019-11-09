const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('../utils/expected-files').entity;
const EntityGenerator = require('../../generators/entity');
const constants = require('../../generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

const mockBlueprintSubGen = class extends EntityGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error('This is a JHipster blueprint and should be used only like jhipster --blueprint myblueprint');
        }

        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupEntityOptions(this, jhContext, this);
    }

    get initializing() {
        const phaseFromJHipster = super._initializing();
        const customPrePhaseSteps = {
            // Create a custom persistent entity config.
            createCustomConfig() {
                // Simulate data loaded from file
                this.context.fileData = this.context.fileData || {};
                this.context.fileData.customPreConfigKey = 'customPreConfigValue';
                this.context.fileData.customBlueprintConfigKey = 'customPreConfigValue';

                // Override with new value
                this.storageData = {
                    customBlueprintConfigKey: 'customBlueprintConfigValue'
                };
            }
        };
        const customPostPhaseSteps = {
            changeProperty() {
                this.context.angularAppName = 'awesomeAngularAppName';
            }
        };
        return {
            ...customPrePhaseSteps,
            ...phaseFromJHipster,
            ...customPostPhaseSteps
        };
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
        return super._writing();
    }

    get install() {
        return super._install();
    }

    get end() {
        return super._end();
    }
};

describe('JHipster entity generator with blueprint', () => {
    const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

    blueprintNames.forEach(blueprintName => {
        describe(`generate entity with blueprint option '${blueprintName}'`, () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/entity'))
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../../test/templates/ngx-blueprint'), dir);
                    })
                    .withArguments(['foo'])
                    .withOptions({
                        'from-cli': true,
                        skipInstall: true,
                        blueprint: blueprintName,
                        skipChecks: true
                    })
                    .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:entity']])
                    .withPrompts({
                        fieldAdd: false,
                        relationshipAdd: false,
                        dto: 'no',
                        service: 'no',
                        pagination: 'no'
                    })
                    .on('end', done);
            });

            it('creates expected files from jhipster entity generator', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.clientNg2);
                assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`);
            });

            it('contains the specific change added by the blueprint', () => {
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`, /awesomeAngularAppName/);
            });

            // Verify if the custom entity config is persisted.
            it('contains the specific config added', () => {
                assert.fileContent('.jhipster/Foo.json', /"customPreConfigKey": "customPreConfigValue"/);
            });
            it('contains the specific config added by the blueprint', () => {
                assert.fileContent('.jhipster/Foo.json', /"customBlueprintConfigKey": "customBlueprintConfigValue"/);
            });
        });
    });

    describe('generate entity with dummy blueprint overriding everything', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../../generators/entity'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../../test/templates/ngx-blueprint'), dir);
                })
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'myblueprint',
                    skipChecks: true
                })
                .withGenerators([[helpers.createDummyGenerator(), 'jhipster-myblueprint:entity']])
                .withArguments(['foo'])
                .withPrompts({
                    fieldAdd: false,
                    relationshipAdd: false,
                    dto: 'no',
                    service: 'no',
                    pagination: 'no'
                })
                .on('end', done);
        });

        it("doesn't create any expected files from jhipster entity generator", () => {
            assert.noFile(expectedFiles.server);
            assert.noFile(expectedFiles.clientNg2);
            assert.noFile(`${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`);
        });
    });
});
