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

const elasticsearchWarnings = (): string[] =>
  (runResult.env.adapter.log as any).warn.mock.calls
    .map(({ arguments: [message] }: { arguments: [string] }) => message)
    .filter((message: string) => message.includes('SPRING_ELASTICSEARCH_URIS'));

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
  let configResult: any;
  let bonsaiUrl: string | undefined;
  let existingElasticsearch: boolean;

  beforeEach(() => {
    createWithNameResult = undefined;
    createWithoutNameResult = undefined;
    appInfoResult = undefined;
    configResult = undefined;
    bonsaiUrl = undefined;
    existingElasticsearch = false;

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
        if (args[0] === 'config' && args[1] === '--json') {
          return (
            configResult ??
            createSpawnCommandReturn({
              stdout: JSON.stringify({
                FOUNDELASTICSEARCH_URL: 'https://jhipster-test.es.us-east-1.aws.found.io',
                FOUNDELASTICSEARCH_INITIAL_CREDENTIALS: 'elastic:test-password',
              }),
            })
          );
        }
        if (args[0] === 'addons:create' && args[1] === 'foundelasticsearch' && existingElasticsearch) {
          return createSpawnCommandReturn({ exitCode: 1, stderr: 'FOUNDELASTICSEARCH is already in use' });
        }
        if (args[0] === 'config:get' && args[1] === 'SPRING_ELASTICSEARCH_URIS' && existingElasticsearch) {
          return createSpawnCommandReturn({ stdout: 'https://jhipster-test.es.us-east-1.aws.found.io' });
        }
        if (args[0] === 'config:get' && args[1] === 'BONSAI_URL' && bonsaiUrl) {
          return createSpawnCommandReturn({ stdout: bonsaiUrl });
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
            herokuElasticsearch: 'foundelasticsearch',
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
      it('does not warn about the Elasticsearch settings', () => {
        expect(elasticsearchWarnings()).toEqual([]);
      });
    });

    describe('with elasticsearch and unreadable foundelasticsearch settings', () => {
      beforeEach(async () => {
        configResult = createSpawnCommandReturn({ stdout: 'not json' });
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig({ searchEngine: 'elasticsearch' })
          .withOptions({ skipBuild: true })
          .withAnswers({
            herokuAppName,
            herokuRegion: 'us',
            herokuDeployType: 'jar',
            herokuJavaVersion: '11',
            herokuElasticsearch: 'foundelasticsearch',
          })
          .withSpawnMock(stub);
      });
      it('should match files state snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('calls should match snapshot', () => {
        expect(getRunResultCalls()).toMatchSnapshot();
      });
      it('warns to set the Elasticsearch settings', () => {
        expect(elasticsearchWarnings()).toEqual([
          expect.stringContaining('Could not set the Elasticsearch settings from the foundelasticsearch add-on.'),
        ]);
      });
    });

    describe('with elasticsearch and an app that already has the foundelasticsearch add-on', () => {
      beforeEach(async () => {
        existingElasticsearch = true;
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig({ searchEngine: 'elasticsearch' })
          .withOptions({ skipBuild: true })
          .withAnswers({
            herokuAppName,
            herokuRegion: 'us',
            herokuDeployType: 'jar',
            herokuJavaVersion: '11',
            herokuElasticsearch: 'foundelasticsearch',
          })
          .withSpawnMock(stub);
      });
      it('should match files state snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('calls should match snapshot', () => {
        expect(getRunResultCalls()).toMatchSnapshot();
      });
      it('keeps the Elasticsearch settings without a warning', () => {
        expect(elasticsearchWarnings()).toEqual([]);
      });
    });

    describe('with elasticsearch and the default answers', () => {
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
      it('should match files state snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('calls should match snapshot', () => {
        expect(getRunResultCalls()).toMatchSnapshot();
      });
      it('warns to point the app to an Elasticsearch of your own', () => {
        expect(elasticsearchWarnings()).toEqual([expect.stringContaining('Point the app to your Elasticsearch 9 cluster')]);
      });
    });

    describe('with elasticsearch and an existing app with the bonsai add-on', () => {
      const existingHerokuAppName = 'jhipster-existing';
      beforeEach(async () => {
        appInfoResult = {
          appName: existingHerokuAppName,
          result: createSpawnCommandReturn({ stdout: `{"app":{"name":"${existingHerokuAppName}"}, "dynos":[]}` }),
        };
        bonsaiUrl = 'https://user:password@jhipster-existing.bonsaisearch.net';
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig<any>({ herokuAppName: existingHerokuAppName, herokuDeployType: 'git', searchEngine: 'elasticsearch' })
          .withOptions({ skipBuild: true })
          .withSpawnMock(stub);
      });
      it('should match files state snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('calls should match snapshot', () => {
        expect(getRunResultCalls()).toMatchSnapshot();
      });
      it('warns that the app no longer reads BONSAI_URL', () => {
        expect(elasticsearchWarnings()).toEqual([expect.stringContaining("The app doesn't read BONSAI_URL anymore")]);
      });
    });
  });
});
