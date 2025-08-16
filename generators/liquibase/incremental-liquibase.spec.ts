import { before, describe, expect, it } from 'esmocha';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path, { basename, join } from 'node:path';

import { runResult, skipPrettierHelpers as helpers } from '../../lib/testing/index.ts';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.js';
import type GeneratorsByNamespace from '../types.ts';

const exceptSourceMethods = ['addLiquibaseChangelog', 'addLiquibaseIncrementalChangelog', 'addLiquibaseConstraintsChangelog'];

const incrementalFiles = [
  `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
  `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`,
];

const baseName = 'JhipsterApp';

const jdlApplication = `
application {
    config {
      baseName ${baseName}
      creationTimestamp ${new Date('2020-01-01').getTime()}
      incrementalChangelog true
      skipClient true
    }
    entities *
}`;

const jdlApplicationWithEntities = `
${jdlApplication}
entity One {
    @Id oneId Long
    original String
}
entity Another {
    @Id anotherId Long
    original String
}`;

const jdlApplicationWithChangedEntitiesAndRelationship = `
${jdlApplication}
entity One {
  @Id oneId Long
  original String
  newFieldOfOne Boolean
}
entity Another {
  @Id anotherId Long
  originalChanged String
}
relationship ManyToOne {
  Another to One,
}
`;

const jdlApplicationWithRelationshipToUser = `
${jdlApplicationWithEntities}
relationship ManyToOne {
    One{user(login)} to User with builtInEntity
}
`;

const jdlApplicationEntityWithByteTypes = `
${jdlApplication}
entity Smarty {
  name String required unique minlength(2) maxlength(10)
  price Float required min(0)
  description TextBlob required
  picture ImageBlob required
  specification Blob
  category ProductCategory
  inventory Integer required min(0)
}
enum ProductCategory {
  Laptop, Desktop, Phone, Tablet, Accessory
}`;

const jdlApplicationEntityWithoutByteTypes = `
${jdlApplication}
entity Smarty {
  name String
  age Integer
  height Long
  income BigDecimal
  expense Double
  savings Float
  category ProductCategory
  happy Boolean
  dob LocalDate
  exactTime ZonedDateTime
  travelTime Duration
  moment Instant
}
enum ProductCategory {
  Laptop, Desktop, Phone, Tablet, Accessory
}`;

const jdlApplicationWithEntitiesAndRelationship = `
${jdlApplicationWithEntities}
relationship OneToOne {
One to Another,
}`;

const jdlApplicationWithEntitiesAndRelationshipsWithOnHandlers = `
${jdlApplicationWithEntities}
relationship ManyToOne {
One to @OnDelete("CASCADE") @OnUpdate("SET NULL") Another,
}`;

const jdlApplicationWithEntitiesAndRelationshipsWithChangedOnHandlers = `
${jdlApplicationWithEntities}
relationship ManyToOne {
One to @OnDelete("SET NULL") @OnUpdate("CASCADE") Another,
}`;

const jdlApplicationWithEntitiesAndRelationshipsWithChangedOnHandlersAndChangedNaming = `
${jdlApplicationWithEntities}
relationship ManyToOne {
One{anotherEnt} to @OnDelete("SET NULL") @OnUpdate("CASCADE") Another,
}`;

const jdlApplicationWithEntitiesWithDefaultValues = `
${jdlApplication}
entity One {
  @Id uuid UUID
  @defaultValue(true)
  active Boolean
  @defaultValue(42)
  someLong Long
  someDate Instant
}

entity Two {
  @defaultValue("some-default-string-value")
  comment String
  @defaultValueComputed("NOW(6)")
  computedDate Instant
}
`;

const jdlApplicationWithEntitiesWithChangedDefaultValuesAndNewRelationship = `
${jdlApplication}
entity One {
  @Id uuid UUID
  @defaultValue(true)
  active Boolean
  @defaultValue(69)
  someLong Long
  @defaultValueComputed("NOW(6)")
  someDate Instant
  @defaultValue(true)
  anotherBoolean Boolean
}

entity Two {
  @defaultValue("some-default-string-value")
  commentNew String
  computedDate Instant
}

relationship ManyToOne {
  Two to One
}
`;

const jdlApplicationWithEntitiesAndAddedNewMnyToManyRelationship = `
${jdlApplicationWithEntities}
relationship ManyToMany {
  One to Another
}`;

const exceptMockedGenerators: (keyof GeneratorsByNamespace)[] = [
  'jdl',
  'app',
  'server',
  'spring-boot',
  'jhipster:java:bootstrap',
  'jhipster:java:domain',
  'liquibase',
  'spring-data-relational',
];

describe('generator - app - --incremental-changelog', function () {
  this.timeout(45000);
  describe('when creating a new application', () => {
    before(async () => {
      await helpers
        .runJHipster('server')
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });

    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  describe('when incremental liquibase files exists', () => {
    describe('with default options', () => {
      before(async () => {
        await helpers
          .runJHipster('server')
          .withJHipsterConfig({ incrementalChangelog: true })
          .withMockedSource({ except: exceptSourceMethods })
          .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
          .doInDir(cwd => {
            incrementalFiles.forEach(filePath => {
              filePath = join(cwd, filePath);
              const dirname = path.dirname(filePath);
              if (!existsSync(dirname)) {
                mkdirSync(dirname, { recursive: true });
              }
              writeFileSync(filePath, basename(filePath));
            });
          });
      });

      it('should create application', () => {
        runResult.assertFile(['.yo-rc.json']);
      });

      it('should not override existing incremental files', () => {
        incrementalFiles.forEach(filePath => {
          runResult.assertFileContent(filePath, basename(filePath));
        });
      });

      it('should match snapshot', () => {
        expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
      });
    });

    describe('with --recreate-initial-changelog', () => {
      before(async () => {
        await helpers
          .runJHipster('server')
          .withMockedSource({ except: exceptSourceMethods })
          .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
          .withJHipsterConfig({ incrementalChangelog: true })
          .withOptions({ recreateInitialChangelog: true })
          .doInDir(cwd => {
            incrementalFiles.forEach(filePath => {
              filePath = join(cwd, filePath);
              const dirname = path.dirname(filePath);
              if (!existsSync(dirname)) {
                mkdirSync(dirname, { recursive: true });
              }
              writeFileSync(filePath, basename(filePath));
            });
          });
      });

      it('should create application', () => {
        runResult.assertFile(['.yo-rc.json']);
      });

      it('should override existing incremental files', () => {
        incrementalFiles.forEach(filePath => {
          runResult.assertNoFileContent(filePath, filePath);
        });
      });

      it('should match snapshot', () => {
        expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
      });
    });
  });

  describe('regenerating the application', () => {
    before(async () => {
      await helpers
        .runJDL(jdlApplicationWithRelationshipToUser)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators });
      await helpers.runJHipsterInApplication('jhipster:jdl').withOptions({
        inline: jdlApplicationWithRelationshipToUser,
        creationTimestamp: '2020-01-02',
      });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'One.json'), join('.jhipster', 'Another.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Another.xml`,
      ]);
    });
    it('should create entity initial fake data', () => {
      runResult.assertFile([
        `${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_one.csv`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000200_entity_another.csv`,
      ]);
    });
    it('should not create the entity update changelog', () => {
      runResult.assertNoFile([
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000200_updated_entity_Another.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000200_updated_entity_constraints_Another.xml`,
      ]);
    });

    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  describe('when adding a field without constraints', () => {
    before(async () => {
      await helpers.runJDL(`
${jdlApplication}
entity Customer {
    original String
}
`);

      await helpers
        .runJDLInApplication(
          `
${jdlApplication}
entity Customer {
    original String
    foo String
}
`,
        )
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-02',
        });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'Customer.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_Customer.xml`]);
    });
    it('should create entity initial fake data', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_customer.csv`]);
    });
    it('should create entity update changelog with addColumn', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'addColumn tableName="customer"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'column name="foo" type="varchar(255)"',
      );
      runResult.assertNoFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'dropColumn',
      );
    });
    it('should not create the entity constraint update changelog', () => {
      runResult.assertNoFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_Customer.xml`]);
    });
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  describe('when adding a field with constraints', () => {
    before(async () => {
      await helpers.runJDL(`
${jdlApplication}
entity Customer {
    original String
}
`);

      await helpers
        .runJDLInApplication(
          `
${jdlApplication}
entity Customer {
  original String
  foo String required
}
`,
        )
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-02',
        });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'Customer.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_Customer.xml`]);
    });
    it('should create entity initial fake data', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_customer.csv`]);
    });
    it('should create entity update changelog with addColumn', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'addColumn tableName="customer"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'column name="foo" type="varchar(255)"',
      );
      runResult.assertNoFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'dropColumn',
      );
    });
    it('should create the entity constraint update changelog', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_Customer.xml`]);
    });
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  describe('when removing a field without constraints', () => {
    before(async () => {
      await helpers.runJDL(`
${jdlApplication}
entity Customer {
    original String
    foo String
}
`);

      await helpers
        .runJDLInApplication(
          `
${jdlApplication}
entity Customer {
    original String
}
`,
        )
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-02',
        });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'Customer.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_Customer.xml`]);
    });
    it('should create entity initial fake data', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_customer.csv`]);
    });
    it('should create entity update changelog with dropColumn', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'dropColumn tableName="customer"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'column name="foo"',
      );
      runResult.assertNoFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'addColumn',
      );
    });
    it('should not create the entity constraint update changelog', () => {
      runResult.assertNoFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_Customer.xml`]);
    });
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  describe('when removing a field with constraints', () => {
    before(async () => {
      await helpers.runJDL(`
${jdlApplication}
entity Customer {
    original String
    foo String required
}
`);

      await helpers
        .runJDLInApplication(
          `
${jdlApplication}
entity Customer {
    original String
}
`,
        )
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-02',
        });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'Customer.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_Customer.xml`]);
    });
    it('should create entity initial fake data', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_customer.csv`]);
    });
    it('should create entity update changelog with dropColumn', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'dropColumn tableName="customer"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'column name="foo"',
      );
      runResult.assertNoFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'addColumn',
      );
    });
    it('should create the entity constraint update changelog', () => {
      runResult.assertNoFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_Customer.xml`]);
    });
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  describe('when adding a relationship', () => {
    before(async () => {
      await helpers
        .runJDL(jdlApplicationWithEntities)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators });

      await helpers
        .runJDLInApplication(jdlApplicationWithEntitiesAndRelationship)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-02',
        });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'One.json'), join('.jhipster', 'Another.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Another.xml`,
      ]);
    });
    it('should create entity initial fake data', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_one.csv`]);
    });
    it('should create entity update changelog with addColumn', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'addColumn tableName="one"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'column name="another_another_id" type="bigint"',
      );
      runResult.assertNoFileContent(`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`, 'dropColumn');
    });
    it('should create the entity constraint update changelog with fitting column names', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`,
        'baseColumnNames="another_another_id"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`,
        'referencedColumnNames="another_id"',
      );
    });
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  describe('when adding a many-to-many relationship', () => {
    before(async () => {
      await helpers
        .runJDL(jdlApplicationWithEntities)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators });

      await helpers
        .runJDLInApplication(jdlApplicationWithEntitiesAndAddedNewMnyToManyRelationship)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-02',
        });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'One.json'), join('.jhipster', 'Another.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Another.xml`,
      ]);
    });
    it('should create entity initial fake data', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_one.csv`]);
    });
    it('should create relationship table', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'createTable tableName="rel_one__another"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'column name="another_another_id" type="bigint"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'column name="one_one_id" type="bigint"',
      );
    });
    it('should create the entity constraint update changelog referencing both columns of the join table', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`]);

      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`,
        'baseColumnNames="one_one_id"',
      );

      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`,
        'baseColumnNames="another_another_id"',
      );
    });
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  describe('when adding a relationship with on handlers', () => {
    before(async () => {
      await helpers
        .runJDL(jdlApplicationWithEntities)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators });

      await helpers
        .runJDLInApplication(jdlApplicationWithEntitiesAndRelationshipsWithOnHandlers)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-02',
        });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'One.json'), join('.jhipster', 'Another.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Another.xml`,
      ]);
    });
    it('should create entity initial fake data', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_one.csv`]);
    });
    it('should create entity update changelog with addColumn', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'addColumn tableName="one"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'column name="another_another_id" type="bigint"',
      );
      runResult.assertNoFileContent(`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`, 'dropColumn');
    });
    it('should create the entity constraint update changelog', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`]);
    });
    it('should contain onUpdate and onDelete handlers', () => {
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`,
        'onUpdate="SET NULL"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`,
        'onDelete="CASCADE"',
      );
    });
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/changelog/**')).toMatchSnapshot();
    });
  });
  describe('when modifying a relationship with on handlers, only at these handlers', () => {
    before(async () => {
      await helpers
        .runJDL(jdlApplicationWithEntities)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators });

      await helpers
        .runJDLInApplication(jdlApplicationWithEntitiesAndRelationshipsWithOnHandlers)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-02',
        });

      await helpers
        .runJDLInApplication(jdlApplicationWithEntitiesAndRelationshipsWithChangedOnHandlers)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-03',
        });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'One.json'), join('.jhipster', 'Another.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Another.xml`,
      ]);
    });
    it('should create entity initial fake data', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_one.csv`]);
    });

    it('should create entity update changelog with addColumn', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'addColumn tableName="one"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'column name="another_another_id" type="bigint"',
      );
      runResult.assertNoFileContent(`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`, 'dropColumn');
    });
    it('should create the entity constraint update changelog', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`]);
    });
    it('should contain onUpdate and onDelete handlers', () => {
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`,
        'onUpdate="SET NULL"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`,
        'onDelete="CASCADE"',
      );
    });

    it('should create entity update changelog without add/dropColumn for on handler change', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_One.xml`]);
      runResult.assertNoFileContent(`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_One.xml`, 'addColumn');
      runResult.assertNoFileContent(`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_One.xml`, 'dropColumn');
    });

    it('should create entity update changelog with dropForeignKeyConstraint', () => {
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_One.xml`,
        'dropForeignKeyConstraint',
      );
    });

    it('should create the entity constraint update changelog', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_constraints_One.xml`]);
    });

    it('should contain addForeignKeyConstraint with correct onUpdate and onDelete handlers', () => {
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_constraints_One.xml`,
        'addForeignKeyConstraint',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_constraints_One.xml`,
        'onUpdate="CASCADE"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_constraints_One.xml`,
        'onDelete="SET NULL"',
      );
    });

    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/changelog/**')).toMatchSnapshot();
    });
  });

  describe('when modifying an existing relationship', () => {
    before(async () => {
      await helpers
        .runJDL(jdlApplicationWithEntities)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators });

      await helpers
        .runJDLInApplication(jdlApplicationWithEntitiesAndRelationshipsWithOnHandlers)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-02',
        });

      await helpers
        .runJDLInApplication(jdlApplicationWithEntitiesAndRelationshipsWithChangedOnHandlersAndChangedNaming)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-03',
        });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'One.json'), join('.jhipster', 'Another.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Another.xml`,
      ]);
    });
    it('should create entity initial fake data', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_one.csv`]);
    });

    it('should create entity update changelog with addColumn', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'addColumn tableName="one"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'column name="another_another_id" type="bigint"',
      );
      runResult.assertNoFileContent(`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`, 'dropColumn');
    });
    it('should create the entity constraint update changelog', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`]);
    });
    it('should contain onUpdate and onDelete handlers', () => {
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`,
        'onUpdate="SET NULL"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`,
        'onDelete="CASCADE"',
      );
    });

    it('should create entity update changelog with add/dropColumn for on handler change', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_One.xml`]);

      runResult.assertFileContent(`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_One.xml`, 'addColumn');
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_One.xml`,
        'column name="another_ent_another_id" type="bigint"',
      );

      runResult.assertFileContent(`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_One.xml`, 'dropColumn');
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_One.xml`,
        'column name="another_another_id"',
      );
    });

    it('should create entity update changelog with dropForeignKeyConstraint', () => {
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_One.xml`,
        'dropForeignKeyConstraint',
      );
    });

    it('should create the entity constraint update changelog', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_constraints_One.xml`]);
    });

    it('should contain addForeignKeyConstraint with correct onUpdate and onDelete handlers', () => {
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_constraints_One.xml`,
        'addForeignKeyConstraint',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_constraints_One.xml`,
        'onUpdate="CASCADE"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200103000100_updated_entity_constraints_One.xml`,
        'onDelete="SET NULL"',
      );
    });

    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/changelog/**')).toMatchSnapshot();
    });
  });

  describe('when initially creating an application with entities with relationships having on handlers', () => {
    before(async () => {
      await helpers
        .runJDL(jdlApplicationWithEntitiesAndRelationshipsWithOnHandlers)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'One.json'), join('.jhipster', 'Another.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Another.xml`,
      ]);
    });
    it('should have a foreign key column in initial changelog', () => {
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        'column name="another_another_id" type="bigint"',
      );
    });
    it('should create entity initial fake data', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_one.csv`]);
    });
    it('should create entity initial constraint changelog with addForeignKeyConstraint and proper on handlers', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_constraints_One.xml`]);

      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_constraints_One.xml`,
        'addForeignKeyConstraint',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_constraints_One.xml`,
        'onUpdate="SET NULL"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_constraints_One.xml`,
        'onDelete="CASCADE"',
      );
    });

    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/changelog/**')).toMatchSnapshot();
    });
  });

  describe('when removing a relationship', () => {
    before(async () => {
      await helpers
        .runJDL(jdlApplicationWithEntitiesAndRelationship)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators });

      await helpers
        .runJDLInApplication(jdlApplicationWithEntities)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-02',
        });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'One.json'), join('.jhipster', 'Another.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Another.xml`,
      ]);
    });
    it('should create entity initial fake data', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_one.csv`]);
    });
    it('should create entity update changelog with dropColumn and dropForeignKeyContraint', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'dropColumn tableName="one"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'column name="another_another_id"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'dropForeignKeyConstraint baseTableName="one" constraintName="fk_one__another_id"',
      );
    });
    it('should not create an additional entity constraint update changelog', () => {
      runResult.assertNoFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_One.xml`]);
    });
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  describe('when modifying fields and relationships at the same time in different entities', () => {
    before(async () => {
      await helpers
        .runJDL(jdlApplicationWithEntities)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators });

      await helpers
        .runJDLInApplication(jdlApplicationWithChangedEntitiesAndRelationship)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-02',
        });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'One.json'), join('.jhipster', 'Another.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Another.xml`,
      ]);
    });
    it('should create entity initial fake data', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_one.csv`]);
    });
    it('should create entity update changelog with addColumn', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'addColumn tableName="one"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'column name="new_field_of_one" type="boolean"',
      );
      runResult.assertNoFileContent(`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`, 'dropColumn');
    });
    it('should create entity update changelog with addColumn and dropColumn on Another', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000200_updated_entity_Another.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000200_updated_entity_Another.xml`,
        'addColumn tableName="another"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000200_updated_entity_Another.xml`,
        'column name="original_changed" type="varchar(255)"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000200_updated_entity_Another.xml`,
        'dropColumn tableName="another"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000200_updated_entity_Another.xml`,
        'column name="original"',
      );
    });
    it('should create the entity relationship field', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000400_updated_entity_Another.xml`]);
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000400_updated_entity_Another.xml`,
        'addColumn tableName="another"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000400_updated_entity_Another.xml`,
        'column name="one_one_id" type="bigint"',
      );
    });
    it('should create the entity constraint update changelog', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000400_updated_entity_constraints_Another.xml`]);
    });
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  describe('when creating entities with default values', () => {
    before(async () => {
      await helpers.runJHipster('jdl').withOptions({ inline: jdlApplicationWithEntitiesWithDefaultValues });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'One.json'), join('.jhipster', 'Two.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Two.xml`,
      ]);

      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        'column name="active" type="boolean" defaultValueBoolean="true"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        'column name="some_long" type="bigint" defaultValueNumeric="42"',
      );

      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Two.xml`,
        'column name="comment" type="varchar(255)" defaultValue="some-default-string-value"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Two.xml`,
        /* eslint-disable no-template-curly-in-string */
        'column name="computed_date" type="${datetimeType}" defaultValueComputed="NOW(6)"',
      );
    });

    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  describe('when modifying default values, fields with default values and relationships', () => {
    before(async () => {
      await helpers
        .runJDL(jdlApplicationWithEntitiesWithDefaultValues)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators });

      await helpers
        .runJDLInApplication(jdlApplicationWithEntitiesWithChangedDefaultValuesAndNewRelationship)
        .withMockedSource({ except: exceptSourceMethods })
        .withMockedJHipsterGenerators({ except: exceptMockedGenerators })
        .withOptions({
          creationTimestamp: '2020-01-02',
        });
    });

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([join('.jhipster', 'One.json'), join('.jhipster', 'Two.json')]);
    });
    it('should create entity initial changelog', () => {
      runResult.assertFile([
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Two.xml`,
      ]);

      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        'column name="active" type="boolean" defaultValueBoolean="true"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000100_added_entity_One.xml`,
        'column name="some_long" type="bigint" defaultValueNumeric="42"',
      );

      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Two.xml`,
        'column name="comment" type="varchar(255)" defaultValue="some-default-string-value"',
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200101000200_added_entity_Two.xml`,
        /* eslint-disable no-template-curly-in-string */
        'column name="computed_date" type="${datetimeType}" defaultValueComputed="NOW(6)"',
      );
    });

    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  describe('entities with/without byte fields should create fake data', () => {
    [
      {
        entity: jdlApplicationEntityWithByteTypes,
        bytesFields: true,
      },
      {
        entity: jdlApplicationEntityWithoutByteTypes,
        bytesFields: false,
      },
    ].forEach(eachEntityConfig => {
      describe(`testing ${eachEntityConfig.bytesFields ? 'with' : 'without'} byte fields`, () => {
        before(async () => {
          await helpers
            .runJDL(eachEntityConfig.entity)
            .withMockedSource({ except: exceptSourceMethods })
            .withMockedJHipsterGenerators({ except: exceptMockedGenerators });
        });

        it('should create entity config file', () => {
          runResult.assertFile([join('.jhipster', 'Smarty.json')]);
        });
        it('should create entity initial fake data file', () => {
          runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_smarty.csv`]);
        });
        it('should create fake data file with required content', () => {
          expect(
            runResult.getSnapshot(`**/${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_smarty.csv`),
          ).toMatchSnapshot();
        });
      });
    });
  });
});
