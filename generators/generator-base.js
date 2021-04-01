/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const path = require('path');
const _ = require('lodash');
const chalk = require('chalk');
const fs = require('fs');
const shelljs = require('shelljs');
const semver = require('semver');
const exec = require('child_process').exec;
const os = require('os');
const normalize = require('normalize-path');
const packagejs = require('../package.json');
const jhipsterUtils = require('./utils');
const constants = require('./generator-constants');
const PrivateBase = require('./generator-base-private');
const NeedleApi = require('./needle-api');
const { defaultConfig } = require('./generator-defaults');
const { defaultConfigMicroservice } = require('./generator-defaults');
const { detectLanguage } = require('../utils/language');
const { formatDateForChangelog } = require('../utils/liquibase');
const { calculateDbNameWithLimit, hibernateSnakeCase } = require('../utils/db');
const defaultApplicationOptions = require('../jdl/jhipster/default-application-options');
const databaseTypes = require('../jdl/jhipster/database-types');

const JHIPSTER_CONFIG_DIR = constants.JHIPSTER_CONFIG_DIR;
const MODULES_HOOK_FILE = `${JHIPSTER_CONFIG_DIR}/modules/jhi-hooks.json`;
const GENERATOR_JHIPSTER = 'generator-jhipster';

const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;
const VUE = constants.SUPPORTED_CLIENT_FRAMEWORKS.VUE;

const { ORACLE, MYSQL, POSTGRESQL, MARIADB, MSSQL, SQL, MONGODB, COUCHBASE, NEO4J, CASSANDRA, H2_MEMORY, H2_DISK } = databaseTypes;
const NO_DATABASE = databaseTypes.NO;

const { JWT, OAUTH2, SESSION } = require('../jdl/jhipster/authentication-types');
const { EHCACHE, REDIS, HAZELCAST, MEMCACHED } = require('../jdl/jhipster/cache-types');
const { GRADLE, MAVEN } = require('../jdl/jhipster/build-tool-types');
const { SPRING_WEBSOCKET } = require('../jdl/jhipster/websocket-types');
const { KAFKA } = require('../jdl/jhipster/message-broker-types');
const { CONSUL, EUREKA } = require('../jdl/jhipster/service-discovery-types');
const { GATLING, CUCUMBER, PROTRACTOR, CYPRESS } = require('../jdl/jhipster/test-framework-types');
const { GATEWAY, MICROSERVICE, MONOLITH } = require('../jdl/jhipster/application-types');
const { ELASTICSEARCH } = require('../jdl/jhipster/search-engine-types');

// Reverse order.
const CUSTOM_PRIORITIES = [
  {
    priorityName: 'preConflicts',
    queueName: 'jhipster:preConflicts',
    before: 'conflicts',
  },
  {
    priorityName: 'postWriting',
    queueName: 'jhipster:postWriting',
    before: 'preConflicts',
  },
  {
    priorityName: 'preparingRelationships',
    queueName: 'jhipster:preparingRelationships',
    before: 'default',
  },
  {
    priorityName: 'preparingFields',
    queueName: 'jhipster:preparingFields',
    before: 'preparingRelationships',
  },
  {
    priorityName: 'preparing',
    queueName: 'jhipster:preparing',
    before: 'preparingFields',
  },
  {
    priorityName: 'loading',
    queueName: 'jhipster:loading',
    before: 'preparing',
  },
  {
    priorityName: 'composing',
    queueName: 'jhipster:composing',
    before: 'loading',
  },
];

/**
 * This is the Generator base class.
 * This provides all the public API methods exposed via the module system.
 * The public API methods can be directly utilized as well using commonJS require.
 *
 * The method signatures in public API should not be changed without a major version change
 */
module.exports = class JHipsterBaseGenerator extends PrivateBase {
  constructor(args, opts, features) {
    super(args, opts, features);

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

    if (this.options.help) {
      return;
    }

    this.registerPriorities(CUSTOM_PRIORITIES);

    // JHipster runtime config that should not be stored to .yo-rc.json.
    this.configOptions = this.options.configOptions || { sharedEntities: {} };
    this.configOptions.sharedEntities = this.configOptions.sharedEntities || {};

    /* Force config to use 'generator-jhipster' namespace. */
    this._config = this._getStorage('generator-jhipster');
    /* JHipster config using proxy mode used as a plain object instead of using get/set. */
    this.jhipsterConfig = this.config.createProxy();

    /* Register generator for compose once */
    this.registerComposedGenerator(this.options.namespace);

    if (this.options.namespace !== 'jhipster:bootstrap') {
      /*
      // eslint-disable-next-line global-require
      const boostrapGen = require('./bootstrap');
      boostrapGen.namespace = 'jhipster:bootstrap';
      const generator = this.env.instantiate(boostrapGen, { ...this.options, configOptions: this.configOptions });
      if (this.env.queueGenerator) {
        this.env.queueGenerator(generator, true);
      }
      */
      this.composeWithJHipster('bootstrap', { ...this.options, configOptions: this.configOptions }, true);
    }
  }

  /**
   * expose custom CLIENT_MAIN_SRC_DIR to templates and needles
   */
  get CLIENT_MAIN_SRC_DIR() {
    this._CLIENT_MAIN_SRC_DIR =
      this._CLIENT_MAIN_SRC_DIR || this.applyOutputPathCustomizer(constants.CLIENT_MAIN_SRC_DIR) || constants.CLIENT_MAIN_SRC_DIR;
    return this._CLIENT_MAIN_SRC_DIR;
  }

  /**
   * expose custom CLIENT_MAIN_SRC_DIR to templates and needles
   */
  get CLIENT_TEST_SRC_DIR() {
    this._CLIENT_TEST_SRC_DIR =
      this._CLIENT_TEST_SRC_DIR || this.applyOutputPathCustomizer(constants.CLIENT_TEST_SRC_DIR) || constants.CLIENT_TEST_SRC_DIR;
    return this._CLIENT_TEST_SRC_DIR;
  }

  /**
   * Verify if the entity is a built-in Entity.
   * @param {String} entityName - Entity name to verify.
   * @return {boolean} true if the entity is built-in.
   */
  isBuiltInEntity(entityName) {
    return this.isBuiltInUser(entityName) || this.isBuiltInAuthority(entityName);
  }

  /**
   * Verify if the application is using built-in User.
   * @return {boolean} true if the User is built-in.
   */
  isUsingBuiltInUser() {
    return (
      !this.jhipsterConfig ||
      !this.jhipsterConfig.skipUserManagement ||
      (this.jhipsterConfig.authenticationType === OAUTH2 && this.jhipsterConfig.databaseType !== NO_DATABASE)
    );
  }

  /**
   * Verify if the entity is a User entity.
   * @param {String} entityName - Entity name to verify.
   * @return {boolean} true if the entity is User.
   */
  isUserEntity(entityName) {
    return _.upperFirst(entityName) === 'User';
  }

  /**
   * Verify if the entity is a built-in User.
   * @param {String} entityName - Entity name to verify.
   * @return {boolean} true if the entity is User and is built-in.
   */
  isBuiltInUser(entityName) {
    return this.isUsingBuiltInUser() && this.isUserEntity(entityName);
  }

  /**
   * Verify if the application is using built-in Authority.
   * @return {boolean} true if the Authority is built-in.
   */
  isUsingBuiltInAuthority() {
    return (
      !this.jhipsterConfig ||
      (!this.jhipsterConfig.skipUserManagement && [SQL, MONGODB, COUCHBASE, NEO4J].includes(this.jhipsterConfig.databaseType)) ||
      (this.jhipsterConfig.authenticationType === OAUTH2 && this.jhipsterConfig.databaseType !== NO_DATABASE)
    );
  }

  /**
   * Verify if the entity is a Authority entity.
   * @param {String} entityName - Entity name to verify.
   * @return {boolean} true if the entity is Authority.
   */
  isAuthorityEntity(entityName) {
    return _.upperFirst(entityName) === 'Authority';
  }

  /**
   * Verify if the entity is a built-in Authority.
   * @param {String} entityName - Entity name to verify.
   * @return {boolean} true if the entity is Authority and is built-in.
   */
  isBuiltInAuthority(entityName) {
    return this.isUsingBuiltInAuthority() && this.isAuthorityEntity(entityName);
  }

  /**
   * Apply output customizer.
   *
   * @param {string} outputPath - Path to customize.
   */
  applyOutputPathCustomizer(outputPath) {
    let outputPathCustomizer = this.options.outputPathCustomizer;
    if (!outputPathCustomizer && this.configOptions) {
      outputPathCustomizer = this.configOptions.outputPathCustomizer;
    }
    if (!outputPathCustomizer) {
      return outputPath;
    }
    outputPath = outputPath ? normalize(outputPath) : outputPath;
    if (Array.isArray(outputPathCustomizer)) {
      outputPathCustomizer.forEach(customizer => {
        outputPath = customizer.call(this, outputPath);
      });
      return outputPath;
    }
    return outputPathCustomizer.call(this, outputPath);
  }

  getPrettierExtensions() {
    let prettierExtensions = 'md,json,yml,html';
    if (!this.skipClient && !this.jhipsterConfig.skipClient) {
      prettierExtensions = `${prettierExtensions},js,ts,tsx,css,scss`;
      if (this.jhipsterConfig.clientFramework === VUE) {
        prettierExtensions = `${prettierExtensions},vue`;
      }
    }
    if (!this.skipServer && !this.jhipsterConfig.skipServer) {
      prettierExtensions = `${prettierExtensions},java`;
    }
    return prettierExtensions;
  }

  /**
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
    entityTranslationValue = _.startCase(routerName)
  ) {
    if (clientFramework === ANGULAR) {
      this.needleApi.clientAngular.addEntityToMenu(
        routerName,
        enableTranslation,
        entityTranslationKeyMenu,
        entityTranslationValue,
        this.jhiPrefix
      );
    } else if (clientFramework === REACT) {
      this.needleApi.clientReact.addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu, entityTranslationValue);
    } else if (clientFramework === VUE) {
      this.needleApi.clientVue.addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu, entityTranslationValue);
    }
  }

  /**
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
      this.needleApi.clientVue.addEntityServiceToMainImport(entityName, entityClass, entityFileName, entityFolderName);
      this.needleApi.clientVue.addEntityServiceToMain(entityInstance, entityName);
    }
  }

  /**
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
   * Add a new element in the "global.json" translations.
   *
   * @param {string} key - Key for the menu entry
   * @param {string} value - Default translated value
   * @param {string} language - The language to which this translation should be added
   */
  addElementTranslationKey(key, value, language) {
    this.needleApi.clientI18n.addElementTranslationKey(key, value, language);
  }

  /**
   * Add a new element in the admin section of "global.json" translations.
   *
   * @param {string} key - Key for the menu entry
   * @param {string} value - Default translated value
   * @param {string} language - The language to which this translation should be added
   */
  addAdminElementTranslationKey(key, value, language) {
    this.needleApi.clientI18n.addAdminElementTranslationKey(key, value, language);
  }

  /**
   * Add a new entity in the "global.json" translations.
   *
   * @param {string} key - Key for the entity name
   * @param {string} value - Default translated value
   * @param {string} language - The language to which this translation should be added
   */
  addEntityTranslationKey(key, value, language) {
    this.needleApi.clientI18n.addEntityTranslationKey(key, value, language);
  }

  /**
   * Add a new entry as a root param in "global.json" translations.
   *
   * @param {string} key - Key for the entry
   * @param {string} value - Default translated value or object with multiple key and translated value
   * @param {string} language - The language to which this translation should be added
   */
  addGlobalTranslationKey(key, value, language) {
    const fullPath = `${this.CLIENT_MAIN_SRC_DIR}i18n/${language}/global.json`;
    try {
      jhipsterUtils.rewriteJSONFile(
        fullPath,
        jsonObj => {
          jsonObj[key] = value;
        },
        this
      );
    } catch (e) {
      this.log(
        `${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ')}(key: ${key}, value:${value})${chalk.yellow(
          ' not added to global translations.\n'
        )}`
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Add a translation key to all installed languages
   *
   * @param {string} key - Key for the entity name
   * @param {string} value - Default translated value
   * @param {string} method - The method to be run with provided key and value from above
   * @param {string} enableTranslation - specify if i18n is enabled
   */
  addTranslationKeyToAllLanguages(key, value, method, enableTranslation) {
    if (enableTranslation) {
      this.getAllInstalledLanguages().forEach(language => {
        this[method](key, value, language);
      });
    }
  }

  /**
   * get all the languages installed currently
   */
  getAllInstalledLanguages() {
    const languages = [];
    this.getAllSupportedLanguages().forEach(language => {
      try {
        const stats = fs.lstatSync(`${this.CLIENT_MAIN_SRC_DIR}i18n/${language}`);
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
   * return the localeId from the given language key (from constants.LANGUAGES)
   * if no localeId is defined, return the language key (which is a localeId itself)
   * @param {string} language - language key
   */
  getLocaleId(language) {
    const langObj = this.getAllSupportedLanguageOptions().find(langObj => langObj.value === language);
    return langObj.localeId || language;
  }

  /**
   * return the dayjsLocaleId from the given language key (from constants.LANGUAGES)
   * if no dayjsLocaleId is defined, return the language key (which is a localeId itself)
   * @param {string} language - language key
   */
  getDayjsLocaleId(language) {
    const langObj = this.getAllSupportedLanguageOptions().find(langObj => langObj.value === language);
    return langObj.dayjsLocaleId || language;
  }

  /**
   * get all the languages options supported by JHipster
   */
  getAllSupportedLanguageOptions() {
    return constants.LANGUAGES;
  }

  /**
   * Add a new dependency in the "package.json".
   *
   * @param {string} name - dependency name
   * @param {string} version - dependency version
   */
  addNpmDependency(name, version) {
    const fullPath = 'package.json';
    try {
      jhipsterUtils.rewriteJSONFile(
        fullPath,
        jsonObj => {
          if (jsonObj.dependencies === undefined) {
            jsonObj.dependencies = {};
          }
          jsonObj.dependencies[name] = version;
        },
        this
      );
    } catch (e) {
      this.log(
        `${
          chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ')
        }npm dependency (name: ${name}, version:${version})${chalk.yellow(' not added.\n')}`
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Add a new devDependency in the "package.json".
   *
   * @param {string} name - devDependency name
   * @param {string} version - devDependency version
   */
  addNpmDevDependency(name, version) {
    const fullPath = 'package.json';
    try {
      jhipsterUtils.rewriteJSONFile(
        fullPath,
        jsonObj => {
          if (jsonObj.devDependencies === undefined) {
            jsonObj.devDependencies = {};
          }
          jsonObj.devDependencies[name] = version;
        },
        this
      );
    } catch (e) {
      this.log(
        `${
          chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ')
        }npm devDependency (name: ${name}, version:${version})${chalk.yellow(' not added.\n')}`
      );
      this.debug('Error:', e);
    }
  }

  /**
   * Add a new script in the "package.json".
   *
   * @param {string} name - script name
   * @param {string} data - script version
   */
  addNpmScript(name, data) {
    const fullPath = 'package.json';
    try {
      jhipsterUtils.rewriteJSONFile(
        fullPath,
        jsonObj => {
          if (jsonObj.scripts === undefined) {
            jsonObj.scripts = {};
          }
          jsonObj.scripts[name] = data;
        },
        this
      );
    } catch (e) {
      this.log(
        `${
          chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ')
        }npm script (name: ${name}, data:${data})${chalk.yellow(' not added.\n')}`
      );
      this.debug('Error:', e);
    }
  }

  /**
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
   * Add a new entry to Ehcache in CacheConfiguration.java
   *
   * @param {string} entry - the entry (including package name) to cache
   * @param {string} packageFolder - the Java package folder
   */
  addEntryToEhcache(entry, packageFolder) {
    this.addEntryToCache(entry, packageFolder, EHCACHE);
  }

  /**
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
   * Add a new changelog to the Liquibase master.xml file.
   *
   * @param {string} changelogName - The name of the changelog (name of the file without .xml at the end).
   */
  addChangelogToLiquibase(changelogName) {
    this.needleApi.serverLiquibase.addChangelog(changelogName);
  }

  /**
   * Add a incremental changelog to the Liquibase master.xml file.
   *
   * @param {string} changelogName - The name of the changelog (name of the file without .xml at the end).
   */
  addIncrementalChangelogToLiquibase(changelogName) {
    this.needleApi.serverLiquibase.addIncrementalChangelog(changelogName);
  }

  /**
   * Add a new constraints changelog to the Liquibase master.xml file.
   *
   * @param {string} changelogName - The name of the changelog (name of the file without .xml at the end).
   */
  addConstraintsChangelogToLiquibase(changelogName) {
    this.needleApi.serverLiquibase.addConstraintsChangelog(changelogName);
  }

  /**
   * Add a new changelog to the Liquibase master.xml file.
   *
   * @param {string} changelogName - The name of the changelog (name of the file without .xml at the end).
   * @param {string} needle - The needle at where it has to be added.
   */
  addLiquibaseChangelogToMaster(changelogName, needle) {
    this.needleApi.serverLiquibase.addChangelogToMaster(changelogName, needle);
  }

  /**
   * Add a new column to a Liquibase changelog file for entity.
   *
   * @param {string} filePath - The full path of the changelog file.
   * @param {string} content - The content to be added as column, can have multiple columns as well
   */
  addColumnToLiquibaseEntityChangeset(filePath, content) {
    this.needleApi.serverLiquibase.addColumnToEntityChangeset(filePath, content);
  }

  /**
   * Add a new load column to a Liquibase changelog file for entity.
   *
   * @param {string} filePath - The full path of the changelog file.
   * @param {string} content - The content to be added as column, can have multiple columns as well
   */
  addLoadColumnToLiquibaseEntityChangeSet(filePath, content) {
    this.needleApi.serverLiquibase.addLoadColumnToEntityChangeSet(filePath, content);
  }

  /**
   * Add a new changeset to a Liquibase changelog file for entity.
   *
   * @param {string} filePath - The full path of the changelog file.
   * @param {string} content - The content to be added as changeset
   */
  addChangesetToLiquibaseEntityChangelog(filePath, content) {
    this.needleApi.serverLiquibase.addChangesetToEntityChangelog(filePath, content);
  }

  /**
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
  addWebpackConfig(config) {
    this.needleApi.clientWebpack.addWebpackConfig(config);
  }

  /**
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
   * Add a remote Maven Plugin Repository to the Maven build.
   *
   * @param {string} id - id of the repository
   * @param {string} url - url of the repository
   */
  addMavenPluginRepository(id, url) {
    this.needleApi.serverMaven.addPluginRepository(id, url);
  }

  /**
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
   * Add a new Maven property.
   *
   * @param {string} name - property name
   * @param {string} value - property value
   */
  addMavenProperty(name, value) {
    this.needleApi.serverMaven.addProperty(name, value);
  }

  /**
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
   * Add a new Maven profile.
   *
   * @param {string} profileId - profile ID
   * @param {string} other - explicit other thing: build, dependencies...
   */
  addMavenProfile(profileId, other) {
    this.needleApi.serverMaven.addProfile(profileId, other);
  }

  /**
   * A new Gradle property.
   *
   * @param {string} name - property name
   * @param {string} value - property value
   */
  addGradleProperty(name, value) {
    this.needleApi.serverGradle.addProperty(name, value);
  }

  /**
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
   * Add Gradle plugin to the plugins block
   *
   * @param {string} id - plugin id
   * @param {string} version - explicit plugin version number
   */
  addGradlePluginToPluginsBlock(id, version) {
    this.needleApi.serverGradle.addPluginToPluginsBlock(id, version);
  }

  /**
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
   * Apply from an external Gradle build script.
   *
   * @param {string} name - name of the file to apply from, must be 'fileName.gradle'
   */
  applyFromGradleScript(name) {
    this.needleApi.serverGradle.applyFromScript(name);
  }

  /**
   * Add a logger to the logback-spring.xml
   *
   * @param {string} logName - name of the log we want to track
   * @param {string} level - tracking level
   */
  addLoggerForLogbackSpring(logName, level) {
    this.needleApi.serverLog.addlog(logName, level);
  }

  /**
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
   * Copy templates with all the custom logic applied according to the type.
   *
   * @param {string} source - path of the source file to copy from
   * @param {string} dest - path of the destination file to copy to
   * @param {string} action - type of the action to be performed on the template file, i.e: stripHtml | stripJs | template | copy
   * @param {object} generator - context that can be used as the generator instance or data to process template
   * @param {object} opt - options that can be passed to template method
   * @param {boolean} template - flag to use template method instead of copy method
   */
  copyTemplate(source, dest, action, generator, opt = {}, template) {
    const _this = generator || this;
    let regex;
    switch (action) {
      case 'stripHtml':
        regex = new RegExp(
          [
            /([\s\n\r]+[a-z][a-zA-Z]*Translate="[a-zA-Z0-9 +{}'_!?.]+")/, // jhiTranslate
            /([\s\n\r]+\[translate(-v|V)alues\]="\{([a-zA-Z]|\d|:|\{|\}|\[|\]|-|'|\s|\.|_)*?\}")/, // translate-values or translateValues
            /([\s\n\r]+translate-compile)/, // translate-compile
            /([\s\n\r]+translate-value-max="[0-9{}()|]*")/, // translate-value-max
          ]
            .map(r => r.source)
            .join('|'),
          'g'
        );

        jhipsterUtils.copyWebResource(source, dest, regex, 'html', _this, opt, template);
        break;
      case 'stripJs':
        jhipsterUtils.copyWebResource(source, dest, null, 'js', _this, opt, template);
        break;
      case 'stripJsx':
        regex = new RegExp(
          [
            /(import { ?Translate, ?translate ?} from 'react-jhipster';?)/, // Translate imports
            /(import { ?translate, ?Translate ?} from 'react-jhipster';?)/, // translate imports
            /( Translate,|, ?Translate|import { ?Translate ?} from 'react-jhipster';?)/, // Translate import
            /( translate,|, ?translate|import { ?translate ?} from 'react-jhipster';?)/, // translate import
            /<Translate(\s*)?((component="[a-z]+")(\s*)|(contentKey=("[a-zA-Z0-9.\-_]+"|\{.*\}))(\s*)|(interpolate=\{.*\})(\s*))*(\s*)\/?>|<\/Translate>/, // Translate component tag
          ]
            .map(r => r.source)
            .join('|'),
          'g'
        );

        jhipsterUtils.copyWebResource(source, dest, regex, 'jsx', _this, opt, template);
        break;
      case 'copy':
        _this.copy(source, dest);
        break;
      default:
        _this.template(source, dest, _this, opt);
    }
  }

  /**
   * Copy html templates after stripping translation keys when translation is disabled.
   *
   * @param {string} source - path of the source file to copy from
   * @param {string} dest - path of the destination file to copy to
   * @param {object} generator - context that can be used as the generator instance or data to process template
   * @param {object} opt - options that can be passed to template method
   * @param {boolean} template - flag to use template method instead of copy
   */
  processHtml(source, dest, generator, opt, template) {
    this.copyTemplate(source, dest, 'stripHtml', generator, opt, template);
  }

  /**
   * Copy Js templates after stripping translation keys when translation is disabled.
   *
   * @param {string} source - path of the source file to copy from
   * @param {string} dest - path of the destination file to copy to
   * @param {object} generator - context that can be used as the generator instance or data to process template
   * @param {object} opt - options that can be passed to template method
   * @param {boolean} template - flag to use template method instead of copy
   */
  processJs(source, dest, generator, opt, template) {
    this.copyTemplate(source, dest, 'stripJs', generator, opt, template);
  }

  /**
   * Copy JSX templates after stripping translation keys when translation is disabled.
   *
   * @param {string} source - path of the source file to copy from
   * @param {string} dest - path of the destination file to copy to
   * @param {object} generator - context that can be used as the generator instance or data to process template
   * @param {object} opt - options that can be passed to template method
   * @param {boolean} template - flag to use template method instead of copy
   */
  processJsx(source, dest, generator, opt, template) {
    this.copyTemplate(source, dest, 'stripJsx', generator, opt, template);
  }

  /**
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
   * Replace the pattern/regex with provided content
   *
   * @param {string} filePath - path of the source file to rewrite
   * @param {string} pattern - pattern to look for where content will be replaced
   * @param {string} content - content to be written
   * @param {string} regex - true if pattern is regex
   * @returns {boolean} true if the body has changed.
   */
  replaceContent(filePath, pattern, content, regex) {
    try {
      return jhipsterUtils.replaceContent(
        {
          file: filePath,
          pattern,
          content,
          regex,
        },
        this
      );
    } catch (e) {
      this.log(chalk.yellow('\nUnable to find ') + filePath + chalk.yellow(' or missing required pattern. File rewrite failed.\n') + e);
      this.debug('Error:', e);
      return false;
    }
  }

  /**
   * Register a module configuration to .jhipster/modules/jhi-hooks.json
   *
   * @param {string} npmPackageName - npm package name of the generator
   * @param {string} hookFor - from which JHipster generator this should be hooked ( 'entity' or 'app')
   * @param {string} hookType - where to hook this at the generator stage ( 'pre' or 'post')
   * @param {string} callbackSubGenerator[optional] - sub generator to invoke, if this is not given the module's main generator will be called, i.e app
   * @param {string} description[optional] - description of the generator
   */
  registerModule(npmPackageName, hookFor, hookType, callbackSubGenerator, description) {
    try {
      let modules;
      let error;
      let duplicate;
      const moduleName = _.startCase(npmPackageName.replace(`${GENERATOR_JHIPSTER}-`, ''));
      const generatorName = jhipsterUtils.packageNameToNamespace(npmPackageName);
      const generatorCallback = `${generatorName}:${callbackSubGenerator || 'app'}`;
      const moduleConfig = {
        name: `${moduleName} generator`,
        npmPackageName,
        description: description || `A JHipster module to generate ${moduleName}`,
        hookFor,
        hookType,
        generatorCallback,
      };
      try {
        // if file is not present, we got an empty list, no exception
        // TODO 7.0 this.destinationPath(MODULES_HOOK_FILE);
        modules = this.fs.readJSON(MODULES_HOOK_FILE, []);
        duplicate = _.findIndex(modules, moduleConfig) !== -1;
      } catch (err) {
        error = true;
        this.log(chalk.red('The JHipster module configuration file could not be read!'));
        this.debug('Error:', err);
      }
      if (!error && !duplicate) {
        modules.push(moduleConfig);
        this.fs.writeJSON(MODULES_HOOK_FILE, modules, null, 4);
      }
    } catch (err) {
      this.log(`\n${chalk.bold.red('Could not add jhipster module configuration')}`);
      this.debug('Error:', err);
    }
  }

  /**
   * Add configuration to Entity.json files
   *
   * @param {string} file - configuration file name for the entity
   * @param {string} key - key to be added or updated
   * @param {object} value - value to be added
   */
  updateEntityConfig(file, key, value) {
    try {
      const entityJson = this.fs.readJSON(file);
      entityJson[key] = value;
      this.fs.writeJSON(file, entityJson, null, 4);
    } catch (err) {
      this.log(chalk.red('The JHipster entity configuration file could not be read!') + err);
      this.debug('Error:', err);
    }
  }

  /**
   * get the module hooks config json
   */
  getModuleHooks() {
    let modulesConfig = [];
    try {
      if (shelljs.test('-f', MODULES_HOOK_FILE)) {
        modulesConfig = this.fs.readJSON(MODULES_HOOK_FILE);
      }
    } catch (err) {
      this.log(chalk.red('The module configuration file could not be read!'));
    }

    return modulesConfig;
  }

  /**
   * Call all the module hooks with the given options.
   * @param {string} hookFor - "app" or "entity"
   * @param {string} hookType - "pre" or "post"
   * @param {any} options - the options to pass to the hooks
   * @param {function} cb - callback to trigger at the end
   */
  callHooks(hookFor, hookType, options, cb) {
    const modules = this.getModuleHooks();
    // run through all module hooks, which matches the hookFor and hookType
    modules.forEach(module => {
      this.debug('Composing module with config:', module);
      if (module.hookFor === hookFor && module.hookType === hookType) {
        // compose with the modules callback generator
        const hook = module.generatorCallback.split(':')[1];
        try {
          this.composeExternalModule(module.npmPackageName, hook || 'app', options);
        } catch (e) {
          this.log(
            chalk.red('Could not compose module ') +
              chalk.bold.yellow(module.npmPackageName) +
              chalk.red('. \nMake sure you have installed the module with ') +
              chalk.bold.yellow(`'npm install -g ${module.npmPackageName}'`)
          );
          this.debug('ERROR:', e);
        }
      }
    });
    this.debug('calling callback');
    cb && cb();
  }

  /**
   * Register the composed generator for compose once.
   * @param {string} namespace - jhipster generator.
   * @return {boolean} false if already composed
   */
  registerComposedGenerator(namespace) {
    this.configOptions.composedWith = this.configOptions.composedWith || [];
    if (this.configOptions.composedWith.includes(namespace)) {
      return false;
    }
    this.configOptions.composedWith.push(namespace);
    return true;
  }

  /**
   * Compose with a jhipster generator using default jhipster config.
   * @param {string} generator - jhipster generator.
   * @param {object} [options] - options to pass
   * @param {boolean} [once] - compose once with the generator
   * @return {object} the composed generator
   */
  composeWithJHipster(generator, args, options, once = false) {
    const namespace = generator.includes(':') ? generator : `jhipster:${generator}`;
    if (typeof args === 'boolean') {
      once = args;
      args = [];
      options = {};
    } else if (!Array.isArray(args)) {
      once = options;
      options = args;
      args = [];
    } else if (typeof options === 'boolean') {
      once = options;
      options = {};
    }
    if (once) {
      if (!this.registerComposedGenerator(namespace)) {
        return undefined;
      }
    }

    if (this.env.get(namespace)) {
      generator = namespace;
    } else {
      // Keep test compatibily were jhipster lookup does not run.
      try {
        generator = require.resolve(`./${generator}`);
      } catch (e) {
        throw new Error(`Generator ${generator} was not found`);
      }
    }

    return this.env.composeWith(generator, args, {
      ...this.options,
      configOptions: this.configOptions,
      ...options,
    });
  }

  /**
   * Compose an external generator with Yeoman.
   * @param {string} npmPackageName - package name
   * @param {string} subGen - sub generator name
   * @param {any} options - options to pass
   * @return {object} the composed generator
   */
  composeExternalModule(npmPackageName, subGen, options = {}) {
    const generatorName = jhipsterUtils.packageNameToNamespace(npmPackageName);
    const generatorCallback = `${generatorName}:${subGen}`;
    if (!this.env.isPackageRegistered(generatorName)) {
      this.env.lookup({ filterPaths: true, packagePatterns: npmPackageName });
    }
    if (!this.env.get(generatorCallback)) {
      throw new Error(`Generator ${generatorCallback} isn't registered.`);
    }
    options.configOptions = options.configOptions || this.configOptions;
    return this.composeWith(generatorCallback, options, true);
  }

  /**
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
   * Read entity json from config folder.
   * @param {string} entityName - Entity name
   * @return {object} entity definition
   */
  readEntityJson(entityName) {
    const configDir = this.destinationPath(JHIPSTER_CONFIG_DIR);
    const file = this.destinationPath(configDir, `${entityName}.json`);
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

    return [...new Set((this.jhipsterConfig.entities || []).concat(entityNames))]
      .map(entityName => ({ name: entityName, definition: this.readEntityJson(entityName) }))
      .filter(entity => entity && !this.isBuiltInUser(entity.name) && !this.isBuiltInAuthority(entity.name))
      .sort(isBefore);
  }

  /**
   * Copy i18 files for given language
   *
   * @param {object} generator - context that can be used as the generator instance or data to process template
   * @param {string} webappDir - webapp directory path
   * @param {string} fileToCopy - file name to copy
   * @param {string} lang - language for which file needs to be copied
   */
  copyI18nFilesByName(generator, webappDir, fileToCopy, lang) {
    const _this = generator || this;
    const prefix = this.fetchFromInstalledJHipster('languages/templates');
    _this.copy(`${prefix}/${webappDir}i18n/${lang}/${fileToCopy}`, `${webappDir}i18n/${lang}/${fileToCopy}`);
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
   * executes a Git command using shellJS
   * gitExec(args [, options] [, callback])
   *
   * @param {string|array} args - can be an array of arguments or a string command
   * @param {object} options[optional] - takes any of child process options
   * @param {function} callback[optional] - a callback function to be called once process complete, The call back will receive code, stdout and stderr
   * @return {object} when in synchronous mode, this returns a ShellString. Otherwise, this returns the child process object.
   */
  gitExec(args, options, callback) {
    return jhipsterUtils.gitExec(args, options, callback);
  }

  /**
   * get a table name in JHipster preferred style.
   *
   * @param {string} value - table name string
   */
  getTableName(value) {
    return hibernateSnakeCase(value);
  }

  /**
   * get a table column name in JHipster preferred style.
   *
   * @param {string} value - table column name string
   */
  getColumnName(value) {
    return hibernateSnakeCase(value);
  }

  /**
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
    let limit = 0;
    if (prodDatabaseType === ORACLE && joinTableName.length > 30 && !this.skipCheckLengthOfIdentifier) {
      this.warning(
        `The generated join table "${joinTableName}" is too long for Oracle (which has a 30 character limit). It will be truncated!`
      );

      limit = 30;
    } else if (prodDatabaseType === MYSQL && joinTableName.length > 64 && !this.skipCheckLengthOfIdentifier) {
      this.warning(
        `The generated join table "${joinTableName}" is too long for MySQL (which has a 64 character limit). It will be truncated!`
      );

      limit = 64;
    } else if (prodDatabaseType === POSTGRESQL && joinTableName.length >= 63 && !this.skipCheckLengthOfIdentifier) {
      this.warning(
        `The generated join table "${joinTableName}" is too long for PostgreSQL (which has a 63 character limit). It will be truncated!`
      );

      limit = 63;
    } else if (prodDatabaseType === MARIADB && joinTableName.length > 64 && !this.skipCheckLengthOfIdentifier) {
      this.warning(
        `The generated join table "${joinTableName}" is too long for MariaDB (which has a 64 character limit). It will be truncated!`
      );

      limit = 64;
    }
    return limit === 0
      ? joinTableName
      : calculateDbNameWithLimit(entityName, relationshipName, limit, { prefix, separator, appendHash: !legacyDbNames });
  }

  /**
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
    if (prodDatabaseType === ORACLE && constraintName.length >= 27 && !this.skipCheckLengthOfIdentifier) {
      this.warning(
        `The generated constraint name "${constraintName}" is too long for Oracle (which has a 30 character limit). It will be truncated!`
      );

      limit = 28;
    } else if (prodDatabaseType === MYSQL && constraintName.length >= 61 && !this.skipCheckLengthOfIdentifier) {
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
   * get a foreign key constraint name for tables in JHipster preferred style.
   *
   * @param {string} entityName - name of the entity
   * @param {string} relationshipName - name of the related entity
   * @param {string} prodDatabaseType - database type
   * @param {boolean} noSnakeCase - do not convert names to snakecase
   */
  getConstraintName(entityName, relationshipName, prodDatabaseType, noSnakeCase) {
    // for backward compatibility
    return this.getFKConstraintName(entityName, relationshipName, prodDatabaseType, noSnakeCase);
  }

  /**
   * get a foreign key constraint name for tables in JHipster preferred style.
   *
   * @param {string} entityName - name of the entity
   * @param {string} relationshipName - name of the related entity
   * @param {string} prodDatabaseType - database type
   * @param {boolean} noSnakeCase - do not convert names to snakecase
   */
  getFKConstraintName(entityName, relationshipName, prodDatabaseType, noSnakeCase) {
    return `${this.getConstraintNameWithLimit(entityName, relationshipName, prodDatabaseType, noSnakeCase, 'fk_')}_id`;
  }

  /**
   * get a unique constraint name for tables in JHipster preferred style.
   *
   * @param {string} entityName - name of the entity
   * @param {string} columnName - name of the column
   * @param {string} prodDatabaseType - database type
   * @param {boolean} noSnakeCase - do not convert names to snakecase
   */
  getUXConstraintName(entityName, columnName, prodDatabaseType, noSnakeCase) {
    return `ux_${this.getConstraintNameWithLimit(entityName, columnName, prodDatabaseType, noSnakeCase)}`;
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
   * Generate a KeyStore.
   */
  generateKeyStore() {
    const done = this.async();
    const keyStoreFile = `${SERVER_MAIN_RES_DIR}config/tls/keystore.p12`;
    if (this.fs.exists(keyStoreFile)) {
      this.log(chalk.cyan(`\nKeyStore '${keyStoreFile}' already exists. Leaving unchanged.\n`));
      done();
    } else {
      try {
        shelljs.mkdir('-p', `${SERVER_MAIN_RES_DIR}config/tls`);
      } catch (error) {
        // noticed that on windows the shelljs.mkdir tends to sometimes fail
        fs.mkdir(`${SERVER_MAIN_RES_DIR}config/tls`, { recursive: true }, err => {
          if (err) throw err;
        });
      }
      const javaHome = shelljs.env.JAVA_HOME;
      let keytoolPath = '';
      if (javaHome) {
        keytoolPath = `${javaHome}/bin/`;
      }
      // Generate the PKCS#12 keystore
      shelljs.exec(
        // prettier-ignore
        `"${keytoolPath}keytool" -genkey -noprompt `
                + '-storetype PKCS12 '
                + '-keyalg RSA '
                + '-alias selfsigned '
                + `-keystore ${keyStoreFile} `
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
    this.log('\n');
    this.log(`${chalk.green('        ██╗')}${chalk.red(' ██╗   ██╗ ████████╗ ███████╗   ██████╗ ████████╗ ████████╗ ███████╗')}`);
    this.log(`${chalk.green('        ██║')}${chalk.red(' ██║   ██║ ╚══██╔══╝ ██╔═══██╗ ██╔════╝ ╚══██╔══╝ ██╔═════╝ ██╔═══██╗')}`);
    this.log(`${chalk.green('        ██║')}${chalk.red(' ████████║    ██║    ███████╔╝ ╚█████╗     ██║    ██████╗   ███████╔╝')}`);
    this.log(`${chalk.green('  ██╗   ██║')}${chalk.red(' ██╔═══██║    ██║    ██╔════╝   ╚═══██╗    ██║    ██╔═══╝   ██╔══██║')}`);
    this.log(`${chalk.green('  ╚██████╔╝')}${chalk.red(' ██║   ██║ ████████╗ ██║       ██████╔╝    ██║    ████████╗ ██║  ╚██╗')}`);
    this.log(`${chalk.green('   ╚═════╝ ')}${chalk.red(' ╚═╝   ╚═╝ ╚═══════╝ ╚═╝       ╚═════╝     ╚═╝    ╚═══════╝ ╚═╝   ╚═╝')}\n`);
    this.log(chalk.white.bold('                            https://www.jhipster.tech\n'));
    this.log(chalk.white('Welcome to JHipster ') + chalk.yellow(`v${packagejs.version}`));
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
   * Return the user home
   */
  getUserHome() {
    return process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
  }

  /**
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
   * get the java main class name.
   * @param {string} baseName of application
   */
  getMainClassName(baseName = this.baseName) {
    const main = _.upperFirst(this.getMicroserviceAppName(baseName));
    const acceptableForJava = new RegExp('^[A-Z][a-zA-Z0-9_]*$');

    return acceptableForJava.test(main) ? main : 'Application';
  }

  /**
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
   * ask a prompt for apps name.
   *
   * @param {object} generator - generator instance to use
   */
  async askModuleName(generator) {
    const defaultAppBaseName = this.getDefaultAppName();
    const answers = await generator.prompt({
      type: 'input',
      name: 'baseName',
      validate: input => {
        if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
          return 'Your base name cannot contain special characters or a blank space';
        }
        if (generator.applicationType === 'microservice' && /_/.test(input)) {
          return 'Your base name cannot contain underscores as this does not meet the URI spec';
        }
        if (input === 'application') {
          return "Your base name cannot be named 'application' as this is a reserved name for Spring Boot";
        }
        return true;
      },
      message: 'What is the base name of your application?',
      default: defaultAppBaseName,
    });

    generator.baseName = generator.jhipsterConfig.baseName = answers.baseName;
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

    if (buildTool === 'gradle') {
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

    if (os.platform() !== 'win32') {
      buildCmd = `./${buildCmd}`;
    }
    buildCmd += ` -P${profile}`;
    return {
      stdout: exec(buildCmd, { maxBuffer: 1024 * 10000 }, cb).stdout,
      buildCmd,
    };
  }

  /**
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

    if (os.platform() !== 'win32') {
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
   * write the given files using provided config.
   *
   * @param {object} files - files to write
   * @param {object} [generator = this] - the generator instance to use
   * @param {boolean} [returnFiles = false] - weather to return the generated file list or to write them
   * @param {string|string[]} [rootTemplatesPath] - path(s) to look for templates.
   *        Single absolute path or relative path(s) between the templates folder and template path.
   * @return {string[]|Promise<string>} Filenames, promise when returnFiles is false
   */
  writeFilesToDisk(files, generator = this, returnFiles = false, rootTemplatesPath) {
    if (typeof generator === 'string' || Array.isArray(generator)) {
      rootTemplatesPath = generator;
      generator = this;
    } else if (typeof generator === 'boolean') {
      rootTemplatesPath = returnFiles;
      returnFiles = generator;
      generator = this;
    } else if (typeof returnFiles === 'string' || Array.isArray(returnFiles)) {
      rootTemplatesPath = returnFiles;
      returnFiles = false;
    }
    const _this = generator || this;
    const filesOut = [];
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
      rootTemplatesAbsolutePath = _this.jhipsterTemplatesFolders;
    } else if (typeof rootTemplatesPath === 'string' && path.isAbsolute(rootTemplatesPath)) {
      rootTemplatesAbsolutePath = rootTemplatesPath;
    } else {
      rootTemplatesPath = Array.isArray(rootTemplatesPath) ? rootTemplatesPath : [rootTemplatesPath];
      rootTemplatesAbsolutePath = _this.jhipsterTemplatesFolders
        .map(templateFolder =>
          rootTemplatesPath.map(relativePath => (relativePath ? path.join(templateFolder, relativePath) : templateFolder))
        )
        .flat();
    }

    const writeTasks = Object.values(files).map(blockTemplates => {
      return blockTemplates.map(blockTemplate => {
        if (!blockTemplate.condition || blockTemplate.condition(_this)) {
          const blockPath = blockTemplate.path || '';
          return blockTemplate.templates.map(templateObj => {
            let templatePath = blockPath;
            let method = 'template';
            let useTemplate = false;
            let options = {};
            let templatePathTo;
            if (typeof templateObj === 'string') {
              templatePath += templateObj;
            } else {
              if (typeof templateObj.file === 'string') {
                templatePath += templateObj.file;
              } else if (typeof templateObj.file === 'function') {
                templatePath += templateObj.file(_this);
              }
              method = templateObj.method ? templateObj.method : method;
              useTemplate = templateObj.template ? templateObj.template : useTemplate;
              options = templateObj.options ? { ...templateObj.options } : options;
            }
            if (templateObj && templateObj.renameTo) {
              templatePathTo = blockPath + templateObj.renameTo(_this);
            } else {
              // remove the .ejs suffix
              templatePathTo = templatePath.replace('.ejs', '');
            }

            if (_this.destinationPath) {
              templatePathTo = _this.destinationPath(templatePathTo);
            }

            if (templateObj.override !== undefined && _this.fs && _this.fs.exists(templatePathTo)) {
              if (typeof templateObj.override === 'function') {
                if (!templateObj.override(_this)) {
                  this.debug(`skipping file ${templatePathTo}`);
                  return Promise.resolve(templatePathTo);
                }
              } else if (!templateObj.override) {
                this.debug(`skipping file ${templatePathTo}`);
                return Promise.resolve(templatePathTo);
              }
            }

            filesOut.push(templatePathTo);
            if (!returnFiles) {
              const ejs =
                !templateObj.noEjs &&
                !templatePath.endsWith('.png') &&
                !templatePath.endsWith('.jpg') &&
                !templatePath.endsWith('.gif') &&
                !templatePath.endsWith('.svg') &&
                !templatePath.endsWith('.ico');

              let templatePathFrom;
              if (Array.isArray(rootTemplatesAbsolutePath)) {
                // Look for existing templates
                const existingTemplates = rootTemplatesAbsolutePath
                  .map(rootPath => _this.templatePath(rootPath, templatePath))
                  .filter(templateFile => fs.existsSync(ejs ? `${templateFile}.ejs` : templateFile));

                if (existingTemplates.length > 1) {
                  const moreThanOneMessage = `Multiples templates were found for file ${templatePath}, using the first
templates: ${JSON.stringify(existingTemplates, null, 2)}`;
                  if (existingTemplates.length > 2) {
                    generator.warning(`Possible blueprint conflict detected: ${moreThanOneMessage}`);
                  } else {
                    generator.debug(moreThanOneMessage);
                  }
                }
                templatePathFrom = existingTemplates.shift();

                if (templatePathFrom === undefined) {
                  throw new Error(`Template file ${templatePath} was not found at ${rootTemplatesAbsolutePath}`);
                }
              } else if (rootTemplatesAbsolutePath) {
                templatePathFrom = generator.templatePath(rootTemplatesAbsolutePath, templatePath);
              } else {
                templatePathFrom = generator.templatePath(templatePath);
              }
              if (ejs) {
                templatePathFrom = `${templatePathFrom}.ejs`;
              }
              // Set root for ejs to lookup for partials.
              options.root = rootTemplatesAbsolutePath;

              // if (method === 'template')
              let maybePromise = _this[method](templatePathFrom, templatePathTo, _this, options, useTemplate);
              maybePromise = maybePromise && maybePromise.then ? maybePromise : Promise.resolve(templatePathTo);
              return maybePromise;
            }
            return undefined;
          });
        }
        return undefined;
      });
    });
    this.debug(`Time taken to write files: ${new Date() - startTime}ms`);
    return returnFiles
      ? filesOut
      : Promise.all(
          writeTasks
            .flat()
            .flat()
            .filter(filename => filename)
        );
  }

  /**
   * Parse runtime options.
   * @param {Object} [options] - object to load from.
   * @param {Object} [dest] - object to write to.
   */
  parseCommonRuntimeOptions(options = this.options, dest = this.configOptions) {
    if (options.outputPathCustomizer) {
      if (dest.outputPathCustomizer === undefined) {
        dest.outputPathCustomizer = [];
      } else if (!Array.isArray(dest.outputPathCustomizer)) {
        dest.outputPathCustomizer = [dest.outputPathCustomizer];
      }
      if (Array.isArray(options.outputPathCustomizer)) {
        options.outputPathCustomizer.forEach(customizer => {
          if (!dest.outputPathCustomizer.includes(customizer)) {
            dest.outputPathCustomizer.push(customizer);
          }
        });
      } else if (!dest.outputPathCustomizer.includes(options.outputPathCustomizer)) {
        dest.outputPathCustomizer.push(options.outputPathCustomizer);
      }
    }

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
      this.jhipsterConfig.testFrameworks = options.testFrameworks;
    }
    if (options.legacyDbNames !== undefined) {
      this.jhipsterConfig.legacyDbNames = options.legacyDbNames;
    }
    if (options.language) {
      // workaround double options parsing, remove once generator supports skipping parse options
      const languages = options.language.flat();
      this.jhipsterConfig.languages = [...this.jhipsterConfig.languages, ...languages];
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
    config.dependabotPackageJson = config.dependabotPackageJson || {};
    dest.dependabotPackageJson = config.dependabotPackageJson;
  }

  /**
   * Load app configs into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {any} config - config to load config from
   * @param {any} dest - destination context to use default is context
   */
  loadAppConfig(config = _.defaults({}, this.jhipsterConfig, defaultConfig), dest = this) {
    dest.jhipsterVersion = config.jhipsterVersion;
    dest.baseName = config.baseName;
    dest.applicationType = config.applicationType;
    dest.reactive = config.reactive;
    dest.jhiPrefix = config.jhiPrefix;
    dest.skipFakeData = config.skipFakeData;
    dest.entitySuffix = config.entitySuffix;
    dest.dtoSuffix = config.dtoSuffix;
    dest.skipUserManagement = config.skipUserManagement;

    dest.skipServer = config.skipServer;
    dest.skipCommitHook = config.skipCommitHook;
    dest.otherModules = config.otherModules || [];
    dest.skipClient = config.skipClient;
    dest.prettierJava = config.prettierJava;
    dest.pages = config.pages;
    dest.skipJhipsterDependencies = !!config.skipJhipsterDependencies;
    dest.withAdminUi = config.withAdminUi;

    dest.testFrameworks = config.testFrameworks || [];

    dest.gatlingTests = dest.testFrameworks.includes(GATLING);
    dest.cucumberTests = dest.testFrameworks.includes(CUCUMBER);
    dest.protractorTests = dest.testFrameworks.includes(PROTRACTOR);
    dest.cypressTests = dest.testFrameworks.includes(CYPRESS);

    dest.jhiPrefixCapitalized = _.upperFirst(this.jhiPrefix);
    dest.jhiPrefixDashed = _.kebabCase(this.jhiPrefix);
    dest.applicationTypeGateway = config.applicationType === GATEWAY;
    dest.applicationTypeMonolith = config.applicationType === MONOLITH;
    dest.applicationTypeMicroservice = config.applicationType === MICROSERVICE;
  }

  /**
   * Load client configs into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {any} config - config to load config from
   * @param {any} dest - destination context to use default is context
   */
  loadClientConfig(config = _.defaults({}, this.jhipsterConfig, defaultConfig), dest = this) {
    dest.clientPackageManager = config.clientPackageManager;
    dest.clientFramework = config.clientFramework;
    dest.clientTheme = config.clientTheme;
    dest.clientThemeVariant = config.clientThemeVariant;
    dest.clientFrameworkAngular = config.clientFramework === ANGULAR;
    dest.clientFrameworkReact = config.clientFramework === REACT;
    dest.clientThemeNone = config.clientTheme === 'none';
    dest.clientThemePrimary = config.clientThemeVariant === 'primary';
    dest.clientThemeLight = config.clientThemeVariant === 'light';
    dest.clientThemeDark = config.clientThemeVariant === 'dark';
  }

  /**
   * Load translation configs into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {any} config - config to load config from
   * @param {any} dest - destination context to use default is context
   */
  loadTranslationConfig(config = _.defaults({}, this.jhipsterConfig, defaultConfig), dest = this) {
    dest.enableTranslation = config.enableTranslation;
    dest.nativeLanguage = config.nativeLanguage;
    dest.languages = config.languages;
  }

  /**
   * Load server configs into dest.
   * all variables should be set to dest,
   * all variables should be referred from config,
   * @param {any} config - config to load config from
   * @param {any} dest - destination context to use default is context
   */
  loadServerConfig(config = _.defaults({}, this.jhipsterConfig, defaultConfig), dest = this) {
    dest.packageName = config.packageName;
    dest.packageFolder = config.packageFolder;
    dest.serverPort = config.serverPort;
    dest.buildTool = config.buildTool;

    dest.authenticationType = config.authenticationType;
    dest.rememberMeKey = config.rememberMeKey;
    dest.jwtSecretKey = config.jwtSecretKey;

    dest.databaseType = config.databaseType;
    dest.devDatabaseType = config.devDatabaseType;
    dest.prodDatabaseType = config.prodDatabaseType;
    dest.searchEngine = config.searchEngine;
    dest.cacheProvider = config.cacheProvider;
    dest.enableHibernateCache = config.enableHibernateCache;
    dest.reactiveSqlTestContainers = config.reactive && [MYSQL, POSTGRESQL, MSSQL, MARIADB].includes(config.prodDatabaseType);

    dest.enableSwaggerCodegen = config.enableSwaggerCodegen;
    dest.messageBroker = config.messageBroker;
    dest.websocket = config.websocket;
    dest.serviceDiscoveryType = config.serviceDiscoveryType;

    dest.embeddableLaunchScript = config.embeddableLaunchScript;
    dest.buildToolGradle = config.buildTool === GRADLE;
    dest.buildToolMaven = config.buildTool === MAVEN;
    dest.buildToolUndefined = config.buildTool === undefined;

    dest.cacheProviderRedis = config.cacheProvider === REDIS;
    dest.cacheProviderHazelcast = config.cacheProvider === HAZELCAST;
    dest.cacheProviderMemcached = config.cacheProvider === MEMCACHED;

    dest.databaseTypeNo = config.databaseType === NO_DATABASE;
    dest.databaseTypeSql = config.databaseType === SQL;
    dest.databaseTypeCassandra = config.databaseType === CASSANDRA;
    dest.databaseTypeCouchbase = config.databaseType === COUCHBASE;
    dest.databaseTypeMongodb = config.databaseType === MONGODB;
    dest.databaseTypeNeo4j = config.databaseType === NEO4J;

    dest.devDatabaseTypeH2Disk = config.devDatabaseType === H2_DISK;
    dest.devDatabaseTypeH2Memory = config.devDatabaseType === H2_MEMORY;
    dest.devDatabaseTypeH2Any = dest.devDatabaseTypeH2Disk || dest.devDatabaseTypeH2Memory;
    dest.devDatabaseTypeCouchbase = config.devDatabaseType === COUCHBASE;

    dest.authenticationTypeSession = config.authenticationType === SESSION;
    dest.authenticationTypeJwt = config.authenticationType === JWT;
    dest.authenticationTypeOauth2 = config.authenticationType === OAUTH2;
    dest.communicationSpringWebsocket = config.websocket === SPRING_WEBSOCKET;
    dest.messageBrokerKafka = config.messageBroker === KAFKA;

    dest.serviceDiscoveryConsul = config.serviceDiscoveryType === CONSUL;
    dest.serviceDiscoveryEureka = config.serviceDiscoveryType === EUREKA;

    dest.searchEngineElasticsearch = config.searchEngine === ELASTICSEARCH;
  }

  loadPlatformConfig(config = _.defaults({}, this.jhipsterConfig, defaultConfig), dest = this) {}

  /**
   * Get all the generator configuration from the .yo-rc.json file
   * @param {string} yoRcPath - .yo-rc.json folder.
   */
  getJhipsterConfig(yoRcPath) {
    if (yoRcPath === undefined) {
      const configRootPath =
        this.configRootPath || (this.options && this.options.configRootPath) || (this.configOptions && this.configOptions.configRootPath);
      yoRcPath = path.join(configRootPath || this.destinationPath(), '.yo-rc.json');
    }
    return this.createStorage(yoRcPath, 'generator-jhipster');
  }

  /**
   * Get all the generator configuration from the .yo-rc.json file
   * @param {string} entityName - Name of the entity to load.
   * @param {boolean} create - Create storage if doesn't exists.
   */
  getEntityConfig(entityName, create = false) {
    const entityPath = this.destinationPath(JHIPSTER_CONFIG_DIR, `${_.upperFirst(entityName)}.json`);
    if (!create && !this.fs.exists(entityPath)) return undefined;
    return this.createStorage(entityPath);
  }

  /**
   * Fetch files from the generator-jhipster instance installed
   * @param {...string} subpath : the path to fetch from
   */
  fetchFromInstalledJHipster(...subpath) {
    return path.join(__dirname, ...subpath);
  }

  /**
   * Construct the entity name by appending the entity suffix.
   * @param {String} name entity name
   */
  asEntity(name) {
    return name + (this.entitySuffix || this.jhipsterConfig.entitySuffix || '');
  }

  /**
   * Construct the entity's dto name by appending the dto suffix.
   * @param {String} name entity name
   */
  asDto(name) {
    return name + (this.dtoSuffix || this.jhipsterConfig.dtoSuffix || '');
  }

  get needleApi() {
    if (this._needleApi === undefined || this._needleApi === null) {
      this._needleApi = new NeedleApi(this);
    }
    return this._needleApi;
  }

  /**
   * Get default config based on applicationType
   */
  getDefaultConfigForApplicationType(applicationType = this.jhipsterConfig.applicationType) {
    return { ...defaultApplicationOptions.getConfigForApplicationType(applicationType), ...defaultConfig };
  }

  setConfigDefaults(defaults = this.jhipsterConfig.applicationType !== MICROSERVICE ? defaultConfig : defaultConfigMicroservice) {
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
   * Returns the JDBC URL for a databaseType
   *
   * @param {string} databaseType
   * @param {*} options: databaseName, and required infos that depends of databaseType (hostname, localDirectory, ...)
   */
  getJDBCUrl(databaseType, options = {}) {
    return this.getDBCUrl(databaseType, 'jdbc', options);
  }

  /**
   * Returns the R2DBC URL for a databaseType
   *
   * @param {string} databaseType
   * @param {*} options: databaseName, and required infos that depends of databaseType (hostname, localDirectory, ...)
   */
  getR2DBCUrl(databaseType, options = {}) {
    return this.getDBCUrl(databaseType, 'r2dbc', options);
  }
};
