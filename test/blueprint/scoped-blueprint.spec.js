const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const expectedFiles = require('../utils/expected-files');
const getFilesForOptions = require('../utils/utils').getFilesForOptions;
const angularFiles = require('../../generators/client/files-angular').files;
const EnvironmentBuilder = require('../../cli/environment-builder');

describe('JHipster application generator with scoped blueprint', () => {
    describe('generate monolith application with scoped blueprint', () => {
        before(() => {
            return helpers
                .create('jhipster:app', {}, { createEnv: EnvironmentBuilder.createEnv })
                .inTmpDir(dir => {
                    // Fake the presence of the blueprint in node_modules
                    const fakeBlueprintModuleDir = path.join(dir, 'node_modules/@jhipster/generator-jhipster-scoped-blueprint');
                    fse.ensureDirSync(fakeBlueprintModuleDir);
                    fse.copySync(path.join(__dirname, '../../test/templates/fake-blueprint'), fakeBlueprintModuleDir);
                })
                .withOptions({
                    fromCli: true,
                    skipInstall: true,
                    skipChecks: true,
                    blueprints: '@jhipster/generator-jhipster-scoped-blueprint',
                    baseName: 'jhipster',
                    defaults: true,
                })
                .run();
        });

        it('creates expected default files for server and angularX', () => {
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.server);
            assert.file(
                getFilesForOptions(angularFiles, {
                    enableTranslation: true,
                    serviceDiscoveryType: false,
                    authenticationType: 'jwt',
                    testFrameworks: [],
                })
            );
        });

        it('blueprint version is saved in .yo-rc.json', () => {
            assert.JSONFileContent('.yo-rc.json', {
                'generator-jhipster': { blueprints: [{ name: '@jhipster/generator-jhipster-scoped-blueprint', version: '9.9.9' }] },
            });
        });
        it('blueprint module and version are in package.json', () => {
            assert.fileContent('package.json', /"@jhipster\/generator-jhipster-scoped-blueprint": "9.9.9"/);
        });
    });
});
