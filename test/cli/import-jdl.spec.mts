import { mock } from '@node-loaders/mock';
import path from 'path';
import fse from 'fs-extra';
import assert from 'yeoman-assert';
import { expect } from 'chai';
import * as utils from '../../cli/utils.mjs';

import { getTemplatePath, testInTempDir, revertTempDir } from './utils/utils.cjs';

let subGenCallParams = {
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

const createImportJdl = async (options?) => {
  options = {
    './utils.mjs': {
      ...utils,
      logger: {
        ...utils.logger,
        info: () => {},
      },
      printSuccess: () => {},
    },
    child_process: {
      fork: (runYeomanProcess, argv, opts) => {
        const command = argv[0];
        const options = argv.slice(1);
        pushCall(command, options);
        return {
          on(code, cb) {
            cb(0);
          },
        };
      },
    },
    './environment-builder.mjs': {
      default: {
        createDefaultBuilder: async () => {
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
        },
      },
    },
    ...options,
  };
  const importJdl = (await mock('../../cli/import-jdl.mjs', options)).default;
  return importJdl;
};

const defaultAddedOptions = {};

function testDocumentsRelationships() {
  it('creates entity json files', () => {
    expect(subGenCallParams.entities).to.eql(['Customer', 'CustomerOrder', 'OrderedItem', 'PaymentDetails', 'ShippingDetails']);
  });
  it('calls entity subgenerator', () => {
    expect(subGenCallParams.count).to.equal(1);
    expect(subGenCallParams.commands).to.eql(['jhipster:entities']);
    expect(subGenCallParams.options[0]).to.eql({
      ...defaultAddedOptions,
      fromJdl: true,
    });
  });
}

describe('JHipster generator import jdl', () => {
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
      expect(subGenCallParams.count).to.equal(5);
      expect(subGenCallParams.commands).to.eql(['app', 'app', 'app', 'jhipster:docker-compose', 'jhipster:kubernetes']);
      expect(subGenCallParams.options[0]).to.eql([
        '--reproducible',
        '--force',
        '--with-entities',
        '--skip-install',
        '--no-insight',
        '--from-jdl',
      ]);
      expect(subGenCallParams.options[3]).to.eql({
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
      expect(subGenCallParams.count).to.equal(0);
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
      expect(subGenCallParams.entities).to.eql(['Region', 'Country', 'Location', 'Department', 'Task', 'Employee', 'Job', 'JobHistory']);
    });
    it('calls entity subgenerator', () => {
      expect(subGenCallParams.count).to.equal(1);
      expect(subGenCallParams.commands).to.eql(['jhipster:entities']);
    });

    it('calls entity subgenerator with correct options', () => {
      subGenCallParams.options.slice(0, subGenCallParams.options.length - 1).forEach(subGenOptions => {
        expect(subGenOptions).to.eql({
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
      expect(subGenCallParams.entities).to.eql(['Region', 'Country', 'Location', 'Department', 'Task', 'Employee', 'Job', 'JobHistory']);
    });
    it('calls entities subgenerator', () => {
      expect(subGenCallParams.count).to.equal(1);
      expect(subGenCallParams.commands).to.eql(['jhipster:entities']);
      expect(subGenCallParams.options[0]).to.eql({
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
      expect(subGenCallParams.entities).to.eql([
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
      expect(subGenCallParams.count).to.equal(1);
      expect(subGenCallParams.commands).to.eql(['jhipster:entities']);
      expect(subGenCallParams.options[0]).to.eql({
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

    it('should not create entity json files', () => {
      assert.noFile(['.jhipster/WithSearch.json', '.jhipster/WithoutSearch.json']);
    });
    it('calls entities subgenerator', () => {
      expect(subGenCallParams.count).to.equal(1);
      expect(subGenCallParams.commands).to.eql(['jhipster:entities']);
      expect(subGenCallParams.options[0]).to.eql({
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
        await importJdl(['single-app-and-entities.jdl'], { ...options, fork: true }, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('creates the application', () => {
      assert.file(['.yo-rc.json']);
      assert.JSONFileContent('.yo-rc.json', {
        'generator-jhipster': { baseName: 'jhipsterApp' },
      });
    });
    it('creates the entities', () => {
      const aFile = path.join('.jhipster', 'A.json');
      assert.file([aFile, path.join('.jhipster', 'B.json')]);
    });
    it('calls application generator', () => {
      expect(subGenCallParams.count).to.equal(1);
      expect(subGenCallParams.commands).to.eql(['app']);
      expect(subGenCallParams.options[0]).to.eql([
        '--reproducible',
        '--force',
        '--with-entities',
        '--skip-install',
        '--no-insight',
        '--no-skip-git',
        '--from-jdl',
      ]);
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

    it('should not create .yo-rc.json', () => {
      assert.noFile(['.yo-rc.json']);
    });
    it('should not create entity files', () => {
      const aFile = path.join('.jhipster', 'A.json');
      assert.noFile([aFile, path.join('.jhipster', 'B.json')]);
    });
    it('calls application generator', () => {
      expect(subGenCallParams.count).to.equal(1);
      expect(subGenCallParams.commands).to.eql(['jhipster:app']);
      expect(subGenCallParams.options[0].applicationWithEntities).to.not.be.undefined;
    });
    it('calls application generator with options', () => {
      expect({ ...subGenCallParams.options[0], applicationWithEntities: undefined }).to.eql({
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
        await importJdl([], { ...options, fork: true }, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('creates the application', () => {
      assert.file(['.yo-rc.json']);
    });
    it('creates the entities', () => {
      assert.file([path.join('.jhipster', 'Customer.json')]);
    });
    it('calls application generator', () => {
      expect(subGenCallParams.count).to.equal(1);
      expect(subGenCallParams.commands).to.eql(['app']);
      expect(subGenCallParams.options[0]).to.eql([
        '--reproducible',
        '--force',
        '--with-entities',
        '--skip-install',
        '--no-insight',
        '--no-skip-git',
        '--from-jdl',
      ]);
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

    it('should not create .yo-rc.json', () => {
      assert.noFile(['.yo-rc.json']);
    });
    it('should not create entity files', () => {
      assert.noFile([path.join('.jhipster', 'Customer.json')]);
    });
    it('calls application generator', () => {
      expect(subGenCallParams.count).to.equal(1);
      expect(subGenCallParams.commands).to.eql(['jhipster:app']);
      expect(subGenCallParams.options[0].applicationWithEntities).to.not.be.undefined;
      expect({ ...subGenCallParams.options[0], applicationWithEntities: undefined }).to.eql({
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
        await importJdl(['single-app-only.jdl'], { ...options, fork: true }, env);
      });
    });

    afterEach(() => revertTempDir(originalCwd));

    it('creates the application', () => {
      assert.file(['.yo-rc.json']);
    });
    it('calls application generator', () => {
      expect(subGenCallParams.count).to.equal(1);
      expect(subGenCallParams.commands).to.eql(['app']);
      expect(subGenCallParams.options[0]).to.eql([
        '--reproducible',
        '--force',
        '--skip-install',
        '--no-insight',
        '--no-skip-git',
        '--from-jdl',
      ]);
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

    it('should not create .yo-rc.json', () => {
      assert.noFile(['.yo-rc.json']);
    });
    it('calls application generator', () => {
      expect(subGenCallParams.count).to.equal(1);
      expect(subGenCallParams.commands).to.eql(['jhipster:app']);
      expect(subGenCallParams.options[0].applicationWithEntities).to.not.be.undefined;
      expect({ ...subGenCallParams.options[0], applicationWithEntities: undefined }).to.eql({
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

    it('creates the applications', () => {
      assert.file([
        path.join('myFirstApp', '.yo-rc.json'),
        path.join('mySecondApp', '.yo-rc.json'),
        path.join('myThirdApp', '.yo-rc.json'),
      ]);
    });
    it('creates the entities', () => {
      assert.file([
        path.join('myFirstApp', '.jhipster', 'A.json'),
        path.join('myFirstApp', '.jhipster', 'B.json'),
        path.join('myFirstApp', '.jhipster', 'E.json'),
        path.join('myFirstApp', '.jhipster', 'F.json'),
        path.join('mySecondApp', '.jhipster', 'E.json'),
        path.join('myThirdApp', '.jhipster', 'F.json'),
      ]);
    });
    it('calls application generator', () => {
      expect(subGenCallParams.count).to.equal(3);
      expect(subGenCallParams.commands).to.eql(['app', 'app', 'app']);
      expect(subGenCallParams.options[0]).to.eql([
        '--reproducible',
        '--force',
        '--with-entities',
        '--skip-install',
        '--no-insight',
        '--no-skip-git',
        '--from-jdl',
      ]);
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

    it('creates the applications', () => {
      assert.file([path.join('app1', '.yo-rc.json'), path.join('app2', '.yo-rc.json')]);
    });
    it('creates the entities in one app only', () => {
      assert.noFile([path.join('app1', '.jhipster', 'BankAccount.json')]);
      assert.file([path.join('app2', '.jhipster', 'BankAccount.json')]);
    });
    it('calls application generator', () => {
      expect(subGenCallParams.count).to.equal(2);
      expect(subGenCallParams.commands).to.eql(['app', 'app']);
      expect(subGenCallParams.options[0]).to.eql([
        '--reproducible',
        '--force',
        '--with-entities',
        '--skip-install',
        '--no-insight',
        '--no-skip-git',
        '--from-jdl',
      ]);
    });
  });

  describe('skips JDL apps with --ignore-application', () => {
    const options = { skipInstall: true, ignoreApplication: true, fork: true, skipGit: false };
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
    it('creates the entities', () => {
      assert.file([
        path.join('myFirstApp', '.jhipster', 'A.json'),
        path.join('myFirstApp', '.jhipster', 'B.json'),
        path.join('myFirstApp', '.jhipster', 'E.json'),
        path.join('myFirstApp', '.jhipster', 'F.json'),
        path.join('mySecondApp', '.jhipster', 'E.json'),
        path.join('myThirdApp', '.jhipster', 'F.json'),
      ]);
    });
    it('does not call application generator', () => {
      expect(subGenCallParams.count).to.equal(3);
      expect(subGenCallParams.commands).to.eql(['entities', 'entities', 'entities']);
      expect(subGenCallParams.options[0]).to.eql(['--force', '--skip-install', '--no-skip-git', '--from-jdl']);
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
      expect(subGenCallParams.commands).to.eql(invokedSubgens);
      expect(subGenCallParams.count).to.equal(invokedSubgens.length);
      expect(subGenCallParams.options[0]).to.eql({
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
        expect(subGenCallParams.count).to.equal(5);
        expect(subGenCallParams.commands).to.eql(['app', 'app', 'app', 'jhipster:docker-compose', 'jhipster:kubernetes']);
        expect(subGenCallParams.options[0]).to.eql([
          '--reproducible',
          '--force',
          '--with-entities',
          '--skip-install',
          '--no-insight',
          '--no-skip-git',
          '--from-jdl',
        ]);
        expect(subGenCallParams.options[3]).to.eql({
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

      it('creates the applications', () => {
        assert.file([
          path.join('myFirstApp', '.yo-rc.json'),
          path.join('mySecondApp', '.yo-rc.json'),
          path.join('myThirdApp', '.yo-rc.json'),
        ]);
      });
      it('creates the entities', () => {
        assert.file([
          path.join('myFirstApp', '.jhipster', 'A.json'),
          path.join('myFirstApp', '.jhipster', 'B.json'),
          path.join('myFirstApp', '.jhipster', 'E.json'),
          path.join('myFirstApp', '.jhipster', 'F.json'),
          path.join('mySecondApp', '.jhipster', 'E.json'),
          path.join('myThirdApp', '.jhipster', 'F.json'),
        ]);
      });
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
      expect(subGenCallParams.count).to.equal(3);
      expect(subGenCallParams.commands).to.eql(['app', 'app', 'app']);
      expect(subGenCallParams.options[0]).to.eql([
        '--reproducible',
        '--force',
        '--with-entities',
        '--skip-install',
        '--no-insight',
        '--no-skip-git',
        '--from-jdl',
      ]);
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
