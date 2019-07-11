const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('../utils/expected-files').entity;
const EntityClientGenerator = require('../../generators/entity-client');
const constants = require('../../generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const ANGULAR_DIR = constants.ANGULAR_DIR;

const mockBlueprintSubGen = class extends EntityClientGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        if (!this.jhipsterContext) {
            this.error('This is a JHipster blueprint and should be used only like jhipster --blueprint myblueprint');
        }
    }

    get writing() {
        return {
            customPhase() {
                this.name = 'JHipster';
                this.template(path.join(process.cwd(), 'HelloVue.html.ejs'), `${ANGULAR_DIR}HelloVue.html`);
            }
        };
    }
};

describe('JHipster entity client generator with blueprint', () => {
    const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

    blueprintNames.forEach(blueprintName => {
        describe(`generate client entity with blueprint option '${blueprintName}'`, () => {
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
                    .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:entity-client']])
                    .withPrompts({
                        fieldAdd: false,
                        relationshipAdd: false,
                        dto: 'no',
                        service: 'no',
                        pagination: 'no'
                    })
                    .on('end', done);
            });

            it('creates expected server + i18n entity files from jhipster entity generator', () => {
                assert.file(expectedFiles.server);
                assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`);
            });

            it('does not create default entity client files from jhipster entity generator', () => {
                assert.noFile(expectedFiles.clientNg2);
            });

            it('contains the specific change added by the blueprint', () => {
                assert.fileContent(`${ANGULAR_DIR}HelloVue.html`, /Hello JHipster/);
            });
        });
    });
});
