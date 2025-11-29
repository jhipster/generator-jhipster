/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import fs from 'node:fs';

import { escape, min } from 'lodash-es';

import { fieldTypes } from '../../lib/jhipster/index.ts';
import type { EntityAll } from '../../lib/types/application-all.d.ts';
import { mutateData } from '../../lib/utils/object.ts';
import {
  mutateRelationship as mutateBaseApplicationRelationship,
  mutateRelationshipWithEntity as mutateBaseApplicationRelationshipWithEntity,
} from '../base-application/entity.ts';
import {
  loadRequiredConfigIntoEntity,
  prepareCommonFieldForTemplates,
  prepareEntity,
  prepareEntityPrimaryKeyForTemplates,
  prepareRelationship,
} from '../base-application/support/index.ts';
import type {
  Application as BaseApplicationApplication,
  DerivedField,
  Entity as BaseApplicationEntity,
} from '../base-application/types.ts';
import BaseEntityChangesGenerator from '../base-entity-changes/index.ts';
import type { BaseChangelog } from '../base-entity-changes/types.ts';
import { mutateField as commonMutateField } from '../common/entity.ts';
import type { Entity as CommonEntity, Field as CommonField } from '../common/types.ts';
import { prepareEntity as prepareEntityForServer } from '../java/support/index.ts';
import type { MavenProperty } from '../java-simple-application/generators/maven/types.ts';
import { getFKConstraintName, getUXConstraintName, prepareField as prepareServerFieldForTemplates } from '../server/support/index.ts';
import type { Entity as ServerEntity } from '../server/types.ts';
import type { Source as SpringBootSource } from '../spring-boot/index.ts';
import { prepareSqlApplicationProperties } from '../spring-data/generators/relational/support/index.ts';
import type { Application as SpringDataRelationalApplication } from '../spring-data/generators/relational/types.ts';

import { addEntityFiles, fakeFiles, updateConstraintsFiles, updateEntityFiles, updateMigrateFiles } from './changelog-files.ts';
import { liquibaseFiles } from './files.ts';
import {
  addLiquibaseChangelogCallback,
  addLiquibaseConstraintsChangelogCallback,
  addLiquibaseIncrementalChangelogCallback,
} from './internal/needles.ts';
import { checkAndReturnRelationshipOnValue } from './internal/relationship-on-handler-options.ts';
import {
  liquibaseComment,
  postPrepareEntity,
  prepareField as prepareFieldForLiquibase,
  prepareRelationshipForLiquibase,
} from './support/index.ts';
import mavenPlugin from './support/maven-plugin.ts';
import type {
  Application as LiquibaseApplication,
  Config as LiquibaseConfig,
  Entity as LiquibaseEntity,
  Features as LiquibaseFeatures,
  Field as LiquibaseField,
  Options as LiquibaseOptions,
  Source as LiquibaseSource,
} from './types.ts';

const {
  CommonDBTypes: { LONG: TYPE_LONG, INTEGER: TYPE_INTEGER },
} = fieldTypes;

export default class LiquibaseGenerator<
  Entity extends LiquibaseEntity = LiquibaseEntity<LiquibaseField>,
  Application extends LiquibaseApplication<Entity> = LiquibaseApplication<Entity>,
> extends BaseEntityChangesGenerator<Entity, Application, LiquibaseConfig, LiquibaseOptions, LiquibaseSource, LiquibaseFeatures> {
  numberOfRows!: number;
  databaseChangelogs: BaseChangelog<Entity>[] = [];
  injectBuildTool = true;
  injectLogs = true;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('java');
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ application }) {
        this.numberOfRows = 10;
        application.liquibaseDefaultSchemaName = '';
        // Generate h2 properties at master.xml for blueprints that uses h2 for tests or others purposes.
        application.liquibaseAddH2Properties ??= application.devDatabaseTypeH2Any;
      },
      checkDatabaseCompatibility({ application }) {
        if (!application.databaseTypeSql && !application.databaseTypeNeo4j) {
          throw new Error(`Database type ${application.databaseType} is not supported`);
        }

        if (!application.databaseTypeSql) {
          // Add sql related derived properties
          // TODO fix types
          prepareSqlApplicationProperties({ application: application as any });
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

  get [BaseEntityChangesGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntityField() {
    return this.asPreparingEachEntityFieldTaskGroup({
      prepareEntityField({ application, field }) {
        if (!field.transient) {
          prepareFieldForLiquibase(application, field);
        }
      },
      validateConsistencyOfField({ entity, field }) {
        if (field.columnRequired && field.liquibaseDefaultValueAttributeValue) {
          this.handleCheckFailure(
            `The field ${field.fieldName} in entity ${entity.name} has both columnRequired and a defaultValue, this can lead to unexpected behaviors.`,
          );
        }
      },
    });
  }

  get [BaseEntityChangesGenerator.PREPARING_EACH_ENTITY_FIELD]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityField);
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({
      prepareEntityRelationship({ application, entity, relationship }) {
        prepareRelationshipForLiquibase({ application, entity, relationship });
        relationship.onDelete = checkAndReturnRelationshipOnValue(relationship.onDelete, this);
        relationship.onUpdate = checkAndReturnRelationshipOnValue(relationship.onUpdate, this);
      },
    });
  }

  get [BaseEntityChangesGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntityRelationship);
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      postPrepareEntity,
    });
  }

  get [BaseEntityChangesGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.postPreparingEachEntity);
  }

  get default() {
    return this.asDefaultTaskGroup({
      async calculateChangelogs({ application, entities, entityChanges }) {
        if (!application.databaseTypeSql || this.options.skipDbChangelog || !entityChanges) {
          return;
        }

        for (const databaseChangelog of entityChanges) {
          if (!databaseChangelog.newEntity) {
            // Previous entities are not prepared using default jhipster priorities.
            // Prepare them.
            const entity = databaseChangelog.previousEntity!;
            loadRequiredConfigIntoEntity(
              entity as unknown as ServerEntity,
              this.jhipsterConfigWithDefaults as BaseApplicationApplication<BaseApplicationEntity>,
            );
            // TODO fix types
            prepareEntity(entity as unknown as CommonEntity, this);
            // TODO fix types
            prepareEntityForServer(entity, application as any);
            if (!entity.embedded && !entity.primaryKey) {
              prepareEntityPrimaryKeyForTemplates.call(this, { entity: entity as unknown as EntityAll, application });
            }
            for (const field of entity.fields ?? []) {
              prepareCommonFieldForTemplates(entity, field, this);
              mutateData(field as CommonField, commonMutateField);
              prepareServerFieldForTemplates(application as any, entity as unknown as ServerEntity, field as any, this);
              prepareFieldForLiquibase(application, field);
            }
          }
        }

        for (const databaseChangelog of entityChanges) {
          if (!databaseChangelog.newEntity) {
            // Previous entities are not prepared using default jhipster priorities.
            // Prepare them.
            const entity = databaseChangelog.previousEntity!;
            for (const relationship of entity.relationships ?? []) {
              mutateData(relationship, mutateBaseApplicationRelationship, mutateBaseApplicationRelationshipWithEntity);
              prepareRelationship.call(this, entity, relationship, true);
              prepareRelationshipForLiquibase({ application, entity, relationship });
            }
            postPrepareEntity.call(this, { application, entity } as any);
          }
        }

        const entitiesToWrite =
          this.options.entities ?? entities.filter(entity => !entity.builtIn && !entity.skipServer).map(entity => entity.name);
        // Write only specified entities changelogs.
        const changes = entityChanges.filter(
          databaseChangelog => entitiesToWrite.length === 0 || entitiesToWrite.includes(databaseChangelog.entityName),
        );

        for (const databaseChangelog of changes) {
          if (databaseChangelog.newEntity) {
            this.databaseChangelogs.push(
              this.prepareChangelog({
                databaseChangelog: {
                  ...databaseChangelog,
                  changelogData: { ...databaseChangelog.changelogData! },
                },
                application,
              })!,
            );
          } else if (databaseChangelog.addedFields.length > 0 || databaseChangelog.removedFields.length > 0) {
            this.databaseChangelogs.push(
              this.prepareChangelog({
                databaseChangelog: {
                  ...databaseChangelog,
                  changelogData: { ...databaseChangelog.changelogData! },
                  fieldChangelog: true,
                  addedRelationships: [],
                  removedRelationships: [],
                  removedDefaultValueFields: [],
                  addedDefaultValueFields: [],
                  relationshipsToRecreateForeignKeysOnly: [],
                },
                application,
              })!,
            );
          }
        }
        // Relationships needs to be added later to make sure every related field is already added.
        for (const databaseChangelog of changes) {
          if (
            databaseChangelog.incremental &&
            (databaseChangelog.addedRelationships.length > 0 ||
              databaseChangelog.removedRelationships.length > 0 ||
              databaseChangelog.removedDefaultValueFields.length > 0 ||
              databaseChangelog.addedDefaultValueFields.length > 0)
          ) {
            this.databaseChangelogs.push(
              this.prepareChangelog({
                databaseChangelog: {
                  ...databaseChangelog,
                  changelogData: { ...databaseChangelog.changelogData! },
                  relationshipChangelog: true,
                  addedFields: [],
                  removedFields: [],
                },
                application,
              })!,
            );
          }
        }
        this.databaseChangelogs = this.databaseChangelogs.filter(Boolean);
      },
    });
  }

  get [BaseEntityChangesGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        await this.writeFiles({
          sections: liquibaseFiles,
          context: {
            ...application,
            recreateInitialChangelog: this.recreateInitialChangelog,
          },
        });
      },
    });
  }

  get [BaseEntityChangesGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      writeChangelogs() {
        return Promise.all(this.databaseChangelogs.map(databaseChangelog => this.writeChangelog({ databaseChangelog })));
      },
    });
  }

  get [BaseEntityChangesGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      customizeSpringLogs({ source }) {
        if (!this.injectLogs) return;
        source.addMainLog?.({ name: 'liquibase', level: 'WARN' });
        source.addMainLog?.({ name: 'LiquibaseSchemaResolver', level: 'INFO' });
        source.addTestLog?.({ name: 'liquibase', level: 'WARN' });
        source.addTestLog?.({ name: 'LiquibaseSchemaResolver', level: 'INFO' });
      },
      customizeApplicationProperties({ source, application }) {
        if (application.databaseTypeSql && !application.reactive) {
          (source as SpringBootSource).addApplicationPropertiesClass?.({
            propertyType: 'Liquibase',
            classStructure: { asyncStart: ['Boolean', 'true'] },
          });
        }
      },
      customizeMaven({ source, application }) {
        if (!application.buildToolMaven || !this.injectBuildTool) return;
        if (!application.javaDependencies) {
          throw new Error('Some application fields are be mandatory');
        }

        const { javaDependencies } = application;
        const shouldAddProperty = (property: string, value: string) => {
          return value && !source.hasJavaProperty?.(property) && application.javaManagedProperties![property] !== value;
        };
        const checkProperty = (property: string) => {
          if (!source.hasJavaManagedProperty?.(property) && !source.hasJavaProperty?.(property)) {
            const message = `${property} is required by maven-liquibase-plugin, make sure to add it to your pom.xml`;
            if (this.skipChecks) {
              this.log.warn(message);
            } else {
              throw new Error(message);
            }
          }
        };

        const { 'jakarta-validation': validationVersion, h2: h2Version, liquibase: liquibaseVersion } = javaDependencies;

        const relationalApplication = application as SpringDataRelationalApplication;
        const databaseTypeProfile = relationalApplication.devDatabaseTypeH2Any ? 'prod' : undefined;

        let liquibasePluginHibernateDialect;
        let liquibasePluginJdbcDriver;
        const mavenProperties: MavenProperty[] = [];
        if (relationalApplication.devDatabaseTypeH2Any) {
          // eslint-disable-next-line no-template-curly-in-string
          liquibasePluginHibernateDialect = '${liquibase-plugin.hibernate-dialect}';
          // eslint-disable-next-line no-template-curly-in-string
          liquibasePluginJdbcDriver = '${liquibase-plugin.driver}';
          if (shouldAddProperty('h2.version', h2Version)) {
            mavenProperties.push({ property: 'h2.version', value: h2Version });
          } else {
            checkProperty('h2.version');
          }
          mavenProperties.push(
            { property: 'liquibase-plugin.hibernate-dialect' },
            { property: 'liquibase-plugin.driver' },
            { inProfile: 'dev', property: 'liquibase-plugin.hibernate-dialect', value: relationalApplication.devHibernateDialect },
            { inProfile: 'prod', property: 'liquibase-plugin.hibernate-dialect', value: relationalApplication.prodHibernateDialect },
            { inProfile: 'dev', property: 'liquibase-plugin.driver', value: relationalApplication.devJdbcDriver },
            { inProfile: 'prod', property: 'liquibase-plugin.driver', value: relationalApplication.prodJdbcDriver },
          );
        } else {
          liquibasePluginHibernateDialect = relationalApplication.prodHibernateDialect;
          liquibasePluginJdbcDriver = relationalApplication.prodJdbcDriver;
        }

        if (shouldAddProperty('jakarta-validation.version', validationVersion)) {
          mavenProperties.push({ property: 'jakarta-validation.version', value: validationVersion });
        } else {
          checkProperty('jakarta-validation.version');
        }

        if (shouldAddProperty('liquibase.version', liquibaseVersion)) {
          mavenProperties.push({ property: 'liquibase.version', value: liquibaseVersion });
        } else {
          checkProperty('liquibase.version');
        }

        source.addMavenDefinition?.({
          properties: [
            ...mavenProperties,
            { inProfile: 'no-liquibase', property: 'profile.no-liquibase', value: ',no-liquibase' },
            { property: 'profile.no-liquibase' },
            { property: 'liquibase-plugin.url' },
            { property: 'liquibase-plugin.username' },
            { property: 'liquibase-plugin.password' },
            { inProfile: 'dev', property: 'liquibase-plugin.url', value: relationalApplication.devLiquibaseUrl },
            { inProfile: 'dev', property: 'liquibase-plugin.username', value: relationalApplication.devDatabaseUsername },
            { inProfile: 'dev', property: 'liquibase-plugin.password', value: relationalApplication.devDatabasePassword },
            { inProfile: 'prod', property: 'liquibase-plugin.url', value: relationalApplication.prodLiquibaseUrl },
            { inProfile: 'prod', property: 'liquibase-plugin.username', value: relationalApplication.prodDatabaseUsername },
            { inProfile: 'prod', property: 'liquibase-plugin.password', value: relationalApplication.prodDatabasePassword },
          ],
          pluginManagement: [
            {
              groupId: 'org.liquibase',
              artifactId: 'liquibase-maven-plugin',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${liquibase.version}',
              additionalContent: mavenPlugin({
                backendTypeSpringBoot: application.backendTypeSpringBoot!,
                hibernateNamingPhysicalStrategy: application.hibernateNamingPhysicalStrategy,
                hibernateNamingImplicitStrategy: application.hibernateNamingImplicitStrategy,
                packageName: application.packageName!,
                srcMainResources: application.srcMainResources,
                authenticationTypeOauth2: application.authenticationTypeOauth2,
                devDatabaseTypeH2Any: relationalApplication.devDatabaseTypeH2Any!,
                driver: liquibasePluginJdbcDriver!,
                hibernateDialect: liquibasePluginHibernateDialect!,
                defaultSchemaName: application.liquibaseDefaultSchemaName,
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

        if (relationalApplication.prodDatabaseTypeMssql) {
          source.addMavenDependency?.({
            inProfile: databaseTypeProfile,
            groupId: 'org.liquibase.ext',
            artifactId: 'liquibase-mssql',
            // eslint-disable-next-line no-template-curly-in-string
            version: '${liquibase.version}',
          });
        }

        if (relationalApplication.databaseTypeNeo4j) {
          if (relationalApplication.backendTypeSpringBoot) {
            source.addMavenDependency?.([{ groupId: 'org.springframework', artifactId: 'spring-jdbc' }]);
          }
          source.addMavenDependency?.([
            {
              groupId: 'org.liquibase.ext',
              artifactId: 'liquibase-neo4j',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${liquibase.version}',
              // Exclude current neo4j driver and use the one provided by spring-data
              // See: https://github.com/jhipster/generator-jhipster/pull/24241
              additionalContent: `
              <exclusions>
                  <exclusion>
                      <groupId>org.neo4j.driver</groupId>
                      <artifactId>neo4j-java-driver</artifactId>
                  </exclusion>
                  <exclusion>
                      <groupId>org.slf4j</groupId>
                      <artifactId>*</artifactId>
                  </exclusion>
              </exclusions>`,
            },
          ]);
        }
      },
      injectGradle({ source, application }) {
        if (!application.buildToolGradle || !this.injectBuildTool) return;
        if (!application.javaDependencies) {
          throw new Error('Some application fields are be mandatory');
        }

        const { liquibase: liquibaseVersion, 'gradle-liquibase': gradleLiquibaseVersion } = application.javaDependencies;
        if (!liquibaseVersion) {
          this.log.warn('liquibaseVersion is required by gradle-liquibase-plugin, make sure to add it to your dependencies');
        } else {
          source.addGradleProperty?.({ property: 'liquibaseVersion', value: liquibaseVersion });
        }

        source.addGradleProperty?.({ property: 'liquibaseTaskPrefix', value: 'liquibase' });
        source.addGradleProperty?.({ property: 'liquibasePluginVersion', value: gradleLiquibaseVersion });

        source.applyFromGradle?.({ script: 'gradle/liquibase.gradle' });
        source.addGradlePlugin?.({ id: 'org.liquibase.gradle' });
        // eslint-disable-next-line no-template-curly-in-string
        source.addGradlePluginManagement?.({ id: 'org.liquibase.gradle', version: '${liquibasePluginVersion}' });

        if (application.databaseTypeSql && !application.reactive) {
          source.addGradleDependency?.(
            {
              scope: 'liquibaseRuntime',
              groupId: 'org.liquibase.ext',
              artifactId: 'liquibase-hibernate6',
              // eslint-disable-next-line no-template-curly-in-string
              version: liquibaseVersion ? '${liquibaseVersion}' : "${dependencyManagement.importedProperties['liquibase.version']}",
            },
            { gradleFile: 'gradle/liquibase.gradle' },
          );
        }
      },
      nativeHints({ source, application }) {
        if (!application.graalvmSupport) return;
        // Latest liquibase version supported by Reachability Repository is 4.23.0
        // Hints may be dropped if newer version is supported
        // https://github.com/oracle/graalvm-reachability-metadata/blob/master/metadata/org.liquibase/liquibase-core/index.json
        (source as SpringBootSource).addNativeHint!({
          resources: ['config/liquibase/**'],
          declaredConstructors: [
            'liquibase.database.LiquibaseTableNamesFactory.class',
            'liquibase.report.ShowSummaryGeneratorFactory.class',
            'liquibase.changelog.FastCheckService.class',
            'liquibase.changelog.visitor.ValidatingVisitorGeneratorFactory.class',
          ],
          publicConstructors: ['liquibase.ui.LoggerUIService.class'],
        });
      },
    });
  }

  get [BaseEntityChangesGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      postWriteChangelogs({ source }) {
        return Promise.all(
          this.databaseChangelogs.map(databaseChangelog => {
            const { entity, changelogData } = databaseChangelog;
            if (entity.skipServer) {
              return undefined;
            }

            if (databaseChangelog.newEntity) {
              return this._addLiquibaseFilesReferences({ entity, databaseChangelog, source });
            }
            if (changelogData!.requiresUpdateChangelogs) {
              return this._addUpdateFilesReferences({ entity, databaseChangelog, changelogData, source });
            }
            return undefined;
          }),
        );
      },
    });
  }

  get [BaseEntityChangesGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }

  /* ======================================================================== */
  /* private methods use within generator                                     */
  /* ======================================================================== */

  override isChangelogNew({ entityName, changelogDate }: { entityName: string; changelogDate: string }): boolean {
    return !fs.existsSync(
      this.destinationPath(`src/main/resources/config/liquibase/changelog/${changelogDate}_added_entity_${entityName}.xml`),
    );
  }

  /**
   * Write files for new entities.
   */
  _writeLiquibaseFiles({ context: writeContext, changelogData }: { context: any; changelogData: any }) {
    const promises: any[] = [];
    const context = {
      ...writeContext,
      skipFakeData: changelogData.skipFakeData,
      fields: changelogData.allFields,
      allFields: changelogData.allFields,
      relationships: changelogData.relationships,
    };
    // Write initial liquibase files
    promises.push(this.writeFiles({ sections: addEntityFiles, context }));
    if (!changelogData.skipFakeData) {
      promises.push(this.writeFiles({ sections: fakeFiles, context }));
    }

    return Promise.all(promises);
  }

  /**
   * Write files for new entities.
   */
  _addLiquibaseFilesReferences({
    entity,
    databaseChangelog,
    source,
  }: {
    entity: Entity;
    databaseChangelog: BaseChangelog<Entity>;
    source: LiquibaseSource;
  }) {
    const fileName = `${databaseChangelog.changelogDate}_added_entity_${entity.entityClass}`;
    source.addLiquibaseChangelog!({ changelogName: fileName, section: entity.incremental ? 'incremental' : 'base' });

    if (entity.anyRelationshipIsOwnerSide) {
      const constFileName = `${databaseChangelog.changelogDate}_added_entity_constraints_${entity.entityClass}`;
      source.addLiquibaseChangelog!({ changelogName: constFileName, section: entity.incremental ? 'incremental' : 'constraints' });
    }
  }

  /**
   * Write files for updated entities.
   */
  _writeUpdateFiles({ context: writeContext, changelogData }: { context: any; changelogData: any }) {
    const {
      addedFields,
      allFields,
      removedFields,
      addedRelationships,
      removedRelationships,
      hasFieldConstraint,
      hasRelationshipConstraint,
      shouldWriteAnyRelationship,
      relationshipsToRecreateForeignKeysOnly,
      hasDefaultValueChange,
      removedDefaultValueFields,
      addedDefaultValueFields,
    } = changelogData;

    const context = {
      ...writeContext,
      skipFakeData: changelogData.skipFakeData,
      addedFields,
      removedFields,
      fields: addedFields,
      allFields,
      hasFieldConstraint,
      addedRelationships,
      removedRelationships,
      relationships: addedRelationships,
      hasRelationshipConstraint,
      shouldWriteAnyRelationship,
      relationshipsToRecreateForeignKeysOnly,
      hasDefaultValueChange,
      removedDefaultValueFields,
      addedDefaultValueFields,
    };

    const promises: Promise<any>[] = [];
    if (this._isBasicEntityUpdate(changelogData)) {
      promises.push(this.writeFiles({ sections: updateEntityFiles, context }));
    }

    if (this._requiresWritingFakeData(changelogData)) {
      promises.push(this.writeFiles({ sections: fakeFiles, context }));
      promises.push(this.writeFiles({ sections: updateMigrateFiles, context }));
    }

    if (this._requiresConstraintUpdates(changelogData)) {
      promises.push(this.writeFiles({ sections: updateConstraintsFiles, context }));
    }
    return Promise.all(promises);
  }

  private _requiresConstraintUpdates(changelogData: any) {
    return changelogData.hasFieldConstraint || changelogData.addedRelationships.length > 0 || changelogData.hasDefaultValueChange;
  }

  private _isBasicEntityUpdate(changelogData: any) {
    return changelogData.addedFields.length > 0 || changelogData.removedFields.length > 0 || changelogData.shouldWriteAnyRelationship;
  }

  private _requiresWritingFakeData(changelogData: any) {
    return !changelogData.skipFakeData && (changelogData.addedFields.length || changelogData.addedRelationships.length);
  }

  /**
   * Write files for updated entities.
   */
  _addUpdateFilesReferences({
    entity,
    databaseChangelog,
    changelogData,
    source,
  }: {
    entity: Entity;
    databaseChangelog: BaseChangelog<Entity>;
    changelogData: any;
    source: LiquibaseSource;
  }) {
    if (this._isBasicEntityUpdate(changelogData)) {
      source.addLiquibaseIncrementalChangelog!({
        changelogName: `${databaseChangelog.changelogDate}_updated_entity_${entity.entityClass}`,
      });
    }

    if (this._requiresWritingFakeData(changelogData)) {
      source.addLiquibaseIncrementalChangelog!({
        changelogName: `${databaseChangelog.changelogDate}_updated_entity_migrate_${entity.entityClass}`,
      });
    }

    if (this._requiresConstraintUpdates(changelogData)) {
      source.addLiquibaseIncrementalChangelog!({
        changelogName: `${databaseChangelog.changelogDate}_updated_entity_constraints_${entity.entityClass}`,
      });
    }
  }

  /**
   * @private
   * Format As Liquibase Remarks
   *
   * @param {string} text - text to format
   * @param {boolean} addRemarksTag - add remarks tag
   * @returns formatted liquibase remarks
   */
  formatAsLiquibaseRemarks(text: string, addRemarksTag = false) {
    return liquibaseComment(text, addRemarksTag);
  }

  /**
   * @private
   * Create the fitting liquibase default value attribute for a field.
   * @param field
   * @param leadingWhitespace
   * @returns
   */
  createDefaultValueLiquibaseAttribute(field: LiquibaseField, leadingWhitespace = false) {
    if (field.liquibaseDefaultValueAttributeValue === undefined) {
      return '';
    }

    return `${leadingWhitespace ? ' ' : ''}${field.liquibaseDefaultValueAttributeName}="${escape(field.liquibaseDefaultValueAttributeValue)}"`;
  }

  prepareChangelog({ databaseChangelog, application }: { databaseChangelog: BaseChangelog<Entity>; application: Application }) {
    if (!databaseChangelog.changelogDate) {
      databaseChangelog.changelogDate = this.nextTimestamp();
    }
    const entity = databaseChangelog.entity;

    if (entity.skipServer) {
      return undefined;
    }

    const entityChanges = databaseChangelog.changelogData!;
    entityChanges.skipFakeData = application.skipFakeData || entity.skipFakeData;

    entityChanges.allFields = entity.fields.filter(field => !field.transient);

    if (databaseChangelog.newEntity) {
      entityChanges.fields = entityChanges.allFields;
    } else {
      entityChanges.addedFields = databaseChangelog.addedFields.filter(field => !field.transient);
      entityChanges.removedFields = databaseChangelog.removedFields.filter(field => !field.transient);
    }

    const seed = `${entity.entityClass}-liquibase`;
    this.resetEntitiesFakeData(seed);

    entity.liquibaseFakeData = [];

    // fakeDataCount must be limited to the size of required unique relationships.
    Object.defineProperty(entity, 'fakeDataCount', {
      get: () => {
        const uniqueRelationships = entity.relationships.filter(rel => rel.unique && (rel.columnRequired || rel.id));
        return min([entity.liquibaseFakeData.length, ...uniqueRelationships.map(rel => rel.otherEntity.fakeDataCount)]);
      },
      configurable: true,
    });

    for (let rowNumber = 0; rowNumber < this.numberOfRows; rowNumber++) {
      const rowData: Record<string, any> = {};
      const fields: LiquibaseField[] = databaseChangelog.newEntity
        ? // generate id fields first to improve reproducibility
          [...entityChanges.fields.filter(f => f.id), ...entityChanges.fields.filter(f => !f.id)]
        : [...entityChanges.allFields.filter(f => f.id), ...entityChanges.addedFields.filter(f => !f.id)];
      fields.forEach(field => {
        if ('derived' in field && field.derived) {
          const derivedField = field as DerivedField<LiquibaseEntity, LiquibaseField>;
          Object.defineProperty(rowData, field.fieldName, {
            get: () => {
              if (!derivedField.derivedEntity.liquibaseFakeData || rowNumber >= derivedField.derivedEntity.liquibaseFakeData.length) {
                return undefined;
              }
              return derivedField.derivedEntity.liquibaseFakeData[rowNumber][field.fieldName];
            },
          });
          return;
        }
        let data;
        if (field.id && ([TYPE_INTEGER, TYPE_LONG] as string[]).includes(field.fieldType)) {
          data = rowNumber + 1;
        } else {
          data = field.generateFakeData!();
        }
        rowData[field.fieldName] = data;
      });

      entity.liquibaseFakeData.push(rowData);
    }

    if (databaseChangelog.newEntity) {
      entityChanges.relationships = entity.relationships;
    } else {
      entityChanges.addedRelationships = databaseChangelog.addedRelationships;
      entityChanges.removedRelationships = databaseChangelog.removedRelationships;
      entityChanges.relationshipsToRecreateForeignKeysOnly = databaseChangelog.relationshipsToRecreateForeignKeysOnly;
      entityChanges.removedDefaultValueFields = databaseChangelog.removedDefaultValueFields;
      entityChanges.addedDefaultValueFields = databaseChangelog.addedDefaultValueFields;
    }

    const { prodDatabaseType, databaseType, authenticationType, jhiPrefix } = entity as any;
    /* Required by the templates */
    databaseChangelog.writeContext = {
      entity,
      databaseChangelog: databaseChangelog as any,
      changelogDate: databaseChangelog.changelogDate,
      databaseType,
      prodDatabaseType,
      authenticationType,
      jhiPrefix,
      reactive: application.reactive,
      incrementalChangelog: application.incrementalChangelog,
      recreateInitialChangelog: this.recreateInitialChangelog,
    };

    if (databaseChangelog.newEntity) {
      return databaseChangelog;
    }

    entityChanges.requiresUpdateChangelogs =
      entityChanges.addedFields.length > 0 ||
      entityChanges.removedFields.length > 0 ||
      entityChanges.addedRelationships.some(relationship => relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable) ||
      entityChanges.removedRelationships.some(relationship => relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable) ||
      entityChanges.addedDefaultValueFields.length > 0 ||
      entityChanges.removedDefaultValueFields.length > 0;

    if (entityChanges.requiresUpdateChangelogs) {
      entityChanges.hasFieldConstraint = entityChanges.addedFields.some(
        field => field.unique || (field.columnRequired && !field.liquibaseDefaultValueAttributeValue) || field.shouldCreateContentType,
      );
      entityChanges.hasDefaultValueChange =
        entityChanges.addedDefaultValueFields.length > 0 || entityChanges.removedDefaultValueFields.length > 0;
      entityChanges.hasRelationshipConstraint = entityChanges.addedRelationships.some(
        relationship =>
          (relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable) && (relationship.unique || !relationship.nullable),
      );
      entityChanges.shouldWriteAnyRelationship =
        entityChanges.addedRelationships.some(relationship => relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable) ||
        entityChanges.removedRelationships.some(relationship => relationship.shouldWriteRelationship || relationship.shouldWriteJoinTable);
    }

    return databaseChangelog;
  }

  writeChangelog({ databaseChangelog }: { databaseChangelog: BaseChangelog<Entity> }): Promise<any[]> | undefined {
    const { writeContext: context, changelogData } = databaseChangelog;
    if (databaseChangelog.newEntity) {
      return this._writeLiquibaseFiles({ context, changelogData });
    }
    if (changelogData!.requiresUpdateChangelogs) {
      return this._writeUpdateFiles({ context, changelogData });
    }
    return undefined;
  }

  /**
   * @private
   * get a foreign key constraint name for tables in JHipster preferred style.
   *
   * @param {string} entityName - name of the entity
   * @param {string} relationshipName - name of the related entity
   * @param {string} prodDatabaseType - database type
   * @param {boolean} noSnakeCase - do not convert names to snakecase
   */
  getFKConstraintName(entityName: string, relationshipName: string, prodDatabaseType: string, noSnakeCase: boolean): string {
    const result = getFKConstraintName(entityName, relationshipName, { prodDatabaseType, noSnakeCase });
    this.validateResult(result);
    return result.value;
  }

  /**
   * @private
   * get a unique constraint name for tables in JHipster preferred style.
   *
   * @param {string} entityName - name of the entity
   * @param {string} columnName - name of the column
   * @param {string} prodDatabaseType - database type
   * @param {boolean} noSnakeCase - do not convert names to snakecase
   */
  getUXConstraintName(entityName: string, columnName: string, prodDatabaseType: string, noSnakeCase: boolean): string {
    const result = getUXConstraintName(entityName, columnName, { prodDatabaseType, noSnakeCase });
    this.validateResult(result);
    return result.value;
  }
}
