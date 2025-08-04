import { databaseTypes, messageBrokerTypes } from '../../../lib/jhipster/index.ts';
import {
  GENERATOR_BOOTSTRAP,
  GENERATOR_JAVA,
  GENERATOR_PROJECT_NAME,
  GENERATOR_SERVER,
  GENERATOR_SPRING_BOOT,
  GENERATOR_SPRING_CLOUD_STREAM,
} from '../../generator-list.ts';

const { KAFKA, PULSAR } = messageBrokerTypes;
const { SQL, COUCHBASE } = databaseTypes;

export const shouldComposeWithLiquibase = (testSample, runResultSupplier) => {
  const liquibaseEnabled = typeof testSample === 'boolean' ? testSample : testSample?.databaseType === SQL;
  if (liquibaseEnabled) {
    it('should compose with liquibase generator', () => {
      runResultSupplier().assertGeneratorComposedOnce('jhipster:liquibase');
    });
  } else {
    it('should not compose with liquibase generator', () => {
      runResultSupplier().assertGeneratorNotComposed('jhipster:liquibase');
    });
  }
};

export const shouldComposeWithSpringCloudStream = (sampleConfig, runResultSupplier) => {
  const pulsarEnabled = typeof sampleConfig === 'boolean' ? sampleConfig : sampleConfig?.messageBroker === PULSAR;
  const kafkaEnabled = typeof sampleConfig === 'boolean' ? sampleConfig : sampleConfig?.messageBroker === KAFKA;
  if (pulsarEnabled || kafkaEnabled) {
    it(`should compose with ${GENERATOR_SPRING_CLOUD_STREAM} generator`, () => {
      runResultSupplier().assertGeneratorComposedOnce(`jhipster:${GENERATOR_SPRING_CLOUD_STREAM}`);
    });
  } else {
    it(`should not compose with ${GENERATOR_SPRING_CLOUD_STREAM} generator`, () => {
      runResultSupplier().assertGeneratorNotComposed(`jhipster:${GENERATOR_SPRING_CLOUD_STREAM}`);
    });
  }
};

const shouldComposeWithDatabasetype = (databaseType: string, shouldCompose: boolean, runResultSupplier) => {
  const generator = databaseType;
  if (shouldCompose) {
    it(`should compose with ${generator} generator`, () => {
      runResultSupplier().assertGeneratorComposedOnce(`jhipster:spring-data-${generator}`);
    });
  } else {
    it(`should not compose with ${generator} generator`, () => {
      runResultSupplier().assertGeneratorNotComposed(`jhipster:spring-data-${generator}`);
    });
  }
};

export const shouldComposeWithCouchbase = (shouldCompose: boolean, runResultSupplier) =>
  shouldComposeWithDatabasetype(COUCHBASE, shouldCompose, runResultSupplier);

export const filterBasicServerGenerators = (ns: string) =>
  !ns.startsWith(`jhipster:${GENERATOR_BOOTSTRAP}`) &&
  ![
    `jhipster:${GENERATOR_PROJECT_NAME}`,
    `jhipster:${GENERATOR_JAVA}`,
    `jhipster:${GENERATOR_JAVA}:bootstrap`,
    `jhipster:${GENERATOR_JAVA}:domain`,
    `jhipster:${GENERATOR_SERVER}`,
    `jhipster:${GENERATOR_SERVER}:bootstrap`,
    `jhipster:${GENERATOR_SPRING_BOOT}`,
    `jhipster:${GENERATOR_SPRING_BOOT}:bootstrap`,
  ].includes(ns);
