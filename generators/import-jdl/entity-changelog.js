/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
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

const jsonpatch = require('fast-json-patch');
const _ = require('lodash');

module.exports = { diff, isEnumType, isEnum, patchToChangesetData };

function diff(before, after) {
    return jsonpatch.compare(before, after);
}

/**
 * Return true if specified JDL field type is an enum, false otherwise
 *
 * @param {String} fieldType - JDL type name
 * @returns {Boolean} - true if fieldType is an enum, false otherwise
 */
function isEnumType(fieldType) {
    const nonEnumTypes = [
        'String', 'Integer', 'Long', 'Float', 'Double', 'BigDecimal',
        'LocalDate', 'Instant', 'ZonedDateTime', 'Boolean', 'byte[]',
        'ByteBuffer'
    ];
    return !_.includes(nonEnumTypes, fieldType);
}

/**
 * Return true if specified JDL field type is an enum in given DB
 *
 * @param {String} fieldType - JDL type name
 * @param {String} databaseType - database type (sql, mongodb, cassandra)
 * @returns {Boolean}
 */
function isEnum(fieldType, databaseType) {
    return (databaseType === 'sql' || databaseType === 'mongodb')
        && isEnumType(fieldType);
}

/**
 * Turn a JSON patch (http://jsonpatch.com/) into liquibase changeset data
 * (i.e. object containing data needed to render a liquibase changelog xml)
 *
 * @param {Object} ctx - context object containing entity definitions before
 * and after the change, and the diff
 */
function patchToChangesetData(ctx) {
    const lqChangeset = [];

    // placeholders for column add/remove changes, so we can group all
    // columns into one change
    let addColumnChange;
    let removeColumnChange;

    ctx.diff.forEach((operation) => {
        const path = operation.path.split('/');

        if (path.length > 3) {
            throw new Error(`unable to handle operations on individual properties yet (${path})`);
        }

        let lqChange;

        switch (path[1]) {
        case 'entityTableName':
            if (operation.op !== 'replace') {
                throw new Error(`unable to handle op ${operation.op} on ${path[1]}`);
            }
            lqChange = {
                change: 'renameTable',
                newTableName: operation.value,
                oldTableName: ctx.before.entityTableName
            };
            break;
        case 'fields':
            if (operation.op === 'add') {
                if (typeof addColumnChange === 'undefined') {
                    addColumnChange = {
                        change: 'addColumn',
                        tableName: ctx.after.entityTableName,
                        columns: []
                    };
                }
                addColumnChange.columns.push({
                    name: operation.value.fieldName,
                    type: operation.value.fieldType
                });
            } else {
                throw new Error(`unknown operation ${operation.op} on ${operation.path}`);
            }
            break;
        default:
            throw new Error(`unable to handle change on ${operation.path} (${path[1]})`);
        }

        if (lqChange) {
            lqChangeset.push(lqChange);
        }
    });

    if (addColumnChange) {
        lqChangeset.push(addColumnChange);
    }
    if (removeColumnChange) {
        lqChangeset.push(removeColumnChange);
    }

    return lqChangeset;
}
