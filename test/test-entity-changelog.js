/* global describe, it*/

const assert = require('assert');
const entityChangelog = require('../generators/import-jdl/entity-changelog');

describe.only('JHipster entity changelogs', () => {
    describe('isEnumType', () => {
        const tests = [
            { fieldType: 'String', expected: false },
            { fieldType: 'Long', expected: false },
            { fieldType: 'CustomType', expected: true },
            { fieldType: 'AnotherEnum', expected: true }
        ];

        tests.forEach((test) => {
            it(`returns that ${test.fieldType} is${test.expected ? '' : ' not'} an enum`, () => {
                assert.equal(
                    entityChangelog.isEnumType(test.fieldType), test.expected);
            });
        });
    });

    describe('isEnum', () => {
        const tests = [
            { fieldType: 'SomeEnum', databaseType: 'sql', expected: true },
            { fieldType: 'SomeEnum', databaseType: 'mongodb', expected: true },
            { fieldType: 'SomeEnum', databaseType: 'cassandra', expected: false }
        ];

        tests.forEach((test) => {
            it(`returns that ${test.fieldType} is${test.expected ? '' : ' not'} an enum in ${test.databaseType} DB`, () => {
                assert.equal(
                    entityChangelog.isEnum(test.fieldType, test.databaseType),
                    test.expected);
            });
        });
    });

    describe('jdlTypeToDbType', () => {
        const tests = [
            {
                field: {
                    fieldName: 'someName',
                    fieldType: 'String'
                },
                databaseType: 'sql',
                expected: 'varchar(255)'
            },
            {
                field: {
                    fieldName: 'someLimitedString',
                    fieldType: 'String',
                    fieldValidateRules: ['maxlength'],
                    fieldValidateRulesMaxlength: 20
                },
                databaseType: 'sql',
                expected: 'varchar(20)'
            },
            {
                field: {
                    fieldName: 'someNo',
                    fieldType: 'Integer'
                },
                databaseType: 'sql',
                expected: 'integer'
            },
            {
                field: {
                    fieldName: 'someLong',
                    fieldType: 'Long'
                },
                databaseType: 'sql',
                expected: 'bigint'
            },
            {
                field: {
                    fieldName: 'someFloat',
                    fieldType: 'Float'
                },
                expected: '${floatType}' // eslint-disable-line no-template-curly-in-string
            },
            {
                field: {
                    fieldName: 'someDouble',
                    fieldType: 'Double'
                },
                databaseType: 'sql',
                expected: 'double'
            },
            {
                field: {
                    fieldName: 'someBigDecimal',
                    fieldType: 'BigDecimal'
                },
                databaseType: 'sql',
                expected: 'decimal(10,2)'
            },
            {
                field: {
                    fieldName: 'someDate',
                    fieldType: 'LocalDate'
                },
                databaseType: 'sql',
                expected: 'date'
            },
            {
                field: {
                    fieldName: 'someInstant',
                    fieldType: 'Instant'
                },
                databaseType: 'sql',
                expected: 'timestamp'
            },
            {
                field: {
                    fieldName: 'someZonedDateTime',
                    fieldType: 'ZonedDateTime'
                },
                databaseType: 'sql',
                expected: 'timestamp'
            },
            {
                field: {
                    fieldName: 'someByteArray',
                    fieldType: 'byte[]',
                    fieldTypeBlobContent: 'any'
                },
                databaseType: 'postgresql',
                expected: 'longblob'
            },
            {
                field: {
                    fieldName: 'someByteArray',
                    fieldType: 'byte[]',
                    fieldTypeBlobContent: 'any'
                },
                databaseType: 'mysql',
                expected: 'longblob'
            },
            {
                field: {
                    fieldName: 'someByteArray',
                    fieldType: 'byte[]',
                    fieldTypeBlobContent: 'any'
                },
                databaseType: 'sql',
                expected: 'blob'
            },
            {
                field: {
                    fieldName: 'someByteArray',
                    fieldType: 'byte[]',
                    fieldTypeBlobContent: 'text'
                },
                databaseType: 'sql',
                expected: 'clob'
            },
            {
                field: {
                    fieldName: 'someBoolean',
                    fieldType: 'Boolean'
                },
                databaseType: 'postgresql',
                expected: 'boolean'
            },
            {
                field: {
                    fieldName: 'someBoolean',
                    fieldType: 'Boolean'
                },
                databaseType: 'sql',
                expected: 'bit'
            },
        ];

        tests.forEach((test) => {
            it(`converts ${test.field.fieldType} to ${test.expected} type correctly`, () => {
                assert.equal(
                    entityChangelog.jdlTypeToDbType(
                        test.field, test.databaseType),
                    test.expected);
            });
        });
    });

    describe('isNullable', () => {
        const tests = [
            {
                field: { fieldName: 'foo' },
                expected: true
            },
            {
                field: { fieldName: 'bar', fieldValidateRules: ['required'] },
                expected: false
            },
            {
                field: { fieldName: 'baz', fieldValidateRules: ['max'] },
                expected: true
            }
        ];

        tests.forEach((test) => {
            it(`detects${test.expected ? '' : ' not'} nullable fields`, () => {
                assert.equal(
                    entityChangelog.isNullable(test.field), test.expected);
            });
        });
    });

    describe('patchToChangesetData', () => {
        it('produces a rename change/refactoring given a table name change', () => {
            const entityBefore = { entityTableName: 'table_name' };
            const entityAfter = { entityTableName: 'table_name_change_test' };
            const diff = [{
                op: 'replace',
                path: '/entityTableName',
                value: 'table_name_change_test'
            }];
            const ctx = { before: entityBefore, after: entityAfter, diff };

            const changeset = entityChangelog.patchToChangesetData(ctx);
            assert.deepEqual(changeset, [{
                change: 'renameTable',
                newTableName: 'table_name_change_test',
                oldTableName: 'table_name'
            }]);
        });

        it('produces an add column change given field additions', () => {
            const ctx = {
                before: {
                    fields: [{ fieldName: 'foo', fieldType: 'Integer' }]
                },
                after: {
                    fields: [
                        { fieldName: 'foo', fieldType: 'Integer' },
                        { fieldName: 'bar', fieldType: 'String' },
                        { fieldName: 'baz', fieldType: 'Instant' },
                        {
                            fieldName: 'qux',
                            fieldType: 'BigDecimal',
                            fieldValidateRules: ['required']
                        }
                    ],
                    entityTableName: 'table_name'
                },
                diff: [
                    {
                        op: 'add',
                        path: '/fields/1',
                        value: { fieldName: 'bar', fieldType: 'String' }
                    },
                    {
                        op: 'add',
                        path: '/fields/2',
                        value: { fieldName: 'baz', fieldType: 'Instant' }
                    },
                    {
                        op: 'add',
                        path: '/fields/3',
                        value: {
                            fieldName: 'qux',
                            fieldType: 'BigDecimal',
                            fieldValidateRules: ['required']
                        }
                    }
                ]
            };

            const dbType = 'sql';
            const changeset = entityChangelog.patchToChangesetData(ctx, dbType);
            assert.deepEqual(changeset, [{
                change: 'addColumn',
                tableName: 'table_name',
                columns: [
                    { name: 'bar', type: 'varchar(255)', nullable: true },
                    { name: 'baz', type: 'timestamp', nullable: true },
                    { name: 'qux', type: 'decimal(10,2)', nullable: false }
                ]
            }]);
        });

        it('produces additional content-type column for blobs', () => {
            const ctx = {
                before: { fields: [] },
                after: {
                    fields: [
                        {
                            fieldName: 'foo',
                            fieldType: 'byte[]',
                            fieldTypeBlobContent: 'any'
                        }
                    ],
                    entityTableName: 'table_name'
                },
                diff: [
                    {
                        op: 'add',
                        path: '/fields/0',
                        value: {
                            fieldName: 'foo',
                            fieldType: 'byte[]',
                            fieldTypeBlobContent: 'any'
                        }
                    }
                ]
            };

            const changeset = entityChangelog.patchToChangesetData(ctx, 'sql');
            assert.deepEqual(changeset, [{
                change: 'addColumn',
                tableName: 'table_name',
                columns: [
                    { name: 'foo', type: 'blob', nullable: true },
                    { name: 'foo_content_type', type: 'varchar(255)', nullable: true }
                ]
            }]);
        });
    });
});
