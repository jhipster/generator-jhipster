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
const fs = require('fs');
const { JHIPSTER_CONFIG_DIR } = require('../generator-constants');
const BaseGenerator = require('../generator-base');

const BASE_CHANGELOG = {
    addedFields: [],
    removedFields: [],
    addedRelationships: [],
    removedRelationships: [],
};

module.exports = class extends BaseGenerator {
    constructor(args, options) {
        super(args, options);

        this.configOptions = this.options.configOptions || {};

        this.argument('entities', {
            desc: 'Which entities to generate a new changelog',
            type: Array,
            required: true,
        });

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false,
        });

        if (this.options.help) {
            return;
        }
        this.info(`Creating changelog for entities ${this.options.entities}`);
    }

    _default() {
        return {
            calculateChangelogs() {
                const diff = this._generateChangelogFromFiles();

                diff.forEach(([fieldChanges, _relationshipChanges]) => {
                    if (fieldChanges.type === 'entity-new') {
                        this._composeWithIncrementalChangelogProvider(fieldChanges);
                    } else if (fieldChanges.addedFields.length > 0 || fieldChanges.removedFields.length > 0) {
                        this._composeWithIncrementalChangelogProvider(fieldChanges);
                    }
                });

                diff.forEach(([_fieldChanges, relationshipChanges]) => {
                    if (
                        relationshipChanges &&
                        relationshipChanges.incremental &&
                        (relationshipChanges.addedRelationships.length > 0 || relationshipChanges.removedRelationships.length > 0)
                    ) {
                        this._composeWithIncrementalChangelogProvider(relationshipChanges);
                    }
                });
            },
        };
    }

    get default() {
        return this._default();
    }

    /* ======================================================================== */
    /* private methods use within generator                                     */
    /* ======================================================================== */

    _composeWithIncrementalChangelogProvider(databaseChangelog) {
        this.composeWithJHipster('database-changelog-liquibase', {
            databaseChangelog,
            configOptions: this.configOptions,
        });
    }

    /**
     * Generate changelog from differences between the liquibase entity and current entity.
     */
    _generateChangelogFromFiles() {
        // Compare entity changes and create changelogs
        return this.options.entities.map(entityName => {
            const filename = this.destinationPath(JHIPSTER_CONFIG_DIR, `${entityName}.json`);

            const newConfig = this.fs.readJSON(filename);
            const newFields = newConfig.fields || [];
            const newRelationships = newConfig.relationships || [];

            if (
                this.configOptions.recreateInitialChangelog ||
                !this.jhipsterConfig.incrementalChangelog ||
                !fs.existsSync(filename) ||
                !fs.existsSync(
                    this.destinationPath(
                        `src/main/resources/config/liquibase/changelog/${newConfig.changelogDate}_added_entity_${entityName}.xml`
                    )
                )
            ) {
                return [
                    {
                        ...BASE_CHANGELOG,
                        incremental: newConfig.incrementalChangelog,
                        changelogDate: newConfig.changelogDate,
                        type: 'entity-new',
                        entityName,
                    },
                ];
            }
            this._debug(`Calculating diffs for ${entityName}`);

            const oldConfig = JSON.parse(fs.readFileSync(filename));
            const oldFields = oldConfig.fields || [];
            const oldFieldNames = oldFields.map(field => field.fieldName);
            const newFieldNames = newFields.map(field => field.fieldName);

            // Calculate new fields
            const addedFieldNames = newFieldNames.filter(fieldName => !oldFieldNames.includes(fieldName));
            const addedFields = addedFieldNames.map(fieldName => newFields.find(field => fieldName === field.fieldName));
            // Calculate removed fields
            const removedFieldNames = oldFieldNames.filter(fieldName => !newFieldNames.includes(fieldName));
            const removedFields = removedFieldNames.map(fieldName => oldFields.find(field => fieldName === field.fieldName));

            const newRelationshipNames = newRelationships.map(relationship => relationship.relationshipName);
            const oldRelationships = oldConfig.relationships || [];
            const oldRelationshipNames = oldRelationships.map(relationship => relationship.relationshipName);

            // Calculate new relationships
            const addedRelationshipNames = newRelationshipNames.filter(
                relationshipName => !oldRelationshipNames.includes(relationshipName)
            );
            const addedRelationships = addedRelationshipNames.map(relationshipName =>
                newRelationships.find(relationship => relationshipName === relationship.relationshipName)
            );
            // Calculate removed relationships
            const removedRelationshipNames = oldRelationshipNames.filter(
                relationshipName => !newRelationshipNames.includes(relationshipName)
            );
            const removedRelationships = removedRelationshipNames.map(relationshipName =>
                oldRelationships.find(relationship => relationshipName === relationship.relationshipName)
            );

            return [
                { ...BASE_CHANGELOG, incremental: true, type: 'entity-update', entityName, addedFields, removedFields },
                { ...BASE_CHANGELOG, incremental: true, type: 'entity-update', entityName, addedRelationships, removedRelationships },
            ];
        });
    }
};
