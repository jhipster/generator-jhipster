const assert = require('yeoman-assert');
const { dryRunHelpers: helpers } = require('../utils/utils');
const { CommonDBTypes } = require('../../jdl/jhipster/field-types');

const { UUID } = CommonDBTypes;
const mockedComposedGenerators = ['jhipster:common', 'jhipster:server', 'jhipster:client', 'jhipster:languages', 'jhipster:entities'];

describe('jhipster:app with applicationWithEntities option', () => {
  describe('with default options', () => {
    let runContext;
    let runResult;
    before(async () => {
      runContext = helpers.create(require.resolve('../../generators/app'));
      runResult = await runContext
        .withOptions({
          applicationWithEntities: {
            config: {
              baseName: 'jhipster',
            },
            entities: [],
          },
          defaults: true,
        })
        .withMockedGenerators(mockedComposedGenerators)
        .run();
    });

    after(() => runContext.cleanup());

    it('writes .yo-rc.json with config', () => {
      assert.fileContent('.yo-rc.json', /"baseName": "jhipster"/);
      runResult.assertFile('.yo-rc.json');
    });
  });

  describe('with --with-entities', () => {
    describe('and a single entity', () => {
      let runContext;
      let runResult;
      before(async () => {
        runContext = helpers.create(require.resolve('../../generators/app'));
        runResult = await runContext
          .withOptions({
            applicationWithEntities: {
              config: {
                baseName: 'jhipster',
              },
              entities: [{ name: 'Foo' }],
            },
            defaults: true,
            withEntities: true,
          })
          .withMockedGenerators(mockedComposedGenerators)
          .run();
      });

      after(() => runContext.cleanup());

      it('writes .yo-rc.json', () => {
        runResult.assertFile('.yo-rc.json');
        runResult.assertFileContent('.yo-rc.json', /"baseName": "jhipster"/);
      });
      it('writes entity config file', () => {
        runResult.assertFile('.jhipster/Foo.json');
        runResult.assertFileContent('.jhipster/Foo.json', /"name": "Foo"/);
      });
      it('should compose with entities generator', () => {
        const MockedGenerator = runResult.mockedGenerators['jhipster:entities'];
        assert(MockedGenerator.calledOnce);
      });
    });

    describe('and User', () => {
      let runContext;
      let runResult;
      before(async () => {
        runContext = helpers.create(require.resolve('../../generators/app'));
        runResult = await runContext
          .withOptions({
            applicationWithEntities: {
              config: {
                baseName: 'jhipster',
              },
              entities: [
                {
                  name: 'User',
                  fields: [
                    {
                      fieldName: 'id',
                      fieldType: UUID,
                    },
                  ],
                },
              ],
            },
            defaults: true,
            withEntities: true,
          })
          .withMockedGenerators(['jhipster:entity'])
          .run();
      });

      after(() => runContext.cleanup());

      it('should write .yo-rc.json', () => {
        runResult.assertFile('.yo-rc.json');
        runResult.assertFileContent('.yo-rc.json', /"baseName": "jhipster"/);
      });
      it('should write entity config file', () => {
        runResult.assertFile('.jhipster/User.json');
        runResult.assertFileContent('.jhipster/User.json', /"name": "User"/);
        runResult.assertFileContent('.jhipster/User.json', /"fieldType": "UUID"/);
      });
      it('should adopt the config file id type', () => {
        runResult.assertFile('src/main/java/com/mycompany/myapp/domain/User.java');
        runResult.assertFileContent('src/main/java/com/mycompany/myapp/domain/User.java', /private UUID id;/);
      });
      it('should not compose with entities generator', () => {
        const MockedGenerator = runResult.mockedGenerators['jhipster:entity'];
        assert(MockedGenerator.notCalled);
      });
    });
  });
});
