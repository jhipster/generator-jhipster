const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const packagejs = require('../../package.json');

describe('JHipster generator', () => {
    context('Load configuration with', () => {
        describe('Old configuration', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/app'))
                    .withOptions({ 'from-cli': true, skipInstall: true, skipChecks: true })
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../../test/templates/configuration'), dir);
                    })
                    .on('end', done);
            });

            it('Compare loaded configuration', () => {
                assert.JSONFileContent('.yo-rc.json', {
                    'generator-jhipster': {
                        jhipsterVersion: packagejs.version,
                        jhiPrefix: 'jhip',
                        baseName: 'basename'
                    }
                });
            });
        });

        describe('New configuration', () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/app'))
                    .withOptions({
                        'from-cli': true,
                        skipInstall: true,
                        skipChecks: true,
                        'new-configuration': true,
                        'init-configuration': true
                    })
                    .inTmpDir(dir => {
                        fse.copySync(path.join(__dirname, '../../test/templates/configuration'), dir);
                    })
                    .on('end', done);
            });

            it('Verify base configurations', () => {
                assert.JSONFileContent('.yo-rc.json', {
                    'generator-jhipster': {
                        jhipsterVersion: packagejs.version,
                        jhiPrefix: 'jhip',
                        baseName: 'basename'
                    }
                });
            });

            it('Verify languages configurations', () => {
                assert.JSONFileContent('.yo-rc.json', {
                    'generator-jhipster': {
                        languages: ['en', 'fr']
                    }
                });
            });
        });
    });
});
