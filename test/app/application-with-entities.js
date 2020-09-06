const fse = require('fs-extra');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const { JHIPSTER_CONFIG_DIR } = require('../../generators/generator-constants');

const mockedComposedGenerators = [
    'jhipster:common',
    'jhipster:server',
    'jhipster:client',
    'jhipster:languages',
    'jhipster:entity',
    'jhipster:database-changelog',
];

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
        describe('and single entity', () => {
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
            it('should compose with entity generator', () => {
                const EntityGenerator = runResult.mockedGenerators['jhipster:entity'];
                assert(EntityGenerator.calledOnce);
                assert.equal(EntityGenerator.getCall(0).args[0], 'Foo');
            });
        });

        describe('and 2 entities', () => {
            let runResult;
            before(() => {
                return helpers
                    .create(require.resolve('../../generators/app'))
                    .withOptions({
                        applicationWithEntities: {
                            config: {
                                baseName: 'jhipster',
                            },
                            entities: [{ name: 'Foo' }, { name: 'Bar' }],
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
                runResult.assertFile('.jhipster/Bar.json');
                runResult.assertFileContent('.jhipster/Bar.json', /"name": "Bar"/);
            });
            it('should compose with entity generator', () => {
                const EntityGenerator = runResult.mockedGenerators['jhipster:entity'];
                assert(EntityGenerator.callCount === 2);
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
                    .create(require.resolve('../../generators/app'))
                    .withOptions({
                        applicationWithEntities: {
                            config: {
                                baseName: 'jhipster',
                            },
                            entities: [{ name: 'Foo', changelogDate: 1 }],
                        },
                        fromCli: true,
                        skipInstall: true,
                        defaults: true,
                        withEntities: true,
                    })
                    .doInDir(dir => {
                        const entitiesPath = path.join(dir, JHIPSTER_CONFIG_DIR);
                        fse.ensureDirSync(entitiesPath);
                        const entityPath = path.join(entitiesPath, 'Bar.json');
                        fse.writeFileSync(entityPath, '{"changelogDate": 2}');
                    })
                    .withMockedGenerators(mockedComposedGenerators)
                    .run()
                    .then(result => {
                        runResult = result;
                    });
            });

            after(() => runResult.cleanup());

            it('should compose with mocked entity generator ordered by changelogDate', () => {
                const EntityGenerator = runResult.mockedGenerators['jhipster:entity'];
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

        describe('and more than 1 entity and than 1 entity files', () => {
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
                                { name: 'Four', changelogDate: 0 },
                                { name: 'Two', changelogDate: 2 },
                            ],
                        },
                        fromCli: true,
                        skipInstall: true,
                        defaults: true,
                        withEntities: true,
                    })
                    .doInDir(dir => {
                        const entitiesPath = path.join(dir, JHIPSTER_CONFIG_DIR);
                        fse.ensureDirSync(entitiesPath);
                        fse.writeFileSync(path.join(entitiesPath, 'One.json'), '{"changelogDate": 3}');
                        fse.writeFileSync(path.join(entitiesPath, 'Three.json'), '{"changelogDate": 1}');
                    })
                    .withMockedGenerators(mockedComposedGenerators)
                    .run()
                    .then(result => {
                        runResult = result;
                    });
            });

            after(() => runResult.cleanup());

            it('should compose with mocked entity generator ordered by changelogDate', () => {
                const EntityGenerator = runResult.mockedGenerators['jhipster:entity'];
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
