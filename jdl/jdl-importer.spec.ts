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
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { jestExpect } from 'esmocha';
import fse from 'fs-extra';
import { expect } from 'chai';

import { applicationTypes, clientFrameworkTypes, databaseTypes } from './jhipster/index.mjs';
import { createImporterFromFiles, createImporterFromContent } from './jdl-importer.js';

const { MONOLITH } = applicationTypes;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { NO: NO_CLIENT_FRAMEWORK } = clientFrameworkTypes;

describe('jdl - JDLImporter', () => {
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
    context('parsing a relationship with builtInEntity', () => {
      it('import and add relationshipWithBuiltInEntity to the relationship', () => {
        const importState = createImporterFromContent(
          `
entity A
relationship OneToMany {
  A{user} to User with builtInEntity
}
`,
          { applicationName: 'MyApp', databaseType: databaseTypes.SQL },
        ).import();
        jestExpect(importState.exportedEntities[0].relationships[0].relationshipWithBuiltInEntity).toBe(true);
      });
    });
    context('when not parsing applications', () => {
      let returned;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, '__test-files__', 'big_sample.jdl')], {
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
            exportedEntity.documentation = exportedEntity.documentation || '';
            return exportedEntity;
          });
      });

      it('should return the final state', () => {
        jestExpect(returned).toMatchSnapshot();
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
            application: JSON.parse(fse.readFileSync(path.join(__dirname, '__test-files__', 'jhipster_app', '.yo-rc.json'), 'utf-8')),
          },
        );
      });

      it('should not fail', () => {
        expect(() => importer.import()).not.to.throw();
      });
    });
    context('when parsing one JDL application and entities', () => {
      let returned;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, '__test-files__', 'application_with_entities.jdl')]);
        returned = importer.import();
      });

      it('should return the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
        expect(returned.exportedDeployments).to.have.lengthOf(0);
      });
      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = applicationConfig.entities || [];
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
        const importer = createImporterFromFiles([path.join(__dirname, '__test-files__', 'applications_with_and_without_entities.jdl')]);
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
      it('should export the application contents', () => {
        expect(returned.exportedApplicationsWithEntities[APPLICATION_NAMES[0]].entities).to.have.lengthOf(0);
        expect(returned.exportedApplicationsWithEntities[APPLICATION_NAMES[1]].entities).to.have.lengthOf(1);
      });
      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = applicationConfig.entities || [];
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
          {},
        );
        returned = importer.import();
      });

      it('should return the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
        expect(returned.exportedDeployments).to.have.lengthOf(0);
      });
      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = applicationConfig.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(applicationWithEntities.entities);
        });
      });
    });
    context('when parsing one JDL application and entities with entity and dto suffixes', () => {
      let returned;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, '__test-files__', 'application_with_entity_dto_suffixes.jdl')]);
        returned = importer.import();
      });

      it('should return the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
      });

      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = applicationConfig.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(applicationWithEntities.entities);
        });
      });
    });
    context('when parsing JDL applications and exporting them', () => {
      let contents: any;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, '__test-files__', 'applications2.jdl')]);
        contents = importer.import();
      });

      it('should export the application contents', () => {
        jestExpect(contents).toMatchSnapshot();
      });
    });
    context('when parsing multiple JDL files with applications and entities', () => {
      let importState;
      before(() => {
        const importer = createImporterFromFiles([
          path.join(__dirname, '__test-files__', 'integration', 'file1.jdl'),
          path.join(__dirname, '__test-files__', 'integration', 'file2.jdl'),
        ]);
        importState = importer.import();
      });

      it('should generate correct import state', () => {
        expect(importState.exportedApplications.length).to.eql(3);
        expect(importState.exportedEntities.length).to.eql(4);
      });

      it('should return the corresponding exportedApplicationsWithEntities', () => {
        importState.exportedApplications.forEach(application => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = applicationConfig.entities || [];
          const applicationWithEntities = importState.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
          expect(importState.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(
            applicationWithEntities.entities,
          );
        });
      });
    });
    context("when choosing 'no' as database type", () => {
      let importer;

      before("importing a JDL file with the 'no' database type", () => {
        importer = createImporterFromFiles([path.join(__dirname, '__test-files__', 'simple.jdl')], {
          applicationName: 'MyApp',
          applicationType: MONOLITH,
          databaseType: databaseTypes.NO,
        });
      });

      it('does not fail', () => {
        importer.import();
      });
    });
    context('when parsing a JDL with annotations', () => {
      let returned;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, '__test-files__', 'annotations.jdl')], {
          applicationName: 'toto',
          databaseType: databaseTypes.SQL,
        });
        returned = importer.import();
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

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, '__test-files__', 'regex_validation.jdl')], {
          applicationName: 'MyApp',
          applicationType: MONOLITH,
          databaseType: databaseTypes.SQL,
        });
        returned = importer.import();
      });

      it('escapes the back-slash in the returned object', () => {
        expect(returned.exportedEntities[0].fields[0].fieldValidateRulesPattern).to.equal('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$');
      });
    });
    context('when parsing a JDL with a pattern validation containing a quote', () => {
      let returned;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, '__test-files__', 'pattern_validation_with_quote.jdl')], {
          applicationName: 'MyApp',
          applicationType: MONOLITH,
          databaseType: databaseTypes.SQL,
        });
        returned = importer.import();
      });

      it('escapes the quote', () => {
        expect(returned.exportedEntities[0].fields[0].fieldValidateRulesPattern.includes("\\'")).to.be.true;
      });
    });
    context('when parsing JDL applications and deployment config', () => {
      let importState: any;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, '__test-files__', 'applications3.jdl')]);
        importState = importer.import();
      });

      it('should export the application & deployment contents', () => {
        jestExpect(importState).toMatchSnapshot();
      });
    });
    context('when parsing deployment config', () => {
      const contents: any[] = [];
      const DEPLOYMENT_NAMES = ['docker-compose', 'kubernetes', 'openshift'];

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, '__test-files__', 'deployments.jdl')]);
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

      it('should export the deployment contents', () => {
        jestExpect(contents).toMatchSnapshot();
      });
    });
    context('when parsing entities and enums with custom values', () => {
      let importState;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, '__test-files__', 'enum_with_values.jdl')], {
          applicationName: 'toto',
          applicationType: 'monolith',
          databaseType: 'sql',
        });
        importState = importer.import();
      });

      it('should export them', () => {
        expect(importState.exportedEntities[0].fields[0].fieldValues).to.equal(
          'ARCHIVE (archive),DEV (development),INTEGRATION (integration),PROD (production),TEST (test),UAT (uat),NON_PROD (nonProd)',
        );
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
          );
          returned = importer.import();
        });

        it('should return the import state', () => {
          expect(returned.exportedEntities).to.have.lengthOf(2);
          expect(returned.exportedApplications).to.have.lengthOf(1);
          expect(returned.exportedDeployments).to.have.lengthOf(0);
        });
        it('should return the corresponding exportedApplicationsWithEntities', () => {
          returned.exportedApplications.forEach(application => {
            const applicationConfig = application['generator-jhipster'];
            const entityNames = applicationConfig.entities || [];
            const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
            expect(applicationConfig).to.be.eql(applicationWithEntities.config);
            expect(applicationWithEntities.entities.map(entity => entity.name)).to.be.eql(entityNames);
            expect(returned.exportedEntities.filter(entity => entityNames.includes(entity.name))).to.be.eql(
              applicationWithEntities.entities,
            );
            jestExpect(applicationWithEntities.entities).toMatchSnapshot();
          });
        });
      });
    });
    context('when importing a JDL application with blueprints', () => {
      let importState;
      let parameter;

      before(() => {
        const importer = createImporterFromFiles([path.join(__dirname, '__test-files__', 'application_with_blueprints.jdl')]);
        const logger = {
          warn: callParameter => {
            parameter = callParameter;
          },
        };
        importState = importer.import(logger as Console);
      });

      it('should return the blueprints attributes in the application', () => {
        jestExpect(importState.exportedApplications).toMatchSnapshot();
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
          "MismatchedTokenException: Found an invalid token 'unknownOption', at line: 5 and column: 5.\n\tPlease make sure your JDL content does not use invalid characters, keywords or options.",
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
  @id A{b} to @NotId(value) @Something B{a} with builtInEntity
}
`;
        const importer = createImporterFromContent(content, { databaseType: 'postgresql', applicationName: 'toto' });
        const imported = importer.import();
        relationshipOnSource = imported.exportedEntities[0].relationships[0];
        relationshipOnDestination = imported.exportedEntities[1].relationships[0];
      });

      it('should export them', () => {
        jestExpect(relationshipOnSource).toMatchInlineSnapshot(`
          {
            "options": {
              "notId": "value",
              "something": true,
            },
            "otherEntityName": "b",
            "otherEntityRelationshipName": "a",
            "relationshipName": "b",
            "relationshipSide": "left",
            "relationshipType": "one-to-one",
            "relationshipWithBuiltInEntity": true,
          }
        `);
        jestExpect(relationshipOnDestination).toMatchInlineSnapshot(`
          {
            "options": {
              "builtInEntity": true,
              "id": true,
            },
            "otherEntityName": "a",
            "otherEntityRelationshipName": "b",
            "relationshipName": "a",
            "relationshipSide": "right",
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
        );
        const importState = importer.import();
        jestExpect(importState.exportedApplications[0]['generator-jhipster'].microfrontends).toMatchInlineSnapshot(`
          [
            {
              "baseName": "foo",
            },
            {
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
        );
        const importState = importer.import();
        jestExpect(importState.exportedApplications[0]['generator-jhipster'].clientFramework).toBe(NO_CLIENT_FRAMEWORK);
      });
    });
  });
});
