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
import _ from 'lodash';

import BaseApplicationGenerator from '../base-application/index.mjs';
import { GENERATOR_ANGULAR, GENERATOR_CLIENT, GENERATOR_LANGUAGES } from '../generator-list.mjs';
import { writeEntitiesFiles, postWriteEntitiesFiles, cleanupEntitiesFiles } from './entity-files-angular.mjs';
import { writeFiles, cleanup } from './files-angular.mjs';
import { addAdminMenuEntry, addEntityMenuEntry as addAngularEntityMenuEntry } from './support/index.mjs';
import { addIconInImport } from './support/index.mjs';
import { getTypescriptKeyType as getTSKeyType } from '../client/support/index.mjs';

/**
 * @class
 * @extends {BaseApplicationGenerator<import('../client/types.mjs').ClientApplication>}
 */
export default class AngularGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    await this.dependsOnJHipster(GENERATOR_CLIENT);
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_ANGULAR);
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
    return this.asComposingTaskGroup(this.delegateTasksToBlueprint(() => this.composing));
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadPackageJson() {
        _.merge(
          this.dependabotPackageJson,
          this.fs.readJSON(this.fetchFromInstalledJHipster(GENERATOR_ANGULAR, 'templates', 'package.json'))
        );
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup(this.delegateTasksToBlueprint(() => this.loading));
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareForTemplates({ application }) {
        application.webappEnumerationsDir = `${application.clientSrcDir}app/entities/enumerations/`;
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asPreparingTaskGroup(this.delegateTasksToBlueprint(() => this.preparing));
  }

  get default() {
    return this.asDefaultTaskGroup({
      loadEntities() {
        const entities = this.sharedData.getEntities().map(({ entity }) => entity);
        this.localEntities = entities.filter(entity => !entity.builtIn && !entity.skipClient);
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.asDefaultTaskGroup(this.delegateTasksToBlueprint(() => this.default));
  }

  get writing() {
    return {
      cleanup,
      writeFiles,
    };
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return {
      cleanupEntitiesFiles,
      writeEntitiesFiles,
    };
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWritingEntities() {
    return {
      postWriteEntitiesFiles,
    };
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }

  /**
   * @private
   * Add a new entity in the "entities" menu.
   *
   * @param {string} routerName - The name of the Angular router (which by default is the name of the entity).
   * @param {boolean} enableTranslation - If translations are enabled or not
   * @param {string} entityTranslationKeyMenu - i18n key for entity entry in menu
   * @param {string} entityTranslationValue - i18n value for entity entry in menu
   */
  addEntityToMenu(
    routerName,
    enableTranslation,
    entityTranslationKeyMenu = _.camelCase(routerName),
    entityTranslationValue = _.startCase(routerName),
    jhiPrefix = this.jhiPrefix
  ) {
    addAngularEntityMenuEntry(this, routerName, enableTranslation, entityTranslationKeyMenu, entityTranslationValue, jhiPrefix);
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
   * @param {string} clientFramework - The name of the client framework
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
    entityUrl = this.entityUrl,
    microserviceName = this.microserviceName,
    readOnly = this.readOnly,
    pageTitle = this.enableTranslation ? `${this.i18nKeyPrefix}.home.title` : this.entityClassPlural
  ) {
    this.needleApi.clientAngular.addEntityToModule(entityName, entityFolderName, entityFileName, entityUrl, microserviceName, pageTitle);
  }

  /**
   * @private
   * Add a new icon to icon imports.
   *
   * @param {string} iconName - The name of the Font Awesome icon.
   */
  addIcon(iconName) {
    addIconInImport(this, iconName);
  }

  /**
   * Add a new menu element to the admin menu.
   *
   * @param {string} routerName - The name of the Angular router that is added to the admin menu.
   * @param {string} iconName - The name of the Font Awesome icon that will be displayed.
   * @param {boolean} enableTranslation - If translations are enabled or not
   * @param {string} translationKeyMenu - i18n key for entry in the admin menu
   */
  addElementToAdminMenu(routerName, iconName, enableTranslation, translationKeyMenu = _.camelCase(routerName)) {
    addAdminMenuEntry(this, routerName, iconName, enableTranslation, translationKeyMenu);
  }

  getTypescriptKeyType(primaryKey) {
    return getTSKeyType(primaryKey);
  }
}
