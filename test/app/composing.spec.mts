import fse from 'fs-extra';
import path from 'path';
import assert from 'yeoman-assert';
import Environment from 'yeoman-environment';

import { dryRunHelpers as helpers } from '../support/helpers.mjs';
import { JHIPSTER_CONFIG_DIR } from '../../generators/generator-constants.mjs';
import { getGenerator } from '../support/index.mjs';

const { createEnv } = Environment;

helpers.createEnv = createEnv;

const allMockedComposedGenerators = [
  'jhipster:common',
  'jhipster:languages',
  'jhipster:entities',
  'jhipster:entity',
  'jhipster:database-changelog',
  'jhipster:bootstrap',
  'jhipster:git',
  'jhipster:server',
  'jhipster:client',
];

describe('generator - app - composing', () => {
  describe('when mocking all generators', () => {
    describe('with default options', () => {
      let runContext;
      let runResult;
      before(async () => {
        runContext = helpers.create(getGenerator('app'));
        runResult = await runContext
          .withOptions({
            baseName: 'jhipster',
            defaults: true,
          })
          .withMockedGenerators(allMockedComposedGenerators)
          .run();
      });

      after(() => runContext.cleanup());

      it('should compose with bootstrap generator', () => {
        assert(runResult.mockedGenerators['jhipster:bootstrap'].called);
      });
      it('should compose with common generator', () => {
        const CommonGenerator = runResult.mockedGenerators['jhipster:common'];
        assert(CommonGenerator.calledOnce);
      });
      it('should compose with server generator', () => {
        const ServerGenerator = runResult.mockedGenerators['jhipster:server'];
        assert(ServerGenerator.calledOnce);
      });
      it('should compose with client generator', () => {
        const ClientGenerator = runResult.mockedGenerators['jhipster:client'];
        assert(ClientGenerator.calledOnce);
      });
      it('should compose with languages generator', () => {
        const LanguagesGenerator = runResult.mockedGenerators['jhipster:languages'];
        assert(LanguagesGenerator.calledOnce);
      });
      it('should not compose with entities generator', () => {
        const MockedGenerator = runResult.mockedGenerators['jhipster:entities'];
        assert.equal(MockedGenerator.callCount, 0);
      });
      it('should not compose with entity generator', () => {
        const MockedGenerator = runResult.mockedGenerators['jhipster:entity'];
        assert.equal(MockedGenerator.callCount, 0);
      });
      it('should not compose with database-changelog generator', () => {
        const MockedGenerator = runResult.mockedGenerators['jhipster:database-changelog'];
        assert.equal(MockedGenerator.callCount, 0);
      });
    });

    describe('with --skip-client', () => {
      let runContext;
      let runResult;
      before(async () => {
        runContext = helpers.create(getGenerator('app'));
        runResult = await runContext
          .withOptions({
            baseName: 'jhipster',
            defaults: true,
            skipClient: true,
          })
          .withMockedGenerators(allMockedComposedGenerators)
          .run();
      });

      after(() => runContext.cleanup());

      it('should compose with bootstrap generator', () => {
        const BootstrapGenerator = runResult.mockedGenerators['jhipster:bootstrap'];
        assert(BootstrapGenerator.called);
      });
      it('should compose with common generator', () => {
        const CommonGenerator = runResult.mockedGenerators['jhipster:common'];
        assert(CommonGenerator.calledOnce);
      });
      it('should compose with server generator', () => {
        const ServerGenerator = runResult.mockedGenerators['jhipster:server'];
        assert(ServerGenerator.calledOnce);
      });
      it('should not compose with client generator', () => {
        const ClientGenerator = runResult.mockedGenerators['jhipster:client'];
        assert.equal(ClientGenerator.callCount, 0);
      });
      it('should compose with languages generator', () => {
        const LanguagesGenerator = runResult.mockedGenerators['jhipster:languages'];
        assert(LanguagesGenerator.calledOnce);
      });
      it('should not compose with entities generator', () => {
        const MockedGenerator = runResult.mockedGenerators['jhipster:entities'];
        assert.equal(MockedGenerator.callCount, 0);
      });
      it('should not compose with entity generator', () => {
        const MockedGenerator = runResult.mockedGenerators['jhipster:entity'];
        assert.equal(MockedGenerator.callCount, 0);
      });
      it('should not compose with database-changelog generator', () => {
        const MockedGenerator = runResult.mockedGenerators['jhipster:database-changelog'];
        assert.equal(MockedGenerator.callCount, 0);
      });
    });

    describe('with --skip-server', () => {
      let runContext;
      let runResult;
      before(async () => {
        runContext = helpers.create(getGenerator('app'));
        runResult = await runContext
          .withOptions({
            baseName: 'jhipster',
            defaults: true,
            skipServer: true,
          })
          .withMockedGenerators(allMockedComposedGenerators)
          .run();
      });

      after(() => runContext.cleanup());

      it('should compose with bootstrap generator', () => {
        assert(runResult.mockedGenerators['jhipster:bootstrap'].called);
      });
      it('should compose with common generator', () => {
        const CommonGenerator = runResult.mockedGenerators['jhipster:common'];
        assert(CommonGenerator.calledOnce);
      });
      it('should not compose with server generator', () => {
        const ServerGenerator = runResult.mockedGenerators['jhipster:server'];
        assert(ServerGenerator.callCount === 0);
      });
      it('should compose with client generator', () => {
        const ClientGenerator = runResult.mockedGenerators['jhipster:client'];
        assert(ClientGenerator.calledOnce);
      });
      it('should not compose with entities generator', () => {
        const EntityGenerator = runResult.mockedGenerators['jhipster:entities'];
        assert.equal(EntityGenerator.callCount, 0);
      });
      it('should not compose with entity generator', () => {
        const MockedGenerator = runResult.mockedGenerators['jhipster:entity'];
        assert.equal(MockedGenerator.callCount, 0);
      });
      it('should not compose with database-changelog generator', () => {
        const MockedGenerator = runResult.mockedGenerators['jhipster:database-changelog'];
        assert.equal(MockedGenerator.callCount, 0);
      });
    });

    describe('with --with-entities', () => {
      describe('and 1 entity file', () => {
        let runContext;
        let runResult;
        before(async () => {
          runContext = helpers.create(getGenerator('app'));
          runResult = await runContext
            .withOptions({
              baseName: 'jhipster',
              defaults: true,
              withEntities: true,
            })
            .doInDir(dir => {
              const entitiesPath = path.join(dir, JHIPSTER_CONFIG_DIR);
              fse.ensureDirSync(entitiesPath);
              const entityPath = path.join(entitiesPath, 'Foo.json');
              fse.writeFileSync(entityPath, '{}');
            })
            .withMockedGenerators(allMockedComposedGenerators)
            .run();
        });

        after(() => runContext.cleanup());

        it('should compose with bootstrap generator', () => {
          assert(runResult.mockedGenerators['jhipster:bootstrap'].called);
        });
        it('should compose with common generator', () => {
          const CommonGenerator = runResult.mockedGenerators['jhipster:common'];
          assert(CommonGenerator.calledOnce);
        });
        it('compose with server generator', () => {
          const ServerGenerator = runResult.mockedGenerators['jhipster:server'];
          assert(ServerGenerator.calledOnce);
        });
        it('should compose with client generator', () => {
          const ClientGenerator = runResult.mockedGenerators['jhipster:client'];
          assert(ClientGenerator.calledOnce);
        });
        it('should compose with languages generator', () => {
          const LanguagesGenerator = runResult.mockedGenerators['jhipster:languages'];
          assert(LanguagesGenerator.calledOnce);
        });
        it('should compose with entities generator once', () => {
          assert.equal(runResult.mockedGenerators['jhipster:entities'].callCount, 0);
        });
        it('should not compose with entity generator', () => {
          const MockedGenerator = runResult.mockedGenerators['jhipster:entity'];
          assert.equal(MockedGenerator.callCount, 0);
        });
        it('should not compose with database-changelog generator', () => {
          const MockedGenerator = runResult.mockedGenerators['jhipster:database-changelog'];
          assert.equal(MockedGenerator.callCount, 0);
        });
      });

      describe('and more than 1 entity file', () => {
        let runContext;
        let runResult;
        before(async () => {
          runContext = helpers.create(getGenerator('app'));
          runResult = await runContext
            .withOptions({
              baseName: 'jhipster',
              defaults: true,
              withEntities: true,
            })
            .doInDir(dir => {
              const entitiesPath = path.join(dir, JHIPSTER_CONFIG_DIR);
              fse.ensureDirSync(entitiesPath);
              fse.writeFileSync(path.join(entitiesPath, 'One.json'), '{"changelogDate": "12345678901234"}');
              fse.writeFileSync(path.join(entitiesPath, 'Two.json'), '{"changelogDate": "12345678901235"}');
              fse.writeFileSync(path.join(entitiesPath, 'Three.json'), '{"changelogDate": "12345678901236"}');
            })
            .withMockedGenerators(allMockedComposedGenerators)
            .run();
        });

        after(() => runContext.cleanup());

        it('should compose with bootstrap generator', () => {
          assert(runResult.mockedGenerators['jhipster:bootstrap'].called);
        });
        it('should compose with common generator', () => {
          const CommonGenerator = runResult.mockedGenerators['jhipster:common'];
          assert(CommonGenerator.calledOnce);
        });
        it('compose with server generator', () => {
          const ServerGenerator = runResult.mockedGenerators['jhipster:server'];
          assert(ServerGenerator.calledOnce);
        });
        it('should compose with client generator', () => {
          const ClientGenerator = runResult.mockedGenerators['jhipster:client'];
          assert(ClientGenerator.calledOnce);
        });
        it('should compose with languages generator', () => {
          const LanguagesGenerator = runResult.mockedGenerators['jhipster:languages'];
          assert(LanguagesGenerator.calledOnce);
        });
        it('should not compose with entity generator', () => {
          const EntityGenerator = runResult.mockedGenerators['jhipster:entity'];
          assert.equal(EntityGenerator.callCount, 0);
        });
        it('should not compose with database-changelog generator', () => {
          const IncrementalChangelogGenerator = runResult.mockedGenerators['jhipster:database-changelog'];
          assert.equal(IncrementalChangelogGenerator.callCount, 0);
        });
      });
    });
  });
});
