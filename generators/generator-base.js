/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
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
const pluralize = require('pluralize');
const jhiCore = require('jhipster-core');
const packagejs = require('../package.json');
const jhipsterUtils = require('./utils');
const constants = require('./generator-constants');
const PrivateBase = require('./generator-base-private');
const NeedleApi = require('./needle-api');

const JHIPSTER_CONFIG_DIR = '.jhipster';
const MODULES_HOOK_FILE = `${JHIPSTER_CONFIG_DIR}/modules/jhi-hooks.json`;
const GENERATOR_JHIPSTER = 'generator-jhipster';

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

/**
 * This is the Generator base class.
 * This provides all the public API methods exposed via the module system.
 * The public API methods can be directly utilized as well using commonJS require.
 *
 * The method signatures in public API should not be changed without a major version change
 */
module.exports = class extends PrivateBase {
    /**
     * Add a new menu element, at the root of the menu.
     *
     * @param {string} routerName - The name of the Angular router that is added to the menu.
     * @param {string} glyphiconName - The name of the Glyphicon (from Bootstrap) that will be displayed.
     * @param {boolean} enableTranslation - If translations are enabled or not
     * @param {string} clientFramework - The name of the client framework
     */
    addElementToMenu(routerName, glyphiconName, enableTranslation, clientFramework, translationKeyMenu = _.camelCase(routerName)) {
        if (clientFramework === 'angularX') {
            this.needleApi.clientAngular.addElementToMenu(routerName, glyphiconName, enableTranslation, translationKeyMenu);
        } else if (clientFramework === 'react') {
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
     * @param {string} glyphiconName - The name of the Glyphicon (from Bootstrap) that will be displayed.
     * @param {boolean} enableTranslation - If translations are enabled or not
     * @param {string} clientFramework - The name of the client framework
     */
    addElementToAdminMenu(routerName, glyphiconName, enableTranslation, clientFramework, translationKeyMenu = _.camelCase(routerName)) {
        if (clientFramework === 'angularX') {
            this.needleApi.clientAngular.addElementToAdminMenu(routerName, glyphiconName, enableTranslation, translationKeyMenu);
        } else if (clientFramework === 'react') {
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
     */
    addEntityToMenu(routerName, enableTranslation, clientFramework, entityTranslationKeyMenu = _.camelCase(routerName)) {
        if (this.clientFramework === 'angularX') {
            this.needleApi.clientAngular.addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu);
        } else if (this.clientFramework === 'react') {
            this.needleApi.clientReact.addEntityToMenu(routerName, enableTranslation, entityTranslationKeyMenu);
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
     * @param {boolean} entityUrl - Entity router URL
     * @param {string} clientFramework - The name of the client framework
     * @param {string} microServiceName - Microservice Name
     */
    addEntityToModule(
        entityInstance,
        entityClass,
        entityName,
        entityFolderName,
        entityFileName,
        entityUrl,
        clientFramework,
        microServiceName
    ) {
        if (clientFramework === 'angularX') {
            this.needleApi.clientAngular.addEntityToModule(
                entityInstance,
                entityClass,
                entityName,
                entityFolderName,
                entityFileName,
                entityUrl,
                microServiceName
            );
        } else if (clientFramework === 'react') {
            this.needleApi.clientReact.addEntityToModule(entityInstance, entityClass, entityName, entityFolderName, entityFileName);
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
        const fullPath = `${CLIENT_MAIN_SRC_DIR}i18n/${language}/global.json`;
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
                `${chalk.yellow('\nUnable to find ') +
                    fullPath +
                    chalk.yellow('. Reference to ')}(key: ${key}, value:${value})${chalk.yellow(' not added to global translations.\n')}`
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
                const stats = fs.lstatSync(`${CLIENT_MAIN_SRC_DIR}i18n/${language}`);
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
     * check if Right-to-Left support is necesary for i18n
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
     * return the momentLocaleId from the given language key (from constants.LANGUAGES)
     * if no momentLocaleId is defined, return the language key (which is a localeId itself)
     * @param {string} language - language key
     */
    getMomentLocaleId(language) {
        const langObj = this.getAllSupportedLanguageOptions().find(langObj => langObj.value === language);
        return langObj.momentLocaleId || language;
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
                `${chalk.yellow('\nUnable to find ') +
                    fullPath +
                    chalk.yellow('. Reference to ')}npm dependency (name: ${name}, version:${version})${chalk.yellow(' not added.\n')}`
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
                `${chalk.yellow('\nUnable to find ') +
                    fullPath +
                    chalk.yellow('. Reference to ')}npm devDependency (name: ${name}, version:${version})${chalk.yellow(' not added.\n')}`
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
                `${chalk.yellow('\nUnable to find ') +
                    fullPath +
                    chalk.yellow('. Reference to ')}npm script (name: ${name}, data:${data})${chalk.yellow(' not added.\n')}`
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
        this.addEntityToCache(entityClass, relationships, packageName, packageFolder, 'ehcache');
    }

    /**
     * Add a new entry to Ehcache in CacheConfiguration.java
     *
     * @param {string} entry - the entry (including package name) to cache
     * @param {string} packageFolder - the Java package folder
     */
    addEntryToEhcache(entry, packageFolder) {
        this.addEntryToCache(entry, packageFolder, 'ehcache');
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
     */
    dateFormatForLiquibase() {
        const now = new Date();
        const nowUTC = new Date(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate(),
            now.getUTCHours(),
            now.getUTCMinutes(),
            now.getUTCSeconds()
        );
        const year = `${nowUTC.getFullYear()}`;
        let month = `${nowUTC.getMonth() + 1}`;
        if (month.length === 1) {
            month = `0${month}`;
        }
        let day = `${nowUTC.getDate()}`;
        if (day.length === 1) {
            day = `0${day}`;
        }
        let hour = `${nowUTC.getHours()}`;
        if (hour.length === 1) {
            hour = `0${hour}`;
        }
        let minute = `${nowUTC.getMinutes()}`;
        if (minute.length === 1) {
            minute = `0${minute}`;
        }
        let second = `${nowUTC.getSeconds()}`;
        if (second.length === 1) {
            second = `0${second}`;
        }
        return `${year}${month}${day}${hour}${minute}${second}`;
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
                        /( (data-t|jhiT)ranslate="([a-zA-Z0-9 +{}'_](\.)?)+")/, // data-translate or jhiTranslate
                        /( \[translate(-v|V)alues\]="\{([a-zA-Z]|\d|:|\{|\}|\[|\]|-|'|\s|\.|_)*?\}")/, // translate-values or translateValues
                        /( translate-compile)/, // translate-compile
                        /( translate-value-max="[0-9{}()|]*")/ // translate-value-max
                    ]
                        .map(r => r.source)
                        .join('|'),
                    'g'
                );

                jhipsterUtils.copyWebResource(source, dest, regex, 'html', _this, opt, template);
                break;
            case 'stripJs':
                regex = new RegExp(
                    [
                        /(,[\s]*(resolve):[\s]*[{][\s]*(translatePartialLoader)['a-zA-Z0-9$,(){.<%=\->;\s:[\]]*(;[\s]*\}\][\s]*\}))/, // ng1 resolve block
                        /([\s]import\s\{\s?JhiLanguageService\s?\}\sfrom\s["|']ng-jhipster["|'];)/, // ng2 import jhiLanguageService
                        /(,?\s?JhiLanguageService,?\s?)/, // ng2 import jhiLanguageService
                        /(private\s[a-zA-Z0-9]*(L|l)anguageService\s?:\s?JhiLanguageService\s?,*[\s]*)/, // ng2 jhiLanguageService constructor argument
                        /(this\.[a-zA-Z0-9]*(L|l)anguageService\.setLocations\(\[['"a-zA-Z0-9\-_,\s]+\]\);[\s]*)/ // jhiLanguageService invocations
                    ]
                        .map(r => r.source)
                        .join('|'),
                    'g'
                );

                jhipsterUtils.copyWebResource(source, dest, regex, 'js', _this, opt, template);
                break;
            case 'stripJsx':
                regex = new RegExp(
                    [
                        /(import { ?Translate, ?translate ?} from 'react-jhipster';?)/, // Translate imports
                        /(import { ?translate, ?Translate ?} from 'react-jhipster';?)/, // translate imports
                        /( Translate,|, ?Translate|import { ?Translate ?} from 'react-jhipster';?)/, // Translate import
                        /( translate,|, ?translate|import { ?translate ?} from 'react-jhipster';?)/, // translate import
                        /<Translate(\s*)?((component="[a-z]+")(\s*)|(contentKey=("[a-zA-Z0-9.\-_]+"|\{.*\}))(\s*)|(interpolate=\{.*\})(\s*))*(\s*)\/?>|<\/Translate>/ // Translate component tag
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
                    regex
                },
                this
            );
        } catch (e) {
            this.log(
                chalk.yellow('\nUnable to find ') + filePath + chalk.yellow(' or missing required pattern. File rewrite failed.\n') + e
            );
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
            const generatorName = npmPackageName.replace('generator-', '');
            const generatorCallback = `${generatorName}:${callbackSubGenerator || 'app'}`;
            const moduleConfig = {
                name: `${moduleName} generator`,
                npmPackageName,
                description: description || `A JHipster module to generate ${moduleName}`,
                hookFor,
                hookType,
                generatorCallback
            };
            try {
                // if file is not present, we got an empty list, no exception
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
     * Compose an external generator with Yeoman.
     * @param {string} npmPackageName - package name
     * @param {string} subGen - sub generator name
     * @param {any} options - options to pass
     */
    composeExternalModule(npmPackageName, subGen, options) {
        let generatorTocall = path.join(process.cwd(), 'node_modules', npmPackageName, 'generators', subGen);
        try {
            if (!fs.existsSync(generatorTocall)) {
                this.debug('using global module as local version could not be found in node_modules');
                generatorTocall = path.join(npmPackageName, 'generators', subGen);
            }
            this.debug('Running yeoman compose with options: ', generatorTocall, options);
            this.composeWith(require.resolve(generatorTocall), options);
        } catch (err) {
            this.debug('ERROR:', err);
            const generatorName = npmPackageName.replace('generator-', '');
            const generatorCallback = `${generatorName}:${subGen}`;
            // Fallback for legacy modules
            this.debug('Running yeoman legacy compose with options: ', generatorCallback, options);
            this.composeWith(generatorCallback, options);
        }
    }

    /**
     * Get a name suitable for microservice
     * @param {string} microserviceName
     */
    getMicroserviceAppName(microserviceName) {
        return _.camelCase(microserviceName) + (microserviceName.endsWith('App') ? '' : 'App');
    }

    /**
     * Load an entity configuration file into context.
     */
    loadEntityJson(fromPath = this.context.fromPath) {
        const context = this.context;
        try {
            context.fileData = this.fs.readJSON(fromPath);
        } catch (err) {
            this.debug('Error:', err);
            this.error('\nThe entity configuration file could not be read!\n');
        }
        if (context.fileData.databaseType) {
            context.databaseType = context.fileData.databaseType;
        }
        context.relationships = context.fileData.relationships || [];
        context.fields = context.fileData.fields || [];
        context.haveFieldWithJavadoc = false;
        context.fields.forEach(field => {
            if (field.javadoc) {
                context.haveFieldWithJavadoc = true;
            }
        });
        context.changelogDate = context.fileData.changelogDate;
        context.dto = context.fileData.dto;
        context.service = context.fileData.service;
        context.fluentMethods = context.fileData.fluentMethods;
        context.clientRootFolder = context.fileData.clientRootFolder;
        context.pagination = context.fileData.pagination;
        context.searchEngine = _.isUndefined(context.fileData.searchEngine) ? context.searchEngine : context.fileData.searchEngine;
        context.javadoc = context.fileData.javadoc;
        context.entityTableName = context.fileData.entityTableName;
        context.jhiPrefix = context.fileData.jhiPrefix || context.jhiPrefix;
        context.skipCheckLengthOfIdentifier = context.fileData.skipCheckLengthOfIdentifier || context.skipCheckLengthOfIdentifier;
        context.jhiTablePrefix = this.getTableName(context.jhiPrefix);
        context.skipClient = context.fileData.skipClient || context.skipClient;
        this.copyFilteringFlag(context.fileData, context, context);
        if (_.isUndefined(context.entityTableName)) {
            this.warning(`entityTableName is missing in .jhipster/${context.name}.json, using entity name as fallback`);
            context.entityTableName = this.getTableName(context.name);
        }
        if (jhiCore.isReservedTableName(context.entityTableName, context.prodDatabaseType) && context.jhiPrefix) {
            context.entityTableName = `${context.jhiTablePrefix}_${context.entityTableName}`;
        }
        context.fields.forEach(field => {
            context.fieldNamesUnderscored.push(_.snakeCase(field.fieldName));
            context.fieldNameChoices.push({ name: field.fieldName, value: field.fieldName });
        });
        context.relationships.forEach(rel => {
            context.relNameChoices.push({
                name: `${rel.relationshipName}:${rel.relationshipType}`,
                value: `${rel.relationshipName}:${rel.relationshipType}`
            });
        });
        if (context.fileData.angularJSSuffix !== undefined) {
            context.entityAngularJSSuffix = context.fileData.angularJSSuffix;
        }
        context.useMicroserviceJson = context.useMicroserviceJson || !_.isUndefined(context.fileData.microserviceName);
        if (context.applicationType === 'gateway' && context.useMicroserviceJson) {
            context.microserviceName = context.fileData.microserviceName;
            if (!context.microserviceName) {
                this.error('Microservice name for the entity is not found. Entity cannot be generated!');
            }
            context.microserviceAppName = this.getMicroserviceAppName(context.microserviceName);
            context.skipServer = true;
        }
    }

    /**
     * get an entity from the configuration file
     * @param {string} file - configuration file name for the entity
     */
    getEntityJson(file) {
        let entityJson = null;

        try {
            if (this.context.microservicePath) {
                entityJson = this.fs.readJSON(path.join(this.context.microservicePath, JHIPSTER_CONFIG_DIR, `${_.upperFirst(file)}.json`));
            } else {
                entityJson = this.fs.readJSON(path.join(JHIPSTER_CONFIG_DIR, `${_.upperFirst(file)}.json`));
            }
        } catch (err) {
            this.log(chalk.red(`The JHipster entity configuration file could not be read for file ${file}!`) + err);
            this.debug('Error:', err);
        }

        return entityJson;
    }

    /**
     * get sorted list of entities according to changelog date (i.e. the order in which they were added)
     */
    getExistingEntities() {
        const entities = [];

        function isBefore(e1, e2) {
            return e1.definition.changelogDate - e2.definition.changelogDate;
        }

        if (!shelljs.test('-d', JHIPSTER_CONFIG_DIR)) {
            return entities;
        }

        return shelljs
            .ls(path.join(JHIPSTER_CONFIG_DIR, '*.json'))
            .reduce((acc, file) => {
                try {
                    const definition = jhiCore.readEntityJSON(file);
                    acc.push({ name: path.basename(file, '.json'), definition });
                } catch (error) {
                    // not an entity file / malformed?
                    this.warning(`Unable to parse entity file ${file}`);
                    this.debug('Error:', error);
                }
                return acc;
            }, entities)
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
        if (!this.jhipsterOldVersion) {
            // if old version is unknown then can't compare and return false
            return false;
        }
        return semver.lt(this.jhipsterOldVersion, version);
    }

    /**
     * executes a Git command using shellJS
     * gitExec(args [, options ], callback)
     *
     * @param {string|array} args - can be an array of arguments or a string command
     * @param {object} options[optional] - takes any of child process options
     * @param {function} callback - a callback function to be called once process complete, The call back will receive code, stdout and stderr
     */
    gitExec(args, options, callback) {
        callback = arguments[arguments.length - 1]; // eslint-disable-line prefer-rest-params
        if (arguments.length < 3) {
            options = {};
        }
        if (options.async === undefined) options.async = true;
        if (options.silent === undefined) options.silent = true;
        if (options.trace === undefined) options.trace = true;

        if (!Array.isArray(args)) {
            args = [args];
        }
        const command = `git ${args.join(' ')}`;
        if (options.trace) {
            this.info(command);
        }
        shelljs.exec(command, options, callback);
    }

    /**
     * get a table name in JHipster preferred style.
     *
     * @param {string} value - table name string
     */
    getTableName(value) {
        return this.hibernateSnakeCase(value);
    }

    /**
     * get a table column name in JHipster preferred style.
     *
     * @param {string} value - table column name string
     */
    getColumnName(value) {
        return this.hibernateSnakeCase(value);
    }

    /**
     * get a table column names plural form in JHipster preferred style.
     *
     * @param {string} value - table column name string
     */
    getPluralColumnName(value) {
        return this.getColumnName(pluralize(value));
    }

    /**
     * get a table name for joined tables in JHipster preferred style.
     *
     * @param {string} entityName - name of the entity
     * @param {string} relationshipName - name of the related entity
     * @param {string} prodDatabaseType - database type
     */
    getJoinTableName(entityName, relationshipName, prodDatabaseType) {
        const joinTableName = `${this.getTableName(entityName)}_${this.getTableName(relationshipName)}`;
        let limit = 0;
        if (prodDatabaseType === 'oracle' && joinTableName.length > 30 && !this.skipCheckLengthOfIdentifier) {
            this.warning(
                `The generated join table "${joinTableName}" is too long for Oracle (which has a 30 characters limit). It will be truncated!`
            );

            limit = 30;
        } else if (prodDatabaseType === 'mysql' && joinTableName.length > 64 && !this.skipCheckLengthOfIdentifier) {
            this.warning(
                `The generated join table "${joinTableName}" is too long for MySQL (which has a 64 characters limit). It will be truncated!`
            );

            limit = 64;
        } else if (prodDatabaseType === 'postgresql' && joinTableName.length >= 63 && !this.skipCheckLengthOfIdentifier) {
            this.warning(
                `The generated join table "${joinTableName}" is too long for PostgreSQL (which has a 63 characters limit). It will be truncated!`
            );

            limit = 63;
        }
        if (limit > 0) {
            const halfLimit = Math.floor(limit / 2);
            const entityTable = this.getTableName(entityName).substring(0, halfLimit);
            const relationTable = this.getTableName(relationshipName).substring(0, limit - entityTable.length - 1);
            return `${entityTable}_${relationTable}`;
        }
        return joinTableName;
    }

    /**
     * get a constraint name for tables in JHipster preferred style after applying any length limits required.
     *
     * @param {string} entityName - name of the entity
     * @param {string} columnOrRelationName - name of the column or related entity
     * @param {string} prodDatabaseType - database type
     * @param {boolean} noSnakeCase - do not convert names to snakecase
     * @param {string} constraintNamePrefix - constraintName prefix for the constraintName
     */
    getConstraintNameWithLimit(entityName, columnOrRelationName, prodDatabaseType, noSnakeCase, constraintNamePrefix = '') {
        let constraintName;
        if (noSnakeCase) {
            constraintName = `${constraintNamePrefix}${entityName}_${columnOrRelationName}`;
        } else {
            constraintName = `${constraintNamePrefix}${this.getTableName(entityName)}_${this.getTableName(columnOrRelationName)}`;
        }
        let limit = 0;
        if (prodDatabaseType === 'oracle' && constraintName.length >= 27 && !this.skipCheckLengthOfIdentifier) {
            this.warning(
                `The generated constraint name "${constraintName}" is too long for Oracle (which has a 30 characters limit). It will be truncated!`
            );

            limit = 28;
        } else if (prodDatabaseType === 'mysql' && constraintName.length >= 61 && !this.skipCheckLengthOfIdentifier) {
            this.warning(
                `The generated constraint name "${constraintName}" is too long for MySQL (which has a 64 characters limit). It will be truncated!`
            );

            limit = 62;
        } else if (prodDatabaseType === 'postgresql' && constraintName.length >= 60 && !this.skipCheckLengthOfIdentifier) {
            this.warning(
                `The generated constraint name "${constraintName}" is too long for PostgreSQL (which has a 63 characters limit). It will be truncated!`
            );

            limit = 61;
        }
        if (limit > 0) {
            const halfLimit = Math.floor(limit / 2);
            const entityTable = noSnakeCase ? entityName.substring(0, halfLimit) : this.getTableName(entityName).substring(0, halfLimit);
            const otherTable = noSnakeCase
                ? columnOrRelationName.substring(0, limit - entityTable.length - 2)
                : this.getTableName(columnOrRelationName).substring(0, limit - entityTable.length - 2);
            return `${entityTable}_${otherTable}`;
        }
        return constraintName;
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
        this.env.error(`${msg}`);
    }

    /**
     * Print a warning message.
     *
     * @param {string} msg - message to print
     */
    warning(msg) {
        this.log(`${chalk.yellow.bold('WARNING!')} ${msg}`);
    }

    /**
     * Print an info message.
     *
     * @param {string} msg - message to print
     */
    info(msg) {
        this.log.info(msg);
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
     * Generate a KeyStore for uaa authorization server.
     */
    generateKeyStore() {
        const done = this.async();
        const keyStoreFile = `${SERVER_MAIN_RES_DIR}config/tls/keystore.p12`;
        if (this.fs.exists(keyStoreFile)) {
            this.log(chalk.cyan(`\nKeyStore '${keyStoreFile}' already exists. Leaving unchanged.\n`));
            done();
        } else {
            shelljs.mkdir('-p', `${SERVER_MAIN_RES_DIR}config/tls`);
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
            this.log(
                chalk.red('This can cause problems, you should always create a new directory and run the jhipster command from here.')
            );
            this.log(chalk.white(`See the troubleshooting section at ${chalk.yellow('https://www.jhipster.tech/installation/')}`));
        }
        this.log(
            chalk.green(
                ' _______________________________________________________________________________________________________________\n'
            )
        );
        this.log(
            chalk.white(`  Documentation for creating an application is at ${chalk.yellow('https://www.jhipster.tech/creating-an-app/')}`)
        );
        this.log(
            chalk.white(
                `  If you find JHipster useful, consider sponsoring the project at ${chalk.yellow(
                    'https://opencollective.com/generator-jhipster'
                )}`
            )
        );
        this.log(
            chalk.green(
                ' _______________________________________________________________________________________________________________\n'
            )
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
                            `${chalk.yellow(' ______________________________________________________________________________\n\n') +
                                chalk.yellow('  JHipster update available: ') +
                                chalk.green.bold(stdout.replace('\n', '')) +
                                chalk.gray(` (current: ${packagejs.version})`)}\n`
                        );
                        if (this.useNpm) {
                            this.log(chalk.yellow(`  Run ${chalk.magenta(`npm install -g ${GENERATOR_JHIPSTER}`)} to update.\n`));
                        } else {
                            this.log(chalk.yellow(`  Run ${chalk.magenta(`yarn global upgrade ${GENERATOR_JHIPSTER}`)} to update.\n`));
                        }
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
     * get the Angular application name.
     * @param {string} baseName of application
     */
    getAngularAppName(baseName = this.baseName) {
        const name = _.camelCase(baseName) + (baseName.endsWith('App') ? '' : 'App');
        return name.match(/^\d/) ? 'App' : name;
    }

    /**
     * get the Angular application name.
     * @param {string} baseName of application
     */
    getAngularXAppName(baseName = this.baseName) {
        const name = this.upperFirstCamelCase(baseName);
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
        let hash = 0;
        let i;
        let chr;

        for (i = 0; i < baseName.length; i++) {
            chr = baseName.charCodeAt(i);
            hash = (hash << 5) - hash + chr; // eslint-disable-line no-bitwise
            hash |= 0; // eslint-disable-line no-bitwise
        }

        if (hash < 0) {
            hash *= -1;
        }

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
    askModuleName(generator) {
        const done = generator.async();
        const defaultAppBaseName = this.getDefaultAppName();
        generator
            .prompt({
                type: 'input',
                name: 'baseName',
                validate: input => {
                    if (!/^([a-zA-Z0-9_]*)$/.test(input)) {
                        return 'Your base name cannot contain special characters or a blank space';
                    }
                    if ((generator.applicationType === 'microservice' || generator.applicationType === 'uaa') && /_/.test(input)) {
                        return 'Your base name cannot contain underscores as this does not meet the URI spec';
                    }
                    if (generator.applicationType === 'uaa' && input === 'auth') {
                        return "Your UAA base name cannot be named 'auth' as it conflicts with the gateway login routes";
                    }
                    if (input === 'application') {
                        return "Your base name cannot be named 'application' as this is a reserved name for Spring Boot";
                    }
                    return true;
                },
                message: 'What is the base name of your application?',
                default: defaultAppBaseName
            })
            .then(prompt => {
                generator.baseName = prompt.baseName;
                done();
            });
    }

    /**
     * ask a prompt for i18n option.
     *
     * @param {object} generator - generator instance to use
     */
    aski18n(generator) {
        const languageOptions = this.getAllSupportedLanguageOptions();

        const done = generator.async();
        const prompts = [
            {
                type: 'confirm',
                name: 'enableTranslation',
                message: 'Would you like to enable internationalization support?',
                default: true
            },
            {
                when: response => response.enableTranslation === true,
                type: 'list',
                name: 'nativeLanguage',
                message: 'Please choose the native language of the application',
                choices: languageOptions,
                default: 'en',
                store: true
            },
            {
                when: response => response.enableTranslation === true,
                type: 'checkbox',
                name: 'languages',
                message: 'Please choose additional languages to install',
                choices: response => _.filter(languageOptions, o => o.value !== response.nativeLanguage)
            }
        ];

        generator.prompt(prompts).then(prompt => {
            generator.enableTranslation = prompt.enableTranslation;
            generator.nativeLanguage = prompt.nativeLanguage;
            generator.languages = [prompt.nativeLanguage].concat(prompt.languages);
            done();
        });
    }

    /**
     * compose using the language sub generator.
     *
     * @param {object} generator - generator instance to use
     * @param {object} configOptions - options to pass to the generator
     * @param {String} type - server | client
     */
    composeLanguagesSub(generator, configOptions, type) {
        if (generator.enableTranslation) {
            // skip server if app type is client
            const skipServer = type && type === 'client';
            // skip client if app type is server
            const skipClient = type && type === 'server';
            generator.composeWith(require.resolve('./languages'), {
                configOptions,
                'skip-install': true,
                'skip-server': skipServer,
                'skip-client': skipClient,
                'from-cli': generator.options['from-cli'],
                skipChecks: generator.options.skipChecks,
                languages: generator.languages,
                force: generator.options.force,
                debug: generator.options.debug
            });
        }
    }

    /**
     * build a generated application.
     *
     * @param {String} buildTool - maven | gradle
     * @param {String} profile - dev | prod
     * @param {Boolean} buildWar - build a war instead of a jar
     * @param {Function} cb - callback when build is complete
     */
    buildApplication(buildTool, profile, buildWar, cb) {
        let buildCmd = 'mvnw -ntp verify -DskipTests=true -B';

        if (buildTool === 'gradle') {
            buildCmd = 'gradlew -x test';
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
        const child = {};
        child.stdout = exec(buildCmd, { maxBuffer: 1024 * 10000 }, cb).stdout;
        child.buildCmd = buildCmd;

        return child;
    }

    /**
     * write the given files using provided config.
     *
     * @param {object} files - files to write
     * @param {object} generator - the generator instance to use
     * @param {boolean} returnFiles - weather to return the generated file list or to write them
     * @param {string} prefix - pefix to add to path
     */
    writeFilesToDisk(files, generator, returnFiles, prefix) {
        const _this = generator || this;
        const filesOut = [];
        const startTime = new Date();
        // using the fastest method for iterations
        for (let i = 0, blocks = Object.keys(files); i < blocks.length; i++) {
            for (let j = 0, blockTemplates = files[blocks[i]]; j < blockTemplates.length; j++) {
                const blockTemplate = blockTemplates[j];
                if (!blockTemplate.condition || blockTemplate.condition(_this)) {
                    const path = blockTemplate.path || '';
                    blockTemplate.templates.forEach(templateObj => {
                        let templatePath = path;
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
                            options = templateObj.options ? templateObj.options : options;
                        }
                        if (templateObj && templateObj.renameTo) {
                            templatePathTo = path + templateObj.renameTo(_this);
                        } else {
                            // remove the .ejs suffix
                            templatePathTo = templatePath.replace('.ejs', '');
                        }
                        filesOut.push(templatePathTo);
                        if (!returnFiles) {
                            let templatePathFrom = prefix ? `${prefix}/${templatePath}` : templatePath;
                            if (
                                !templateObj.noEjs &&
                                !templatePathFrom.endsWith('.png') &&
                                !templatePathFrom.endsWith('.jpg') &&
                                !templatePathFrom.endsWith('.gif') &&
                                !templatePathFrom.endsWith('.svg') &&
                                !templatePathFrom.endsWith('.ico')
                            ) {
                                templatePathFrom = `${templatePathFrom}.ejs`;
                            }
                            // if (method === 'template')
                            _this[method](templatePathFrom, templatePathTo, _this, options, useTemplate);
                        }
                    });
                }
            }
        }
        this.debug(`Time taken to write files: ${new Date() - startTime}ms`);
        return filesOut;
    }

    /**
     * Setup shared level options from context.
     * all variables should be set to dest,
     * all variables should be referred from context,
     * all methods should be called on generator,
     * @param {any} generator - generator instance
     * @param {any} context - context to use default is generator instance
     * @param {any} dest - destination context to use default is context
     */
    setupSharedOptions(generator, context = generator, dest = context) {
        dest.skipClient = context.options['client-hook'] === false || context.configOptions.skipClient || context.config.get('skipClient');
        dest.skipServer = context.configOptions.skipServer || context.config.get('skipServer');
        dest.skipUserManagement =
            context.configOptions.skipUserManagement || context.options['skip-user-management'] || context.config.get('skipUserManagement');
        dest.otherModules = context.configOptions.otherModules || [];
        dest.baseName = context.configOptions.baseName;
        dest.logo = context.configOptions.logo;
        dest.clientPackageManager = context.configOptions.clientPackageManager;
        dest.isDebugEnabled = context.configOptions.isDebugEnabled || context.options.debug;
        dest.experimental = context.configOptions.experimental || context.options.experimental;
        dest.embeddableLaunchScript = context.configOptions.embeddableLaunchScript || false;

        const uaaBaseName = context.configOptions.uaaBaseName || context.options['uaa-base-name'] || context.config.get('uaaBaseName');
        if (dest.authenticationType === 'uaa' && _.isNil(uaaBaseName)) {
            generator.error('when using --auth uaa, a UAA basename must be provided with --uaa-base-name');
        }
        dest.uaaBaseName = uaaBaseName;
    }

    /**
     * Setup client instance level options from context.
     * all variables should be set to dest,
     * all variables should be referred from context,
     * all methods should be called on generator,
     * @param {any} generator - generator instance
     * @param {any} context - context to use default is generator instance
     * @param {any} dest - destination context to use default is context
     */
    setupClientOptions(generator, context = generator, dest = context) {
        this.setupSharedOptions(generator, context, dest);
        dest.skipCommitHook = context.options['skip-commit-hook'] || context.config.get('skipCommitHook');
        dest.authenticationType =
            context.options.auth || context.configOptions.authenticationType || context.config.get('authenticationType');
        dest.serviceDiscoveryType = context.configOptions.serviceDiscoveryType || context.config.get('serviceDiscoveryType');

        dest.buildTool = context.configOptions.buildTool;
        dest.websocket = context.configOptions.websocket;
        dest.devDatabaseType = context.configOptions.devDatabaseType || context.config.get('devDatabaseType');
        dest.prodDatabaseType = context.configOptions.prodDatabaseType || context.config.get('prodDatabaseType');
        dest.databaseType =
            generator.getDBTypeFromDBValue(dest.prodDatabaseType) ||
            context.configOptions.databaseType ||
            context.config.get('databaseType');
        if (dest.authenticationType === 'oauth2' || (dest.databaseType === 'no' && dest.authenticationType !== 'uaa')) {
            dest.skipUserManagement = true;
        }
        dest.searchEngine = context.config.get('searchEngine');
        dest.cacheProvider = context.config.get('cacheProvider') || context.config.get('hibernateCache') || 'no';
        dest.enableHibernateCache = context.config.get('enableHibernateCache') && !['no', 'memcached'].includes(dest.cacheProvider);
        dest.jhiPrefix = context.configOptions.jhiPrefix || context.config.get('jhiPrefix');
        dest.jhiPrefixCapitalized = _.upperFirst(generator.jhiPrefix);
        dest.jhiPrefixDashed = _.kebabCase(generator.jhiPrefix);
        dest.testFrameworks = context.configOptions.testFrameworks || [];

        dest.useYarn = context.configOptions.useYarn;
    }

    /**
     * Setup Server instance level options from context.
     * all variables should be set to dest,
     * all variables should be referred from context,
     * all methods should be called on generator,
     * @param {any} generator - generator instance
     * @param {any} context - context to use default is generator instance
     * @param {any} dest - destination context to use default is context
     */
    setupServerOptions(generator, context = generator, dest = context) {
        this.setupSharedOptions(generator, context, dest);
        dest.enableTranslation = context.configOptions.enableTranslation || context.config.get('enableTranslation');
        dest.testFrameworks = context.configOptions.testFrameworks;
    }

    /**
     * Setup Entity instance level options from context.
     * all variables should be set to dest,
     * all variables should be referred from context,
     * all methods should be called on generator,
     * @param {any} generator - generator instance
     * @param {any} context - context to use default is generator instance
     * @param {any} dest - destination context to use default is context
     */
    setupEntityOptions(generator, context = generator, dest = context) {
        dest.name = context.options.name;
        // remove extension if feeding json files
        if (dest.name !== undefined) {
            dest.name = dest.name.replace('.json', '');
        }

        dest.regenerate = context.options.regenerate;
        dest.fluentMethods = context.options['fluent-methods'];
        dest.skipCheckLengthOfIdentifier = context.options['skip-check-length-of-identifier'];
        dest.entityTableName = generator.getTableName(context.options['table-name'] || dest.name);
        dest.entityNameCapitalized = _.upperFirst(dest.name);
        dest.entityAngularJSSuffix = context.options['angular-suffix'];
        dest.skipUiGrouping = context.options['skip-ui-grouping'];
        dest.clientRootFolder = context.options['skip-ui-grouping'] ? '' : context.options['client-root-folder'];
        dest.isDebugEnabled = context.options.debug;
        dest.experimental = context.options.experimental;
        if (dest.entityAngularJSSuffix && !dest.entityAngularJSSuffix.startsWith('-')) {
            dest.entityAngularJSSuffix = `-${dest.entityAngularJSSuffix}`;
        }
        dest.rootDir = generator.destinationRoot();
        // enum-specific consts
        dest.enums = [];

        dest.existingEnum = false;

        dest.fieldNamesUnderscored = ['id'];
        // these variable hold field and relationship names for question options during update
        dest.fieldNameChoices = [];
        dest.relNameChoices = [];
    }

    /**
     * Get all the generator configuration from the .yo-rc.json file
     * @param {Generator} generator the generator instance to use
     * @param {boolean} force force getting direct from file
     */
    getAllJhipsterConfig(generator = this, force) {
        const configRootPath =
            generator.configRootPath ||
            (generator.options && generator.options.configRootPath) ||
            (generator.configOptions && generator.configOptions.configRootPath) ||
            '';
        return jhipsterUtils.getAllJhipsterConfig(generator, force, configRootPath);
    }

    /**
     * Fetch files from the generator-jhipster instance installed
     * @param {string} subpath : the path to fetch from
     */
    fetchFromInstalledJHipster(subpath) {
        return path.join(__dirname, subpath);
    }

    /**
     * Construct the entity name by appending the entity suffix.
     * @param {String} name entity name
     */
    asEntity(name) {
        return name + this.entitySuffix;
    }

    /**
     * Construct the entity's dto name by appending the dto suffix.
     * @param {String} name entity name
     */
    asDto(name) {
        return name + this.dtoSuffix;
    }

    get needleApi() {
        if (this._needleApi === undefined || this._needleApi === null) {
            this._needleApi = new NeedleApi(this);
        }
        return this._needleApi;
    }
};
