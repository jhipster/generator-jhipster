import { databaseTypes, messageBrokerTypes } from '../../../lib/jhipster/index.ts';
import type { result } from '../../../lib/testing/index.ts';

const { KAFKA, PULSAR } = messageBrokerTypes;
const { SQL, COUCHBASE } = databaseTypes;

type RunResultSupplier = () => typeof result;

export const shouldComposeWithLiquibase = (testSample: boolean | Record<string, unknown>, runResultSupplier: RunResultSupplier) => {
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

export const shouldComposeWithSpringCloudStream = (
  sampleConfig: boolean | Record<string, unknown>,
  runResultSupplier: RunResultSupplier,
) => {
  const pulsarEnabled = typeof sampleConfig === 'boolean' ? sampleConfig : sampleConfig?.messageBroker === PULSAR;
  const kafkaEnabled = typeof sampleConfig === 'boolean' ? sampleConfig : sampleConfig?.messageBroker === KAFKA;
  if (pulsarEnabled || kafkaEnabled) {
    it(`should compose with spring-cloud-stream generator`, () => {
      runResultSupplier().assertGeneratorComposedOnce(`jhipster:spring-cloud-stream`);
    });
  } else {
    it(`should not compose with spring-cloud-stream generator`, () => {
      runResultSupplier().assertGeneratorNotComposed(`jhipster:spring-cloud-stream`);
    });
  }
};

const shouldComposeWithDatabasetype = (databaseType: string, shouldCompose: boolean, runResultSupplier: RunResultSupplier) => {
  const generator = databaseType;
  if (shouldCompose) {
    it(`should compose with ${generator} generator`, () => {
      runResultSupplier().assertGeneratorComposedOnce(`jhipster:spring-data:${generator}`);
    });
  } else {
    it(`should not compose with ${generator} generator`, () => {
      runResultSupplier().assertGeneratorNotComposed(`jhipster:spring-data:${generator}`);
    });
  }
};

export const shouldComposeWithCouchbase = (shouldCompose: boolean, runResultSupplier: RunResultSupplier) =>
  shouldComposeWithDatabasetype(COUCHBASE, shouldCompose, runResultSupplier);

export const filterBasicServerGenerators = (ns: string) => {
  const [, generator, subGenerator] = ns.split(':');
  return (
    subGenerator !== 'bootstrap' &&
    !generator.startsWith('bootstrap') &&
    ![`jhipster:project-name`, `jhipster:java`, `jhipster:java:domain`, `jhipster:server`, `jhipster:spring-boot`].includes(ns)
  );
};
