/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import BaseApplicationGenerator from '../base-application/index.mjs';
import { JHIPSTER_CONFIG_DIR } from '../generator-constants.mjs';
import { GENERATOR_ENTITIES, GENERATOR_APP } from '../generator-list.mjs';
import { getDefaultAppName } from '../project-name/support/index.mjs';

export default class EntitiesGenerator extends BaseApplicationGenerator {
  constructor(args, options, features) {
    super(args, options, { skipParseOptions: false, ...features });

    // This makes `name` a required argument.
    this.argument('entities', {
      type: Array,
      required: false,
      description: 'Entities to regenerate.',
    });

    this.option('skip-db-changelog', {
      description: 'Skip the generation of database changelog (liquibase for sql databases)',
      type: Boolean,
    });

    this.option('base-name', {
      description: 'Application base name',
      type: String,
    });

    this.option('defaults', {
      description: 'Execute jhipster with default config',
      type: Boolean,
      default: false,
    });

    this.option('composed-entities', {
      description: 'Entities to be that already have been composed',
      type: Array,
      hide: true,
      default: [],
    });

    this.option('entities-to-import', {
      description: 'Entities to be imported',
      type: Array,
      default: [],
      hide: true,
    });

    this.option('regenerate', {
      description: 'Regenerate entities without prompts',
      type: Boolean,
    });

    this.option('write-every-entity', {
      description: 'Private option to write every entity file',
      type: Boolean,
      default: true,
      hide: true,
    });
  }

  async beforeQueue() {
    this.loadStoredAppOptions();
    this.loadRuntimeOptions();

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

    if (!this.options.entities || this.options.entities.length === 0 || this.options.writeEveryEntity) {
      this.options.entities = this.getExistingEntityNames();
      if (this.options.regenerate === undefined) {
        // Execute a non interactive regeneration.
        this.options.regenerate = true;
      }
    }
  }

  // Public API method used by the getter and also by Blueprints
  get composing() {
    return {
      async composeApp() {
        await this.composeWithJHipster(GENERATOR_APP, { generatorOptions: { skipPriorities: ['writing', 'postWriting'] } });
      },
    };
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }
}
