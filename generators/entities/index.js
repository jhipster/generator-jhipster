/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const BaseBlueprintGenerator = require('../generator-base-blueprint');
const { INITIALIZING_PRIORITY, COMPOSING_PRIORITY, DEFAULT_PRIORITY, WRITING_PRIORITY } =
  require('../../lib/constants/priorities.cjs').compat;
const { JHIPSTER_CONFIG_DIR } = require('../generator-constants');
const { SQL } = require('../../jdl/jhipster/database-types');
const { GENERATOR_ENTITIES, GENERATOR_ENTITIES_CLIENT, GENERATOR_ENTITY, GENERATOR_DATABASE_CHANGELOG } = require('../generator-list');

module.exports = class extends BaseBlueprintGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', ...features });

    // This makes `name` a required argument.
    this.argument('entities', {
      type: Array,
      required: false,
      description: 'Entities to regenerate.',
    });

    this.option('skip-db-changelog', {
      desc: 'Skip the generation of database changelog (liquibase for sql databases)',
      type: Boolean,
    });

    this.option('base-name', {
      desc: 'Application base name',
      type: String,
    });

    this.option('defaults', {
      desc: 'Execute jhipster with default config',
      type: Boolean,
      defaults: false,
    });

    this.option('composed-entities', {
      desc: 'Entities to be that already have been composed',
      type: Array,
      hide: true,
      defaults: [],
    });

    this.option('entities-to-import', {
      desc: 'Entities to be imported',
      type: Array,
      defaults: [],
      hide: true,
    });

    this.option('regenerate', {
      desc: 'Regenerate entities without prompts',
      type: Boolean,
    });

    this.option('write-every-entity', {
      desc: 'Private option to write every entity file',
      type: Boolean,
      defaults: true,
      hide: true,
    });
  }

  async _postConstruct() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_ENTITIES);
    }

    if (this.options.entitiesToImport) {
      const entities = this.jhipsterConfig.entities || [];
      this.options.entitiesToImport.forEach(entity => {
        if (!entities.includes(entity.name)) {
          entities.push(entity.name);
        }
        this.fs.writeJSON(this.destinationPath(JHIPSTER_CONFIG_DIR, `${entity.name}.json`), entity);
      });
      this.jhipsterConfig.entities = entities;
    } else {
      this.jhipsterConfig.entities = this.jhipsterConfig.entities || [];
    }

    if (this.options.baseName !== undefined) {
      this.jhipsterConfig.baseName = this.options.baseName;
    }

    if (this.options.defaults) {
      if (!this.jhipsterConfig.baseName) {
        this.jhipsterConfig.baseName = this.getDefaultAppName();
      }
      this.setConfigDefaults(this.getDefaultConfigForApplicationType());
    }

    if (!this.options.entities || this.options.entities.length === 0) {
      this.options.entities = this.getExistingEntityNames();
      if (this.options.regenerate === undefined) {
        // Execute a non interactive regeneration.
        this.options.regenerate = true;
      }
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

  get [INITIALIZING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._initializing();
  }

  // Public API method used by the getter and also by Blueprints
  _composing() {
    return {
      async composeEachEntity() {
        return Promise.all(
          this.getExistingEntityNames().map(async entityName => {
            if (this.options.composedEntities && this.options.composedEntities.includes(entityName)) return;
            const selectedEntity = this.options.entities.includes(entityName);
            const { regenerate = !selectedEntity } = this.options;
            await this.composeWithJHipster(GENERATOR_ENTITY, [entityName], {
              skipWriting: this.options.skipWriting || (!this.options.writeEveryEntity && !selectedEntity),
              regenerate,
              skipDbChangelog: this.jhipsterConfig.databaseType === SQL || this.options.skipDbChangelog,
              skipInstall: true,
              skipPrompts: this.options.skipPrompts,
            });
          })
        );
      },

      async databaseChangelog() {
        if (this.jhipsterConfig.skipServer || this.jhipsterConfig.databaseType !== SQL || this.options.skipDbChangelog) {
          return;
        }
        const existingEntities = this.getExistingEntityNames();
        if (existingEntities.length === 0) {
          return;
        }

        await this.composeWithJHipster(
          GENERATOR_DATABASE_CHANGELOG,
          this.options.writeEveryEntity ? existingEntities : this.options.entities
        );
      },
    };
  }

  get [COMPOSING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._composing();
  }

  // Public API method used by the getter and also by Blueprints
  _default() {
    return {
      async composeEntitiesClient() {
        if (this.options.skipWriting || this.options.entities.length !== this.jhipsterConfig.entities.length) return;
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
        await this.composeWithJHipster(GENERATOR_ENTITIES_CLIENT, clientEntities, {
          skipInstall: this.options.skipInstall,
        });
      },
    };
  }

  get [DEFAULT_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._default();
  }

  // Public API method used by the getter and also by Blueprints
  _writing() {
    return {};
  }

  get [WRITING_PRIORITY]() {
    if (this.delegateToBlueprint) return {};
    return this._writing();
  }
};
