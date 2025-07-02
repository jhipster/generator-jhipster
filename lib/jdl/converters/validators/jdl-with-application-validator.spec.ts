/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { before, describe, it } from 'esmocha';
import { expect } from 'chai';

import { applicationTypes, binaryOptions, databaseTypes, fieldTypes, validations } from '../../core/built-in-options/index.js';
import JDLObject from '../../core/models/jdl-object.js';
import { createJDLApplication } from '../../core/models/jdl-application-factory.js';
import JDLBinaryOption from '../../core/models/jdl-binary-option.js';
import { JDLEntity } from '../../core/models/index.js';
import JDLField from '../../core/models/jdl-field.js';
import JDLRelationship from '../../core/models/jdl-relationship.js';
import JDLValidation from '../../core/models/jdl-validation.js';
import createValidator from '../validators/jdl-with-application-validator.js';
import { relationshipTypes } from '../../core/basic-types/index.js';
import { getDefaultRuntime } from '../../core/runtime.js';

const { GATEWAY, MICROSERVICE, MONOLITH } = applicationTypes;
const {
  Validations: { MIN },
} = validations;

const runtime = getDefaultRuntime();

describe('jdl - JDLWithApplicationValidator', () => {
  describe('createValidator', () => {
    describe('when not passing a JDL object', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => createValidator()).to.throw(/^A JDL object must be passed to check for business errors.$/);
      });
    });
  });
  describe('checkForErrors', () => {
    describe('when passing gateway as application type', () => {
      describe('with incompatible database type and field type', () => {
        let validator;

        before(() => {
          const jdlObject = new JDLObject();
          const application = createJDLApplication(
            {
              applicationType: GATEWAY,
              databaseType: databaseTypes.SQL,
            },
            undefined,
            runtime,
          );
          const validEntity = new JDLEntity({
            name: 'Valid',
          });
          validEntity.addField(
            new JDLField({
              name: 'validField',
              type: 'UNKNOWN-TYPE',
            }),
          );
          jdlObject.addEntity(validEntity);
          jdlObject.addApplication(application);
          validator = createValidator(jdlObject);
        });

        it('should not fail', () => {
          expect(() => {
            validator.checkForErrors();
          }).not.to.throw();
        });
      });
    });
    describe('when passing an unsupported validation for a field', () => {
      let validator;

      before(() => {
        const jdlObject = new JDLObject();
        const application = createJDLApplication(
          {
            applicationType: MONOLITH,
            databaseType: databaseTypes.SQL,
          },
          undefined,
          runtime,
        );
        const entity = new JDLEntity({
          name: 'Valid',
        });
        const field = new JDLField({
          name: 'validField',
          type: fieldTypes.CommonDBTypes.STRING,
        });
        field.addValidation(
          new JDLValidation({
            name: MIN,
            value: 42,
          }),
        );
        entity.addField(field);
        jdlObject.addEntity(entity);
        application.addEntityName(entity.name);
        jdlObject.addApplication(application);
        validator = createValidator(jdlObject);
      });

      it('should fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).to.throw("The validation 'min' isn't supported for the type 'String'.");
      });
    });
    describe('when the source entity of a relationship is missing', () => {
      let validator;

      before(() => {
        const otherEntity = new JDLEntity({
          name: 'Valid',
        });
        const relationship = new JDLRelationship({
          from: 'Source',
          to: otherEntity.name,
          type: relationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'other',
        });
        const jdlObject = new JDLObject();
        const application = createJDLApplication(
          {
            applicationType: MONOLITH,
            databaseType: databaseTypes.SQL,
          },
          undefined,
          runtime,
        );
        jdlObject.addEntity(otherEntity);
        jdlObject.addRelationship(relationship);
        application.addEntityName(otherEntity.name);
        jdlObject.addApplication(application);
        validator = createValidator(jdlObject);
      });

      it('should fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).to.throw(
          "In the relationship between Source and Valid, Source is not declared. If 'Valid' is a built-in entity declare like 'Source to Valid with builtInEntity'.",
        );
      });
    });
    describe('when the destination entity of a relationship is missing', () => {
      describe('if it has builtInEntity annotation', () => {
        let validator;

        before(() => {
          const sourceEntity = new JDLEntity({
            name: 'Source',
          });
          const relationship = new JDLRelationship({
            from: sourceEntity.name,
            to: 'User',
            type: relationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'other',
            options: {
              global: {
                builtInEntity: true,
              },
              source: {},
              destination: {},
            },
          });
          const jdlObject = new JDLObject();
          const application = createJDLApplication(
            {
              applicationType: MONOLITH,
              databaseType: databaseTypes.SQL,
            },
            undefined,
            runtime,
          );
          jdlObject.addEntity(sourceEntity);
          jdlObject.addRelationship(relationship);
          application.addEntityName(sourceEntity.name);
          jdlObject.addApplication(application);
          validator = createValidator(jdlObject);
        });

        it('should not fail', () => {
          expect(() => {
            validator.checkForErrors();
          }).not.to.throw();
        });
      });
      describe('if it is not the User entity', () => {
        let checker;

        before(() => {
          const sourceEntity = new JDLEntity({
            name: 'Source',
          });
          const relationship = new JDLRelationship({
            from: sourceEntity.name,
            to: 'Other',
            type: relationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'other',
          });
          const jdlObject = new JDLObject();
          const application = createJDLApplication(
            {
              applicationType: MONOLITH,
              databaseType: databaseTypes.SQL,
            },
            undefined,
            runtime,
          );
          jdlObject.addEntity(sourceEntity);
          jdlObject.addRelationship(relationship);
          application.addEntityName(sourceEntity.name);
          jdlObject.addApplication(application);
          checker = createValidator(jdlObject);
        });

        it('should fail', () => {
          expect(() => {
            checker.checkForErrors();
          }).to.throw(
            "In the relationship between Source and Other, Other is not declared. If 'Other' is a built-in entity declare like 'Source to Other with builtInEntity'.",
          );
        });
      });
    });
    describe('with relationships between multiple applications', () => {
      let validator;

      before(() => {
        const jdlObject = new JDLObject();
        const application1 = createJDLApplication(
          {
            applicationType: MICROSERVICE,
            baseName: 'app1',
          },
          undefined,
          runtime,
        );
        application1.addEntityNames(['A', 'B']);
        const application2 = createJDLApplication(
          {
            applicationType: MICROSERVICE,
            baseName: 'app2',
          },
          undefined,
          runtime,
        );
        application2.addEntityNames(['B', 'C']);
        const application3 = createJDLApplication(
          {
            applicationType: MICROSERVICE,
            baseName: 'app3',
          },
          undefined,
          runtime,
        );
        application3.addEntityNames(['A', 'B', 'C']);
        jdlObject.addApplication(application1);
        jdlObject.addApplication(application2);
        jdlObject.addApplication(application3);
        jdlObject.addEntity(
          new JDLEntity({
            name: 'A',
          }),
        );
        jdlObject.addEntity(
          new JDLEntity({
            name: 'B',
          }),
        );
        jdlObject.addEntity(
          new JDLEntity({
            name: 'C',
          }),
        );
        jdlObject.addRelationship(
          new JDLRelationship({
            from: 'A',
            to: 'B',
            type: relationshipTypes.MANY_TO_MANY,
            injectedFieldInFrom: 'b',
            injectedFieldInTo: 'a',
          }),
        );
        jdlObject.addRelationship(
          new JDLRelationship({
            from: 'B',
            to: 'C',
            type: relationshipTypes.MANY_TO_MANY,
            injectedFieldInFrom: 'c',
            injectedFieldInTo: 'd',
          }),
        );
        jdlObject.addRelationship(
          new JDLRelationship({
            from: 'A',
            to: 'C',
            type: relationshipTypes.MANY_TO_MANY,
            injectedFieldInFrom: 'c',
            injectedFieldInTo: 'd',
          }),
        );
        validator = createValidator(jdlObject);
      });
      it('should fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).to.throw("Entities for the ManyToMany relationship from 'B' to 'C' do not belong to the same application.");
      });
    });
    describe('when having DTOs without services', () => {
      let validator;

      before(() => {
        const jdlObject = new JDLObject();
        const application = createJDLApplication(
          {
            applicationType: MONOLITH,
            databaseType: databaseTypes.SQL,
          },
          undefined,
          runtime,
        );
        jdlObject.addApplication(application);
        jdlObject.addOption(
          new JDLBinaryOption({
            name: binaryOptions.Options.DTO,
            value: binaryOptions.Values.dto.MAPSTRUCT,
            entityNames: new Set(['A', 'B', 'C']),
          }),
        );
        jdlObject.addOption(
          new JDLBinaryOption({
            name: binaryOptions.Options.SERVICE,
            value: binaryOptions.Values.service.SERVICE_CLASS,
            entityNames: new Set(['B']),
          }),
        );
        validator = createValidator(jdlObject);
      });

      it('should not fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).not.to.throw();
      });
    });
    describe('when having DTOs with services', () => {
      let validator;

      before(() => {
        const jdlObject = new JDLObject();
        const application = createJDLApplication(
          {
            applicationType: MONOLITH,
            databaseType: databaseTypes.SQL,
          },
          undefined,
          runtime,
        );
        jdlObject.addEntity(
          new JDLEntity({
            name: 'A',
          }),
        );
        jdlObject.addEntity(
          new JDLEntity({
            name: 'B',
          }),
        );
        jdlObject.addEntity(
          new JDLEntity({
            name: 'C',
          }),
        );
        application.addEntityName('A');
        application.addEntityName('B');
        application.addEntityName('C');
        jdlObject.addApplication(application);
        jdlObject.addOption(
          new JDLBinaryOption({
            name: binaryOptions.Options.DTO,
            value: binaryOptions.Values.dto.MAPSTRUCT,
            entityNames: new Set(['A', 'B']),
          }),
        );
        jdlObject.addOption(
          new JDLBinaryOption({
            name: binaryOptions.Options.SERVICE,
            value: binaryOptions.Values.service.SERVICE_CLASS,
            excludedNames: new Set(['C']),
          }),
        );
        validator = createValidator(jdlObject);
      });
      it('should not fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).not.to.throw();
      });
    });
    describe('when having a relationship with the User entity as source', () => {
      let validator;

      before(() => {
        const sourceEntity = new JDLEntity({
          name: 'User',
        });
        const destinationEntity = new JDLEntity({
          name: 'Destination',
        });
        const relationship = new JDLRelationship({
          from: sourceEntity.name,
          to: destinationEntity.name,
          type: relationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'other',
        });
        const jdlObject = new JDLObject();
        const application = createJDLApplication(
          {
            applicationType: MONOLITH,
            databaseType: databaseTypes.SQL,
          },
          undefined,
          runtime,
        );
        jdlObject.addEntity(sourceEntity);
        jdlObject.addEntity(destinationEntity);
        jdlObject.addRelationship(relationship);
        application.addEntityName(sourceEntity.name);
        application.addEntityName(destinationEntity.name);
        jdlObject.addApplication(application);
        validator = createValidator(jdlObject);
      });

      it('should not fail', () => {
        expect(() => validator.checkForErrors()).not.to.throw();
      });
    });
    describe('when having a relationship with the User entity as destination', () => {
      let validator;

      before(() => {
        const sourceEntity = new JDLEntity({
          name: 'Source',
        });
        const destinationEntity = new JDLEntity({
          name: 'User',
        });
        const relationship = new JDLRelationship({
          from: sourceEntity.name,
          to: destinationEntity.name,
          type: relationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'other',
        });
        const jdlObject = new JDLObject();
        const application = createJDLApplication(
          {
            applicationType: MONOLITH,
            databaseType: databaseTypes.SQL,
          },
          undefined,
          runtime,
        );
        jdlObject.addEntity(sourceEntity);
        jdlObject.addEntity(destinationEntity);
        jdlObject.addRelationship(relationship);
        application.addEntityName(sourceEntity.name);
        application.addEntityName(destinationEntity.name);
        jdlObject.addApplication(application);
        validator = createValidator(jdlObject);
      });

      it('should not fail', () => {
        expect(() => validator.checkForErrors()).not.to.throw();
      });
    });
  });
});
