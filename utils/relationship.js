/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
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

const _ = require('lodash');
const pluralize = require('pluralize');
const { isReservedTableName } = require('../jdl/jhipster/reserved-keywords');
const { stringify } = require('.');

function prepareRelationshipForTemplates(entityWithConfig, relationship, generator) {
    const entityName = entityWithConfig.name;
    const relationshipOptions = relationship.options || {};
    const otherEntityName = relationship.otherEntityName;
    const otherEntityData = generator.getEntityConfig(otherEntityName).getAll();
    const jhiTablePrefix = entityWithConfig.jhiTablePrefix || generator.getTableName(entityWithConfig.jhiPrefix);

    relationship.otherEntityIsEmbedded = otherEntityData.embedded;
    if (otherEntityData.microserviceName && !otherEntityData.clientRootFolder) {
        otherEntityData.clientRootFolder = otherEntityData.microserviceName;
    }

    relationship.otherEntityPrimaryKeyType =
        generator.isBuiltInUserEntity(otherEntityName) && entityWithConfig.authenticationType === 'oauth2'
            ? 'String'
            : generator.getPkType(entityWithConfig.databaseType);

    // Look for fields at the other other side of the relationship
    if (otherEntityData.relationships) {
        let otherRelationship;
        if (relationship.relationshipType === 'many-to-one' || !relationship.ownerSide) {
            otherRelationship = otherEntityData.relationships.find(otherSideRelationship => {
                if (_.upperFirst(otherSideRelationship.otherEntityName) !== entityName) {
                    return false;
                }
                if (!otherSideRelationship.otherEntityRelationshipName) {
                    return false;
                }
                return otherSideRelationship.otherEntityRelationshipName === relationship.relationshipName;
            });
        } else {
            otherRelationship = otherEntityData.relationships.find(otherSideRelationship => {
                if (_.upperFirst(otherSideRelationship.otherEntityName) !== entityName) {
                    return false;
                }
                if (!relationship.otherEntityRelationshipName) {
                    return false;
                }
                return relationship.otherEntityRelationshipName === otherSideRelationship.relationshipName;
            });
        }
        if (otherRelationship) {
            if (
                relationship.otherEntityRelationshipName &&
                relationship.otherEntityRelationshipName !== otherRelationship.relationshipName
            ) {
                throw new Error(`Relationship name is not synchronized ${stringify(relationship)} with ${stringify(otherRelationship)}`);
            }
            if (
                !(relationship.relationshipType === 'one-to-one' && otherRelationship.relationshipType === 'one-to-one') &&
                !(relationship.relationshipType === 'many-to-one' && otherRelationship.relationshipType === 'one-to-many') &&
                !(relationship.relationshipType === 'one-to-many' && otherRelationship.relationshipType === 'many-to-one') &&
                !(relationship.relationshipType === 'many-to-many' && otherRelationship.relationshipType === 'many-to-many')
            ) {
                throw new Error(`Relationship type is not synchronized ${stringify(relationship)} with ${stringify(otherRelationship)}`);
            }
            _.defaults(relationship, {
                otherEntityRelationshipName: otherRelationship.relationshipName,
                otherEntityRelationshipNamePlural: otherRelationship.relationshipNamePlural,
                otherEntityRelationshipNameCapitalized: otherRelationship.relationshipNameCapitalized,
                otherEntityRelationshipNameCapitalizedPlural: relationship.relationshipNameCapitalizedPlural,
            });
        } else {
            generator.warning(`Could not find the other side of the relationship ${stringify(relationship)}`);
        }
    }

    if (relationship.otherEntityRelationshipName !== undefined) {
        _.defaults(relationship, {
            otherEntityRelationshipNamePlural: pluralize(relationship.otherEntityRelationshipName),
            otherEntityRelationshipNameCapitalized: _.upperFirst(relationship.otherEntityRelationshipName),
        });
        _.defaults(relationship, {
            otherEntityRelationshipNameCapitalizedPlural: pluralize(relationship.otherEntityRelationshipNameCapitalized),
        });
    }

    const relationshipName = relationship.relationshipName;
    _.defaults(relationship, {
        relationshipNamePlural: pluralize(relationshipName),
        relationshipFieldName: _.lowerFirst(relationshipName),
        relationshipNameCapitalized: _.upperFirst(relationshipName),
        relationshipNameHumanized: relationshipOptions.relationshipNameHumanized || _.startCase(relationshipName),
        columnName: generator.getColumnName(relationshipName),
        otherEntityNamePlural: pluralize(otherEntityName),
        otherEntityNameCapitalized: _.upperFirst(otherEntityName),
        otherEntityFieldCapitalized: _.upperFirst(relationship.otherEntityField),
        otherEntityTableName:
            otherEntityData.entityTableName ||
            generator.getTableName(
                generator.isBuiltInUserEntity(otherEntityName) ? `${jhiTablePrefix}_${otherEntityName}` : otherEntityName
            ),
    });

    _.defaults(relationship, {
        relationshipFieldNamePlural: pluralize(relationship.relationshipFieldName),
        relationshipNameCapitalizedPlural:
            relationship.relationshipName.length > 1
                ? pluralize(relationship.relationshipNameCapitalized)
                : _.upperFirst(pluralize(relationship.relationshipName)),
        otherEntityNameCapitalizedPlural: pluralize(relationship.otherEntityNameCapitalized),
    });

    if (entityWithConfig.dto === 'mapstruct') {
        if (otherEntityData.dto !== 'mapstruct' && !generator.isBuiltInUserEntity(otherEntityName)) {
            generator.warning(
                `This entity has the DTO option, and it has a relationship with entity "${otherEntityName}" that doesn't have the DTO option. This will result in an error.`
            );
        }
    }

    if (isReservedTableName(relationship.otherEntityTableName, entityWithConfig.prodDatabaseType) && jhiTablePrefix) {
        const otherEntityTableName = relationship.otherEntityTableName;
        relationship.otherEntityTableName = `${jhiTablePrefix}_${otherEntityTableName}`;
    }

    if (relationship.otherEntityAngularName === undefined) {
        if (generator.isBuiltInUserEntity(otherEntityName)) {
            relationship.otherEntityAngularName = 'User';
        } else {
            const otherEntityAngularSuffix = otherEntityData ? otherEntityData.angularJSSuffix || '' : '';
            relationship.otherEntityAngularName =
                _.upperFirst(relationship.otherEntityName) + generator.upperFirstCamelCase(otherEntityAngularSuffix);
        }
    }

    _.defaults(relationship, {
        otherEntityStateName: _.kebabCase(relationship.otherEntityAngularName),
        jpaMetamodelFiltering: otherEntityData.jpaMetamodelFiltering,
    });

    if (!generator.isBuiltInUserEntity(otherEntityName)) {
        _.defaults(relationship, {
            otherEntityFileName: _.kebabCase(relationship.otherEntityAngularName),
            otherEntityFolderName: _.kebabCase(relationship.otherEntityAngularName),
        });

        if (entityWithConfig.skipUiGrouping || otherEntityData.clientRootFolder === '' || otherEntityData.clientRootFolder === undefined) {
            relationship.otherEntityClientRootFolder = '';
        } else {
            relationship.otherEntityClientRootFolder = `${otherEntityData.clientRootFolder}/`;
        }
        if (otherEntityData.clientRootFolder) {
            if (entityWithConfig.clientRootFolder === otherEntityData.clientRootFolder) {
                relationship.otherEntityModulePath = relationship.otherEntityFolderName;
            } else {
                relationship.otherEntityModulePath = `${
                    entityWithConfig.entityParentPathAddition ? `${entityWithConfig.entityParentPathAddition}/` : ''
                }${otherEntityData.clientRootFolder}/${relationship.otherEntityFolderName}`;
            }
            relationship.otherEntityModelName = `${otherEntityData.clientRootFolder}/${relationship.otherEntityFileName}`;
            relationship.otherEntityPath = `${otherEntityData.clientRootFolder}/${relationship.otherEntityFolderName}`;
        } else {
            relationship.otherEntityModulePath = `${
                entityWithConfig.entityParentPathAddition ? `${entityWithConfig.entityParentPathAddition}/` : ''
            }${relationship.otherEntityFolderName}`;
            relationship.otherEntityModelName = relationship.otherEntityFileName;
            relationship.otherEntityPath = relationship.otherEntityFolderName;
        }
    }

    // Load in-memory data for root
    if (relationship.relationshipType === 'many-to-many' && relationship.ownerSide) {
        entityWithConfig.fieldsContainOwnerManyToMany = true;
    } else if (relationship.relationshipType === 'one-to-one' && !relationship.ownerSide) {
        entityWithConfig.fieldsContainNoOwnerOneToOne = true;
    } else if (relationship.relationshipType === 'one-to-one' && relationship.ownerSide) {
        entityWithConfig.fieldsContainOwnerOneToOne = true;
    } else if (relationship.relationshipType === 'one-to-many') {
        entityWithConfig.fieldsContainOneToMany = true;
    } else if (relationship.relationshipType === 'many-to-one') {
        entityWithConfig.fieldsContainManyToOne = true;
    }
    if (relationship.otherEntityIsEmbedded) {
        entityWithConfig.fieldsContainEmbedded = true;
    }

    if (relationship.relationshipValidateRules && relationship.relationshipValidateRules.includes('required')) {
        if (entityName.toLowerCase() === relationship.otherEntityName.toLowerCase()) {
            generator.warning('Required relationships to the same entity are not supported.');
        } else {
            relationship.relationshipValidate = relationship.relationshipRequired = entityWithConfig.validation = true;
        }
    }
    relationship.nullable = !(relationship.relationshipValidate === true && relationship.relationshipRequired);

    const entityType = relationship.otherEntityNameCapitalized;
    if (!entityWithConfig.differentTypes.includes(entityType)) {
        entityWithConfig.differentTypes.push(entityType);
    }
    if (!entityWithConfig.differentRelationships[entityType]) {
        entityWithConfig.differentRelationships[entityType] = [];
    }
    entityWithConfig.differentRelationships[entityType].push(relationship);
    return relationship;
}

module.exports = { prepareRelationshipForTemplates };
