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
/* eslint-disable consistent-return */
const constants = require('../generator-constants');
const writeFiles = require('./files').writeFiles;
const utils = require('../utils');
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { isReservedTableName } = require('../../jdl/jhipster/reserved-keywords');

/* constants used throughout */
let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        // Context is the entity for entity-* generators
        this.entity = opts.context;
        utils.copyObjectProps(this, this.entity);
        this.jhipsterContext = opts.jhipsterContext || opts.context;

        this.testsNeedCsrf = ['uaa', 'oauth2', 'session'].includes(this.jhipsterContext.authenticationType);
        this.officialDatabaseType = constants.OFFICIAL_DATABASE_TYPE_NAMES[this.jhipsterContext.databaseType];

        useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('entity-server', { context: opts.context });
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            setupConstants() {
                // Make constants available in templates
                this.LIQUIBASE_DTD_VERSION = constants.LIQUIBASE_DTD_VERSION;
            },
        };
    }

    get initializing() {
        if (useBlueprints) return;
        return this._initializing();
    }

    _preparing() {
        return {
            /**
             * Generate paths to files and resources.
             */
            generatePaths() {
                if (this.domainName) {
                    this.warning('Domain support is experimental and subject to change, use at your own risk');
                } else {
                    this.domainName = undefined;
                }

                this.domainPackage = this.domainName ? `${this.packageName}.${this.domainName}` : this.packageName;
                const domainRelativeModelPackage =
                    this.configOptions.domainRelativeModelPackage || this.domainName ? 'domain.model' : 'domain';
                const domainRelativeRepositoryPackage =
                    this.configOptions.domainRelativeRepositoryPackage || this.domainName ? 'adapter.repository' : 'repository';
                const domainRelativeWebPackage =
                    this.configOptions.domainRelativeWebPackage || this.domainName ? 'adapter.web' : 'web.rest';
                const domainRelativeServicePackage =
                    this.configOptions.domainRelativeServicePackage || this.domainName ? 'domain.service' : 'service';

                this.domainModelPackageName = `${this.domainPackage}.${domainRelativeModelPackage}`;
                this.domainRepositoryPackageName = `${this.domainPackage}.${domainRelativeRepositoryPackage}`;
                this.domainWebPackageName = `${this.domainPackage}.${domainRelativeWebPackage}`;
                this.domainServicePackageName = `${this.domainPackage}.${domainRelativeServicePackage}`;

                this.domainServiceDtoPackageName = `${this.domainPackage}.${domainRelativeServicePackage}.dto`;

                this.domainModelFolder = this.packageAsFolder(this.domainModelPackageName);
                this.domainRepositoryFolder = this.packageAsFolder(this.domainRepositoryPackageName);
                this.domainServiceFolder = this.packageAsFolder(this.domainServicePackageName);

                if (this.domain) {
                    this.domainFolder = this.packageAsFolder(this.domainPackage);

                    this.entityPackage = this.domainModelPackageName;
                    this.entityRepositoryDtoPackage = this.domainServiceDtoPackageName;
                    this.entityRepositoryPackage = this.domainRepositoryPackageName;
                    this.entityServicePackage = this.domainServicePackageName;
                } else {
                    this.entityPackage = this.domainModelPackageName;
                    this.entityRepositoryDtoPackage = this.domainServiceDtoPackageName;
                    this.entityRepositoryPackage = this.domainRepositoryPackageName;
                    this.entityServicePackage = this.domainServicePackageName;
                }

                this.entityClassPath = `${this.entityPackage}.${this.asEntity(this.entityClass)}`;
                this.entityRepositoryClassPath = `${this.entityRepositoryPackage}.${this.entityClass}Repository`;
                this.entityControllerClassPath = `${this.domainWebPackageName}.${this.entityClass}Resource`;
                this.entityServiceDtoClassPath = `${this.entityRepositoryDtoPackage}.${this.asDto(this.entityClass)}`;
                this.entityServiceClassPath = `${this.entityServicePackage}.${this.entityClass}Service`;

                this.entityBaseName = this.packageAsFolder(this.entityClassPath);
                this.entityRepositoryBaseName = this.packageAsFolder(this.entityRepositoryClassPath);
                this.entityControllerBaseName = this.packageAsFolder(this.entityControllerClassPath);
                this.entityServiceDtoBaseName = this.packageAsFolder(this.entityServiceDtoClassPath);
                this.entityServiceBaseName = this.packageAsFolder(this.entityServiceClassPath);

                this.entityServiceImplClassPath = `${this.domainServicePackageName}.impl.${this.entityClass}ServiceImpl`;
                this.entityServiceImplBaseName = this.packageAsFolder(this.entityServiceImplClassPath);

                // Export to be used by relationships.
                this.entity.entityClassPath = this.entityClassPath;
                this.entity.entityRepositoryClassPath = this.entityRepositoryClassPath;
                this.entity.entityControllerClassPath = this.entityControllerClassPath;
                this.entity.entityServiceDtoClassPath = this.entityServiceDtoClassPath;
                this.entity.entityServiceClassPath = this.entityServiceClassPath;
            },

            processUniqueEnums() {
                this.uniqueEnums = {};

                this.fields.forEach(field => {
                    if (
                        field.fieldIsEnum &&
                        (!this.uniqueEnums[field.fieldType] || (this.uniqueEnums[field.fieldType] && field.fieldValues.length !== 0))
                    ) {
                        this.uniqueEnums[field.fieldType] = field.fieldType;
                    }
                });
            },
        };
    }

    get preparing() {
        if (useBlueprints) return;
        return this._preparing();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            ...super._missingPreDefault(),

            /**
             * Process json ignore references to prevent cyclic relationships.
             */
            processJsonIgnoreReferences() {
                this.relationships
                    .filter(relationship => relationship.relationshipOtherSideIgnore === undefined)
                    .forEach(relationship => {
                        relationship.ignoreOtherSideProperty =
                            !relationship.embedded && !!relationship.otherEntity && !!relationship.otherEntity.relationships.length;
                    });
                this.relationshipsContainOtherSideIgnore = this.relationships.some(relationship => relationship.ignoreOtherSideProperty);
            },

            processJavaEntityImports() {
                this.importApiModelProperty =
                    this.relationships.some(relationship => relationship.javadoc) || this.fields.some(field => field.javadoc);
            },

            /**
             * Process relationships that should be imported.
             */
            processRelationshipsFromOtherDomain() {
                this.relatedEntitiesFromAnotherDomain = Array.from(
                    new Set(
                        this.relationships
                            .map(relationship => relationship.otherEntity)
                            .filter(otherEntity => otherEntity && otherEntity.domainName !== this.entity.domainName)
                    )
                );
                this.relatedEntities = Array.from(
                    new Set(this.relationships.map(relationship => relationship.otherEntity).filter(otherEntity => otherEntity))
                );
            },

            useMapsIdRelation() {
                const jpaDerivedRelation = this.relationships.find(rel => rel.useJPADerivedIdentifier === true);
                if (jpaDerivedRelation) {
                    this.isUsingMapsId = true;
                    this.mapsIdAssoc = jpaDerivedRelation;
                    this.hasOauthUser = this.mapsIdAssoc.otherEntityName === 'user' && this.authenticationType === 'oauth2';
                } else {
                    this.isUsingMapsId = false;
                    this.mapsIdAssoc = null;
                    this.hasOauthUser = false;
                }
            },

            processUniqueEntityTypes() {
                this.uniqueEntityTypes = new Set(this.eagerRelations.map(rel => rel.otherEntityNameCapitalized));
                this.uniqueEntityTypes.add(this.entityClass);
            },
        };
    }

    get default() {
        if (useBlueprints) return;
        return this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return { ...writeFiles(), ...super._missingPostWriting() };
    }

    get writing() {
        if (useBlueprints) return;
        return this._writing();
    }

    /* Private methods used in templates */
    _getJoinColumnName(relationship) {
        if (relationship.useJPADerivedIdentifier === true) {
            return 'id';
        }
        return `${this.getColumnName(relationship.relationshipName)}_id`;
    }

    _generateSqlSafeName(name) {
        if (isReservedTableName(name, 'sql')) {
            return `e_${name}`;
        }
        return name;
    }
};
