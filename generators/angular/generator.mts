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
import chalk from 'chalk';
import { isFilePending } from 'mem-fs-editor/state';

import BaseApplicationGenerator, { type Entity } from '../base-application/index.mjs';
import { GENERATOR_ANGULAR, GENERATOR_CLIENT, GENERATOR_LANGUAGES } from '../generator-list.mjs';
import { defaultLanguage } from '../languages/support/index.mjs';
import { writeEntitiesFiles, postWriteEntitiesFiles, cleanupEntitiesFiles } from './entity-files-angular.mjs';
import { writeFiles } from './files-angular.mjs';
import cleanupOldFilesTask from './cleanup.mjs';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.mjs';
import {
  buildAngularFormPath as angularFormPath,
  addEntitiesRoute,
  addToEntitiesMenu,
  translateAngularFilesTransform,
  isTranslatedAngularFile,
} from './support/index.mjs';
import {
  generateEntityClientEnumImports as getClientEnumImportsFormat,
  getTypescriptKeyType as getTSKeyType,
  generateTestEntityId as getTestEntityId,
  generateTestEntityPrimaryKey as getTestEntityPrimaryKey,
  generateTypescriptTestEntity as generateTestEntity,
} from '../client/support/index.mjs';
import type { CommonClientServerApplication } from '../base-application/types.mjs';

const { ANGULAR } = clientFrameworkTypes;

export default class AngularGenerator extends BaseApplicationGenerator {
  localEntities?: any[];

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
      loadPackageJson({ application }) {
        this.loadNodeDependenciesFromPackageJson(
          application.nodeDependencies,
          this.fetchFromInstalledJHipster(GENERATOR_ANGULAR, 'resources', 'package.json')
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
        application.angularLocaleId = application.nativeLanguageDefinition.angularLocale ?? defaultLanguage.angularLocale!;
      },
      addNeedles({ source }) {
        source.addEntitiesToClient = param => {
          const { application, entities } = param;
          this.addEntitiesToModule({ application, entities });
          this.addEntitiesToMenu({ application, entities });
        };
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
    return this.asWritingTaskGroup({
      cleanupOldFilesTask,
      writeFiles,
      queueTranslateTransform({ control, application }) {
        if (!application.enableTranslation) {
          this.queueTransformStream(translateAngularFilesTransform(control.getWebappTranslation), {
            name: 'translating webapp',
            streamOptions: { filter: file => isFilePending(file) && isTranslatedAngularFile(file) },
          });
        }
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get writingEntities() {
    return this.asWritingEntitiesTaskGroup({
      cleanupEntitiesFiles,
      writeEntitiesFiles,
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.writingEntities);
  }

  get postWritingEntities() {
    return this.asPostWritingEntitiesTaskGroup({
      postWriteEntitiesFiles,
    });
  }

  get [BaseApplicationGenerator.POST_WRITING_ENTITIES]() {
    return this.delegateTasksToBlueprint(() => this.postWritingEntities);
  }

  get end() {
    return this.asEndTaskGroup({
      end({ application }) {
        this.log.ok('Angular application generated successfully.');
        this.log.log(
          chalk.green(`  Start your Webpack development server with:
  ${chalk.yellow.bold(`${application.nodePackageManager} start`)}
`)
        );
      },
    });
  }

  get [BaseApplicationGenerator.END]() {
    return this.asEndTaskGroup(this.delegateTasksToBlueprint(() => this.end));
  }

  /**
   * @private
   * Add new scss style to the angular application in "vendor.scss".
   *
   * @param {string} style - scss to add in the file
   * @param {string} comment - comment to add before css code
   *
   * example:
   *
   * style = '.success {\n     @extend .message;\n    border-color: green;\n}'
   * comment = 'Message'
   *
   * * ==========================================================================
   * Message
   * ========================================================================== *
   * .success {
   *     @extend .message;
   *     border-color: green;
   * }
   *
   */
  addVendorSCSSStyle(style, comment) {
    this.needleApi.clientAngular.addVendorSCSSStyle(style, comment);
  }

  /**
   * @private
   * Add a new admin in the TS modules file.
   *
   * @param {string} appName - Angular2 application name.
   * @param {string} adminAngularName - The name of the new admin item.
   * @param {string} adminFolderName - The name of the folder.
   * @param {string} adminFileName - The name of the file.
   * @param {boolean} enableTranslation - If translations are enabled or not.
   */
  addAdminToModule(appName, adminAngularName, adminFolderName, adminFileName, enableTranslation) {
    this.needleApi.clientAngular.addToAdminModule(appName, adminAngularName, adminFolderName, adminFileName, enableTranslation);
  }

  /**
   * @private
   * Add a new lazy loaded module to admin routing file.
   *
   * @param {string} route - The route for the module. For example 'entity-audit'.
   * @param {string} modulePath - The path to the module file. For example './entity-audit/entity-audit.module'.
   * @param {string} moduleName - The name of the module. For example 'EntityAuditModule'.
   * @param {string} pageTitle - The translation key if i18n is enabled or the text if i18n is disabled for the page title in the browser.
   *                             For example 'entityAudit.home.title' for i18n enabled or 'Entity audit' for i18n disabled.
   *                             If undefined then application global page title is used in the browser title bar.
   */
  addAdminRoute(route, modulePath, moduleName, pageTitle) {
    this.needleApi.clientAngular.addAdminRoute(route, modulePath, moduleName, pageTitle);
  }

  /**
   * @private
   * Add a new module in the TS modules file.
   *
   * @param {string} appName - Angular2 application name.
   * @param {string} angularName - The name of the new admin item.
   * @param {string} folderName - The name of the folder.
   * @param {string} fileName - The name of the file.
   * @param {boolean} enableTranslation - If translations are enabled or not.
   * @param {string} clientFramework - The name of the client framework.
   */
  addAngularModule(appName, angularName, folderName, fileName, enableTranslation) {
    this.needleApi.clientAngular.addModule(appName, angularName, folderName, fileName, enableTranslation);
  }

  /**
   * @private
   * Add a new icon to icon imports.
   *
   * @param {string} iconName - The name of the Font Awesome icon.
   */
  addIcon(iconName) {
    this.needleApi.clientAngular.addIcon(iconName);
  }

  /**
   * Add a new menu element to the admin menu.
   *
   * @param {string} routerName - The name of the Angular router that is added to the admin menu.
   * @param {string} iconName - The name of the Font Awesome icon that will be displayed.
   * @param {boolean} enableTranslation - If translations are enabled or not
   * @param {string} translationKeyMenu - i18n key for entry in the admin menu
   */
  addElementToAdminMenu(routerName, iconName, enableTranslation, translationKeyMenu = _.camelCase(routerName), jhiPrefix?) {
    this.needleApi.clientAngular.addElementToAdminMenu(routerName, iconName, enableTranslation, translationKeyMenu, jhiPrefix);
  }

  addEntitiesToMenu({ application, entities }: { application: CommonClientServerApplication; entities: Entity[] }) {
    const filePath = `${application.clientSrcDir}app/layouts/navbar/navbar.component.html`;
    const ignoreNonExisting = chalk.yellow('Reference to entities not added to menu.');
    const editCallback = addToEntitiesMenu({ application, entities });

    this.editFile(filePath, { ignoreNonExisting }, editCallback);
  }

  addEntitiesToModule({ application, entities }: { application: CommonClientServerApplication; entities: Entity[] }) {
    const filePath = `${application.clientSrcDir}app/entities/entity-routing.module.ts`;
    const ignoreNonExisting = chalk.yellow(`Route(s) not added to ${filePath}.`);
    const addRouteCallback = addEntitiesRoute({ application, entities });
    this.editFile(filePath, { ignoreNonExisting }, addRouteCallback);
  }

  /**
   * @private
   * Add new scss style to the angular application in "global.scss
   *
   * @param {string} style - css to add in the file
   * @param {string} comment - comment to add before css code
   *
   * example:
   *
   * style = '.jhipster {\n     color: #baa186;\n}'
   * comment = 'New JHipster color'
   *
   * * ==========================================================================
   * New JHipster color
   * ========================================================================== *
   * .jhipster {
   *     color: #baa186;
   * }
   *
   */
  addMainSCSSStyle(style, comment) {
    this.needleApi.clientAngular.addGlobalSCSSStyle(style, comment);
  }

  /**
   * Returns the typescript import section of enums referenced by all fields of the entity.
   * @param fields returns the import of enums that are referenced by the fields
   * @returns {typeImports:Map} the fields that potentially contains some enum types
   */
  generateEntityClientEnumImports(fields) {
    return getClientEnumImportsFormat(fields, ANGULAR);
  }

  /**
   * Get the typescript type of a non-composite primary key
   * @param primaryKey the primary key of the entity
   * @returns {string} the typescript type.
   */
  getTypescriptKeyType(primaryKey) {
    return getTSKeyType(primaryKey);
  }

  /**
   * generates a value for a primary key type
   * @param primaryKey the primary key attribute (or its type) of the entity
   * @param index an index to add salt to the value
   * @param wrapped if the value should be within quotes
   * @returns {string|number|string}
   */
  generateTestEntityId(primaryKey, index = 0, wrapped = true) {
    return getTestEntityId(primaryKey, index, wrapped);
  }

  /**
   * @private
   * Generate a test entity, for the PK references (when the PK is a composite, derived key)
   *
   * @param {any} primaryKey - primary key definition.
   * @param {number} [index] - index of the primary key sample, pass undefined for a random key.
   */
  generateTestEntityPrimaryKey(primaryKey, index) {
    return getTestEntityPrimaryKey(primaryKey, index);
  }

  /**
   * @private
   * Generate a test entity instance with faked values.
   *
   * @param {any} references - references to other entities.
   * @param {any} additionalFields - additional fields to add to the entity or with default values that overrides generated values.
   */
  generateTypescriptTestEntity(references, additionalFields) {
    return generateTestEntity(references, additionalFields);
  }

  /**
   * @private
   * Create a angular form path getter method of reference.
   *
   * @param {object} reference
   * @param {string[]} prefix
   * @return {string}
   */
  buildAngularFormPath(reference, prefix = []) {
    return angularFormPath(reference, prefix);
  }

  /**
   * @private
   * Add a new menu element, at the root of the menu.
   *
   * @param {string} routerName - The name of the router that is added to the menu.
   * @param {string} iconName - The name of the Font Awesome icon that will be displayed.
   * @param {boolean} enableTranslation - If translations are enabled or not
   * @param {string} clientFramework - The name of the client framework
   * @param {string} translationKeyMenu - i18n key for entry in the menu
   */
  addElementToMenu(routerName, iconName, enableTranslation, clientFramework, translationKeyMenu = _.camelCase(routerName)) {
    this.needleApi.clientAngular.addElementToMenu(routerName, iconName, enableTranslation, translationKeyMenu);
  }
}
