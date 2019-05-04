const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const constants = require('../generators/generator-constants');
const expectedFiles = require('./utils/expected-files').entity;

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;

describe('JHipster generator for entity', () => {
    context('creation from CLI', () => {
        context('monolith with elasticsearch', () => {
            describe('search, no dto, no service, no pagination', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-elasticsearch'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'no'
                        })
                        .on('end', done);
                });

                it('does creates search files', () => {
                    assert.file(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.java`);
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.gatling);
                });
            });
        });

        context('monolith with entity and dto suffixes', () => {
            describe('with entity and dto suffixes', () => {
                beforeEach(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/entity-dto-suffixes'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'mapstruct',
                            service: 'serviceImpl'
                        })
                        .on('end', done);
                });

                it('creates expected files with suffix', () => {
                    assert.file([
                        '.jhipster/Foo.json',
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`
                    ]);

                    assert.fileContent(
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.java`,
                        'public interface FooRepository '
                    );

                    assert.fileContent(
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.java`,
                        'public class FooXXX implements Serializable'
                    );

                    assert.fileContent(
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.java`,
                        'public class FooYYY implements Serializable'
                    );
                });
            });

            describe('with entity suffix and no dto', () => {
                beforeEach(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/entity-dto-suffixes'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'serviceImpl'
                        })
                        .on('end', done);
                });

                it('creates expected files with suffix', () => {
                    assert.file([
                        '.jhipster/Foo.json',
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`
                    ]);

                    assert.noFile([
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.java`
                    ]);

                    assert.fileContent(
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.java`,
                        'public interface FooRepository '
                    );

                    assert.fileContent(
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.java`,
                        'public class FooXXX implements Serializable'
                    );
                });
            });
        });

        context('monolith with angularX', () => {
            describe('no dto, no service, no pagination', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'no'
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                    assert.file(expectedFiles.fakeData);
                });
            });

            describe('no dto, no service, with pagination', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'pagination'
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                });
            });

            describe('no dto, no service, with infinite-scroll', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'infinite-scroll'
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                });
            });

            describe('no dto, with serviceImpl, no pagination', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'serviceImpl',
                            pagination: 'no'
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                    assert.file([
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.java`
                    ]);
                });
            });

            describe('with dto, service, no pagination', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'mapstruct',
                            service: 'serviceClass',
                            pagination: 'no'
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                    assert.file([
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`
                    ]);
                });
            });

            describe('with angular suffix', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({ 'angular-suffix': 'management' })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'infinite-scroll'
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2WithSuffix);
                    assert.file(expectedFiles.gatling);
                    assert.fileContent('.jhipster/Foo.json', 'angularJSSuffix');
                });
            });

            describe('with client-root-folder', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({ 'client-root-folder': 'test-root' })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'infinite-scroll'
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2WithRootFolder);
                    assert.file(expectedFiles.gatling);
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                });
            });

            describe('with client-root-folder and angular-suffix', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({ 'client-root-folder': 'test-root' })
                        .withOptions({ 'angular-suffix': 'management' })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'infinite-scroll'
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2WithRootFolderAndSuffix);
                    assert.file(expectedFiles.gatling);
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                });
            });
        });

        context('fake data', () => {
            describe('sql database with fake data disabled', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/psql-with-no-fake-data'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'no'
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.noFile(expectedFiles.fakeData);
                });
            });
        });

        context('no i18n', () => {
            describe('with dto, serviceImpl, with hazelcast, elasticsearch', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/noi18n'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'infinite-scroll'
                        })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                    assert.noFile([`${CLIENT_MAIN_SRC_DIR}i18n/en/foo.json`, `${CLIENT_MAIN_SRC_DIR}i18n/fr/foo.json`]);
                });
            });
        });

        context('all languages', () => {
            describe('no dto, no service, no pagination', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/all-languages'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'no'
                        })
                        .on('end', done);
                });

                it('creates expected languages files', () => {
                    constants.LANGUAGES.forEach(language => {
                        assert.file([`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/foo.json`]);
                    });
                });
            });

            describe('no dto, no service, no pagination with client-root-folder', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/all-languages'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({ 'client-root-folder': 'test-root' })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'no',
                            service: 'no',
                            pagination: 'no'
                        })
                        .on('end', done);
                });

                it('creates expected languages files', () => {
                    constants.LANGUAGES.forEach(language => {
                        assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/testRootFoo.json`);
                    });
                    assert.file(expectedFiles.clientNg2WithRootFolder);
                });
            });
        });

        context('microservice', () => {
            describe('with client-root-folder microservice', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
                        })
                        .withArguments(['foo'])
                        .withOptions({ 'client-root-folder': 'test-root' })
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'infinite-scroll'
                        })
                        .on('end', done);
                });

                it('sets expected custom clientRootFolder', () => {
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                    assert.file(expectedFiles.server);
                    assert.noFile(expectedFiles.clientNg2WithRootFolder);
                });
            });

            describe('with default microservice', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'pagination'
                        })
                        .on('end', done);
                });

                it('sets expected default clientRootFolder', () => {
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'sampleMicroservice' });
                });
                it('generates expected files', () => {
                    assert.file(expectedFiles.server);
                    assert.noFile(expectedFiles.gatling);
                    assert.noFile(expectedFiles.clientNg2WithRootFolder);
                });
            });

            describe('with mongodb microservice', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/mongodb-with-relations'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            fieldAdd: false,
                            relationshipAdd: false,
                            dto: 'yes',
                            service: 'serviceImpl',
                            pagination: 'pagination'
                        })
                        .on('end', done);
                });

                it('sets expected custom databaseType', () => {
                    assert.jsonFileContent('.jhipster/Foo.json', { databaseType: 'mongodb' });
                });
            });
        });

        context('gateway', () => {
            describe('with entity from microservice', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
                        })
                        .withPrompts({
                            useMicroserviceJson: true,
                            microservicePath: '../'
                        })
                        .withArguments(['bar'])
                        .on('end', done);
                });

                it('sets expected default clientRootFolder', () => {
                    assert.jsonFileContent('.jhipster/Bar.json', { clientRootFolder: 'sampleMicroservice' });
                });
                it('generates expected files', () => {
                    assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/en/sampleMicroserviceBar.json`);
                    assert.file(expectedFiles.clientNg2GatewayMicroserviceEntity);
                    assert.noFile(expectedFiles.gatling);
                    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/bar/bar.service.ts`, 'samplemicroservice');
                    assert.fileContent(
                        `${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/bar/bar.module.ts`,
                        'SampleMicroserviceBarModule'
                    );
                    assert.noFile(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/BarResource.java`);
                });
            });

            describe('with entity from microservice and custom client-root-folder', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
                        })
                        .withArguments(['foo'])
                        .withPrompts({
                            useMicroserviceJson: true,
                            microservicePath: '../'
                        })
                        .on('end', done);
                });

                it('sets expected custom clientRootFolder', () => {
                    assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
                });
                it('generates expected files', () => {
                    assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/en/testRootFoo.json`);
                    assert.file(expectedFiles.clientNg2WithRootFolder);
                    assert.noFile(expectedFiles.gatling);
                    assert.noFile(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`);
                });
            });

            describe('with entity from mongodb microservice', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
                        })
                        .withArguments(['baz'])
                        .withPrompts({
                            useMicroserviceJson: true,
                            microservicePath: '../'
                        })
                        .on('end', done);
                });

                it('sets expected custom databaseType from the microservice', () => {
                    assert.jsonFileContent('.jhipster/Baz.json', { databaseType: 'mongodb' });
                });
                it('generates expected files', () => {
                    assert.file(expectedFiles.clientBazGatewayMicroserviceEntity);
                });
                it('generates a string id for the mongodb entity', () => {
                    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/shared/model/sampleMicroservice/baz.model.ts`, 'id?: string');
                });
            });
        });
    });

    context('regeneration from json file', () => {
        context('monolith with angularX', () => {
            describe('no dto, no service, no pagination', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                            fse.copySync(
                                path.join(__dirname, '../test/templates/export-jdl/.jhipster/Country.json'),
                                path.join(dir, '.jhipster/Foo.json')
                            );
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                });
                it('generates swagger annotations on domain model', () => {
                    assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Foo.java`, /@ApiModelProperty/);
                });
            });
        });

        describe('with --skip-db-changelog', () => {
            describe('SQL database', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
                            fse.copySync(
                                path.join(__dirname, '../test/templates/export-jdl/.jhipster/Country.json'),
                                path.join(dir, '.jhipster/Foo.json')
                            );
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true, skipDbChangelog: true })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.clientNg2);
                    assert.file(expectedFiles.gatling);
                });
                it("doesn't creates database changelogs", () => {
                    assert.noFile([
                        `${constants.SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_Foo.xml`,
                        `${constants.SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_constraints_Foo.xml`
                    ]);
                });
            });

            describe('Cassandra database', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/compose/05-cassandra'), dir);
                            fse.copySync(
                                path.join(__dirname, '../test/templates/export-jdl/.jhipster/Country.json'),
                                path.join(dir, '.jhipster/Foo.json')
                            );
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true, skipDbChangelog: true })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.file(expectedFiles.gatling);
                });
                it("doesn't creates database changelogs", () => {
                    assert.noFile([`${constants.SERVER_MAIN_RES_DIR}config/cql/changelog/20160926101210_added_entity_Foo.cql`]);
                });
            });
        });

        context('microservice', () => {
            describe('with dto, service, pagination', () => {
                before(done => {
                    helpers
                        .run(require.resolve('../generators/entity'))
                        .inTmpDir(dir => {
                            fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
                            fse.copySync(
                                path.join(__dirname, '../test/templates/export-jdl/.jhipster/Employee.json'),
                                path.join(dir, '.jhipster/Foo.json')
                            );
                        })
                        .withArguments(['Foo'])
                        .withOptions({ regenerate: true, force: true })
                        .on('end', done);
                });

                it('creates expected default files', () => {
                    assert.file(expectedFiles.server);
                    assert.noFile(expectedFiles.clientNg2);
                    assert.file([
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.java`,
                        `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`
                    ]);
                });
                it('generates swagger annotations on DTO', () => {
                    assert.noFileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Foo.java`, /@ApiModelProperty/);
                    assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.java`, /@ApiModelProperty/);
                });
            });
        });
    });
});
