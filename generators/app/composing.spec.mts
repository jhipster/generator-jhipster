import assert from 'assert';

import { defaultHelpers as helpers } from '../../test/support/helpers.mjs';
import { GENERATOR_APP } from '../generator-list.mjs';

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
      let runResult;
      before(async () => {
        runResult = await helpers.runJHipster(GENERATOR_APP).withJHipsterConfig().withMockedGenerators(allMockedComposedGenerators);
      });

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
      let runResult;
      before(async () => {
        runResult = await helpers
          .runJHipster(GENERATOR_APP)
          .withJHipsterConfig({
            skipClient: true,
          })
          .withMockedGenerators(allMockedComposedGenerators);
      });

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
      let runResult;
      before(async () => {
        runResult = await helpers
          .runJHipster(GENERATOR_APP)
          .withJHipsterConfig({
            skipServer: true,
          })
          .withMockedGenerators(allMockedComposedGenerators);
      });

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
        let runResult;
        before(async () => {
          runResult = await helpers
            .runJHipster(GENERATOR_APP)
            .withJHipsterConfig({}, [{ name: 'Foo' }])
            .withOptions({
              withEntities: true,
            })
            .withMockedGenerators(allMockedComposedGenerators);
        });

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
        let runResult;
        before(async () => {
          runResult = await helpers
            .runJHipster(GENERATOR_APP)
            .withJHipsterConfig({}, [
              { name: 'One', changelogDate: '12345678901234' },
              { name: 'Two', changelogDate: '12345678901235' },
              { name: 'Three', changelogDate: '12345678901236' },
            ])
            .withOptions({
              withEntities: true,
            })
            .withMockedGenerators(allMockedComposedGenerators);
        });

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
