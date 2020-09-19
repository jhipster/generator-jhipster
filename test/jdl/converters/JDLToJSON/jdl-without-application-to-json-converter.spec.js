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
const { expect } = require('chai');

const { convert } = require('../../../../jdl/converters/jdl-to-json/jdl-without-application-to-json-converter');
const { MONOLITH } = require('../../../../jdl/jhipster/application-types');
const { SQL } = require('../../../../jdl/jhipster/database-types');
const JDLObject = require('../../../../jdl/models/jdl-object');
const JDLEntity = require('../../../../jdl/models/jdl-entity');
const JDLField = require('../../../../jdl/models/jdl-field');
const JDLEnum = require('../../../../jdl/models/jdl-enum');
const JDLValidation = require('../../../../jdl/models/jdl-validation');
const JDLRelationship = require('../../../../jdl/models/jdl-relationship');
const JDLUnaryOption = require('../../../../jdl/models/jdl-unary-option');
const JDLBinaryOption = require('../../../../jdl/models/jdl-binary-option');
const { CommonDBTypes } = require('../../../../jdl/jhipster/field-types');
const Validations = require('../../../../jdl/jhipster/validations');
const UnaryOptions = require('../../../../jdl/jhipster/unary-options');
const BinaryOptions = require('../../../../jdl/jhipster/binary-options');
const { ONE_TO_ONE, MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY } = require('../../../../jdl/jhipster/relationship-types');
const { JPA_DERIVED_IDENTIFIER } = require('../../../../jdl/jhipster/relationship-options');
const logger = require('../../../../jdl/utils/objects/logger');
const { formatDateForLiquibase } = require('../../../../jdl/utils/format-utils');

describe('JDLWithoutApplicationToJSONConverter', () => {
    describe('convert', () => {
        context('when passing invalid parameters', () => {
            context('such as no parameter', () => {
                it('should throw an error', () => {
                    expect(() => {
                        convert();
                    }).to.throw(/^The JDL object, the application's name and its the database type are mandatory\.$/);
                });
            });
            context('such as an no database type', () => {
                it('should throw an error', () => {
                    expect(() => {
                        convert({ jdlObject: new JDLObject(), applicationName: 'toto' });
                    }).to.throw(/^The JDL object, the application's name and its the database type are mandatory\.$/);
                });
            });
            context('such as no application name', () => {
                it('should throw an error', () => {
                    expect(() => {
                        convert({ jdlObject: new JDLObject(), databaseType: 'sql' });
                    }).to.throw(/^The JDL object, the application's name and its the database type are mandatory\.$/);
                });
            });
        });
        context('when passing a JDL object without entities', () => {
            let result;

            before(() => {
                const jdlObject = new JDLObject();
                result = convert({
                    jdlObject,
                    applicationName: 'toto',
                    applicationType: MONOLITH,
                    databaseType: SQL,
                    creationTimestamp: Date.now(),
                });
            });

            it('should return a list with no entity', () => {
                expect(result.get('toto').length).to.equal(0);
            });
        });
        context('when passing a JDL object with entities', () => {
            context('with some of them being built-in entities', () => {
                let builtInEntitiesAreConverted;
                let customEntitiesAreConverted;

                before(() => {
                    const jdlObject = new JDLObject();
                    const entityA = new JDLEntity({
                        name: 'A',
                        tableName: 'entity_a',
                        comment: 'The best entity',
                    });
                    const userEntity = new JDLEntity({
                        name: 'User',
                    });
                    const authorityEntity = new JDLEntity({
                        name: 'Authority',
                    });
                    jdlObject.addEntity(entityA);
                    jdlObject.addEntity(userEntity);
                    jdlObject.addEntity(authorityEntity);
                    const returnedMap = convert({
                        jdlObject,
                        applicationName: 'toto',
                        applicationType: MONOLITH,
                        creationTimestamp: new Date(2020, 0, 1, 1, 0, 0),
                        databaseType: SQL,
                    });
                    customEntitiesAreConverted = returnedMap.get('toto').every(entity => entity.name === 'A');
                    builtInEntitiesAreConverted = returnedMap
                        .get('toto')
                        .some(entity => entity.name === 'User' || entity.name === 'Authority');
                });

                it('should not convert built-in entities', () => {
                    expect(builtInEntitiesAreConverted).to.be.false;
                });
                it('should convert custom entities', () => {
                    expect(customEntitiesAreConverted).to.be.true;
                });
            });
            context('with no field, no option and no relationship', () => {
                let convertedEntity;

                before(() => {
                    const jdlObject = new JDLObject();
                    const entityA = new JDLEntity({
                        name: 'A',
                        tableName: 'entity_a',
                        comment: 'The best entity',
                    });
                    jdlObject.addEntity(entityA);
                    const returnedMap = convert({
                        jdlObject,
                        applicationName: 'toto',
                        applicationType: MONOLITH,
                        creationTimestamp: new Date(2020, 0, 1, 1, 0, 0),
                        databaseType: SQL,
                    });
                    convertedEntity = returnedMap.get('toto')[0];
                });

                it('should convert the entity', () => {
                    expect(convertedEntity).to.deep.equal({
                        applications: '*',
                        changelogDate: formatDateForLiquibase({ date: new Date(2020, 0, 1, 1, 0, 0), increment: 1 }),
                        dto: 'no',
                        embedded: false,
                        entityTableName: 'entity_a',
                        fields: [],
                        fluentMethods: true,
                        javadoc: 'The best entity',
                        jpaMetamodelFiltering: false,
                        name: 'A',
                        pagination: 'no',
                        readOnly: false,
                        relationships: [],
                        service: 'no',
                    });
                });
            });
            context('with options', () => {
                let convertedEntity;

                before(() => {
                    const jdlObject = new JDLObject();
                    const entityA = new JDLEntity({
                        name: 'A',
                        tableName: 'entity_a',
                        comment: 'The best entity',
                    });
                    const options = [
                        new JDLUnaryOption({
                            name: UnaryOptions.EMBEDDED,
                            entityNames: ['A'],
                        }),
                        new JDLUnaryOption({
                            name: UnaryOptions.NO_FLUENT_METHOD,
                            entityNames: ['A'],
                        }),
                        new JDLUnaryOption({
                            name: UnaryOptions.FILTER,
                            entityNames: ['A'],
                        }),
                        new JDLUnaryOption({
                            name: UnaryOptions.READ_ONLY,
                            entityNames: ['A'],
                        }),
                        new JDLUnaryOption({
                            name: UnaryOptions.SKIP_CLIENT,
                            entityNames: ['A'],
                        }),
                        new JDLUnaryOption({
                            name: UnaryOptions.SKIP_SERVER,
                            entityNames: ['A'],
                        }),
                        new JDLBinaryOption({
                            name: BinaryOptions.Options.ANGULAR_SUFFIX,
                            value: 'suffix',
                            entityNames: ['A'],
                        }),
                        new JDLBinaryOption({
                            name: BinaryOptions.Options.CLIENT_ROOT_FOLDER,
                            value: '../client_root_folder',
                            entityNames: ['A'],
                        }),
                        new JDLBinaryOption({
                            name: BinaryOptions.Options.DTO,
                            value: BinaryOptions.Values.dto.MAPSTRUCT,
                            entityNames: ['A'],
                        }),
                        new JDLBinaryOption({
                            name: BinaryOptions.Options.MICROSERVICE,
                            value: 'myMs',
                            entityNames: ['A'],
                        }),
                        new JDLBinaryOption({
                            name: BinaryOptions.Options.PAGINATION,
                            value: BinaryOptions.Values.pagination.PAGINATION,
                            entityNames: ['A'],
                        }),
                        new JDLBinaryOption({
                            name: BinaryOptions.Options.SEARCH,
                            value: BinaryOptions.Values.search.COUCHBASE,
                            entityNames: ['A'],
                        }),
                        new JDLBinaryOption({
                            name: BinaryOptions.Options.SERVICE,
                            value: BinaryOptions.Values.service.SERVICE_IMPL,
                            entityNames: ['A'],
                        }),
                    ];
                    jdlObject.addEntity(entityA);
                    options.forEach(option => jdlObject.addOption(option));
                    const returnedMap = convert({
                        jdlObject,
                        applicationName: 'toto',
                        applicationType: MONOLITH,
                        creationTimestamp: new Date(2020, 0, 1, 1, 0, 0),
                        databaseType: SQL,
                    });
                    convertedEntity = returnedMap.get('toto')[0];
                });

                it('should convert the entity', () => {
                    expect(convertedEntity).to.deep.equal({
                        angularJSSuffix: 'suffix',
                        applications: '*',
                        changelogDate: formatDateForLiquibase({ date: new Date(2020, 0, 1, 1, 0, 0), increment: 1 }),
                        clientRootFolder: '../client_root_folder',
                        dto: 'mapstruct',
                        embedded: true,
                        entityTableName: 'entity_a',
                        fields: [],
                        fluentMethods: false,
                        javadoc: 'The best entity',
                        jpaMetamodelFiltering: true,
                        microserviceName: 'myMs',
                        name: 'A',
                        pagination: 'pagination',
                        readOnly: true,
                        relationships: [],
                        searchEngine: 'couchbase',
                        service: 'serviceImpl',
                        skipClient: true,
                        skipServer: true,
                    });
                });
            });
            context('when setting the DTO option without the service option', () => {
                let convertedEntity;
                let loggerSpy;

                before(() => {
                    loggerSpy = sinon.spy(logger, 'info');
                    const jdlObject = new JDLObject();
                    const entityA = new JDLEntity({
                        name: 'A',
                        tableName: 'entity_a',
                        comment: 'The best entity',
                    });
                    jdlObject.addEntity(entityA);
                    jdlObject.addOption(
                        new JDLBinaryOption({
                            name: BinaryOptions.Options.DTO,
                            value: BinaryOptions.Values.dto.MAPSTRUCT,
                            entityNames: ['A'],
                        })
                    );
                    const returnedMap = convert({
                        jdlObject,
                        applicationName: 'toto',
                        applicationType: MONOLITH,
                        creationTimestamp: new Date(2020, 0, 1, 1, 0, 0),
                        databaseType: SQL,
                    });
                    convertedEntity = returnedMap.get('toto')[0];
                });

                after(() => {
                    loggerSpy.restore();
                });

                it('should log the automatic setting of the option', () => {
                    expect(loggerSpy.getCall(0).args[0]).to.equal(
                        "The dto option is set for A, the 'serviceClass' value for the 'service' is gonna be set for this entity if " +
                            'no other value has been set.'
                    );
                });
                it('should set the service option to serviceClass', () => {
                    expect(convertedEntity).to.deep.equal({
                        applications: '*',
                        changelogDate: formatDateForLiquibase({ date: new Date(2020, 0, 1, 1, 0, 0), increment: 1 }),
                        dto: 'mapstruct',
                        embedded: false,
                        entityTableName: 'entity_a',
                        fields: [],
                        fluentMethods: true,
                        javadoc: 'The best entity',
                        jpaMetamodelFiltering: false,
                        name: 'A',
                        pagination: 'no',
                        readOnly: false,
                        relationships: [],
                        service: 'serviceClass',
                    });
                });
            });
            context('when setting the filtering option without the service option', () => {
                let convertedEntity;
                let loggerSpy;

                before(() => {
                    loggerSpy = sinon.spy(logger, 'info');
                    const jdlObject = new JDLObject();
                    const entityA = new JDLEntity({
                        name: 'A',
                        tableName: 'entity_a',
                        comment: 'The best entity',
                    });
                    jdlObject.addEntity(entityA);
                    jdlObject.addOption(
                        new JDLUnaryOption({
                            name: UnaryOptions.FILTER,
                            entityNames: ['A'],
                        })
                    );
                    const returnedMap = convert({
                        jdlObject,
                        applicationName: 'toto',
                        applicationType: MONOLITH,
                        creationTimestamp: new Date(2020, 0, 1, 1, 0, 0),
                        databaseType: SQL,
                    });
                    convertedEntity = returnedMap.get('toto')[0];
                });

                after(() => {
                    loggerSpy.restore();
                });

                it('should log the automatic setting of the option', () => {
                    expect(loggerSpy.getCall(0).args[0]).to.equal(
                        "The filter option is set for A, the 'serviceClass' value for the 'service' is gonna be set for this " +
                            'entity if no other value has been set.'
                    );
                });
                it('should set the service option to serviceClass', () => {
                    expect(convertedEntity).to.deep.equal({
                        applications: '*',
                        changelogDate: formatDateForLiquibase({ date: new Date(2020, 0, 1, 1, 0, 0), increment: 1 }),
                        dto: 'no',
                        embedded: false,
                        entityTableName: 'entity_a',
                        fields: [],
                        fluentMethods: true,
                        javadoc: 'The best entity',
                        jpaMetamodelFiltering: true,
                        name: 'A',
                        pagination: 'no',
                        readOnly: false,
                        relationships: [],
                        service: 'serviceClass',
                    });
                });
            });
            context('when the searching option is set with exclusions', () => {
                let convertedEntity;

                before(() => {
                    const jdlObject = new JDLObject();
                    const entityA = new JDLEntity({
                        name: 'A',
                        tableName: 'entity_a',
                        comment: 'The best entity',
                    });
                    jdlObject.addEntity(entityA);
                    jdlObject.addOption(
                        new JDLUnaryOption({
                            name: BinaryOptions.Options.SEARCH,
                            values: BinaryOptions.Values.search.COUCHBASE,
                            entityNames: ['*'],
                            excludedNames: ['A'],
                        })
                    );
                    const returnedMap = convert({
                        jdlObject,
                        applicationName: 'toto',
                        applicationType: MONOLITH,
                        creationTimestamp: new Date(2020, 0, 1, 1, 0, 0),
                        databaseType: SQL,
                    });
                    convertedEntity = returnedMap.get('toto')[0];
                });

                it('should prevent the entities from being searched', () => {
                    expect(convertedEntity).to.deep.equal({
                        applications: '*',
                        changelogDate: formatDateForLiquibase({ date: new Date(2020, 0, 1, 1, 0, 0), increment: 1 }),
                        dto: 'no',
                        embedded: false,
                        entityTableName: 'entity_a',
                        fields: [],
                        fluentMethods: true,
                        javadoc: 'The best entity',
                        jpaMetamodelFiltering: false,
                        name: 'A',
                        pagination: 'no',
                        readOnly: false,
                        relationships: [],
                        searchEngine: false,
                        service: 'no',
                    });
                });
            });
            context('with fields', () => {
                context('without validation, comment or option', () => {
                    let convertedEntity;

                    before(() => {
                        const jdlObject = new JDLObject();
                        const entityA = new JDLEntity({
                            name: 'A',
                            tableName: 'entity_a',
                            comment: 'The best entity',
                        });
                        const firstFieldForA = new JDLField({
                            name: 'firstField',
                            type: CommonDBTypes.STRING,
                        });
                        const secondFieldForA = new JDLField({
                            name: 'secondField',
                            type: CommonDBTypes.INTEGER,
                        });
                        entityA.addField(firstFieldForA);
                        entityA.addField(secondFieldForA);
                        jdlObject.addEntity(entityA);
                        const returnedMap = convert({
                            jdlObject,
                            applicationName: 'toto',
                            applicationType: MONOLITH,
                            creationTimestamp: new Date(2020, 0, 1, 1, 0, 0),
                            databaseType: SQL,
                        });
                        convertedEntity = returnedMap.get('toto')[0];
                    });

                    it('should convert them', () => {
                        expect(convertedEntity).to.deep.equal({
                            applications: '*',
                            changelogDate: formatDateForLiquibase({ date: new Date(2020, 0, 1, 1, 0, 0), increment: 1 }),
                            dto: 'no',
                            embedded: false,
                            entityTableName: 'entity_a',
                            fields: [
                                {
                                    fieldName: 'firstField',
                                    fieldType: 'String',
                                },
                                {
                                    fieldName: 'secondField',
                                    fieldType: 'Integer',
                                },
                            ],
                            fluentMethods: true,
                            javadoc: 'The best entity',
                            jpaMetamodelFiltering: false,
                            name: 'A',
                            pagination: 'no',
                            readOnly: false,
                            relationships: [],
                            service: 'no',
                        });
                    });
                });
                context('when having blobs', () => {
                    let convertedEntity;

                    before(() => {
                        const jdlObject = new JDLObject();
                        const entityA = new JDLEntity({
                            name: 'A',
                            tableName: 'entity_a',
                            comment: 'The best entity',
                        });
                        const anyBlobField = new JDLField({
                            name: 'anyBlobField',
                            type: CommonDBTypes.ANY_BLOB,
                        });
                        const textBlobField = new JDLField({
                            name: 'textBlobField',
                            type: CommonDBTypes.TEXT_BLOB,
                        });
                        const blobField = new JDLField({
                            name: 'blobField',
                            type: CommonDBTypes.BLOB,
                        });
                        const imageBlobField = new JDLField({
                            name: 'imageBlobField',
                            type: CommonDBTypes.IMAGE_BLOB,
                        });
                        entityA.addField(anyBlobField);
                        entityA.addField(textBlobField);
                        entityA.addField(blobField);
                        entityA.addField(imageBlobField);
                        jdlObject.addEntity(entityA);
                        const returnedMap = convert({
                            jdlObject,
                            applicationName: 'toto',
                            applicationType: MONOLITH,
                            creationTimestamp: new Date(2020, 0, 1, 1, 0, 0),
                            databaseType: SQL,
                        });
                        convertedEntity = returnedMap.get('toto')[0];
                    });

                    it('should convert them', () => {
                        expect(convertedEntity).to.deep.equal({
                            applications: '*',
                            changelogDate: formatDateForLiquibase({ date: new Date(2020, 0, 1, 1, 0, 0), increment: 1 }),
                            dto: 'no',
                            embedded: false,
                            entityTableName: 'entity_a',
                            fields: [
                                {
                                    fieldName: 'anyBlobField',
                                    fieldType: 'byte[]',
                                    fieldTypeBlobContent: 'any',
                                },
                                {
                                    fieldName: 'textBlobField',
                                    fieldType: 'byte[]',
                                    fieldTypeBlobContent: 'text',
                                },
                                {
                                    fieldName: 'blobField',
                                    fieldType: 'byte[]',
                                    fieldTypeBlobContent: 'any',
                                },
                                {
                                    fieldName: 'imageBlobField',
                                    fieldType: 'byte[]',
                                    fieldTypeBlobContent: 'image',
                                },
                            ],
                            fluentMethods: true,
                            javadoc: 'The best entity',
                            jpaMetamodelFiltering: false,
                            name: 'A',
                            pagination: 'no',
                            readOnly: false,
                            relationships: [],
                            service: 'no',
                        });
                    });
                });
                context('with field types being enums', () => {
                    let convertedEntity;

                    before(() => {
                        const jdlObject = new JDLObject();
                        const entityA = new JDLEntity({
                            name: 'A',
                            comment: 'The best entity',
                        });
                        const enumType = new JDLEnum({ name: 'CustomEnum', values: ['AA', 'AB'].map(value => ({ key: value })) });
                        const enumField = new JDLField({
                            name: 'enumField',
                            type: 'CustomEnum',
                        });
                        jdlObject.addEnum(enumType);
                        entityA.addField(enumField);
                        jdlObject.addEntity(entityA);
                        const returnedMap = convert({
                            jdlObject,
                            applicationName: 'toto',
                            applicationType: MONOLITH,
                            creationTimestamp: new Date(2020, 0, 1, 1, 0, 0),
                            databaseType: SQL,
                        });
                        convertedEntity = returnedMap.get('toto')[0];
                    });

                    it('should convert them', () => {
                        expect(convertedEntity).to.deep.equal({
                            applications: '*',
                            changelogDate: formatDateForLiquibase({ date: new Date(2020, 0, 1, 1, 0, 0), increment: 1 }),
                            dto: 'no',
                            embedded: false,
                            entityTableName: 'a',
                            fields: [
                                {
                                    fieldName: 'enumField',
                                    fieldType: 'CustomEnum',
                                    fieldValues: 'AA,AB',
                                },
                            ],
                            fluentMethods: true,
                            javadoc: 'The best entity',
                            jpaMetamodelFiltering: false,
                            name: 'A',
                            pagination: 'no',
                            readOnly: false,
                            relationships: [],
                            service: 'no',
                        });
                    });
                });
                context('with comments', () => {
                    let convertedEntity;

                    before(() => {
                        const jdlObject = new JDLObject();
                        const entityA = new JDLEntity({
                            name: 'A',
                            tableName: 'entity_a',
                            comment: 'The best entity',
                        });
                        const firstFieldForA = new JDLField({
                            name: 'firstField',
                            type: CommonDBTypes.STRING,
                            comment: 'The best field',
                        });
                        entityA.addField(firstFieldForA);
                        jdlObject.addEntity(entityA);
                        const returnedMap = convert({
                            jdlObject,
                            applicationName: 'toto',
                            applicationType: MONOLITH,
                            creationTimestamp: new Date(2020, 0, 1, 1, 0, 0),
                            databaseType: SQL,
                        });
                        convertedEntity = returnedMap.get('toto')[0];
                    });

                    it('should convert them', () => {
                        expect(convertedEntity).to.deep.equal({
                            applications: '*',
                            changelogDate: formatDateForLiquibase({ date: new Date(2020, 0, 1, 1, 0, 0), increment: 1 }),
                            dto: 'no',
                            embedded: false,
                            entityTableName: 'entity_a',
                            fields: [
                                {
                                    fieldName: 'firstField',
                                    fieldType: 'String',
                                    javadoc: 'The best field',
                                },
                            ],
                            fluentMethods: true,
                            javadoc: 'The best entity',
                            jpaMetamodelFiltering: false,
                            name: 'A',
                            pagination: 'no',
                            readOnly: false,
                            relationships: [],
                            service: 'no',
                        });
                    });
                });
                context('with validations', () => {
                    let convertedEntity;

                    before(() => {
                        const jdlObject = new JDLObject();
                        const entityA = new JDLEntity({
                            name: 'A',
                            tableName: 'entity_a',
                            comment: 'The best entity',
                        });
                        const stringField = new JDLField({
                            name: 'stringField',
                            type: CommonDBTypes.STRING,
                        });
                        const integerField = new JDLField({
                            name: 'integerField',
                            type: CommonDBTypes.INTEGER,
                        });
                        const blobField = new JDLField({
                            name: 'blobField',
                            type: CommonDBTypes.ANY_BLOB,
                        });
                        const requiredValidation = new JDLValidation({
                            name: Validations.REQUIRED,
                            value: true,
                        });
                        const uniqueValidation = new JDLValidation({
                            name: Validations.UNIQUE,
                            value: true,
                        });
                        const minValidation = new JDLValidation({
                            name: Validations.MIN,
                            value: 0,
                        });
                        const maxValidation = new JDLValidation({
                            name: Validations.MAX,
                            value: 10,
                        });
                        const minLengthValidation = new JDLValidation({
                            name: Validations.MINLENGTH,
                            value: 0,
                        });
                        const maxLengthValidation = new JDLValidation({
                            name: Validations.MAXLENGTH,
                            value: 10,
                        });
                        const patternValidation = new JDLValidation({
                            name: Validations.PATTERN,
                            // eslint-disable-next-line prettier/prettier,no-useless-escape
                            value: '^d$',
                        });
                        const minBytesValidation = new JDLValidation({
                            name: Validations.MINBYTES,
                            value: 0,
                        });
                        const maxBytesValidation = new JDLValidation({
                            name: Validations.MAXBYTES,
                            value: 10,
                        });
                        stringField.addValidation(requiredValidation);
                        stringField.addValidation(uniqueValidation);
                        stringField.addValidation(minLengthValidation);
                        stringField.addValidation(maxLengthValidation);
                        stringField.addValidation(patternValidation);
                        integerField.addValidation(minValidation);
                        integerField.addValidation(maxValidation);
                        blobField.addValidation(minBytesValidation);
                        blobField.addValidation(maxBytesValidation);
                        entityA.addField(stringField);
                        entityA.addField(integerField);
                        entityA.addField(blobField);
                        jdlObject.addEntity(entityA);
                        const returnedMap = convert({
                            jdlObject,
                            applicationName: 'toto',
                            applicationType: MONOLITH,
                            creationTimestamp: new Date(2020, 0, 1, 1, 0, 0),
                            databaseType: SQL,
                        });
                        convertedEntity = returnedMap.get('toto')[0];
                    });

                    it('should convert them', () => {
                        expect(convertedEntity).to.deep.equal({
                            applications: '*',
                            changelogDate: formatDateForLiquibase({ date: new Date(2020, 0, 1, 1, 0, 0), increment: 1 }),
                            dto: 'no',
                            embedded: false,
                            entityTableName: 'entity_a',
                            fields: [
                                {
                                    fieldName: 'stringField',
                                    fieldType: 'String',
                                    fieldValidateRules: ['required', 'unique', 'minlength', 'maxlength', 'pattern'],
                                    fieldValidateRulesMaxlength: 10,
                                    fieldValidateRulesMinlength: 0,
                                    fieldValidateRulesPattern: '^d$',
                                },
                                {
                                    fieldName: 'integerField',
                                    fieldType: 'Integer',
                                    fieldValidateRules: ['min', 'max'],
                                    fieldValidateRulesMax: 10,
                                    fieldValidateRulesMin: 0,
                                },
                                {
                                    fieldName: 'blobField',
                                    fieldType: 'byte[]',
                                    fieldTypeBlobContent: 'any',
                                    fieldValidateRules: ['minbytes', 'maxbytes'],
                                    fieldValidateRulesMaxbytes: 10,
                                    fieldValidateRulesMinbytes: 0,
                                },
                            ],
                            fluentMethods: true,
                            javadoc: 'The best entity',
                            jpaMetamodelFiltering: false,
                            name: 'A',
                            pagination: 'no',
                            readOnly: false,
                            relationships: [],
                            service: 'no',
                        });
                    });
                });
                context('with options', () => {
                    let convertedEntity;

                    before(() => {
                        const jdlObject = new JDLObject();
                        const entityA = new JDLEntity({
                            name: 'A',
                            tableName: 'entity_a',
                            comment: 'The best entity',
                        });
                        const firstFieldForA = new JDLField({
                            name: 'firstField',
                            type: CommonDBTypes.STRING,
                            comment: 'The best field',
                            options: {
                                id: 42,
                            },
                        });
                        entityA.addField(firstFieldForA);
                        jdlObject.addEntity(entityA);
                        const returnedMap = convert({
                            jdlObject,
                            applicationName: 'toto',
                            applicationType: MONOLITH,
                            creationTimestamp: new Date(2020, 0, 1, 1, 0, 0),
                            databaseType: SQL,
                        });
                        convertedEntity = returnedMap.get('toto')[0];
                    });

                    it('should convert them', () => {
                        expect(convertedEntity).to.deep.equal({
                            applications: '*',
                            changelogDate: formatDateForLiquibase({ date: new Date(2020, 0, 1, 1, 0, 0), increment: 1 }),
                            dto: 'no',
                            embedded: false,
                            entityTableName: 'entity_a',
                            fields: [
                                {
                                    fieldName: 'firstField',
                                    fieldType: 'String',
                                    javadoc: 'The best field',
                                    options: {
                                        id: 42,
                                    },
                                },
                            ],
                            fluentMethods: true,
                            javadoc: 'The best entity',
                            jpaMetamodelFiltering: false,
                            name: 'A',
                            pagination: 'no',
                            readOnly: false,
                            relationships: [],
                            service: 'no',
                        });
                    });
                });
            });
            context('with relationships', () => {
                context('without options, required relationships or comments', () => {
                    let relationshipsForA;
                    let relationshipsForB;

                    before(() => {
                        const jdlObject = new JDLObject();
                        const entityA = new JDLEntity({ name: 'A', comment: 'a' });
                        const entityB = new JDLEntity({ name: 'B', comment: 'b' });
                        const oneToOneRelationship = new JDLRelationship({
                            from: 'A',
                            to: 'B',
                            type: ONE_TO_ONE,
                            injectedFieldInTo: 'a',
                            injectedFieldInFrom: 'b',
                        });
                        const oneToManyRelationship = new JDLRelationship({
                            from: 'A',
                            to: 'B',
                            type: ONE_TO_MANY,
                            injectedFieldInTo: 'a',
                            injectedFieldInFrom: 'b',
                        });
                        const manyToOneRelationship = new JDLRelationship({
                            from: 'A',
                            to: 'B',
                            type: MANY_TO_ONE,
                            injectedFieldInTo: 'a',
                            injectedFieldInFrom: 'b',
                        });
                        const manyToManyRelationship = new JDLRelationship({
                            from: 'A',
                            to: 'B',
                            type: MANY_TO_MANY,
                            injectedFieldInTo: 'a',
                            injectedFieldInFrom: 'b',
                        });
                        jdlObject.addEntity(entityA);
                        jdlObject.addEntity(entityB);
                        jdlObject.addRelationship(oneToOneRelationship);
                        jdlObject.addRelationship(manyToManyRelationship);
                        jdlObject.addRelationship(oneToManyRelationship);
                        jdlObject.addRelationship(manyToOneRelationship);
                        const returned = convert({
                            jdlObject,
                            applicationName: 'toto',
                            applicationType: MONOLITH,
                            databaseType: SQL,
                            creationTimestamp: Date.now(),
                        });
                        relationshipsForA = returned.get('toto').find(entity => entity.name === 'A').relationships;
                        relationshipsForB = returned.get('toto').find(entity => entity.name === 'B').relationships;
                    });

                    it('should convert them', () => {
                        expect(relationshipsForA).to.deep.equal([
                            {
                                otherEntityField: 'id',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                ownerSide: true,
                                relationshipName: 'b',
                                relationshipType: 'one-to-one',
                            },
                            {
                                otherEntityField: 'id',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                relationshipName: 'b',
                                relationshipType: 'one-to-many',
                            },
                            {
                                otherEntityField: 'id',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                relationshipName: 'b',
                                relationshipType: 'many-to-one',
                            },
                            {
                                otherEntityField: 'id',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                ownerSide: true,
                                relationshipName: 'b',
                                relationshipType: 'many-to-many',
                            },
                        ]);
                        expect(relationshipsForB).to.deep.equal([
                            {
                                otherEntityField: 'id',
                                otherEntityName: 'a',
                                otherEntityRelationshipName: 'b',
                                ownerSide: false,
                                relationshipName: 'a',
                                relationshipType: 'one-to-one',
                            },
                            {
                                otherEntityField: 'id',
                                otherEntityName: 'a',
                                otherEntityRelationshipName: 'b',
                                relationshipName: 'a',
                                relationshipType: 'many-to-one',
                            },
                            {
                                otherEntityField: 'id',
                                otherEntityName: 'a',
                                otherEntityRelationshipName: 'b',
                                relationshipName: 'a',
                                relationshipType: 'one-to-many',
                            },
                            {
                                otherEntityField: 'id',
                                otherEntityName: 'a',
                                otherEntityRelationshipName: 'b',
                                ownerSide: false,
                                relationshipName: 'a',
                                relationshipType: 'many-to-many',
                            },
                        ]);
                    });
                });
                context('with options', () => {
                    context('being custom options', () => {
                        let convertedRelationship;

                        before(() => {
                            const jdlObject = new JDLObject();
                            const entityA = new JDLEntity({ name: 'A', comment: 'a' });
                            const entityB = new JDLEntity({ name: 'B', comment: 'b' });
                            const oneToOneRelationship = new JDLRelationship({
                                from: 'A',
                                to: 'B',
                                type: ONE_TO_ONE,
                                injectedFieldInTo: 'a',
                                injectedFieldInFrom: 'b',
                                options: {
                                    custom: 42,
                                },
                            });
                            jdlObject.addEntity(entityA);
                            jdlObject.addEntity(entityB);
                            jdlObject.addRelationship(oneToOneRelationship);
                            const returned = convert({
                                jdlObject,
                                applicationName: 'toto',
                                applicationType: MONOLITH,
                                databaseType: SQL,
                                creationTimestamp: Date.now(),
                            });
                            convertedRelationship = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
                        });

                        it('should convert them', () => {
                            expect(convertedRelationship).to.deep.equal({
                                options: {
                                    custom: 42,
                                },
                                otherEntityField: 'id',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                ownerSide: true,
                                relationshipName: 'b',
                                relationshipType: 'one-to-one',
                            });
                        });
                    });
                    context('being regular options', () => {
                        let convertedRelationship;

                        before(() => {
                            const jdlObject = new JDLObject();
                            const entityA = new JDLEntity({ name: 'A', comment: 'a' });
                            const entityB = new JDLEntity({ name: 'B', comment: 'b' });
                            const oneToOneRelationship = new JDLRelationship({
                                from: 'A',
                                to: 'B',
                                type: ONE_TO_ONE,
                                injectedFieldInTo: 'a',
                                injectedFieldInFrom: 'b',
                                options: {
                                    [JPA_DERIVED_IDENTIFIER]: true,
                                },
                            });
                            jdlObject.addEntity(entityA);
                            jdlObject.addEntity(entityB);
                            jdlObject.addRelationship(oneToOneRelationship);
                            const returned = convert({
                                jdlObject,
                                applicationName: 'toto',
                                applicationType: MONOLITH,
                                databaseType: SQL,
                                creationTimestamp: Date.now(),
                            });
                            convertedRelationship = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
                        });

                        it('should convert them', () => {
                            expect(convertedRelationship).to.deep.equal({
                                otherEntityField: 'id',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                ownerSide: true,
                                relationshipName: 'b',
                                relationshipType: 'one-to-one',
                                useJPADerivedIdentifier: true,
                            });
                        });
                    });
                });
                context('with required relationships', () => {
                    let relationshipsForA;
                    let relationshipsForB;

                    before(() => {
                        const jdlObject = new JDLObject();
                        const entityA = new JDLEntity({ name: 'A', comment: 'a' });
                        const entityB = new JDLEntity({ name: 'B', comment: 'b' });
                        const oneToOneRelationship = new JDLRelationship({
                            from: 'A',
                            to: 'B',
                            type: ONE_TO_ONE,
                            injectedFieldInTo: 'a',
                            injectedFieldInFrom: 'b',
                            isInjectedFieldInFromRequired: true,
                            isInjectedFieldInToRequired: true,
                        });
                        jdlObject.addEntity(entityA);
                        jdlObject.addEntity(entityB);
                        jdlObject.addRelationship(oneToOneRelationship);
                        const returned = convert({
                            jdlObject,
                            applicationName: 'toto',
                            applicationType: MONOLITH,
                            databaseType: SQL,
                            creationTimestamp: Date.now(),
                        });
                        relationshipsForA = returned.get('toto').find(entity => entity.name === 'A').relationships;
                        relationshipsForB = returned.get('toto').find(entity => entity.name === 'B').relationships;
                    });

                    it('should convert them', () => {
                        expect(relationshipsForA).to.deep.equal([
                            {
                                otherEntityField: 'id',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                ownerSide: true,
                                relationshipName: 'b',
                                relationshipType: 'one-to-one',
                                relationshipValidateRules: 'required',
                            },
                        ]);
                        expect(relationshipsForB).to.deep.equal([
                            {
                                otherEntityField: 'id',
                                otherEntityName: 'a',
                                otherEntityRelationshipName: 'b',
                                ownerSide: false,
                                relationshipName: 'a',
                                relationshipType: 'one-to-one',
                                relationshipValidateRules: 'required',
                            },
                        ]);
                    });
                });
                context('with comments', () => {
                    let relationshipsForA;
                    let relationshipsForB;

                    before(() => {
                        const jdlObject = new JDLObject();
                        const entityA = new JDLEntity({ name: 'A', comment: 'a' });
                        const entityB = new JDLEntity({ name: 'B', comment: 'b' });
                        const oneToOneRelationship = new JDLRelationship({
                            from: 'A',
                            to: 'B',
                            type: ONE_TO_ONE,
                            injectedFieldInTo: 'a',
                            injectedFieldInFrom: 'b',
                            commentInFrom: 'A to B',
                            commentInTo: 'A to B but in the destination',
                        });
                        jdlObject.addEntity(entityA);
                        jdlObject.addEntity(entityB);
                        jdlObject.addRelationship(oneToOneRelationship);
                        const returned = convert({
                            jdlObject,
                            applicationName: 'toto',
                            applicationType: MONOLITH,
                            databaseType: SQL,
                            creationTimestamp: Date.now(),
                        });
                        relationshipsForA = returned.get('toto').find(entity => entity.name === 'A').relationships;
                        relationshipsForB = returned.get('toto').find(entity => entity.name === 'B').relationships;
                    });

                    it('should convert them', () => {
                        expect(relationshipsForA).to.deep.equal([
                            {
                                javadoc: 'A to B',
                                otherEntityField: 'id',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                ownerSide: true,
                                relationshipName: 'b',
                                relationshipType: 'one-to-one',
                            },
                        ]);
                        expect(relationshipsForB).to.deep.equal([
                            {
                                otherEntityField: 'id',
                                javadoc: 'A to B but in the destination',
                                otherEntityName: 'a',
                                otherEntityRelationshipName: 'b',
                                ownerSide: false,
                                relationshipName: 'a',
                                relationshipType: 'one-to-one',
                            },
                        ]);
                    });
                });
                context("when the injected field in the destination side isn't present", () => {
                    context('for a One-to-One relationship', () => {
                        let relationshipFromSourceToDestination;
                        let relationshipFromDestinationToSource;

                        before(() => {
                            const jdlObject = new JDLObject();
                            const entityA = new JDLEntity({ name: 'A', comment: 'a' });
                            const entityB = new JDLEntity({ name: 'B', comment: 'b' });
                            const oneToOneRelationship = new JDLRelationship({
                                from: 'A',
                                to: 'B',
                                type: ONE_TO_ONE,
                                injectedFieldInFrom: 'b',
                            });
                            jdlObject.addEntity(entityA);
                            jdlObject.addEntity(entityB);
                            jdlObject.addRelationship(oneToOneRelationship);
                            const returned = convert({
                                jdlObject,
                                applicationName: 'toto',
                                applicationType: MONOLITH,
                                databaseType: SQL,
                                creationTimestamp: Date.now(),
                            });
                            relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
                            relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
                        });

                        it('should add the relationship for the source entity', () => {
                            expect(relationshipFromSourceToDestination).to.deep.equal({
                                otherEntityField: 'id',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                ownerSide: true,
                                relationshipName: 'b',
                                relationshipType: 'one-to-one',
                            });
                        });
                        it('should not add the relationship for the destination entity', () => {
                            expect(relationshipFromDestinationToSource).to.be.undefined;
                        });
                    });
                    context('for a One-to-Many relationship', () => {
                        let relationshipFromSourceToDestination;
                        let relationshipFromDestinationToSource;

                        before(() => {
                            const jdlObject = new JDLObject();
                            const entityA = new JDLEntity({ name: 'A', comment: 'a' });
                            const entityB = new JDLEntity({ name: 'B', comment: 'b' });
                            const oneToManyRelationship = new JDLRelationship({
                                from: 'A',
                                to: 'B',
                                type: ONE_TO_MANY,
                                injectedFieldInFrom: 'b',
                            });
                            jdlObject.addEntity(entityA);
                            jdlObject.addEntity(entityB);
                            jdlObject.addRelationship(oneToManyRelationship);
                            const returned = convert({
                                jdlObject,
                                applicationName: 'toto',
                                applicationType: MONOLITH,
                                databaseType: SQL,
                                creationTimestamp: Date.now(),
                            });
                            relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
                            relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
                        });

                        it('should add the relationship for the source entity', () => {
                            expect(relationshipFromSourceToDestination).to.deep.equal({
                                otherEntityField: 'id',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                relationshipName: 'b',
                                relationshipType: 'one-to-many',
                            });
                        });
                        it('should add the relationship for the destination entity', () => {
                            expect(relationshipFromDestinationToSource).to.deep.equal({
                                otherEntityField: 'id',
                                otherEntityName: 'a',
                                otherEntityRelationshipName: 'b',
                                relationshipName: 'a',
                                relationshipType: 'many-to-one',
                            });
                        });
                    });
                    context('for a Many-to-One relationship', () => {
                        let relationshipFromSourceToDestination;
                        let relationshipFromDestinationToSource;

                        before(() => {
                            const jdlObject = new JDLObject();
                            const entityA = new JDLEntity({ name: 'A', comment: 'a' });
                            const entityB = new JDLEntity({ name: 'B', comment: 'b' });
                            const manyToOneRelationship = new JDLRelationship({
                                from: 'A',
                                to: 'B',
                                type: MANY_TO_ONE,
                                injectedFieldInFrom: 'b',
                            });
                            jdlObject.addEntity(entityA);
                            jdlObject.addEntity(entityB);
                            jdlObject.addRelationship(manyToOneRelationship);
                            const returned = convert({
                                jdlObject,
                                applicationName: 'toto',
                                applicationType: MONOLITH,
                                databaseType: SQL,
                                creationTimestamp: Date.now(),
                            });
                            relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
                            relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
                        });

                        it('should add the relationship for the source entity', () => {
                            expect(relationshipFromSourceToDestination).to.deep.equal({
                                otherEntityField: 'id',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                relationshipName: 'b',
                                relationshipType: 'many-to-one',
                            });
                        });
                        it('should not add the relationship for the destination entity', () => {
                            expect(relationshipFromDestinationToSource).to.be.undefined;
                        });
                    });
                    context('for a Many-to-Many relationship', () => {
                        let relationshipFromSourceToDestination;
                        let relationshipFromDestinationToSource;

                        before(() => {
                            const jdlObject = new JDLObject();
                            const entityA = new JDLEntity({ name: 'A', comment: 'a' });
                            const entityB = new JDLEntity({ name: 'B', comment: 'b' });
                            const manyToManyRelationship = new JDLRelationship({
                                from: 'A',
                                to: 'B',
                                type: MANY_TO_MANY,
                                injectedFieldInFrom: 'b',
                            });
                            jdlObject.addEntity(entityA);
                            jdlObject.addEntity(entityB);
                            jdlObject.addRelationship(manyToManyRelationship);
                            const returned = convert({
                                jdlObject,
                                applicationName: 'toto',
                                applicationType: MONOLITH,
                                databaseType: SQL,
                                creationTimestamp: Date.now(),
                            });
                            relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
                            relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
                        });

                        it('should add the relationship for the source entity', () => {
                            expect(relationshipFromSourceToDestination).to.deep.equal({
                                otherEntityField: 'id',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                ownerSide: true,
                                relationshipName: 'b',
                                relationshipType: 'many-to-many',
                            });
                        });
                        it('should add the relationship for the destination entity', () => {
                            expect(relationshipFromDestinationToSource).to.deep.equal({
                                otherEntityField: 'id',
                                otherEntityName: 'a',
                                otherEntityRelationshipName: 'b',
                                ownerSide: false,
                                relationshipName: 'a',
                                relationshipType: 'many-to-many',
                            });
                        });
                    });
                });
                context('when setting custom field for relationship mapping', () => {
                    context('for a One-to-One relationship', () => {
                        let relationshipFromSourceToDestination;
                        let relationshipFromDestinationToSource;

                        before(() => {
                            const jdlObject = new JDLObject();
                            const entityA = new JDLEntity({ name: 'A', comment: 'a' });
                            const entityB = new JDLEntity({ name: 'B', comment: 'b' });
                            const oneToOneRelationship = new JDLRelationship({
                                from: 'A',
                                to: 'B',
                                type: ONE_TO_ONE,
                                injectedFieldInFrom: 'b(name)',
                                injectedFieldInTo: 'a(name)',
                            });
                            jdlObject.addEntity(entityA);
                            jdlObject.addEntity(entityB);
                            jdlObject.addRelationship(oneToOneRelationship);
                            const returned = convert({
                                jdlObject,
                                applicationName: 'toto',
                                applicationType: MONOLITH,
                                databaseType: SQL,
                                creationTimestamp: Date.now(),
                            });
                            relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
                            relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
                        });

                        it('should add it for the source entity', () => {
                            expect(relationshipFromSourceToDestination).to.deep.equal({
                                otherEntityField: 'name',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                ownerSide: true,
                                relationshipName: 'b',
                                relationshipType: 'one-to-one',
                            });
                        });
                        it('should ignore it for the destination entity', () => {
                            expect(relationshipFromDestinationToSource).to.deep.equal({
                                otherEntityField: 'name',
                                otherEntityName: 'a',
                                otherEntityRelationshipName: 'b',
                                ownerSide: false,
                                relationshipName: 'a',
                                relationshipType: 'one-to-one',
                            });
                        });
                    });
                    context('for a One-to-Many relationship', () => {
                        let relationshipFromSourceToDestination;
                        let relationshipFromDestinationToSource;

                        before(() => {
                            const jdlObject = new JDLObject();
                            const entityA = new JDLEntity({ name: 'A', comment: 'a' });
                            const entityB = new JDLEntity({ name: 'B', comment: 'b' });
                            const oneToManyRelationship = new JDLRelationship({
                                from: 'A',
                                to: 'B',
                                type: ONE_TO_MANY,
                                injectedFieldInFrom: 'b(name)',
                                injectedFieldInTo: 'a(name)',
                            });
                            jdlObject.addEntity(entityA);
                            jdlObject.addEntity(entityB);
                            jdlObject.addRelationship(oneToManyRelationship);
                            const returned = convert({
                                jdlObject,
                                applicationName: 'toto',
                                applicationType: MONOLITH,
                                databaseType: SQL,
                                creationTimestamp: Date.now(),
                            });
                            relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
                            relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
                        });

                        it('should ignore it for the source entity', () => {
                            expect(relationshipFromSourceToDestination).to.deep.equal({
                                otherEntityField: 'name',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                relationshipName: 'b',
                                relationshipType: 'one-to-many',
                            });
                        });
                        it('should add it for the destination entity', () => {
                            expect(relationshipFromDestinationToSource).to.deep.equal({
                                otherEntityField: 'name',
                                otherEntityName: 'a',
                                otherEntityRelationshipName: 'b',
                                relationshipName: 'a',
                                relationshipType: 'many-to-one',
                            });
                        });
                    });
                    context('for a Many-to-One relationship', () => {
                        let relationshipFromSourceToDestination;
                        let relationshipFromDestinationToSource;

                        before(() => {
                            const jdlObject = new JDLObject();
                            const entityA = new JDLEntity({ name: 'A', comment: 'a' });
                            const entityB = new JDLEntity({ name: 'B', comment: 'b' });
                            const manyToOneRelationship = new JDLRelationship({
                                from: 'A',
                                to: 'B',
                                type: MANY_TO_ONE,
                                injectedFieldInFrom: 'b(name)',
                                injectedFieldInTo: 'a(name)',
                            });
                            jdlObject.addEntity(entityA);
                            jdlObject.addEntity(entityB);
                            jdlObject.addRelationship(manyToOneRelationship);
                            const returned = convert({
                                jdlObject,
                                applicationName: 'toto',
                                applicationType: MONOLITH,
                                databaseType: SQL,
                                creationTimestamp: Date.now(),
                            });
                            relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
                            relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
                        });

                        it('should add it for the source entity', () => {
                            expect(relationshipFromSourceToDestination).to.deep.equal({
                                otherEntityField: 'name',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                relationshipName: 'b',
                                relationshipType: 'many-to-one',
                            });
                        });
                        it('should ignore it for the source entity', () => {
                            expect(relationshipFromDestinationToSource).to.deep.equal({
                                otherEntityField: 'name',
                                otherEntityName: 'a',
                                otherEntityRelationshipName: 'b',
                                relationshipName: 'a',
                                relationshipType: 'one-to-many',
                            });
                        });
                    });
                    context('for a Many-to-Many relationship', () => {
                        let relationshipFromSourceToDestination;
                        let relationshipFromDestinationToSource;

                        before(() => {
                            const jdlObject = new JDLObject();
                            const entityA = new JDLEntity({ name: 'A', comment: 'a' });
                            const entityB = new JDLEntity({ name: 'B', comment: 'b' });
                            const manyToManyRelationship = new JDLRelationship({
                                from: 'A',
                                to: 'B',
                                type: MANY_TO_MANY,
                                injectedFieldInFrom: 'b(name)',
                                injectedFieldInTo: 'a(name)',
                            });
                            jdlObject.addEntity(entityA);
                            jdlObject.addEntity(entityB);
                            jdlObject.addRelationship(manyToManyRelationship);
                            const returned = convert({
                                jdlObject,
                                applicationName: 'toto',
                                applicationType: MONOLITH,
                                databaseType: SQL,
                                creationTimestamp: Date.now(),
                            });
                            relationshipFromSourceToDestination = returned.get('toto').find(entity => entity.name === 'A').relationships[0];
                            relationshipFromDestinationToSource = returned.get('toto').find(entity => entity.name === 'B').relationships[0];
                        });

                        it('should add it for the source entity', () => {
                            expect(relationshipFromSourceToDestination).to.deep.equal({
                                otherEntityField: 'name',
                                otherEntityName: 'b',
                                otherEntityRelationshipName: 'a',
                                ownerSide: true,
                                relationshipName: 'b',
                                relationshipType: 'many-to-many',
                            });
                        });
                        it('should add it for the destination entity', () => {
                            expect(relationshipFromDestinationToSource).to.deep.equal({
                                otherEntityField: 'name',
                                otherEntityName: 'a',
                                otherEntityRelationshipName: 'b',
                                ownerSide: false,
                                relationshipName: 'a',
                                relationshipType: 'many-to-many',
                            });
                        });
                    });
                });
            });
        });
    });
});
