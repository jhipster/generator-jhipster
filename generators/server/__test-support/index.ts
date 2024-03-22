/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert';

import { messageBrokerTypes, databaseTypes } from '../../../jdl/jhipster/index.js';
import {
  GENERATOR_CUCUMBER,
  GENERATOR_GATLING,
  GENERATOR_SPRING_CACHE,
  GENERATOR_SPRING_WEBSOCKET,
  GENERATOR_SPRING_DATA_RELATIONAL,
  GENERATOR_SPRING_DATA_CASSANDRA,
  GENERATOR_SPRING_DATA_COUCHBASE,
  GENERATOR_SPRING_DATA_MONGODB,
  GENERATOR_MAVEN,
  GENERATOR_LIQUIBASE,
  GENERATOR_LANGUAGES,
  GENERATOR_SPRING_CLOUD_STREAM,
  GENERATOR_GRADLE,
  GENERATOR_DOCKER,
  GENERATOR_COMMON,
} from '../../generator-list.js';

const { KAFKA, PULSAR } = messageBrokerTypes;
const { SQL, COUCHBASE } = databaseTypes;

export const mockedGenerators = [
  `jhipster:${GENERATOR_COMMON}`,
  `jhipster:${GENERATOR_SPRING_DATA_COUCHBASE}`,
  `jhipster:${GENERATOR_CUCUMBER}`,
  `jhipster:${GENERATOR_DOCKER}`,
  `jhipster:${GENERATOR_GATLING}`,
  `jhipster:${GENERATOR_GRADLE}`,
  `jhipster:${GENERATOR_GRADLE}:code-quality`,
  `jhipster:${GENERATOR_GRADLE}:jib`,
  `jhipster:${GENERATOR_GRADLE}:node-gradle`,
  `jhipster:${GENERATOR_SPRING_CLOUD_STREAM}`,
  `jhipster:${GENERATOR_LANGUAGES}`,
  `jhipster:${GENERATOR_LIQUIBASE}`,
  `jhipster:${GENERATOR_MAVEN}`,
  `jhipster:${GENERATOR_SPRING_DATA_CASSANDRA}`,
  `jhipster:${GENERATOR_SPRING_DATA_MONGODB}`,
  `jhipster:${GENERATOR_SPRING_DATA_RELATIONAL}`,
  `jhipster:${GENERATOR_SPRING_CACHE}`,
  `jhipster:${GENERATOR_SPRING_WEBSOCKET}`,
];

export const shouldComposeWithLiquibase = (testSample, runResultSupplier) => {
  const liquibaseEnabled = typeof testSample === 'boolean' ? testSample : testSample?.databaseType === SQL;
  if (liquibaseEnabled) {
    it('should compose with liquibase generator', () => {
      assert(runResultSupplier().mockedGenerators['jhipster:liquibase'].calledOnce);
    });
  } else {
    it('should not compose with liquibase generator', () => {
      assert(runResultSupplier().mockedGenerators['jhipster:liquibase'].notCalled);
    });
  }
};

export const shouldComposeWithSpringCloudStream = (sampleConfig, runResultSupplier) => {
  const pulsarEnabled = typeof sampleConfig === 'boolean' ? sampleConfig : sampleConfig?.messageBroker === PULSAR;
  const kafkaEnabled = typeof sampleConfig === 'boolean' ? sampleConfig : sampleConfig?.messageBroker === KAFKA;
  if (pulsarEnabled || kafkaEnabled) {
    it(`should compose with ${GENERATOR_SPRING_CLOUD_STREAM} generator`, () => {
      assert(runResultSupplier().mockedGenerators[`jhipster:${GENERATOR_SPRING_CLOUD_STREAM}`].calledOnce);
    });
  } else {
    it(`should not compose with ${GENERATOR_SPRING_CLOUD_STREAM} generator`, () => {
      assert(runResultSupplier().mockedGenerators[`jhipster:${GENERATOR_SPRING_CLOUD_STREAM}`].notCalled);
    });
  }
};

const shouldComposeWithDatabasetype = (databaseType: string, shouldCompose: boolean, runResultSupplier) => {
  const generator = databaseType;
  if (shouldCompose) {
    it(`should compose with ${generator} generator`, () => {
      assert(runResultSupplier().mockedGenerators[`jhipster:spring-data-${generator}`].calledOnce);
    });
  } else {
    it(`should not compose with ${generator} generator`, () => {
      assert(runResultSupplier().mockedGenerators[`jhipster:spring-data-${generator}`].notCalled);
    });
  }
};

export const shouldComposeWithCouchbase = (shouldCompose: boolean, runResultSupplier) =>
  shouldComposeWithDatabasetype(COUCHBASE, shouldCompose, runResultSupplier);
