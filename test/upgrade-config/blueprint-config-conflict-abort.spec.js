/* eslint-disable no-unused-expressions */
const crypto = require('crypto');
const os = require('os');
const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expect = require('chai').expect;
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

describe('JHipster blueprint config migration with abort option', () => {
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
          .withPrompts({
            '#languages': 'abort (I will resolve it myself)',
          })
          .withOptions({
            fromCli: true,
            skipChecks: true,
            unifyConfigOnly: true,
          })
          .on('error', error => {
            expect(error.message.includes('There are some configuration conflict, look at your .yo-rc.json at')).to.be.true;
            done();
          })
          .on('end', () => {
            expect(true).to.be.false;
            done();
          });
      });

      it('.yo-rc.json', () => {
        assert.JSONFileContent('.yo-rc.json', {
          'generator-jhipster-myblueprint': {
            languages: ['fr'],
            baseName: 'myblueprint',
          },
          'generator-jhipster-myblueprint2': {
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
        });
      });
    });
  });
});
