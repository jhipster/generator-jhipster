import path, { basename, join } from 'path';
import { jestExpect as expect } from 'mocha-expect-snapshot';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

import { skipPrettierHelpers as helpers } from '../../test/support/helpers.mjs';
import constants from '../generator-constants.cjs';
import { createImporterFromContent } from '../../jdl/jdl-importer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { SERVER_MAIN_RES_DIR } = constants;

const incrementalFiles = [
  `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
  `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`,
];

const DEFAULT_TEST_OPTIONS = { skipInstall: true, skipChecks: true, skipPrettier: true };

const baseName = 'JhipsterApp';

const jdlApplication = `
application {
    config { baseName ${baseName} }
    entities *
}`;

const jdlApplicationWithEntities = `
${jdlApplication}
entity One {
    original String
}
entity Another {
    original String
}`;

const jdlApplicationWithRelationshipToUser = `
${jdlApplicationWithEntities}
relationship ManyToOne {
    One{user(login)} to User
}
`;

const jdlApplicationEntitieWithByteTypes = `
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

const jdlApplicationEntitieWithoutByteTypes = `
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

const generatorPath = join(__dirname, '../server/index.mjs');
const mockedGenerators = ['jhipster:common', 'jhipster:gradle', 'jhipster:maven'];

describe('jhipster:app --incremental-changelog', function () {
  this.timeout(45000);
  const options = {
    ...DEFAULT_TEST_OPTIONS,
    noInsight: true,
    creationTimestamp: '2020-01-01',
    incrementalChangelog: true,
    defaults: true,
    skipClient: true,
    force: true,
    withEntities: true,
  };
  context('when creating a new application', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(generatorPath).withOptions(options).withMockedGenerators(mockedGenerators);
    });

    after(() => runResult.cleanup());

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });

    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  context('when incremental liquibase files exists', () => {
    context('with default options', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(generatorPath)
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

    context('with --recreate-initial-changelog', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(generatorPath)
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

  context('regenerating the application', () => {
    let runResult;
    before(async () => {
      const initialState = createImporterFromContent(jdlApplicationWithRelationshipToUser, {
        ...options,
        skipFileGeneration: true,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(2);
      runResult = await helpers
        .create(generatorPath)
        .withOptions({ ...options, applicationWithEntities })
        .run();
      const state = createImporterFromContent(jdlApplicationWithRelationshipToUser, {
        skipFileGeneration: true,
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

  context('when adding a field without constraints', () => {
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
          skipFileGeneration: true,
          creationTimestampConfig: options.creationTimestamp,
        }
      ).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(1);
      runResult = await helpers
        .create(generatorPath)
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
          skipFileGeneration: true,
          ...options,
        }
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
        'addColumn tableName="customer"'
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'column name="foo" type="varchar(255)"'
      );
      runResult.assertNoFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'dropColump'
      );
    });
    it('should not create the entity constraint update changelog', () => {
      runResult.assertNoFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_Customer.xml`]);
    });
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  context('when adding a field with constraints', () => {
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
          skipFileGeneration: true,
          creationTimestampConfig: options.creationTimestamp,
        }
      ).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(1);
      runResult = await helpers
        .create(generatorPath)
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
          skipFileGeneration: true,
          ...options,
        }
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
        'addColumn tableName="customer"'
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'column name="foo" type="varchar(255)"'
      );
      runResult.assertNoFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'dropColump'
      );
    });
    it('should create the entity constraint update changelog', () => {
      runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_Customer.xml`]);
    });
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  context('when removing a field without constraints', () => {
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
          skipFileGeneration: true,
          creationTimestampConfig: options.creationTimestamp,
        }
      ).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(1);
      runResult = await helpers
        .create(generatorPath)
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
          skipFileGeneration: true,
          ...options,
        }
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
        'dropColumn tableName="customer"'
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'column name="foo"'
      );
      runResult.assertNoFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'addColumn'
      );
    });
    it('should not create the entity constraint update changelog', () => {
      runResult.assertNoFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_Customer.xml`]);
    });
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  context('when removing a field with constraints', () => {
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
          skipFileGeneration: true,
          creationTimestampConfig: options.creationTimestamp,
        }
      ).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(1);
      runResult = await helpers
        .create(generatorPath)
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
          skipFileGeneration: true,
          ...options,
        }
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
        'dropColumn tableName="customer"'
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'column name="foo"'
      );
      runResult.assertNoFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_Customer.xml`,
        'addColumn'
      );
    });
    it('should create the entity constraint update changelog', () => {
      runResult.assertNoFile([`${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_constraints_Customer.xml`]);
    });
    it('should match snapshot', () => {
      expect(runResult.getSnapshot('**/src/main/resources/config/liquibase/**')).toMatchSnapshot();
    });
  });

  context('when adding a relationship', () => {
    let runResult;
    before(async () => {
      const baseName = 'JhipsterApp';
      const initialState = createImporterFromContent(jdlApplicationWithEntities, {
        ...options,
        skipFileGeneration: true,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
      expect(applicationWithEntities).toBeTruthy();
      expect(applicationWithEntities.entities.length).toBe(2);
      runResult = await helpers
        .create(generatorPath)
        .withOptions({ ...options, applicationWithEntities })
        .run();

      const state = createImporterFromContent(
        `
${jdlApplicationWithEntities}
relationship OneToOne {
    One to Another,
}
`,
        {
          skipFileGeneration: true,
          ...options,
        }
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
        'addColumn tableName="one"'
      );
      runResult.assertFileContent(
        `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/20200102000100_updated_entity_One.xml`,
        'column name="another_id" type="bigint"'
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
  context('entities with/without byte fields should create fake data', () => {
    [
      {
        entity: jdlApplicationEntitieWithByteTypes,
        bytesFields: true,
        testContent:
          '1;geez;4178;../fake-data/blob/hipster.txt;../fake-data/blob/hipster.png;image/png;../fake-data/blob/hipster.png;image/png;Laptop;17242',
        contentRequired: true,
      },
      {
        entity: jdlApplicationEntitieWithoutByteTypes,
        bytesFields: false,
        testContent: 'content_type',
        contentRequired: false,
      },
    ].forEach(eachEntityConfig => {
      describe(`testing ${eachEntityConfig.bytesFields ? 'with' : 'without'} byte fields`, () => {
        let runResult;
        before(async () => {
          const baseName = 'JhipsterApp';
          const initialState = createImporterFromContent(eachEntityConfig.entity, {
            ...options,
            skipFileGeneration: true,
            creationTimestampConfig: options.creationTimestamp,
          }).import();
          const applicationWithEntities = initialState.exportedApplicationsWithEntities[baseName];
          expect(applicationWithEntities).toBeTruthy();
          expect(applicationWithEntities.entities.length).toBe(1);
          runResult = await helpers
            .create(generatorPath)
            .withOptions({ ...options, applicationWithEntities })
            .run();
        });

        after(() => runResult.cleanup());

        it('should create entity config file', () => {
          runResult.assertFile([join('.jhipster', 'Smarty.json')]);
        });
        it('should create entity initial fake data file', () => {
          runResult.assertFile([`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_smarty.csv`]);
        });
        it('should create fake data file with required content', () => {
          eachEntityConfig.contentRequired
            ? runResult.assertFileContent(
                `${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_smarty.csv`,
                eachEntityConfig.testContent
              )
            : runResult.assertNoFileContent(
                `${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/20200101000100_entity_smarty.csv`,
                eachEntityConfig.testContent
              );
        });
      });
    });
  });
});
