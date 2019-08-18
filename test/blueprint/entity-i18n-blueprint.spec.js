const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('../utils/expected-files').entity;
const EntityI18NGenerator = require('../../generators/entity-i18n');
const constants = require('../../generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

const mockBlueprintSubGen = class extends EntityI18NGenerator {
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
                this.template(path.join(process.cwd(), 'custom-i18n.json.ejs'), `${CLIENT_MAIN_SRC_DIR}i18n/custom-i18n.json`);
            }
        };
    }
};

describe('JHipster entity server generator with blueprint', () => {
    const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

    blueprintNames.forEach(blueprintName => {
        describe(`generate server entity with blueprint option '${blueprintName}'`, () => {
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
                    .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:entity-i18n']])
                    .withPrompts({
                        fieldAdd: false,
                        relationshipAdd: false,
                        dto: 'no',
                        service: 'no',
                        pagination: 'no'
                    })
                    .on('end', done);
            });

            it('creates expected entity server + client files from jhipster entity generator', () => {
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.clientNg2);
            });

            it('does not create default entity i18n files from jhipster entity generator', () => {
                assert.noFile(`${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`);
            });

            it('contains the specific change added by the blueprint', () => {
                assert.JSONFileContent(`${CLIENT_MAIN_SRC_DIR}i18n/custom-i18n.json`, {
                    myblueprintApp: { name: 'JHipster' }
                });
            });
        });
    });
});
