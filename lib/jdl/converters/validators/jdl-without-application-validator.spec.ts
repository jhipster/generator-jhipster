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

import fieldTypes from '../../../jhipster/field-types.ts';
import { relationshipTypes } from '../../core/basic-types/index.ts';
import { binaryOptions, validations } from '../../core/built-in-options/index.ts';
import { JDLEntity } from '../../core/models/index.ts';
import JDLBinaryOption from '../../core/models/jdl-binary-option.ts';
import JDLField from '../../core/models/jdl-field.ts';
import JDLObject from '../../core/models/jdl-object.ts';
import JDLRelationship from '../../core/models/jdl-relationship.ts';
import JDLValidation from '../../core/models/jdl-validation.ts';

import createValidator from './jdl-without-application-validator.ts';

const {
  Validations: { MIN },
} = validations;

describe('jdl - JDLWithoutApplicationValidator', () => {
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
        let validator: ReturnType<typeof createValidator>;

        before(() => {
          const validEntity = new JDLEntity({
            name: 'Valid',
          });
          validEntity.addField(
            new JDLField({
              name: 'validField',
              type: 'UNKNOWN-TYPE',
            }),
          );
          const jdlObject = new JDLObject();
          jdlObject.addEntity(validEntity);
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
      let validator: ReturnType<typeof createValidator>;

      before(() => {
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
        const jdlObject = new JDLObject();
        jdlObject.addEntity(entity);
        validator = createValidator(jdlObject);
      });

      it('should fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).to.throw("The validation 'min' isn't supported for the type 'String'.");
      });
    });
    describe('when the source entity of a relationship is missing', () => {
      let validator: ReturnType<typeof createValidator>;

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
        jdlObject.addEntity(otherEntity);
        jdlObject.addRelationship(relationship);
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
        let validator: ReturnType<typeof createValidator>;

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
          jdlObject.addEntity(sourceEntity);
          jdlObject.addRelationship(relationship);
          validator = createValidator(jdlObject);
        });

        it('should not fail', () => {
          expect(() => {
            validator.checkForErrors();
          }).not.to.throw();
        });
      });
      describe('if it is not the User entity', () => {
        let checker: ReturnType<typeof createValidator>;

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
          jdlObject.addEntity(sourceEntity);
          jdlObject.addRelationship(relationship);
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
    describe('when having DTOs without services', () => {
      let validator: ReturnType<typeof createValidator>;

      before(() => {
        const jdlObject = new JDLObject();
        jdlObject.addOption(
          new JDLBinaryOption({
            name: binaryOptions.Options.DTO,
            value: binaryOptions.Values.dto.MAPSTRUCT,
            entityNames: ['A', 'B', 'C'],
          }),
        );
        jdlObject.addOption(
          new JDLBinaryOption({
            name: binaryOptions.Options.SERVICE,
            value: binaryOptions.Values.service.SERVICE_CLASS,
            entityNames: ['B'],
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
      let validator: ReturnType<typeof createValidator>;

      before(() => {
        const jdlObject = new JDLObject();
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
        jdlObject.addOption(
          new JDLBinaryOption({
            name: binaryOptions.Options.DTO,
            value: binaryOptions.Values.dto.MAPSTRUCT,
            entityNames: ['A', 'B'],
          }),
        );
        jdlObject.addOption(
          new JDLBinaryOption({
            name: binaryOptions.Options.SERVICE,
            value: binaryOptions.Values.service.SERVICE_CLASS,
            excludedNames: ['C'],
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
      let validator: ReturnType<typeof createValidator>;

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
        jdlObject.addEntity(sourceEntity);
        jdlObject.addEntity(destinationEntity);
        jdlObject.addRelationship(relationship);
        validator = createValidator(jdlObject);
      });

      it('should not fail', () => {
        expect(() => validator.checkForErrors()).not.to.throw();
      });
    });
    describe('when having a relationship with the User entity as destination', () => {
      let validator: ReturnType<typeof createValidator>;

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
        jdlObject.addEntity(sourceEntity);
        jdlObject.addEntity(destinationEntity);
        jdlObject.addRelationship(relationship);
        validator = createValidator(jdlObject);
      });

      it('should not fail', () => {
        expect(() => validator.checkForErrors()).not.to.throw();
      });
    });
  });
});
