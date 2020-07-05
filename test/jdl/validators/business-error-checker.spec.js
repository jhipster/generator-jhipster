/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
const { expect } = chai;

const BusinessErrorChecker = require('../../../jdl/validators/business-error-checker');
const ApplicationTypes = require('../../../jdl/jhipster/application-types');
const { OptionNames } = require('../../../jdl/jhipster/application-options');
const BinaryOptions = require('../../../jdl/jhipster/binary-options');
const DatabaseTypes = require('../../../jdl/jhipster/database-types');
const FieldTypes = require('../../../jdl/jhipster/field-types');
const RelationshipTypes = require('../../../jdl/jhipster/relationship-types');
const UnaryOptions = require('../../../jdl/jhipster/unary-options');
const Validations = require('../../../jdl/jhipster/validations');
const JDLObject = require('../../../jdl/models/jdl-object');
const { createJDLApplication } = require('../../../jdl/models/jdl-application-factory');
const JDLBinaryOption = require('../../../jdl/models/jdl-binary-option');
const JDLEntity = require('../../../jdl/models/jdl-entity');
const JDLEnum = require('../../../jdl/models/jdl-enum');
const JDLField = require('../../../jdl/models/jdl-field');
const JDLRelationship = require('../../../jdl/models/jdl-relationship');
const JDLUnaryOption = require('../../../jdl/models/jdl-unary-option');
const JDLValidation = require('../../../jdl/models/jdl-validation');
const logger = require('../../../jdl/utils/objects/logger');

describe('BusinessErrorChecker', () => {
    describe('checkForErrors', () => {
        let checker;

        context('with no passed JDL object', () => {
            it('should fail', () => {
                expect(() => {
                    new BusinessErrorChecker();
                }).to.throw(/^A JDL object must be passed to check for business errors\.$/);
            });
        });
        context('with a complete JDL object', () => {
            let applicationCheckSpy;
            let entityCheckSpy;
            let fieldCheckSpy;
            let validationCheckSpy;
            let relationshipCheckSpy;
            let enumCheckSpy;
            let optionCheckSpy;

            before(() => {
                const jdlObject = new JDLObject();
                const application = createJDLApplication({ applicationType: ApplicationTypes.MONOLITH });
                application.addEntityNames(['MyEntity']);
                const entity = new JDLEntity({
                    name: 'MyEntity',
                });
                const otherEntity = new JDLEntity({
                    name: 'OtherEntity',
                });
                const field = new JDLField({
                    name: 'myField',
                    type: FieldTypes.CommonDBTypes.STRING,
                });
                const validation = new JDLValidation({
                    name: Validations.REQUIRED,
                });
                const relationship = new JDLRelationship({
                    from: entity.name,
                    to: otherEntity.name,
                    type: RelationshipTypes.ONE_TO_MANY,
                    injectedFieldInFrom: 'other',
                });
                const option = new JDLUnaryOption({
                    name: UnaryOptions.SKIP_CLIENT,
                    entities: ['MyEntity'],
                });
                const enumObject = new JDLEnum({
                    name: 'MyEnum',
                    values: [{ key: 'A' }, { key: 'B' }],
                });
                field.addValidation(validation);
                entity.addField(field);
                jdlObject.addEntity(entity);
                jdlObject.addEntity(otherEntity);
                jdlObject.addEnum(enumObject);
                jdlObject.addRelationship(relationship);
                jdlObject.addOption(option);
                jdlObject.addApplication(application);
                checker = new BusinessErrorChecker(jdlObject);
                applicationCheckSpy = sinon.spy(checker, 'checkForApplicationErrors');
                entityCheckSpy = sinon.spy(checker, 'checkForEntityErrors');
                fieldCheckSpy = sinon.spy(checker, 'checkForFieldErrors');
                validationCheckSpy = sinon.spy(checker, 'checkForValidationErrors');
                relationshipCheckSpy = sinon.spy(checker, 'checkForRelationshipErrors');
                enumCheckSpy = sinon.spy(checker, 'checkForEnumErrors');
                optionCheckSpy = sinon.spy(checker, 'checkForOptionErrors');
                checker.checkForErrors();
            });

            after(() => {
                applicationCheckSpy.restore();
                entityCheckSpy.restore();
                fieldCheckSpy.restore();
                validationCheckSpy.restore();
                relationshipCheckSpy.restore();
                enumCheckSpy.restore();
                optionCheckSpy.restore();
            });

            it('should check it', () => {
                expect(applicationCheckSpy).to.have.been.called;
                expect(entityCheckSpy).to.have.been.called;
                expect(fieldCheckSpy).to.have.been.called;
                expect(validationCheckSpy).to.have.been.called;
                expect(relationshipCheckSpy).to.have.been.called;
                expect(enumCheckSpy).to.have.been.called;
                expect(optionCheckSpy).to.have.been.called;
            });
        });
    });
    describe('checkForEntityErrors', () => {
        let checker;
        let jdlObject;
        let checkForFieldErrorsStub;

        before(() => {
            jdlObject = new JDLObject();
            jdlObject.addEntity(
                new JDLEntity({
                    name: 'valid',
                })
            );
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
                jdlObject.addEntity(
                    new JDLEntity({
                        name: 'valid',
                    })
                );
                checker = new BusinessErrorChecker(jdlObject);
                jdlObject.entities.Continue = jdlObject.getEntity('valid');
                jdlObject.entities.Continue.name = 'Continue';
                delete jdlObject.entities.valid;
            });

            it('should fail', () => {
                expect(() => {
                    checker.checkForEntityErrors();
                }).to.throw("The name 'Continue' is a reserved keyword and can not be used as an entity class name.");
            });
        });
        context('when not having applications but only entities', () => {
            context('with an entity having a reserved table name', () => {
                let loggerStub;
                before(() => {
                    jdlObject.addEntity(
                        new JDLEntity({
                            name: 'valid',
                            tableName: 'continue',
                        })
                    );
                    checker = new BusinessErrorChecker(jdlObject, {
                        databaseType: DatabaseTypes.SQL,
                    });
                    loggerStub = sinon.spy(logger, 'warn');
                    checker.checkForEntityErrors();
                });
                after(() => {
                    loggerStub.restore();
                });

                it('should warn', () => {
                    expect(loggerStub).to.have.been.calledOnce;
                    expect(loggerStub.getCall(0).args[0]).to.equal(
                        "The table name 'continue' is a reserved keyword, so it will be prefixed with the value of 'jhiPrefix'."
                    );
                });
            });
        });
        context('when having entities in applications', () => {
            context('with an entity having a reserved table name', () => {
                let loggerStub;
                before(() => {
                    const application = createJDLApplication({
                        applicationType: ApplicationTypes.MONOLITH,
                        databaseType: DatabaseTypes.SQL,
                    });
                    application.addEntityNames(['valid']);
                    jdlObject.addApplication(application);
                    jdlObject.addEntity(
                        new JDLEntity({
                            name: 'valid',
                            tableName: 'continue',
                        })
                    );
                    checker = new BusinessErrorChecker(jdlObject);
                    loggerStub = sinon.spy(logger, 'warn');
                    checker.checkForEntityErrors();
                });
                after(() => {
                    loggerStub.restore();
                });

                it('should warn', () => {
                    expect(loggerStub).to.have.been.calledOnce;
                    expect(loggerStub.getCall(0).args[0]).to.equal(
                        "The table name 'continue' is a reserved keyword for at least one of these applications: jhipster, " +
                            "so it will be prefixed with the value of 'jhiPrefix'."
                    );
                });
            });
        });
    });
    describe('checkForFieldErrors', () => {
        let checker;
        let jdlObject;
        let checkForValidationErrorsStub;

        before(() => {
            jdlObject = new JDLObject();
            const entity = new JDLEntity({
                name: 'Valid',
            });
            entity.addField(
                new JDLField({
                    name: 'validField',
                    type: FieldTypes.CommonDBTypes.STRING,
                })
            );
            jdlObject.addEntity(entity);
        });

        context('if there is at least one field', () => {
            before(() => {
                checker = new BusinessErrorChecker(jdlObject);
                checkForValidationErrorsStub = sinon.stub(checker, 'checkForValidationErrors').returns(null);
                checker.checkForFieldErrors('Valid', jdlObject.getEntity('Valid').fields);
            });
            after(() => {
                checkForValidationErrorsStub.restore();
            });

            it('calls the validation error checker method', () => {
                expect(checkForValidationErrorsStub).to.have.been.calledOnce;
            });
        });
        context('if the field name is reserved', () => {
            let loggerStub;
            before(() => {
                jdlObject.getEntity('Valid').fields.validField.name = 'catch';
                checker = new BusinessErrorChecker(jdlObject);
                loggerStub = sinon.spy(logger, 'warn');
                checker.checkForFieldErrors('Valid', jdlObject.getEntity('Valid').fields);
            });
            after(() => {
                jdlObject.getEntity('Valid').fields.validField.name = 'validField';
                loggerStub.restore();
            });

            it('should warn', () => {
                expect(loggerStub).to.have.been.calledOnce;
                expect(loggerStub.getCall(0).args[0]).to.equal(
                    "The name 'catch' is a reserved keyword, so it will be prefixed with the value of 'jhiPrefix'."
                );
            });
        });
        context('when passing gateway as application type', () => {
            context('with incompatible database type and field type', () => {
                before(() => {
                    const validEntity = new JDLEntity({
                        name: 'Valid',
                    });
                    validEntity.addField(
                        new JDLField({
                            name: 'validField',
                            type: FieldTypes.CassandraTypes.UUID,
                        })
                    );
                    jdlObject.addEntity(validEntity);
                    checker = new BusinessErrorChecker(jdlObject, {
                        databaseType: DatabaseTypes.SQL,
                        applicationType: ApplicationTypes.GATEWAY,
                    });
                });

                it('succeeds', () => {
                    expect(() => {
                        checker.checkForFieldErrors('Valid', jdlObject.getEntity('Valid').fields);
                    }).not.to.throw();
                });
            });
        });
        context('if the field type is invalid for a database type', () => {
            context('when checking a JDL object with a JDL application', () => {
                before(() => {
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
                    checker = new BusinessErrorChecker(jdlObject);
                });

                it('should fail', () => {
                    expect(() => {
                        checker.checkForFieldErrors('Valid', jdlObject.getEntity('Valid').fields);
                    }).to.throw("The type 'WeirdType' is an unknown field type for field 'validField' of entity 'Valid'.");
                });
            });
            context('when checking a JDL object with no JDL application', () => {
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
                    jdlObject.addEntity(validEntity);
                    checker = new BusinessErrorChecker(jdlObject, {
                        databaseType: DatabaseTypes.SQL,
                    });
                });

                it('should fail', () => {
                    expect(() => {
                        checker.checkForFieldErrors('Valid', jdlObject.getEntity('Valid').fields);
                    }).to.throw("The type 'WeirdType' is an unknown field type for field 'validField' of entity 'Valid'.");
                });
            });
        });
    });
    describe('checkForValidationErrors', () => {
        let checker;
        let jdlObject;

        before(() => {
            jdlObject = new JDLObject();
        });

        context('when passing an unsupported validation for a field', () => {
            before(() => {
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
                checker = new BusinessErrorChecker(jdlObject);
            });

            it('should fail', () => {
                expect(() => {
                    checker.checkForValidationErrors(jdlObject.getEntity('Valid').fields.validField);
                }).to.throw("The validation 'min' isn't supported for the type 'String'.");
            });
        });
    });
    describe('checkForRelationshipErrors', () => {
        context('when the source entity is missing', () => {
            let checker;

            before(() => {
                const sourceEntity = new JDLEntity({
                    name: 'Source',
                });
                const otherEntity = new JDLEntity({
                    name: 'Valid',
                });
                const relationship = new JDLRelationship({
                    from: sourceEntity.name,
                    to: otherEntity.name,
                    type: RelationshipTypes.ONE_TO_ONE,
                    injectedFieldInFrom: 'other',
                });
                const jdlObject = new JDLObject();
                jdlObject.addEntity(sourceEntity);
                jdlObject.addEntity(otherEntity);
                jdlObject.addRelationship(relationship);
                delete jdlObject.entities.Source;
                checker = new BusinessErrorChecker(jdlObject);
            });

            it('should fail', () => {
                expect(() => {
                    checker.checkForRelationshipErrors();
                }).to.throw('In the relationship between Source and Valid, Source is not declared.');
            });
        });
        context('when the destination entity is missing', () => {
            context('if it is the User entity', () => {
                context('when skipUserManagement flag is not set', () => {
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
                        jdlObject.addEntity(sourceEntity);
                        jdlObject.addRelationship(relationship);
                        checker = new BusinessErrorChecker(jdlObject);
                    });

                    it('should not fail', () => {
                        expect(() => {
                            checker.checkForRelationshipErrors();
                        }).not.to.throw();
                    });
                });
                context('when skipUserManagement flag is set', () => {
                    let checker;

                    before(() => {
                        const sourceEntity = new JDLEntity({
                            name: 'Source',
                        });
                        const otherEntity = new JDLEntity({
                            name: 'User',
                        });
                        const relationship = new JDLRelationship({
                            from: sourceEntity.name,
                            to: otherEntity.name,
                            type: RelationshipTypes.ONE_TO_ONE,
                            injectedFieldInFrom: 'other',
                        });
                        const jdlObject = new JDLObject();
                        jdlObject.addEntity(sourceEntity);
                        jdlObject.addEntity(otherEntity);
                        jdlObject.addRelationship(relationship);
                        jdlObject.addOption(
                            new JDLUnaryOption({
                                name: OptionNames.SKIP_USER_MANAGEMENT,
                            })
                        );
                        delete jdlObject.entities.User;
                        checker = new BusinessErrorChecker(jdlObject);
                    });

                    it('should fail', () => {
                        expect(() => {
                            checker.checkForRelationshipErrors();
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
                    jdlObject.addEntity(sourceEntity);
                    jdlObject.addRelationship(relationship);
                    checker = new BusinessErrorChecker(jdlObject);
                });

                it('should fail', () => {
                    expect(() => {
                        checker.checkForRelationshipErrors();
                    }).to.throw('In the relationship between Source and Other, Other is not declared.');
                });
            });
        });
        context('with relationships between multiple entities', () => {
            let checker;

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
                checker = new BusinessErrorChecker(jdlObject);
            });
            it('should fail', () => {
                expect(() => {
                    checker.checkForRelationshipErrors();
                }).to.throw("Entities for the ManyToMany relationship from 'B' to 'C' do not belong to the same application.");
            });
        });
    });
    describe('checkForOptionErrors', () => {
        let checker;
        let jdlObject;

        before(() => {
            jdlObject = new JDLObject();
        });
        afterEach(() => {
            jdlObject = new JDLObject();
        });

        context('when having a JDL with pagination and Cassandra as database type', () => {
            context('inside a JDL application', () => {
                before(() => {
                    const application = createJDLApplication({
                        applicationType: ApplicationTypes.MONOLITH,
                        databaseType: DatabaseTypes.CASSANDRA,
                    });
                    application.addEntityNames(['A']);
                    jdlObject.addApplication(application);
                    jdlObject.addEntity(
                        new JDLEntity({
                            name: 'A',
                        })
                    );
                    jdlObject.addOption(
                        new JDLBinaryOption({
                            name: BinaryOptions.Options.PAGINATION,
                            value: BinaryOptions.Values.pagination.PAGINATION,
                            entityNames: ['A'],
                        })
                    );
                    checker = new BusinessErrorChecker(jdlObject);
                });

                it('should fail', () => {
                    expect(() => {
                        checker.checkForOptionErrors();
                    }).to.throw("Pagination isn't allowed when the app uses Cassandra, for entity: 'A' and application: 'jhipster'");
                });
            });
            context('not inside a JDL application', () => {
                before(() => {
                    jdlObject.addOption(
                        new JDLBinaryOption({
                            name: BinaryOptions.Options.PAGINATION,
                            value: BinaryOptions.Values.pagination.PAGINATION,
                        })
                    );
                    checker = new BusinessErrorChecker(jdlObject, { databaseType: DatabaseTypes.CASSANDRA });
                });

                it('should fail', () => {
                    expect(() => {
                        checker.checkForOptionErrors();
                    }).to.throw("Pagination isn't allowed when the app uses Cassandra.");
                });
            });
        });
        context('when having DTOs without services', () => {
            before(() => {
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
                checker = new BusinessErrorChecker(jdlObject, { databaseType: DatabaseTypes.SQL });
            });

            it('should not fail', () => {
                expect(() => {
                    checker.checkForOptionErrors();
                }).not.to.throw();
            });
        });
        context('when having DTOs with services', () => {
            before(() => {
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
                checker = new BusinessErrorChecker(jdlObject, { databaseType: DatabaseTypes.SQL });
            });
            it('should not fail', () => {
                expect(() => {
                    checker.checkForOptionErrors();
                }).not.to.throw();
            });
        });
    });
});
