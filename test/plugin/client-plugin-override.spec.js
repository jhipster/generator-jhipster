const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = require('../utils/expected-files');

describe('JHipster client generator with plugin that overrides another', () => {
    describe('generate client with blueprint (plugin) option', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../../generators/common'))
                .inTmpDir(dir => {
                    const fakeBlueprintModuleDir = path.join(dir, 'node_modules/generator-jhipster-myblueprint');
                    fse.ensureDirSync(fakeBlueprintModuleDir);
                    fse.copySync(path.join(__dirname, '../templates/plugins/client-override'), fakeBlueprintModuleDir);
                })
                .withOptions({
                    'from-cli': true,
                    build: 'maven',
                    auth: 'jwt',
                    db: 'mysql',
                    skipInstall: true,
                    blueprints: [{ name: 'myblueprint' }],
                    skipChecks: true
                })
                .withPrompts({
                    baseName: 'jhipster',
                    clientFramework: 'angularX',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['fr']
                })
                .on('end', done);
        });

        it('creates expected files from jhipster client generator', () => {
            assert.file(expectedFiles.client);
            assert.file(expectedFiles.i18nJson);
        });

        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('package.json', /dummy-blueprint-property/);
        });
    });
});
