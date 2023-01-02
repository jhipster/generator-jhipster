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
import fs from 'fs';

import BaseApplication from '../base-application/index.mjs';
import type { DefaultTaskGroup } from '../base-application/tasks.mjs';
import type { LiquibaseApplication, SpringBootApplication } from '../server/types.mjs';
import { JHIPSTER_CONFIG_DIR } from '../generator-constants.mjs';
import { GENERATOR_LIQUIBASE, GENERATOR_LIQUIBASE_CHANGELOGS, GENERATOR_BOOTSTRAP_APPLICATION_SERVER } from '../generator-list.mjs';
import { liquibaseFiles } from './files.mjs';

const BASE_CHANGELOG = {
  addedFields: [],
  removedFields: [],
  addedRelationships: [],
  removedRelationships: [],
};
export default class DatabaseChangelogGenerator extends BaseApplication<SpringBootApplication & LiquibaseApplication> {
  constructor(args: any, options: any, features: any) {
    super(args, options, { unique: 'namespace', ...features });

    this.argument('entities', {
      description: 'Which entities to generate a new changelog',
      type: Array,
      required: false,
    });

    if (this.options.help) {
      return;
    }
    this.info(`Creating changelog for entities ${this.options.entities}`);
    this.configOptions.oldSharedEntities = this.configOptions.oldSharedEntities || [];
  }

  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_SERVER);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_LIQUIBASE);
    }
  }

  override get default(): DefaultTaskGroup<this, SpringBootApplication> {
    return {
      async calculateChangelogs({ application, entities }) {
        if (!application.databaseTypeSql || this.options.skipDbChangelog) {
          return;
        }
        if (!this.options.entities) {
          this.options.entities = entities.filter(entity => !entity.builtIn && !entity.skipServer).map(entity => entity.name);
        }
        const diffs = this._generateChangelogFromFiles(application);
        for (const [fieldChanges] of diffs) {
          if (fieldChanges.type === 'entity-new') {
            await this._composeWithIncrementalChangelogProvider(fieldChanges);
          }
          if (fieldChanges.addedFields.length > 0 || fieldChanges.removedFields.length > 0) {
            await this._composeWithIncrementalChangelogProvider(fieldChanges);
          }
        }
        // eslint-disable-next-line no-unused-vars
        for (const [_fieldChanges, relationshipChanges] of diffs) {
          if (
            relationshipChanges &&
            relationshipChanges.incremental &&
            (relationshipChanges.addedRelationships.length > 0 || relationshipChanges.removedRelationships.length > 0)
          ) {
            await this._composeWithIncrementalChangelogProvider(relationshipChanges);
          }
        }
      },
    };
  }

  get [BaseApplication.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        await this.writeFiles<SpringBootApplication & LiquibaseApplication & Record<string, any>>({
          sections: liquibaseFiles,
          context: {
            ...application,
            recreateInitialChangelog: this.configOptions.recreateInitialChangelog,
          },
        });
      },
    });
  }

  get [BaseApplication.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  /* ======================================================================== */
  /* private methods use within generator                                     */
  /* ======================================================================== */

  _composeWithIncrementalChangelogProvider(databaseChangelog: any) {
    const skipWriting = this.options.entities.length !== 0 && !this.options.entities.includes(databaseChangelog.entityName);
    return this.composeWithJHipster(GENERATOR_LIQUIBASE_CHANGELOGS, {
      databaseChangelog,
      skipWriting,
      configOptions: this.configOptions,
    });
  }

  /**
   * Generate changelog from differences between the liquibase entity and current entity.
   */
  _generateChangelogFromFiles(application: LiquibaseApplication) {
    // Compare entity changes and create changelogs
    return this.getExistingEntityNames().map(entityName => {
      const filename = this.destinationPath(JHIPSTER_CONFIG_DIR, `${entityName}.json`);

      const newConfig: any = this.fs.readJSON(filename);
      const newFields: any[] = (newConfig.fields || []).filter((field: any) => !field.transient);
      const newRelationships: any[] = newConfig.relationships || [];

      if (
        this.configOptions.recreateInitialChangelog ||
        !application.incrementalChangelog ||
        !fs.existsSync(filename) ||
        !fs.existsSync(
          this.destinationPath(`src/main/resources/config/liquibase/changelog/${newConfig.changelogDate}_added_entity_${entityName}.xml`)
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
      (this as any)._debug(`Calculating diffs for ${entityName}`);

      const oldConfig: any = JSON.parse(fs.readFileSync(filename) as any);
      // Share old entity
      this.configOptions.oldSharedEntities[entityName] = oldConfig;

      const oldFields: any[] = (oldConfig.fields || []).filter((field: any) => !field.transient);
      const oldFieldNames: string[] = oldFields.map(field => field.fieldName);
      const newFieldNames: string[] = newFields.map(field => field.fieldName);

      // Calculate new fields
      const addedFieldNames = newFieldNames.filter(fieldName => !oldFieldNames.includes(fieldName));
      const addedFields = addedFieldNames.map(fieldName => newFields.find(field => fieldName === field.fieldName));
      // Calculate removed fields
      const removedFieldNames = oldFieldNames.filter(fieldName => !newFieldNames.includes(fieldName));
      const removedFields = removedFieldNames.map(fieldName => oldFields.find(field => fieldName === field.fieldName));

      const newRelationshipNames = newRelationships.map(relationship => relationship.relationshipName);
      const oldRelationships: any[] = oldConfig.relationships || [];
      const oldRelationshipNames = oldRelationships.map(relationship => relationship.relationshipName);

      // Calculate new relationships
      const addedRelationshipNames = newRelationshipNames.filter(relationshipName => !oldRelationshipNames.includes(relationshipName));
      const addedRelationships = addedRelationshipNames.map(relationshipName =>
        newRelationships.find(relationship => relationshipName === relationship.relationshipName)
      );
      // Calculate removed relationships
      const removedRelationshipNames = oldRelationshipNames.filter(relationshipName => !newRelationshipNames.includes(relationshipName));
      const removedRelationships = removedRelationshipNames.map(relationshipName =>
        oldRelationships.find(relationship => relationshipName === relationship.relationshipName)
      );

      return [
        { ...BASE_CHANGELOG, incremental: true, type: 'entity-update', entityName, addedFields, removedFields },
        { ...BASE_CHANGELOG, incremental: true, type: 'entity-update', entityName, addedRelationships, removedRelationships },
      ];
    });
  }
}
