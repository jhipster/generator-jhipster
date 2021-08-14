const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('./utils/expected-files');
const { appDefaultConfig } = require('../generators/generator-defaults');
const { REACT, ANGULAR_X, VUE } = require('../jdl/jhipster/client-framework-types');
const { CYPRESS } = require('../jdl/jhipster/test-framework-types');
const { OAUTH2, JWT } = require('../jdl/jhipster/authentication-types');

describe('jhipster:cypress', () => {
  describe('generate cypress with React client with JWT', () => {
    const options = { testFrameworks: [CYPRESS], clientFramework: REACT, authenticationType: JWT };
    before(() => {
      return helpers
        .create(path.join(__dirname, '../generators/cypress'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
          defaultLocalConfig: { ...appDefaultConfig, ...options },
        })
        .run();
    });

    it('contains testFrameworks with cypress value', () => {
      assert.jsonFileContent('.yo-rc.json', { 'generator-jhipster': options });
    });

    it('creates expected files for React configuration for cypress generator', () => {
      assert.file(expectedFiles.cypress);
      assert.file(expectedFiles.cypressNoOAuth2);
      assert.file(expectedFiles.cypressWithDatabaseAndNoOAuth2);
    });
  });

  describe('generate cypress with React client with OAuth2', () => {
    const options = { testFrameworks: [CYPRESS], clientFramework: REACT, authenticationType: OAUTH2 };
    before(() => {
      return helpers
        .create(path.join(__dirname, '../generators/cypress'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
          defaultLocalConfig: { ...appDefaultConfig, ...options },
        })
        .run();
    });

    it('contains testFrameworks with cypress value', () => {
      assert.jsonFileContent('.yo-rc.json', { 'generator-jhipster': options });
    });

    it('creates expected files for React configuration for cypress generator', () => {
      assert.file(expectedFiles.cypress);
      assert.file(expectedFiles.cypressWithOauth2);
    });
  });

  describe('generate cypress with Angular client with JWT', () => {
    const options = { testFrameworks: ['cypress'], clientFramework: ANGULAR_X, authenticationType: JWT };
    before(() => {
      return helpers
        .create(path.join(__dirname, '../generators/cypress'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
          defaultLocalConfig: { ...appDefaultConfig, ...options },
        })
        .run();
    });

    it('contains testFrameworks with cypress value', () => {
      assert.jsonFileContent('.yo-rc.json', { 'generator-jhipster': options });
    });

    it('creates expected files for Angular configuration for cypress generator', () => {
      assert.file(expectedFiles.cypress);
      assert.file(expectedFiles.cypressNoOAuth2);
      assert.file(expectedFiles.cypressWithDatabaseAndNoOAuth2);
    });
  });

  describe('generate cypress with Angular client with OAuth2', () => {
    const options = { testFrameworks: ['cypress'], clientFramework: ANGULAR_X, authenticationType: OAUTH2 };
    before(() => {
      return helpers
        .create(path.join(__dirname, '../generators/cypress'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
          defaultLocalConfig: { ...appDefaultConfig, ...options },
        })
        .run();
    });

    it('contains testFrameworks with cypress value', () => {
      assert.jsonFileContent('.yo-rc.json', { 'generator-jhipster': options });
    });

    it('creates expected files for Angular configuration for cypress generator', () => {
      assert.file(expectedFiles.cypress);
      assert.file(expectedFiles.cypressWithOauth2);
    });
  });

  describe('generate cypress with Vue client with JWT', () => {
    const options = { testFrameworks: [CYPRESS], clientFramework: VUE, authenticationType: JWT };
    before(() => {
      return helpers
        .create(path.join(__dirname, '../generators/cypress'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
          defaultLocalConfig: { ...appDefaultConfig, ...options },
        })
        .run();
    });

    it('contains testFrameworks with cypress value', () => {
      assert.jsonFileContent('.yo-rc.json', { 'generator-jhipster': options });
    });

    it('creates expected files for Vue configuration for cypress generator', () => {
      assert.file(expectedFiles.cypress);
      assert.file(expectedFiles.cypressNoOAuth2);
      assert.file(expectedFiles.cypressWithDatabaseAndNoOAuth2);
    });
  });

  describe('generate cypress with Vue client with OAuth2', () => {
    const options = { testFrameworks: [CYPRESS], clientFramework: VUE, authenticationType: OAUTH2 };
    before(() => {
      return helpers
        .create(path.join(__dirname, '../generators/cypress'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
          defaultLocalConfig: { ...appDefaultConfig, ...options },
        })
        .run();
    });

    it('contains testFrameworks with cypress value', () => {
      assert.jsonFileContent('.yo-rc.json', { 'generator-jhipster': options });
    });

    it('creates expected files for Vue configuration for cypress generator', () => {
      assert.file(expectedFiles.cypress);
      assert.file(expectedFiles.cypressWithOauth2);
    });
  });
});
