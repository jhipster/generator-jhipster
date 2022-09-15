const { expect } = require('expect');
const path = require('path');
const helpers = require('yeoman-test');

const { JWT, OAUTH2 } = require('../src/jdl/jhipster/authentication-types');
const { GATEWAY, MICROSERVICE } = require('../src/jdl/jhipster/application-types');
const { CAFFEINE, EHCACHE } = require('../src/jdl/jhipster/cache-types');
const { SQL, H2_MEMORY, POSTGRESQL } = require('../src/jdl/jhipster/database-types');
const { MAVEN } = require('../src/jdl/jhipster/build-tool-types');

describe('JHipster server generator', () => {
  describe('generate server with ehcache', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .run(path.join(__dirname, '../generators/server'))
        .withOptions({ skipInstall: true, skipChecks: true })
        .withPrompts({
          baseName: 'jhipster',
          packageName: 'com.mycompany.myapp',
          packageFolder: 'com/mycompany/myapp',
          serviceDiscoveryType: false,
          authenticationType: JWT,
          cacheProvider: EHCACHE,
          enableHibernateCache: true,
          databaseType: SQL,
          devDatabaseType: H2_MEMORY,
          prodDatabaseType: POSTGRESQL,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['fr'],
          buildTool: MAVEN,
          rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
          serverSideOptions: [],
        });
    });

    it('creates expected files for default configuration for server generator', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('generate server with caffeine', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .run(path.join(__dirname, '../generators/server'))
        .withOptions({ skipInstall: true, skipChecks: true })
        .withPrompts({
          baseName: 'jhipster',
          packageName: 'com.mycompany.myapp',
          packageFolder: 'com/mycompany/myapp',
          serviceDiscoveryType: false,
          authenticationType: JWT,
          cacheProvider: CAFFEINE,
          enableHibernateCache: true,
          databaseType: SQL,
          devDatabaseType: H2_MEMORY,
          prodDatabaseType: POSTGRESQL,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['fr'],
          buildTool: MAVEN,
          rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
          serverSideOptions: [],
        });
    });

    it('creates expected files for caffeine cache configuration for server generator', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('microfrontend', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(path.join(__dirname, '../generators/server'))
        .withOptions({
          baseName: 'jhipster',
          skipInstall: true,
          auth: OAUTH2,
          microfrontend: true,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['fr', 'en'],
          applicationType: MICROSERVICE,
        })
        .run();
    });
    it('should match generated files snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });
  });

  describe('gateway application type', () => {
    describe('with non reactive option', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(path.join(__dirname, '../generators/server'))
          .withOptions({
            defaults: true,
            reactive: false,
            applicationType: GATEWAY,
          })
          .run();
      });
      it('should convert to reactive', () => {
        runResult.assertJsonFileContent('.yo-rc.json', {
          'generator-jhipster': { reactive: true, applicationType: GATEWAY },
        });
      });
    });
  });
});
