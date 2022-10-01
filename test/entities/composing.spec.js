const fse = require('fs-extra');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { JHIPSTER_CONFIG_DIR } = require('../../generators/generator-constants');
const { appDefaultConfig, serverDefaultConfig } = require('../../generators/generator-defaults');

const mockedComposedGenerators = ['jhipster:entity-client', 'jhipster:entity-server', 'jhipster:database-changelog'];

describe('jhipster:entities with entitiesToImport option', () => {
  const localConfig = { baseName: 'jhipster', ...appDefaultConfig, ...serverDefaultConfig };
  describe('with --with-entities', () => {
    describe('and single entity', () => {
      let runResult;
      before(() => {
        return helpers
          .create(require.resolve('../../generators/entities'))
          .withOptions({
            localConfig,
            entitiesToImport: [{ name: 'Foo' }],
            fromCli: true,
            skipInstall: true,
            defaults: true,
            withEntities: true,
          })
          .withMockedGenerators(mockedComposedGenerators)
          .run()
          .then(result => {
            runResult = result;
          });
      });

      after(() => runResult.cleanup());

      it('writes .yo-rc.json', () => {
        runResult.assertFile('.yo-rc.json');
        runResult.assertFileContent('.yo-rc.json', /"baseName": "jhipster"/);
      });
      it('writes entity config file', () => {
        runResult.assertFile('.jhipster/Foo.json');
        runResult.assertFileContent('.jhipster/Foo.json', /"name": "Foo"/);
      });
      it('should compose with entity-client generator', () => {
        const EntityGenerator = runResult.mockedGenerators['jhipster:entity-client'];
        assert(EntityGenerator.calledOnce);
        assert.equal(EntityGenerator.getCall(0).args[0], 'Foo');
      });
      it('should compose with entity-server generator', () => {
        const EntityGenerator = runResult.mockedGenerators['jhipster:entity-server'];
        assert(EntityGenerator.calledOnce);
        assert.equal(EntityGenerator.getCall(0).args[0], 'Foo');
      });
    });

    describe('and 2 entities', () => {
      let runResult;
      before(() => {
        return helpers
          .create(require.resolve('../../generators/entities'))
          .withOptions({
            localConfig,
            entitiesToImport: [{ name: 'Foo' }, { name: 'Bar' }],
            fromCli: true,
            skipInstall: true,
            defaults: true,
            withEntities: true,
          })
          .withMockedGenerators(mockedComposedGenerators)
          .run()
          .then(result => {
            runResult = result;
          });
      });

      after(() => runResult.cleanup());

      it('writes .yo-rc.json', () => {
        runResult.assertFile('.yo-rc.json');
        runResult.assertFileContent('.yo-rc.json', /"baseName": "jhipster"/);
      });
      it('writes entity config file', () => {
        runResult.assertFile('.jhipster/Foo.json');
        runResult.assertFileContent('.jhipster/Foo.json', /"name": "Foo"/);
        runResult.assertFile('.jhipster/Bar.json');
        runResult.assertFileContent('.jhipster/Bar.json', /"name": "Bar"/);
      });
      it('should compose with entity-client generator', () => {
        const EntityGenerator = runResult.mockedGenerators['jhipster:entity-client'];
        assert.equal(EntityGenerator.callCount, 2);
        assert.equal(EntityGenerator.getCall(0).args[0], 'Foo');
        assert.equal(EntityGenerator.getCall(1).args[0], 'Bar');
      });
      it('should compose with database-changelog generator', () => {
        const EntityGenerator = runResult.mockedGenerators['jhipster:database-changelog'];
        assert.equal(EntityGenerator.callCount, 1);
        assert.deepStrictEqual(EntityGenerator.getCall(0).args[0], ['Foo', 'Bar']);
      });
    });

    describe('and 1 entity and 1 entity file', () => {
      let runResult;
      before(() => {
        return helpers
          .create(require.resolve('../../generators/entities'))
          .withOptions({
            localConfig,
            entitiesToImport: [{ name: 'Foo', changelogDate: '20201012010501' }],
            fromCli: true,
            skipInstall: true,
            defaults: true,
            withEntities: true,
          })
          .doInDir(dir => {
            const entitiesPath = path.join(dir, JHIPSTER_CONFIG_DIR);
            fse.ensureDirSync(entitiesPath);
            const entityPath = path.join(entitiesPath, 'Bar.json');
            fse.writeFileSync(entityPath, '{"changelogDate": "20201012010502"}');
          })
          .withMockedGenerators(mockedComposedGenerators)
          .run()
          .then(result => {
            runResult = result;
          });
      });

      after(() => runResult.cleanup());

      it('should compose with mocked entity-client generator ordered by changelogDate', () => {
        const EntityGenerator = runResult.mockedGenerators['jhipster:entity-client'];
        assert.equal(EntityGenerator.callCount, 2);
        assert.deepStrictEqual(EntityGenerator.getCall(0).args[0], ['Foo']);
        assert.deepStrictEqual(EntityGenerator.getCall(1).args[0], ['Bar']);
      });
      it('should compose with database-changelog generator', () => {
        const EntityGenerator = runResult.mockedGenerators['jhipster:database-changelog'];
        assert.equal(EntityGenerator.callCount, 1);
        assert.deepStrictEqual(EntityGenerator.getCall(0).args[0], ['Foo', 'Bar']);
      });
    });

    describe('and more than 1 entity and more than 1 entity file', () => {
      let runResult;
      before(() => {
        return helpers
          .create(require.resolve('../../generators/entities'))
          .withOptions({
            localConfig,
            entitiesToImport: [
              { name: 'Four', changelogDate: '20201012010500' },
              { name: 'Two', changelogDate: '20201012010502' },
            ],
            fromCli: true,
            skipInstall: true,
            defaults: true,
            withEntities: true,
          })
          .doInDir(dir => {
            const entitiesPath = path.join(dir, JHIPSTER_CONFIG_DIR);
            fse.ensureDirSync(entitiesPath);
            fse.writeFileSync(path.join(entitiesPath, 'One.json'), '{"changelogDate": "20201012010503"}');
            fse.writeFileSync(path.join(entitiesPath, 'Three.json'), '{"changelogDate": "20201012010501"}');
          })
          .withMockedGenerators(mockedComposedGenerators)
          .run()
          .then(result => {
            runResult = result;
          });
      });

      after(() => runResult.cleanup());

      it('should compose with mocked entity-client generator ordered by changelogDate', () => {
        const EntityGenerator = runResult.mockedGenerators['jhipster:entity-client'];
        assert.equal(EntityGenerator.callCount, 4);
        assert.deepStrictEqual(EntityGenerator.getCall(0).args[0], ['Four']);
        assert.deepStrictEqual(EntityGenerator.getCall(1).args[0], ['Three']);
        assert.deepStrictEqual(EntityGenerator.getCall(2).args[0], ['Two']);
        assert.deepStrictEqual(EntityGenerator.getCall(3).args[0], ['One']);
      });
      it('should compose with database-changelog generator', () => {
        const EntityGenerator = runResult.mockedGenerators['jhipster:database-changelog'];
        assert.equal(EntityGenerator.callCount, 1);
        assert.deepStrictEqual(EntityGenerator.getCall(0).args[0], ['Four', 'Three', 'Two', 'One']);
      });
    });
  });
});
