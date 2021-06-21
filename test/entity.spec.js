const path = require('path');
const assert = require('yeoman-assert');
const fse = require('fs-extra');

const { skipPrettierHelpers: helpers } = require('./utils/utils');

const constants = require('../generators/generator-constants');
const expectedFiles = require('./utils/expected-files').entity;

const { CLIENT_MAIN_SRC_DIR, SERVER_MAIN_SRC_DIR, SERVER_MAIN_RES_DIR, SERVER_TEST_SRC_DIR } = constants;

describe('JHipster generator for entity', () => {
  context('creation from CLI', () => {
    context('monolith with elasticsearch', () => {
      describe('search, no dto, no service, no pagination', () => {
        before(async () => {
          await helpers
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
              pagination: 'no',
            });
        });

        it('does creates search files', () => {
          assert.file(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/search/FooSearchRepository.java`);
          assert.file(expectedFiles.server);
          assert.file(expectedFiles.gatling);
        });
      });
    });

    context('monolith with couchbase FTS', () => {
      describe('Couchbase search, no dto, no service, no pagination', () => {
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/default-couchbase-search'), dir);
            })
            .withOptions({ creationTimestamp: '2016-01-20', withEntities: true })
            .withArguments(['foo'])
            .withPrompts({
              fieldAdd: false,
              relationshipAdd: false,
              dto: 'no',
              service: 'no',
              pagination: 'no',
            });
        });

        it('does creates search files', () => {
          assert.file(`${SERVER_MAIN_RES_DIR}config/couchmove/changelog/V20160120000100__foo.fts`);
          assert.file(expectedFiles.server);
          assert.file(expectedFiles.gatling);
        });
      });
    });

    context('monolith with entity and dto suffixes', () => {
      describe('with entity and dto suffixes', () => {
        before(() =>
          helpers
            .create(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/entity-dto-suffixes'), dir);
            })
            .withArguments(['foo'])
            .withPrompts({
              fieldAdd: false,
              relationshipAdd: false,
              dto: 'mapstruct',
              service: 'serviceImpl',
            })
            .run()
        );

        it('creates expected files with suffix', () => {
          assert.file([
            '.jhipster/Foo.json',
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
          ]);
        });

        it('correctly writes the repository', () => {
          assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.java`, 'public interface FooRepository ');
        });

        it('correctly writes the entity', () => {
          assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.java`, 'public class FooXXX implements Serializable');
        });

        it('correctly writes the dto file', () => {
          assert.fileContent(
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.java`,
            'public class FooYYY implements Serializable'
          );
        });
      });

      describe('with entity suffix and no dto', () => {
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/entity-dto-suffixes'), dir);
            })
            .withArguments(['foo'])
            .withPrompts({
              fieldAdd: false,
              relationshipAdd: false,
              dto: 'no',
              service: 'serviceImpl',
            });
        });

        it('creates expected files with suffix', () => {
          assert.file([
            '.jhipster/Foo.json',
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/FooResource.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
          ]);

          assert.noFile([
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooYYY.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.java`,
          ]);

          assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/repository/FooRepository.java`, 'public interface FooRepository ');

          assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/FooXXX.java`, 'public class FooXXX implements Serializable');
        });
      });
    });

    context('monolith with angularX', () => {
      describe('no dto, no service, no pagination', () => {
        before(async () => {
          await helpers
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
              pagination: 'no',
            });
        });

        it('creates expected default files', () => {
          assert.file(expectedFiles.server);
          assert.file(expectedFiles.clientNg2);
          assert.file(expectedFiles.gatling);
          assert.file(expectedFiles.fakeData);
        });
      });

      describe('no dto, no service, with pagination', () => {
        before(async () => {
          await helpers
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
              pagination: 'pagination',
            });
        });

        it('creates expected default files', () => {
          assert.file(expectedFiles.server);
          assert.file(expectedFiles.clientNg2);
          assert.file(expectedFiles.gatling);
        });
      });

      describe('no dto, no service, with infinite-scroll', () => {
        before(async () => {
          await helpers
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
              pagination: 'infinite-scroll',
            });
        });

        it('creates expected default files', () => {
          assert.file(expectedFiles.server);
          assert.file(expectedFiles.clientNg2);
          assert.file(expectedFiles.gatling);
        });
      });

      describe('no dto, with serviceImpl, no pagination', () => {
        before(async () => {
          await helpers
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
              pagination: 'no',
            });
        });

        it('creates expected default files', () => {
          assert.file(expectedFiles.server);
          assert.file(expectedFiles.clientNg2);
          assert.file(expectedFiles.gatling);
          assert.file([
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/impl/FooServiceImpl.java`,
          ]);
        });
      });

      describe('with dto, service, no pagination', () => {
        before(async () => {
          await helpers
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
              pagination: 'no',
            });
        });

        it('creates expected default files', () => {
          assert.file(expectedFiles.server);
          assert.file(expectedFiles.clientNg2);
          assert.file(expectedFiles.gatling);
          assert.file([
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
          ]);
        });
      });

      describe('with angular suffix', () => {
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
            })
            .withArguments(['foo'])
            .withOptions({ angularSuffix: 'management' })
            .withPrompts({
              fieldAdd: false,
              relationshipAdd: false,
              dto: 'yes',
              service: 'serviceImpl',
              pagination: 'infinite-scroll',
            });
        });

        it('creates expected default files', () => {
          assert.file(expectedFiles.server);
          assert.file(expectedFiles.clientNg2WithSuffix);
          assert.file(expectedFiles.gatling);
          assert.fileContent('.jhipster/Foo.json', 'angularJSSuffix');
        });
      });

      describe('with client-root-folder', () => {
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
            })
            .withArguments(['foo'])
            .withOptions({ clientRootFolder: 'test-root' })
            .withPrompts({
              fieldAdd: false,
              relationshipAdd: false,
              dto: 'yes',
              service: 'serviceImpl',
              pagination: 'infinite-scroll',
            });
        });

        it('creates expected default files', () => {
          assert.file(expectedFiles.server);
          assert.file(expectedFiles.clientNg2WithRootFolder);
          assert.file(expectedFiles.gatling);
          assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
        });
      });

      describe('with client-root-folder and angular-suffix', () => {
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
            })
            .withArguments(['foo'])
            .withOptions({ clientRootFolder: 'test-root', angularSuffix: 'management' })
            .withPrompts({
              fieldAdd: false,
              relationshipAdd: false,
              dto: 'yes',
              service: 'serviceImpl',
              pagination: 'infinite-scroll',
            });
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
        before(async () => {
          await helpers
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
              pagination: 'no',
            });
        });

        it('creates expected default files', () => {
          assert.noFile(expectedFiles.fakeData);
        });
      });
    });

    context('no i18n', () => {
      describe('with dto, serviceImpl, with hazelcast, elasticsearch', () => {
        before(async () => {
          await helpers
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
              pagination: 'infinite-scroll',
            });
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
        before(async () => {
          await helpers
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
              pagination: 'no',
            });
        });

        it('creates expected languages files', () => {
          constants.LANGUAGES.forEach(language => {
            assert.file([`${CLIENT_MAIN_SRC_DIR}i18n/${language.value}/foo.json`]);
          });
        });
      });

      describe('no dto, no service, no pagination with client-root-folder', () => {
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/all-languages'), dir);
            })
            .withArguments(['foo'])
            .withOptions({ clientRootFolder: 'test-root' })
            .withPrompts({
              fieldAdd: false,
              relationshipAdd: false,
              dto: 'no',
              service: 'no',
              pagination: 'no',
            });
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
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
            })
            .withArguments(['foo'])
            .withOptions({ clientRootFolder: 'test-root' })
            .withPrompts({
              fieldAdd: false,
              relationshipAdd: false,
              dto: 'yes',
              service: 'serviceImpl',
              pagination: 'infinite-scroll',
            });
        });

        it('sets expected custom clientRootFolder', () => {
          assert.jsonFileContent('.jhipster/Foo.json', { clientRootFolder: 'test-root' });
          assert.file(expectedFiles.server);
          assert.noFile(expectedFiles.clientNg2WithRootFolder);
        });
      });

      describe('with default microservice', () => {
        before(async () => {
          await helpers
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
              pagination: 'pagination',
            });
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
        before(async () => {
          await helpers
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
              pagination: 'pagination',
            });
        });

        it('sets expected custom databaseType', () => {
          assert.jsonFileContent('.jhipster/Foo.json', { databaseType: 'mongodb' });
        });
      });
    });

    context('gateway', () => {
      describe('with entity from microservice', () => {
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
            })
            .withPrompts({
              useMicroserviceJson: true,
              microservicePath: 'microservice1',
            })
            .withArguments(['bar']);
        });

        it('sets expected default clientRootFolder', () => {
          assert.jsonFileContent('.jhipster/Bar.json', { clientRootFolder: 'sampleMicroservice' });
        });
        it('generates expected files', () => {
          assert.file(`${CLIENT_MAIN_SRC_DIR}i18n/en/sampleMicroserviceBar.json`);
          assert.file(expectedFiles.clientNg2GatewayMicroserviceEntity);
          assert.noFile(expectedFiles.gatling);
          assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/bar/service/bar.service.ts`, 'samplemicroservice');
          assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/bar/bar.module.ts`, 'SampleMicroserviceBarModule');
          assert.noFile(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/web/rest/BarResource.java`);
        });
      });

      describe('with entity from microservice and custom client-root-folder', () => {
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
            })
            .withArguments(['foo'])
            .withPrompts({
              useMicroserviceJson: true,
              microservicePath: 'microservice1',
            });
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
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/default-gateway'), dir);
            })
            .withArguments(['baz'])
            .withPrompts({
              useMicroserviceJson: true,
              microservicePath: 'microservice1',
            });
        });

        it('sets expected custom databaseType from the microservice', () => {
          assert.jsonFileContent('.jhipster/Baz.json', { databaseType: 'mongodb' });
        });
        it('generates expected files', () => {
          assert.file(expectedFiles.clientBazGatewayMicroserviceEntity);
        });
        it('generates a string id for the mongodb entity', () => {
          assert.fileContent(`${CLIENT_MAIN_SRC_DIR}app/entities/sampleMicroservice/baz/baz.model.ts`, 'id?: string');
        });
      });
    });

    describe('with creation timestamp', () => {
      before(async () => {
        await helpers
          .run(require.resolve('../generators/entity'))
          .inTmpDir(dir => {
            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
          })
          .withOptions({ creationTimestamp: '2016-01-20', withEntities: true })
          .withArguments(['foo'])
          .withPrompts({
            fieldAdd: false,
            relationshipAdd: false,
            dto: 'no',
            service: 'no',
            pagination: 'pagination',
          });
      });

      it('creates expected default files', () => {
        assert.file(expectedFiles.server);
        assert.file(expectedFiles.serverLiquibase);
        assert.file(expectedFiles.clientNg2);
        assert.file(expectedFiles.gatling);
      });
    });

    describe('with formated creation timestamp', () => {
      before(async () => {
        await helpers
          .run(require.resolve('../generators/entity'))
          .inTmpDir(dir => {
            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
          })
          .withOptions({ creationTimestamp: '2016-01-20T00:00:00.000Z', withEntities: true })
          .withArguments(['foo'])
          .withPrompts({
            fieldAdd: false,
            relationshipAdd: false,
            dto: 'no',
            service: 'no',
            pagination: 'pagination',
          });
      });

      it('creates expected default files', () => {
        assert.file(expectedFiles.server);
        assert.file(expectedFiles.serverLiquibase);
        assert.file(expectedFiles.clientNg2);
        assert.file(expectedFiles.gatling);
      });
    });

    describe('with wrong base changelog date', () => {
      before(async () => {
        await helpers
          .run(require.resolve('../generators/entity'))
          .inTmpDir(dir => {
            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
          })
          .withOptions({ baseChangelogDate: '20-01-2016' })
          .withArguments(['foo'])
          .withPrompts({
            fieldAdd: false,
            relationshipAdd: false,
            dto: 'no',
            service: 'no',
            pagination: 'pagination',
          });
      });

      it('creates expected default files', () => {
        assert.file(expectedFiles.server);
        assert.noFile(expectedFiles.serverLiquibase);
        assert.file(expectedFiles.clientNg2);
        assert.file(expectedFiles.gatling);
      });
    });
  });

  context('regeneration from json file', () => {
    context('monolith with angularX', () => {
      describe('no dto, no service, no pagination', () => {
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, './templates/default-ng2'), dir);
              fse.copySync(path.join(__dirname, 'templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
            })
            .withArguments(['Foo'])
            .withOptions({ regenerate: true, force: true });
        });

        it('creates expected default files', () => {
          assert.file(expectedFiles.server);
          assert.file(expectedFiles.clientNg2);
          assert.file(expectedFiles.gatling);
        });
        it('generates OpenAPI annotations on domain model', () => {
          assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Foo.java`, /@ApiModelProperty/);
        });
      });
    });

    describe('with --skip-db-changelog', () => {
      describe('SQL database', () => {
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
              fse.copySync(path.join(__dirname, 'templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
            })
            .withArguments(['Foo'])
            .withOptions({ regenerate: true, force: true, skipDbChangelog: true });
        });

        it('creates expected default files', () => {
          assert.file(expectedFiles.server);
          assert.file(expectedFiles.clientNg2);
          assert.file(expectedFiles.gatling);
        });
        it("doesn't creates database changelogs", () => {
          assert.noFile([
            `${constants.SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_Foo.xml`,
            `${constants.SERVER_MAIN_RES_DIR}config/liquibase/changelog/20160926101210_added_entity_constraints_Foo.xml`,
          ]);
        });
      });

      describe('Cassandra database', () => {
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/compose/05-cassandra'), dir);
              fse.copySync(path.join(__dirname, 'templates/.jhipster/Simple.json'), path.join(dir, '.jhipster/Foo.json'));
            })
            .withArguments(['Foo'])
            .withOptions({ regenerate: true, force: true, skipDbChangelog: true });
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
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/default-microservice'), dir);
              fse.copySync(path.join(__dirname, 'templates/.jhipster/DtoServicePagination.json'), path.join(dir, '.jhipster/Foo.json'));
            })
            .withArguments(['Foo'])
            .withOptions({ regenerate: true, force: true });
        });

        it('creates expected default files', () => {
          assert.file(expectedFiles.server);
          assert.noFile(expectedFiles.clientNg2);
          assert.file([
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/mapper/FooMapper.java`,
            `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/FooService.java`,
          ]);
        });
        it('generates OpenAPI annotations on DTO', () => {
          assert.noFileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/Foo.java`, /@ApiModelProperty/);
          assert.fileContent(`${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/service/dto/FooDTO.java`, /@ApiModelProperty/);
        });
      });
    });

    context('reproducible build', () => {
      describe('no dto, no service, no pagination', () => {
        before(async () => {
          await helpers
            .run(require.resolve('../generators/entity'))
            .inTmpDir(dir => {
              fse.copySync(path.join(__dirname, '../test/templates/reproducible'), dir);
            })
            .withArguments(['foo']);
        });

        it('creates expected default files', () => {
          assert.file(expectedFiles.server);
          assert.file(expectedFiles.clientNg2);
          assert.file(expectedFiles.gatling);
          assert.file(expectedFiles.fakeData);
        });

        it('creates reproducible liquibase data', () => {
          assert.fileContent(`${SERVER_MAIN_RES_DIR}config/liquibase/fake-data/foo.csv`, /1;Qatari salmon Monitored;65526;"6"/);
        });

        it('creates reproducible backend test', () => {
          assert.fileContent(
            `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.java`,
            /DEFAULT_NUMBER_PATTERN_REQUIRED = "03126"/
          );
          assert.fileContent(
            `${SERVER_TEST_SRC_DIR}com/mycompany/myapp/web/rest/FooResourceIT.java`,
            /UPDATED_NUMBER_PATTERN_REQUIRED = "557"/
          );
        });
      });
    });

    context('when generating enums', () => {
      let enumWithoutCustomValuesPath;
      let enumWithSomeCustomValuesPath;
      let enumWithOnlyCustomValuesPath;

      before(async () => {
        enumWithoutCustomValuesPath = `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/enumeration/MyEnumA.java`;
        enumWithSomeCustomValuesPath = `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/enumeration/MyEnumB.java`;
        enumWithOnlyCustomValuesPath = `${SERVER_MAIN_SRC_DIR}com/mycompany/myapp/domain/enumeration/MyEnumC.java`;
        await helpers
          .run(require.resolve('../generators/entity'))
          .inTmpDir(dir => {
            fse.copySync(path.join(__dirname, '../test/templates/enums'), dir);
          })
          .withArguments(['A']);
      });

      context('for enum content without custom values', () => {
        it('generates the java enum content', () => {
          assert.fileContent(enumWithoutCustomValuesPath, /AAA,\s+BBB/);
        });
        it('does not generate a private field', () => {
          assert.noFileContent(enumWithoutCustomValuesPath, /private final String value;/);
        });
        it('does not generate an empty constructor', () => {
          assert.noFileContent(enumWithoutCustomValuesPath, /MyEnumA\(\)/);
        });
        it('does not generate a non-empty constructor', () => {
          assert.noFileContent(enumWithoutCustomValuesPath, /MyEnumA\(String value\)/);
        });
        it('does not generate a getter for the value', () => {
          assert.noFileContent(enumWithoutCustomValuesPath, /public String getValue\(\)/);
        });
      });
      context('for enum content with some custom values', () => {
        it('generates the java enum content', () => {
          assert.fileContent(enumWithSomeCustomValuesPath, /AAA\("aaa_aaa"\),\s+BBB;/);
        });
        it('generates a non-final private field', () => {
          assert.fileContent(enumWithSomeCustomValuesPath, /private String value;/);
        });
        it('generates an empty constructor', () => {
          assert.fileContent(enumWithSomeCustomValuesPath, /MyEnumB\(\)/);
        });
        it('generates a non-empty constructor', () => {
          assert.fileContent(enumWithSomeCustomValuesPath, /MyEnumB\(String value\)/);
        });
        it('generates a getter for the value', () => {
          assert.fileContent(enumWithSomeCustomValuesPath, /public String getValue\(\)/);
        });
      });
      context('for enum content with only custom values', () => {
        it('generates the java enum content', () => {
          assert.fileContent(enumWithOnlyCustomValuesPath, /AAA\("aaa_aaa"\),\s+BBB\("bbb"\);/);
        });
        it('generates a final private field', () => {
          assert.fileContent(enumWithOnlyCustomValuesPath, /private final String value;/);
        });
        it('does not generate an empty constructor', () => {
          assert.noFileContent(enumWithOnlyCustomValuesPath, /MyEnumC\(\)/);
        });
        it('generates a non-empty constructor', () => {
          assert.fileContent(enumWithOnlyCustomValuesPath, /MyEnumC\(String value\)/);
        });
        it('generates a getter for the value', () => {
          assert.fileContent(enumWithOnlyCustomValuesPath, /public String getValue\(\)/);
        });
      });
    });
  });
  describe('regeneration from app generator', () => {
    describe('with creation timestamp', () => {
      before(async () => {
        await helpers
          .create(require.resolve('../generators/app'))
          .inTmpDir(dir => {
            fse.copySync(path.join(__dirname, '../test/templates/default-ng2'), dir);
            const jhipsterFolder = path.join(dir, '.jhipster');
            fse.ensureDirSync(jhipsterFolder);
            fse.writeJsonSync(path.join(jhipsterFolder, 'Foo.json'), {});
          })
          .withOptions({ creationTimestamp: '2016-01-20', withEntities: true })
          .run();
      });

      it('creates expected default files', () => {
        assert.file(expectedFiles.server);
        assert.file(expectedFiles.serverLiquibase);
        assert.file(expectedFiles.clientNg2);
        assert.file(expectedFiles.gatling);
      });
    });
  });
});
