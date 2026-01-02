import { databaseTypes } from '../../../lib/jhipster/index.ts';
import type { result } from '../../../lib/testing/index.ts';

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
    ![
      `jhipster:project-name`,
      `jhipster:java-simple-application:build-tool`,
      `jhipster:java-simple-application:gradle`,
      `jhipster:java`,
      `jhipster:java:domain`,
      `jhipster:server`,
      `jhipster:spring-boot`,
    ].includes(ns)
  );
};
