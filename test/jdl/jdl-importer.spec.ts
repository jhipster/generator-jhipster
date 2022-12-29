/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new, no-unused-expressions */
import { jestExpect } from 'mocha-expect-snapshot';
import fse from 'fs-extra';
import path from 'path';
import { expect } from 'chai';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { applicationTypes, clientFrameworkTypes, databaseTypes } from '../../jdl/jhipster/index.mjs';
import { createImporterFromFiles, createImporterFromContent } from '../../jdl/jdl-importer.js';

const { MONOLITH } = applicationTypes;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { NO: NO_CLIENT_FRAMEWORK } = clientFrameworkTypes;

describe('JDLImporter', () => {
  describe('createImporterFromFiles', () => {
    context('when not passing files', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => createImporterFromFiles()).to.throw(/^Files must be passed to create a new JDL importer\.$/);
      });
    });
  });
  describe('createImporterFromContent', () => {
    context('when not passing any content', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => createImporterFromContent()).to.throw(/^A JDL content must be passed to create a new JDL importer\.$/);
      });
    });
  });
  describe('import', () => {
    context('when not parsing applications', () => {
      const ENTITY_NAMES = ['Country', 'Department', 'Employee', 'Job', 'JobHistory', 'Location', 'Region', 'Task'];
      let filesExist: any = true;
      let returned;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'big_sample.jdl')], {
          applicationName: 'MyApp',
          applicationType: MONOLITH,
          databaseType: databaseTypes.SQL,
        });
        returned = importer.import();
        returned.exportedEntities = returned.exportedEntities
          .sort((exportedEntityA, exportedEntityB) => {
            if (exportedEntityA.entityTableName < exportedEntityB.entityTableName) {
              return -1;
            }
            return 1;
          })
          .map(exportedEntity => {
            exportedEntity.javadoc = exportedEntity.javadoc || '';
            return exportedEntity;
          });
        filesExist = ENTITY_NAMES.reduce(
          (result, entityName) => result && fse.statSync(path.join('.jhipster', `${entityName}.json`)).isFile()
        );
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('should return the final state', () => {
        jestExpect(returned).toMatchSnapshot();
      });
      it('should create the files', () => {
        expect(filesExist).to.be.true;
      });
      ENTITY_NAMES.forEach(entityName => {
        it(`should export entity ${entityName}`, () => {
          const entityContent = JSON.parse(fse.readFileSync(path.join('.jhipster', `${entityName}.json`), 'utf-8'));
          jestExpect(entityContent).toMatchSnapshot();
        });
      });
    });
    context('when passing an existing application config', () => {
      let importer;

      before(() => {
        importer = createImporterFromContent(
          `entity A
entity User
relationship OneToOne {
  User{a} to A
}
`,
          {
            application: JSON.parse(fse.readFileSync(path.join(__dirname, 'test-files', 'jhipster_app', '.yo-rc.json'), 'utf-8')),
          }
        );
      });

      it('should not fail', () => {
        expect(() => importer.import()).not.to.throw();
      });
    });
    context('when parsing one JDL application and entities', () => {
      let returned;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'application_with_entities.jdl')]);
        returned = importer.import();
      });

      after(() => {
        fse.unlinkSync('.yo-rc.json');
        fse.removeSync('.jhipster');
      });

      it('should return the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
        expect(returned.exportedDeployments).to.have.lengthOf(0);
      });
      it('should create the app config file in the same folder', () => {
        expect(fse.statSync('.yo-rc.json').isFile()).to.be.true;
      });
      it('should create the entity folder in the same folder', () => {
        expect(fse.statSync('.jhipster').isDirectory()).to.be.true;
        expect(fse.statSync(path.join('.jhipster', 'BankAccount.json')).isFile()).to.be.true;
      });
      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = application.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(applicationWithEntities.entities);
        });
      });
    });
    context('when parsing two JDL applications with and without entities ', () => {
      let returned;
      const APPLICATION_NAMES = ['app1', 'app2'];

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'applications_with_and_without_entities.jdl')]);
        returned = importer.import();
      });

      after(() => {
        APPLICATION_NAMES.forEach(applicationName => {
          fse.removeSync(applicationName);
        });
      });

      it('should return the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(2);
        expect(Object.keys(returned.exportedApplicationsWithEntities).length).to.equal(2);
        expect(returned.exportedDeployments).to.have.lengthOf(0);
      });
      it('should create the folders and the .yo-rc.json files', () => {
        APPLICATION_NAMES.forEach(applicationName => {
          expect(fse.statSync(path.join(applicationName, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(applicationName).isDirectory()).to.be.true;
        });
      });
      it('should create the entity folder in only one app folder', () => {
        expect(fse.existsSync(path.join(APPLICATION_NAMES[0], '.jhipster'))).to.be.false;
        expect(fse.statSync(path.join(APPLICATION_NAMES[1], '.jhipster')).isDirectory()).to.be.true;
        expect(fse.statSync(path.join(APPLICATION_NAMES[1], '.jhipster', 'BankAccount.json')).isFile()).to.be.true;
      });
      it('should export the application contents', () => {
        expect(returned.exportedApplicationsWithEntities[APPLICATION_NAMES[0]].entities).to.have.lengthOf(0);
        expect(returned.exportedApplicationsWithEntities[APPLICATION_NAMES[1]].entities).to.have.lengthOf(1);
      });
      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = application.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(applicationWithEntities.entities);
        });
      });
    });
    context('when parsing one JDL application and entities passed as string', () => {
      let returned;

      before(() => {
        const importer = createImporterFromContent(
          `application {
            config {
              baseName MyApp
              applicationType microservice
              jwtSecretKey "aaa.bbb.ccc"
            }
            entities * except Customer
          }

          entity BankAccount
          entity Customer
          `,
          {}
        );
        returned = importer.import();
      });

      after(() => {
        fse.unlinkSync('.yo-rc.json');
        fse.removeSync('.jhipster');
      });

      it('should return the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
        expect(returned.exportedDeployments).to.have.lengthOf(0);
      });
      it('should create the app config file in the same folder', () => {
        expect(fse.statSync('.yo-rc.json').isFile()).to.be.true;
      });
      it('should create the entity folder in the same folder', () => {
        expect(fse.statSync('.jhipster').isDirectory()).to.be.true;
        expect(fse.statSync(path.join('.jhipster', 'BankAccount.json')).isFile()).to.be.true;
      });
      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = application.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(applicationWithEntities.entities);
        });
      });
    });
    context('when parsing one JDL application and entities with entity and dto suffixes', () => {
      let returned;
      let content;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'application_with_entity_dto_suffixes.jdl')]);
        returned = importer.import();

        content = JSON.parse(fse.readFileSync('.yo-rc.json', 'utf-8'));
      });

      after(() => {
        fse.unlinkSync('.yo-rc.json');
        fse.removeSync('.jhipster');
      });

      it('should return the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
      });
      it('should create the app config file in the same folder', () => {
        expect(fse.statSync('.yo-rc.json').isFile()).to.be.true;
        expect(content['generator-jhipster'].entitySuffix).to.equal('Entity');
        expect(content['generator-jhipster'].dtoSuffix).to.equal('DTO');
      });

      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = application.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(applicationWithEntities.entities);
        });
      });
    });
    context('when parsing JDL applications and exporting them', () => {
      const contents: any[] = [];
      const APPLICATION_NAMES = ['tata', 'titi', 'toto', 'tutu'];

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'applications2.jdl')]);
        importer.import();
        APPLICATION_NAMES.forEach(applicationName => {
          contents.push(JSON.parse(fse.readFileSync(path.join(applicationName, '.yo-rc.json'), 'utf-8')));
        });
      });

      after(() => {
        APPLICATION_NAMES.forEach(applicationName => {
          fse.removeSync(applicationName);
        });
      });

      it('should create the folders and the .yo-rc.json files', () => {
        APPLICATION_NAMES.forEach(applicationName => {
          expect(fse.statSync(path.join(applicationName, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(applicationName).isDirectory()).to.be.true;
        });
      });
      it('should export the application contents', () => {
        jestExpect(contents).toMatchSnapshot();
      });
    });
    context('when parsing multiple JDL files with applications and entities', () => {
      const APPLICATION_NAMES = ['myFirstApp', 'mySecondApp', 'myThirdApp'];
      const ENTITY_NAMES = ['A', 'B', 'E', 'F']; // C & D don't get to be generated
      let importState;
      before(() => {
        const importer = createImporterFromFiles([
          path.join(__dirname, 'test-files', 'integration', 'file1.jdl'),
          path.join(__dirname, 'test-files', 'integration', 'file2.jdl'),
        ]);
        importState = importer.import();
      });

      after(() => {
        APPLICATION_NAMES.forEach(applicationName => {
          fse.removeSync(path.join(applicationName));
        });
      });

      it('should generate correct import state', () => {
        expect(importState.exportedApplications.length).to.eql(3);
        expect(importState.exportedEntities.length).to.eql(4);
      });

      APPLICATION_NAMES.forEach(applicationName => {
        it(`should export ${applicationName} applications`, () => {
          expect(fse.statSync(path.join(applicationName)).isDirectory()).to.be.true;
          const appConfPath = path.join(applicationName, '.yo-rc.json');
          expect(fse.statSync(appConfPath).isFile()).to.be.true;
          const readJSON = JSON.parse(fse.readFileSync(appConfPath, 'utf-8').toString());
          jestExpect(readJSON).toMatchSnapshot();
        });
      });

      APPLICATION_NAMES.forEach(applicationName => {
        it(`should export the entities for ${applicationName}`, () => {
          let readJSON;
          expect(fse.statSync(path.join(applicationName, '.jhipster')).isDirectory()).to.be.true;
          switch (applicationName) {
            case 'myFirstApp': // A, B, E, F
              ENTITY_NAMES.forEach(entityName => {
                readJSON = JSON.parse(fse.readFileSync(path.join(applicationName, '.jhipster', `${entityName}.json`), 'utf-8').toString());
                jestExpect(readJSON).toMatchSnapshot();
              });
              break;
            case 'mySecondApp': // only E
              readJSON = JSON.parse(fse.readFileSync(path.join(applicationName, '.jhipster', 'E.json'), 'utf-8').toString());
              jestExpect(readJSON).toMatchSnapshot();
              break;
            case 'myThirdApp': // only F
              readJSON = JSON.parse(fse.readFileSync(path.join(applicationName, '.jhipster', 'F.json'), 'utf-8').toString());
              jestExpect(readJSON).toMatchSnapshot();
              break;
            default:
            // nothing to do
          }
        });
      });
      it('should return the corresponding exportedApplicationsWithEntities', () => {
        importState.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = application.entities || [];
          const applicationWithEntities = importState.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
          expect(importState.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(
            applicationWithEntities.entities
          );
        });
      });
    });
    context("when choosing 'no' as database type", () => {
      let importer;

      before("importing a JDL file with the 'no' database type", () => {
        importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'simple.jdl')], {
          applicationName: 'MyApp',
          applicationType: MONOLITH,
          databaseType: databaseTypes.NO,
        });
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('does not fail', () => {
        importer.import();
      });
    });
    context('when parsing a JDL with annotations', () => {
      let returned;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'annotations.jdl')], {
          applicationName: 'toto',
          databaseType: databaseTypes.SQL,
        });
        returned = importer.import();
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('sets the options', () => {
        expect(returned.exportedEntities[0].service).to.equal('serviceClass');
        expect(returned.exportedEntities[0].dto).to.equal('mapstruct');
        expect(returned.exportedEntities[0].skipClient).to.be.true;
        expect(returned.exportedEntities[0].myCustomUnaryOption).to.be.true;
        expect(returned.exportedEntities[0].myCustomBinaryOption).to.equal('customValue');
        expect(returned.exportedEntities[1].pagination).to.equal('pagination');
        expect(returned.exportedEntities[1].dto).to.equal('mapstruct');
        expect(returned.exportedEntities[1].service).to.equal('serviceClass');
        expect(returned.exportedEntities[2].skipClient).to.be.true;
        expect(returned.exportedEntities[2].jpaMetamodelFiltering).to.be.true;
        expect(returned.exportedEntities[2].pagination).to.equal('pagination');
        expect(returned.exportedEntities[2].myCustomBinaryOption).to.equal('customValue2');
        expect(returned.exportedEntities[0].fields[0].options.id).to.be.true;
        expect(returned.exportedEntities[0].fields[0].options.multiValue).to.deep.equal(['value1', 'value2', 'value3']);
      });
    });
    context('when parsing a JDL with a pattern validation', () => {
      let returned;
      let entityContent;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'regex_validation.jdl')], {
          applicationName: 'MyApp',
          applicationType: MONOLITH,
          databaseType: databaseTypes.SQL,
        });
        returned = importer.import();
        entityContent = JSON.parse(fse.readFileSync(path.join('.jhipster', 'Customer.json'), { encoding: 'utf8' }));
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('escapes the back-slash in the returned object', () => {
        expect(returned.exportedEntities[0].fields[0].fieldValidateRulesPattern).to.equal('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$');
      });
      it('escapes the back-slash in the written entity file', () => {
        expect(entityContent.fields[0].fieldValidateRulesPattern).to.equal('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$');
      });
    });
    context('when parsing a JDL with a pattern validation containing a quote', () => {
      let returned;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'pattern_validation_with_quote.jdl')], {
          applicationName: 'MyApp',
          applicationType: MONOLITH,
          databaseType: databaseTypes.SQL,
        });
        returned = importer.import();
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('escapes the quote', () => {
        expect(returned.exportedEntities[0].fields[0].fieldValidateRulesPattern.includes("\\'")).to.be.true;
      });
    });
    context('when parsing JDL applications and deployment config', () => {
      const contents: any[] = [];
      const APPLICATION_NAMES = ['tata', 'titi', 'toto', 'tutu'];

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'applications3.jdl')]);
        importer.import();
        APPLICATION_NAMES.forEach(applicationName => {
          contents.push(JSON.parse(fse.readFileSync(path.join(applicationName, '.yo-rc.json'), 'utf-8')));
        });
        contents.push(JSON.parse(fse.readFileSync(path.join('docker-compose', '.yo-rc.json'), 'utf-8')));
      });

      after(() => {
        APPLICATION_NAMES.forEach(applicationName => {
          fse.removeSync(applicationName);
        });
        fse.removeSync('docker-compose');
      });

      it('should create the folders and the .yo-rc.json files', () => {
        APPLICATION_NAMES.forEach(applicationName => {
          expect(fse.statSync(path.join(applicationName, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(applicationName).isDirectory()).to.be.true;
        });
      });
      it('should create the docker-compose folder with .yo-rc.json file', () => {
        expect(fse.statSync(path.join('docker-compose', '.yo-rc.json')).isFile()).to.be.true;
        expect(fse.statSync('docker-compose').isDirectory()).to.be.true;
      });
      it('should export the application & deployment contents', () => {
        jestExpect(contents).toMatchSnapshot();
      });
    });
    context('when parsing deployment config', () => {
      const contents: any[] = [];
      const DEPLOYMENT_NAMES = ['docker-compose', 'kubernetes', 'openshift'];

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'deployments.jdl')]);
        importer.import();
        DEPLOYMENT_NAMES.forEach(name => {
          contents.push(JSON.parse(fse.readFileSync(path.join(name, '.yo-rc.json'), 'utf-8')));
        });
      });

      after(() => {
        DEPLOYMENT_NAMES.forEach(name => {
          fse.removeSync(name);
        });
      });

      it('should create the folders and the .yo-rc.json files', () => {
        DEPLOYMENT_NAMES.forEach(name => {
          expect(fse.statSync(path.join(name, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(name).isDirectory()).to.be.true;
        });
      });
      it('should export the deployment contents', () => {
        jestExpect(contents).toMatchSnapshot();
      });
    });
    context('when parsing JDL applications and deployment config with a realistic sample', () => {
      const contents: any[] = [];
      const FOLDER_NAMES = ['store', 'product', 'invoice', 'notification', 'docker-compose', 'kubernetes'];

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'realistic_sample.jdl')]);
        importer.import();
        FOLDER_NAMES.forEach(applicationName => {
          contents.push(JSON.parse(fse.readFileSync(path.join(applicationName, '.yo-rc.json'), 'utf-8')));
        });
      });

      after(() => {
        FOLDER_NAMES.forEach(applicationName => {
          fse.removeSync(applicationName);
        });
      });

      it('should create the folders and the .yo-rc.json files', () => {
        FOLDER_NAMES.forEach(applicationName => {
          expect(fse.statSync(path.join(applicationName, '.yo-rc.json')).isFile()).to.be.true;
          expect(fse.statSync(applicationName).isDirectory()).to.be.true;
        });
      });
      it('should export the application & deployment contents', () => {
        jestExpect(contents).toMatchSnapshot();
      });
    });
    context('when parsing entities and enums with custom values', () => {
      let exported;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'enum_with_values.jdl')], {
          applicationName: 'toto',
          applicationType: 'monolith',
          databaseType: 'sql',
          generatorVersion: '6.4.1',
        });
        importer.import();
        exported = JSON.parse(fse.readFileSync(path.join('.jhipster', 'Environment.json'), 'utf-8'));
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('should export them', () => {
        expect(exported.fields[0].fieldValues).to.equal(
          'ARCHIVE (archive),DEV (development),INTEGRATION (integration),PROD (production),TEST (test),UAT (uat),NON_PROD (nonProd)'
        );
      });
    });
    context('when parsing JDL applications with options inside', () => {
      let entityA;
      let entityB;
      let entityCInTata;
      let entityCInTutu;
      let entityD;
      let entityE;
      let entityF;

      before(() => {
        const importer = createImporterFromContent(
          `application {
  config {
    applicationType monolith
    baseName tata
  }
  entities A, B, C
  paginate A, C with pagination
}
application {
  config {
    applicationType monolith
    baseName tutu
  }
  entities C, D, E
  dto D with mapstruct
}
entity A
entity B
entity C
entity D
entity E
entity F

paginate * with infinite-scroll
`,
          {
            generatorVersion: '7.0.0',
          }
        );
        importer.import();
        entityA = JSON.parse(fse.readFileSync(path.join('tata', '.jhipster', 'A.json'), 'utf-8'));
        entityB = JSON.parse(fse.readFileSync(path.join('tata', '.jhipster', 'B.json'), 'utf-8'));
        entityCInTata = JSON.parse(fse.readFileSync(path.join('tata', '.jhipster', 'C.json'), 'utf-8'));
        entityCInTutu = JSON.parse(fse.readFileSync(path.join('tutu', '.jhipster', 'C.json'), 'utf-8'));
        entityD = JSON.parse(fse.readFileSync(path.join('tutu', '.jhipster', 'D.json'), 'utf-8'));
        entityE = JSON.parse(fse.readFileSync(path.join('tutu', '.jhipster', 'E.json'), 'utf-8'));
        entityF =
          fse.pathExistsSync(path.join('tata', '.jhipster', 'F.json')) || fse.pathExistsSync(path.join('tutu', '.jhipster', 'F.json'));
      });

      after(() => {
        fse.removeSync('tata');
        fse.removeSync('tutu');
      });

      it('should set them', () => {
        jestExpect(entityA).toMatchInlineSnapshot(`
Object {
  "applications": Array [
    "tata",
  ],
  "dto": "no",
  "embedded": false,
  "entityTableName": "a",
  "fields": Array [],
  "fluentMethods": true,
  "jpaMetamodelFiltering": false,
  "name": "A",
  "pagination": "pagination",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
        jestExpect(entityB).toMatchInlineSnapshot(`
Object {
  "applications": Array [
    "tata",
  ],
  "dto": "no",
  "embedded": false,
  "entityTableName": "b",
  "fields": Array [],
  "fluentMethods": true,
  "jpaMetamodelFiltering": false,
  "name": "B",
  "pagination": "infinite-scroll",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
        jestExpect(entityCInTata).toMatchInlineSnapshot(`
Object {
  "applications": Array [
    "tata",
    "tutu",
  ],
  "dto": "no",
  "embedded": false,
  "entityTableName": "c",
  "fields": Array [],
  "fluentMethods": true,
  "jpaMetamodelFiltering": false,
  "name": "C",
  "pagination": "pagination",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
        jestExpect(entityCInTutu).toMatchInlineSnapshot(`
Object {
  "applications": Array [
    "tata",
    "tutu",
  ],
  "dto": "no",
  "embedded": false,
  "entityTableName": "c",
  "fields": Array [],
  "fluentMethods": true,
  "jpaMetamodelFiltering": false,
  "name": "C",
  "pagination": "pagination",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
        jestExpect(entityD).toMatchInlineSnapshot(`
Object {
  "applications": Array [
    "tutu",
  ],
  "dto": "mapstruct",
  "embedded": false,
  "entityTableName": "d",
  "fields": Array [],
  "fluentMethods": true,
  "jpaMetamodelFiltering": false,
  "name": "D",
  "pagination": "infinite-scroll",
  "readOnly": false,
  "relationships": Array [],
  "service": "serviceClass",
}
`);
        jestExpect(entityE).toMatchInlineSnapshot(`
Object {
  "applications": Array [
    "tutu",
  ],
  "dto": "no",
  "embedded": false,
  "entityTableName": "e",
  "fields": Array [],
  "fluentMethods": true,
  "jpaMetamodelFiltering": false,
  "name": "E",
  "pagination": "infinite-scroll",
  "readOnly": false,
  "relationships": Array [],
  "service": "no",
}
`);
      });
      it('should not generate entity not in any app', () => {
        expect(entityF).to.be.false;
      });
    });
    context('when passing the skipFileGeneration option', () => {
      before(() => {
        expect(fse.existsSync('.yo-rc.json')).to.be.false;
        expect(fse.existsSync('.jhipster')).to.be.false;

        const importer = createImporterFromContent(
          `application {
  config {
    applicationType monolith
    baseName tata
    clientFramework angular
  }
  entities A
}

entity A

paginate * with infinite-scroll
`,
          {
            generatorVersion: '7.0.0',
            skipFileGeneration: true,
          }
        );
        importer.import();
      });

      it('should not write the .yo-rc.json file', () => {
        expect(fse.existsSync('.yo-rc.json')).to.be.false;
      });

      it('should not create the .jhipster folder', () => {
        expect(fse.existsSync('.jhipster')).to.be.false;
      });
    });
    context('when passing the unidirectionalRelationships option', () => {
      const entities = `
entity A
entity B

relationship OneToOne {
  A{oneToOneB} to B
  A{biOneToOneB} to B{biOneToOneA}
}
relationship ManyToOne {
  A{manyToOneB} to B
  A{biManyToOneB} to B{biManyToOneA}
}
relationship OneToMany {
  A{oneToManyB} to B
  A{biOneToManyB} to B{biOneToManyA}
}
relationship ManyToMany {
  A{manyToManyB} to B
  A{biManyToManyB} to B{biManyToManyA}
}
`;
      context('when passing without application config', () => {
        let importer;

        before(() => {
          importer = createImporterFromContent(entities, {
            unidirectionalRelationships: true,
            applicationName: 'jhipter',
            databaseType: 'postgresql',
          });
        });

        after(() => {
          fse.removeSync('.jhipster');
        });

        it('should not fail', () => {
          expect(() => importer.import()).not.to.throw();
        });
      });
      context('when parsing one JDL application and entities', () => {
        let returned;

        before(() => {
          const importer = createImporterFromContent(
            `
application {
  config{
    prodDatabaseType postgresql
  }
  entities A, B
}
${entities}`,
            {
              unidirectionalRelationships: true,
            }
          );
          returned = importer.import();
        });

        after(() => {
          fse.unlinkSync('.yo-rc.json');
          fse.removeSync('.jhipster');
        });

        it('should return the import state', () => {
          expect(returned.exportedEntities).to.have.lengthOf(2);
          expect(returned.exportedApplications).to.have.lengthOf(1);
          expect(returned.exportedDeployments).to.have.lengthOf(0);
        });
        it('should return the corresponding exportedApplicationsWithEntities', () => {
          returned.exportedApplications.forEach(application => {
            const applicationConfig = application['generator-jhipster'];
            const entityNames = application.entities || [];
            const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
            expect(applicationConfig).to.be.eql(applicationWithEntities.config);
            expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
            expect(returned.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(
              applicationWithEntities.entities
            );
            jestExpect(applicationWithEntities.entities).toMatchSnapshot();
          });
        });
      });
    });
    context('when not exporting entities but only applications', () => {
      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'application.jdl')]);
        importer.import();
      });
      after(() => {
        fse.removeSync('.yo-rc.json');
      });
      it('should export the .yo-rc.json file', () => {
        expect(fse.existsSync('.yo-rc.json')).to.be.true;
      });
      it('should not create the .jhipster folder', () => {
        expect(fse.existsSync('.jhipster')).to.be.false;
      });
    });
    context('when importing a JDL application with blueprints', () => {
      let importState;
      let parameter;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, 'test-files', 'application_with_blueprints.jdl')]);
        const logger = {
          warn: callParameter => {
            parameter = callParameter;
          },
        };
        importState = importer.import(logger as Console);
      });
      after(() => {
        fse.removeSync('.yo-rc.json');
      });

      it('should return the blueprints attributes in the application', () => {
        expect(importState.exportedApplications).to.deep.equal([
          {
            entities: [],
            'generator-jhipster': {
              applicationType: 'monolith',
              authenticationType: 'jwt',
              baseName: 'appWithBlueprints',
              blueprints: [{ name: 'generator-jhipster-vuejs' }, { name: 'generator-jhipster-dotnetcore' }],
              buildTool: 'maven',
              cacheProvider: 'ehcache',
              clientFramework: 'angular',
              clientPackageManager: 'npm',
              clientTheme: 'none',
              clientThemeVariant: '',
              databaseType: 'sql',
              devDatabaseType: 'h2Disk',
              dtoSuffix: 'DTO',
              enableGradleEnterprise: false,
              enableHibernateCache: true,
              enableSwaggerCodegen: false,
              enableTranslation: true,
              entitySuffix: '',
              gradleEnterpriseHost: '',
              jhiPrefix: 'jhi',
              languages: [],
              messageBroker: 'no',
              nativeLanguage: 'en',
              packageFolder: 'com/mycompany/myapp',
              packageName: 'com.mycompany.myapp',
              prodDatabaseType: 'postgresql',
              searchEngine: 'no',
              reactive: false,
              serverPort: 8080,
              serviceDiscoveryType: 'no',
              skipUserManagement: false,
              testFrameworks: [],
              websocket: 'no',
              withAdminUi: true,
            },
          },
        ]);
      });

      it('should warn about not performing jdl validation', () => {
        expect(parameter).to.equal('Blueprints are being used, the JDL validation phase is skipped.');
      });
    });
    context('when choosing neo4j as database type', () => {
      let importState;

      before(() => {
        const content = `entity Person {
   name String
}

relationship OneToMany {
   Person{friends} to Person
}`;
        const importer = createImporterFromContent(content, {
          applicationName: 'toto',
          databaseType: 'neo4j',
        });
        importState = importer.import();
      });
      after(() => {
        fse.removeSync('.jhipster');
      });

      it('should not generate a bidirectional one-to-many relationship', () => {
        expect(importState.exportedEntities[0].relationships).to.have.length(1);
      });
    });
    context('when having the use-options', () => {
      let importState;

      before(() => {
        const content = `application {
  config {
    baseName toto
  }
  entities A, B, C
  use serviceImpl for * except C
}

entity A
entity B
entity C

use mapstruct, elasticsearch for A, B except C`;
        const importer = createImporterFromContent(content, {
          applicationName: 'toto',
          databaseType: 'sql',
        });
        importState = importer.import();
      });
      after(() => {
        fse.removeSync('.jhipster');
        fse.unlinkSync('.yo-rc.json');
      });

      it('should add the options', () => {
        expect(importState.exportedEntities[0].dto).to.equal('mapstruct');
        expect(importState.exportedEntities[1].dto).to.equal('mapstruct');
        expect(importState.exportedEntities[2].dto).not.to.equal('mapstruct');
        expect(importState.exportedEntities[0].service).to.equal('serviceImpl');
        expect(importState.exportedEntities[1].service).to.equal('serviceImpl');
        expect(importState.exportedEntities[2].service).not.to.equal('serviceImpl');
        expect(importState.exportedEntities[0].searchEngine).to.equal('elasticsearch');
        expect(importState.exportedEntities[1].searchEngine).to.equal('elasticsearch');
        expect(importState.exportedEntities[2].searchEngine).not.to.equal('elasticsearch');
      });
    });
    context('when parsing a JDL content with invalid tokens', () => {
      let caughtError;

      before(() => {
        const content = `application {
  config {
    baseName toto
    databaseType sql
    unknownOption toto
  }
  entities A
}

entity A
`;
        try {
          const importer = createImporterFromContent(content);
          importer.import();
        } catch (error) {
          caughtError = error;
        }
      });

      it('should report it', () => {
        expect(caughtError.message).to.equal(
          "MismatchedTokenException: Found an invalid token 'unknownOption', at line: 5 and column: 5.\n\tPlease make sure your JDL content does not use invalid characters, keywords or options."
        );
      });
    });
    context('when parsing relationships with annotations and options', () => {
      let relationshipOnSource;
      let relationshipOnDestination;

      before(() => {
        const content = `entity A
entity B

relationship OneToOne {
  @id A{b} to @NotId(value) @Something B{a} with jpaDerivedIdentifier
}
`;
        const importer = createImporterFromContent(content, { databaseType: 'postgresql', applicationName: 'toto' });
        const imported = importer.import();
        relationshipOnSource = imported.exportedEntities[0].relationships[0];
        relationshipOnDestination = imported.exportedEntities[1].relationships[0];
      });

      after(() => {
        fse.removeSync('.jhipster');
      });

      it('should export them', () => {
        jestExpect(relationshipOnSource).toMatchInlineSnapshot(`
Object {
  "options": Object {
    "notId": "value",
    "something": true,
  },
  "otherEntityName": "b",
  "otherEntityRelationshipName": "a",
  "ownerSide": true,
  "relationshipName": "b",
  "relationshipType": "one-to-one",
  "useJPADerivedIdentifier": true,
}
`);
        jestExpect(relationshipOnDestination).toMatchInlineSnapshot(`
Object {
  "options": Object {
    "id": true,
  },
  "otherEntityName": "a",
  "otherEntityRelationshipName": "b",
  "ownerSide": false,
  "relationshipName": "a",
  "relationshipType": "one-to-one",
}
`);
      });
    });
    context('when importing a JDL application with microfrontends', () => {
      it('should return the microfrontends attributes in the application', () => {
        const importer = createImporterFromContent(
          `application {
  config {
    microfrontends [foo, bar]
  }
}
`,
          { skipFileGeneration: true }
        );
        const importState = importer.import();
        jestExpect(importState.exportedApplications[0]['generator-jhipster'].microfrontends).toMatchInlineSnapshot(`
Array [
  Object {
    "baseName": "foo",
  },
  Object {
    "baseName": "bar",
  },
]
`);
      });
    });
    context('when importing a JDL application with clientFramework no', () => {
      it('should return the clientFramework attribute in the application', () => {
        const importer = createImporterFromContent(
          `application {
  config {
    clientFramework no
  }
}
`,
          { skipFileGeneration: true }
        );
        const importState = importer.import();
        jestExpect(importState.exportedApplications[0]['generator-jhipster'].clientFramework).toBe(NO_CLIENT_FRAMEWORK);
      });
    });
  });
});
