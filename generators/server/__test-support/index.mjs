/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'assert';

import { messageBrokerTypes, databaseTypes } from '../../../jdl/jhipster/index.mjs';

const { KAFKA } = messageBrokerTypes;
const { SQL } = databaseTypes;

export const mockedGenerators = ['jhipster:common', 'jhipster:docker', 'jhipster:kafka', 'jhipster:languages', 'jhipster:liquibase'];

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
