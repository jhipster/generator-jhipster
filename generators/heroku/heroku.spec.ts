/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { afterEach, beforeEach, describe, exnode, expect, it } from 'expect-node';

import { SERVER_MAIN_RES_DIR } from '../generator-constants.ts';

import { defaultHelpers as helpers, runResult } from '#testing';

const GENERATOR_HEROKU = 'heroku';
const expectedFiles = {
  monolith: ['Procfile', `${SERVER_MAIN_RES_DIR}/config/bootstrap-heroku.yml`, `${SERVER_MAIN_RES_DIR}/config/application-heroku.yml`],
};

const getRunResultCalls = () => {
  return runResult.spawnStub!.mock.calls.map((call: any) => call.arguments ?? call);
};

const getConfigSetNames = () =>
  getRunResultCalls()
    .filter(([method, command, args]: any) => method === 'spawn' && command === 'heroku' && args[0] === 'config:set')
    .map(([, , args]: any) => args[1].split('=')[0]);

const JWT_SECRET = 'JHIPSTER_SECURITY_AUTHENTICATION_JWT_BASE64_SECRET';
const REMEMBER_ME_KEY = 'JHIPSTER_SECURITY_REMEMBER_ME_KEY';

const createSpawnCommandReturn = (resolvedValue?: any, data?: any) =>
  Object.assign(
    Promise.resolve({
      exitCode: 0,
      stdout: '',
      stderr: '',
      ...resolvedValue,
    }),
    {
      ...data,
      stdout: { on: () => {} },
      stderr: { on: () => {} },
    },
  );

describe('generator - Heroku', () => {
  const herokuAppName = 'jhipster-test';
  let stub: ReturnType<typeof exnode.fn>;
  let createWithNameResult: any;
  let createWithoutNameResult: any;
  let appInfoResult: { appName: string; result: any } | undefined;
  let configGetResults: Record<string, any>;

  beforeEach(() => {
    createWithNameResult = undefined;
    createWithoutNameResult = undefined;
    appInfoResult = undefined;
    configGetResults = {};

    stub = exnode.fn((method: string, command: string, args: string[]) => {
      if (method === 'spawnCommand' && command === 'heroku plugins') {
        return createSpawnCommandReturn({ stdout: 'heroku-cli-deploy', stderr: '' });
      }

      if (method === 'spawn' && command === 'heroku' && Array.isArray(args)) {
        if (args[0] === 'create' && args[1] === herokuAppName && createWithNameResult) {
          return createWithNameResult;
        }
        if (args[0] === 'create' && args.length === 1 && createWithoutNameResult) {
          return createWithoutNameResult;
        }
        if (args[0] === 'apps:info' && args[1] === '--json' && args[2] === appInfoResult?.appName) {
          return appInfoResult.result;
        }
        if (args[0] === 'config:get' && configGetResults[args[1]]) {
          return configGetResults[args[1]];
        }
      }

      return createSpawnCommandReturn();
    });
  });
  afterEach(() => {
    stub.mockClear();
  });

  describe('microservice application', () => {
    describe('with JAR deployment', () => {
      beforeEach(async () => {
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig({ applicationType: 'microservice' })
          .withOptions({ skipBuild: true })
          .withAnswers({
            herokuAppName,
            herokuRegion: 'us',
            herokuDeployType: 'jar',
            herokuJHipsterRegistryApp: 'sushi',
            herokuJHipsterRegistryUsername: 'admin',
            herokuJHipsterRegistryPassword: 'changeme',
            herokuJavaVersion: '17',
          })
          .withSpawnMock(stub);
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFileContent('.yo-rc.json', '"herokuDeployType": "jar"');
      });
      it('does not set a JWT secret', () => {
        expect(getConfigSetNames()).not.toContain(JWT_SECRET);
      });
    });
  });

  describe('gateway application', () => {
    beforeEach(async () => {
      await helpers
        .runJHipster(GENERATOR_HEROKU)
        .withJHipsterConfig({ applicationType: 'gateway', serviceDiscoveryType: 'consul' })
        .withOptions({ skipBuild: true })
        .withAnswers({
          herokuAppName,
          herokuRegion: 'us',
          herokuDeployType: 'jar',
          herokuJavaVersion: '17',
        })
        .withSpawnMock(stub);
    });
    it('does not set a JWT secret', () => {
      expect(getConfigSetNames()).not.toContain(JWT_SECRET);
    });
  });

  describe('monolith application', () => {
    describe('with an unavailable app name', () => {
      const autogeneratedAppName = 'random-app-name';
      beforeEach(async () => {
        createWithNameResult = createSpawnCommandReturn({ exitCode: 1, stderr: `Name ${herokuAppName} is already taken` });
        createWithoutNameResult = createSpawnCommandReturn({ stdout: `https://git.heroku.com/${autogeneratedAppName}.git` });

        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig()
          .withOptions({ skipBuild: true })
          .withAnswers({
            herokuAppName,
            herokuRegion: 'us',
            herokuDeployType: 'jar',
            herokuForceName: 'No',
            herokuJavaVersion: '11',
          })
          .withSpawnMock(stub);
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected monolith files', () => {
        runResult.assertFile(expectedFiles.monolith);
        runResult.assertJsonFileContent('.yo-rc.json', { 'generator-jhipster': { herokuAppName: autogeneratedAppName } });
      });
      it('calls should match snapshot', () => {
        expect(getRunResultCalls()).toMatchSnapshot();
      });
    });

    describe('with Git deployment', () => {
      beforeEach(async () => {
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig()
          .withAnswers({
            herokuAppName,
            herokuRegion: 'us',
            herokuDeployType: 'git',
            herokuJavaVersion: '11',
          })
          .withSpawnMock(stub);
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected monolith files', () => {
        runResult.assertFile(expectedFiles.monolith);
        runResult.assertFileContent('.yo-rc.json', '"herokuDeployType": "git"');
      });
      it('calls should match snapshot', () => {
        expect(getRunResultCalls()).toMatchSnapshot();
      });
    });

    describe('in the US', () => {
      beforeEach(async () => {
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig()
          .withOptions({ skipBuild: true })
          .withAnswers({
            herokuAppName,
            herokuRegion: 'us',
            herokuDeployType: 'jar',
            herokuJavaVersion: '11',
          })
          .withSpawnMock(stub);
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected monolith files', () => {
        runResult.assertFile(expectedFiles.monolith);
        runResult.assertFileContent('.yo-rc.json', '"herokuDeployType": "jar"');
        runResult.assertFileContent(`${SERVER_MAIN_RES_DIR}/config/application-heroku.yml`, 'datasource:');
        runResult.assertNoFileContent(`${SERVER_MAIN_RES_DIR}/config/application-heroku.yml`, 'mongodb:');
      });
      it('calls should match snapshot', () => {
        expect(getRunResultCalls()).toMatchSnapshot();
      });
    });

    describe('in the EU', () => {
      beforeEach(async () => {
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig()
          .withOptions({ skipBuild: true })
          .withAnswers({
            herokuAppName,
            herokuRegion: 'eu',
            herokuDeployType: 'jar',
            herokuJavaVersion: '11',
          })
          .withSpawnMock(stub);
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected monolith files', () => {
        runResult.assertFile(expectedFiles.monolith);
      });
      it('calls should match snapshot', () => {
        expect(getRunResultCalls()).toMatchSnapshot();
      });
    });

    describe('with PostgreSQL', () => {
      beforeEach(async () => {
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig()
          .withOptions({ skipBuild: true })
          .withAnswers({
            herokuAppName,
            herokuRegion: 'eu',
            herokuDeployType: 'jar',
            herokuJavaVersion: '11',
          })
          .withSpawnMock(stub);
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected monolith files', () => {
        runResult.assertFile(expectedFiles.monolith);
        runResult.assertFileContent(`${SERVER_MAIN_RES_DIR}/config/application-heroku.yml`, 'datasource:');
        runResult.assertNoFileContent(`${SERVER_MAIN_RES_DIR}/config/application-heroku.yml`, 'mongodb:');
      });
      it('calls should match snapshot', () => {
        expect(getRunResultCalls()).toMatchSnapshot();
      });
    });

    describe('with existing app', () => {
      const existingHerokuAppName = 'jhipster-existing';
      beforeEach(async () => {
        appInfoResult = {
          appName: existingHerokuAppName,
          result: createSpawnCommandReturn({ stdout: `{"app":{"name":"${existingHerokuAppName}"}, "dynos":[]}` }),
        };
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig<any>({ herokuAppName: 'jhipster-existing', herokuDeployType: 'git' })
          .withOptions({ skipBuild: true })
          .withSpawnMock(stub);
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected monolith files', () => {
        runResult.assertFile(expectedFiles.monolith);
        runResult.assertFileContent('.yo-rc.json', `"herokuAppName": "${existingHerokuAppName}"`);
      });
      it('calls should match snapshot', () => {
        expect(getRunResultCalls()).toMatchSnapshot();
      });
    });

    describe('with an existing JWT secret', () => {
      beforeEach(async () => {
        configGetResults[JWT_SECRET] = createSpawnCommandReturn({ stdout: 'existing-secret\n' });
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig()
          .withOptions({ skipBuild: true })
          .withAnswers({ herokuAppName, herokuRegion: 'us', herokuDeployType: 'jar', herokuJavaVersion: '17' })
          .withSpawnMock(stub);
      });
      it('keeps the existing secret', () => {
        expect(getConfigSetNames()).not.toContain(JWT_SECRET);
      });
    });

    describe('when the JWT secret cannot be read', () => {
      beforeEach(async () => {
        configGetResults[JWT_SECRET] = createSpawnCommandReturn({ exitCode: 1, stderr: 'error' });
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig()
          .withOptions({ skipBuild: true })
          .withAnswers({ herokuAppName, herokuRegion: 'us', herokuDeployType: 'jar', herokuJavaVersion: '17' })
          .withSpawnMock(stub);
      });
      it('does not set a JWT secret', () => {
        expect(getConfigSetNames()).not.toContain(JWT_SECRET);
      });
    });

    describe('with session authentication', () => {
      beforeEach(async () => {
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig({ authenticationType: 'session' })
          .withOptions({ skipBuild: true })
          .withAnswers({ herokuAppName, herokuRegion: 'us', herokuDeployType: 'jar', herokuJavaVersion: '17' })
          .withSpawnMock(stub);
      });
      it('sets a remember-me key and no JWT secret', () => {
        expect(getConfigSetNames()).toContain(REMEMBER_ME_KEY);
        expect(getConfigSetNames()).not.toContain(JWT_SECRET);
      });
    });

    describe('with OAuth2 authentication', () => {
      beforeEach(async () => {
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig({ authenticationType: 'oauth2' })
          .withOptions({ skipBuild: true })
          .withAnswers({ herokuAppName, herokuRegion: 'us', herokuDeployType: 'jar', herokuJavaVersion: '17' })
          .withSpawnMock(stub);
      });
      it('sets no secret', () => {
        expect(getConfigSetNames()).not.toContain(JWT_SECRET);
        expect(getConfigSetNames()).not.toContain(REMEMBER_ME_KEY);
      });
    });

    describe('with elasticsearch', () => {
      beforeEach(async () => {
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig({ searchEngine: 'elasticsearch' })
          .withOptions({ skipBuild: true })
          .withAnswers({
            herokuAppName,
            herokuRegion: 'us',
            herokuDeployType: 'jar',
            herokuJavaVersion: '11',
          })
          .withSpawnMock(stub);
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected monolith files', () => {
        runResult.assertFile(expectedFiles.monolith);
        runResult.assertFileContent('.yo-rc.json', '"herokuDeployType": "jar"');
        runResult.assertFileContent(`${SERVER_MAIN_RES_DIR}/config/application-heroku.yml`, 'datasource:');
        runResult.assertNoFileContent(`${SERVER_MAIN_RES_DIR}/config/application-heroku.yml`, 'mongodb:');
      });
      it('calls should match snapshot', () => {
        expect(getRunResultCalls()).toMatchSnapshot();
      });
    });
  });
});
