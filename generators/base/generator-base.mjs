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
import assert from 'assert';
import path from 'path';
import _ from 'lodash';
import chalk from 'chalk';
import fs, { existsSync } from 'fs';
import shelljs from 'shelljs';
import semver from 'semver';
import { exec } from 'child_process';
import os from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import jhipster7Proxy from './jhipster7-proxy.mjs';
import { packageJson as packagejs } from '../../lib/index.mjs';
import jhipsterUtils from '../utils.cjs';
import constants from '../generator-constants.cjs';
import PrivateBase from './generator-base-private.mjs';
import NeedleApi from '../needle-api.cjs';
import generatorDefaults from '../generator-defaults.mjs';
import commonOptions from './options.mjs';
import detectLanguage from '../languages/detect-language.mjs';
import { formatDateForChangelog, normalizePathEnd } from './utils.mjs';
import { calculateDbNameWithLimit, hibernateSnakeCase } from '../../utils/db.mjs';
import {
  defaultApplicationOptions,
  databaseTypes,
  monitoringTypes,
  authenticationTypes,
  buildToolTypes,
  cacheTypes,
  websocketTypes,
  messageBrokerTypes,
  testFrameworkTypes,
  applicationTypes,
  serviceDiscoveryTypes,
  searchEngineTypes,
  clientFrameworkTypes,
} from '../../jdl/jhipster/index.mjs';

import databaseData from '../sql-constants.mjs';
import { CUSTOM_PRIORITIES } from './priorities.mjs';
import { GENERATOR_BOOTSTRAP } from '../generator-list.mjs';
import { NODE_VERSION } from '../generator-constants.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { defaultConfig, defaultConfigMicroservice } = generatorDefaults;
const { ANGULAR, REACT, VUE, NO: CLIENT_FRAMEWORK_NO } = clientFrameworkTypes;

const {
  JHIPSTER_CONFIG_DIR,
  SERVER_MAIN_SRC_DIR,
  SERVER_TEST_SRC_DIR,
  SERVER_MAIN_RES_DIR,
  SERVER_TEST_RES_DIR,
  CLIENT_MAIN_SRC_DIR,
  CLIENT_TEST_SRC_DIR,
} = constants;

const MODULES_HOOK_FILE = `${JHIPSTER_CONFIG_DIR}/modules/jhi-hooks.json`;
const GENERATOR_JHIPSTER = 'generator-jhipster';

const { ORACLE, MYSQL, POSTGRESQL, MARIADB, MSSQL, SQL, MONGODB, COUCHBASE, NEO4J, CASSANDRA, H2_MEMORY, H2_DISK } = databaseTypes;
const NO_DATABASE = databaseTypes.NO;

const { PROMETHEUS, ELK } = monitoringTypes;
const { JWT, OAUTH2, SESSION } = authenticationTypes;
const { CAFFEINE, EHCACHE, REDIS, HAZELCAST, INFINISPAN, MEMCACHED } = cacheTypes;
const { GRADLE, MAVEN } = buildToolTypes;
const { SPRING_WEBSOCKET } = websocketTypes;
const { KAFKA } = messageBrokerTypes;
const { CONSUL, EUREKA } = serviceDiscoveryTypes;
const { GATLING, CUCUMBER, CYPRESS } = testFrameworkTypes;
const { GATEWAY, MICROSERVICE, MONOLITH } = applicationTypes;
const { ELASTICSEARCH } = searchEngineTypes;

const NO_CACHE = cacheTypes.NO;
const NO_SERVICE_DISCOVERY = serviceDiscoveryTypes.NO;
const NO_SEARCH_ENGINE = searchEngineTypes.FALSE;
const NO_MESSAGE_BROKER = messageBrokerTypes.NO;
const NO_WEBSOCKET = websocketTypes.FALSE;

const isWin32 = os.platform() === 'win32';

/**
 * This is the Generator base class.
 * This provides all the public API methods exposed via the module system.
 * The public API methods can be directly utilized as well using commonJS require.
 *
 * The method signatures in public API should not be changed without a major version change
 *
 * @class
 * @extends {PrivateBase}
 * @property {import('yeoman-generator/lib/util/storage')} config - Storage for config.
 */
export default class JHipsterBaseGenerator extends PrivateBase {
  /** @type {Record<string, any>} */
  jhipsterConfig;

  /** @type {Record<string, any>} */
  dependabotPackageJson;

  sbsBlueprint;

  /**
   * @param {string | string[]} args
   * @param {import('./base/api.mjs').JHipsterGeneratorOptions} options
   * @param {import('./base/api.mjs').JHipsterGeneratorFeatures} features
   */
  constructor(args, options, features) {
    super(args, options, features);

    if (!this.features.jhipsterModular) {
      // This adds support for a `--from-cli` flag
      this.option('from-cli', {
        desc: 'Indicates the command is run from JHipster CLI',
        type: Boolean,
        hide: true,
      });

      this.option('with-generated-flag', {
        desc: 'Add a GeneratedByJHipster annotation to all generated java classes and interfaces',
        type: Boolean,
      });

      this.option('skip-prompts', {
        desc: 'Skip prompts',
        type: Boolean,
      });

      this.option('skip-prettier', {
        desc: 'Skip prettier',
        type: Boolean,
        hide: true,
      });
    }

    if (this.options.help) {
      return;
    }

    this.registerPriorities(CUSTOM_PRIORITIES);

    // JHipster runtime config that should not be stored to .yo-rc.json.
    this.configOptions = this.options.configOptions || { sharedEntities: {} };
    this.configOptions.sharedEntities = this.configOptions.sharedEntities || {};

    /* Force config to use 'generator-jhipster' namespace. */
    this._config = this._getStorage('generator-jhipster', { sorted: true });
    /* JHipster config using proxy mode used as a plain object instead of using get/set. */
    this.jhipsterConfig = this.config.createProxy();

    this.parseTestOptions();

    this.loadRuntimeOptions();
    this.loadStoredAppOptions();

    if (this.options.namespace !== 'jhipster:bootstrap') {
      this.env.runLoop.add(
        'environment:run',
        async (done, stop) => {
          try {
            await this.composeWithJHipster(GENERATOR_BOOTSTRAP);
            done();
          } catch (error) {
            stop(error);
          }
        },
        {
          once: 'queueJhipsterBootstrap',
          run: false,
        }
      );
    }
  }

  /**
   * @protected
   * Alternative templatePath that fetches from the blueprinted generator, instead of the blueprint.
   *
   * @param {...string} args
   * @returns {string}
   */
  jhipsterTemplatePath(...args) {
    try {
      this._jhipsterGenerator = this._jhipsterGenerator || this.env.requireNamespace(this.options.namespace).generator;
    } catch (error) {
      const split = this.options.namespace.split(':', 2);
      this._jhipsterGenerator = split.length === 1 ? split[0] : split[1];
    }
    return this.fetchFromInstalledJHipster(this._jhipsterGenerator, 'templates', ...args);
  }

  /**
   * @private
   * Get generator dependencies for building help
   * This is a stub and should be overwritten by the generator.
   *
   * @returns {string[]}
   */
  getPossibleDependencies() {
    return [];
  }

  /**
   * @private
   * Replace placeholders with versions from packageJsonSourceFile.
   * @param {string} keyToReplace - PlaceHolder name.
   * @param {string} packageJsonSourceFile - Package json filepath with actual versions.
   */
  replacePackageJsonVersions(keyToReplace, packageJsonSourceFile) {
    const packageJsonSource = JSON.parse(fs.readFileSync(packageJsonSourceFile, 'utf-8'));
    const packageJsonTargetFile = this.destinationPath('package.json');
    const packageJsonTarget = this.fs.readJSON(packageJsonTargetFile);
    const replace = section => {
      if (packageJsonTarget[section]) {
        Object.entries(packageJsonTarget[section]).forEach(([dependency, dependencyReference]) => {
          if (dependencyReference.startsWith(keyToReplace)) {
            const [keyToReplaceAtSource, sectionAtSource = section, dependencyAtSource = dependency] = dependencyReference.split('#');
            if (keyToReplaceAtSource !== keyToReplace) return;
            if (!packageJsonSource[sectionAtSource] || !packageJsonSource[sectionAtSource][dependencyAtSource]) {
              throw new Error(`Error setting ${dependencyAtSource} version, not found at ${sectionAtSource}.${dependencyAtSource}`);
            }
            packageJsonTarget[section][dependency] = packageJsonSource[sectionAtSource][dependencyAtSource];
          }
        });
      }
    };
    replace('dependencies');
    replace('devDependencies');
    this.fs.writeJSON(packageJsonTargetFile, packageJsonTarget);
  }

  /**
   * @private
   * Add a new icon to icon imports.
   *
   * @param {string} iconName - The name of the Font Awesome icon.
   * @param {string} clientFramework - The name of the client framework
   */
  addIcon(iconName, clientFramework) {
    if (clientFramework === ANGULAR) {
      this.needleApi.clientAngular.addIcon(iconName);
    } else if (clientFramework === REACT) {
      // React
      // TODO:
    }
  }

  /**
   * @private
   * Add a new menu element, at the root of the menu.
   *
   * @param {string} routerName - The name of the Angular router that is added to the menu.
   * @param {string} iconName - The name of the Font Awesome icon that will be displayed.
   * @param {boolean} enableTranslation - If translations are enabled or not
   * @param {string} clientFramework - The name of the client framework
   * @param {string} translationKeyMenu - i18n key for entry in the menu
   */
  addElementToMenu(routerName, iconName, enableTranslation, clientFramework, translationKeyMenu = _.camelCase(routerName)) {
    if (clientFramework === ANGULAR) {
      this.needleApi.clientAngular.addElementToMenu(routerName, iconName, enableTranslation, translationKeyMenu, this.jhiPrefix);
    } else if (clientFramework === REACT) {
      // React
      // TODO:
    }
  }

  /**
   * @private
   * Add external resources to root file(index.html).
   *
   * @param {string} resources - Resources added to root file.
   * @param {string} comment - comment to add before resources content.
   */
  addExternalResourcesToRoot(resources, comment) {
    this.needleApi.client.addExternalResourcesToRoot(resources, comment);
  }

  /**
   * Add a new menu element to the admin menu.
   *
   * @param {string} routerName - The name of the Angular router that is added to the admin menu.
   * @param {string} iconName - The name of the Font Awesome icon that will be displayed.
   * @param {boolean} enableTranslation - If translations are enabled or not
   * @param {string} clientFramework - The name of the client framework
   * @param {string} translationKeyMenu - i18n key for entry in the admin menu
   */
  addElementToAdminMenu(routerName, iconName, enableTranslation, clientFramework, translationKeyMenu = _.camelCase(routerName)) {
    if (clientFramework === ANGULAR) {
      this.needleApi.clientAngular.addElementToAdminMenu(routerName, iconName, enableTranslation, translationKeyMenu, this.jhiPrefix);
    } else if (clientFramework === REACT) {
      // React
      // TODO:
    }
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
    clientFramework = this.clientFramework,
    entityTranslationKeyMenu = _.camelCase(routerName),
    entityTranslationValue = _.startCase(routerName),
    jhiPrefix = this.jhiPrefix
  ) {
    if (clientFramework === ANGULAR) {
      this.needleApi.clientAngular.addEntityToMenu(
        routerName,
        enableTranslation,
        entityTranslationKeyMenu,
        entityTranslationValue,
        jhiPrefix
      );
    } else if (clientFramework === REACT) {
      this.needleApi.clientReact.addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu, entityTranslationValue);
    } else if (clientFramework === VUE) {
      this.needleApi.clientVue.addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu, entityTranslationValue);
    }
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
    clientFramework = this.clientFramework,
    microserviceName = this.microserviceName,
    readOnly = this.readOnly,
    pageTitle = this.enableTranslation ? `${this.i18nKeyPrefix}.home.title` : this.entityClassPlural
  ) {
    if (clientFramework === ANGULAR) {
      this.needleApi.clientAngular.addEntityToModule(entityName, entityFolderName, entityFileName, entityUrl, microserviceName, pageTitle);
    } else if (clientFramework === REACT) {
      this.needleApi.clientReact.addEntityToModule(entityInstance, entityClass, entityName, entityFolderName, entityFileName);
    } else if (clientFramework === VUE) {
      this.needleApi.clientVue.addEntityToRouterImport(entityName, entityFileName, entityFolderName, readOnly);
      this.needleApi.clientVue.addEntityToRouter(entityInstance, entityName, entityFileName, readOnly);
      this.needleApi.clientVue.addEntityServiceToEntitiesComponentImport(entityName, entityClass, entityFileName, entityFolderName);
      this.needleApi.clientVue.addEntityServiceToEntitiesComponent(entityInstance, entityName);
    }
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
   * @param {string} clientFramework - The name of the client framework.
   */
  addAdminToModule(appName, adminAngularName, adminFolderName, adminFileName, enableTranslation, clientFramework) {
    this.needleApi.clientAngular.addToAdminModule(
      appName,
      adminAngularName,
      adminFolderName,
      adminFileName,
      enableTranslation,
      clientFramework
    );
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
   * Add a new element in the "global.json" translations.
   *
   * @param {string} key - Key for the menu entry
   * @param {string} value - Default translated value
   * @param {string} language - The language to which this translation should be added
   */
  addElementTranslationKey(key, value, language, webappSrcDir = this.sharedData.getApplication().clientSrcDir) {
    this.needleApi.clientI18n.addElementTranslationKey(key, value, language, webappSrcDir);
  }

  /**
   * @private
   * Add a new element in the admin section of "global.json" translations.
   *
   * @param {string} key - Key for the menu entry
   * @param {string} value - Default translated value
   * @param {string} language - The language to which this translation should be added
   */
  addAdminElementTranslationKey(key, value, language, webappSrcDir = this.sharedData.getApplication().clientSrcDir) {
    this.needleApi.clientI18n.addAdminElementTranslationKey(key, value, language, webappSrcDir);
  }

  /**
   * @private
   * Add a new entity in the "global.json" translations.
   *
   * @param {string} key - Key for the entity name
   * @param {string} value - Default translated value
   * @param {string} language - The language to which this translation should be added
   */
  addEntityTranslationKey(key, value, language, webappSrcDir = this.sharedData.getApplication().clientSrcDir) {
    this.needleApi.clientI18n.addEntityTranslationKey(key, value, language, webappSrcDir);
  }

  /**
   * @private
   * Add a translation key to all installed languages
   *
   * @param {string} key - Key for the entity name
   * @param {string} value - Default translated value
   * @param {string} method - The method to be run with provided key and value from above
   * @param {string} enableTranslation - specify if i18n is enabled
   */
  addTranslationKeyToAllLanguages(key, value, method, enableTranslation, webappSrcDir = this.sharedData.getApplication().clientSrcDir) {
    if (enableTranslation) {
      this.getAllInstalledLanguages().forEach(language => {
        this[method](key, value, language, webappSrcDir);
      });
    }
  }

  /**
   * @private
   * get all the languages installed currently
   */
  getAllInstalledLanguages() {
    const languages = [];
    this.getAllSupportedLanguages().forEach(language => {
      try {
        const stats = fs.lstatSync(`${this.sharedData.getApplication().clientSrcDir}i18n/${language}`);
        if (stats.isDirectory()) {
          languages.push(language);
        }
      } catch (e) {
        this.debug('Error:', e);
        // An exception is thrown if the folder doesn't exist
        // do nothing as the language might not be installed
      }
    });
    return languages;
  }

  /**
   * get all the languages supported by JHipster
   */
  getAllSupportedLanguages() {
    return _.map(this.getAllSupportedLanguageOptions(), 'value');
  }

  /**
   * check if a language is supported by JHipster
   * @param {string} language - Key for the language
   */
  isSupportedLanguage(language) {
    return _.includes(this.getAllSupportedLanguages(), language);
  }

  /**
   * @private
   * check if Right-to-Left support is necessary for i18n
   * @param {string[]} languages - languages array
   */
  isI18nRTLSupportNecessary(languages) {
    if (!languages) {
      return false;
    }
    const rtlLanguages = this.getAllSupportedLanguageOptions().filter(langObj => langObj.rtl);
    return languages.some(lang => !!rtlLanguages.find(langObj => langObj.value === lang));
  }

  /**
   * @private
   * return the localeId from the given language key (from constants.LANGUAGES)
   * if no localeId is defined, return the language key (which is a localeId itself)
   * @param {string} language - language key
   */
  getLocaleId(language) {
    const langObj = this.getAllSupportedLanguageOptions().find(langObj => langObj.value === language);
    return langObj.localeId || language;
  }

  /**
   * @private
   * return the dayjsLocaleId from the given language key (from constants.LANGUAGES)
   * if no dayjsLocaleId is defined, return the language key (which is a localeId itself)
   * @param {string} language - language key
   */
  getDayjsLocaleId(language) {
    const langObj = this.getAllSupportedLanguageOptions().find(langObj => langObj.value === language);
    return langObj.dayjsLocaleId || language;
  }

  /**
   * @private
   * get all the languages options supported by JHipster
   */
  getAllSupportedLanguageOptions() {
    return constants.LANGUAGES;
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
  addAngularModule(appName, angularName, folderName, fileName, enableTranslation, clientFramework) {
    this.needleApi.clientAngular.addModule(appName, angularName, folderName, fileName, enableTranslation, clientFramework);
  }

  /**
   * @private
   * Add a new entity to Ehcache, for the 2nd level cache of an entity and its relationships.
   *
   * @param {string} entityClass - the entity to cache
   * @param {array} relationships - the relationships of this entity
   * @param {string} packageName - the Java package name
   * @param {string} packageFolder - the Java package folder
   */
  addEntityToEhcache(entityClass, relationships, packageName, packageFolder) {
    this.addEntityToCache(entityClass, relationships, packageName, packageFolder, EHCACHE);
  }

  /**
   * @private
   * Add a new entry to Ehcache in CacheConfiguration.java
   *
   * @param {string} entry - the entry (including package name) to cache
   * @param {string} packageFolder - the Java package folder
   */
  addEntryToEhcache(entry, packageFolder) {
    this.addEntryToCache(entry, packageFolder, EHCACHE);
  }

  /**
   * @private
   * Add a new entity to the chosen cache provider, for the 2nd level cache of an entity and its relationships.
   *
   * @param {string} entityClass - the entity to cache
   * @param {array} relationships - the relationships of this entity
   * @param {string} packageName - the Java package name
   * @param {string} packageFolder - the Java package folder
   * @param {string} cacheProvider - the cache provider
   */
  addEntityToCache(entityClass, relationships, packageName, packageFolder, cacheProvider) {
    this.needleApi.serverCache.addEntityToCache(entityClass, relationships, packageName, packageFolder, cacheProvider);
  }

  /**
   * @private
   * Add a new entry to the chosen cache provider in CacheConfiguration.java
   *
   * @param {string} entry - the entry (including package name) to cache
   * @param {string} packageFolder - the Java package folder
   * @param {string} cacheProvider - the cache provider
   */
  addEntryToCache(entry, packageFolder, cacheProvider) {
    this.needleApi.serverCache.addEntryToCache(entry, packageFolder, cacheProvider);
  }

  /**
   * @private
   * Add a new changelog to the Liquibase master.xml file.
   *
   * @param {string} changelogName - The name of the changelog (name of the file without .xml at the end).
   */
  addChangelogToLiquibase(changelogName) {
    this.needleApi.serverLiquibase.addChangelog(changelogName);
  }

  /**
   * @private
   * Add a incremental changelog to the Liquibase master.xml file.
   *
   * @param {string} changelogName - The name of the changelog (name of the file without .xml at the end).
   */
  addIncrementalChangelogToLiquibase(changelogName) {
    this.needleApi.serverLiquibase.addIncrementalChangelog(changelogName);
  }

  /**
   * @private
   * Add a new constraints changelog to the Liquibase master.xml file.
   *
   * @param {string} changelogName - The name of the changelog (name of the file without .xml at the end).
   */
  addConstraintsChangelogToLiquibase(changelogName) {
    this.needleApi.serverLiquibase.addConstraintsChangelog(changelogName);
  }

  /**
   * @private
   * Add a new changelog to the Liquibase master.xml file.
   *
   * @param {string} changelogName - The name of the changelog (name of the file without .xml at the end).
   * @param {string} needle - The needle at where it has to be added.
   */
  addLiquibaseChangelogToMaster(changelogName, needle) {
    this.needleApi.serverLiquibase.addChangelogToMaster(changelogName, needle);
  }

  /**
   * @private
   * Add a new column to a Liquibase changelog file for entity.
   *
   * @param {string} filePath - The full path of the changelog file.
   * @param {string} content - The content to be added as column, can have multiple columns as well
   */
  addColumnToLiquibaseEntityChangeset(filePath, content) {
    this.needleApi.serverLiquibase.addColumnToEntityChangeset(filePath, content);
  }

  /**
   * @private
   * Add a new load column to a Liquibase changelog file for entity.
   *
   * @param {string} filePath - The full path of the changelog file.
   * @param {string} content - The content to be added as column, can have multiple columns as well
   */
  addLoadColumnToLiquibaseEntityChangeSet(filePath, content) {
    this.needleApi.serverLiquibase.addLoadColumnToEntityChangeSet(filePath, content);
  }

  /**
   * @private
   * Add a new changeset to a Liquibase changelog file for entity.
   *
   * @param {string} filePath - The full path of the changelog file.
   * @param {string} content - The content to be added as changeset
   */
  addChangesetToLiquibaseEntityChangelog(filePath, content) {
    this.needleApi.serverLiquibase.addChangesetToEntityChangelog(filePath, content);
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
   * Add new scss style to the react application in "app.scss".
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
  addAppSCSSStyle(style, comment) {
    this.needleApi.clientReact.addAppSCSSStyle(style, comment);
  }

  /**
   * @private
   * Copy third-party library resources path.
   *
   * @param {string} sourceFolder - third-party library resources source path
   * @param {string} targetFolder - third-party library resources destination path
   */
  copyExternalAssetsInWebpack(sourceFolder, targetFolder) {
    this.needleApi.clientWebpack.copyExternalAssets(sourceFolder, targetFolder);
  }

  /**
   * Add webpack config.
   *
   * @param {string} config - webpack config to be merged
   */
  addWebpackConfig(config, clientFramework) {
    this.needleApi.clientWebpack.addWebpackConfig(config, clientFramework);
  }

  /**
   * @private
   * Add a Maven dependency Management.
   *
   * @param {string} groupId - dependency groupId
   * @param {string} artifactId - dependency artifactId
   * @param {string} version - (optional) explicit dependency version number
   * @param {string} type - (optional) explicit type
   * @param {string} scope - (optional) explicit scope
   * @param {string} other - (optional) explicit other thing:  exclusions...
   */
  addMavenDependencyManagement(groupId, artifactId, version, type, scope, other) {
    this.needleApi.serverMaven.addDependencyManagement(groupId, artifactId, version, type, scope, other);
  }

  /**
   * @private
   * Add a remote Maven Repository to the Maven build.
   *
   * @param {string} id - id of the repository
   * @param {string} url - url of the repository
   * @param  {string} other - (optional) explicit other thing: name, releases, snapshots, ...
   */
  addMavenRepository(id, url, other = '') {
    this.needleApi.serverMaven.addRepository(id, url, other);
  }

  /**
   * @private
   * Add a remote Maven Plugin Repository to the Maven build.
   *
   * @param {string} id - id of the repository
   * @param {string} url - url of the repository
   */
  addMavenPluginRepository(id, url) {
    this.needleApi.serverMaven.addPluginRepository(id, url);
  }

  /**
   * @private
   * Add a distributionManagement to the Maven build.
   *
   * @param {string} snapshotsId Snapshots Repository Id
   * @param {string} snapshotsUrl Snapshots Repository Url
   * @param {string} releasesId Repository Id
   * @param {string} releasesUrl Repository Url
   */
  addMavenDistributionManagement(snapshotsId, snapshotsUrl, releasesId, releasesUrl) {
    this.needleApi.serverMaven.addDistributionManagement(snapshotsId, snapshotsUrl, releasesId, releasesUrl);
  }

  /**
   * @private
   * Add a new Maven property.
   *
   * @param {string} name - property name
   * @param {string} value - property value
   */
  addMavenProperty(name, value) {
    this.needleApi.serverMaven.addProperty(name, value);
  }

  /**
   * @private
   * Add a new Maven dependency.
   *
   * @param {string} groupId - dependency groupId
   * @param {string} artifactId - dependency artifactId
   * @param {string} version - (optional) explicit dependency version number
   * @param {string} other - (optional) explicit other thing: scope, exclusions...
   */
  addMavenDependency(groupId, artifactId, version, other) {
    this.addMavenDependencyInDirectory('.', groupId, artifactId, version, other);
  }

  /**
   * @private
   * Add a new Maven dependency in a specific folder..
   *
   * @param {string} directory - the folder to add the dependency in
   * @param {string} groupId - dependency groupId
   * @param {string} artifactId - dependency artifactId
   * @param {string} version - (optional) explicit dependency version number
   * @param {string} other - (optional) explicit other thing: scope, exclusions...
   */
  addMavenDependencyInDirectory(directory, groupId, artifactId, version, other) {
    this.needleApi.serverMaven.addDependencyInDirectory(directory, groupId, artifactId, version, other);
  }

  /**
   * @private
   * Add a new Maven plugin.
   *
   * @param {string} groupId - plugin groupId
   * @param {string} artifactId - plugin artifactId
   * @param {string} version - explicit plugin version number
   * @param {string} other - explicit other thing: executions, configuration...
   */
  addMavenPlugin(groupId, artifactId, version, other) {
    this.needleApi.serverMaven.addPlugin(groupId, artifactId, version, other);
  }

  /**
   * @private
   * Add a new Maven plugin management.
   *
   * @param {string} groupId - plugin groupId
   * @param {string} artifactId - plugin artifactId
   * @param {string} version - explicit plugin version number
   * @param {string} other - explicit other thing: executions, configuration...
   */
  addMavenPluginManagement(groupId, artifactId, version, other) {
    this.needleApi.serverMaven.addPluginManagement(groupId, artifactId, version, other);
  }

  /**
   * @private
   * Add a new annotation processor path to Maven compiler configuration.
   *
   * @param {string} groupId - plugin groupId
   * @param {string} artifactId - plugin artifactId
   * @param {string} version - explicit plugin version number
   */
  addMavenAnnotationProcessor(groupId, artifactId, version) {
    this.needleApi.serverMaven.addAnnotationProcessor(groupId, artifactId, version);
  }

  /**
   * @private
   * Add a new Maven profile.
   *
   * @param {string} profileId - profile ID
   * @param {string} other - explicit other thing: build, dependencies...
   */
  addMavenProfile(profileId, other) {
    this.needleApi.serverMaven.addProfile(profileId, other);
  }

  /**
   * @private
   * A new Gradle property.
   *
   * @param {string} name - property name
   * @param {string} value - property value
   */
  addGradleProperty(name, value) {
    this.needleApi.serverGradle.addProperty(name, value);
  }

  /**
   * @private
   * A new Gradle plugin.
   *
   * @param {string} group - plugin GroupId
   * @param {string} name - plugin name
   * @param {string} version - explicit plugin version number
   */
  addGradlePlugin(group, name, version) {
    this.needleApi.serverGradle.addPlugin(group, name, version);
  }

  /**
   * @private
   * A new Gradle plugin to plugin management block in settings.gradle
   *
   * @param {string} id - plugin id
   * @param {string} version - explicit plugin version number
   */
  addGradlePluginToPluginManagement(id, version) {
    this.needleApi.serverGradle.addPluginToPluginManagement(id, version);
  }

  /**
   * @private
   * Add Gradle plugin to the plugins block
   *
   * @param {string} id - plugin id
   * @param {string} version - explicit plugin version number
   */
  addGradlePluginToPluginsBlock(id, version) {
    this.needleApi.serverGradle.addPluginToPluginsBlock(id, version);
  }

  /**
   * @private
   * A new dependency to build.gradle file.
   *
   * @param {string} scope - scope of the new dependency, e.g. compile
   * @param {string} group - maven GroupId
   * @param {string} name - maven ArtifactId
   * @param {string} version - (optional) explicit dependency version number
   */
  addGradleDependency(scope, group, name, version) {
    this.addGradleDependencyInDirectory('.', scope, group, name, version);
  }

  /**
   * @private
   * A new dependency to build.gradle file in a specific folder.
   *
   * @param {string} directory - directory
   * @param {string} scope - scope of the new dependency, e.g. compile
   * @param {string} group - maven GroupId
   * @param {string} name - maven ArtifactId
   * @param {string} version - (optional) explicit dependency version number
   */
  addGradleDependencyInDirectory(directory, scope, group, name, version) {
    this.needleApi.serverGradle.addDependencyInDirectory(directory, scope, group, name, version);
  }

  /**
   * @private
   * Apply from an external Gradle build script.
   *
   * @param {string} name - name of the file to apply from, must be 'fileName.gradle'
   */
  applyFromGradleScript(name) {
    this.needleApi.serverGradle.applyFromScript(name);
  }

  /**
   * @private
   * Add a logger to the logback-spring.xml
   *
   * @param {string} logName - name of the log we want to track
   * @param {string} level - tracking level
   */
  addLoggerForLogbackSpring(logName, level) {
    this.needleApi.serverLog.addlog(logName, level);
  }

  /**
   * @private
   * Add a remote Maven Repository to the Gradle build.
   *
   * @param {string} url - url of the repository
   * @param {string} username - (optional) username of the repository credentials
   * @param {string} password - (optional) password of the repository credentials
   */
  addGradleMavenRepository(url, username, password) {
    this.needleApi.serverGradle.addMavenRepository(url, username, password);
  }

  /**
   * @private
   * Add a remote Maven repository to the Gradle plugin management block in settings.gradle
   *
   * @param {string} url - url of the repository
   * @param {string} username - (optional) username of the repository credentials
   * @param {string} password - (optional) password of the repository credentials
   */
  addGradlePluginManagementRepository(url, username, password) {
    this.needleApi.serverGradle.addPluginManagementRepository(url, username, password);
  }

  /**
   * Generate a date to be used by Liquibase changelogs.
   *
   * @param {Boolean} [reproducible=true] - Set true if the changelog date can be reproducible.
   *                                 Set false to create a changelog date incrementing the last one.
   * @return {String} Changelog date.
   */
  dateFormatForLiquibase(reproducible = this.configOptions.reproducible) {
    let now = new Date();
    // Miliseconds is ignored for changelogDate.
    now.setMilliseconds(0);
    // Run reproducible timestamp when regenerating the project with with-entities option.
    if (reproducible || this.configOptions.creationTimestamp) {
      if (this.configOptions.reproducibleLiquibaseTimestamp) {
        // Counter already started.
        now = this.configOptions.reproducibleLiquibaseTimestamp;
      } else {
        // Create a new counter
        const creationTimestamp = this.configOptions.creationTimestamp || this.config.get('creationTimestamp');
        now = creationTimestamp ? new Date(creationTimestamp) : now;
        now.setMilliseconds(0);
      }
      now.setMinutes(now.getMinutes() + 1);
      this.configOptions.reproducibleLiquibaseTimestamp = now;

      // Reproducible build can create future timestamp, save it.
      const lastLiquibaseTimestamp = this.config.get('lastLiquibaseTimestamp');
      if (!lastLiquibaseTimestamp || now.getTime() > lastLiquibaseTimestamp) {
        this.config.set('lastLiquibaseTimestamp', now.getTime());
      }
    } else {
      // Get and store lastLiquibaseTimestamp, a future timestamp can be used
      let lastLiquibaseTimestamp = this.config.get('lastLiquibaseTimestamp');
      if (lastLiquibaseTimestamp) {
        lastLiquibaseTimestamp = new Date(lastLiquibaseTimestamp);
        if (lastLiquibaseTimestamp >= now) {
          now = lastLiquibaseTimestamp;
          now.setSeconds(now.getSeconds() + 1);
          now.setMilliseconds(0);
        }
      }
      this.config.set('lastLiquibaseTimestamp', now.getTime());
    }
    return formatDateForChangelog(now);
  }

  /**
   * @private
   * Rewrite the specified file with provided content at the needle location
   *
   * @param {string} filePath - path of the source file to rewrite
   * @param {string} needle - needle to look for where content will be inserted
   * @param {string} content - content to be written
   * @returns {boolean} true if the body has changed.
   */
  rewriteFile(filePath, needle, content) {
    const rewriteFileModel = this.needleApi.base.generateFileModel(filePath, needle, content);
    return this.needleApi.base.addBlockContentToFile(rewriteFileModel);
  }

  /**
   * Compose with a jhipster generator using default jhipster config.
   * @param {string} generator - jhipster generator.
   * @param {object} [args] - args to pass
   * @param {object} [options] - options to pass
   * @param {object} [composeOptions] - compose options
   * @return {object} the composed generator
   */
  composeWithJHipster(generator, args, options, { immediately = false } = {}) {
    assert(typeof generator === 'string', 'generator should to be a string');
    const namespace = generator.includes(':') ? generator : `jhipster:${generator}`;
    if (!Array.isArray(args)) {
      options = args;
      args = [];
    }

    if (this.env.get(namespace)) {
      generator = namespace;
    } else {
      // Keep test compatibily were jhipster lookup does not run.
      const found = ['/index.js', '/index.cjs', '/index.mjs', '/index.ts', '/index.cts', '/index.mts'].find(extension => {
        const pathToLook = join(__dirname, `../${generator}${extension}`);
        return existsSync(pathToLook) ? pathToLook : undefined;
      });
      if (!found) {
        throw new Error(`Generator ${generator} was not found`);
      }
      generator = join(__dirname, `../${generator}${found}`);
    }

    return this.env.composeWith(
      generator,
      args,
      {
        ...this.options,
        destinationRoot: this._destinationRoot,
        configOptions: this.configOptions,
        ...options,
      },
      !immediately
    );
  }

  /**
   * Compose with a jhipster generator using default jhipster config, but queue it immediately.
   * @param {String} generator - jhipster generator.
   * @param {String[]} [args] - arguments to pass
   * @param {Object} [options] - options to pass
   * @return {Promise<any>} the composed generator
   */
  dependsOnJHipster(generator, args, options) {
    return this.composeWithJHipster(generator, args, options, { immediately: true });
  }

  /**
   * @private
   * Get a name suitable for microservice
   * @param {string} microserviceName
   */
  getMicroserviceAppName(microserviceName) {
    return _.camelCase(microserviceName) + (microserviceName.endsWith('App') ? '' : 'App');
  }

  /**
   * get sorted list of entitiy names according to changelog date (i.e. the order in which they were added)
   */
  getExistingEntityNames() {
    return this.getExistingEntities().map(entity => entity.name);
  }

  /**
   * @private
   * Read entity json from config folder.
   * @param {string} entityName - Entity name
   * @return {object} entity definition
   */
  readEntityJson(entityName) {
    const file = path.join(path.dirname(this.config.path), JHIPSTER_CONFIG_DIR, `${entityName}.json`);
    try {
      return this.fs.readJSON(file);
    } catch (error) {
      this.warning(`Unable to parse ${file}, is the entity file malformed or invalid?`);
      this.debug('Error:', error);
      return undefined;
    }
  }

  /**
   * get sorted list of entities according to changelog date (i.e. the order in which they were added)
   */
  getExistingEntities() {
    function isBefore(e1, e2) {
      return e1.definition.changelogDate - e2.definition.changelogDate;
    }

    const configDir = this.destinationPath(JHIPSTER_CONFIG_DIR);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir);
    }
    const dir = fs.opendirSync(configDir);
    const entityNames = [];
    let dirent = dir.readSync();
    while (dirent !== null) {
      const extname = path.extname(dirent.name);
      if (dirent.isFile() && extname === '.json') {
        entityNames.push(path.basename(dirent.name, extname));
      }
      dirent = dir.readSync();
    }
    dir.closeSync();

    const entities = [...new Set((this.jhipsterConfig.entities || []).concat(entityNames))]
      .map(entityName => ({ name: entityName, definition: this.readEntityJson(entityName) }))
      .filter(entity => entity && !entity.builtInUser && entity.definition)
      .sort(isBefore);
    this.jhipsterConfig.entities = entities.map(({ name }) => name);
    return entities;
  }

  /**
   * Check if the JHipster version used to generate an existing project is less than the passed version argument
   *
   * @param {string} version - A valid semver version string
   */
  isJhipsterVersionLessThan(version) {
    const jhipsterOldVersion = this.jhipsterOldVersion || this.configOptions.jhipsterOldVersion;
    if (!jhipsterOldVersion) {
      // if old version is unknown then can't compare and return false
      return false;
    }
    return semver.lt(jhipsterOldVersion, version);
  }

  /**
   * @private
   * get a table name in JHipster preferred style.
   *
   * @param {string} value - table name string
   */
  getTableName(value) {
    return hibernateSnakeCase(value);
  }

  /**
   * @private
   * get a table column name in JHipster preferred style.
   *
   * @param {string} value - table column name string
   */
  getColumnName(value) {
    return hibernateSnakeCase(value);
  }

  /**
   * @private
   * get a table name for joined tables in JHipster preferred style.
   *
   * @param {string} entityName - name of the entity
   * @param {string} relationshipName - name of the related entity
   * @param {string} prodDatabaseType - database type
   */
  getJoinTableName(entityName, relationshipName, prodDatabaseType) {
    const legacyDbNames = this.jhipsterConfig && this.jhipsterConfig.legacyDbNames;
    const separator = legacyDbNames ? '_' : '__';
    const prefix = legacyDbNames ? '' : 'rel_';
    const joinTableName = `${prefix}${this.getTableName(entityName)}${separator}${this.getTableName(relationshipName)}`;
    const { name, tableNameMaxLength } = databaseData[prodDatabaseType] || {};
    // FIXME: In V8, remove specific condition for POSTGRESQL joinTableName.length === 63
    if (
      tableNameMaxLength &&
      (joinTableName.length > tableNameMaxLength || (prodDatabaseType === POSTGRESQL && joinTableName.length === 63)) &&
      !this.skipCheckLengthOfIdentifier
    ) {
      this.warning(
        `The generated join table "${joinTableName}" is too long for ${name} (which has a ${tableNameMaxLength} character limit). It will be truncated!`
      );
      return calculateDbNameWithLimit(entityName, relationshipName, tableNameMaxLength, { prefix, separator, appendHash: !legacyDbNames });
    }
    return joinTableName;
  }

  /**
   * @private
   * get a constraint name for tables in JHipster preferred style
   *
   * @param {string} entityName - name of the entity
   * @param {string} columnOrRelationName - name of the column or related entity
   * @param {string} prodDatabaseType - database type
   * @param {boolean} noSnakeCase - do not convert names to snakecase
   * @param {string} prefix - constraintName prefix for the constraintName
   * @param {string} suffix - constraintName suffix for the constraintName
   */
  getConstraintName(entityName, columnOrRelationName, prodDatabaseType, noSnakeCase, prefix = '', suffix = '') {
    let constraintName;
    const legacyDbNames = this.jhipsterConfig && this.jhipsterConfig.legacyDbNames;
    const separator = legacyDbNames ? '_' : '__';
    if (noSnakeCase) {
      constraintName = `${prefix}${entityName}${separator}${columnOrRelationName}${suffix}`;
    } else {
      constraintName = `${prefix}${this.getTableName(entityName)}${separator}${this.getTableName(columnOrRelationName)}${suffix}`;
    }
    const { name, constraintNameMaxLength } = databaseData[prodDatabaseType] || {};
    if (constraintNameMaxLength && constraintName.length > constraintNameMaxLength && !this.skipCheckLengthOfIdentifier) {
      this.warning(
        `The generated constraint name "${constraintName}" is too long for ${name} (which has a ${constraintNameMaxLength} character limit). It will be truncated!`
      );
      return `${calculateDbNameWithLimit(entityName, columnOrRelationName, constraintNameMaxLength - suffix.length, {
        separator,
        noSnakeCase,
        prefix,
        appendHash: !legacyDbNames,
      })}${suffix}`;
    }
    return constraintName;
  }

  /**
   * @deprecated Should be removed in V8 in favour of getConstraintName
   *
   * get a constraint name for tables in JHipster preferred style after applying any length limits required.
   *
   * @param {string} entityName - name of the entity
   * @param {string} columnOrRelationName - name of the column or related entity
   * @param {string} prodDatabaseType - database type
   * @param {boolean} noSnakeCase - do not convert names to snakecase
   * @param {string} prefix - constraintName prefix for the constraintName
   */
  getConstraintNameWithLimit(entityName, columnOrRelationName, prodDatabaseType, noSnakeCase, prefix = '') {
    let constraintName;
    const legacyDbNames = this.jhipsterConfig && this.jhipsterConfig.legacyDbNames;
    const separator = legacyDbNames ? '_' : '__';
    if (noSnakeCase) {
      constraintName = `${prefix}${entityName}${separator}${columnOrRelationName}`;
    } else {
      constraintName = `${prefix}${this.getTableName(entityName)}${separator}${this.getTableName(columnOrRelationName)}`;
    }
    let limit = 0;
    if (prodDatabaseType === MYSQL && constraintName.length >= 61 && !this.skipCheckLengthOfIdentifier) {
      this.warning(
        `The generated constraint name "${constraintName}" is too long for MySQL (which has a 64 character limit). It will be truncated!`
      );

      limit = 62;
    } else if (prodDatabaseType === POSTGRESQL && constraintName.length >= 60 && !this.skipCheckLengthOfIdentifier) {
      this.warning(
        `The generated constraint name "${constraintName}" is too long for PostgreSQL (which has a 63 character limit). It will be truncated!`
      );

      limit = 61;
    } else if (prodDatabaseType === MARIADB && constraintName.length >= 61 && !this.skipCheckLengthOfIdentifier) {
      this.warning(
        `The generated constraint name "${constraintName}" is too long for MariaDB (which has a 64 character limit). It will be truncated!`
      );

      limit = 62;
    }
    return limit === 0
      ? constraintName
      : calculateDbNameWithLimit(entityName, columnOrRelationName, limit - 1, {
          separator,
          noSnakeCase,
          prefix,
          appendHash: !legacyDbNames,
        });
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
  getFKConstraintName(entityName, relationshipName, prodDatabaseType, noSnakeCase) {
    // FIXME: In V8, this should use only this.getConstraintName that calculates constraint length correctly
    return prodDatabaseType === ORACLE
      ? this.getConstraintName(entityName, relationshipName, prodDatabaseType, noSnakeCase, 'fk_', '_id')
      : `${this.getConstraintNameWithLimit(entityName, relationshipName, prodDatabaseType, noSnakeCase, 'fk_')}_id`;
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
  getUXConstraintName(entityName, columnName, prodDatabaseType, noSnakeCase) {
    // FIXME: In V8, this should use only this.getConstraintName that calculates constraint length correctly
    return prodDatabaseType === ORACLE
      ? this.getConstraintName(entityName, columnName, prodDatabaseType, noSnakeCase, 'ux_')
      : `ux_${this.getConstraintNameWithLimit(entityName, columnName, prodDatabaseType, noSnakeCase)}`;
  }

  /**
   * Print an error message.
   *
   * @param {string} msg - message to print
   */
  error(msg) {
    if (this._debug && this._debug.enabled) {
      this._debug(`${chalk.red.bold('ERROR!')} ${msg}`);
    }
    throw new Error(`${msg}`);
  }

  /**
   * Print a warning message.
   *
   * @param {string} msg - message to print
   */
  warning(msg) {
    const warn = `${chalk.yellow.bold('WARNING!')} ${msg}`;
    this.log(warn);
    if (this._debug && this._debug.enabled) {
      this._debug(warn);
    }
  }

  /**
   * Print an info message.
   *
   * @param {string} msg - message to print
   */
  info(msg) {
    this.log.info(msg);
    if (this._debug && this._debug.enabled) {
      this._debug(`${chalk.green('INFO!')} ${msg}`);
    }
  }

  /**
   * Print a success message.
   *
   * @param {string} msg - message to print
   */
  success(msg) {
    this.log.ok(msg);
  }

  /**
   * @private
   * Generate a KeyStore.
   */
  generateKeyStore() {
    let keystoreFolder = `${SERVER_MAIN_RES_DIR}config/tls/`;
    if (this.destinationPath) {
      keystoreFolder = this.destinationPath(keystoreFolder);
    }
    const keyStoreFile = `${keystoreFolder}/keystore.p12`;

    if (this.fs.exists(keyStoreFile)) {
      this.log(chalk.cyan(`\nKeyStore '${keyStoreFile}' already exists. Leaving unchanged.\n`));
    } else {
      try {
        shelljs.mkdir('-p', keystoreFolder);
      } catch (error) {
        // noticed that on windows the shelljs.mkdir tends to sometimes fail
        fs.mkdir(keystoreFolder, { recursive: true }, err => {
          if (err) throw err;
        });
      }
      const javaHome = shelljs.env.JAVA_HOME;
      let keytoolPath = '';
      if (javaHome) {
        keytoolPath = `${javaHome}/bin/`;
      }
      if (process.env.FAKE_KEYTOOL === 'true') {
        this.writeDestination(keyStoreFile, 'fake key-tool');
        return;
      }
      const done = this.async();
      // Generate the PKCS#12 keystore
      shelljs.exec(
        // prettier-ignore
        `"${keytoolPath}keytool" -genkey -noprompt `
                + '-storetype PKCS12 '
                + '-keyalg RSA '
                + '-alias selfsigned '
                + `-keystore "${keyStoreFile}" `
                + '-storepass password '
                + '-keypass password '
                + '-keysize 2048 '
                + '-validity 99999 '
                + `-dname "CN=Java Hipster, OU=Development, O=${this.packageName}, L=, ST=, C="`,
        code => {
          if (code !== 0) {
            this.warning("\nFailed to create a KeyStore with 'keytool'", code);
          } else {
            this.log(chalk.green(`\nKeyStore '${keyStoreFile}' generated successfully.\n`));
          }
          done();
        }
      );
    }
  }

  /**
   * Prints a JHipster logo.
   */
  printJHipsterLogo() {
    this.log(chalk.white(`Application files will be generated in folder: ${chalk.yellow(process.cwd())}`));
    if (process.cwd() === this.getUserHome()) {
      this.log(chalk.red.bold('\n️⚠️  WARNING ⚠️  You are in your HOME folder!'));
      this.log(chalk.red('This can cause problems, you should always create a new directory and run the jhipster command from here.'));
      this.log(chalk.white(`See the troubleshooting section at ${chalk.yellow('https://www.jhipster.tech/installation/')}`));
    }
    this.log(
      chalk.green(' _______________________________________________________________________________________________________________\n')
    );
    this.log(
      chalk.white(`  Documentation for creating an application is at ${chalk.yellow('https://www.jhipster.tech/creating-an-app/')}`)
    );
    this.log(
      chalk.white(
        `  If you find JHipster useful, consider sponsoring the project at ${chalk.yellow('https://opencollective.com/generator-jhipster')}`
      )
    );
    this.log(
      chalk.green(' _______________________________________________________________________________________________________________\n')
    );
  }

  /**
   * @private
   * Return the user home
   */
  getUserHome() {
    return process.env[isWin32 ? 'USERPROFILE' : 'HOME'];
  }

  /**
   * @private
   * Checks if there is a newer JHipster version available.
   */
  checkForNewVersion() {
    try {
      const done = this.async();
      shelljs.exec(
        `npm show ${GENERATOR_JHIPSTER} version --fetch-retries 1 --fetch-retry-mintimeout 500 --fetch-retry-maxtimeout 500`,
        { silent: true },
        (code, stdout, stderr) => {
          if (!stderr && semver.lt(packagejs.version, stdout)) {
            this.log(
              `${
                chalk.yellow(' ______________________________________________________________________________\n\n') +
                chalk.yellow('  JHipster update available: ') +
                chalk.green.bold(stdout.replace('\n', '')) +
                chalk.gray(` (current: ${packagejs.version})`)
              }\n`
            );
            this.log(chalk.yellow(`  Run ${chalk.magenta(`npm install -g ${GENERATOR_JHIPSTER}`)} to update.\n`));
            this.log(chalk.yellow(' ______________________________________________________________________________\n'));
          }
          done();
        }
      );
    } catch (err) {
      this.debug('Error:', err);
      // fail silently as this function doesn't affect normal generator flow
    }
  }

  /**
   * @private
   * get the frontend application name.
   * @param {string} baseName of application - (defaults to <code>this.jhipsterConfig.baseName</code>)
   */
  getFrontendAppName(baseName = this.jhipsterConfig.baseName) {
    const name = _.camelCase(baseName) + (baseName.endsWith('App') ? '' : 'App');
    return name.match(/^\d/) ? 'App' : name;
  }

  /**
   * get the an upperFirst camelCase value.
   * @param {string} value string to convert
   */
  upperFirstCamelCase(value) {
    return _.upperFirst(_.camelCase(value));
  }

  /**
   * @private
   * get the java main class name.
   * @param {string} baseName of application
   */
  getMainClassName(baseName = this.baseName) {
    const main = _.upperFirst(this.getMicroserviceAppName(baseName));
    const acceptableForJava = new RegExp('^[A-Z][a-zA-Z0-9_]*$');

    return acceptableForJava.test(main) ? main : 'Application';
  }

  /**
   * @private
   * get a hipster based on the applications name.
   * @param {string} baseName of application
   */
  getHipster(baseName = this.baseName) {
    const hash = jhipsterUtils.stringHashCode(baseName);

    switch (hash % 4) {
      case 0:
        return 'jhipster_family_member_0';
      case 1:
        return 'jhipster_family_member_1';
      case 2:
        return 'jhipster_family_member_2';
      case 3:
        return 'jhipster_family_member_3';
      default:
        return 'jhipster_family_member_0';
    }
  }

  /**
   * build a generated application.
   *
   * @param {String} buildTool - maven | gradle
   * @param {String} profile - dev | prod
   * @param {Boolean} buildWar - build a war instead of a jar
   * @param {Function} cb - callback when build is complete
   * @returns {object} the command line and its result
   */
  buildApplication(buildTool, profile, buildWar, cb) {
    let buildCmd = 'mvnw -ntp verify -B';

    if (buildTool === GRADLE) {
      buildCmd = 'gradlew';
      if (buildWar) {
        buildCmd += ' bootWar';
      } else {
        buildCmd += ' bootJar';
      }
    }
    if (buildWar) {
      buildCmd += ' -Pwar';
    }

    if (!isWin32) {
      buildCmd = `./${buildCmd}`;
    }
    buildCmd += ` -P${profile}`;
    return {
      stdout: exec(buildCmd, { maxBuffer: 1024 * 10000 }, cb).stdout,
      buildCmd,
    };
  }

  /**
   * @private
   * run a command using the configured Java build tool.
   *
   * @param {String} buildTool - maven | gradle
   * @param {String} profile - dev | prod
   * @param {String} command - the command (goal/task) to run
   * @param {Function} cb - callback when build is complete
   * @returns {object} the command line and its result
   */
  runJavaBuildCommand(buildTool, profile, command, cb) {
    let buildCmd = `mvnw -ntp -DskipTests=true -B ${command}`;

    if (buildTool === GRADLE) {
      buildCmd = `gradlew -x ${command}`;
    }

    if (!isWin32) {
      buildCmd = `./${buildCmd}`;
    }
    buildCmd += ` -P${profile}`;
    this.log(`Running command: '${chalk.bold(buildCmd)}'`);
    return {
      stdout: exec(buildCmd, { maxBuffer: 1024 * 10000 }, cb).stdout,
      buildCmd,
    };
  }

  /**
   * write the given files using provided options.
   *
   * @template DataType
   * @param {import('./api.mjs').WriteFileOptions<this, DataType>} options
   * @return {Promise<string[]>}
   */
  async writeFiles(options) {
    const paramCount = Object.keys(options).filter(key => ['sections', 'blocks', 'templates'].includes(key)).length;
    assert(paramCount > 0, 'One of sections, blocks or templates is required');
    assert(paramCount === 1, 'Only one of sections, blocks or templates must be provided');

    const { sections, blocks, templates, rootTemplatesPath, context = this, transform: methodTransform = [] } = options;
    const { _: commonSpec = {} } = sections || {};
    const { transform: sectionTransform = [] } = commonSpec;
    const startTime = new Date();

    /* Build lookup order first has preference.
     * Example
     * rootTemplatesPath = ['reactive', 'common']
     * jhipsterTemplatesFolders = ['/.../generator-jhispter-blueprint/server/templates', '/.../generator-jhispter/server/templates']
     *
     * /.../generator-jhispter-blueprint/server/templates/reactive/templatePath
     * /.../generator-jhispter-blueprint/server/templates/common/templatePath
     * /.../generator-jhispter/server/templates/reactive/templatePath
     * /.../generator-jhispter/server/templates/common/templatePath
     */
    let rootTemplatesAbsolutePath;
    if (!rootTemplatesPath) {
      rootTemplatesAbsolutePath = this.jhipsterTemplatesFolders;
    } else if (typeof rootTemplatesPath === 'string' && path.isAbsolute(rootTemplatesPath)) {
      rootTemplatesAbsolutePath = rootTemplatesPath;
    } else {
      rootTemplatesAbsolutePath = this.jhipsterTemplatesFolders
        .map(templateFolder => [].concat(rootTemplatesPath).map(relativePath => path.join(templateFolder, relativePath)))
        .flat();
    }

    const normalizeEjs = file => file.replace('.ejs', '');
    const resolveCallback = (val, fallback) => {
      if (val === undefined) {
        if (typeof fallback === 'function') {
          return resolveCallback(fallback);
        }
        return fallback;
      }
      if (typeof val === 'boolean' || typeof val === 'string') {
        return val;
      }
      if (typeof val === 'function') {
        return val.call(this, context) || false;
      }
      throw new Error(`Type not supported ${val}`);
    };

    const renderTemplate = async ({ sourceFile, destinationFile, options, noEjs, transform, binary }) => {
      const extension = path.extname(sourceFile);
      binary = binary || ['.png', '.jpg', '.gif', '.svg', '.ico'].includes(extension);
      const appendEjs = noEjs === undefined ? !binary && extension !== '.ejs' : !noEjs;
      const ejsFile = appendEjs || extension === '.ejs';

      if (typeof destinationFile === 'function') {
        destinationFile = resolveCallback(destinationFile);
      } else {
        destinationFile = appendEjs ? normalizeEjs(destinationFile) : destinationFile;
      }

      let sourceFileFrom;
      if (Array.isArray(rootTemplatesAbsolutePath)) {
        // Look for existing templates
        const existingTemplates = rootTemplatesAbsolutePath
          .map(rootPath => this.templatePath(rootPath, sourceFile))
          .filter(templateFile => fs.existsSync(appendEjs ? `${templateFile}.ejs` : templateFile));

        if (existingTemplates.length > 1) {
          const moreThanOneMessage = `Multiples templates were found for file ${sourceFile}, using the first
templates: ${JSON.stringify(existingTemplates, null, 2)}`;
          if (existingTemplates.length > 2) {
            this.warning(`Possible blueprint conflict detected: ${moreThanOneMessage}`);
          } else {
            this.debug(moreThanOneMessage);
          }
        }
        sourceFileFrom = existingTemplates.shift();

        if (sourceFileFrom === undefined) {
          throw new Error(`Template file ${sourceFile} was not found at ${rootTemplatesAbsolutePath}`);
        }
      } else if (typeof rootTemplatesAbsolutePath === 'string') {
        sourceFileFrom = this.templatePath(rootTemplatesAbsolutePath, sourceFile);
      } else {
        sourceFileFrom = this.templatePath(sourceFile);
      }
      if (appendEjs) {
        sourceFileFrom = `${sourceFileFrom}.ejs`;
      }

      if (!ejsFile) {
        await this.copyTemplateAsync(sourceFileFrom, destinationFile);
      } else {
        let useAsync = true;
        if (context.entityClass) {
          if (!context.baseName) {
            throw new Error('baseName is require at templates context');
          }
          const basename = path.basename(sourceFileFrom);
          const seed = `${context.entityClass}-${basename}${context.fakerSeed ?? ''}`;
          Object.values(this.configOptions?.sharedEntities ?? {}).forEach(entity => {
            entity.resetFakerSeed(seed);
          });
          Object.values(this.sharedData.getApplication()?.sharedEntities ?? {}).forEach(entity => {
            entity.resetFakerSeed(seed);
          });
          // Async calls will make the render method to be scheduled, allowing the faker key to change in the meantime.
          useAsync = false;
        }

        const renderOptions = {
          ...(options?.renderOptions ?? {}),
          // Set root for ejs to lookup for partials.
          root: rootTemplatesAbsolutePath,
        };
        // TODO drop for v8 final release
        const data = jhipster7Proxy(this, context, { ignoreWarnings: true });
        if (useAsync) {
          await this.renderTemplateAsync(sourceFileFrom, destinationFile, data, renderOptions);
        } else {
          this.renderTemplate(sourceFileFrom, destinationFile, data, renderOptions);
        }
      }
      if (!binary && transform && transform.length) {
        this.editFile(destinationFile, ...transform);
      }
      return destinationFile;
    };

    let parsedBlocks = blocks;
    if (sections) {
      assert(typeof sections === 'object', 'sections must be an object');
      const parsedSections = Object.entries(sections)
        .map(([sectionName, sectionBlocks]) => {
          if (sectionName.startsWith('_')) return undefined;
          assert(Array.isArray(sectionBlocks), `Section must be an array for ${sectionName}`);
          return { sectionName, sectionBlocks };
        })
        .filter(Boolean);

      parsedBlocks = parsedSections
        .map(({ sectionName, sectionBlocks }) => {
          return sectionBlocks.map((block, blockIdx) => {
            const blockSpecPath = `${sectionName}[${blockIdx}]`;
            assert(typeof block === 'object', `Block must be an object for ${blockSpecPath}`);
            return { blockSpecPath, ...block };
          });
        })
        .flat();
    }

    let parsedTemplates;
    if (parsedBlocks) {
      parsedTemplates = parsedBlocks
        .map((block, blockIdx) => {
          const {
            blockSpecPath = `${blockIdx}`,
            path: blockPathValue = './',
            from: blockFromCallback,
            to: blockToCallback,
            condition: blockConditionCallback,
            transform: blockTransform = [],
            renameTo: blockRenameTo,
          } = block;
          assert(typeof block === 'object', `Block must be an object for ${blockSpecPath}`);
          assert(Array.isArray(block.templates), `Block templates must be an array for ${blockSpecPath}`);
          const condition = resolveCallback(blockConditionCallback);
          if (condition !== undefined && !condition) {
            return undefined;
          }
          if (typeof blockPathValue === 'function') {
            throw new Error(`Block path should be static for ${blockSpecPath}`);
          }
          const blockPath = resolveCallback(blockFromCallback, blockPathValue);
          const blockTo = resolveCallback(blockToCallback, blockPath) || blockPath;
          return block.templates.map((fileSpec, fileIdx) => {
            const fileSpecPath = `${blockSpecPath}[${fileIdx}]`;
            assert(typeof fileSpec === 'object' || typeof fileSpec === 'string', `File must be an object or a string for ${fileSpecPath}`);
            let { noEjs } = fileSpec;
            let derivedTransform;
            if (typeof blockTransform === 'boolean') {
              noEjs = !blockTransform;
              derivedTransform = [...methodTransform, ...sectionTransform];
            } else {
              derivedTransform = [...methodTransform, ...sectionTransform, ...blockTransform];
            }
            if (typeof fileSpec === 'string') {
              const sourceFile = path.join(blockPath, fileSpec);
              let destinationFile;
              if (blockRenameTo) {
                destinationFile = this.destinationPath(blockRenameTo.call(this, context, fileSpec, this));
              } else {
                destinationFile = this.destinationPath(blockTo, fileSpec);
              }
              return { sourceFile, destinationFile, noEjs, transform: derivedTransform };
            }

            const { options, file, renameTo, transform: fileTransform = [], binary } = fileSpec;
            let { sourceFile, destinationFile } = fileSpec;

            if (typeof fileTransform === 'boolean') {
              noEjs = !fileTransform;
            } else if (Array.isArray(fileTransform)) {
              derivedTransform = [...derivedTransform, ...fileTransform];
            } else if (fileTransform !== undefined) {
              throw new Error(`Transform ${fileTransform} value is not supported`);
            }

            const normalizedFile = resolveCallback(sourceFile || file);
            sourceFile = path.join(blockPath, normalizedFile);
            destinationFile = this.destinationPath(blockTo, path.join(resolveCallback(destinationFile || renameTo, normalizedFile)));

            const override = resolveCallback(fileSpec.override);
            if (override !== undefined && !override && this.fs.exists(destinationFile)) {
              this.debug(`skipping file ${destinationFile}`);
              return undefined;
            }

            // TODO remove for jhipster 8
            if (noEjs === undefined) {
              const { method } = fileSpec;
              if (method === 'copy') {
                noEjs = true;
              }
            }

            return {
              sourceFile,
              destinationFile,
              options,
              transform: derivedTransform,
              noEjs,
              binary,
            };
          });
        })
        .flat()
        .filter(template => template);
    } else {
      parsedTemplates = templates.map(template => {
        if (typeof template === 'string') {
          return { sourceFile: template, destinationFile: template };
        }
        return template;
      });
    }

    const files = await Promise.all(parsedTemplates.map(template => renderTemplate(template)));
    this.debug(`Time taken to write files: ${new Date() - startTime}ms`);
    return files.filter(file => file);
  }

  /**
   * Parse runtime options.
   * @param {Object} [options] - object to load from.
   * @param {Object} [dest] - object to write to.
   */
  parseCommonRuntimeOptions(options = this.options, dest = this.configOptions) {
    if (dest.jhipsterOldVersion === undefined) {
      // Preserve old jhipsterVersion value for cleanup which occurs after new config is written into disk
      dest.jhipsterOldVersion = this.jhipsterConfig.jhipsterVersion || null;
    }
    if (options.withEntities !== undefined) {
      dest.withEntities = options.withEntities;
    }
    if (options.skipChecks !== undefined) {
      dest.skipChecks = options.skipChecks;
    }
    if (options.debug !== undefined) {
      dest.isDebugEnabled = options.debug;
    }
    if (options.experimental !== undefined) {
      dest.experimental = options.experimental;
    }
    if (options.skipPrompts !== undefined) {
      dest.skipPrompts = options.skipPrompts;
    }
    if (options.skipClient !== undefined) {
      dest.skipClient = options.skipClient;
    }
    if (dest.creationTimestamp === undefined && options.creationTimestamp) {
      const creationTimestamp = this.parseCreationTimestamp(options.creationTimestamp);
      if (creationTimestamp) {
        dest.creationTimestamp = creationTimestamp;
      }
    }
    if (options.reproducible !== undefined) {
      dest.reproducible = options.reproducible;
    }
  }

  /**
   * Load common options to be stored.
   * @param {Object} [options] - options object to be loaded from.
   */
  loadStoredAppOptions(options = this.options) {
    // Parse options only once.
    if (this.configOptions.optionsParsed) return;
    this.configOptions.optionsParsed = true;

    // Load stored options
    if (options.withGeneratedFlag !== undefined) {
      this.jhipsterConfig.withGeneratedFlag = options.withGeneratedFlag;
    }
    if (options.skipJhipsterDependencies !== undefined) {
      this.jhipsterConfig.skipJhipsterDependencies = options.skipJhipsterDependencies;
    }
    if (options.incrementalChangelog !== undefined) {
      this.jhipsterConfig.incrementalChangelog = options.incrementalChangelog;
    }
    if (options.recreateInitialChangelog) {
      this.configOptions.recreateInitialChangelog = options.recreateInitialChangelog;
    }
    if (options.withAdminUi !== undefined) {
      this.jhipsterConfig.withAdminUi = options.withAdminUi;
    }
    if (options.skipClient) {
      this.skipClient = this.jhipsterConfig.skipClient = true;
    }
    if (options.applicationType) {
      this.jhipsterConfig.applicationType = options.applicationType;
    }
    if (options.skipServer) {
      this.skipServer = this.jhipsterConfig.skipServer = true;
    }
    if (options.skipFakeData) {
      this.jhipsterConfig.skipFakeData = true;
    }
    if (options.skipUserManagement) {
      this.jhipsterConfig.skipUserManagement = true;
    }
    if (options.skipCheckLengthOfIdentifier) {
      this.jhipsterConfig.skipCheckLengthOfIdentifier = true;
    }

    if (options.skipCommitHook) {
      this.jhipsterConfig.skipCommitHook = true;
    }

    if (options.monorepository !== undefined) {
      this.jhipsterConfig.monorepository = options.monorepository;
    }

    if (options.baseName) {
      this.jhipsterConfig.baseName = this.options.baseName;
    }
    if (options.db) {
      const databaseType = this.getDBTypeFromDBValue(this.options.db);
      if (databaseType) {
        this.jhipsterConfig.databaseType = databaseType;
      } else if (!this.jhipsterConfig.databaseType) {
        throw new Error(`Could not detect databaseType for database ${this.options.db}`);
      }
      this.jhipsterConfig.devDatabaseType = options.db;
      this.jhipsterConfig.prodDatabaseType = options.db;
    }
    if (options.auth) {
      this.jhipsterConfig.authenticationType = options.auth;
    }
    if (options.searchEngine) {
      this.jhipsterConfig.searchEngine = options.searchEngine;
    }
    if (options.build) {
      this.jhipsterConfig.buildTool = options.build;
    }
    if (options.websocket) {
      this.jhipsterConfig.websocket = options.websocket;
    }
    if (options.jhiPrefix !== undefined) {
      this.jhipsterConfig.jhiPrefix = options.jhiPrefix;
    }
    if (options.entitySuffix !== undefined) {
      this.jhipsterConfig.entitySuffix = options.entitySuffix;
    }
    if (options.dtoSuffix !== undefined) {
      this.jhipsterConfig.dtoSuffix = options.dtoSuffix;
    }
    if (options.clientFramework) {
      this.jhipsterConfig.clientFramework = options.clientFramework;
    }
    if (options.testFrameworks) {
      this.jhipsterConfig.testFrameworks = [...new Set([...(this.jhipsterConfig.testFrameworks || []), ...options.testFrameworks])];
    }
    if (options.cypressCoverage !== undefined) {
      this.jhipsterConfig.cypressCoverage = options.cypressCoverage;
    }
    if (options.cypressAudit !== undefined) {
      this.jhipsterConfig.cypressAudit = options.cypressAudit;
    }
    if (options.legacyDbNames !== undefined) {
      this.jhipsterConfig.legacyDbNames = options.legacyDbNames;
    }
    if (options.enableTranslation !== undefined) {
      this.jhipsterConfig.enableTranslation = options.enableTranslation;
    }
    if (options.autoCrlf !== undefined) {
      this.jhipsterConfig.autoCrlf = options.autoCrlf;
    }
    if (options.language) {
      // workaround double options parsing, remove once generator supports skipping parse options
      const languages = options.language.flat();
      if (languages.length === 1 && languages[0] === 'false') {
        this.jhipsterConfig.enableTranslation = false;
      } else {
        this.jhipsterConfig.languages = [...(this.jhipsterConfig.languages || []), ...languages];
      }
    }
    if (options.nativeLanguage) {
      if (typeof options.nativeLanguage === 'string') {
        this.jhipsterConfig.nativeLanguage = options.nativeLanguage;
        if (!this.jhipsterConfig.languages) {
          this.jhipsterConfig.languages = [options.nativeLanguage];
        }
      } else if (options.nativeLanguage === true) {
        this.jhipsterConfig.nativeLanguage = detectLanguage();
      }
    }

    if (options.creationTimestamp) {
      const creationTimestamp = this.parseCreationTimestamp(options.creationTimestamp);
      if (creationTimestamp) {
        this.configOptions.creationTimestamp = creationTimestamp;
        if (this.jhipsterConfig.creationTimestamp === undefined) {
          this.jhipsterConfig.creationTimestamp = creationTimestamp;
        }
      }
    }

    if (options.pkType) {
      this.jhipsterConfig.pkType = options.pkType;
    }

    if (options.cacheProvider !== undefined) {
      this.jhipsterConfig.cacheProvider = options.cacheProvider;
    }

    if (options.enableHibernateCache !== undefined) {
      this.jhipsterConfig.enableHibernateCache = options.enableHibernateCache;
    }

    if (options.microfrontend) {
      this.jhipsterConfig.microfrontend = options.microfrontend;
    }

    if (options.reactive !== undefined) {
      this.jhipsterConfig.reactive = options.reactive;
    }

    if (options.enableSwaggerCodegen !== undefined) {
      this.jhipsterConfig.enableSwaggerCodegen = options.enableSwaggerCodegen;
    }

    if (options.clientPackageManager) {
      this.jhipsterConfig.clientPackageManager = options.clientPackageManager;
    }
    if (this.jhipsterConfig.clientPackageManager) {
      const usingNpm = this.jhipsterConfig.clientPackageManager === 'npm';
      if (!usingNpm) {
        this.warning(`Using unsupported package manager: ${this.jhipsterConfig.clientPackageManager}. Install will not be executed.`);
        options.skipInstall = true;
      }
    }
  }

  /**
   * Load runtime options into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {any} config - config to load config from
   * @param {any} dest - destination context to use default is context
   */
  loadRuntimeOptions(config = this.configOptions, dest = this) {
    dest.withEntities = config.withEntities;
    dest.skipChecks = config.skipChecks;
    dest.isDebugEnabled = config.isDebugEnabled;
    dest.experimental = config.experimental;
    dest.logo = config.logo;
    config.backendName = config.backendName || 'Java';
    dest.backendName = config.backendName;

    config.nodeDependencies = config.nodeDependencies || {
      prettier: packagejs.dependencies.prettier,
      'prettier-plugin-java': packagejs.dependencies['prettier-plugin-java'],
      'prettier-plugin-packagejson': packagejs.dependencies['prettier-plugin-packagejson'],
    };
    dest.nodeDependencies = config.nodeDependencies;

    // Deprecated use nodeDependencies instead
    config.dependabotPackageJson = config.dependabotPackageJson || {};
    dest.dependabotPackageJson = config.dependabotPackageJson;
  }

  /**
   * Register and parse common options.
   */
  registerCommonOptions() {
    this.jhipsterOptions(commonOptions);
  }

  /**
   * Load app configs into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {any} config - config to load config from
   * @param {any} dest - destination context to use default is context
   */
  loadAppConfig(config = this.jhipsterConfigWithDefaults, dest = this) {
    if (this.sharedData.getControl().useVersionPlaceholders) {
      dest.nodeVersion = 'NODE_VERSION';
    } else {
      dest.nodeVersion = NODE_VERSION;
    }

    dest.jhipsterVersion = config.jhipsterVersion;
    dest.baseName = config.baseName;
    dest.applicationType = config.applicationType;
    dest.reactive = config.reactive;
    dest.jhiPrefix = config.jhiPrefix;
    dest.skipFakeData = config.skipFakeData;
    dest.entitySuffix = config.entitySuffix;
    dest.dtoSuffix = config.dtoSuffix;
    dest.skipCheckLengthOfIdentifier = config.skipCheckLengthOfIdentifier;
    dest.microfrontend = config.microfrontend;
    dest.microfrontends = config.microfrontends;

    dest.skipServer = config.skipServer;
    dest.skipCommitHook = config.skipCommitHook;
    dest.blueprints = config.blueprints || [];
    dest.skipClient = config.skipClient;
    dest.prettierJava = config.prettierJava;
    dest.pages = config.pages;
    dest.skipJhipsterDependencies = !!config.skipJhipsterDependencies;
    dest.withAdminUi = config.withAdminUi;
    dest.gatewayServerPort = config.gatewayServerPort;

    dest.capitalizedBaseName = config.capitalizedBaseName;
    dest.dasherizedBaseName = config.dasherizedBaseName;
    dest.humanizedBaseName = config.humanizedBaseName;
    dest.projectDescription = config.projectDescription;

    dest.testFrameworks = config.testFrameworks || [];

    dest.remotes = Object.entries(config.applications || {}).map(([baseName, config]) => ({ baseName, ...config })) || [];

    dest.gatlingTests = dest.testFrameworks.includes(GATLING);
    dest.cucumberTests = dest.testFrameworks.includes(CUCUMBER);
    dest.cypressTests = dest.testFrameworks.includes(CYPRESS);

    dest.authenticationType = config.authenticationType;
    dest.rememberMeKey = config.rememberMeKey;
    dest.jwtSecretKey = config.jwtSecretKey;
    dest.fakerSeed = config.fakerSeed;
    dest.skipUserManagement = config.skipUserManagement;
  }

  /**
   * @param {Object} dest - destination context to use default is context
   */
  loadDerivedMicroserviceAppConfig(dest = this) {
    dest.jhiPrefixCapitalized = _.upperFirst(dest.jhiPrefix);
    dest.jhiPrefixDashed = _.kebabCase(dest.jhiPrefix);
  }

  /**
   * @param {Object} dest - destination context to use default is context
   */
  loadDerivedAppConfig(dest = this) {
    this.loadDerivedMicroserviceAppConfig(dest);
    dest.applicationTypeGateway = dest.applicationType === GATEWAY;
    dest.applicationTypeMonolith = dest.applicationType === MONOLITH;
    dest.applicationTypeMicroservice = dest.applicationType === MICROSERVICE;

    // Application name modified, using each technology's conventions
    if (dest.baseName) {
      dest.camelizedBaseName = _.camelCase(dest.baseName);
      dest.hipster = this.getHipster(dest.baseName);
      dest.capitalizedBaseName = dest.capitalizedBaseName || _.upperFirst(dest.baseName);
      dest.dasherizedBaseName = dest.dasherizedBaseName || _.kebabCase(dest.baseName);
      dest.lowercaseBaseName = dest.baseName.toLowerCase();
      dest.upperFirstCamelCaseBaseName = this.upperFirstCamelCase(dest.baseName);
      dest.humanizedBaseName =
        dest.humanizedBaseName || (dest.baseName.toLowerCase() === 'jhipster' ? 'JHipster' : _.startCase(dest.baseName));
      dest.projectDescription = dest.projectDescription || `Description for ${dest.baseName}`;
      dest.endpointPrefix = dest.applicationTypeMicroservice ? `services/${dest.lowercaseBaseName}` : '';
    }

    if (dest.microfrontends && dest.microfrontends.length > 0) {
      dest.microfrontends.forEach(microfrontend => {
        const { baseName } = microfrontend;
        microfrontend.lowercaseBaseName = baseName.toLowerCase();
        microfrontend.capitalizedBaseName = _.upperFirst(baseName);
        microfrontend.endpointPrefix = `services/${microfrontend.lowercaseBaseName}`;
      });
    } else if ((!dest.microfrontends || dest.microfrontends.length === 0) && dest.remotes) {
      dest.remotes.forEach(app => this.loadDerivedAppConfig(app));
      dest.microfrontends = dest.remotes.filter(r => r.clientFramework && r.clientFramework !== CLIENT_FRAMEWORK_NO);
    }
    dest.microfrontend =
      dest.microfrontend ||
      (dest.applicationTypeMicroservice && !dest.skipClient) ||
      (dest.applicationTypeGateway && dest.microfrontends && dest.microfrontends.length > 0);

    if (dest.microfrontend && dest.applicationTypeMicroservice && !dest.gatewayServerPort) {
      dest.gatewayServerPort = 8080;
    }

    dest.authenticationTypeSession = dest.authenticationType === SESSION;
    dest.authenticationTypeJwt = dest.authenticationType === JWT;
    dest.authenticationTypeOauth2 = dest.authenticationType === OAUTH2;

    dest.generateUserManagement = !dest.skipUserManagement && dest.authenticationType !== OAUTH2 && dest.applicationType !== MICROSERVICE;
    dest.generateBuiltInUserEntity = dest.generateUserManagement;
  }

  /**
   * Load client configs into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {any} config - config to load config from
   * @param {any} dest - destination context to use default is context
   */
  loadClientConfig(config = this.jhipsterConfigWithDefaults, dest = this) {
    dest.clientPackageManager = config.clientPackageManager;
    dest.clientFramework = config.clientFramework;
    dest.clientTheme = config.clientTheme;
    dest.clientThemeVariant = config.clientThemeVariant;
    dest.devServerPort = config.devServerPort;

    dest.clientSrcDir = config.clientSrcDir || CLIENT_MAIN_SRC_DIR;
    dest.clientTestDir = config.clientTestDir || CLIENT_TEST_SRC_DIR;
  }

  /**
   * @param {Object} dest - destination context to use default is context
   */
  loadDerivedClientConfig(dest = this) {
    dest.clientFrameworkAngular = dest.clientFramework === ANGULAR;
    dest.clientFrameworkReact = dest.clientFramework === REACT;
    dest.clientFrameworkVue = dest.clientFramework === VUE;
    dest.clientFrameworkNo = dest.clientFramework === CLIENT_FRAMEWORK_NO;
    dest.clientFrameworkAny = dest.clientFramework && dest.clientFramework !== CLIENT_FRAMEWORK_NO;
    if (dest.microfrontend === undefined) {
      if (dest.applicationTypeMicroservice) {
        dest.microfrontend = dest.clientFrameworkAny;
      } else if (dest.applicationTypeGateway) {
        dest.microfrontend = dest.microfrontends.length > 0;
      }
    }
    dest.clientThemeNone = dest.clientTheme === 'none';
    dest.clientThemePrimary = dest.clientThemeVariant === 'primary';
    dest.clientThemeLight = dest.clientThemeVariant === 'light';
    dest.clientThemeDark = dest.clientThemeVariant === 'dark';

    if (dest.baseName) {
      dest.frontendAppName = this.getFrontendAppName(dest.baseName);
    }
  }

  /**
   * Load translation configs into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {any} config - config to load config from
   * @param {any} dest - destination context to use default is context
   */
  loadTranslationConfig(config = this.jhipsterConfigWithDefaults, dest = this) {
    dest.enableTranslation = config.enableTranslation;
    dest.nativeLanguage = config.nativeLanguage;
    dest.languages = config.languages;
    dest.enableI18nRTL = dest.languages && this.isI18nRTLSupportNecessary(dest.languages);
  }

  /**
   * Load server configs into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {Object} config - config to load config from
   * @param {import('./bootstrap-application-server/types').SpringBootApplication} dest - destination context to use default is context
   */
  loadServerConfig(config = this.jhipsterConfigWithDefaults, dest = this) {
    dest.packageName = config.packageName;
    dest.packageFolder = config.packageFolder && normalizePathEnd(config.packageFolder);
    dest.serverPort = config.serverPort;

    dest.srcMainJava = SERVER_MAIN_SRC_DIR;
    dest.srcMainResources = SERVER_MAIN_RES_DIR;
    dest.srcMainWebapp = CLIENT_MAIN_SRC_DIR;
    dest.srcTestJava = SERVER_TEST_SRC_DIR;
    dest.srcTestResources = SERVER_TEST_RES_DIR;
    dest.srcTestJavascript = CLIENT_TEST_SRC_DIR;

    dest.buildTool = config.buildTool;

    dest.databaseType = config.databaseType;
    dest.devDatabaseType = config.devDatabaseType;
    dest.prodDatabaseType = config.prodDatabaseType;
    dest.incrementalChangelog = config.incrementalChangelog;
    dest.reactive = config.reactive;
    dest.searchEngine = config.searchEngine;
    dest.cacheProvider = config.cacheProvider;
    dest.enableHibernateCache = config.enableHibernateCache;
    dest.serviceDiscoveryType = config.serviceDiscoveryType;

    dest.enableSwaggerCodegen = config.enableSwaggerCodegen;
    dest.messageBroker = config.messageBroker;
    dest.websocket = config.websocket;
    dest.embeddableLaunchScript = config.embeddableLaunchScript;

    dest.enableGradleEnterprise = config.enableGradleEnterprise;

    if (config.gradleEnterpriseHost && !config.gradleEnterpriseHost.startsWith('https://')) {
      dest.gradleEnterpriseHost = `https://${config.gradleEnterpriseHost}`;
    } else {
      dest.gradleEnterpriseHost = config.gradleEnterpriseHost;
    }
  }

  /**
   * @param {import('./bootstrap-application-server/types').SpringBootApplication} dest - destination context to use default is context
   */
  loadDerivedServerConfig(dest = this) {
    if (!dest.packageFolder) {
      dest.packageFolder = `${dest.packageName.replace(/\./g, '/')}/`;
    }

    dest.javaPackageSrcDir = normalizePathEnd(`${dest.srcMainJava}${dest.packageFolder}`);
    dest.javaPackageTestDir = normalizePathEnd(`${dest.srcTestJava}${dest.packageFolder}`);

    dest.serviceDiscoveryAny = dest.serviceDiscoveryType && dest.serviceDiscoveryType !== NO_SERVICE_DISCOVERY;
    // Convert to false for templates.
    if (dest.serviceDiscoveryType === NO_SERVICE_DISCOVERY || !dest.serviceDiscoveryType) {
      dest.serviceDiscoveryType = false;
    }
    if (dest.websocket === NO_WEBSOCKET || !dest.websocket) {
      dest.websocket = false;
    }
    if (dest.searchEngine === NO_SEARCH_ENGINE || !dest.searchEngine) {
      dest.searchEngine = false;
    }
    if (dest.messageBroker === NO_MESSAGE_BROKER || !dest.messageBroker) {
      dest.messageBroker = false;
    }

    dest.buildToolGradle = dest.buildTool === GRADLE;
    dest.buildToolMaven = dest.buildTool === MAVEN;
    dest.buildToolUnknown = !dest.buildToolGradle && !dest.buildToolMaven;
    dest.buildDir = this.getBuildDirectoryForBuildTool(dest.buildTool);

    dest.cacheProviderNo = dest.cacheProvider === NO_CACHE;
    dest.cacheProviderCaffeine = dest.cacheProvider === CAFFEINE;
    dest.cacheProviderEhCache = dest.cacheProvider === EHCACHE;
    dest.cacheProviderHazelcast = dest.cacheProvider === HAZELCAST;
    dest.cacheProviderInfinispan = dest.cacheProvider === INFINISPAN;
    dest.cacheProviderMemcached = dest.cacheProvider === MEMCACHED;
    dest.cacheProviderRedis = dest.cacheProvider === REDIS;

    dest.devDatabaseTypeH2Disk = dest.devDatabaseType === H2_DISK;
    dest.devDatabaseTypeH2Memory = dest.devDatabaseType === H2_MEMORY;
    dest.devDatabaseTypeH2Any = dest.devDatabaseTypeH2Disk || dest.devDatabaseTypeH2Memory;
    dest.devDatabaseTypeCouchbase = dest.devDatabaseType === COUCHBASE;
    dest.devDatabaseTypeMariadb = dest.devDatabaseType === MARIADB;
    dest.devDatabaseTypeMssql = dest.devDatabaseType === MSSQL;
    dest.devDatabaseTypeMysql = dest.devDatabaseType === MYSQL;
    dest.devDatabaseTypeOracle = dest.devDatabaseType === ORACLE;
    dest.devDatabaseTypePostgres = dest.devDatabaseType === POSTGRESQL;

    dest.prodDatabaseTypeCouchbase = dest.prodDatabaseType === COUCHBASE;
    dest.prodDatabaseTypeH2Disk = dest.prodDatabaseType === H2_DISK;
    dest.prodDatabaseTypeMariadb = dest.prodDatabaseType === MARIADB;
    dest.prodDatabaseTypeMongodb = dest.prodDatabaseType === MONGODB;
    dest.prodDatabaseTypeMssql = dest.prodDatabaseType === MSSQL;
    dest.prodDatabaseTypeMysql = dest.prodDatabaseType === MYSQL;
    dest.prodDatabaseTypeNeo4j = dest.prodDatabaseType === NEO4J;
    dest.prodDatabaseTypeOracle = dest.prodDatabaseType === ORACLE;
    dest.prodDatabaseTypePostgres = dest.prodDatabaseType === POSTGRESQL;

    dest.databaseTypeNo = dest.databaseType === NO_DATABASE;
    dest.databaseTypeSql = dest.databaseType === SQL;
    dest.databaseTypeCassandra = dest.databaseType === CASSANDRA;
    dest.databaseTypeCouchbase = dest.databaseType === COUCHBASE;
    dest.databaseTypeMongodb = dest.databaseType === MONGODB;
    dest.databaseTypeNeo4j = dest.databaseType === NEO4J;
    dest.databaseTypeMysql = dest.databaseType === SQL && (dest.devDatabaseType === MYSQL || dest.prodDatabaseType === MYSQL);
    dest.databaseTypeMariadb = dest.databaseType === SQL && (dest.devDatabaseType === MARIADB || dest.prodDatabaseType === MARIADB);
    dest.databaseTypePostgres = dest.databaseType === SQL && (dest.devDatabaseType === POSTGRESQL || dest.prodDatabaseType === POSTGRESQL);

    dest.enableLiquibase = dest.databaseTypeSql;

    dest.communicationSpringWebsocket = dest.websocket === SPRING_WEBSOCKET;

    dest.messageBrokerKafka = dest.messageBroker === KAFKA;

    dest.searchEngineCouchbase = dest.searchEngine === COUCHBASE;
    dest.searchEngineElasticsearch = dest.searchEngine === ELASTICSEARCH;
    dest.searchEngineAny = ![undefined, false, 'no'].includes(dest.searchEngine);

    dest.serviceDiscoveryConsul = dest.serviceDiscoveryType === CONSUL;
    dest.serviceDiscoveryEureka = dest.serviceDiscoveryType === EUREKA;
    dest.serviceDiscoveryAny = ![undefined, false, 'no'].includes(dest.serviceDiscoveryType);

    if (dest.databaseType === NO_DATABASE) {
      // User management requires a database.
      dest.generateUserManagement = false;
    }
    // TODO make UserEntity optional on relationships for microservices and oauth2
    // Used for relationships and syncWithIdp
    dest.generateBuiltInUserEntity =
      dest.generateUserManagement ||
      dest.authenticationType === OAUTH2 ||
      (dest.applicationType === MICROSERVICE && !dest.skipUserManagement);

    dest.generateBuiltInAuthorityEntity = dest.generateBuiltInUserEntity && !dest.databaseTypeCassandra;
  }

  /**
   * @param {Object} config - config to load config from
   * @param {import('./base-application/types.js').PlatformApplication} dest - destination context to use default is context
   */
  loadPlatformConfig(config = this.jhipsterConfigWithDefaults, dest = this) {
    dest.serviceDiscoveryType = config.serviceDiscoveryType;
    dest.monitoring = config.monitoring;
    this.loadDerivedPlatformConfig(dest);
  }

  /**
   * @param {import('./bootstrap-application-server/types').SpringBootApplication} dest - destination context to use default is context
   * @param {import('./base-application/types.js').PlatformApplication} dest - destination context to use default is context
   */
  loadDerivedPlatformConfig(dest = this) {
    dest.serviceDiscoveryConsul = dest.serviceDiscoveryType === CONSUL;
    dest.serviceDiscoveryEureka = dest.serviceDiscoveryType === EUREKA;
    dest.serviceDiscoveryAny = dest.serviceDiscoveryType && dest.serviceDiscoveryType !== NO_SERVICE_DISCOVERY;
    dest.monitoringELK = dest.monitoring === ELK;
    dest.monitoringPrometheus = dest.monitoring === PROMETHEUS;
  }

  /**
   * @deprecated
   * Get all the generator configuration from the .yo-rc.json file
   * @param {string} yoRcPath - .yo-rc.json folder.
   */
  getJhipsterConfig(yoRcPath) {
    if (yoRcPath === undefined) {
      const configRootPath =
        this.configRootPath || (this.options && this.options.configRootPath) || (this.configOptions && this.configOptions.configRootPath);
      yoRcPath = path.join(configRootPath || this.destinationPath(), '.yo-rc.json');
    }
    return this.createStorage(yoRcPath, GENERATOR_JHIPSTER);
  }

  /**
   * Get all the generator configuration from the .yo-rc.json file
   * @param {string} entityName - Name of the entity to load.
   * @param {boolean} create - Create storage if doesn't exists.
   * @returns {import('yeoman-generator/lib/util/storage')}
   */
  getEntityConfig(entityName, create = false) {
    const entityPath = this.destinationPath(JHIPSTER_CONFIG_DIR, `${_.upperFirst(entityName)}.json`);
    if (!create && !this.fs.exists(entityPath)) return undefined;
    return this.createStorage(entityPath, { sorted: true });
  }

  /**
   * Fetch files from the generator-jhipster instance installed
   * @param {...string} subpath : the path to fetch from
   */
  fetchFromInstalledJHipster(...subpath) {
    return path.join(__dirname, '..', ...subpath);
  }

  /**
   * @private
   */
  get needleApi() {
    if (this._needleApi === undefined || this._needleApi === null) {
      this._needleApi = new NeedleApi(this);
    }
    return this._needleApi;
  }

  /**
   * Default config based on current applicationType
   */
  get jhipsterDefaults() {
    return this.getDefaultConfigForApplicationType();
  }

  /**
   * JHipster config with default values fallback
   */
  get jhipsterConfigWithDefaults() {
    return _.defaults({}, this.jhipsterConfig, this.jhipsterDefaults);
  }

  getDefaultConfigForApplicationType(applicationType = this.jhipsterConfig.applicationType) {
    return {
      ...(applicationType === MICROSERVICE ? defaultConfigMicroservice : defaultConfig),
      ...defaultApplicationOptions.getConfigForApplicationType(applicationType),
    };
  }

  setConfigDefaults(defaults = this.jhipsterConfigWithDefaults) {
    const jhipsterVersion = packagejs.version;
    const baseName = this.getDefaultAppName();
    const creationTimestamp = new Date().getTime();

    this.config.defaults({
      ...defaults,
      jhipsterVersion,
      baseName,
      creationTimestamp,
    });
  }

  /**
   * @private
   * Returns the JDBC URL for a databaseType
   *
   * @param {string} databaseType
   * @param {*} options: databaseName, and required infos that depends of databaseType (hostname, localDirectory, ...)
   */
  getJDBCUrl(databaseType, options = {}) {
    return this.getDBCUrl(databaseType, 'jdbc', options);
  }

  /**
   * @private
   * Returns the R2DBC URL for a databaseType
   *
   * @param {string} databaseType
   * @param {*} options: databaseName, and required infos that depends of databaseType (hostname, localDirectory, ...)
   */
  getR2DBCUrl(databaseType, options = {}) {
    return this.getDBCUrl(databaseType, 'r2dbc', options);
  }

  /**
   * @private
   * @experimental
   */
  showHello() {
    if (this.configOptions.showHello === false) return false;
    this.configOptions.showHello = false;
    return true;
  }

  /**
   * @experimental
   * Load dependabot package.json into shared dependabot dependencies.
   * @example this.loadDependabotDependencies(this.fetchFromInstalledJHipster('init', 'templates', 'package.json'));
   * @param {string} packageJson - package.json path
   */
  loadDependabotDependencies(packageJson) {
    const { dependencies, devDependencies } = this.fs.readJSON(packageJson);
    _.merge(this.configOptions.nodeDependencies, dependencies, devDependencies);
  }

  /**
   * @private
   * Load config for simulating existing project.
   */
  parseTestOptions() {
    /*
     * When testing a generator with yeoman-test using 'withLocalConfig(localConfig)', it instantiates the
     * generator and then executes generator.config.defaults(localConfig).
     * JHipster workflow does a lot of configuration at the constructor, sometimes this is required due to current
     * blueprints support implementation, making it incompatible with yeoman-test's withLocalConfig.
     * 'defaultLocalConfig' option is a replacement for yeoman-test's withLocalConfig method.
     * 'defaults' function sets every key that has undefined value at current config.
     */
    if (this.options.defaultLocalConfig) {
      this.config.defaults(this.options.defaultLocalConfig);
      delete this.options.defaultLocalConfig;
    }
    /*
     * Option 'localConfig' uses set instead of defaults of 'defaultLocalConfig'.
     * 'set' function sets every key from 'localConfig'.
     */
    if (this.options.localConfig) {
      this.config.set(this.options.localConfig);
      delete this.options.localConfig;
    }
  }
}
