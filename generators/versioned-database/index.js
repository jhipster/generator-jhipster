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
const assert = require('assert');
const fs = require('fs');

const BaseGenerator = require('../generator-base');
const { parseLiquibaseChangelogDate } = require('../../utils/liquibase');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

        this.configOptions = this.options.configOptions || {};

        this.argument('init', {
            type: String,
            required: false,
            description: 'Initialize versioned database',
        });

        this.argument('apply', {
            type: String,
            required: false,
            description: 'External file to apply',
        });

        this.argument('customChangelog', {
            type: String,
            required: false,
            description: 'Add a custom changelog entry to master.xml',
        });

        this.argument('snapshot', {
            type: String,
            required: false,
            description: 'Add a changelog breaking point for custom changes',
        });

        this.argument('tag', {
            type: String,
            required: false,
            description: 'Create a tag changelog',
        });

        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false,
        });

        this.option('regenerate', {
            desc: 'Regenerate the changelog',
            type: Boolean,
            defaults: false,
        });

        this.option('update', {
            desc: 'Update based on the current entity',
            type: Boolean,
            defaults: false,
        });

        this.option('generate', {
            desc: 'Generate the changelog',
            type: Boolean,
            defaults: false,
        });

        this.option('entity', {
            desc: 'Name of the entity to update',
            type: String,
        });

        this.option('new-entity', {
            desc: 'Create a new changelog for the entity',
            type: Boolean,
            defaults: false,
        });

        this.registerPrettierTransform();
        this.changelogConfig = this.createStorage('.yo-rc.json', 'generator-jhipster.databaseChangelogs', true);
    }

    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            /**
             * Display jhipster logo
             */
            displayLogo() {
                if (this.logo) {
                    this.printJHipsterLogo();
                }
            },

            /**
             * Validate if current version is using versioned database.
             */
            initializeConfig() {
                let versionedDatabase = this.config.get('versionedDatabase');
                if (versionedDatabase) {
                    return;
                }
                versionedDatabase = this.options.init;
                if (!versionedDatabase) {
                    throw new Error('Incremental changelog is not enabled for this project');
                }
                versionedDatabase = typeof versionedDatabase === 'string' ? versionedDatabase : 'liquibase';
                // Set skipDbChangelog so changelogs will be ignored at entity-* generators.
                this.config.set('skipDbChangelog', true);
                // Set versionedDatabase to true.
                this.config.set('versionedDatabase', versionedDatabase);
            },
        };
    }

    get initializing() {
        return this._initializing();
    }

    _prompting() {
        return {};
    }

    get prompting() {
        return this._prompting();
    }

    _configuring() {
        return {
            /**
             * Convert a project to a versioned database.
             */
            initializeIncrementalChangelog() {
                const changelogs = this.changelogConfig.getAll();
                if (changelogs !== undefined && Object.keys(changelogs).length > 0) {
                    return;
                }
                this._debug('Initializing incremental changelog');
                let lastLiquibaseTimestamp;
                this.getExistingEntities().forEach(entity => {
                    const changelogDate = entity.definition.changelogDate;
                    if (this.changelogConfig.get(changelogDate)) {
                        throw new Error(`Duplicate changelogDate ${changelogDate}`);
                    }
                    const changelogContext = this._createChangelogContext('entity-new', entity.name, changelogDate);
                    changelogContext.set('definition', entity.definition);
                    changelogContext.set('migration', true);
                    changelogContext.save();
                    lastLiquibaseTimestamp = parseLiquibaseChangelogDate(changelogDate).getTime();
                });
                if (lastLiquibaseTimestamp) {
                    this.config.set('lastLiquibaseTimestamp', lastLiquibaseTimestamp);
                }
                this.fullRegeneration = true;
            },

            /**
             * Loads last changelogDate
             */
            initChangelogDate() {
                this._loadLastChangelogDate();
            },

            /**
             * Create new entity.
             */
            createNewEntity() {
                const { newEntity, entity: entityName } = this.options;
                if (!newEntity) {
                    return;
                }
                assert(entityName, 'Entity name is required');
                this._debug(`Creating a new changelog for entity ${entityName}`);
                const definition = this.fs.readJSON(`.jhipster/${entityName}.json`);
                this._debug(definition);
                const changelogDate = definition.changelogDate;
                if (this.changelogConfig.get(changelogDate)) {
                    throw new Error(`Duplicate changelogDate ${changelogDate}`);
                }
                const changelogContext = this._createChangelogContext('entity-new', entityName, changelogDate);
                changelogContext.set('definition', definition);
                changelogContext.save();
                this._writeChangelog(changelogContext.getChangelog());
            },

            /**
             * Calculate new changelog.
             */
            updateChangelogsFromEntities() {
                const { update, entity: entityName } = this.options;
                if (!update) {
                    return;
                }
                let entities = this.getExistingEntities();
                if (entityName) {
                    this._debug(`Found entities ${entities.map(entity => entity.name).join(', ')}`);
                    this._debug(`Filtering entity ${entityName}`);
                    entities = entities.filter(entity => entity.name === entityName);
                }
                this._debug(`Updating or creating changelog for ${entities.map(entity => entity.name).join(', ')}`);
                const changelogs = this._generateChangelogFromDiff(entities);
                if (entityName) {
                    // If entityName, this generator was called by entity generator, so write the changelog
                    changelogs.forEach(changelog => this._writeChangelog(changelog));
                }
            },

            /**
             * Apply external changelogs
             */
            applyExternalChangelogs() {
                if (!this.options.apply) {
                    return;
                }
                const externalFile = JSON.parse(fs.readFileSync(this.options.apply));
                const changelogEntityNames = Object.values(externalFile)
                    .map(changelog => changelog.entityName)
                    .filter(entityName => entityName);
                this.appliedChangelogs = [...new Set(changelogEntityNames)];
                this.changelogConfig.set(externalFile);
                this.fullRegeneration = this.appliedChangelogs.length > 0;
            },

            /**
             * Validate current changelogs
             */
            validateChangelogs() {
                this.loadDatabaseChangelogs().forEach(changelog => {
                    if (!changelog.changelogDate) {
                        throw new Error('Changelog must have a changelogDate');
                    }
                    if (!changelog.type) {
                        throw new Error('Changelog must have a type');
                    }
                });
            },

            /**
             * Consolidate applied changelogs.
             */
            applyChangelogs() {
                if (!this.options.apply) {
                    return;
                }
                this.appliedChangelogs.forEach(entityName => {
                    const entityConfig = this.createStorage(`.jhipster/${entityName}.json`);
                    // Update entity definition.
                    entityConfig.set(this.loadDatabaseChangelogEntity(entityName));
                });
            },
        };
    }

    get configuring() {
        return this._configuring();
    }

    _default() {
        return {
            runCommands() {
                if (this.options.customChangelog) {
                    const changelogContext = this._createChangelogContext('custom', this.options.customChangelog);
                    changelogContext.save(true);
                    this._writeChangelog(changelogContext.getChangelog());
                    return;
                }
                if (this.options.tag) {
                    const changelogContext = this._createChangelogContext('tag', this.options.tag);
                    changelogContext.save(true);
                    this._writeChangelog(changelogContext.getChangelog());
                    return;
                }
                if (this.options.snapshot) {
                    const entityName = this.options.snapshot;
                    const entity = this.loadDatabaseChangelogEntity(entityName);
                    if (!entity) {
                        this.env.error(`Entity ${entityName} was not found`);
                    }
                    const changelogContext = this._createChangelogContext('entity-snapshot', entityName);
                    changelogContext.set('definition', entity.definition);
                    changelogContext.save(true);
                    this._writeChangelog(changelogContext.getChangelog());
                }
            },
        };
    }

    get default() {
        return this._default();
    }

    _writing() {
        return {
            regenerate() {
                if (this.fullRegeneration) {
                    const configOptions = this.options.configOptions;
                    this.composeWith(require.resolve('../app'), {
                        'with-entities': true,
                        configOptions,
                        updateVersionedDatabase: false,
                        'from-cli': true,
                        'skip-install': true,
                        debug: this.isDebugEnabled,
                    });
                    // A full regeneration is queued, stop this generator.
                    this.cancelCancellableTasks();
                    return;
                }
                const { regenerate } = this.options;
                if (!regenerate) {
                    return;
                }
                this._regenerate();
            },
        };
    }

    get writing() {
        return this._writing();
    }

    _install() {
        return {};
    }

    get install() {
        return this._install();
    }

    _end() {
        return {};
    }

    get end() {
        return this._end();
    }

    /* ======================================================================== */
    /* private methods use within generator                                     */
    /* ======================================================================== */

    /**
     * Write changelog
     */
    _writeChangelog(databaseChangelog) {
        this._debug('Regenerating changelog %s', databaseChangelog.changelogDate);
        const versionedDatabase = this.config.get('versionedDatabase');
        const generator = versionedDatabase === 'liquibase' ? require.resolve('../versioned-database-liquibase') : versionedDatabase;
        this.composeWith(generator, { databaseChangelog });
    }

    /**
     * Update lastLiquibaseTimestamp config.
     */
    _loadLastChangelogDate() {
        const changelog = this.loadDatabaseChangelogs().pop();
        if (!changelog) {
            return;
        }
        const changelogDate = changelog.changelogDate;
        const lastLiquibaseTimestamp = this.config.get('lastLiquibaseTimestamp');
        const timestamp = parseLiquibaseChangelogDate(changelogDate).getTime();
        if (!lastLiquibaseTimestamp || lastLiquibaseTimestamp < timestamp) {
            this.config.set('lastLiquibaseTimestamp', timestamp);
        }
    }

    /**
     * Creates a new changelog definition.
     * @param {String} type - Type of the changelog
     * @param {String} name - Name of the changelog or name of the entity
     * @param {String} changelogDate - ChangelogDate
     * @returns {Object} The changelog base definition
     */
    _createChangelogContext(type, name, changelogDate = this.dateFormatForLiquibase(false)) {
        if (!changelogDate) {
            throw new Error('No current changelog was found.');
        }

        const changelog = { type, changelogDate };
        if (type === 'custom' || type === 'tag') {
            changelog.name = name;
        } else if (type.startsWith('entity-')) {
            changelog.entityName = name;
        } else {
            // Add entity-snapshot, tag
            throw new Error(`Changelog of type ${type} not implemented`);
        }

        let hasChanged = false;
        const self = this;
        return {
            getChangelog() {
                return changelog;
            },
            get(key) {
                return changelog[key];
            },
            set(key, value) {
                hasChanged = true;
                changelog[key] = value;
            },
            save(force = false) {
                if (!force && !hasChanged) return false;
                self.changelogConfig.set(changelog.changelogDate, changelog);
                return true;
            },
        };
    }

    /**
     * Regenerate changelogs.
     */
    _regenerate() {
        const ordered = this.loadDatabaseChangelogs();
        if (!ordered) return;

        // Generate in order
        ordered.forEach(item => {
            this._writeChangelog(item);
        });
    }

    /**
     * Generate changelog from differences between the liquibase entity and current entity.
     */
    _generateChangelogFromDiff(entities) {
        const { generate = false } = this.options;
        const relationshipsChangelogs = [];
        const savedChangelogs = [];
        // Compare entity changes and create changelogs
        entities.forEach(loaded => {
            const entity = { ...loaded.definition };
            const entityName = entity.name || loaded.name;

            const dbEntity = this.loadDatabaseChangelogEntity(entityName);
            const fields = entity.fields;
            const relationships = entity.relationships;

            const currentFields = dbEntity.fields || [];
            // Calculate new fields
            const addedFields = fields.filter(field => !currentFields.find(fieldRef => fieldRef.fieldName === field.fieldName));
            // Calculate removed fields
            const removedFields = currentFields.filter(field => !fields.find(fieldRef => fieldRef.fieldName === field.fieldName));

            // Create a new changelog of type entity-fields
            const changelogContext = this._createChangelogContext('entity-fields', entityName);
            if (addedFields.length) {
                changelogContext.set('addedFields', addedFields);
            }
            if (removedFields.length) {
                changelogContext.set(
                    'removedFields',
                    removedFields.map(field => field.fieldName)
                );
            }

            if (changelogContext.save()) {
                // Multiples changelogs can be found.
                // If persisted then run a full regeneration.
                savedChangelogs.push(changelogContext.getChangelog());
            }

            // Calculate new relationships
            const addedRelationships = relationships.filter(
                relationship =>
                    !dbEntity.relationships.find(relRef => {
                        const refName = relRef.relationshipName || relRef.otherEntityName;
                        const name = relationship.relationshipName || relationship.otherEntityName;
                        return refName === name;
                    })
            );
            // Calculate removed relationships
            const removedRelationships = dbEntity.relationships.filter(
                relationship =>
                    !relationships.find(relRef => {
                        const refName = relRef.relationshipName || relRef.otherEntityName;
                        const name = relationship.relationshipName || relationship.otherEntityName;
                        return refName === name;
                    })
            );

            if (addedRelationships.length || removedRelationships.length) {
                const changedRelationships = { entityName };
                if (addedRelationships.length) {
                    changedRelationships.addedRelationships = addedRelationships;
                }
                if (removedRelationships.length) {
                    changedRelationships.removedRelationships = removedRelationships.map(
                        rel => `${rel.relationshipName}:${rel.relationshipType}`
                    );
                }
                // Delay (due to timestamp) the relationship generation so every new entity is created.
                relationshipsChangelogs.push(changedRelationships);
            }
        });

        // Create relationships changelogs
        relationshipsChangelogs.forEach(changedRelationships => {
            const changelogContext = this._createChangelogContext('entity-relationships', changedRelationships.entityName);
            if (changedRelationships.addedRelationships) {
                changelogContext.set('addedRelationships', changedRelationships.addedRelationships);
            }
            if (changedRelationships.removedRelationships) {
                changelogContext.set('removedRelationships', changedRelationships.removedRelationships);
            }

            if (changelogContext.save()) {
                savedChangelogs.push(changelogContext.getChangelog());
            }
        });
        if (savedChangelogs.length && !generate) {
            // Multiples changelogs can be found.
            // If persisted then run a full regeneration.
            this.fullRegeneration = true;
        }
        return savedChangelogs;
    }
};
