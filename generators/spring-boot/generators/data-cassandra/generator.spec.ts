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
    const initialSchema = 'src/main/resources/config/liquibase/changelog/00000000000000_initial_schema.xml';
    const liquibaseDataDir = 'src/main/resources/config/liquibase/data/';
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

      it('should create the schema with liquibase changes and load the default users from csv files', () => {
        runResult.assertFileContent(initialSchema, '<createTable tableName="user">');
        runResult.assertFileContent(initialSchema, '<createTable tableName="user_by_activation_key">');
        runResult.assertFileContent(initialSchema, 'file="config/liquibase/data/user.csv"');
        runResult.assertNoFileContent(initialSchema, '<sql ');
        runResult.assertNoFileContent(initialSchema, 'persistent_token');
        runResult.assertFile([
          `${liquibaseDataDir}user.csv`,
          `${liquibaseDataDir}user_by_login.csv`,
          `${liquibaseDataDir}user_by_email.csv`,
        ]);
        runResult.assertNoFile(`${liquibaseDataDir}user_authority.csv`);
        runResult.assertFileContent(
          `${liquibaseDataDir}user.csv`,
          "1;admin;$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC;Administrator;Administrator;admin@localhost;true;en;{'ROLE_USER','ROLE_ADMIN'}",
        );
        runResult.assertFileContent(`${javaPackageDir}repository/UserRepository.java`, 'user_by_activation_key');
      });
    });

    describe('with liquibase, session authentication', () => {
      before(async () => {
        await helpers.runJHipster('server').withJHipsterConfig({ databaseType, authenticationType: 'session', skipClient: true });
      });

      it('should create the persistent token tables', () => {
        runResult.assertFileContent(initialSchema, '<createTable tableName="persistent_token">');
        runResult.assertFileContent(initialSchema, '<createTable tableName="persistent_token_by_user">');
      });
    });

    describe('with liquibase, oauth2 and user synchronization', () => {
      before(async () => {
        await helpers
          .runJHipster('server')
          .withJHipsterConfig({ databaseType, authenticationType: 'oauth2', syncUserWithIdp: true, skipClient: true });
      });

      it('should not create the user management tables nor load default users', () => {
        runResult.assertFileContent(initialSchema, '<createTable tableName="user_by_login">');
        runResult.assertNoFileContent(initialSchema, 'user_by_activation_key');
        runResult.assertNoFileContent(initialSchema, 'user_by_reset_key');
        runResult.assertNoFileContent(initialSchema, 'activation_key_by_creation_date');
        runResult.assertNoFileContent(initialSchema, '<loadData');
        runResult.assertNoFile(`${liquibaseDataDir}user.csv`);
        runResult.assertNoFileContent(`${javaPackageDir}repository/UserRepository.java`, 'user_by_activation_key');
        runResult.assertNoFileContent(`${javaPackageDir}repository/UserRepository.java`, 'ResetKey');
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
