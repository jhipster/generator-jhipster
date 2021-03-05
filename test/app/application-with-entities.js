const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const mockedComposedGenerators = ['jhipster:common', 'jhipster:server', 'jhipster:client', 'jhipster:languages', 'jhipster:entities'];

describe('jhipster:app with applicationWithEntities option', () => {
  describe('with default options', () => {
    let runResult;
    before(() => {
      return helpers
        .create(require.resolve('../../generators/app'))
        .withOptions({
          applicationWithEntities: {
            config: {
              baseName: 'jhipster',
            },
            entities: [],
          },
          fromCli: true,
          skipInstall: true,
          defaults: true,
        })
        .withMockedGenerators(mockedComposedGenerators)
        .run()
        .then(result => {
          runResult = result;
        });
    });

    after(() => runResult.cleanup());

    it('writes .yo-rc.json with config', () => {
      assert.fileContent('.yo-rc.json', /"baseName": "jhipster"/);
      runResult.assertFile('.yo-rc.json');
    });
  });

  describe('with --with-entities', () => {
    describe('and a single entity', () => {
      let runResult;
      before(() => {
        return helpers
          .create(require.resolve('../../generators/app'))
          .withOptions({
            applicationWithEntities: {
              config: {
                baseName: 'jhipster',
              },
              entities: [{ name: 'Foo' }],
            },
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
      it('should compose with entities generator', () => {
        const MockedGenerator = runResult.mockedGenerators['jhipster:entities'];
        assert(MockedGenerator.calledOnce);
      });
    });

    describe('and User', () => {
      let runResult;
      before(() => {
        return helpers
          .create(require.resolve('../../generators/app'))
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
                      fieldType: 'UUID',
                    },
                  ],
                },
              ],
            },
            fromCli: true,
            skipInstall: true,
            defaults: true,
            withEntities: true,
          })
          .withMockedGenerators(['jhipster:entity'])
          .run()
          .then(result => {
            runResult = result;
          });
      });

      after(() => runResult.cleanup());

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
