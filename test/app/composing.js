const fse = require('fs-extra');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { JHIPSTER_CONFIG_DIR } = require('../../generators/generator-constants');

const mockedComposedGenerators = ['jhipster:common', 'jhipster:server', 'jhipster:client', 'jhipster:languages', 'jhipster:entity'];

describe('jhipster:app composing with others generators', () => {
    describe('with default options', () => {
        let runResult;
        before(() => {
            return helpers
                .create(require.resolve('../../generators/app'))
                .withOptions({
                    baseName: 'jhipster',
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

        it('composes with mocked common generator', () => {
            const CommonGenerator = runResult.mockedGenerators['jhipster:common'];
            assert(CommonGenerator.calledOnce);
        });
        it('composes with mocked server generator', () => {
            const ServerGenerator = runResult.mockedGenerators['jhipster:server'];
            assert(ServerGenerator.calledOnce);
        });
        it('composes with mocked client generator', () => {
            const ClientGenerator = runResult.mockedGenerators['jhipster:client'];
            assert(ClientGenerator.calledOnce);
        });
        it('composes with mocked languages generator', () => {
            const LanguagesGenerator = runResult.mockedGenerators['jhipster:languages'];
            assert(LanguagesGenerator.calledOnce);
        });
    });

    describe('with --skip-client', () => {
        let runResult;
        before(() => {
            return helpers
                .create(require.resolve('../../generators/app'))
                .withOptions({
                    baseName: 'jhipster',
                    fromCli: true,
                    skipInstall: true,
                    defaults: true,
                    skipClient: true,
                })
                .withMockedGenerators(mockedComposedGenerators)
                .run()
                .then(result => {
                    runResult = result;
                });
        });

        after(() => runResult.cleanup());

        it('composes with mocked common generator', () => {
            const CommonGenerator = runResult.mockedGenerators['jhipster:common'];
            assert(CommonGenerator.calledOnce);
        });
        it('composes with mocked server generator', () => {
            const ServerGenerator = runResult.mockedGenerators['jhipster:server'];
            assert(ServerGenerator.calledOnce);
        });
        it('does not compose with mocked client generator', () => {
            const ClientGenerator = runResult.mockedGenerators['jhipster:client'];
            assert(ClientGenerator.callCount === 0);
        });
        it('composes with mocked languages generator', () => {
            const LanguagesGenerator = runResult.mockedGenerators['jhipster:languages'];
            assert(LanguagesGenerator.calledOnce);
        });
    });

    describe('with --skip-server', () => {
        let runResult;
        before(() => {
            return helpers
                .create(require.resolve('../../generators/app'))
                .withOptions({
                    baseName: 'jhipster',
                    fromCli: true,
                    skipInstall: true,
                    defaults: true,
                    skipServer: true,
                })
                .withMockedGenerators(mockedComposedGenerators)
                .run()
                .then(result => {
                    runResult = result;
                });
        });

        after(() => runResult.cleanup());

        it('composes with mocked common generator', () => {
            const CommonGenerator = runResult.mockedGenerators['jhipster:common'];
            assert(CommonGenerator.calledOnce);
        });
        it('does not compose with mocked server generator', () => {
            const ServerGenerator = runResult.mockedGenerators['jhipster:server'];
            assert(ServerGenerator.callCount === 0);
        });
        it('composes with mocked client generator', () => {
            const ClientGenerator = runResult.mockedGenerators['jhipster:client'];
            assert(ClientGenerator.calledOnce);
        });
        it('composes with mocked languages generator', () => {
            const LanguagesGenerator = runResult.mockedGenerators['jhipster:languages'];
            assert(LanguagesGenerator.calledOnce);
        });
    });

    describe('with --with-entities', () => {
        describe('and 1 entity file', () => {
            let runResult;
            before(() => {
                return helpers
                    .create(require.resolve('../../generators/app'))
                    .withOptions({
                        baseName: 'jhipster',
                        fromCli: true,
                        skipInstall: true,
                        defaults: true,
                        withEntities: true,
                    })
                    .doInDir(dir => {
                        const entitiesPath = path.join(dir, JHIPSTER_CONFIG_DIR);
                        fse.ensureDirSync(entitiesPath);
                        const entityPath = path.join(entitiesPath, 'Foo.json');
                        fse.writeFileSync(entityPath, '{}');
                    })
                    .withMockedGenerators(mockedComposedGenerators)
                    .run()
                    .then(result => {
                        runResult = result;
                    });
            });

            after(() => runResult.cleanup());

            it('composes with mocked common generator', () => {
                const CommonGenerator = runResult.mockedGenerators['jhipster:common'];
                assert(CommonGenerator.calledOnce);
            });
            it('compose with mocked server generator', () => {
                const ServerGenerator = runResult.mockedGenerators['jhipster:server'];
                assert(ServerGenerator.calledOnce);
            });
            it('composes with mocked client generator', () => {
                const ClientGenerator = runResult.mockedGenerators['jhipster:client'];
                assert(ClientGenerator.calledOnce);
            });
            it('composes with mocked languages generator', () => {
                const LanguagesGenerator = runResult.mockedGenerators['jhipster:languages'];
                assert(LanguagesGenerator.calledOnce);
            });
            it('composes with mocked entity generator once', () => {
                const EntityGenerator = runResult.mockedGenerators['jhipster:entity'];
                assert(EntityGenerator.calledOnce);
                assert.deepStrictEqual(EntityGenerator.getCall(0).args[0], ['Foo']);
            });
        });

        describe('and more than 1 entity file', () => {
            let runResult;
            before(() => {
                return helpers
                    .create(require.resolve('../../generators/app'))
                    .withOptions({
                        baseName: 'jhipster',
                        fromCli: true,
                        skipInstall: true,
                        defaults: true,
                        withEntities: true,
                    })
                    .doInDir(dir => {
                        const entitiesPath = path.join(dir, JHIPSTER_CONFIG_DIR);
                        fse.ensureDirSync(entitiesPath);
                        fse.writeFileSync(path.join(entitiesPath, 'One.json'), '{"changelogDate": 3}');
                        fse.writeFileSync(path.join(entitiesPath, 'Two.json'), '{"changelogDate": 2}');
                        fse.writeFileSync(path.join(entitiesPath, 'Three.json'), '{"changelogDate": 1}');
                    })
                    .withMockedGenerators(mockedComposedGenerators)
                    .run()
                    .then(result => {
                        runResult = result;
                    });
            });

            after(() => runResult.cleanup());

            it('composes with mocked common generator', () => {
                const CommonGenerator = runResult.mockedGenerators['jhipster:common'];
                assert(CommonGenerator.calledOnce);
            });
            it('compose with mocked server generator', () => {
                const ServerGenerator = runResult.mockedGenerators['jhipster:server'];
                assert(ServerGenerator.calledOnce);
            });
            it('composes with mocked client generator', () => {
                const ClientGenerator = runResult.mockedGenerators['jhipster:client'];
                assert(ClientGenerator.calledOnce);
            });
            it('composes with mocked languages generator', () => {
                const LanguagesGenerator = runResult.mockedGenerators['jhipster:languages'];
                assert(LanguagesGenerator.calledOnce);
            });
            it('composes with mocked entity generator ordered by changelogDate', () => {
                const EntityGenerator = runResult.mockedGenerators['jhipster:entity'];
                assert.equal(EntityGenerator.callCount, 3);
                assert.deepStrictEqual(EntityGenerator.getCall(0).args[0], ['Three']);
                assert.deepStrictEqual(EntityGenerator.getCall(1).args[0], ['Two']);
                assert.deepStrictEqual(EntityGenerator.getCall(2).args[0], ['One']);
            });
        });
    });
});
