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

const getRunResultCalls = (): [method: string, command: string, args?: string[] | object, options?: object][] => {
  return runResult.spawnStub!.mock.calls.map((call: any) => call.arguments ?? call);
};

const elasticsearchWarnings = (): string[] =>
  (runResult.env.adapter.log as any).warn.mock.calls
    .map(({ arguments: [message] }: { arguments: [string] }) => message)
    .filter((message: string) => message.includes('SPRING_ELASTICSEARCH_URIS'));

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
  let deployCommandResult: { command: string; result: any } | undefined;
  let createWithNameResult: any;
  let createWithoutNameResult: any;
  let appInfoResult: { appName: string; result: any } | undefined;
  let configResult: any;
  let bonsaiUrl: string | undefined;
  let existingElasticsearch: boolean;
  let elasticsearchAddOnError: string | undefined;
  let herokuCliMissing: boolean;
  let configGetResults: Record<string, any>;

  beforeEach(() => {
    deployCommandResult = undefined;
    createWithNameResult = undefined;
    createWithoutNameResult = undefined;
    appInfoResult = undefined;
    configResult = undefined;
    bonsaiUrl = undefined;
    existingElasticsearch = false;
    elasticsearchAddOnError = undefined;
    herokuCliMissing = false;
    configGetResults = {};

    stub = exnode.fn((method: string, command: string, args: string[]) => {
      if (method === 'spawnCommand' && command === deployCommandResult?.command) {
        return deployCommandResult.result;
      }

      if (method === 'spawnCommand' && command === 'heroku --version' && herokuCliMissing) {
        return createSpawnCommandReturn({ exitCode: 1 });
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
        if (args[0] === 'addons:create' && args[1] === 'foundelasticsearch' && elasticsearchAddOnError) {
          return createSpawnCommandReturn({ exitCode: 1, stderr: elasticsearchAddOnError });
        }
        if (args[0] === 'addons:create' && args[1] === 'foundelasticsearch' && existingElasticsearch) {
          return createSpawnCommandReturn({ exitCode: 1, stderr: 'FOUNDELASTICSEARCH is already in use' });
        }
        if (args[0] === 'config:get' && args[1] === 'FOUNDELASTICSEARCH_URL' && existingElasticsearch) {
          return createSpawnCommandReturn({ stdout: 'https://jhipster-test.es.us-east-1.aws.found.io' });
        }
        if (args[0] === 'config:get' && args[1] === 'SPRING_ELASTICSEARCH_URIS' && existingElasticsearch) {
          return createSpawnCommandReturn({ stdout: 'https://jhipster-test.es.us-east-1.aws.found.io' });
        }
        if (args[0] === 'config:get' && args[1] === 'BONSAI_URL' && bonsaiUrl) {
          return createSpawnCommandReturn({ stdout: bonsaiUrl });
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

  describe('JAR deployment', () => {
    const mavenDeployCommand = `./mvnw -ntp -Pheroku com.heroku.sdk:heroku-maven-plugin:3.0.7:deploy-only -Dheroku.appName=${herokuAppName}`;
    const gradleDeployCommand = './gradlew deployHeroku --no-daemon';
    const spawnCommands = () =>
      getRunResultCalls()
        .filter(([method]) => method === 'spawnCommand')
        .map(([, command]) => command);
    const loggedMessages = (adapterLog: any) =>
      adapterLog.log.mock.calls.map(({ arguments: [message] }: { arguments: [string] }) => message).join('\n');
    const answers = { herokuAppName, herokuRegion: 'us', herokuDeployType: 'jar', herokuJavaVersion: '21' };

    for (const [buildTool, deployCommand] of [
      ['maven', mavenDeployCommand],
      ['gradle', gradleDeployCommand],
    ] as const) {
      describe(`with ${buildTool}`, () => {
        beforeEach(async () => {
          await helpers
            .runJHipster(GENERATOR_HEROKU)
            .withJHipsterConfig({ buildTool })
            .withFiles({
              'build.gradle': `plugins {
    // jhipster-needle-gradle-plugins
}
// jhipster-needle-gradle-apply-from
`,
            })
            .withAnswers(answers)
            .withSpawnMock(stub);
        });
        it('deploys the built jar with the build plugin', () => {
          expect(spawnCommands()).toEqual(expect.arrayContaining(['npm run java:jar:prod', deployCommand]));
          expect(spawnCommands().indexOf(deployCommand)).toBeGreaterThan(spawnCommands().indexOf('npm run java:jar:prod'));
        });
        it('logs that the app is live', () => {
          expect(loggedMessages(runResult.env.adapter.log)).toContain('Your app should now be live');
        });
      });
    }

    describe('with a failed deployment', () => {
      let adapterLog: any;
      beforeEach(async () => {
        deployCommandResult = { command: mavenDeployCommand, result: createSpawnCommandReturn({ exitCode: 1 }) };
        await expect(
          helpers
            .runJHipster(GENERATOR_HEROKU)
            .withJHipsterConfig()
            .withAnswers(answers)
            .withSpawnMock(stub)
            .onEnvironment(env => {
              adapterLog = env.adapter.log;
            }),
        ).rejects.toThrow('Heroku deployment failed with exit code 1');
      });
      it('logs the failed command', () => {
        const errors = adapterLog.error.mock.calls.map(({ arguments: [message] }: { arguments: [string] }) => message);
        expect(errors).toContain(`Heroku deployment failed: ${mavenDeployCommand}`);
      });
      it('does not log that the app is live', () => {
        expect(loggedMessages(adapterLog)).not.toContain('Your app should now be live');
      });
    });
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
    describe('when reusing an app whose name is already taken', () => {
      beforeEach(() => {
        createWithNameResult = createSpawnCommandReturn({ exitCode: 1, stderr: `Name ${herokuAppName} is already taken` });
      });

      const runWithDeployType = (herokuDeployType: 'jar' | 'git') =>
        helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig()
          .withOptions({ skipDeploy: herokuDeployType === 'git' })
          .withAnswers({
            herokuAppName,
            herokuRegion: 'us',
            herokuDeployType,
            herokuForceName: 'Yes',
            herokuJavaVersion: '11',
          })
          .withSpawnMock(stub);

      it('deploys a JAR without setting up a Git remote outside a Git repository', async () => {
        await runWithDeployType('jar');

        const commands = getRunResultCalls().flatMap(([method, command, args]) =>
          method === 'spawn' && command === 'heroku' && Array.isArray(args) ? [args] : [],
        );
        expect(commands.some(([subcommand]) => subcommand === 'git:remote')).toBe(false);
        expect(
          getRunResultCalls().some(
            ([method, command]) => method === 'spawnCommand' && command.includes(`deploy-only -Dheroku.appName=${herokuAppName}`),
          ),
        ).toBe(true);
        runResult.assertFile(expectedFiles.monolith);
      });

      it('configures the Heroku remote for a Git deployment', async () => {
        await runWithDeployType('git');

        expect(getRunResultCalls()).toContainEqual([
          'spawn',
          'heroku',
          ['git:remote', '--app', herokuAppName],
          expect.objectContaining({ reject: true }),
        ]);
      });
    });

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
      it('does not configure a remote outside a Git repository', () => {
        expect(
          getRunResultCalls().some(([, command, args]) => command === 'heroku' && Array.isArray(args) && args[0] === 'git:remote'),
        ).toBe(false);
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
      it('configures a missing Heroku remote when deploying a saved app with Git', () => {
        expect(getRunResultCalls()).toContainEqual([
          'spawn',
          'heroku',
          ['git:remote', '--app', existingHerokuAppName],
          expect.objectContaining({ reject: true }),
        ]);
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

    describe('with elasticsearch and the add-on set by an option, without the prompts of the command', () => {
      beforeEach(async () => {
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig({ searchEngine: 'elasticsearch' })
          .withOptions({ skipBuild: true, defaults: true, herokuElasticsearch: 'foundelasticsearch' })
          .withAnswers({
            herokuAppName,
            herokuRegion: 'us',
            herokuDeployType: 'jar',
            herokuJavaVersion: '11',
          })
          .withSpawnMock(stub);
      });
      it('creates the foundelasticsearch add-on', () => {
        expect(getRunResultCalls()).toContainEqual([
          'spawn',
          'heroku',
          ['addons:create', 'foundelasticsearch', '--as', 'FOUNDELASTICSEARCH', '--wait', '--app', herokuAppName],
          expect.anything(),
        ]);
      });
      it('does not warn about the Elasticsearch settings', () => {
        expect(elasticsearchWarnings()).toEqual([]);
      });
    });

    describe('with elasticsearch and a foundelasticsearch add-on that cannot be created', () => {
      beforeEach(async () => {
        elasticsearchAddOnError = 'Your account has reached its add-on limit';
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
      it('warns with the error of the Heroku CLI and the settings to set', () => {
        expect(elasticsearchWarnings()).toEqual([
          expect.stringMatching(
            /Could not create the foundelasticsearch add-on:\nYour account has reached its add-on limit\n[^]*heroku config:set SPRING_ELASTICSEARCH_URIS/,
          ),
        ]);
      });
    });

    describe('with elasticsearch and without the Heroku CLI', () => {
      beforeEach(async () => {
        herokuCliMissing = true;
        await helpers
          .runJHipster(GENERATOR_HEROKU)
          .withJHipsterConfig({ searchEngine: 'elasticsearch' })
          .withOptions({ skipBuild: true, skipChecks: true })
          .withAnswers({
            herokuAppName,
            herokuRegion: 'us',
            herokuDeployType: 'jar',
            herokuJavaVersion: '11',
          })
          .withSpawnMock(stub);
      });
      it('warns to point the app to an Elasticsearch of your own', () => {
        expect(elasticsearchWarnings()).toEqual([expect.stringContaining('Point the app to your Elasticsearch 9 cluster')]);
      });
      it('does not create add-ons', () => {
        expect(getRunResultCalls().some(([, command, args]: any[]) => command === 'heroku' && args?.[0] === 'addons:create')).toBe(false);
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
