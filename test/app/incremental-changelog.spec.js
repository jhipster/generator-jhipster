const path = require('path');
const fs = require('fs');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const expectedFiles = require('../utils/expected-files');
const { SERVER_MAIN_RES_DIR } = require('../../generators/generator-constants');
const { createImporterFromContent } = require('../../jdl/jdl-importer');

const incrementalFiles = [
  `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
  `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`,
];

const DEFAULT_TEST_OPTIONS = { fromCli: true, skipInstall: true, skipChecks: true, skipPrettier: true };

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
    before(() => {
      return helpers
        .create(path.join(__dirname, '../../generators/app'))
        .withOptions(options)
        .run()
        .then(result => {
          runResult = result;
        });
    });

    after(() => runResult.cleanup());

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });

    it('creates expected liquibase files', () => {
      runResult.assertFile(expectedFiles.liquibase);
    });
  });

  context('when incremental liquibase files exists', () => {
    context('with default options', () => {
      let runResult;
      before(() => {
        return helpers
          .create(path.join(__dirname, '../../generators/app'))
          .withOptions(options)
          .doInDir(cwd => {
            incrementalFiles.forEach(filePath => {
              filePath = path.join(cwd, filePath);
              const dirname = path.dirname(filePath);
              if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname, { recursive: true });
              }
              fs.writeFileSync(filePath, filePath);
            });
          })
          .run()
          .then(result => {
            runResult = result;
          });
      });

      after(() => runResult.cleanup());

      it('should create application', () => {
        runResult.assertFile(['.yo-rc.json']);
      });

      it('creates expected liquibase files', () => {
        runResult.assertFile(expectedFiles.liquibase);
      });

      it('should not override existing incremental files', () => {
        incrementalFiles.forEach(filePath => {
          runResult.assertFileContent(filePath, filePath);
        });
      });
    });

    context('with --recreate-initial-changelog', () => {
      let runResult;
      before(() => {
        return helpers
          .create(path.join(__dirname, '../../generators/app'))
          .withOptions({ ...options, recreateInitialChangelog: true })
          .doInDir(cwd => {
            incrementalFiles.forEach(filePath => {
              filePath = path.join(cwd, filePath);
              const dirname = path.dirname(filePath);
              if (!fs.existsSync(dirname)) {
                fs.mkdirSync(dirname, { recursive: true });
              }
              fs.writeFileSync(filePath, filePath);
            });
          })
          .run()
          .then(result => {
            runResult = result;
          });
      });

      after(() => runResult.cleanup());

      it('should create application', () => {
        runResult.assertFile(['.yo-rc.json']);
      });

      it('creates expected liquibase files', () => {
        runResult.assertFile(expectedFiles.liquibase);
      });

      it('should override existing incremental files', () => {
        incrementalFiles.forEach(filePath => {
          runResult.assertNoFileContent(filePath, filePath);
        });
      });
    });
  });

  context('regenerating the application', () => {
    let runResult;
    before(() => {
      const state = createImporterFromContent(jdlApplicationWithRelationshipToUser, {
        ...options,
        skipFileGeneration: true,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = state.exportedApplicationsWithEntities[baseName];
      assert(applicationWithEntities);
      assert.equal(applicationWithEntities.entities.length, 2);
      return helpers
        .create(path.join(__dirname, '../../generators/app'))
        .withOptions({ ...options, applicationWithEntities })
        .run()
        .then(result => {
          const state = createImporterFromContent(jdlApplicationWithRelationshipToUser, {
            skipFileGeneration: true,
            ...options,
          }).import();
          return result
            .create(path.join(__dirname, '../../generators/app'))
            .withOptions({
              ...options,
              applicationWithEntities: state.exportedApplicationsWithEntities.JhipsterApp,
              creationTimestamp: '2020-01-02',
            })
            .run()
            .then(result => {
              runResult = result;
            });
        });
    });

    after(() => runResult.cleanup());

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([path.join('.jhipster', 'One.json'), path.join('.jhipster', 'Another.json')]);
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
  });

  context('when adding a field without constraints', () => {
    let runResult;
    before(() => {
      const baseName = 'JhipsterApp';
      const state = createImporterFromContent(
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
      const applicationWithEntities = state.exportedApplicationsWithEntities[baseName];
      assert(applicationWithEntities);
      assert.equal(applicationWithEntities.entities.length, 1);
      return helpers
        .create(path.join(__dirname, '../../generators/app'))
        .withOptions({ ...options, applicationWithEntities })
        .run()
        .then(result => {
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
          return result
            .create(path.join(__dirname, '../../generators/app'))
            .withOptions({
              ...options,
              applicationWithEntities: state.exportedApplicationsWithEntities.JhipsterApp,
              creationTimestamp: '2020-01-02',
            })
            .run()
            .then(result => {
              runResult = result;
            });
        });
    });

    after(() => runResult.cleanup());

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([path.join('.jhipster', 'Customer.json')]);
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
  });

  context('when adding a field with constraints', () => {
    let runResult;
    before(() => {
      const baseName = 'JhipsterApp';
      const state = createImporterFromContent(
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
      const applicationWithEntities = state.exportedApplicationsWithEntities[baseName];
      assert(applicationWithEntities);
      assert.equal(applicationWithEntities.entities.length, 1);
      return helpers
        .create(path.join(__dirname, '../../generators/app'))
        .withOptions({ ...options, applicationWithEntities })
        .run()
        .then(result => {
          const state = createImporterFromContent(
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
          return result
            .create(path.join(__dirname, '../../generators/app'))
            .withOptions({
              ...options,
              applicationWithEntities: state.exportedApplicationsWithEntities.JhipsterApp,
              creationTimestamp: '2020-01-02',
            })
            .run()
            .then(result => {
              runResult = result;
            });
        });
    });

    after(() => runResult.cleanup());

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([path.join('.jhipster', 'Customer.json')]);
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
  });

  context('when removing a field without constraints', () => {
    let runResult;
    before(() => {
      const baseName = 'JhipsterApp';
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
          skipFileGeneration: true,
          creationTimestampConfig: options.creationTimestamp,
        }
      ).import();
      const applicationWithEntities = state.exportedApplicationsWithEntities[baseName];
      assert(applicationWithEntities);
      assert.equal(applicationWithEntities.entities.length, 1);
      return helpers
        .create(path.join(__dirname, '../../generators/app'))
        .withOptions({ ...options, applicationWithEntities })
        .run()
        .then(result => {
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
          return result
            .create(path.join(__dirname, '../../generators/app'))
            .withOptions({
              ...options,
              applicationWithEntities: state.exportedApplicationsWithEntities[baseName],
              creationTimestamp: '2020-01-02',
            })
            .run()
            .then(result => {
              runResult = result;
            });
        });
    });

    after(() => runResult.cleanup());

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([path.join('.jhipster', 'Customer.json')]);
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
  });

  context('when removing a field with constraints', () => {
    let runResult;
    before(() => {
      const baseName = 'JhipsterApp';
      const state = createImporterFromContent(
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
      const applicationWithEntities = state.exportedApplicationsWithEntities[baseName];
      assert(applicationWithEntities);
      assert.equal(applicationWithEntities.entities.length, 1);
      return helpers
        .create(path.join(__dirname, '../../generators/app'))
        .withOptions({ ...options, applicationWithEntities })
        .run()
        .then(result => {
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
          return result
            .create(path.join(__dirname, '../../generators/app'))
            .withOptions({
              ...options,
              applicationWithEntities: state.exportedApplicationsWithEntities[baseName],
              creationTimestamp: '2020-01-02',
            })
            .run()
            .then(result => {
              runResult = result;
            });
        });
    });

    after(() => runResult.cleanup());

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([path.join('.jhipster', 'Customer.json')]);
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
  });

  context('when adding a relationship', () => {
    let runResult;
    before(() => {
      const baseName = 'JhipsterApp';
      const state = createImporterFromContent(jdlApplicationWithEntities, {
        ...options,
        skipFileGeneration: true,
        creationTimestampConfig: options.creationTimestamp,
      }).import();
      const applicationWithEntities = state.exportedApplicationsWithEntities[baseName];
      assert(applicationWithEntities);
      assert.equal(applicationWithEntities.entities.length, 2);
      return helpers
        .create(path.join(__dirname, '../../generators/app'))
        .withOptions({ ...options, applicationWithEntities })
        .run()
        .then(result => {
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
          return result
            .create(path.join(__dirname, '../../generators/app'))
            .withOptions({
              ...options,
              applicationWithEntities: state.exportedApplicationsWithEntities[baseName],
              creationTimestamp: '2020-01-02',
            })
            .run()
            .then(result => {
              runResult = result;
            });
        });
    });

    after(() => runResult.cleanup());

    it('should create application', () => {
      runResult.assertFile(['.yo-rc.json']);
    });
    it('should create entity config file', () => {
      runResult.assertFile([path.join('.jhipster', 'One.json'), path.join('.jhipster', 'Another.json')]);
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
  });
});
