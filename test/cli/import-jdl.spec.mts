import { mock } from '@node-loaders/jest-mock';
import path from 'path';
import fse from 'fs-extra';
import assert from 'yeoman-assert';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { getTemplatePath, testInTempDir, revertTempDir } from '../support/index.mjs';

let subGenCallParams: { count: number; commands: string[]; options: any[]; entities: string[] } = {
  count: 0,
  commands: [],
  options: [],
  entities: [],
};

const removeFieldsWithUndefinedValues = options => Object.fromEntries(Object.entries(options).filter(([_, value]) => value !== undefined));

const pushCall = (command, options) => {
  subGenCallParams.count++;
  subGenCallParams.commands.push(command);
  if (!Array.isArray(options)) {
    options = removeFieldsWithUndefinedValues(options);
  }
  if (options.entitiesToImport) {
    subGenCallParams.entities = options.entitiesToImport.map(entity => entity.name);
  }
  delete options.entitiesToImport;
  subGenCallParams.options.push(options);
};

const env = {
  composeWith() {},
  run(command, options) {
    pushCall(command, options);
    return Promise.resolve();
  },
};

const EnvironmentBuilderMock = await mock<typeof import('../../cli/environment-builder.mjs')>('../../cli/environment-builder.mjs');
EnvironmentBuilderMock.default.createDefaultBuilder.mockImplementation((async () => {
  return Promise.resolve({
    getEnvironment: () => {
      return {
        composeWith() {},
        run: (generatorArgs, generatorOptions) => {
          pushCall(generatorArgs, generatorOptions);
          return Promise.resolve();
        },
      };
    },
  });
}) as any);

const createImportJdl = async () => {
  const { default: importJdl } = await import('../../cli/import-jdl.mjs');
  return importJdl;
};

const defaultAddedOptions = {};

function testDocumentsRelationships() {
  it('creates entity json files', () => {
    expect(subGenCallParams.entities).toEqual(['Customer', 'CustomerOrder', 'OrderedItem', 'PaymentDetails', 'ShippingDetails']);
  });
  it('calls entity subgenerator', () => {
    expect(subGenCallParams.count).toEqual(1);
    expect(subGenCallParams.commands).toEqual(['jhipster:entities']);
    expect(subGenCallParams.options[0]).toEqual({
      ...defaultAddedOptions,
      fromJdl: true,
    });
  });
}

describe('generator - import jdl', () => {
  let originalCwd;
  before(() => {
    originalCwd = process.cwd();
  });
  beforeEach(() => {
    subGenCallParams = {
      count: 0,
      commands: [],
      options: [],
      entities: [],
    };
  });
  // this test for some reason works only when put at the beginning.
  describe('runs in series with --interactive flag', () => {
    const options = { skipInstall: true, noInsight: true, interactive: true };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        const importJdl = await createImportJdl();
        await importJdl(['apps-and-entities-and-deployments.jdl'], options, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('calls generator in order', () => {
      expect(subGenCallParams.count).toEqual(5);
      expect(subGenCallParams.commands).toEqual([
        'jhipster:app',
        'jhipster:app',
        'jhipster:app',
        'jhipster:docker-compose',
        'jhipster:kubernetes',
      ]);
      expect(subGenCallParams.options[0]).toEqual({
        reproducible: true,
        force: true,
        withEntities: true,
        skipInstall: true,
        noInsight: true,
        fromJdl: true,
        applicationWithEntities: expect.any(Object),
      });
      expect(subGenCallParams.options[3]).toEqual({
        force: true,
        skipInstall: true,
        fromJdl: true,
        noInsight: true,
        skipPrompts: true,
      });
    });
  });

  describe('imports a JDL entity model from single file with --json-only flag', () => {
    const options = { jsonOnly: true, skipInstall: true, databaseType: 'postgresql', baseName: 'jhipster' };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        const importJdl = await createImportJdl();
        await importJdl(['jdl.jdl'], options, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('creates entity json files', () => {
      assert.file([
        '.jhipster/Department.json',
        '.jhipster/JobHistory.json',
        '.jhipster/Job.json',
        '.jhipster/Employee.json',
        '.jhipster/Location.json',
        '.jhipster/Task.json',
        '.jhipster/Country.json',
        '.jhipster/Region.json',
      ]);
    });
    it('does not call entity sub generator', () => {
      expect(subGenCallParams.count).toEqual(0);
    });
  });

  describe('imports a JDL entity model from single file with --skip-db-changelog', () => {
    const options = { skipDbChangelog: true, databaseType: 'postgresql', baseName: 'jhipster' };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        const importJdl = await createImportJdl();
        await importJdl(['jdl.jdl'], options, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('passes entities to entities generator', () => {
      expect(subGenCallParams.entities).toEqual(['Region', 'Country', 'Location', 'Department', 'Task', 'Employee', 'Job', 'JobHistory']);
    });
    it('calls entity subgenerator', () => {
      expect(subGenCallParams.count).toEqual(1);
      expect(subGenCallParams.commands).toEqual(['jhipster:entities']);
    });

    it('calls entity subgenerator with correct options', () => {
      subGenCallParams.options.slice(0, subGenCallParams.options.length - 1).forEach(subGenOptions => {
        expect(subGenOptions).toEqual({
          ...options,
          ...defaultAddedOptions,
          skipInstall: true,
          regenerate: true,
          interactive: false,
        });
      });
    });
  });

  describe('imports a JDL entity model from single file in interactive mode by default', () => {
    const options = { skipInstall: true, databaseType: 'postgresql', baseName: 'jhipster' };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        const importJdl = await createImportJdl();
        await importJdl(['jdl.jdl'], options, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('passes entities to entities generator', () => {
      expect(subGenCallParams.entities).toEqual(['Region', 'Country', 'Location', 'Department', 'Task', 'Employee', 'Job', 'JobHistory']);
    });
    it('calls entities subgenerator', () => {
      expect(subGenCallParams.count).toEqual(1);
      expect(subGenCallParams.commands).toEqual(['jhipster:entities']);
      expect(subGenCallParams.options[0]).toEqual({
        ...options,
        ...defaultAddedOptions,
        fromJdl: true,
      });
    });
  });

  describe('imports a JDL entity model from multiple files', () => {
    const options = { skipInstall: true, databaseType: 'postgresql', baseName: 'jhipster' };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        const importJdl = await createImportJdl();
        await importJdl(['jdl.jdl', 'jdl2.jdl', 'jdl-ambiguous.jdl'], options, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('passes entities to entities generator', () => {
      expect(subGenCallParams.entities).toEqual([
        'Region',
        'Country',
        'Location',
        'Department',
        'Task',
        'Employee',
        'Job',
        'JobHistory',
        'DepartmentAlt',
        'JobHistoryAlt',
        'WishList',
        'Profile',
        'Listing',
      ]);
    });
    it('calls entities subgenerator', () => {
      expect(subGenCallParams.count).toEqual(1);
      expect(subGenCallParams.commands).toEqual(['jhipster:entities']);
      expect(subGenCallParams.options[0]).toEqual({
        ...options,
        ...defaultAddedOptions,
        fromJdl: true,
      });
    });
  });

  describe('imports a JDL entity model which excludes Elasticsearch for a class', () => {
    const options = { skipInstall: true };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        const importJdl = await createImportJdl();
        await importJdl(['search.jdl'], { ...options, interactive: false }, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('calls entities subgenerator', () => {
      expect(subGenCallParams.count).toEqual(1);
      expect(subGenCallParams.commands).toEqual(['jhipster:entities']);
      expect(subGenCallParams.options[0]).toEqual({
        ...options,
        ...defaultAddedOptions,
        fromJdl: true,
      });
    });
  });

  describe('imports single app and entities with --fork', () => {
    const options = { skipInstall: true, noInsight: true, skipGit: false };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        const importJdl = await createImportJdl();
        await importJdl(['single-app-and-entities.jdl'], { ...options }, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('calls application generator', () => {
      expect(subGenCallParams.count).toEqual(1);
      expect(subGenCallParams.commands).toEqual(['jhipster:app']);
      expect(subGenCallParams.options[0]).toEqual({
        reproducible: true,
        force: true,
        withEntities: true,
        skipInstall: true,
        noInsight: true,
        skipGit: false,
        fromJdl: true,
        applicationWithEntities: {
          config: expect.any(Object),
          entities: [expect.any(Object), expect.any(Object)],
        },
      });
    });
  });

  describe('imports single app and entities', () => {
    const options = { skipInstall: true, noInsight: true, skipGit: false, creationTimestamp: '2019-01-01' };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        const importJdl = await createImportJdl();
        await importJdl(['single-app-and-entities.jdl'], options, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('calls application generator', () => {
      expect(subGenCallParams.count).toEqual(1);
      expect(subGenCallParams.commands).toEqual(['jhipster:app']);
      expect(subGenCallParams.options[0].applicationWithEntities).not.toBeUndefined();
    });
    it('calls application generator with options', () => {
      expect({ ...subGenCallParams.options[0], applicationWithEntities: undefined }).toEqual({
        ...options,
        ...defaultAddedOptions,
        reproducible: true,
        withEntities: true,
        force: true,
        applicationWithEntities: undefined,
        fromJdl: true,
      });
    });
  });

  describe('imports single app and entities passed with --inline and --fork', () => {
    const options = {
      skipInstall: true,
      noInsight: true,
      skipGit: false,
      inline: 'application { config { baseName jhapp } entities * } entity Customer',
    };
    beforeEach(() => {
      return testInTempDir(async () => {
        const importJdl = await createImportJdl();
        await importJdl([], { ...options }, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('calls application generator', () => {
      expect(subGenCallParams.count).toEqual(1);
      expect(subGenCallParams.commands).toEqual(['jhipster:app']);
      expect(subGenCallParams.options[0]).toEqual({
        reproducible: true,
        force: true,
        withEntities: true,
        skipInstall: true,
        noInsight: true,
        skipGit: false,
        fromJdl: true,
        applicationWithEntities: expect.any(Object),
      });
    });
  });

  describe('imports single app and entities passed with --inline', () => {
    const options = {
      skipInstall: true,
      noInsight: true,
      skipGit: false,
    };
    beforeEach(() => {
      return testInTempDir(async () => {
        const importJdl = await createImportJdl();
        await importJdl([], { ...options, inline: 'application { config { baseName jhapp } entities * } entity Customer' }, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('calls application generator', () => {
      expect(subGenCallParams.count).toEqual(1);
      expect(subGenCallParams.commands).toEqual(['jhipster:app']);
      expect(subGenCallParams.options[0].applicationWithEntities).not.toBeUndefined();
      expect({ ...subGenCallParams.options[0], applicationWithEntities: undefined }).toEqual({
        ...options,
        ...defaultAddedOptions,
        reproducible: true,
        withEntities: true,
        force: true,
        fromJdl: true,
        applicationWithEntities: undefined,
      });
    });
  });

  describe('imports single app only with --fork', () => {
    const options = { skipInstall: true, noInsight: true, interactive: false, skipGit: false };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        const importJdl = await createImportJdl();
        await importJdl(['single-app-only.jdl'], { ...options }, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('calls application generator', () => {
      expect(subGenCallParams.count).toEqual(1);
      expect(subGenCallParams.commands).toEqual(['jhipster:app']);
      expect(subGenCallParams.options[0]).toEqual({
        reproducible: true,
        force: true,
        skipInstall: true,
        noInsight: true,
        skipGit: false,
        fromJdl: true,
        applicationWithEntities: expect.any(Object),
      });
    });
  });

  describe('imports single app only', () => {
    const options = { skipInstall: true, noInsight: true, skipGit: false };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        const importJdl = await createImportJdl();
        await importJdl(['single-app-only.jdl'], { ...options, interactive: false }, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('calls application generator', () => {
      expect(subGenCallParams.count).toEqual(1);
      expect(subGenCallParams.commands).toEqual(['jhipster:app']);
      expect(subGenCallParams.options[0].applicationWithEntities).not.toBeUndefined();
      expect({ ...subGenCallParams.options[0], applicationWithEntities: undefined }).toEqual({
        ...options,
        ...defaultAddedOptions,
        reproducible: true,
        force: true,
        applicationWithEntities: undefined,
        fromJdl: true,
      });
    });
  });

  describe('imports multiple JDL apps and entities', () => {
    const options = { skipInstall: true, noInsight: true, interactive: false, skipGit: false };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        const importJdl = await createImportJdl();
        await importJdl(['apps-and-entities.jdl'], options, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('calls application generator', () => {
      expect(subGenCallParams.count).toEqual(3);
      expect(subGenCallParams.commands).toEqual(['jhipster:app', 'jhipster:app', 'jhipster:app']);
      expect(subGenCallParams.options[0]).toEqual({
        reproducible: true,
        force: true,
        withEntities: true,
        skipInstall: true,
        noInsight: true,
        skipGit: false,
        fromJdl: true,
        applicationWithEntities: expect.any(Object),
      });
    });
  });

  describe('imports multiple JDL apps one with and one without entities', () => {
    const options = { skipInstall: true, noInsight: true, interactive: false, skipGit: false };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        const importJdl = await createImportJdl();
        await importJdl(['apps-with-and-without-entities.jdl'], options, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('calls application generator', () => {
      expect(subGenCallParams.count).toEqual(2);
      expect(subGenCallParams.commands).toEqual(['jhipster:app', 'jhipster:app']);
      expect(subGenCallParams.options[0]).toEqual({
        reproducible: true,
        force: true,
        withEntities: true,
        skipInstall: true,
        noInsight: true,
        skipGit: false,
        fromJdl: true,
        applicationWithEntities: expect.any(Object),
      });
    });
  });

  describe('skips JDL apps with --ignore-application', () => {
    const options = { skipInstall: true, ignoreApplication: true, skipGit: false };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        const importJdl = await createImportJdl();
        await importJdl(['apps-and-entities.jdl'], options, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('should not create the application config', () => {
      assert.noFile([
        path.join('myFirstApp', '.yo-rc.json'),
        path.join('mySecondApp', '.yo-rc.json'),
        path.join('myThirdApp', '.yo-rc.json'),
      ]);
    });
    it('does not call application generator', () => {
      expect(subGenCallParams.commands).toEqual(['jhipster:entities', 'jhipster:entities', 'jhipster:entities']);
      expect(subGenCallParams.count).toEqual(3);
      expect(subGenCallParams.options[0]).toEqual({ force: true, skipInstall: true, skipGit: false, fromJdl: true });
    });
  });

  describe('imports JDL deployments only', () => {
    const options = { skipInstall: true, interactive: false, skipGit: false };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        const importJdl = await createImportJdl();
        await importJdl(['deployments.jdl'], options, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('creates the deployments', () => {
      assert.file([
        path.join('docker-compose', '.yo-rc.json'),
        path.join('kubernetes', '.yo-rc.json'),
        path.join('openshift', '.yo-rc.json'),
      ]);
    });
    it('calls deployment generator', () => {
      const invokedSubgens = ['jhipster:docker-compose', 'jhipster:kubernetes', 'jhipster:openshift'];
      expect(subGenCallParams.commands).toEqual(invokedSubgens);
      expect(subGenCallParams.count).toEqual(invokedSubgens.length);
      expect(subGenCallParams.options[0]).toEqual({
        force: true,
        skipInstall: true,
        skipGit: false,
        fromJdl: true,
        skipPrompts: true,
      });
    });
  });

  describe('imports multiple JDL apps, deployments and entities', () => {
    describe('calls generators', () => {
      const options = { skipInstall: true, noInsight: true, interactive: false, skipGit: false };
      beforeEach(() => {
        return testInTempDir(async dir => {
          fse.copySync(getTemplatePath('import-jdl/common'), dir);
          fse.removeSync(`${dir}/.yo-rc.json`);
          const importJdl = await createImportJdl();
          await importJdl(['apps-and-entities-and-deployments.jdl'], options, env);
        });
      });

      afterEach(() => revertTempDir(originalCwd));

      it('calls generator in order', () => {
        expect(subGenCallParams.count).toEqual(5);
        expect(subGenCallParams.commands).toEqual([
          'jhipster:app',
          'jhipster:app',
          'jhipster:app',
          'jhipster:docker-compose',
          'jhipster:kubernetes',
        ]);
        expect(subGenCallParams.options[0]).toEqual({
          reproducible: true,
          force: true,
          withEntities: true,
          skipInstall: true,
          noInsight: true,
          skipGit: false,
          fromJdl: true,
          applicationWithEntities: {
            config: expect.any(Object),
            entities: [
              expect.objectContaining({ name: 'A' }),
              expect.objectContaining({ name: 'B' }),
              expect.objectContaining({ name: 'E' }),
              expect.objectContaining({ name: 'F' }),
            ],
          },
        });
        expect(subGenCallParams.options[1]).toEqual({
          reproducible: true,
          force: true,
          withEntities: true,
          skipInstall: true,
          noInsight: true,
          skipGit: false,
          fromJdl: true,
          applicationWithEntities: {
            config: expect.any(Object),
            entities: [expect.objectContaining({ name: 'E' })],
          },
        });
        expect(subGenCallParams.options[2]).toEqual({
          reproducible: true,
          force: true,
          withEntities: true,
          skipInstall: true,
          noInsight: true,
          skipGit: false,
          fromJdl: true,
          applicationWithEntities: {
            config: expect.any(Object),
            entities: [expect.objectContaining({ name: 'F' })],
          },
        });
        expect(subGenCallParams.options[3]).toEqual({
          force: true,
          skipInstall: true,
          skipGit: false,
          noInsight: true,
          fromJdl: true,
          skipPrompts: true,
        });
      });
    });
    describe('creates config files', () => {
      const options = { skipInstall: true };
      beforeEach(() => {
        return testInTempDir(async dir => {
          fse.copySync(getTemplatePath('import-jdl/common'), dir);
          fse.removeSync(`${dir}/.yo-rc.json`);
          const importJdl = await createImportJdl();
          await importJdl(['apps-and-entities-and-deployments.jdl'], options, env);
        });
      });

      afterEach(() => revertTempDir(originalCwd));

      it('creates the deployments', () => {
        assert.file([path.join('docker-compose', '.yo-rc.json'), path.join('kubernetes', '.yo-rc.json')]);
      });
    });
  });

  describe('skips JDL deployments with --ignore-deployments flag', () => {
    const options = { skipInstall: true, noInsight: true, ignoreDeployments: true, interactive: false, skipGit: false };
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        const importJdl = await createImportJdl();
        await importJdl(['apps-and-entities-and-deployments.jdl'], options, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('calls generator in order', () => {
      expect(subGenCallParams.count).toEqual(3);
      expect(subGenCallParams.commands).toEqual(['jhipster:app', 'jhipster:app', 'jhipster:app']);
      expect(subGenCallParams.options[0]).toEqual({
        reproducible: true,
        force: true,
        withEntities: true,
        skipInstall: true,
        noInsight: true,
        skipGit: false,
        fromJdl: true,
        applicationWithEntities: expect.any(Object),
      });
    });
  });

  describe('imports a JDL entity model with relations for mongodb', () => {
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/documents-with-relations'), dir);
        fse.copySync(getTemplatePath('import-jdl/mongodb-with-relations'), dir);
        const importJdl = await createImportJdl();
        await importJdl(['orders-model.jdl'], {}, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    testDocumentsRelationships();
  });

  describe('imports a JDL entity model with relations for couchbase', () => {
    beforeEach(() => {
      return testInTempDir(async dir => {
        fse.copySync(getTemplatePath('import-jdl/documents-with-relations'), dir);
        fse.copySync(getTemplatePath('import-jdl/couchbase-with-relations'), dir);
        const importJdl = await createImportJdl();
        await importJdl(['orders-model.jdl'], {}, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    testDocumentsRelationships();
  });
});
