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
import ApplicationTypes from '../../../jdl/jhipster/application-types.js';
import BinaryOptions from '../../../jdl/jhipster/binary-options.js';
import DatabaseTypes from '../../../jdl/jhipster/database-types.js';
import FieldTypes from '../../../jdl/jhipster/field-types.js';
import RelationshipTypes from '../../../jdl/jhipster/relationship-types.js';
import Validations from '../../../jdl/jhipster/validations.js';
import JDLObject from '../../../jdl/models/jdl-object.js';
import createJDLApplication from '../../../jdl/models/jdl-application-factory.js';
import JDLBinaryOption from '../../../jdl/models/jdl-binary-option.js';
import JDLEntity from '../../../jdl/models/jdl-entity.js';
import JDLField from '../../../jdl/models/jdl-field.js';
import JDLRelationship from '../../../jdl/models/jdl-relationship.js';
import JDLValidation from '../../../jdl/models/jdl-validation.js';
import createValidator from '../../../jdl/validators/jdl-with-application-validator.js';

describe('JDLWithApplicationValidator', () => {
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
        const application = createJDLApplication({
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.SQL,
        });
        const entity = new JDLEntity({
          name: 'Continue',
        });
        application.addEntityName(entity.name);
        jdlObject.addApplication(application);
        jdlObject.addEntity(entity);
        validator = createValidator(jdlObject);
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
        const application = createJDLApplication({
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.SQL,
        });
        const entity = new JDLEntity({
          name: 'valid',
          tableName: 'continue',
        });
        jdlObject.addEntity(entity);
        application.addEntityName(entity.name);
        jdlObject.addApplication(application);
        const logger = {
          warn: callParameter => {
            parameter = callParameter;
          },
        };
        const validator = createValidator(jdlObject, logger);
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
        const application = createJDLApplication({
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.SQL,
        });
        const entity = new JDLEntity({
          name: 'Valid',
        });
        entity.addField(
          new JDLField({
            name: 'catch',
            type: FieldTypes.CommonDBTypes.STRING,
          })
        );
        jdlObject.addEntity(entity);
        jdlObject.addApplication(application);
        application.addEntityName(entity.name);
        const logger = {
          warn: callParameter => {
            parameter = callParameter;
          },
        };
        const validator = createValidator(jdlObject, logger);
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
          const jdlObject = new JDLObject();
          const application = createJDLApplication({
            applicationType: ApplicationTypes.GATEWAY,
            databaseType: DatabaseTypes.SQL,
          });
          const validEntity = new JDLEntity({
            name: 'Valid',
          });
          validEntity.addField(
            new JDLField({
              name: 'validField',
              type: 'UNKNOWN-TYPE',
            })
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
    context('if the field type is invalid for a database type', () => {
      context('when checking a JDL object with a JDL application', () => {
        let validator;

        before(() => {
          const jdlObject = new JDLObject();
          const application = createJDLApplication({
            applicationType: ApplicationTypes.MONOLITH,
            databaseType: DatabaseTypes.SQL,
          });
          application.addEntityNames(['Valid']);
          jdlObject.addApplication(application);
          const validEntity = new JDLEntity({
            name: 'Valid',
          });
          validEntity.addField(
            new JDLField({
              name: 'validField',
              type: 'WeirdType',
            })
          );
          jdlObject.addEntity(validEntity);
          validator = createValidator(jdlObject);
        });

        it('should fail', () => {
          expect(() => {
            validator.checkForErrors();
          }).to.throw("The type 'WeirdType' is an unknown field type for field 'validField' of entity 'Valid'.");
        });
      });
    });
    context('when passing an unsupported validation for a field', () => {
      let validator;

      before(() => {
        const jdlObject = new JDLObject();
        const application = createJDLApplication({
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.SQL,
        });
        const entity = new JDLEntity({
          name: 'Valid',
        });
        const field = new JDLField({
          name: 'validField',
          type: FieldTypes.CommonDBTypes.STRING,
        });
        field.addValidation(
          new JDLValidation({
            name: Validations.MIN,
            value: 42,
          })
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
    context('when the source entity of a relationship is missing', () => {
      let validator;

      before(() => {
        const otherEntity = new JDLEntity({
          name: 'Valid',
        });
        const relationship = new JDLRelationship({
          from: 'Source',
          to: otherEntity.name,
          type: RelationshipTypes.ONE_TO_ONE,
          injectedFieldInFrom: 'other',
        });
        const jdlObject = new JDLObject();
        const application = createJDLApplication({
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.SQL,
        });
        jdlObject.addEntity(otherEntity);
        jdlObject.addRelationship(relationship);
        application.addEntityName(otherEntity.name);
        jdlObject.addApplication(application);
        validator = createValidator(jdlObject);
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
              type: RelationshipTypes.ONE_TO_ONE,
              injectedFieldInFrom: 'other',
            });
            const jdlObject = new JDLObject();
            const application = createJDLApplication({
              applicationType: ApplicationTypes.MONOLITH,
              databaseType: DatabaseTypes.SQL,
            });
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
        context('when skipUserManagement flag is set', () => {
          let checker;

          before(() => {
            const sourceEntity = new JDLEntity({
              name: 'Source',
            });
            const relationship = new JDLRelationship({
              from: sourceEntity.name,
              to: 'User',
              type: RelationshipTypes.ONE_TO_ONE,
              injectedFieldInFrom: 'other',
            });
            const jdlObject = new JDLObject();
            const application = createJDLApplication({
              applicationType: ApplicationTypes.MONOLITH,
              databaseType: DatabaseTypes.SQL,
              skipUserManagement: true,
            });
            jdlObject.addEntity(sourceEntity);
            jdlObject.addRelationship(relationship);
            application.addEntityName(sourceEntity);
            jdlObject.addApplication(application);
            checker = createValidator(jdlObject);
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
            type: RelationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'other',
          });
          const jdlObject = new JDLObject();
          const application = createJDLApplication({
            applicationType: ApplicationTypes.MONOLITH,
            databaseType: DatabaseTypes.SQL,
          });
          jdlObject.addEntity(sourceEntity);
          jdlObject.addRelationship(relationship);
          application.addEntityName(sourceEntity.name);
          jdlObject.addApplication(application);
          checker = createValidator(jdlObject);
        });

        it('should fail', () => {
          expect(() => {
            checker.checkForErrors();
          }).to.throw('In the relationship between Source and Other, Other is not declared.');
        });
      });
    });
    context('with relationships between multiple applications', () => {
      let validator;

      before(() => {
        const jdlObject = new JDLObject();
        const application1 = createJDLApplication({
          applicationType: ApplicationTypes.MICROSERVICE,
          baseName: 'app1',
        });
        application1.addEntityNames(['A', 'B']);
        const application2 = createJDLApplication({
          applicationType: ApplicationTypes.MICROSERVICE,
          baseName: 'app2',
        });
        application2.addEntityNames(['B', 'C']);
        const application3 = createJDLApplication({
          applicationType: ApplicationTypes.MICROSERVICE,
          baseName: 'app3',
        });
        application3.addEntityNames(['A', 'B', 'C']);
        jdlObject.addApplication(application1);
        jdlObject.addApplication(application2);
        jdlObject.addApplication(application3);
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
        jdlObject.addRelationship(
          new JDLRelationship({
            from: 'A',
            to: 'B',
            type: RelationshipTypes.MANY_TO_MANY,
            injectedFieldInFrom: 'b',
            injectedFieldInTo: 'a',
          })
        );
        jdlObject.addRelationship(
          new JDLRelationship({
            from: 'B',
            to: 'C',
            type: RelationshipTypes.MANY_TO_MANY,
            injectedFieldInFrom: 'c',
            injectedFieldInTo: 'd',
          })
        );
        jdlObject.addRelationship(
          new JDLRelationship({
            from: 'A',
            to: 'C',
            type: RelationshipTypes.MANY_TO_MANY,
            injectedFieldInFrom: 'c',
            injectedFieldInTo: 'd',
          })
        );
        validator = createValidator(jdlObject);
      });
      it('should fail', () => {
        expect(() => {
          validator.checkForErrors();
        }).to.throw("Entities for the ManyToMany relationship from 'B' to 'C' do not belong to the same application.");
      });
    });
    context('when having a JDL with pagination and Cassandra as database type', () => {
      let validator;

      before(() => {
        const jdlObject = new JDLObject();
        const application = createJDLApplication({
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.CASSANDRA,
        });
        jdlObject.addOption(
          new JDLBinaryOption({
            name: BinaryOptions.Options.PAGINATION,
            value: BinaryOptions.Values.pagination.PAGINATION,
          })
        );
        jdlObject.addApplication(application);
        validator = createValidator(jdlObject);
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
        const application = createJDLApplication({
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.SQL,
        });
        jdlObject.addApplication(application);
        jdlObject.addOption(
          new JDLBinaryOption({
            name: BinaryOptions.Options.DTO,
            value: BinaryOptions.Values.dto.MAPSTRUCT,
            entityNames: ['A', 'B', 'C'],
          })
        );
        jdlObject.addOption(
          new JDLBinaryOption({
            name: BinaryOptions.Options.SERVICE,
            value: BinaryOptions.Values.service.SERVICE_CLASS,
            entityNames: ['B'],
          })
        );
        validator = createValidator(jdlObject);
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
        const application = createJDLApplication({
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.SQL,
        });
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
        application.addEntityName('A');
        application.addEntityName('B');
        application.addEntityName('C');
        jdlObject.addApplication(application);
        jdlObject.addOption(
          new JDLBinaryOption({
            name: BinaryOptions.Options.DTO,
            value: BinaryOptions.Values.dto.MAPSTRUCT,
            entityNames: ['A', 'B'],
          })
        );
        jdlObject.addOption(
          new JDLBinaryOption({
            name: BinaryOptions.Options.SERVICE,
            value: BinaryOptions.Values.service.SERVICE_CLASS,
            excludedNames: ['C'],
          })
        );
        validator = createValidator(jdlObject);
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
            type: RelationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'other',
          });
          const jdlObject = new JDLObject();
          const application = createJDLApplication({
            applicationType: ApplicationTypes.MONOLITH,
            databaseType: DatabaseTypes.SQL,
            skipUserManagement: true,
          });
          jdlObject.addEntity(sourceEntity);
          jdlObject.addEntity(destinationEntity);
          jdlObject.addRelationship(relationship);
          application.addEntityName(sourceEntity);
          application.addEntityName(destinationEntity);
          jdlObject.addApplication(application);
          validator = createValidator(jdlObject);
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
            type: RelationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'other',
          });
          const jdlObject = new JDLObject();
          const application = createJDLApplication({
            applicationType: ApplicationTypes.MONOLITH,
            databaseType: DatabaseTypes.SQL,
            skipUserManagement: false,
          });
          jdlObject.addEntity(destinationEntity);
          jdlObject.addRelationship(relationship);
          application.addEntityName(destinationEntity);
          jdlObject.addApplication(application);
          validator = createValidator(jdlObject);
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
            type: RelationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'other',
          });
          const jdlObject = new JDLObject();
          const application = createJDLApplication({
            applicationType: ApplicationTypes.MONOLITH,
            databaseType: DatabaseTypes.SQL,
            skipUserManagement: true,
          });
          jdlObject.addEntity(sourceEntity);
          jdlObject.addEntity(destinationEntity);
          jdlObject.addRelationship(relationship);
          application.addEntityName(sourceEntity);
          application.addEntityName(destinationEntity);
          jdlObject.addApplication(application);
          validator = createValidator(jdlObject);
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
            type: RelationshipTypes.ONE_TO_ONE,
            injectedFieldInFrom: 'other',
          });
          const jdlObject = new JDLObject();
          const application = createJDLApplication({
            applicationType: ApplicationTypes.MONOLITH,
            databaseType: DatabaseTypes.SQL,
            skipUserManagement: false,
          });
          jdlObject.addEntity(sourceEntity);
          jdlObject.addRelationship(relationship);
          application.addEntityName(sourceEntity);
          jdlObject.addApplication(application);
          validator = createValidator(jdlObject);
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
        const application = createJDLApplication({
          applicationType: ApplicationTypes.MONOLITH,
          databaseType: DatabaseTypes.SQL,
          blueprints: ['generator-jhipster-nodejs', 'generator-jhipster-dotnetcore'],
        });
        jdlObject.addApplication(application);
        const logger = {
          warn: callParameter => {
            parameter = callParameter;
          },
        };
        const validator = createValidator(jdlObject, logger);
        validator.checkForErrors();
      });

      it('should warn about not performing jdl validation', () => {
        expect(parameter).to.equal('Blueprints are being used, the JDL validation phase is skipped.');
      });
    });
  });
});
