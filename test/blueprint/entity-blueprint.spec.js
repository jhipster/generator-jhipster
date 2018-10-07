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
        const customPhaseSteps = {
            changeProperty() {
                // TODO check why this doesnt work
                // this.context.name = 'newBaseName';
            }
        };
        return {
            ...phaseFromJHipster,
            ...customPhaseSteps
        };
    }

    get prompting() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._prompting();
    }

    get configuring() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._configuring();
    }

    get writing() {
        return super._writing();
    }

    get install() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._install();
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
                        fse.copySync(path.join(__dirname, '../../test/templates/default-ng2'), dir);
                    })
                    .withArguments('foo')
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

            // TODO check why this doesnt work
            // it('contains the specific change added by the blueprint', () => {
            //     assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`, /dummyBlueprintProperty/);
            // });
        });
    });
});
