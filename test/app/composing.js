const fse = require('fs-extra');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { JHIPSTER_CONFIG_DIR } = require('../../generators/generator-constants');

const mockedComposedGenerators = ['jhipster:common', 'jhipster:languages', 'jhipster:entity', 'jhipster:database-changelog'];

const allMockedComposedGenerators = [...mockedComposedGenerators, 'jhipster:server', 'jhipster:client'];

describe('jhipster:app composing', () => {
    describe('when mocking all generators', () => {
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
                    .withMockedGenerators(allMockedComposedGenerators)
                    .run()
                    .then(result => {
                        runResult = result;
                    });
            });

            after(() => runResult.cleanup());

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
            it('should not compose with entity generator', () => {
                const EntityGenerator = runResult.mockedGenerators['jhipster:entity'];
                assert.equal(EntityGenerator.callCount, 0);
            });
            it('should not compose with database-changelog generator', () => {
                const IncrementalChangelogGenerator = runResult.mockedGenerators['jhipster:database-changelog'];
                assert.equal(IncrementalChangelogGenerator.callCount, 0);
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
                    .withMockedGenerators(allMockedComposedGenerators)
                    .run()
                    .then(result => {
                        runResult = result;
                    });
            });

            after(() => runResult.cleanup());

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
            it('should not compose with entity generator', () => {
                const EntityGenerator = runResult.mockedGenerators['jhipster:entity'];
                assert.equal(EntityGenerator.callCount, 0);
            });
            it('should not compose with database-changelog generator', () => {
                const IncrementalChangelogGenerator = runResult.mockedGenerators['jhipster:database-changelog'];
                assert.equal(IncrementalChangelogGenerator.callCount, 0);
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
                    .withMockedGenerators(allMockedComposedGenerators)
                    .run()
                    .then(result => {
                        runResult = result;
                    });
            });

            after(() => runResult.cleanup());

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
            it('should compose with entity generator', () => {
                const EntityGenerator = runResult.mockedGenerators['jhipster:entity'];
                assert.equal(EntityGenerator.callCount, 0);
            });
            it('should compose with database-changelog generator', () => {
                const IncrementalChangelogGenerator = runResult.mockedGenerators['jhipster:database-changelog'];
                assert.equal(IncrementalChangelogGenerator.callCount, 0);
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
                        .withMockedGenerators(allMockedComposedGenerators)
                        .run()
                        .then(result => {
                            runResult = result;
                        });
                });

                after(() => runResult.cleanup());

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
                it('should compose with entity generator once', () => {
                    const EntityGenerator = runResult.mockedGenerators['jhipster:entity'];
                    assert(EntityGenerator.calledOnce);
                    assert.deepStrictEqual(EntityGenerator.getCall(0).args[0], ['Foo']);
                });
                it('should compose with database-changelog generator', () => {
                    const IncrementalChangelogGenerator = runResult.mockedGenerators['jhipster:database-changelog'];
                    assert.equal(IncrementalChangelogGenerator.callCount, 1);
                    assert.deepStrictEqual(IncrementalChangelogGenerator.getCall(0).args[0], ['Foo']);
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
                        .withMockedGenerators(allMockedComposedGenerators)
                        .run()
                        .then(result => {
                            runResult = result;
                        });
                });

                after(() => runResult.cleanup());

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
                it('should compose with entity generator ordered by changelogDate', () => {
                    const EntityGenerator = runResult.mockedGenerators['jhipster:entity'];
                    assert.equal(EntityGenerator.callCount, 3);
                    assert.deepStrictEqual(EntityGenerator.getCall(0).args[0], ['Three']);
                    assert.deepStrictEqual(EntityGenerator.getCall(1).args[0], ['Two']);
                    assert.deepStrictEqual(EntityGenerator.getCall(2).args[0], ['One']);
                });
                it('should compose with database-changelog generator', () => {
                    const IncrementalChangelogGenerator = runResult.mockedGenerators['jhipster:database-changelog'];
                    assert.equal(IncrementalChangelogGenerator.callCount, 1);
                    assert.deepStrictEqual(IncrementalChangelogGenerator.getCall(0).args[0], ['Three', 'Two', 'One']);
                });
            });
        });
    });
    describe(`when mocking ${mockedComposedGenerators}`, () => {
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

            it('should compose with common generator once', () => {
                const CommonGenerator = runResult.mockedGenerators['jhipster:common'];
                assert(CommonGenerator.calledOnce);
            });
            it('should compose with languages generator once', () => {
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
