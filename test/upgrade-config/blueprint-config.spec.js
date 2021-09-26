const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { MONOLITH } = require('../../jdl/jhipster/application-types');

describe('JHipster blueprint config migration', () => {
  const blueprintNames = ['generator-jhipster-myblueprint'];

  blueprintNames.forEach(blueprintName => {
    describe(`generate client with blueprint option '${blueprintName}'`, () => {
      before(done => {
        helpers
          .run(path.join(__dirname, '../../generators/upgrade-config'))
          .inTmpDir(dir => {
            // Fake the presence of the .yo-rc.json
            fse.writeJsonSync(path.join(dir, '.yo-rc.json'), {
              'generator-jhipster-myblueprint': {
                promptValues: {
                  nativeLanguage: 'en',
                },
                applicationType: MONOLITH,
                baseName: 'myblueprint',
              },
              'generator-jhipster': {
                promptValues: {
                  nativeLanguage: 'en',
                },
                jhipsterVersion: '6.6.0',
                applicationType: MONOLITH,
                baseName: 'myblueprint',
                blueprints: [
                  {
                    name: 'generator-jhipster-myblueprint',
                    version: '0.0.1',
                  },
                ],
              },
            });
          })
          .withOptions({
            fromCli: true,
            skipChecks: true,
            unifyConfigOnly: true,
          })
          .on('end', done);
      });

      it('.yo-rc.json', () => {
        assert.JSONFileContent('.yo-rc.json', {
          'generator-jhipster-myblueprint': {},
          'generator-jhipster': {
            promptValues: {
              nativeLanguage: 'en',
            },
            jhipsterVersion: '6.6.0',
            applicationType: MONOLITH,
            baseName: 'myblueprint',
            blueprints: [
              {
                name: 'generator-jhipster-myblueprint',
                version: '0.0.1',
              },
            ],
          },
        });
      });
    });
  });
});
