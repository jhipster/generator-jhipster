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
import chalk from 'chalk';
import _ from 'lodash';
import { isFilePending } from 'mem-fs-editor/state';

import { relative } from 'path';
import BaseApplicationGenerator from '../base-application/index.mjs';
import { fieldTypes, clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';
import { GENERATOR_VUE, GENERATOR_CLIENT, GENERATOR_LANGUAGES } from '../generator-list.mjs';
import { writeEntityFiles, postWriteEntityFiles } from './entity-files-vue.mjs';
import cleanupOldFilesTask from './cleanup.mjs';
import { writeFiles, writeEntitiesFiles } from './files-vue.mjs';
import {
  generateEntityClientEnumImports as getClientEnumImportsFormat,
  generateEntityClientFields as getHydratedEntityClientFields,
  generateEntityClientImports as formatEntityClientImports,
  generateTestEntityId as getTestEntityId,
  getTypescriptKeyType as getTSKeyType,
} from '../client/support/index.mjs';
import { convertTranslationsSupport, isTranslatedVueFile, translateVueFilesTransform } from './support/index.mjs';

const { CommonDBTypes } = fieldTypes;
const { VUE } = clientFrameworkTypes;
const TYPE_BOOLEAN = CommonDBTypes.BOOLEAN;

export default class VueGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_CLIENT);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_VUE);
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        await this.composeWithJHipster(GENERATOR_LANGUAGES);
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadPackageJson({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster(GENERATOR_VUE, 'resources', 'package.json')
        );
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareForTemplates({ application }) {
        application.clientWebappDir = `${application.clientSrcDir}app/`;
        application.webappEnumerationsDir = `${application.clientWebappDir}shared/model/enumerations/`;
        application.clientSpecDir = `${application.clientTestDir}spec/`;

        // Can be dropped if tests are moved near implementation
        application.applicationRootRelativeToClientTestDir = `${relative(application.clientSpecDir, '.')}/`;
        application.clientSrcDirRelativeToClientTestDir = `${relative(application.clientSpecDir, application.clientWebappDir)}/`;
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get preparingEachEntity() {
    return this.asPreparingEachEntityTaskGroup({
      prepareEntityForTemplates({ entity }) {
        // Can be dropped if tests are moved near implementation
        entity.relativeToEntityFolderName = relative(entity.entityFolderName, '.');
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY]() {
    return this.delegateTasksToBlueprint(() => this.preparingEachEntity);
  }

  get writing() {
    return this.asWritingTaskGroup({
      cleanupOldFilesTask,
      writeFiles,
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      writeEntitiesFiles,
      writeEntityFiles,
      async queueTranslateTransform({ control, application }) {
        const { enableTranslation, clientSrcDir } = application;
        if (!application.enableTranslation) {
          await control.loadClientTranslations?.();
        }
        const { getWebappTranslation } = control;
        this.queueTransformStream(translateVueFilesTransform.call(this, { enableTranslation, getWebappTranslation }), {
          name: 'translating webapp',
          streamOptions: { filter: file => isFilePending(file) && isTranslatedVueFile(file) },
        });
        if (enableTranslation) {
          const { transform, isTranslationFile } = convertTranslationsSupport({ clientSrcDir });
          this.queueTransformStream(transform, {
            name: 'converting translations',
            streamOptions: { filter: file => isFilePending(file) && isTranslationFile(file) },
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      postWriteEntityFiles,
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }

  get end() {
    return this.asEndTaskGroup({
      end({ application }) {
        this.log.ok('Vue application generated successfully.');
        this.log.log(
          chalk.green(`  Start your Webpack development server with:
  ${chalk.yellow.bold(`${application.nodePackageManager} start`)}
`)
        );
      },
    });
  }

  get [BaseApplicationGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  /**
   * @private
   * Add a new entity in the "entities" menu.
   *
   * @param {string} routerName - The name of the Angular router (which by default is the name of the entity).
   * @param {boolean} enableTranslation - If translations are enabled or not
   * @param {string} clientFramework - The name of the client framework
   * @param {string} entityTranslationKeyMenu - i18n key for entity entry in menu
   * @param {string} entityTranslationValue - i18n value for entity entry in menu
   */
  addEntityToMenu(
    routerName,
    enableTranslation,
    entityTranslationKeyMenu = _.camelCase(routerName),
    entityTranslationValue = _.startCase(routerName)
  ) {
    this.needleApi.clientVue.addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu, entityTranslationValue);
  }

  /**
   * @private
   * Add a new entity in the TS modules file.
   *
   * @param {string} entityInstance - Entity Instance
   * @param {string} entityClass - Entity Class
   * @param {string} entityName - Entity Name
   * @param {string} entityFolderName - Entity Folder Name
   * @param {string} entityFileName - Entity File Name
   * @param {string} entityUrl - Entity router URL
   * @param {string} microserviceName - Microservice Name
   * @param {boolean} readOnly - If the entity is read-only or not
   * @param {string} pageTitle - The translation key or the text for the page title in the browser
   */
  addEntityToModule(
    entityInstance = this.entityInstance,
    entityClass = this.entityClass,
    entityName = this.entityAngularName,
    entityFolderName = this.entityFolderName,
    entityFileName = this.entityFileName,
    _entityUrl = this.entityUrl,
    _microserviceName = this.microserviceName,
    readOnly = this.readOnly,
    _pageTitle = this.enableTranslation ? `${this.i18nKeyPrefix}.home.title` : this.entityClassPlural
  ) {
    this.needleApi.clientVue.addEntityToRouterImport(entityName, entityFileName, entityFolderName, readOnly);
    this.needleApi.clientVue.addEntityToRouter(entityInstance, entityName, entityFileName, readOnly);
    this.needleApi.clientVue.addEntityServiceToEntitiesComponentImport(entityName, entityClass, entityFileName, entityFolderName);
    this.needleApi.clientVue.addEntityServiceToEntitiesComponent(entityInstance, entityName);
  }

  /**
   * @private
   * Generate Entity Client Field Default Values
   *
   * @param {Array|Object} fields - array of fields
   * @returns {Array} defaultVariablesValues
   */
  generateEntityClientFieldDefaultValues(fields) {
    const defaultVariablesValues = {};
    fields.forEach(field => {
      const fieldType = field.fieldType;
      const fieldName = field.fieldName;
      if (fieldType === TYPE_BOOLEAN) {
        defaultVariablesValues[fieldName] = `this.${fieldName} = this.${fieldName} ?? false;`;
      }
    });
    return defaultVariablesValues;
  }

  getTypescriptKeyType(primaryKey) {
    return getTSKeyType(primaryKey);
  }

  generateEntityClientFields(primaryKey, fields, relationships, dto, customDateType = 'dayjs.Dayjs', embedded = false) {
    return getHydratedEntityClientFields(primaryKey, fields, relationships, dto, customDateType, embedded, VUE);
  }

  generateEntityClientImports(relationships, dto) {
    return formatEntityClientImports(relationships, dto, VUE);
  }

  generateEntityClientEnumImports(fields) {
    return getClientEnumImportsFormat(fields, VUE);
  }

  generateTestEntityId(primaryKey, index = 0, wrapped = true) {
    return getTestEntityId(primaryKey, index, wrapped);
  }
}
