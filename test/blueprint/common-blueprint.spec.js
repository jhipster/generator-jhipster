const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('../utils/expected-files');
const CommonGenerator = require('../../generators/common');

const mockBlueprintSubGen = class extends CommonGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important
        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
        if (!jhContext) {
            this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprint myblueprint')}");
        }
        this.configOptions = jhContext.configOptions || {};
    }

    get initializing() {
        return super._initializing();
    }

    get prompting() {
        return super._prompting();
    }

    get configuring() {
        const phaseFromJHipster = super._configuring();
        const customPhaseSteps = {
            overridesDocumentationUrl() {
                this.DOCUMENTATION_URL = 'https://myenterprise.intranet';
            }
        };
        return { ...phaseFromJHipster, ...customPhaseSteps };
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

describe('JHipster common generator with blueprint', () => {
    const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

    blueprintNames.forEach(blueprintName => {
        describe(`generate common with blueprint option '${blueprintName}'`, () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/common'))
                    .withOptions({
                        'from-cli': true,
                        skipInstall: true,
                        blueprint: blueprintName,
                        skipChecks: true
                    })
                    .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:common']])
                    .withPrompts({
                        baseName: 'jhipster'
                    })
                    .on('end', done);
            });

            it('creates expected files from jhipster common generator', () => {
                assert.file(expectedFiles.common);
                assert.noFile(expectedFiles.server);
                assert.noFile(expectedFiles.client);
            });

            it('contains the specific change added by the blueprint', () => {
                assert.fileContent('README.md', /myenterprise.intranet/);
            });
        });
    });

    describe('generate common with dummy blueprint overriding everything', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../../generators/common'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'myblueprint',
                    skipChecks: true
                })
                .withGenerators([[helpers.createDummyGenerator(), 'jhipster-myblueprint:common']])
                .withPrompts({
                    baseName: 'jhipster'
                })
                .on('end', done);
        });

        it("doesn't create any expected files from jhipster common generator", () => {
            assert.noFile(expectedFiles.common);
        });
    });
});
