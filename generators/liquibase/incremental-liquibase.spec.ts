import path, { basename, join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { before, it, describe, after, expect } from 'esmocha';
import { skipPrettierHelpers as helpers, runResult } from '../../testing/index.js';
import { SERVER_MAIN_RES_DIR } from '../generator-constants.js';
import { createImporterFromContent } from '../../jdl/jdl-importer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const incrementalFiles = [
  `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
  `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`,
];

const baseName = 'JhipsterApp';

const jdlApplication = `
application {
    config { baseName ${baseName} }
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

const generatorPath = join(__dirname, '../server/index.js');
const mockedGenerators = ['jhipster:common'];

describe('generator - app - --incremental-changelog', function () {
  this.timeout(45000);
  const options = {
    creationTimestamp: '2020-01-01',
  };
  const config = {
    incrementalChangelog: true,
    skipClient: true,
    force: true,
  };
  describe('when creating a new application', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(generatorPath).withJHipsterConfig(config).withOptions(options).withMockedGenerators(mockedGenerators);
    });

    after(() => runResult.cleanup());

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });

    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  describe('when incremental liquibase files exists', () => {
    describe('with default options', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(generatorPath)
          .withJHipsterConfig(config)
          .withOptions(options)
          .doInDir(cwd => {
            incrementalFiles.forEach(filePath => {
              filePath = join(cwd, filePath);
              const dirname = path.dirname(filePath);
              if (!existsSync(dirname)) {
                mkdirSync(dirname, { recursive: true });
              }
              writeFileSync(filePath, basename(filePath));
            });
          })
          .run();
      });

      after(() => runResult.cleanup());

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
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(generatorPath)
          .withJHipsterConfig(config)
          .withOptions({ ...options, recreateInitialChangelog: true })
          .doInDir(cwd => {
            incrementalFiles.forEach(filePath => {
              filePath = join(cwd, filePath);
              const dirname = path.dirname(filePath);
              if (!existsSync(dirname)) {
                mkdirSync(dirname, { recursive: true });
              }
              writeFileSync(filePath, basename(filePath));
            });
          })
          .run();
      });

      after(() => runResult.cleanup());

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
    let runResult;
    before(async () => {
      const initialState = createImporterFromContent(jdlApplicationWithRelationshipToUser, {
        ...options,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(2);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();
      const state = createImporterFromContent(jdlApplicationWithRelationshipToUser, {
        ...options,
      }).import();
      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: state.exportedApplicationsWithEntities.JhipsterApp,
          creationTimestamp: '2020-01-02',
        })
        .run();
    });

    after(() => runResult.cleanup());

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
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(
        `
${jdlApplication}
entity Customer {
    original String
}
`,
        {
          ...options,
          creationTimestampConfig: options.creationTimestamp,
        },
      ).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(1);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();

      const state = createImporterFromContent(
        `
${jdlApplication}
entity Customer {
    original String
    foo String
}
`,
        {
          ...options,
        },
      ).import();
      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: state.exportedApplicationsWithEntities.JhipsterApp,
          creationTimestamp: '2020-01-02',
        })
        .run();
    });

    after(() => runResult.cleanup());

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
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(
        `
${jdlApplication}
entity Customer {
    original String
}
`,
        {
          ...options,
          creationTimestampConfig: options.creationTimestamp,
        },
      ).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(1);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();

      const regenerateState = createImporterFromContent(
        `
${jdlApplication}
entity Customer {
  original String
  foo String required
}
`,
        {
          ...options,
        },
      ).import();

      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: regenerateState.exportedApplicationsWithEntities.JhipsterApp,
          creationTimestamp: '2020-01-02',
        })
        .run();
    });

    after(() => runResult.cleanup());

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
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(
        `
${jdlApplication}
entity Customer {
    original String
    foo String
}
`,
        {
          ...options,
          creationTimestampConfig: options.creationTimestamp,
        },
      ).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(1);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();

      const state = createImporterFromContent(
        `
${jdlApplication}
entity Customer {
    original String
}
`,
        {
          ...options,
        },
      ).import();
      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: state.exportedApplicationsWithEntities[baseName],
          creationTimestamp: '2020-01-02',
        })
        .run();
    });

    after(() => runResult.cleanup());

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
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(
        `
${jdlApplication}
entity Customer {
    original String
    foo String required
}
`,
        {
          ...options,
          creationTimestampConfig: options.creationTimestamp,
        },
      ).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(1);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();

      const state = createImporterFromContent(
        `
${jdlApplication}
entity Customer {
    original String
}
`,
        {
          ...options,
        },
      ).import();
      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: state.exportedApplicationsWithEntities[baseName],
          creationTimestamp: '2020-01-02',
        })
        .run();
    });

    after(() => runResult.cleanup());

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
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(jdlApplicationWithEntities, {
        ...options,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(2);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();

      const state = createImporterFromContent(jdlApplicationWithEntitiesAndRelationship, {
        ...options,
      }).import();
      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: state.exportedApplicationsWithEntities[baseName],
          creationTimestamp: '2020-01-02',
        })
        .run();
    });

    after(() => runResult.cleanup());

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
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });
  describe('when adding a relationship with on handlers', () => {
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(jdlApplicationWithEntities, {
        ...options,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(2);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();

      const state = createImporterFromContent(jdlApplicationWithEntitiesAndRelationshipsWithOnHandlers, {
        ...options,
      }).import();
      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: state.exportedApplicationsWithEntities[baseName],
          creationTimestamp: '2020-01-02',
        })
        .run();
    });

    after(() => runResult.cleanup());

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
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(jdlApplicationWithEntities, {
        ...options,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(2);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();

      const state = createImporterFromContent(jdlApplicationWithEntitiesAndRelationshipsWithOnHandlers, {
        ...options,
      }).import();
      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: state.exportedApplicationsWithEntities[baseName],
          creationTimestamp: '2020-01-02',
        })
        .run();

      const thirdState = createImporterFromContent(jdlApplicationWithEntitiesAndRelationshipsWithChangedOnHandlers, {
        ...options,
      }).import();
      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: thirdState.exportedApplicationsWithEntities[baseName],
          creationTimestamp: '2020-01-03',
        })
        .run();
    });

    after(() => runResult.cleanup());

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
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(jdlApplicationWithEntities, {
        ...options,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(2);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();

      const state = createImporterFromContent(jdlApplicationWithEntitiesAndRelationshipsWithOnHandlers, {
        ...options,
      }).import();
      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: state.exportedApplicationsWithEntities[baseName],
          creationTimestamp: '2020-01-02',
        })
        .run();

      const thirdState = createImporterFromContent(jdlApplicationWithEntitiesAndRelationshipsWithChangedOnHandlersAndChangedNaming, {
        ...options,
      }).import();
      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: thirdState.exportedApplicationsWithEntities[baseName],
          creationTimestamp: '2020-01-03',
        })
        .run();
    });

    after(() => runResult.cleanup());

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
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(jdlApplicationWithEntitiesAndRelationshipsWithOnHandlers, {
        ...options,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(2);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();
    });

    after(() => runResult.cleanup());

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
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(jdlApplicationWithEntitiesAndRelationship, {
        ...options,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(2);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();

      const state = createImporterFromContent(jdlApplicationWithEntities, {
        ...options,
      }).import();
      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: state.exportedApplicationsWithEntities[baseName],
          creationTimestamp: '2020-01-02',
        })
        .run();
    });

    after(() => runResult.cleanup());

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
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(jdlApplicationWithEntities, {
        ...options,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(2);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();

      const state = createImporterFromContent(jdlApplicationWithChangedEntitiesAndRelationship, {
        ...options,
      }).import();
      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: state.exportedApplicationsWithEntities[baseName],
          creationTimestamp: '2020-01-02',
        })
        .run();
    });

    after(() => runResult.cleanup());

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
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(jdlApplicationWithEntitiesWithDefaultValues, {
        ...options,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(2);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();
    });

    after(() => runResult.cleanup());

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
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(jdlApplicationWithEntitiesWithDefaultValues, {
        ...options,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(2);
      runResult = await helpers
        .create(generatorPath)
        .withJHipsterConfig(config)
        .withOptions({ ...options, applicationWithEntities })
        .run();

      const state = createImporterFromContent(jdlApplicationWithEntitiesWithChangedDefaultValuesAndNewRelationship, {
        ...options,
      }).import();

      runResult = await runResult
        .create(generatorPath)
        .withOptions({
          ...options,
          applicationWithEntities: state.exportedApplicationsWithEntities[baseName],
          creationTimestamp: '2020-01-02',
        })
        .run();
    });

    after(() => runResult.cleanup());

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
          const baseName = 'JhipsterApp';
          const initialState = createImporterFromContent(eachEntityConfig.entity, {
            ...options,
            creationTimestampConfig: options.creationTimestamp,
          }).import();
          const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
          expect(applicationWithEntities).toBeTruthy();
          expect(applicationWithEntities.entities.length).toBe(1);
          await helpers
            .create(generatorPath)
            .withJHipsterConfig(config)
            .withOptions({ ...options, applicationWithEntities })
            .run();
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
