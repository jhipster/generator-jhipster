const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const SpringServiceGenerator = require('../../generators/spring-service');
const constants = require('../../generators/generator-constants');

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;

const mockBlueprintSubGen = class extends SpringServiceGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important
        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
        if (!jhContext) {
            this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprint myblueprint')}");
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
            customizeName() {
                this.name = `${this.name}Entity`;
            }
        };
        return { ...customPhaseSteps, ...phaseFromJHipster };
    }

    get install() {
        return super._install();
    }

    get end() {
        return super._end();
    }
};

describe('JHipster spring service generator with blueprint', () => {
    const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

    blueprintNames.forEach(blueprintName => {
        describe(`generate spring service with blueprint option '${blueprintName}'`, () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/spring-service'))
                    .withOptions({
                        'from-cli': true,
                        skipInstall: true,
                        blueprint: blueprintName,
                        skipChecks: true
                    })
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../templates/default'), dir);
                    })
                    .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:spring-service']])
                    .withArguments(['foo'])
                    .withPrompts({ useInterface: true })
                    .on('end', done);
            });

            it('creates spring service files with different name from the default', () => {
                assert.file([
                    `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooEntityService.java`,
                    `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooEntityServiceImpl.java`
                ]);
            });

            it('doesnt create spring service files with default name', () => {
                assert.noFile([
                    `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
                    `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.java`
                ]);
            });
        });
    });

    describe('generate spring service with dummy blueprint overriding everything', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../../generators/spring-service'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'myblueprint',
                    skipChecks: true
                })
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../templates/default'), dir);
                })
                .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:spring-service']])
                .withArguments(['foo'])
                .withPrompts({ useInterface: true })
                .on('end', done);
        });

        it("doesn't create any expected files from jhipster spring service generator", () => {
            assert.noFile([
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
                `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.java`
            ]);
        });
    });
});
