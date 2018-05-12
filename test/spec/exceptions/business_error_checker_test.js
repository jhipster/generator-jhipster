/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-new, no-unused-expressions */
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const expect = chai.expect;

const BusinessErrorChecker = require('../../../lib/exceptions/business_error_checker');
const ApplicationTypes = require('../../../lib/core/jhipster/application_types');
const DatabaseTypes = require('../../../lib/core/jhipster/database_types');
const FieldTypes = require('../../../lib/core/jhipster/field_types');
const JDLObject = require('../../../lib/core/jdl_object');
const JDLApplication = require('../../../lib/core/jdl_application');
const JDLEntity = require('../../../lib/core/jdl_entity');
const JDLField = require('../../../lib/core/jdl_field');

describe('BusinessErrorChecker', () => {
  describe('#checkForErrors', () => {
    let checker = null;

    before(() => {
      checker = new BusinessErrorChecker();
    });

    context('with no passed JDL object', () => {
      it('does not fail', () => {
        expect(() => {
          checker.checkForErrors();
        }).not.to.throw();
      });
    });
  });
  describe('#checkForApplicationErrors', () => {
    let checker = null;
    let jdlObject = null;

    before(() => {
      jdlObject = new JDLObject();
    });

    context('when having an UAA application with skipped user management', () => {
      before(() => {
        jdlObject.addApplication(new JDLApplication({
          config: {
            applicationType: ApplicationTypes.UAA,
            skipUserManagement: true,
            uaaBaseName: 'uaa'
          }
        }));
        checker = new BusinessErrorChecker(jdlObject);
      });

      it('fails', () => {
        expect(() => {
          checker.checkForApplicationErrors();
        }).to.throw('Skipping user management in a UAA app is forbidden.');
      });
    });
  });
  describe('#checkForEntityErrors', () => {
    let checker = null;
    let jdlObject = null;
    let checkForFieldErrorsStub = null;

    before(() => {
      jdlObject = new JDLObject();
      jdlObject.addEntity(new JDLEntity({
        name: 'valid'
      }));
    });
    afterEach(() => {
      jdlObject = new JDLObject();
    });

    context('if there is at least one entity', () => {
      before(() => {
        checker = new BusinessErrorChecker(jdlObject);
        checkForFieldErrorsStub = sinon.stub(checker, 'checkForFieldErrors').returns(null);
        checker.checkForEntityErrors();
      });
      after(() => {
        checkForFieldErrorsStub.restore();
      });

      it('calls the field error checker method', () => {
        expect(checkForFieldErrorsStub).to.have.been.calledOnce;
      });
    });
    context('when having an entity with a reserved name', () => {
      before(() => {
        jdlObject.addEntity(new JDLEntity({
          name: 'valid'
        }));
        checker = new BusinessErrorChecker(jdlObject);
        jdlObject.entities.Continue = jdlObject.entities.valid;
        jdlObject.entities.Continue.name = 'Continue';
        delete jdlObject.entities.valid;
      });

      it('fails', () => {
        expect(() => {
          checker.checkForEntityErrors();
        }).to.throw('The name \'Continue\' is a reserved keyword and can not be used as an entity class name.');
      });
    });
    context('when not having applications but only entities', () => {
      context('with an entity having a reserved table name', () => {
        before(() => {
          jdlObject.addEntity(new JDLEntity({
            name: 'valid',
            tableName: 'continue'
          }));
          checker = new BusinessErrorChecker(jdlObject, {
            databaseType: DatabaseTypes.SQL
          });
        });

        it('fails', () => {
          expect(() => {
            checker.checkForEntityErrors();
          }).to.throw('The name \'continue\' is a reserved keyword and can not be used as an entity table name.');
        });
      });
    });
    context('when having entities in applications', () => {
      context('with an entity having a reserved table name', () => {
        before(() => {
          jdlObject.addApplication(new JDLApplication({
            config: {
              databaseType: DatabaseTypes.SQL
            },
            entities: ['valid']
          }));
          jdlObject.addEntity(new JDLEntity({
            name: 'valid',
            tableName: 'continue'
          }));
          checker = new BusinessErrorChecker(jdlObject);
        });

        it('fails', () => {
          expect(() => {
            checker.checkForEntityErrors();
          }).to.throw('The name \'continue\' is a reserved keyword and can not be used as an entity table name for ' +
            'at least one of these applications: jhipster.');
        });
      });
    });
  });
  describe('#checkForFieldErrors', () => {
    let checker = null;
    let jdlObject = null;
    let checkForValidationErrorsStub = null;

    before(() => {
      jdlObject = new JDLObject();
      const entity = new JDLEntity({
        name: 'Valid'
      });
      entity.addField(new JDLField({
        name: 'validField',
        type: FieldTypes.CommonDBTypes.STRING
      }));
      jdlObject.addEntity(entity);
    });

    context('if there is at least one field', () => {
      before(() => {
        checker = new BusinessErrorChecker(jdlObject);
        checkForValidationErrorsStub = sinon.stub(checker, 'checkForValidationErrors').returns(null);
        checker.checkForFieldErrors('Valid', jdlObject.entities.Valid.fields);
      });
      after(() => {
        checkForValidationErrorsStub.restore();
      });

      it('calls the validation error checker method', () => {
        expect(checkForValidationErrorsStub).to.have.been.calledOnce;
      });
    });
    context('if the field name is reserved', () => {
      before(() => {
        jdlObject.entities.Valid.fields.validField.name = 'catch';
        checker = new BusinessErrorChecker(jdlObject);
      });
      after(() => {
        jdlObject.entities.Valid.fields.validField.name = 'validField';
      });

      it('fails', () => {
        expect(() => {
          checker.checkForFieldErrors('Valid', jdlObject.entities.Valid.fields);
        }).to.throw('The name \'catch\' is a reserved keyword and can not be used as an entity field name.');
      });
    });
    context('if the field type is invalid for a database type', () => {
      context('when checking a JDL object with a JDL application', () => {
        before(() => {
          jdlObject.addApplication(new JDLApplication({
            config: {
              databaseType: DatabaseTypes.SQL
            },
            entities: ['Valid']
          }));
          const validEntity = new JDLEntity({
            name: 'Valid',
            tableName: 'continue'
          });
          validEntity.addField(new JDLField({
            name: 'validField',
            type: FieldTypes.CommonDBTypes.STRING
          }));
          jdlObject.addEntity(validEntity);
          jdlObject.entities.Valid.fields.validField.name = 'continue';
          checker = new BusinessErrorChecker(jdlObject);
        });

        it('fails', () => {
          expect(() => {
            checker.checkForFieldErrors('Valid', jdlObject.entities.Valid.fields);
          }).to.throw('The name \'continue\' is a reserved keyword and can not be used as an entity field name.');
        });
      });
      context('when checking a JDL object with no JDL application', () => {
        before(() => {
          const validEntity = new JDLEntity({
            name: 'Valid',
            tableName: 'continue'
          });
          validEntity.addField(new JDLField({
            name: 'validField',
            type: FieldTypes.CommonDBTypes.STRING
          }));
          jdlObject.addEntity(validEntity);
          jdlObject.entities.Valid.fields.validField.name = 'continue';
          checker = new BusinessErrorChecker(jdlObject, {
            databaseType: DatabaseTypes.SQL
          });
        });

        it('fails', () => {
          expect(() => {
            checker.checkForFieldErrors('Valid', jdlObject.entities.Valid.fields);
          }).to.throw('The name \'continue\' is a reserved keyword and can not be used as an entity field name.');
        });
      });
      context('when passing gateway as application type', () => {
        it('succeeds', () => {
          before(() => {
            const validEntity = new JDLEntity({
              name: 'Valid',
              tableName: 'continue'
            });
            validEntity.addField(new JDLField({
              name: 'validField',
              type: FieldTypes.CommonDBTypes.STRING
            }));
            jdlObject.addEntity(validEntity);
            jdlObject.entities.Valid.fields.validField.name = 'continue';
            checker = new BusinessErrorChecker(jdlObject, {
              databaseType: DatabaseTypes.SQL,
              applicationType: ApplicationTypes.GATEWAY
            });
          });

          it('fails', () => {
            expect(() => {
              checker.checkForFieldErrors('Valid', jdlObject.entities.Valid.fields);
            }).not.to.throw();
          });
        });
      });
    });
  });
  describe('#checkForValidationErrors', () => {

  });
  describe('#checkForRelationshipErrors', () => {

  });
  describe('#checkForEnumErrors', () => {

  });
  describe('#checkForOptionErrors', () => {

  });
});
