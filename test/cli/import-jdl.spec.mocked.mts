import path from 'path';
import fse from 'fs-extra';
import chai, { expect } from 'chai';
import tdChai from 'testdouble-chai';
import assert from 'yeoman-assert';
import * as td from 'testdouble';
import Environment from 'yeoman-environment';

import { testInTempDir, revertTempDir } from './utils/utils.cjs';
import { getTemplatePath } from '../support/index.mjs';
import EnvironmentBuilder from '../../cli/environment-builder.mjs';

chai.use(tdChai(td));

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

async function loadImportJdl() {
  const childProcessForkToMock = await td.replaceEsm('child_process');
  const forkArgvCaptor = td.matchers.captor();
  td.when(childProcessForkToMock.fork(td.matchers.anything(), forkArgvCaptor.capture(), td.matchers.anything())).thenDo(() => {
    const command = forkArgvCaptor.value[0];
    const options = forkArgvCaptor.value.slice(1);
    pushCall(command, options);
    return {
      on(code, cb) {
        cb(0);
      },
    };
  });

  const envBuilderMockEsm = (await td.replaceEsm('../../cli/environment-builder.mjs')).default;
  const envBuilderMock = td.instance(EnvironmentBuilder);
  td.when(envBuilderMockEsm.createDefaultBuilder(td.matchers.anything(), td.matchers.anything())).thenReturn(envBuilderMock);

  td.when(envBuilderMock.getEnvironment()).thenReturn(env);
  return (await import('../../cli/import-jdl.mjs')).default;
}

const defaultAddedOptions = {};

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
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => {
      revertTempDir(originalCwd);
      td.reset();
    });

    it('calls generator in order', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['apps-and-entities-and-deployments.jdl'], options, env).then(() => {
          console.info(JSON.stringify(subGenCallParams));
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
          done();
        });
      });
    });
  });

  describe('imports a JDL entity model from single file with --json-only flag', () => {
    const options = { jsonOnly: true, skipInstall: true, databaseType: 'postgresql', baseName: 'jhipster' };
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('creates entity json files', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        moduleToTest(['jdl.jdl'], options, env).then(() => {
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
          done();
        });
      });
    });
    it('does not call entity sub generator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        moduleToTest(['jdl.jdl'], options, env).then(() => {
          expect(subGenCallParams.count).to.equal(0);
          done();
        });
      });
    });
  });

  describe('imports a JDL entity model from single file with --skip-db-changelog', () => {
    const options = { skipDbChangelog: true, databaseType: 'postgresql', baseName: 'jhipster' };
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('passes entities to entities generator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        moduleToTest(['jdl.jdl'], options, env).then(() => {
          expect(subGenCallParams.entities).to.eql([
            'Region',
            'Country',
            'Location',
            'Department',
            'Task',
            'Employee',
            'Job',
            'JobHistory',
          ]);
        });
        done();
      });
    });
    it('calls entity subgenerator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        moduleToTest(['jdl.jdl'], options, env).then(() => {
          expect(subGenCallParams.count).to.equal(1);
          expect(subGenCallParams.commands).to.eql(['jhipster:entities']);
          done();
        });
      });
    });

    it('calls entity subgenerator with correct options', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        moduleToTest(['jdl.jdl'], options, env).then(() => {
          subGenCallParams.options.slice(0, subGenCallParams.options.length - 1).forEach(subGenOptions => {
            expect(subGenOptions).to.eql({
              ...options,
              ...defaultAddedOptions,
              skipInstall: true,
              regenerate: true,
              interactive: false,
            });
          });
          done();
        });
      });
    });
  });

  describe('imports a JDL entity model from single file in interactive mode by default', () => {
    const options = { skipInstall: true, databaseType: 'postgresql', baseName: 'jhipster' };
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('passes entities to entities generator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        moduleToTest(['jdl.jdl'], options, env).then(() => {
          expect(subGenCallParams.entities).to.eql([
            'Region',
            'Country',
            'Location',
            'Department',
            'Task',
            'Employee',
            'Job',
            'JobHistory',
          ]);
          done();
        });
      });
    });
    it('calls entities subgenerator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        moduleToTest(['jdl.jdl'], options, env).then(() => {
          expect(subGenCallParams.count).to.equal(1);
          expect(subGenCallParams.commands).to.eql(['jhipster:entities']);
          expect(subGenCallParams.options[0]).to.eql({
            ...options,
            ...defaultAddedOptions,
            fromJdl: true,
          });
          done();
        });
      });
    });
  });

  describe('imports a JDL entity model from multiple files', () => {
    const options = { skipInstall: true, databaseType: 'postgresql', baseName: 'jhipster' };
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('passes entities to entities generator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        moduleToTest(['jdl.jdl', 'jdl2.jdl', 'jdl-ambiguous.jdl'], options, env).then(() => {
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
          done();
        });
      });
    });
    it('calls entities subgenerator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        moduleToTest(['jdl.jdl', 'jdl2.jdl', 'jdl-ambiguous.jdl'], options, env).then(() => {
          expect(subGenCallParams.count).to.equal(1);
          expect(subGenCallParams.commands).to.eql(['jhipster:entities']);
          expect(subGenCallParams.options[0]).to.eql({
            ...options,
            ...defaultAddedOptions,
            fromJdl: true,
          });
          done();
        });
      });
    });
  });

  describe('imports a JDL entity model which excludes Elasticsearch for a class', () => {
    const options = { skipInstall: true };
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('should not create entity json files', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        moduleToTest(['search.jdl'], { ...options, interactive: false }, env).then(() => {
          assert.noFile(['.jhipster/WithSearch.json', '.jhipster/WithoutSearch.json']);
          done();
        });
      });
    });

    it('calls entities subgenerator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        moduleToTest(['search.jdl'], { ...options, interactive: false }, env).then(() => {
          expect(subGenCallParams.count).to.equal(1);
          expect(subGenCallParams.commands).to.eql(['jhipster:entities']);
          expect(subGenCallParams.options[0]).to.eql({
            ...options,
            ...defaultAddedOptions,
            fromJdl: true,
          });
          done();
        });
      });
    });
  });

  describe('imports single app and entities with --fork', () => {
    const options = { skipInstall: true, noInsight: true, skipGit: false };
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('creates the application', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['single-app-and-entities.jdl'], { ...options, fork: true }, env).then(() => {
          assert.file(['.yo-rc.json']);
          assert.JSONFileContent('.yo-rc.json', {
            'generator-jhipster': { baseName: 'jhipsterApp' },
          });
          done();
        });
      });
    });
    it('creates the entities', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['single-app-and-entities.jdl'], { ...options, fork: true }, env).then(() => {
          const aFile = path.join('.jhipster', 'A.json');
          assert.file([aFile, path.join('.jhipster', 'B.json')]);
          done();
        });
      });
    });
    it('calls application generator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['single-app-and-entities.jdl'], { ...options, fork: true }, env).then(() => {
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
          done();
        });
      });
    });
  });

  describe('imports single app and entities', () => {
    const options = { skipInstall: true, noInsight: true, skipGit: false, creationTimestamp: '2019-01-01' };
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('should not create .yo-rc.json', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['single-app-and-entities.jdl'], options, env).then(() => {
          assert.noFile(['.yo-rc.json']);
          done();
        });
      });
    });
    it('should not create entity files', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['single-app-and-entities.jdl'], options, env).then(() => {
          const aFile = path.join('.jhipster', 'A.json');
          assert.noFile([aFile, path.join('.jhipster', 'B.json')]);
          done();
        });
      });
    });
    it('calls application generator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['single-app-and-entities.jdl'], options, env).then(() => {
          expect(subGenCallParams.count).to.equal(1);
          expect(subGenCallParams.commands).to.eql(['jhipster:app']);
          expect(subGenCallParams.options[0].applicationWithEntities).to.not.be.undefined;
          done();
        });
      });
    });
    it('calls application generator with options', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['single-app-and-entities.jdl'], options, env).then(() => {
          expect({ ...subGenCallParams.options[0], applicationWithEntities: undefined }).to.eql({
            ...options,
            ...defaultAddedOptions,
            reproducible: true,
            withEntities: true,
            force: true,
            applicationWithEntities: undefined,
            fromJdl: true,
          });
          done();
        });
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
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('creates the application', done => {
      testInTempDir(dir => {
        moduleToTest([], { ...options, fork: true }, env).then(() => {
          assert.file(['.yo-rc.json']);
          done();
        });
      });
    });
    it('creates the entities', done => {
      testInTempDir(dir => {
        moduleToTest([], { ...options, fork: true }, env).then(() => {
          assert.file([path.join('.jhipster', 'Customer.json')]);
          done();
        });
      });
    });
    it('calls application generator', done => {
      testInTempDir(dir => {
        moduleToTest([], { ...options, fork: true }, env).then(() => {
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
          done();
        });
      });
    });
  });

  describe('imports single app and entities passed with --inline', () => {
    const options = {
      skipInstall: true,
      noInsight: true,
      skipGit: false,
    };
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('should not create .yo-rc.json', done => {
      testInTempDir(dir => {
        moduleToTest(
          [],
          {
            ...options,
            inline: 'application { config { baseName jhapp } entities * } entity Customer',
          },
          env
        ).then(() => {
          assert.noFile(['.yo-rc.json']);
          done();
        });
      });
    });
    it('should not create entity files', done => {
      testInTempDir(dir => {
        moduleToTest(
          [],
          {
            ...options,
            inline: 'application { config { baseName jhapp } entities * } entity Customer',
          },
          env
        ).then(() => {
          assert.noFile([path.join('.jhipster', 'Customer.json')]);
          done();
        });
      });
    });
    it('calls application generator', done => {
      testInTempDir(dir => {
        moduleToTest(
          [],
          {
            ...options,
            inline: 'application { config { baseName jhapp } entities * } entity Customer',
          },
          env
        ).then(() => {
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
          done();
        });
      });
    });
  });

  describe('imports single app only with --fork', () => {
    const options = { skipInstall: true, noInsight: true, interactive: false, skipGit: false };
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('creates the application', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['single-app-only.jdl'], { ...options, fork: true }, env).then(() => {
          assert.file(['.yo-rc.json']);
          done();
        });
      });
    });
    it('calls application generator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['single-app-only.jdl'], { ...options, fork: true }, env).then(() => {
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
          done();
        });
      });
    });
  });

  describe('imports single app only', () => {
    const options = { skipInstall: true, noInsight: true, skipGit: false };
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('should not create .yo-rc.json', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['single-app-only.jdl'], { ...options, interactive: false }, env).then(() => {
          assert.noFile(['.yo-rc.json']);
          done();
        });
      });
    });
    it('calls application generator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['single-app-only.jdl'], { ...options, interactive: false }, env).then(() => {
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
          done();
        });
      });
    });
  });

  describe('imports multiple JDL apps and entities', () => {
    const options = { skipInstall: true, noInsight: true, interactive: false, skipGit: false };

    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('creates the applications', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['apps-and-entities.jdl'], options, env).then(() => {
          assert.file([
            path.join('myFirstApp', '.yo-rc.json'),
            path.join('mySecondApp', '.yo-rc.json'),
            path.join('myThirdApp', '.yo-rc.json'),
          ]);
          done();
        });
      });
    });
    it('creates the entities', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['apps-and-entities.jdl'], options, env).then(() => {
          assert.file([
            path.join('myFirstApp', '.jhipster', 'A.json'),
            path.join('myFirstApp', '.jhipster', 'B.json'),
            path.join('myFirstApp', '.jhipster', 'E.json'),
            path.join('myFirstApp', '.jhipster', 'F.json'),
            path.join('mySecondApp', '.jhipster', 'E.json'),
            path.join('myThirdApp', '.jhipster', 'F.json'),
          ]);
          done();
        });
      });
    });
    it('calls application generator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['apps-and-entities.jdl'], options, env).then(() => {
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
          done();
        });
      });
    });
  });

  describe('imports multiple JDL apps one with and one without entities', () => {
    const options = { skipInstall: true, noInsight: true, interactive: false, skipGit: false };
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('creates the applications', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['apps-with-and-without-entities.jdl'], options, env).then(() => {
          assert.file([path.join('app1', '.yo-rc.json'), path.join('app2', '.yo-rc.json')]);
          done();
        });
      });
    });
    it('creates the entities in one app only', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['apps-with-and-without-entities.jdl'], options, env).then(() => {
          assert.noFile([path.join('app1', '.jhipster', 'BankAccount.json')]);
          assert.file([path.join('app2', '.jhipster', 'BankAccount.json')]);
          done();
        });
      });
    });
    it('calls application generator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['apps-with-and-without-entities.jdl'], options, env).then(() => {
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
          done();
        });
      });
    });
  });

  describe('skips JDL apps with --ignore-application', () => {
    const options = { skipInstall: true, ignoreApplication: true, fork: true, skipGit: false };
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('should not create the application config', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['apps-and-entities.jdl'], options, env).then(() => {
          assert.noFile([
            path.join('myFirstApp', '.yo-rc.json'),
            path.join('mySecondApp', '.yo-rc.json'),
            path.join('myThirdApp', '.yo-rc.json'),
          ]);
          done();
        });
      });
    });
    it('creates the entities', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['apps-and-entities.jdl'], options, env).then(() => {
          assert.file([
            path.join('myFirstApp', '.jhipster', 'A.json'),
            path.join('myFirstApp', '.jhipster', 'B.json'),
            path.join('myFirstApp', '.jhipster', 'E.json'),
            path.join('myFirstApp', '.jhipster', 'F.json'),
            path.join('mySecondApp', '.jhipster', 'E.json'),
            path.join('myThirdApp', '.jhipster', 'F.json'),
          ]);
          done();
        });
      });
    });
    it('does not call application generator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        fse.removeSync(`${dir}/.yo-rc.json`);
        moduleToTest(['apps-and-entities.jdl'], options, env).then(() => {
          expect(subGenCallParams.count).to.equal(3);
          expect(subGenCallParams.commands).to.eql(['entities', 'entities', 'entities']);
          expect(subGenCallParams.options[0]).to.eql(['--force', '--skip-install', '--no-skip-git', '--from-jdl']);
          done();
        });
      });
    });
  });

  describe('imports JDL deployments only', () => {
    const options = { skipInstall: true, interactive: false, skipGit: false };
    let moduleToTest;
    beforeEach(async () => {
      moduleToTest = await loadImportJdl();
    });

    afterEach(() => revertTempDir(originalCwd));

    it('creates the deployments', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        moduleToTest(['deployments.jdl'], options, env).then(() => {
          assert.file([
            path.join('docker-compose', '.yo-rc.json'),
            path.join('kubernetes', '.yo-rc.json'),
            path.join('openshift', '.yo-rc.json'),
          ]);
          done();
        });
      });
    });
    it('calls deployment generator', done => {
      testInTempDir(dir => {
        fse.copySync(getTemplatePath('import-jdl/common'), dir);
        moduleToTest(['deployments.jdl'], options, env).then(() => {
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
          done();
        });
      });
    });
  });

  describe('imports multiple JDL apps, deployments and entities', () => {
    describe('calls generators', () => {
      let moduleToTest;
      beforeEach(async () => {
        moduleToTest = await loadImportJdl();
      });

      const options = { skipInstall: true, noInsight: true, interactive: false, skipGit: false };

      afterEach(() => revertTempDir(originalCwd));

      it('calls generator in order', done => {
        testInTempDir(dir => {
          fse.copySync(getTemplatePath('import-jdl/common'), dir);
          fse.removeSync(`${dir}/.yo-rc.json`);
          moduleToTest(['apps-and-entities-and-deployments.jdl'], options, env).then(() => {
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
            done();
          });
        });
      });
      describe('creates config files', () => {
        const options = { skipInstall: true };
        let moduleToTest;
        beforeEach(async () => {
          moduleToTest = await loadImportJdl();
        });

        afterEach(() => revertTempDir(originalCwd));

        it('creates the applications', done => {
          testInTempDir(dir => {
            fse.copySync(getTemplatePath('import-jdl/common'), dir);
            fse.removeSync(`${dir}/.yo-rc.json`);
            moduleToTest(['apps-and-entities-and-deployments.jdl'], options, env).then(() => {
              assert.file([
                path.join('myFirstApp', '.yo-rc.json'),
                path.join('mySecondApp', '.yo-rc.json'),
                path.join('myThirdApp', '.yo-rc.json'),
              ]);
              done();
            });
          });
        });
        it('creates the entities', done => {
          testInTempDir(dir => {
            fse.copySync(getTemplatePath('import-jdl/common'), dir);
            fse.removeSync(`${dir}/.yo-rc.json`);
            moduleToTest(['apps-and-entities-and-deployments.jdl'], options, env).then(() => {
              assert.file([
                path.join('myFirstApp', '.jhipster', 'A.json'),
                path.join('myFirstApp', '.jhipster', 'B.json'),
                path.join('myFirstApp', '.jhipster', 'E.json'),
                path.join('myFirstApp', '.jhipster', 'F.json'),
                path.join('mySecondApp', '.jhipster', 'E.json'),
                path.join('myThirdApp', '.jhipster', 'F.json'),
              ]);
              done();
            });
          });
        });
        it('creates the deployments', done => {
          testInTempDir(dir => {
            fse.copySync(getTemplatePath('import-jdl/common'), dir);
            fse.removeSync(`${dir}/.yo-rc.json`);
            moduleToTest(['apps-and-entities-and-deployments.jdl'], options, env).then(() => {
              assert.file([path.join('docker-compose', '.yo-rc.json'), path.join('kubernetes', '.yo-rc.json')]);
              done();
            });
          });
        });
      });
    });

    describe('skips JDL deployments with --ignore-deployments flag', () => {
      const options = {
        skipInstall: true,
        noInsight: true,
        ignoreDeployments: true,
        interactive: false,
        skipGit: false,
      };
      let moduleToTest;
      beforeEach(async () => {
        moduleToTest = await loadImportJdl();
      });

      afterEach(() => revertTempDir(originalCwd));

      it('calls generator in order', done => {
        testInTempDir(dir => {
          fse.copySync(getTemplatePath('import-jdl/common'), dir);
          fse.removeSync(`${dir}/.yo-rc.json`);
          return moduleToTest(['apps-and-entities-and-deployments.jdl'], options, env).then(() => {
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
            done();
          });
        });
      });
    });

    describe('imports a JDL entity model with relations for mongodb', () => {
      let moduleToTest;
      beforeEach(async () => {
        moduleToTest = await loadImportJdl();
      });

      afterEach(() => revertTempDir(originalCwd));

      it('creates entity json files', done => {
        testInTempDir(dir => {
          fse.copySync(getTemplatePath('import-jdl/documents-with-relations'), dir);
          fse.copySync(getTemplatePath('import-jdl/mongodb-with-relations'), dir);
          moduleToTest(['orders-model.jdl'], {}, env).then(() => {
            expect(subGenCallParams.entities).to.eql(['Customer', 'CustomerOrder', 'OrderedItem', 'PaymentDetails', 'ShippingDetails']);
            done();
          });
        });
      });

      it('calls entity subgenerator', done => {
        testInTempDir(dir => {
          fse.copySync(getTemplatePath('import-jdl/documents-with-relations'), dir);
          fse.copySync(getTemplatePath('import-jdl/mongodb-with-relations'), dir);
          moduleToTest(['orders-model.jdl'], {}, env).then(() => {
            expect(subGenCallParams.count).to.equal(1);
            expect(subGenCallParams.commands).to.eql(['jhipster:entities']);
            expect(subGenCallParams.options[0]).to.eql({
              ...defaultAddedOptions,
              fromJdl: true,
            });
            done();
          });
        });
      });
    });

    describe('imports a JDL entity model with relations for couchbase', () => {
      let moduleToTest;
      beforeEach(async () => {
        moduleToTest = await loadImportJdl();
      });

      afterEach(() => revertTempDir(originalCwd));
      it('creates entity json files', done => {
        testInTempDir(dir => {
          fse.copySync(getTemplatePath('import-jdl/documents-with-relations'), dir);
          fse.copySync(getTemplatePath('import-jdl/couchbase-with-relations'), dir);
          moduleToTest(['orders-model.jdl'], {}, env).then(() => {
            expect(subGenCallParams.entities).to.eql(['Customer', 'CustomerOrder', 'OrderedItem', 'PaymentDetails', 'ShippingDetails']);
            done();
          });
        });
      });
      it('calls entity subgenerator', done => {
        testInTempDir(dir => {
          fse.copySync(getTemplatePath('import-jdl/documents-with-relations'), dir);
          fse.copySync(getTemplatePath('import-jdl/couchbase-with-relations'), dir);
          moduleToTest(['orders-model.jdl'], {}, env).then(() => {
            expect(subGenCallParams.count).to.equal(1);
            expect(subGenCallParams.commands).to.eql(['jhipster:entities']);
            expect(subGenCallParams.options[0]).to.eql({
              ...defaultAddedOptions,
              fromJdl: true,
            });
            done();
          });
        });
      });
    });
  });
});
