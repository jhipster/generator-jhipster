/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { after, before, describe, expect as jestExpect, it } from 'esmocha';
import { rmSync } from 'node:fs';
import path from 'node:path';

import { expect } from 'chai';

import { APPLICATION_TYPE_MONOLITH } from '../core/application-types.ts';
import clientFrameworkTypes from '../jhipster/client-framework-types.ts';
import databaseTypes from '../jhipster/database-types.ts';
import { readYoRcFile } from '../utils/yo-rc.ts';

import { createImporterFromContent, createImporterFromFiles, getTestFile } from './core/__test-support__/index.ts';
import type { ImportState } from './jdl-importer.ts';

const { NO: NO_CLIENT_FRAMEWORK } = clientFrameworkTypes;

describe('jdl - JDLImporter', () => {
  describe('createImporterFromFiles', () => {
    describe('when not passing files', () => {
      it('should fail', () => {
        // @ts-expect-error should not be empty
        expect(() => createImporterFromFiles()).to.throw(/^Files must be passed to create a new JDL importer\.$/);
      });
    });
  });
  describe('createImporterFromContent', () => {
    describe('when not passing any content', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => createImporterFromContent()).to.throw(/^A JDL content must be passed to create a new JDL importer\.$/);
      });
    });
  });
  describe('import', () => {
    describe('parsing a relationship with builtInEntity', () => {
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
        jestExpect(importState.exportedEntities[0].relationships?.[0].relationshipWithBuiltInEntity).toBe(true);
      });
    });
    describe('when not parsing applications', () => {
      let returned: Record<string, any>;

      before(() => {
        const importer = createImporterFromFiles([getTestFile('big_sample.jdl')], {
          applicationName: 'MyApp',
          applicationType: APPLICATION_TYPE_MONOLITH,
          databaseType: databaseTypes.SQL,
        });
        returned = importer.import();
        returned.exportedEntities = returned.exportedEntities
          .sort((exportedEntityA: any, exportedEntityB: any) => {
            if (exportedEntityA.entityTableName < exportedEntityB.entityTableName) {
              return -1;
            }
            return 1;
          })
          .map((exportedEntity: any) => {
            exportedEntity.documentation = exportedEntity.documentation || '';
            return exportedEntity;
          });
      });

      it('should return the final state', () => {
        jestExpect(returned).toMatchSnapshot();
      });
    });
    describe('when passing an existing application config', () => {
      let importer: ReturnType<typeof createImporterFromContent>;

      before(() => {
        importer = createImporterFromContent(
          `entity A
entity User
relationship OneToOne {
  User{a} to A
}
`,
          {
            application: readYoRcFile(getTestFile('jhipster_app')),
          },
        );
      });

      it('should not fail', () => {
        expect(() => importer.import()).not.to.throw();
      });
    });
    describe('when parsing one JDL application and entities', () => {
      let returned: Record<string, any>;

      before(() => {
        const importer = createImporterFromFiles([getTestFile('application_with_entities.jdl')]);
        returned = importer.import();
      });

      it('should return the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
        expect(returned.exportedDeployments).to.have.lengthOf(0);
      });
      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach((application: any) => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = applicationConfig.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map((entity: any) => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter((entity: any) => entityNames.includes(entity.name))).to.be.eql(
            applicationWithEntities.entities,
          );
        });
      });
    });
    describe('when parsing two JDL applications with and without entities ', () => {
      let returned: Record<string, any>;
      const APPLICATION_NAMES = ['app1', 'app2'];

      before(() => {
        const importer = createImporterFromFiles([getTestFile('applications_with_and_without_entities.jdl')]);
        returned = importer.import();
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
        returned.exportedApplications.forEach((application: any) => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = applicationConfig.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map((entity: any) => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter((entity: any) => entityNames.includes(entity.name))).to.be.eql(
            applicationWithEntities.entities,
          );
        });
      });
    });
    describe('when parsing one JDL application and entities passed as string', () => {
      let returned: Record<string, any>;

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
        returned.exportedApplications.forEach((application: any) => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = applicationConfig.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map((entity: any) => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter((entity: any) => entityNames.includes(entity.name))).to.be.eql(
            applicationWithEntities.entities,
          );
        });
      });
    });
    describe('when parsing one JDL application and entities with entity and dto suffixes', () => {
      let returned: Record<string, any>;

      before(() => {
        const importer = createImporterFromFiles([getTestFile('application_with_entity_dto_suffixes.jdl')]);
        returned = importer.import();
      });

      it('should return the import state', () => {
        expect(returned.exportedEntities).to.have.lengthOf(1);
        expect(returned.exportedApplications).to.have.lengthOf(1);
      });

      it('should return the corresponding exportedApplicationsWithEntities', () => {
        returned.exportedApplications.forEach((application: any) => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = applicationConfig.entities || [];
          const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map((entity: any) => entity.name)).to.be.eql(entityNames);
          expect(returned.exportedEntities.filter((entity: any) => entityNames.includes(entity.name))).to.be.eql(
            applicationWithEntities.entities,
          );
        });
      });
    });
    describe('when parsing JDL applications and exporting them', () => {
      let contents: ImportState;

      before(() => {
        const importer = createImporterFromFiles([getTestFile('applications2.jdl')]);
        contents = importer.import();
      });

      it('should export the application contents', () => {
        jestExpect(contents).toMatchSnapshot();
      });
    });
    describe('when parsing multiple JDL files with applications and entities', () => {
      let importState: Record<string, any>;
      before(() => {
        const importer = createImporterFromFiles([getTestFile('integration', 'file1.jdl'), getTestFile('integration', 'file2.jdl')]);
        importState = importer.import();
      });

      it('should generate correct import state', () => {
        expect(importState.exportedApplications.length).to.eql(3);
        expect(importState.exportedEntities.length).to.eql(4);
      });

      it('should return the corresponding exportedApplicationsWithEntities', () => {
        importState.exportedApplications.forEach((application: any) => {
          const applicationConfig = application['generator-jhipster'];
          const entityNames = applicationConfig.entities || [];
          const applicationWithEntities = importState.exportedApplicationsWithEntities[applicationConfig.baseName];
          expect(applicationConfig).to.be.eql(applicationWithEntities.config);
          expect(applicationWithEntities.entities.map((entity: any) => entity.name)).to.be.eql(entityNames);
          expect(importState.exportedEntities.filter((entity: any) => entityNames.includes(entity.name))).to.be.eql(
            applicationWithEntities.entities,
          );
        });
      });
    });
    describe("when choosing 'no' as database type", () => {
      let importer: ReturnType<typeof createImporterFromFiles>;

      before(() => {
        importer = createImporterFromFiles([getTestFile('simple.jdl')], {
          applicationName: 'MyApp',
          applicationType: APPLICATION_TYPE_MONOLITH,
          databaseType: databaseTypes.NO,
        });
      });

      it('does not fail', () => {
        importer.import();
      });
    });
    describe('when parsing a JDL with annotations', () => {
      let returned: Record<string, any>;

      before(() => {
        const importer = createImporterFromFiles([getTestFile('annotations.jdl')], {
          applicationName: 'toto',
          databaseType: databaseTypes.SQL,
        });
        returned = importer.import();
      });

      it('sets the options', () => {
        expect(returned.exportedEntities[0].annotations.service).to.equal('serviceClass');
        expect(returned.exportedEntities[0].annotations.dto).to.equal('mapstruct');
        expect(returned.exportedEntities[0].annotations.skipClient).to.be.true;
        expect(returned.exportedEntities[0].annotations.myCustomUnaryOption).to.be.true;
        expect(returned.exportedEntities[0].annotations.myCustomBinaryOption).to.equal('customValue');
        expect(returned.exportedEntities[1].annotations.pagination).to.equal('pagination');
        expect(returned.exportedEntities[1].annotations.dto).to.equal('mapstruct');
        expect(returned.exportedEntities[1].annotations.service).to.equal('serviceClass');
        expect(returned.exportedEntities[2].annotations.skipClient).to.be.true;
        expect(returned.exportedEntities[2].annotations.filter).to.be.true;
        expect(returned.exportedEntities[2].annotations.pagination).to.equal('pagination');
        expect(returned.exportedEntities[2].annotations.myCustomBinaryOption).to.equal('customValue2');
        expect(returned.exportedEntities[0].fields[0].options.id).to.be.true;
        expect(returned.exportedEntities[0].fields[0].options.multiValue).to.deep.equal(['value1', 'value2', 'value3']);
      });
    });
    describe('when parsing a JDL with a pattern validation', () => {
      let returned: Record<string, any>;

      before(() => {
        const importer = createImporterFromFiles([getTestFile('regex_validation.jdl')], {
          applicationName: 'MyApp',
          applicationType: APPLICATION_TYPE_MONOLITH,
          databaseType: databaseTypes.SQL,
        });
        returned = importer.import();
      });

      it('escapes the back-slash in the returned object', () => {
        expect(returned.exportedEntities[0].fields[0].fieldValidateRulesPattern).to.equal('^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$');
      });
    });
    describe('when parsing a JDL with a pattern validation containing a quote', () => {
      let returned: Record<string, any>;

      before(() => {
        const importer = createImporterFromFiles([getTestFile('pattern_validation_with_quote.jdl')], {
          applicationName: 'MyApp',
          applicationType: APPLICATION_TYPE_MONOLITH,
          databaseType: databaseTypes.SQL,
        });
        returned = importer.import();
      });

      it('escapes the quote', () => {
        expect(returned.exportedEntities[0].fields[0].fieldValidateRulesPattern.includes("\\'")).to.be.true;
      });
    });
    describe('when parsing JDL applications and deployment config', () => {
      let importState: ImportState;

      before(() => {
        const importer = createImporterFromFiles([getTestFile('applications3.jdl')]);
        importState = importer.import();
      });

      it('should export the application & deployment contents', () => {
        jestExpect(importState).toMatchSnapshot();
      });
    });
    describe('when parsing deployment config', () => {
      const contents: any[] = [];
      const DEPLOYMENT_NAMES = ['docker-compose', 'kubernetes'];

      before(() => {
        const importer = createImporterFromFiles([getTestFile('deployments.jdl')]);
        importer.import();
        DEPLOYMENT_NAMES.forEach(name => {
          contents.push(readYoRcFile(path.join(name)));
        });
      });

      after(() => {
        DEPLOYMENT_NAMES.forEach(name => {
          rmSync(name, { recursive: true });
        });
      });

      it('should export the deployment contents', () => {
        jestExpect(contents).toMatchSnapshot();
      });
    });
    describe('when parsing entities and enums with custom values', () => {
      let importState: Record<string, any>;

      before(() => {
        const importer = createImporterFromFiles([getTestFile('enum_with_values.jdl')], {
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
    describe('when passing the unidirectionalRelationships option', () => {
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
      describe('when passing without application config', () => {
        let importer: ReturnType<typeof createImporterFromContent>;

        before(() => {
          importer = createImporterFromContent(entities, {
            applicationName: 'jhipster',
            databaseType: 'postgresql',
          });
        });

        it('should not fail', () => {
          expect(() => importer.import()).not.to.throw();
        });
      });
      describe('when parsing one JDL application and entities', () => {
        let returned: Record<string, any>;

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
          returned.exportedApplications.forEach((application: any) => {
            const applicationConfig = application['generator-jhipster'];
            const entityNames = applicationConfig.entities || [];
            const applicationWithEntities = returned.exportedApplicationsWithEntities[applicationConfig.baseName];
            expect(applicationConfig).to.be.eql(applicationWithEntities.config);
            expect(applicationWithEntities.entities.map((entity: any) => entity.name)).to.be.eql(entityNames);
            expect(returned.exportedEntities.filter((entity: any) => entityNames.includes(entity.name))).to.be.eql(
              applicationWithEntities.entities,
            );
            jestExpect(applicationWithEntities.entities).toMatchSnapshot();
          });
        });
      });
    });
    describe('when importing a JDL application with blueprints', () => {
      let importState: Record<string, any>;

      before(() => {
        const importer = createImporterFromFiles([getTestFile('application_with_blueprints.jdl')]);
        importState = importer.import();
      });

      it('should return the blueprints attributes in the application', () => {
        jestExpect(importState.exportedApplications).toMatchSnapshot();
      });
    });
    describe('when choosing neo4j as database type', () => {
      let importState: Record<string, any>;

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
    describe('when having the use-options', () => {
      let importState: Record<string, any>;

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
    describe('when parsing a JDL content with invalid tokens', () => {
      let caughtError: any;

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
    describe('when parsing relationships with annotations and options', () => {
      let relationshipOnSource: any;
      let relationshipOnDestination: any;

      before(() => {
        const content = `entity A
entity B

relationship OneToOne {
  @id A{b} to @NotId(value) @Something B{a} with builtInEntity
}
`;
        const importer = createImporterFromContent(content, { databaseType: 'postgresql', applicationName: 'toto' });
        const imported = importer.import();
        relationshipOnSource = imported.exportedEntities[0].relationships?.[0];
        relationshipOnDestination = imported.exportedEntities[1].relationships?.[0];
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
    describe('when importing a JDL application with microfrontends', () => {
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
    describe('when importing a JDL application with clientFramework no', () => {
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
