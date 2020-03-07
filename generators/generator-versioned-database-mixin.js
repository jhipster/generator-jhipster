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

module.exports = {
    /**
     * Load entity and apply every changelog
     * @param {String} entityName - Entity to load
     * @param {String} [untilChangelog] - Apply changelogs less than or equals
     * @returns {Object} Entity definition.
     */
    loadDatabaseChangelogEntity(entityName, untilChangelog, returnRemoved) {
        const toApply = this.loadDatabaseChangelogs(
            changelog => changelog.entityName === entityName && (!untilChangelog || changelog.changelogDate <= untilChangelog)
        );
        const entity = this.applyDatabaseChangelogs(toApply, entityName, returnRemoved);
        entity.name = entity.name || entityName;
        return entity;
    },

    /**
     * Load ordered changelogs
     * @param {any} [filter] - lodash filter
     * @returns {Array} Array of changelogs
     */
    loadDatabaseChangelogs(filter) {
        const databaseChangelogs = this.config.get('databaseChangelogs');
        if (!databaseChangelogs) {
            throw new Error('Cannot find any changelog');
        }
        let changelogs = Object.values(databaseChangelogs);
        if (filter) {
            changelogs = _.filter(changelogs, filter);
        }

        function isBefore(e1, e2) {
            let diff = e1.changelogDate - e2.changelogDate;
            if (diff === 0 && e1.entityName && e2.entityName) {
                diff = e1.entityName > e2.entityName;
            }
            return diff;
        }

        // Sort by changelogDate
        changelogs.sort(isBefore);
        return changelogs;
    },

    /**
     * Apply changelogs
     * @param {Array} changelogsToApply - Changelogs to apply.
     * @param {String} entityName - Entity name to filter.
     * @param {Boolean} returnRemoved - Add removedFields and removedRelationships to the returned object
     * @returns {any} The Entity definition.
     */
    applyDatabaseChangelogs(changelogsToApply, entityName, returnRemoved) {
        if (!changelogsToApply) {
            return undefined;
        }
        const context = { fields: [], relationships: [] };
        let initialized = false;
        changelogsToApply.forEach(changelog => {
            if (changelog.entityName !== entityName) {
                return;
            }
            if (changelog.type === 'entity-new' || changelog.type === 'entity-snapshot') {
                Object.assign(context, changelog.definition);
                initialized = true;
            }
            if (!initialized) {
                throw new Error(
                    `Error applying changelogs, entity ${entityName} was not initialized at changelog ${changelog.changelogDate}`
                );
            }
            const removedFields = [];
            if (changelog.removedFields) {
                context.fields = context.fields.filter(field => {
                    const isRemoved = changelog.removedFields.includes(field.fieldName);
                    if (isRemoved) {
                        removedFields.push(field);
                    }
                    return !isRemoved;
                });
            }
            const removedRelationships = [];
            if (changelog.removedRelationships) {
                context.relationships = context.relationships.filter(rel => {
                    const isRemoved = changelog.removedRelationships.includes(`${rel.relationshipName}:${rel.relationshipType}`);
                    if (isRemoved) {
                        removedRelationships.push(rel);
                    }
                    return !isRemoved;
                });
            }
            if (returnRemoved) {
                context.removedFields = removedFields;
                context.removedRelationships = removedRelationships;
            }
            if (changelog.addedFields) {
                context.fields = context.fields.concat(changelog.addedFields);
            }
            if (changelog.addedRelationships) {
                context.relationships = context.relationships.concat(changelog.addedRelationships);
            }
        });
        return context;
    },
};
