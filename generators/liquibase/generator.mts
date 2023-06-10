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
import fs from 'fs';

import _ from 'lodash';
import BaseApplicationGenerator, { type Entity } from '../base-application/index.mjs';
import { GENERATOR_LIQUIBASE, GENERATOR_LIQUIBASE_CHANGELOGS, GENERATOR_BOOTSTRAP_APPLICATION_SERVER } from '../generator-list.mjs';
import { liquibaseFiles } from './files.mjs';
import {
  prepareField as prepareFieldForLiquibase,
  postPrepareEntity,
  relationshipEquals,
  relationshipNeedsForeignKeyRecreationOnly,
  prepareRelationshipForLiquibase,
} from './support/index.mjs';
import { addEntitiesOtherRelationships, prepareEntity as prepareEntityForServer } from '../server/support/index.mjs';
import {
  loadEntitiesOtherSide,
  prepareEntityPrimaryKeyForTemplates,
  prepareRelationship,
  prepareField,
  prepareEntity,
  loadRequiredConfigIntoEntity,
  loadEntitiesAnnotations,
} from '../base-application/support/index.mjs';
import mavenPlugin from './support/maven-plugin.mjs';
import {
  addLiquibaseChangelogCallback,
  addLiquibaseConstraintsChangelogCallback,
  addLiquibaseIncrementalChangelogCallback,
} from './internal/needles.mjs';

export type LiquibaseEntity = Entity & {
  anyRelationshipIsOwnerSide: boolean;
  liquibaseFakeData: Record<string, any>[];
  fakeDataCount: number;
};

const BASE_CHANGELOG = {
  addedFields: [],
  removedFields: [],
  addedRelationships: [],
  removedRelationships: [],
  relationshipsToRecreateForeignKeysOnly: [],
};
export default class LiquibaseGenerator extends BaseApplicationGenerator {
  recreateInitialChangelog: boolean;

  constructor(args: any, options: any, features: any) {
    super(args, options, { skipParseOptions: false, ...features });

    this.argument('entities', {
      description: 'Which entities to generate a new changelog',
      type: Array,
      required: false,
    });

    this.recreateInitialChangelog = this.options.recreateInitialChangelog ?? false;
  }

  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_SERVER);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_LIQUIBASE);
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      checkDatabaseCompatibility({ application }) {
        if (!application.databaseTypeSql && !application.databaseTypeNeo4j) {
          throw new Error(`Database type ${application.databaseType} is not supported`);
        }
      },
      addNeedles({ source, application }) {
        source.addLiquibaseChangelog = changelog =>
          this.editFile(`${application.srcMainResources}config/liquibase/master.xml`, addLiquibaseChangelogCallback(changelog));
        source.addLiquibaseIncrementalChangelog = changelog =>
          this.editFile(`${application.srcMainResources}config/liquibase/master.xml`, addLiquibaseIncrementalChangelogCallback(changelog));
        source.addLiquibaseConstraintsChangelog = changelog =>
          this.editFile(`${application.srcMainResources}config/liquibase/master.xml`, addLiquibaseConstraintsChangelogCallback(changelog));
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareEntityField({ entity, field }) {
        if (!field.transient) {
          prepareFieldForLiquibase(entity, field);
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareEntityRelationship({ entity, relationship }) {
        prepareRelationshipForLiquibase(entity, relationship);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityRelationship);
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      postPrepareEntity({ application, entity }) {
        postPrepareEntity({ application, entity });
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.postPreparingEachEntity);
  }

  get default() {
    return this.asDefaultTaskGroup({
      async calculateChangelogs({ application, entities }) {
        if (!application.databaseTypeSql || this.options.skipDbChangelog) {
          return;
        }
        const entitiesToWrite =
          this.options.entities ?? entities.filter(entity => !entity.builtIn && !entity.skipServer).map(entity => entity.name);
        const diffs = this._generateChangelogFromFiles(application);

        for (const [fieldChanges] of diffs) {
          if (fieldChanges.type === 'entity-new') {
            await this._composeWithIncrementalChangelogProvider(entitiesToWrite, fieldChanges);
          }
          if (fieldChanges.addedFields.length > 0 || fieldChanges.removedFields.length > 0) {
            await this._composeWithIncrementalChangelogProvider(entitiesToWrite, fieldChanges);
          }
        }
        // eslint-disable-next-line no-unused-vars
        for (const [_fieldChanges, relationshipChanges] of diffs) {
          if (
            relationshipChanges &&
            relationshipChanges.incremental &&
            (relationshipChanges.addedRelationships.length > 0 || relationshipChanges.removedRelationships.length > 0)
          ) {
            await this._composeWithIncrementalChangelogProvider(entitiesToWrite, relationshipChanges);
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        const context = {
          ...application,
          recreateInitialChangelog: this.recreateInitialChangelog,
        } as any;
        await this.writeFiles({
          sections: liquibaseFiles,
          context,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      customizeSpring({ source }) {
        source.addLogbackMainLog?.({ name: 'liquibase', level: 'WARN' });
        source.addLogbackMainLog?.({ name: 'LiquibaseSchemaResolver', level: 'INFO' });
        source.addLogbackTestLog?.({ name: 'liquibase', level: 'WARN' });
        source.addLogbackTestLog?.({ name: 'LiquibaseSchemaResolver', level: 'INFO' });
      },
      customizeMaven({ source, application }) {
        if (!application.buildToolMaven) return;
        if (!application.javaDependencies) {
          throw new Error('Some application fields are be mandatory');
        }

        const applicationAny = application as any;
        const databaseTypeProfile = applicationAny.devDatabaseTypeH2Any ? 'prod' : undefined;

        let liquibasePluginHibernateDialect;
        let liquibasePluginJdbcDriver;
        if (applicationAny.devDatabaseTypeH2Any) {
          // eslint-disable-next-line no-template-curly-in-string
          liquibasePluginHibernateDialect = '${liquibase-plugin.hibernate-dialect}';
          // eslint-disable-next-line no-template-curly-in-string
          liquibasePluginJdbcDriver = '${liquibase-plugin.driver}';
          source.addMavenDefinition?.({
            properties: [
              { property: 'liquibase-plugin.hibernate-dialect' },
              { property: 'liquibase-plugin.driver' },
              { inProfile: 'dev', property: 'liquibase-plugin.hibernate-dialect', value: applicationAny.devHibernateDialect },
              { inProfile: 'prod', property: 'liquibase-plugin.hibernate-dialect', value: applicationAny.prodHibernateDialect },
              { inProfile: 'dev', property: 'liquibase-plugin.driver', value: applicationAny.devJdbcDriver },
              { inProfile: 'prod', property: 'liquibase-plugin.driver', value: applicationAny.prodJdbcDriver },
            ],
          });
        } else {
          liquibasePluginHibernateDialect = applicationAny.prodHibernateDialect;
          liquibasePluginJdbcDriver = applicationAny.prodJdbcDriver;
        }

        source.addMavenDefinition?.({
          properties: [
            { inProfile: 'no-liquibase', property: 'profile.no-liquibase', value: ',no-liquibase' },
            { property: 'profile.no-liquibase' },
            { property: 'liquibase.version', value: application.javaDependencies.liquibase },
            { property: 'liquibase-plugin.url' },
            { property: 'liquibase-plugin.username' },
            { property: 'liquibase-plugin.password' },
            { inProfile: 'dev', property: 'liquibase-plugin.url', value: applicationAny.devLiquibaseUrl },
            { inProfile: 'dev', property: 'liquibase-plugin.username', value: applicationAny.devDatabaseUsername },
            { inProfile: 'dev', property: 'liquibase-plugin.password', value: applicationAny.devDatabasePassword },
            { inProfile: 'prod', property: 'liquibase-plugin.url', value: applicationAny.prodLiquibaseUrl },
            { inProfile: 'prod', property: 'liquibase-plugin.username', value: applicationAny.prodDatabaseUsername },
            { inProfile: 'prod', property: 'liquibase-plugin.password', value: applicationAny.prodDatabasePassword },
          ],
          pluginManagement: [
            {
              groupId: 'org.liquibase',
              artifactId: 'liquibase-maven-plugin',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${liquibase.version}',
              additionalContent: mavenPlugin({
                reactive: application.reactive,
                packageName: application.packageName,
                srcMainResources: application.srcMainResources,
                authenticationTypeOauth2: application.authenticationTypeOauth2,
                devDatabaseTypeH2Any: applicationAny.devDatabaseTypeH2Any,
                driver: liquibasePluginJdbcDriver,
                hibernateDialect: liquibasePluginHibernateDialect,
                // eslint-disable-next-line no-template-curly-in-string
                url: '${liquibase-plugin.url}',
                // eslint-disable-next-line no-template-curly-in-string
                username: '${liquibase-plugin.username}',
                // eslint-disable-next-line no-template-curly-in-string
                password: '${liquibase-plugin.password}',
              }),
            },
          ],
          dependencies: [
            {
              groupId: 'org.liquibase',
              artifactId: 'liquibase-core',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${liquibase.version}',
            },
          ],
        });

        if (applicationAny.prodDatabaseTypeMssql) {
          source.addMavenDependency?.({
            inProfile: databaseTypeProfile,
            groupId: 'org.liquibase.ext',
            artifactId: 'liquibase-mssql',
            // eslint-disable-next-line no-template-curly-in-string
            version: '${liquibase.version}',
          });
        }

        if (applicationAny.databaseTypeNeo4j) {
          source.addMavenDependency?.([
            { groupId: 'org.springframework', artifactId: 'spring-jdbc' },
            {
              groupId: 'org.liquibase.ext',
              artifactId: 'liquibase-neo4j',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${liquibase.version}',
            },
          ]);
        }
      },
      injectGradle({ source, application }) {
        if (!application.buildToolGradle) return;
        if (!application.javaDependencies) {
          throw new Error('Some application fields are be mandatory');
        }

        source.addGradleProperty?.({ property: 'liquibaseTaskPrefix', value: 'liquibase' });
        source.addGradleProperty?.({ property: 'liquibasePluginVersion', value: application.javaDependencies['gradle-liquibase'] });
        source.addGradleProperty?.({ property: 'liquibaseVersion', value: application.javaDependencies.liquibase });
        if (application.databaseTypeSql && !application.reactive) {
          source.addGradleProperty?.({ property: 'liquibaseHibernate6Version', value: application.javaDependencies.liquibase });
        }

        source.applyFromGradle?.({ script: 'gradle/liquibase.gradle' });
        source.addGradlePlugin?.({ id: 'org.liquibase.gradle' });
        // eslint-disable-next-line no-template-curly-in-string
        source.addGradlePluginManagement?.({ id: 'org.liquibase.gradle', version: '${liquibasePluginVersion}' });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup(this.delegateTasksToBlueprint(() => this.postWriting));
  }

  /* ======================================================================== */
  /* private methods use within generator                                     */
  /* ======================================================================== */

  _composeWithIncrementalChangelogProvider(entities: any[], databaseChangelog: any) {
    const skipWriting = entities!.length !== 0 && !entities!.includes(databaseChangelog.entityName);
    return this.composeWithJHipster(GENERATOR_LIQUIBASE_CHANGELOGS, {
      generatorOptions: {
        databaseChangelog,
        skipWriting,
      } as any,
    });
  }

  /**
   * Generate changelog from differences between the liquibase entity and current entity.
   */
  _generateChangelogFromFiles(application: any) {
    const oldEntitiesConfig = Object.fromEntries(
      this.getExistingEntityNames()
        .filter(entityName => fs.existsSync(this.getEntityConfigPath(entityName)))
        .map(entityName => [
          entityName,
          { name: entityName, ...JSON.parse(fs.readFileSync(this.getEntityConfigPath(entityName)).toString()) },
        ])
    );

    if (application.generateBuiltInUserEntity) {
      const user = this.sharedData.getEntity('User');
      oldEntitiesConfig.User = user;
    }

    const entities = Object.values(oldEntitiesConfig);
    loadEntitiesAnnotations(entities);
    loadEntitiesOtherSide(entities);
    addEntitiesOtherRelationships(entities);

    for (const entity of entities.filter(entity => !entity.skipServer && !entity.builtIn)) {
      loadRequiredConfigIntoEntity(entity, this.jhipsterConfigWithDefaults);
      prepareEntity(entity, this, application);
      prepareEntityForServer(entity);
      if (!entity.embedded && !entity.primaryKey) {
        prepareEntityPrimaryKeyForTemplates(entity, this);
      }
      for (const field of entity.fields ?? []) {
        prepareField(entity, field, this);
        prepareFieldForLiquibase(entity, field);
      }
      for (const relationship of entity.relationships ?? []) {
        prepareRelationship(entity, relationship, this, true);
        prepareRelationshipForLiquibase(entity, relationship);
      }
      postPrepareEntity({ application, entity });
    }

    // Compare entity changes and create changelogs
    return this.getExistingEntityNames().map(entityName => {
      const newConfig: any = this.sharedData.getEntity(entityName);
      const newFields: any[] = (newConfig.fields || []).filter((field: any) => !field.transient);
      const newRelationships: any[] = newConfig.relationships || [];

      if (
        this.recreateInitialChangelog ||
        !application.incrementalChangelog ||
        !oldEntitiesConfig[entityName] ||
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

      const oldConfig: any = oldEntitiesConfig[entityName];

      const oldFields: any[] = (oldConfig.fields || []).filter((field: any) => !field.transient);
      const oldFieldNames: string[] = oldFields.filter(field => !field.id).map(field => field.fieldName);
      const newFieldNames: string[] = newFields.filter(field => !field.id).map(field => field.fieldName);

      // Calculate new fields
      const addedFieldNames = newFieldNames.filter(fieldName => !oldFieldNames.includes(fieldName));
      const addedFields = addedFieldNames.map(fieldName => newFields.find(field => fieldName === field.fieldName));
      // Calculate removed fields
      const removedFieldNames = oldFieldNames.filter(fieldName => !newFieldNames.includes(fieldName));
      const removedFields = removedFieldNames.map(fieldName => oldFields.find(field => fieldName === field.fieldName));

      const oldRelationships: any[] = oldConfig.relationships || [];

      // Calculate changed/newly added relationships
      const addedRelationships = newRelationships.filter(
        newRelationship =>
          // id changes are not supported
          !newRelationship.id &&
          // check if the same relationship wasn't already part of the old config
          !oldRelationships.some(oldRelationship => relationshipEquals(oldRelationship, newRelationship))
      );

      // Calculate to be removed relationships
      const removedRelationships = oldRelationships.filter(
        oldRelationship =>
          // id changes are not supported
          !oldRelationship.id &&
          // check if there are relationships not anymore in the new config
          !newRelationships.some(newRelationship => relationshipEquals(newRelationship, oldRelationship))
      );

      // calcualte relationships that only need a foreign key recreation from the ones that are added
      // we need both the added and the removed ones here
      const relationshipsToRecreateForeignKeysOnly = addedRelationships
        .filter(addedRelationship =>
          removedRelationships.some(removedRelationship =>
            relationshipNeedsForeignKeyRecreationOnly(removedRelationship, addedRelationship)
          )
        )
        .concat(
          removedRelationships.filter(removedRelationship =>
            addedRelationships.some(addedRelationship => relationshipNeedsForeignKeyRecreationOnly(addedRelationship, removedRelationship))
          )
        );

      return [
        { ...BASE_CHANGELOG, incremental: true, type: 'entity-update', entityName, addedFields, removedFields },
        {
          ...BASE_CHANGELOG,
          incremental: true,
          type: 'entity-update',
          entityName,
          addedRelationships,
          removedRelationships,
          relationshipsToRecreateForeignKeysOnly,
        },
      ];
    });
  }
}
