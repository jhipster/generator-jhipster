/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert';

import { messageBrokerTypes, databaseTypes } from '../../../jdl/jhipster/index.mjs';

const { KAFKA } = messageBrokerTypes;
const { SQL, COUCHBASE } = databaseTypes;

export const mockedGenerators = [
  'jhipster:cassandra',
  'jhipster:common',
  'jhipster:couchbase',
  'jhipster:docker',
  'jhipster:gradle',
  'jhipster:kafka',
  'jhipster:languages',
  'jhipster:liquibase',
  'jhipster:maven',
  'jhipster:mongodb',
];

export const shouldComposeWithLiquibase = (testSample, runResultSupplier) => {
  const liquibaseEnabled = typeof testSample === 'boolean' ? testSample : testSample?.applicationWithEntities?.config?.databaseType === SQL;
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

export const shouldComposeWithKafka = (testSample, runResultSupplier) => {
  const kafkaEnabled = typeof testSample === 'boolean' ? testSample : testSample?.applicationWithEntities?.config?.messageBroker === KAFKA;
  if (kafkaEnabled) {
    it(`should compose with ${KAFKA} generator`, () => {
      assert(runResultSupplier().mockedGenerators['jhipster:kafka'].calledOnce);
    });
  } else {
    it(`should not compose with ${KAFKA} generator`, () => {
      assert(runResultSupplier().mockedGenerators['jhipster:kafka'].notCalled);
    });
  }
};

const shouldComposeWithDatabasetype = (databaseType, testSample, runResultSupplier) => {
  const generator = databaseType;
  const shouldCompose =
    typeof testSample === 'boolean' ? testSample : testSample?.applicationWithEntities?.config?.databaseType === databaseType;
  if (shouldCompose) {
    it(`should compose with ${generator} generator`, () => {
      assert(runResultSupplier().mockedGenerators[`jhipster:${generator}`].calledOnce);
    });
  } else {
    it(`should not compose with ${generator} generator`, () => {
      assert(runResultSupplier().mockedGenerators[`jhipster:${generator}`].notCalled);
    });
  }
};

export const shouldComposeWithCouchbase = (testSample, runResultSupplier) =>
  shouldComposeWithDatabasetype(COUCHBASE, testSample, runResultSupplier);
