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
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { JHIPSTER_CONFIG_DIR } = require('../generator-constants');

let useBlueprints;

module.exports = class extends BaseBlueprintGenerator {
    constructor(args, opts) {
        super(args, opts);

        this.option('skip-db-changelog', {
            desc: 'Skip the generation of database changelog (liquibase for sql databases)',
            type: Boolean,
        });

        this.option('composed-entities', {
            desc: 'Entities to be that already have been composed',
            type: Array,
            defaults: [],
        });

        this.option('entities-to-import', {
            desc: 'Entities to be imported',
            type: Array,
            defaults: [],
            hide: true,
        });

        if (this.options.help) return;

        useBlueprints = !this.fromBlueprint && this.instantiateBlueprints('entities');

        if (this.options.entitiesToImport) {
            const entities = this.jhipsterConfig.entities || [];
            this.options.entitiesToImport.forEach(entity => {
                if (!entities.includes(entity.name)) {
                    entities.push(entity.name);
                }
                this.fs.writeJSON(this.destinationPath(JHIPSTER_CONFIG_DIR, `${entity.name}.json`), entity);
            });
            this.jhipsterConfig.entities = entities;
        }
    }

    // Public API method used by the getter and also by Blueprints
    _initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },
        };
    }

    get initializing() {
        return useBlueprints ? undefined : this._initializing();
    }

    // Public API method used by the getter and also by Blueprints
    _composing() {
        return {
            composeEachEntity() {
                this.getExistingEntityNames().forEach(entityName => {
                    if (this.options.composedEntities && this.options.composedEntities.includes(entityName)) return;
                    this.composeWithJHipster('entity', {
                        regenerate: true,
                        skipDbChangelog: this.jhipsterConfig.databaseType === 'sql' || this.options.skipDbChangelog,
                        skipInstall: true,
                        arguments: [entityName],
                    });
                });
            },

            databaseChangelog() {
                if (this.jhipsterConfig.skipServer || this.jhipsterConfig.databaseType !== 'sql' || this.options.skipDbChangelog) {
                    return;
                }
                const existingEntities = this.getExistingEntities();
                if (existingEntities.length === 0) {
                    return;
                }

                this.composeWithJHipster('database-changelog', {
                    arguments: existingEntities.map(entity => entity.name),
                });
            },
        };
    }

    get composing() {
        return useBlueprints ? undefined : this._composing();
    }

    _loading() {
        return {
            createUserManagementEntities() {
                this.createUserManagementEntities();
            },
        };
    }

    get loading() {
        return this._loading();
    }

    // Public API method used by the getter and also by Blueprints
    _default() {
        return {
            composeEntitiesClient() {
                if (this.jhipsterConfig.skipClient) return;
                const clientEntities = this.getExistingEntityNames()
                    .map(entityName => {
                        const entity = this.configOptions.sharedEntities[entityName];
                        if (entity === undefined) {
                            throw new Error(`${entityName} shared entity data not found`);
                        }
                        return entity;
                    })
                    .filter(entity => !entity.skipClient);
                if (clientEntities.length === 0) return;
                this.composeWithJHipster('entities-client', {
                    clientEntities,
                    skipInstall: this.options.skipInstall,
                });
            },
        };
    }

    get default() {
        return useBlueprints ? undefined : this._default();
    }

    // Public API method used by the getter and also by Blueprints
    _writing() {
        return {};
    }

    get writing() {
        return useBlueprints ? undefined : this._writing();
    }
};
