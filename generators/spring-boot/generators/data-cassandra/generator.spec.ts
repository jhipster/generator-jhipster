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
import { before, describe, expect, it } from 'esmocha';
import { basename, resolve } from 'node:path';

import { databaseTypes } from '../../../../lib/jhipster/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../../../test/support/tests.ts';
import { filterBasicServerGenerators, shouldComposeWithLiquibase } from '../../../server/__test-support/index.ts';
import Generator from '../../../server/index.ts';

import { buildServerSamples, defaultHelpers as helpers, entitiesSimple as entities, runResult } from '#testing';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

const { CASSANDRA: databaseType } = databaseTypes;
const commonConfig = { databaseType, baseName: 'jhipster', nativeLanguage: 'en', languages: ['fr', 'en'] };

const testSamples = buildServerSamples(commonConfig);

describe(`generator - ${databaseType}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('migration', () => {
    describe('databaseMigration option', () => {
      const runCassandra = (config: Record<string, unknown>) =>
        helpers
          .runJHipster(generator)
          .withJHipsterConfig({ databaseType, ...config })
          .commitFiles()
          .withSkipWritingPriorities()
          .withMockedJHipsterGenerators();

      describe('application prior to v9.2.1', () => {
        before(async () => {
          await runCassandra({ jhipsterVersion: '9.2.0' });
        });

        it('should keep the cql loader', () => {
          runResult.assertJHipsterConfigContent({ databaseMigration: 'loader' });
        });
      });

      describe('application prior to v9.2.1 without a migration tool', () => {
        before(async () => {
          await runCassandra({ jhipsterVersion: '9.2.0', databaseMigration: 'no' });
        });

        it('should keep the cql loader, databaseMigration was ignored by cassandra', () => {
          runResult.assertJHipsterConfigContent({ databaseMigration: 'loader' });
        });
      });

      describe('application prior to v9.2.1 which opted into liquibase', () => {
        before(async () => {
          await runCassandra({ jhipsterVersion: '9.2.0', databaseMigration: 'liquibase' });
        });

        it('should keep liquibase', () => {
          runResult.assertJHipsterConfigContent({ databaseMigration: 'liquibase' });
        });
      });

      describe('application at v9.2.1', () => {
        before(async () => {
          await runCassandra({ jhipsterVersion: '9.2.1' });
        });

        it('should not force a migration tool, liquibase is the default', () => {
          runResult.assertJHipsterConfigContent({ databaseMigration: undefined });
        });
      });
    });
  });

  describe('keyspace creation', () => {
    const javaPackageDir = 'src/main/java/com/mycompany/myapp/';
    const javaTestPackageDir = 'src/test/java/com/mycompany/myapp/';
    const dockerDir = 'src/main/docker/';
    const cqlLoaderFiles = [
      'src/main/resources/config/cql/create-keyspace.cql',
      'src/main/resources/config/cql/create-keyspace-prod.cql',
      'src/main/resources/config/cql/drop-keyspace.cql',
      `${dockerDir}cassandra-migration.yml`,
      `${dockerDir}cassandra/Cassandra-Migration.Dockerfile`,
      `${dockerDir}cassandra/scripts/autoMigrate.sh`,
      `${dockerDir}cassandra/scripts/execute-cql.sh`,
    ];

    describe('with liquibase', () => {
      before(async () => {
        await helpers.runJHipster('server').withJHipsterConfig({ databaseType, databaseMigration: 'liquibase', skipClient: true });
      });

      it('should create the keyspace from the application', () => {
        runResult.assertFileContent(`${javaPackageDir}config/DatabaseConfiguration.java`, 'CqlSessionBuilderCustomizer keyspaceCreator(');
        runResult.assertFileContent(`${javaPackageDir}config/DatabaseConfiguration.java`, 'CREATE KEYSPACE IF NOT EXISTS');
        runResult.assertFileContent(
          `${javaPackageDir}config/DatabaseConfiguration.java`,
          '@ConditionalOnProperty(name = "application.cassandra.create-keyspace", havingValue = "true", matchIfMissing = true)',
        );
        runResult.assertFileContent(`${javaPackageDir}config/ApplicationProperties.java`, 'Boolean createKeyspace = true;');
        runResult.assertFileContent(`${javaPackageDir}config/ApplicationProperties.java`, 'keyspaceReplication');
        runResult.assertFileContent('src/main/resources/config/application-prod.yml', 'create-keyspace: true');
        runResult.assertFileContent('src/main/resources/config/application-prod.yml', 'keyspace-replication:');
      });

      it('should run liquibase after the session created the keyspace', () => {
        runResult.assertFileContent(`${javaPackageDir}config/LiquibaseConfiguration.java`, 'CqlSession session');
        runResult.assertNoFileContent(`${javaPackageDir}config/LiquibaseConfiguration.java`, 'CassandraProperties');
      });

      it('should not create the keyspace from the test container', () => {
        runResult.assertNoFileContent(`${javaTestPackageDir}config/CassandraTestContainer.java`, 'createKeyspace');
      });

      it('should not generate the cql migration container and scripts', () => {
        runResult.assertNoFile(cqlLoaderFiles);
        runResult.assertNoFileContent(`${dockerDir}cassandra.yml`, 'cassandra-migration');
        runResult.assertNoFileContent(`${dockerDir}cassandra-cluster.yml`, 'cassandra-migration');
        runResult.assertNoFileContent(`${dockerDir}app.yml`, 'cassandra-migration');
      });
    });

    describe('with the cql loader', () => {
      before(async () => {
        await helpers.runJHipster('server').withJHipsterConfig({ databaseType, databaseMigration: 'loader', skipClient: true });
      });

      it('should create the keyspace from the cql migration container', () => {
        runResult.assertFile(cqlLoaderFiles);
        runResult.assertFileContent(`${dockerDir}cassandra.yml`, 'CREATE_KEYSPACE_SCRIPT=create-keyspace-prod.cql');
        runResult.assertFileContent(`${dockerDir}cassandra-cluster.yml`, 'CREATE_KEYSPACE_SCRIPT=create-keyspace-prod.cql');
        runResult.assertFileContent(`${dockerDir}app.yml`, 'cassandra-migration');
        runResult.assertFileContent(`${javaTestPackageDir}config/CassandraTestContainer.java`, 'createKeyspace');
      });

      it('should not create the keyspace from the application', () => {
        runResult.assertNoFileContent(`${javaPackageDir}config/DatabaseConfiguration.java`, 'keyspaceCreator');
        runResult.assertNoFileContent(`${javaPackageDir}config/ApplicationProperties.java`, 'keyspaceReplication');
        runResult.assertNoFileContent('src/main/resources/config/application-prod.yml', 'keyspace-replication:');
      });
    });
  });

  it('samples matrix should match snapshot', () => {
    expect(testSamples).toMatchSnapshot();
  });

  Object.entries(testSamples).forEach(([name, sampleConfig]) => {
    const { authenticationType } = sampleConfig;

    describe(name, () => {
      if (
        sampleConfig.websocket &&
        (sampleConfig.reactive || sampleConfig.applicationType === 'microservice' || sampleConfig.applicationType === 'gateway')
      ) {
        it('should throw an error', async () => {
          await expect(helpers.runJHipster('server').withJHipsterConfig(sampleConfig)).rejects.toThrow();
        });

        return;
      }

      before(async () => {
        await helpers
          .runJHipster('server')
          .withJHipsterConfig(sampleConfig, entities)
          .withMockedSource({ except: ['addTestSpringFactory'] })
          .withMockedJHipsterGenerators({
            except: ['jhipster:spring-boot:data-cassandra'],
            filter: filterBasicServerGenerators,
          });
      });

      it('should match generated files snapshot', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('contains correct authenticationType', () => {
        runResult.assertFileContent('.yo-rc.json', new RegExp(`"authenticationType": "${authenticationType}"`));
      });
      it('contains correct databaseType', () => {
        runResult.assertFileContent('.yo-rc.json', new RegExp(`"databaseType": "${databaseType}"`));
      });
      shouldComposeWithLiquibase(false, () => runResult);
    });
  });
});
