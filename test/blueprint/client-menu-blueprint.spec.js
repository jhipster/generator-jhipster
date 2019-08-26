/* eslint-disable max-classes-per-file */
const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('../utils/expected-files');
const EntityGenerator = require('../../generators/entity');
const ClientGenerator = require('../../generators/client');
const constants = require('../../generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

const mockEntityBlueprintSubGen = class extends EntityGenerator {
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
        const customPhaseSteps = {
            changeProperty() {
                this.context.entityModule = 'admin';
            }
        };
        return {
            ...phaseFromJHipster,
            ...customPhaseSteps
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

const mockClientBlueprintSubGen = class extends ClientGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important
        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
        if (!jhContext) {
            this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprint myblueprint')}");
        }
        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupClientOptions(this, jhContext);
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
            runEntity() {
                const self = this;
                const configOptions = this.configOptions;

                this.composeWith('jhipster-myblueprint:entity', {
                    ...self.options,
                    configOptions,
                    'skip-install': true,
                    arguments: ['foo']
                });
            }
        };
        return { ...phaseFromJHipster, ...customPhaseSteps };
    }

    get install() {
        return super._install();
    }

    get end() {
        return super._end();
    }
};

describe('JHipster entity generator with blueprint without menu', () => {
    const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

    blueprintNames.forEach(blueprintName => {
        describe(`generate entity with blueprint option '${blueprintName}'`, () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/client'))
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../../test/templates/ngx-blueprint'), dir);
                    })
                    .withOptions({
                        'from-cli': true,
                        build: 'maven',
                        auth: 'jwt',
                        db: 'mysql',
                        skipInstall: true,
                        blueprint: blueprintName,
                        skipChecks: true
                    })
                    .withGenerators([
                        [mockClientBlueprintSubGen, 'jhipster-myblueprint:client'],
                        [mockEntityBlueprintSubGen, 'jhipster-myblueprint:entity']
                    ])
                    .withPrompts({
                        baseName: 'jhipster',
                        clientFramework: 'angularX',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        // Entity subGen
                        fieldAdd: false,
                        relationshipAdd: false,
                        dto: 'no',
                        service: 'no',
                        pagination: 'no'
                    })
                    .on('end', done);
            });

            it('creates expected files from jhipster entity generator', () => {
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.i18nJson);
                assert.file(expectedFiles.entity.server);
                assert.file(expectedFiles.entity.clientNg2);
                assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`);
            });

            /*
            it('Force print file', () => {
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, /fail to debug/);
            });
            it('Force print file', () => {
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`, /fail to debug/);
            });
            */

            it('Menu changed to the admin by the blueprint', () => {
                assert.noFileContent(`${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`, /global.menu.entities.foo/);
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`, /global.menu.admin.foo/);
            });

            it('Menu translation changed to the admin by the blueprint', () => {
                assert.JSONFileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, {
                    global: { menu: { entities: { foo: undefined } } }
                });
                assert.JSONFileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, {
                    global: { menu: { admin: { foo: 'Foo' } } }
                });
            });
        });
    });
});

describe('JHipster entity generator with menu', () => {
    const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

    blueprintNames.forEach(blueprintName => {
        describe(`generate entity with blueprint option '${blueprintName}'`, () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/client'))
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../../test/templates/ngx-blueprint'), dir);
                    })
                    .withOptions({
                        'from-cli': true,
                        build: 'maven',
                        auth: 'jwt',
                        db: 'mysql',
                        skipInstall: true,
                        blueprint: blueprintName,
                        skipChecks: true
                    })
                    .withGenerators([
                        [mockClientBlueprintSubGen, 'jhipster-myblueprint:client'],
                        [EntityGenerator, 'jhipster-myblueprint:entity']
                    ])
                    .withPrompts({
                        baseName: 'jhipster',
                        clientFramework: 'angularX',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr'],
                        // Entity subGen
                        fieldAdd: false,
                        relationshipAdd: false,
                        dto: 'no',
                        service: 'no',
                        pagination: 'no'
                    })
                    .on('end', done);
            });

            it('creates expected files from jhipster entity generator', () => {
                assert.file(expectedFiles.client);
                assert.file(expectedFiles.i18nJson);
                assert.file(expectedFiles.entity.server);
                assert.file(expectedFiles.entity.clientNg2);
                assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`);
            });

            /*
            it('Force print file', () => {
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, /fail to debug/);
            });
            it('Force print file', () => {
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`, /fail to debug/);
            });
            */

            it('Contains the menu', () => {
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`, /global.menu.entities.foo/);
            });

            it('Contains the menu translation', () => {
                assert.JSONFileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, {
                    global: { menu: { entities: { foo: 'Foo' } } }
                });
            });
        });
    });
});
