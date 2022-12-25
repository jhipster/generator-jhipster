/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import { expect } from 'chai';
import JDLObject from '../../../jdl/models/jdl-object.js';
import { JDLEntity } from '../../../jdl/models/index.mjs';
import JDLField from '../../../jdl/models/jdl-field.js';
import JDLValidation from '../../../jdl/models/jdl-validation.js';
import JDLRelationship from '../../../jdl/models/jdl-relationship.js';
import JDLBinaryOption from '../../../jdl/models/jdl-binary-option.js';
import {
  applicationTypes,
  databaseTypes,
  fieldTypes,
  validations,
  relationshipTypes,
  binaryOptions,
} from '../../../jdl/jhipster/index.mjs';
import createValidator from '../../../jdl/validators/jdl-without-application-validator.js';

const { GATEWAY } = applicationTypes;
const {
  Validations: { MIN },
} = validations;

describe('JDLWithoutApplicationValidator', () => {
  describe('createValidator', () => {
    context('when not passing a JDL object', () => {
      it('should fail', () => {
        // @ts-expect-error
        expect(() => createValidator()).to.throw(/^A JDL object must be passed to check for business errors.$/);
      });
    });
  });
  describe('checkForErrors', () => {
    context('when having an entity with a reserved name', () => {
      let validator;

      before(() => {
        const jdlObject = new JDLObject();
        jdlObject.addEntity(
          new JDLEntity({
            name: 'Continue',
          })
        );
        validator = createValidator(jdlObject, { databaseType: databaseTypes.SQL });
      });

      it('should fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).to.throw(/^The name 'Continue' is a reserved keyword and can not be used as an entity class name.$/);
      });
    });
    context('when having an entity with a reserved table name', () => {
      let parameter;

      before(() => {
        const jdlObject = new JDLObject();
        jdlObject.addEntity(
          new JDLEntity({
            name: 'valid',
            tableName: 'continue',
          })
        );
        const logger = {
          warn: callParameter => {
            parameter = callParameter;
          },
        };
        const validator = createValidator(
          jdlObject,
          {
            databaseType: databaseTypes.SQL,
          },
          logger
        );
        validator.checkForErrors();
      });

      it('should warn', () => {
        expect(parameter).to.equal(
          "The table name 'continue' is a reserved keyword, so it will be prefixed with the value of 'jhiPrefix'."
        );
      });
    });
    context('when having a field reserved name', () => {
      let parameter;

      before(() => {
        const jdlObject = new JDLObject();
        const entity = new JDLEntity({
          name: 'Valid',
        });
        entity.addField(
          new JDLField({
            name: 'catch',
            type: fieldTypes.CommonDBTypes.STRING,
          })
        );
        jdlObject.addEntity(entity);
        const logger = {
          warn: callParameter => {
            parameter = callParameter;
          },
        };
        const validator = createValidator(
          jdlObject,
          {
            databaseType: databaseTypes.SQL,
          },
          logger
        );
        validator.checkForErrors();
      });

      it('should warn', () => {
        expect(parameter).to.equal("The name 'catch' is a reserved keyword, so it will be prefixed with the value of 'jhiPrefix'.");
      });
    });
    context('when passing gateway as application type', () => {
      context('with incompatible database type and field type', () => {
        let validator;

        before(() => {
          const validEntity = new JDLEntity({
            name: 'Valid',
          });
          validEntity.addField(
            new JDLField({
              name: 'validField',
              type: 'UNKNOWN-TYPE',
            })
          );
          const jdlObject = new JDLObject();
          jdlObject.addEntity(validEntity);
          validator = createValidator(jdlObject, {
            databaseType: databaseTypes.SQL,
            applicationType: GATEWAY,
          });
        });

        it('should not fail', () => {
          expect(() => {
            validator.checkForErrors();
          }).not.to.throw();
        });
      });
    });
    context('when having a field type that is invalid for a database type', () => {
      let validator;

      before(() => {
        const validEntity = new JDLEntity({
          name: 'Valid',
        });
        validEntity.addField(
          new JDLField({
            name: 'validField',
            type: 'WeirdType',
          })
        );
        const jdlObject = new JDLObject();
        jdlObject.addEntity(validEntity);
        validator = createValidator(jdlObject, {
          databaseType: databaseTypes.SQL,
        });
      });

      it('should fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).to.throw("The type 'WeirdType' is an unknown field type for field 'validField' of entity 'Valid'.");
      });
    });
    context('when passing an unsupported validation for a field', () => {
      let validator;

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
          })
        );
        entity.addField(field);
        const jdlObject = new JDLObject();
        jdlObject.addEntity(entity);
        validator = createValidator(jdlObject, {
          databaseType: databaseTypes.SQL,
        });
      });

      it('should fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).to.throw("The validation 'min' isn't supported for the type 'String'.");
      });
    });
    context('when the source entity of a relationship is missing', () => {
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
        jdlObject.addEntity(otherEntity);
        jdlObject.addRelationship(relationship);
        validator = createValidator(jdlObject, {
          databaseType: databaseTypes.SQL,
        });
      });

      it('should fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).to.throw('In the relationship between Source and Valid, Source is not declared.');
      });
    });
    context('when the destination entity of a relationship is missing', () => {
      context('if it is the User entity', () => {
        context('when the skipUserManagement flag is not set', () => {
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
            });
            const jdlObject = new JDLObject();
            jdlObject.addEntity(sourceEntity);
            jdlObject.addRelationship(relationship);
            validator = createValidator(jdlObject, {
              databaseType: databaseTypes.SQL,
            });
          });

          it('should not fail', () => {
            expect(() => {
              validator.checkForErrors();
            }).not.to.throw();
          });
        });
        context('when skipUserManagement flag is set', () => {
          let checker;

          before(() => {
            const sourceEntity = new JDLEntity({
              name: 'Source',
            });
            const relationship = new JDLRelationship({
              from: sourceEntity.name,
              to: 'User',
              type: relationshipTypes.ONE_TO_ONE,
              injectedFieldInFrom: 'other',
            });
            const jdlObject = new JDLObject();
            jdlObject.addEntity(sourceEntity);
            jdlObject.addRelationship(relationship);
            checker = createValidator(jdlObject, {
              databaseType: databaseTypes.SQL,
              skippedUserManagement: true,
            });
          });

          it('should fail', () => {
            expect(() => {
              checker.checkForErrors();
            }).to.throw('In the relationship between Source and User, User is not declared.');
          });
        });
      });
      context('if it is not the User entity', () => {
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
          jdlObject.addEntity(sourceEntity);
          jdlObject.addRelationship(relationship);
          checker = createValidator(jdlObject, {
            databaseType: databaseTypes.SQL,
          });
        });

        it('should fail', () => {
          expect(() => {
            checker.checkForErrors();
          }).to.throw('In the relationship between Source and Other, Other is not declared.');
        });
      });
    });
    context('when having a JDL with pagination and Cassandra as database type', () => {
      let validator;

      before(() => {
        const jdlObject = new JDLObject();
        jdlObject.addOption(
          new JDLBinaryOption({
            name: binaryOptions.Options.PAGINATION,
            value: binaryOptions.Values.pagination.PAGINATION,
          })
        );
        validator = createValidator(jdlObject, { databaseType: databaseTypes.CASSANDRA });
      });

      it('should fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).to.throw("Pagination isn't allowed when the application uses Cassandra.");
      });
    });
    context('when having DTOs without services', () => {
      let validator;

      before(() => {
        const jdlObject = new JDLObject();
        jdlObject.addOption(
          new JDLBinaryOption({
            name: binaryOptions.Options.DTO,
            value: binaryOptions.Values.dto.MAPSTRUCT,
            entityNames: ['A', 'B', 'C'],
          })
        );
        jdlObject.addOption(
          new JDLBinaryOption({
            name: binaryOptions.Options.SERVICE,
            value: binaryOptions.Values.service.SERVICE_CLASS,
            entityNames: ['B'],
          })
        );
        validator = createValidator(jdlObject, { databaseType: databaseTypes.SQL });
      });

      it('should not fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).not.to.throw();
      });
    });
    context('when having DTOs with services', () => {
      let validator;

      before(() => {
        const jdlObject = new JDLObject();
        jdlObject.addEntity(
          new JDLEntity({
            name: 'A',
          })
        );
        jdlObject.addEntity(
          new JDLEntity({
            name: 'B',
          })
        );
        jdlObject.addEntity(
          new JDLEntity({
            name: 'C',
          })
        );
        jdlObject.addOption(
          new JDLBinaryOption({
            name: binaryOptions.Options.DTO,
            value: binaryOptions.Values.dto.MAPSTRUCT,
            entityNames: ['A', 'B'],
          })
        );
        jdlObject.addOption(
          new JDLBinaryOption({
            name: binaryOptions.Options.SERVICE,
            value: binaryOptions.Values.service.SERVICE_CLASS,
            excludedNames: ['C'],
          })
        );
        validator = createValidator(jdlObject, { databaseType: databaseTypes.SQL });
      });
      it('should not fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).not.to.throw();
      });
    });
    context('when having a relationship with the User entity as source', () => {
      context('with skipUserManagement', () => {
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
          jdlObject.addEntity(sourceEntity);
          jdlObject.addEntity(destinationEntity);
          jdlObject.addRelationship(relationship);
          validator = createValidator(jdlObject, { databaseType: databaseTypes.SQL, skippedUserManagement: true });
        });

        it('should not fail', () => {
          expect(() => validator.checkForErrors()).not.to.throw();
        });
      });
      context('without skipUserManagement', () => {
        let validator;

        before(() => {
          const destinationEntity = new JDLEntity({
            name: 'Destination',
          });
          const relationship = new JDLRelationship({
            from: 'User',
            to: destinationEntity.name,
            type: relationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'other',
          });
          const jdlObject = new JDLObject();
          jdlObject.addEntity(destinationEntity);
          jdlObject.addRelationship(relationship);
          validator = createValidator(jdlObject, { databaseType: databaseTypes.SQL, skippedUserManagement: false });
        });

        it('should fail', () => {
          expect(() => validator.checkForErrors()).to.throw(
            /^Relationships from the User entity is not supported in the declaration between 'User' and 'Destination'. You can have this by using the 'skipUserManagement' option.$/
          );
        });
      });
    });
    context('when having a relationship with the User entity as destination', () => {
      context('with skipUserManagement', () => {
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
          jdlObject.addEntity(sourceEntity);
          jdlObject.addEntity(destinationEntity);
          jdlObject.addRelationship(relationship);
          validator = createValidator(jdlObject, { databaseType: databaseTypes.SQL, skippedUserManagement: true });
        });

        it('should not fail', () => {
          expect(() => validator.checkForErrors()).not.to.throw();
        });
      });
      context('without skipUserManagement', () => {
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
          });
          const jdlObject = new JDLObject();
          jdlObject.addEntity(sourceEntity);
          jdlObject.addRelationship(relationship);
          validator = createValidator(jdlObject, { databaseType: databaseTypes.SQL, skippedUserManagement: false });
        });

        it('should not fail', () => {
          expect(() => validator.checkForErrors()).not.to.throw();
        });
      });
    });
    context('when blueprints is used', () => {
      let parameter;

      before(() => {
        const jdlObject = new JDLObject();
        const logger = {
          warn: callParameter => {
            parameter = callParameter;
          },
        };
        const validator = createValidator(
          jdlObject,
          { blueprints: ['generator-jhipster-nodejs', 'generator-jhipster-dotnetcore'] },
          logger
        );
        validator.checkForErrors();
      });

      it('should warn about not performing jdl validation', () => {
        expect(parameter).to.equal('Blueprints are being used, the JDL validation phase is skipped.');
      });
    });
  });
});
