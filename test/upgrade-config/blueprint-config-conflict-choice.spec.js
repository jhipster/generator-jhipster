const crypto = require('crypto');
const os = require('os');
const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { MONOLITH } = require('../../jdl/jhipster/application-types');

const yoRc = {
  'generator-jhipster-myblueprint': {
    applicationType: MONOLITH,
    languages: ['fr'],
    baseName: 'myblueprint',
  },
  'generator-jhipster-myblueprint2': {
    applicationType: MONOLITH,
    languages: ['en'],
    baseName: 'myblueprint2',
  },
  'generator-jhipster': {
    applicationType: MONOLITH,
    baseName: 'jhipster',
    jhipsterVersion: '6.6.0',
    blueprints: [
      {
        name: 'generator-jhipster-myblueprint',
        version: '0.0.1',
      },
      {
        name: 'generator-jhipster-myblueprint2',
        version: '0.0.1',
      },
    ],
  },
};

describe('JHipster blueprint config migration with conflicts', () => {
  const blueprintNames = ['generator-jhipster-myblueprint'];

  const tmpdir = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));

  blueprintNames.forEach(blueprintName => {
    describe(`generate client with blueprint option '${blueprintName}'`, () => {
      before(done => {
        helpers
          .run(path.join(__dirname, '../../generators/upgrade-config'))
          .inDir(tmpdir, dir => {
            // Fake the presence of the .yo-rc.json
            fse.writeJsonSync(path.join(dir, '.yo-rc.json'), yoRc);
          })
          .withOptions({
            fromCli: true,
            skipChecks: true,
            unifyConfigOnly: true,
          })
          .withPrompts({
            // '#applicationType': 'monolith',
            '#languages': ['en'],
            '#baseName': 'myblueprint',
          })
          .on('end', done);
      });

      it('.yo-rc.json', () => {
        assert.JSONFileContent('.yo-rc.json', {
          'generator-jhipster-myblueprint': {},
          'generator-jhipster': {
            applicationType: MONOLITH,
            jhipsterVersion: '6.6.0',
            baseName: 'myblueprint',
            languages: ['en'],
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
