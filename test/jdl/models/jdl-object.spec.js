/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const { expect } = require('chai');

const { MONOLITH } = require('../../../jdl/jhipster/application-types');
const BinaryOptions = require('../../../jdl/jhipster/binary-options');
const UnaryOptions = require('../../../jdl/jhipster/unary-options');
const RelationshipTypes = require('../../../jdl/jhipster/relationship-types');
const JDLObject = require('../../../jdl/models/jdl-object');
const { createJDLApplication } = require('../../../jdl/models/jdl-application-factory');
const JDLDeployment = require('../../../jdl/models/jdl-deployment');
const JDLEntity = require('../../../jdl/models/jdl-entity');
const JDLField = require('../../../jdl/models/jdl-field');
const JDLValidation = require('../../../jdl/models/jdl-validation');
const JDLEnum = require('../../../jdl/models/jdl-enum');
const JDLRelationship = require('../../../jdl/models/jdl-relationship');
const JDLUnaryOption = require('../../../jdl/models/jdl-unary-option');
const JDLBinaryOption = require('../../../jdl/models/jdl-binary-option');

describe('JDLObject', () => {
  describe('addApplication', () => {
    context('when adding an invalid application', () => {
      const object = new JDLObject();

      context('such as a nil application', () => {
        it('should fail', () => {
          expect(() => {
            object.addApplication(null);
          }).to.throw(/^Can't add nil application\.$/);
        });
      });
    });
    context('when adding a valid application', () => {
      let addedApplication;
      let originalApplication;

      before(() => {
        const object = new JDLObject();
        originalApplication = createJDLApplication({ applicationType: MONOLITH, jhipsterVersion: '4.9.0' });
        const baseName = originalApplication.getConfigurationOptionValue('baseName');
        object.addApplication(originalApplication);
        addedApplication = object.applications[baseName];
      });

      it('should work', () => {
        expect(addedApplication).to.deep.equal(originalApplication);
      });
    });
  });
  describe('getApplicationQuantity', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
    });

    context('when having no application', () => {
      it('should return 0', () => {
        expect(jdlObject.getApplicationQuantity()).to.equal(0);
      });
    });

    context('when having one or more applications', () => {
      before(() => {
        jdlObject.addApplication(
          createJDLApplication({
            applicationType: MONOLITH,
          })
        );
      });

      it('should return the number of applications', () => {
        expect(jdlObject.getApplicationQuantity()).to.equal(1);
      });
    });
  });
  describe('getApplication', () => {
    context('when not passing an application name', () => {
      let jdlObject;

      before(() => {
        jdlObject = new JDLObject();
        jdlObject.addApplication(createJDLApplication({ baseName: 'toto' }));
      });

      it('should return undefined', () => {
        expect(jdlObject.getApplication()).to.be.undefined;
      });
    });
    context("when passing an application's name", () => {
      context('that does not exist', () => {
        let jdlObject;

        before(() => {
          jdlObject = new JDLObject();
          jdlObject.addApplication(createJDLApplication({ baseName: 'toto' }));
        });

        it('should return undefined', () => {
          expect(jdlObject.getApplication('tata')).to.be.undefined;
        });
      });

      context('that exists', () => {
        let jdlObject;

        before(() => {
          jdlObject = new JDLObject();
          jdlObject.addApplication(createJDLApplication({ baseName: 'toto' }));
        });

        it('should return undefined', () => {
          expect(jdlObject.getApplication('toto')).not.to.be.undefined;
        });
      });
    });
  });
  describe('addDeployment', () => {
    context('when adding an invalid deployment', () => {
      const object = new JDLObject();

      context('such as a nil deployment', () => {
        it('should fail', () => {
          expect(() => {
            object.addDeployment(null);
          }).to.throw(/^Can't add nil deployment\.$/);
        });
      });
    });
    context('when adding a valid application', () => {
      let object;
      let application;

      before(() => {
        object = new JDLObject();
        application = new JDLDeployment({
          deploymentType: 'docker-compose',
          appFolders: ['tata'],
          dockerRepositoryName: 'test',
        });
        object.addDeployment(application);
      });

      it('should work', () => {
        expect(object.deployments[application.deploymentType]).to.deep.eq(application);
      });
    });
  });
  describe('getDeploymentQuantity', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
    });

    context('when having no deployment', () => {
      it('should return 0', () => {
        expect(jdlObject.getDeploymentQuantity()).to.equal(0);
      });
    });

    context('when having one or more deployment', () => {
      before(() => {
        jdlObject.addDeployment(
          new JDLDeployment({
            deploymentType: 'docker-compose',
            appFolders: ['tata'],
            dockerRepositoryName: 'test',
          })
        );
      });

      it('should return the number of applications', () => {
        expect(jdlObject.getDeploymentQuantity()).to.equal(1);
      });
    });
  });
  describe('forEachApplication', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
      jdlObject.addApplication(createJDLApplication({ applicationType: MONOLITH, baseName: 'A' }));
      jdlObject.addApplication(createJDLApplication({ applicationType: MONOLITH, baseName: 'B' }));
    });

    context('when not passing a function', () => {
      it('should not fail', () => {
        jdlObject.forEachApplication();
      });
    });
    context('when passing a function', () => {
      const result = [];

      before(() => {
        jdlObject.forEachApplication(application => {
          result.push(application.getConfigurationOptionValue('baseName'));
        });
      });

      it('should use each entity name', () => {
        expect(result).to.deep.equal(['A', 'B']);
      });
    });
  });
  describe('addEntity', () => {
    context('when adding an invalid entity', () => {
      const object = new JDLObject();

      context('such as a nil object', () => {
        it('should fail', () => {
          expect(() => {
            object.addEntity(null);
          }).to.throw(/^Can't add nil entity\.$/);
        });
      });
    });
    context('when adding a valid entity', () => {
      let object;
      let entity;

      before(() => {
        object = new JDLObject();
        entity = new JDLEntity({
          name: 'Valid',
          tableName: 't_valid',
          fields: [],
        });
        object.addEntity(entity);
      });

      it('should work', () => {
        expect(object.entities[entity.name]).to.deep.eq(entity);
      });
    });
    context('when adding an entity with the same name', () => {
      let object;
      let entity;
      let entity2;

      before(() => {
        object = new JDLObject();
        entity = new JDLEntity({
          name: 'Valid',
          tableName: 't_valid',
          fields: [],
        });
        object.addEntity(entity);
        entity2 = new JDLEntity({
          name: 'Valid',
          tableName: 't_valid2',
          fields: [],
        });
        object.addEntity(entity2);
      });

      it('should replace the former one', () => {
        expect(object.entities[entity.name]).to.deep.eq(entity2);
      });
    });
  });
  describe('getEntity', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
      jdlObject.addEntity(new JDLEntity({ name: 'A' }));
    });

    context('when not passing a name', () => {
      it('should fail', () => {
        expect(() => {
          jdlObject.getEntity();
        }).to.throw('An entity name must be passed so as to be retrieved.');
      });
    });

    context('when passing a name', () => {
      it('should return the entity', () => {
        expect(jdlObject.getEntity('A')).not.to.be.undefined;
      });
    });
  });
  describe('getEntities', () => {
    context('when there are no entities', () => {
      let object;

      before(() => {
        object = new JDLObject();
      });

      it('should return an empty array', () => {
        expect(object.getEntities()).to.deep.equal([]);
      });
    });
    context('when there are entities', () => {
      let entity;
      let returnedEntities;

      before(() => {
        const object = new JDLObject();
        entity = new JDLEntity({
          name: 'toto',
        });
        object.addEntity(entity);
        returnedEntities = object.getEntities();
      });

      it('should return them in an array', () => {
        expect(returnedEntities).to.deep.equal([entity]);
      });
    });
  });
  describe('getEntityQuantity', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
    });

    context('when having no entity', () => {
      it('should return 0', () => {
        expect(jdlObject.getEntityQuantity()).to.equal(0);
      });
    });

    context('when having one or more entities', () => {
      before(() => {
        jdlObject.addEntity(
          new JDLEntity({
            name: 'toto',
          })
        );
      });

      it('should return the number of entities', () => {
        expect(jdlObject.getEntityQuantity()).to.equal(1);
      });
    });
  });
  describe('getEntityNames', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
    });

    afterEach(() => {
      jdlObject = new JDLObject();
    });

    context('when having no entity', () => {
      it('should return an empty list', () => {
        expect(jdlObject.getEntityNames()).to.be.empty;
      });
    });
    context('when having entities', () => {
      before(() => {
        jdlObject.addEntity(new JDLEntity({ name: 'A' }));
        jdlObject.addEntity(new JDLEntity({ name: 'B' }));
        jdlObject.addEntity(new JDLEntity({ name: 'C' }));
      });

      it('should return the entity names', () => {
        expect(jdlObject.getEntityNames()).to.deep.equal(['A', 'B', 'C']);
      });
    });
  });
  describe('forEachEntity', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
      jdlObject.addEntity(new JDLEntity({ name: 'A' }));
      jdlObject.addEntity(new JDLEntity({ name: 'B' }));
    });

    context('when not passing a function', () => {
      it('should not fail', () => {
        jdlObject.forEachEntity();
      });
    });
    context('when passing a function', () => {
      const result = [];

      before(() => {
        jdlObject.forEachEntity(entity => {
          result.push(entity.name);
        });
      });

      it('should use each entity name', () => {
        expect(result).to.deep.equal(['A', 'B']);
      });
    });
  });
  describe('addEnum', () => {
    context('when adding an invalid enum', () => {
      const object = new JDLObject();

      context('such as a nil enum', () => {
        it('should fail', () => {
          expect(() => {
            object.addEnum(null);
          }).to.throw(/^Can't add nil enum\.$/);
        });
      });
    });
    context('when adding a valid enum', () => {
      let object;
      let enumObject;

      before(() => {
        object = new JDLObject();
        enumObject = new JDLEnum({ name: 'Valid' });
        object.addEnum(enumObject);
      });

      it('should work', () => {
        expect(object.getEnum(enumObject.name)).to.deep.eq(enumObject);
      });
    });
    context('when adding an enum with the same name', () => {
      let object;
      let enumObject;
      let enumObject2;

      before(() => {
        object = new JDLObject();
        enumObject = new JDLEnum({ name: 'Valid' });
        object.addEnum(enumObject);
        enumObject2 = new JDLEnum({ name: 'Valid', values: [{ key: 'A' }, { key: 'B' }] });
        object.addEnum(enumObject2);
      });

      it('should replace the old one', () => {
        expect(object.getEnum(enumObject.name)).to.deep.equal(enumObject2);
      });
    });
  });
  describe('getEnum', () => {
    let object;

    before(() => {
      object = new JDLObject();
    });

    context('when fetching an absent enum', () => {
      it('should return null', () => {
        expect(object.getEnum('A')).to.be.undefined;
      });
    });
    context('when fetching an existing enum', () => {
      let jdlEnum;

      before(() => {
        jdlEnum = new JDLEnum({ name: 'A' });
        object.addEnum(jdlEnum);
      });

      it('should return it', () => {
        expect(object.getEnum(jdlEnum.name)).to.deep.equal(jdlEnum);
      });
    });
  });
  describe('hasEnum', () => {
    let object;

    before(() => {
      object = new JDLObject();
    });

    context('when fetching an absent enum', () => {
      it('should return false', () => {
        expect(object.hasEnum('A')).to.be.false;
      });
    });
    context('when fetching an existing enum', () => {
      let jdlEnum;

      before(() => {
        jdlEnum = new JDLEnum({ name: 'A' });
        object.addEnum(jdlEnum);
      });

      it('should return true', () => {
        expect(object.hasEnum(jdlEnum.name)).to.be.true;
      });
    });
  });
  describe('getEnumQuantity', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
    });

    context('when having no enum', () => {
      it('should return 0', () => {
        expect(jdlObject.getEnumQuantity()).to.equal(0);
      });
    });

    context('when having one or more enums', () => {
      before(() => {
        jdlObject.addEnum(
          new JDLEnum({
            name: 'toto',
          })
        );
      });

      it('should return the number of enums', () => {
        expect(jdlObject.getEnumQuantity()).to.equal(1);
      });
    });
  });
  describe('forEachEnum', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
      jdlObject.addEnum(new JDLEnum({ name: 'A' }));
      jdlObject.addEnum(new JDLEnum({ name: 'B' }));
    });

    context('when not passing a function', () => {
      it('should not fail', () => {
        jdlObject.forEachEnum();
      });
    });
    context('when passing a function', () => {
      const result = [];

      before(() => {
        jdlObject.forEachEnum(jdlEnum => {
          result.push(jdlEnum.name);
        });
      });

      it('should use each enum name', () => {
        expect(result).to.deep.equal(['A', 'B']);
      });
    });
  });
  describe('addRelationship', () => {
    context('when adding an invalid relationship', () => {
      const object = new JDLObject();

      context('such as a nil relationship', () => {
        it('should fail', () => {
          expect(() => {
            object.addRelationship(null);
          }).to.throw(/^Can't add nil relationship\.$/);
        });
      });
      context('such as an incomplete relationship', () => {
        it('should fail', () => {
          expect(() => {
            object.addRelationship(
              new JDLRelationship({
                to: 'Valid',
                type: RelationshipTypes.MANY_TO_MANY,
                injectedFieldInFrom: 'something',
              })
            );
          }).to.throw('Source and destination entities must be passed to create a relationship.');
        });
      });
    });
    context('when adding a valid relationship', () => {
      let object;
      let relationship;

      before(() => {
        object = new JDLObject();
        relationship = new JDLRelationship({
          from: 'Valid2',
          to: 'Valid',
          type: RelationshipTypes.MANY_TO_MANY,
          injectedFieldInFrom: 'something',
          injectedFieldInTo: 'somethingElse',
        });
        object.addRelationship(relationship);
      });

      it('should work', () => {
        expect(object.relationships.getManyToMany(relationship.getId())).to.deep.eq(relationship);
      });
    });
    context('when adding twice the same relationship', () => {
      let object;

      before(() => {
        object = new JDLObject();
        const relationship = new JDLRelationship({
          from: 'Valid2',
          to: 'Valid',
          type: RelationshipTypes.MANY_TO_MANY,
          injectedFieldInFrom: 'something',
          injectedFieldInTo: 'somethingElse',
        });
        object.addRelationship(relationship);
        object.addRelationship(relationship);
      });

      it("doesn't do anything", () => {
        expect(object.relationships.manyToManyQuantity()).to.equal(1);
      });
    });
  });
  describe('getRelationshipQuantity', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
    });

    context('when having no relationship', () => {
      it('should return 0', () => {
        expect(jdlObject.getRelationshipQuantity()).to.equal(0);
      });
    });

    context('when having one or more relationships', () => {
      before(() => {
        jdlObject.addRelationship(
          new JDLRelationship({
            from: 'A',
            to: 'B',
            type: RelationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'b',
          })
        );
      });

      it('should return the number of relationships', () => {
        expect(jdlObject.getRelationshipQuantity()).to.equal(1);
      });
    });
  });
  describe('forEachRelationship', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
      jdlObject.addRelationship(
        new JDLRelationship({
          from: 'Abc',
          to: 'Abc2',
          injectedFieldInFrom: 'something',
          type: RelationshipTypes.ONE_TO_ONE,
        })
      );
      jdlObject.addRelationship(
        new JDLRelationship({
          from: 'Abc',
          to: 'Abc2',
          injectedFieldInFrom: 'something',
          type: RelationshipTypes.ONE_TO_MANY,
        })
      );
    });

    context('when not passing a function', () => {
      it('should not fail', () => {
        jdlObject.forEachRelationship();
      });
    });
    context('when passing a function', () => {
      const result = [];

      before(() => {
        jdlObject.forEachRelationship(jdlRelationship => {
          result.push(jdlRelationship.type);
        });
      });

      it('should use each relationship', () => {
        expect(result).to.deep.equal(['OneToOne', 'OneToMany']);
      });
    });
  });
  describe('addOption', () => {
    context('when adding an invalid option', () => {
      const object = new JDLObject();

      context('such as a nil option', () => {
        it('should fail', () => {
          expect(() => {
            object.addOption(null);
          }).to.throw(/^Can't add nil option\.$/);
        });
      });
      context('such as an empty object', () => {
        it('should fail', () => {
          expect(() => {
            object.addOption({});
          }).to.throw(/^Can't add nil option\.$/);
        });
      });
    });
    context('when adding a valid option', () => {
      it('should work', () => {
        new JDLObject().addOption(new JDLUnaryOption({ name: UnaryOptions.SKIP_CLIENT }));
      });
    });
  });
  describe('getOptionsForName', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
    });

    afterEach(() => {
      jdlObject = new JDLObject();
    });

    context('when passing an invalid name', () => {
      it('should return an empty array', () => {
        expect(jdlObject.getOptionsForName()).to.be.empty;
      });
    });
    context('when checking for an absent option', () => {
      it('should return an empty array', () => {
        expect(jdlObject.getOptionsForName(UnaryOptions.SKIP_CLIENT)).to.be.empty;
      });
    });
    context('when checking for a present option', () => {
      let option1;
      let option2;
      let option3;

      before(() => {
        option1 = new JDLUnaryOption({
          name: UnaryOptions.SKIP_CLIENT,
        });
        option2 = new JDLBinaryOption({
          name: BinaryOptions.Options.SERVICE,
          value: BinaryOptions.Values.service.SERVICE_CLASS,
        });
        option3 = new JDLBinaryOption({
          name: BinaryOptions.Options.SERVICE,
          value: BinaryOptions.Values.service.SERVICE_IMPL,
        });

        jdlObject.addOption(option1);
        jdlObject.addOption(option2);
        jdlObject.addOption(option3);
      });

      it('should return it', () => {
        expect(jdlObject.getOptionsForName(UnaryOptions.SKIP_CLIENT)).to.deep.equal([option1]);
        expect(jdlObject.getOptionsForName(BinaryOptions.Options.SERVICE)).to.deep.equal([option2, option3]);
      });
    });
  });
  describe('getOptionQuantity', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
    });

    context('when having no option', () => {
      it('should return 0', () => {
        expect(jdlObject.getOptionQuantity()).to.equal(0);
      });
    });

    context('when having one or more options', () => {
      before(() => {
        jdlObject.addOption(
          new JDLUnaryOption({
            name: UnaryOptions.SKIP_CLIENT,
          })
        );
      });

      it('should return the number of options', () => {
        expect(jdlObject.getOptionQuantity()).to.equal(1);
      });
    });
  });
  describe('forEachOption', () => {
    let jdlObject;

    before(() => {
      jdlObject = new JDLObject();
      jdlObject.addOption(
        new JDLUnaryOption({
          name: UnaryOptions.SKIP_CLIENT,
        })
      );
      jdlObject.addOption(
        new JDLUnaryOption({
          name: UnaryOptions.SKIP_SERVER,
        })
      );
    });

    context('when not passing a function', () => {
      it('should not fail', () => {
        jdlObject.forEachOption();
      });
    });
    context('when passing a function', () => {
      const result = [];

      before(() => {
        jdlObject.forEachOption(jdlOption => {
          result.push(jdlOption.name);
        });
      });

      it('should use each option', () => {
        expect(result).to.deep.equal(['skipClient', 'skipServer']);
      });
    });
  });
  describe('hasOption', () => {
    context('when passing a falsy value', () => {
      let jdlObject;

      before(() => {
        jdlObject = new JDLObject();
      });

      it('should return false', () => {
        expect(jdlObject.hasOption()).to.be.false;
      });
    });
    context('when passing an option name', () => {
      let jdlObject;

      before(() => {
        jdlObject = new JDLObject();
        jdlObject.addOption(
          new JDLUnaryOption({
            name: UnaryOptions.READ_ONLY,
          })
        );
      });

      context('for an absent option', () => {
        it('should return false', () => {
          expect(jdlObject.hasOption('toto')).to.be.false;
        });
      });
      context('for an existing option', () => {
        it('should return false', () => {
          expect(jdlObject.hasOption(UnaryOptions.READ_ONLY)).to.be.true;
        });
      });
    });
  });
  describe('isEntityInMicroservice', () => {
    let jdlObject;

    context('when an entity is in a microservice', () => {
      context('because no entity name has been specified', () => {
        before(() => {
          jdlObject = new JDLObject();
          const microserviceOption = new JDLBinaryOption({
            name: BinaryOptions.Options.MICROSERVICE,
            value: 'toto',
          });
          jdlObject.addOption(microserviceOption);
        });

        it('should return true', () => {
          expect(jdlObject.isEntityInMicroservice('A')).to.be.true;
        });
      });

      context('because entity names have been specified', () => {
        before(() => {
          jdlObject = new JDLObject();
          const microserviceOption = new JDLBinaryOption({
            name: BinaryOptions.Options.MICROSERVICE,
            value: 'toto',
            entityNames: ['A'],
          });
          jdlObject.addOption(microserviceOption);
        });

        it('should return true', () => {
          expect(jdlObject.isEntityInMicroservice('A')).to.be.true;
        });
      });
    });
    context('when an entity is not in a microservice', () => {
      before(() => {
        jdlObject = new JDLObject();
        const microserviceOption = new JDLBinaryOption({
          name: BinaryOptions.Options.MICROSERVICE,
          value: 'toto',
          entityNames: ['A'],
        });
        jdlObject.addOption(microserviceOption);
      });

      it('should return false', () => {
        expect(jdlObject.isEntityInMicroservice('B')).to.be.false;
      });
    });
  });
  describe('toString', () => {
    let application;
    let deployment;
    let object;
    let entityA;
    let entityB;
    let enumObject;
    let relationship;
    let option;
    let option2;

    before(() => {
      object = new JDLObject();
      application = createJDLApplication({ applicationType: MONOLITH, jhipsterVersion: '4.9.0' });
      object.addApplication(application);
      deployment = new JDLDeployment({
        deploymentType: 'docker-compose',
        appFolders: ['tata'],
        dockerRepositoryName: 'test',
      });
      object.addDeployment(deployment);
      entityA = new JDLEntity({ name: 'EntityA', tableName: 't_entity_a' });
      const field = new JDLField({ name: 'myField', type: 'String' });
      field.addValidation(new JDLValidation());
      entityA.addField(field);
      object.addEntity(entityA);
      entityB = new JDLEntity({ name: 'EntityB', tableName: 't_entity_b' });
      object.addEntity(entityB);
      enumObject = new JDLEnum({ name: 'MyEnum', values: [{ key: 'A' }, { key: 'B', value: 'bb' }] });
      object.addEnum(enumObject);
      relationship = new JDLRelationship({
        from: entityA.name,
        to: entityB.name,
        type: RelationshipTypes.ONE_TO_ONE,
        injectedFieldInFrom: 'entityB',
        injectedFieldInTo: 'entityA(myField)',
      });
      object.addRelationship(relationship);
      option = new JDLUnaryOption({ name: UnaryOptions.SKIP_CLIENT });
      option.excludeEntityName(entityA.name);
      object.addOption(option);
      option2 = new JDLBinaryOption({
        name: BinaryOptions.Options.DTO,
        value: BinaryOptions.Values.dto.MAPSTRUCT,
      });
      option2.addEntityName(entityB.name);
      object.addOption(option2);
    });

    it('should stringify the JDL object', () => {
      expect(object.toString()).to.equal(
        `${application.toString()}

${deployment.toString()}

${entityA.toString()}
${entityB.toString()}
${enumObject.toString()}

${relationship.toString()}

${option.toString()}
${option2.toString()}
`
      );
    });
  });
});
