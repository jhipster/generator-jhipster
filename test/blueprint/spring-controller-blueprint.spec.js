const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const SpringControllerGenerator = require('../../generators/spring-controller');
const constants = require('../../generators/generator-constants');

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;

const mockBlueprintSubGen = class extends SpringControllerGenerator {
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

describe('JHipster spring controller generator with blueprint', () => {
    const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

    blueprintNames.forEach(blueprintName => {
        describe(`generate spring controller with blueprint option '${blueprintName}'`, () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/spring-controller'))
                    .withOptions({
                        'from-cli': true,
                        skipInstall: true,
                        blueprint: blueprintName,
                        skipChecks: true
                    })
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../templates/default'), dir);
                    })
                    .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:spring-controller']])
                    .withArguments(['foo'])
                    .withOptions({ default: true })
                    .on('end', done);
            });

            it('creates spring controller files with different name from the default', () => {
                assert.file([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooEntityResource.java`]);

                assert.file([`${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooEntityResourceIT.java`]);
            });

            it('doesnt create spring controller files with default name', () => {
                assert.noFile([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`]);

                assert.noFile([`${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.java`]);
            });
        });
    });

    describe('generate spring controller with dummy blueprint overriding everything', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../../generators/spring-controller'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'myblueprint',
                    skipChecks: true
                })
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../templates/default'), dir);
                })
                .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:spring-controller']])
                .withArguments(['foo'])
                .withOptions({ default: true })
                .on('end', done);
        });

        it("doesn't create any expected files from jhipster spring controller generator", () => {
            assert.noFile([`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`]);

            assert.noFile([`${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.java`]);
        });
    });
});
