const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('./utils/expected-files');
const constants = require('../generators/generator-constants');
const { appDefaultConfig } = require('../generators/generator-defaults');

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;
const VUE = constants.SUPPORTED_CLIENT_FRAMEWORKS.VUE;

describe('jhipster:cypress', () => {
  describe('generate cypress with React client with JWT', () => {
    const options = { testFrameworks: ['cypress'], clientFramework: REACT, authenticationType: 'jwt' };
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
    const options = { testFrameworks: ['cypress'], clientFramework: REACT, authenticationType: 'oauth2' };
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
    const options = { testFrameworks: ['cypress'], clientFramework: ANGULAR, authenticationType: 'jwt' };
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
    const options = { testFrameworks: ['cypress'], clientFramework: ANGULAR, authenticationType: 'oauth2' };
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
    const options = { testFrameworks: ['cypress'], clientFramework: VUE, authenticationType: 'jwt' };
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
    const options = { testFrameworks: ['cypress'], clientFramework: VUE, authenticationType: 'oauth2' };
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
