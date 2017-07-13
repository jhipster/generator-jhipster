/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
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

const JHIPSTER_CONFIG_DIR = '.jhipster';
const MODULES_HOOK_FILE = `${JHIPSTER_CONFIG_DIR}/modules/jhi-hooks.json`;
const GENERATOR_JHIPSTER = 'generator-jhipster';

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
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
     * Get the JHipster configuration from the .yo-rc.json file.
     *
     * @param {string} namespace - namespace of the .yo-rc.json config file. By default: generator-jhipster
     */
    getJhipsterAppConfig(namespace = 'generator-jhipster') {
        const fromPath = '.yo-rc.json';
        if (shelljs.test('-f', fromPath)) {
            const fileData = this.fs.readJSON(fromPath);
            if (fileData && fileData[namespace]) {
                return fileData[namespace];
            }
        }
        return false;
    }

    /**
     * Add a new menu element, at the root of the menu.
     *
     * @param {string} routerName - The name of the AngularJS router that is added to the menu.
     * @param {string} glyphiconName - The name of the Glyphicon (from Bootstrap) that will be displayed.
     * @param {boolean} enableTranslation - If translations are enabled or not
     * @param {string} clientFramework - The name of the client framework
     */
    addElementToMenu(routerName, glyphiconName, enableTranslation, clientFramework) {
        let navbarPath;
        try {
            if (clientFramework === 'angular1') {
                navbarPath = `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.html`;
                jhipsterUtils.rewriteFile({
                    file: navbarPath,
                    needle: 'jhipster-needle-add-element-to-menu',
                    splicable: [`<li ui-sref-active="active">
                                <a ui-sref="${routerName}" ng-click="vm.collapseNavbar()">
                                    <span class="glyphicon glyphicon-${glyphiconName}"></span>&nbsp;
                                    <span${enableTranslation ? ` data-translate="global.menu.${routerName}"` : ''}>${_.startCase(routerName)}</span>
                                </a>
                            </li>`
                    ]
                }, this);
            } else {
                navbarPath = `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`;
                jhipsterUtils.rewriteFile({
                    file: navbarPath,
                    needle: 'jhipster-needle-add-element-to-menu',
                    splicable: [`<li class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
                                <a class="nav-link" routerLink="${routerName}" (click)="collapseNavbar()">
                                    <i class="fa fa-${glyphiconName}"></i>&nbsp;
                                    <span${enableTranslation ? ` jhiTranslate="global.menu.${routerName}"` : ''}>${_.startCase(routerName)}</span>
                                </a>
                            </li>`
                    ]
                }, this);
            }
        } catch (e) {
            this.log(`${chalk.yellow('\nUnable to find ') + navbarPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + routerName} ${chalk.yellow('not added to menu.\n')}`);
        }
    }

    /**
     * Add a new menu element to the admin menu.
     *
     * @param {string} routerName - The name of the AngularJS router that is added to the admin menu.
     * @param {string} glyphiconName - The name of the Glyphicon (from Bootstrap) that will be displayed.
     * @param {boolean} enableTranslation - If translations are enabled or not
     * @param {string} clientFramework - The name of the client framework
     */
    addElementToAdminMenu(routerName, glyphiconName, enableTranslation, clientFramework) {
        let navbarAdminPath;
        try {
            if (clientFramework === 'angular1') {
                navbarAdminPath = `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.html`;
                jhipsterUtils.rewriteFile({
                    file: navbarAdminPath,
                    needle: 'jhipster-needle-add-element-to-admin-menu',
                    splicable: [`<li ui-sref-active="active">
                            <a ui-sref="${routerName}" ng-click="vm.collapseNavbar()">
                                <span class="glyphicon glyphicon-${glyphiconName}"></span>&nbsp;
                                <span${enableTranslation ? ` data-translate="global.menu.admin.${routerName}"` : ''}>${_.startCase(routerName)}</span>
                            </a>
                        </li>`
                    ]
                }, this);
            } else {
                navbarAdminPath = `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`;
                jhipsterUtils.rewriteFile({
                    file: navbarAdminPath,
                    needle: 'jhipster-needle-add-element-to-admin-menu',
                    splicable: [`<li>
                        <a class="dropdown-item" routerLink="${routerName}" routerLinkActive="active" (click)="collapseNavbar()">
                            <i class="fa fa-${glyphiconName}" aria-hidden="true"></i>&nbsp;
                            <span${enableTranslation ? ` jhiTranslate="global.menu.admin.${routerName}"` : ''}>${_.startCase(routerName)}</span>
                        </a>
                    </li>`
                    ]
                }, this);
            }
        } catch (e) {
            this.log(`${chalk.yellow('\nUnable to find ') + navbarAdminPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + routerName} ${chalk.yellow('not added to admin menu.\n')}`);
        }
    }

    /**
     * Add a new entity route path to webpacks config
     *
     * @param {string} microserviceName - The name of the microservice to put into the url
     * @param {string} clientFramework - The name of the client framework
     */
    addEntityToWebpack(microserviceName, clientFramework) {
        if (clientFramework === 'angular1') {
            return;
        }

        const webpackDevPath = `${CLIENT_WEBPACK_DIR}/webpack.dev.js`;
        jhipsterUtils.rewriteFile({
            file: webpackDevPath,
            needle: 'jhipster-needle-add-entity-to-webpack',
            splicable: [`'/${microserviceName.toLowerCase()}',`]
        }, this);
    }

    /**
     * Add a new entity in the "entities" menu.
     *
     * @param {string} routerName - The name of the AngularJS router (which by default is the name of the entity).
     * @param {boolean} enableTranslation - If translations are enabled or not
     * @param {string} clientFramework - The name of the client framework
     */
    addEntityToMenu(routerName, enableTranslation, clientFramework) {
        let entityMenuPath;
        try {
            if (clientFramework === 'angular1') {
                entityMenuPath = `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.html`;
                jhipsterUtils.rewriteFile({
                    file: entityMenuPath,
                    needle: 'jhipster-needle-add-entity-to-menu',
                    splicable: [`<li ui-sref-active="active">
                                <a ui-sref="${routerName}" ng-click="vm.collapseNavbar()">
                                    <span class="glyphicon glyphicon-asterisk"></span>&nbsp;
                                    <span${enableTranslation ? ` data-translate="global.menu.entities.${_.camelCase(routerName)}"` : ''}>${_.startCase(routerName)}</span>
                                </a>
                            </li>`
                    ]
                }, this);
            } else {
                entityMenuPath = `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`;
                jhipsterUtils.rewriteFile({
                    file: entityMenuPath,
                    needle: 'jhipster-needle-add-entity-to-menu',
                    splicable: [
                        this.stripMargin(
                            `|<li>
                             |                        <a class="dropdown-item" routerLink="${routerName}" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="collapseNavbar()">
                             |                            <i class="fa fa-fw fa-asterisk" aria-hidden="true"></i>
                             |                            <span${enableTranslation ? ` jhiTranslate="global.menu.entities.${_.camelCase(routerName)}"` : ''}>${_.startCase(routerName)}</span>
                             |                        </a>
                             |                    </li>`
                        )
                    ]
                }, this);
            }
        } catch (e) {
            this.log(`${chalk.yellow('\nUnable to find ') + entityMenuPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + routerName} ${chalk.yellow('not added to menu.\n')}`);
        }
    }

    /**
     * Add a new entity in the TS modules file.
     *
     * @param {string} routerName - The name of the AngularJS router (which by default is the name of the entity).
     * @param {boolean} enableTranslation - If translations are enabled or not
     * @param {string} clientFramework - The name of the client framework
     */
    addEntityToModule(entityInstance, entityClass, entityAngularName, entityFolderName, entityFileName, enableTranslation, clientFramework) {
        const entityModulePath = `${CLIENT_MAIN_SRC_DIR}app/entities/entity.module.ts`;
        try {
            if (clientFramework === 'angular1') {
                return;
            }
            const appName = this.getAngularXAppName();
            let importStatement = `|import { ${appName}${entityAngularName}Module } from './${entityFolderName}/${entityFileName}.module';`;
            if (importStatement.length > constants.LINE_LENGTH) {
                importStatement =
                    `|import {
                     |    ${appName}${entityAngularName}Module
                     |} from './${entityFolderName}/${entityFileName}.module';`;
            }
            jhipsterUtils.rewriteFile({
                file: entityModulePath,
                needle: 'jhipster-needle-add-entity-module-import',
                splicable: [
                    this.stripMargin(importStatement)
                ]
            }, this);

            jhipsterUtils.rewriteFile({
                file: entityModulePath,
                needle: 'jhipster-needle-add-entity-module',
                splicable: [
                    this.stripMargin(
                        `|${appName}${entityAngularName}Module,`
                    )
                ]
            }, this);
        } catch (e) {
            this.log(e);
            this.log(`${chalk.yellow('\nUnable to find ') + entityModulePath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + entityInstance + entityClass + entityFolderName + entityFileName} ${chalk.yellow(`not added to ${entityModulePath}.\n`)}`);
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
        const adminModulePath = `${CLIENT_MAIN_SRC_DIR}app/admin/admin.module.ts`;
        try {
            if (clientFramework === 'angular1') {
                return;
            }
            let importStatement = `|import { ${appName}${adminAngularName}Module } from './${adminFolderName}/${adminFileName}.module';`;
            if (importStatement.length > constants.LINE_LENGTH) {
                importStatement =
                    `|import {
                     |    ${appName}${adminAngularName}Module
                     |} from './${adminFolderName}/${adminFileName}.module';`;
            }
            jhipsterUtils.rewriteFile({
                file: adminModulePath,
                needle: 'jhipster-needle-add-admin-module-import',
                splicable: [
                    this.stripMargin(importStatement)
                ]
            }, this);

            jhipsterUtils.rewriteFile({
                file: adminModulePath,
                needle: 'jhipster-needle-add-admin-module',
                splicable: [
                    this.stripMargin(
                        `|${appName}${adminAngularName}Module,`
                    )
                ]
            }, this);
        } catch (e) {
            this.log(e);
            this.log(`${chalk.yellow('\nUnable to find ') + appName + chalk.yellow(' or missing required jhipster-needle. Reference to ') + adminAngularName + adminFolderName + adminFileName + enableTranslation + clientFramework} ${chalk.yellow(`not added to ${adminModulePath}.\n`)}`);
        }
    }

    /**
     * A a new element in the "global.json" translations.
     *
     * @param {string} key - Key for the menu entry
     * @param {string} value - Default translated value
     * @param {string} language - The language to which this translation should be added
     */
    addElementTranslationKey(key, value, language) {
        const fullPath = `${CLIENT_MAIN_SRC_DIR}i18n/${language}/global.json`;
        try {
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-menu-add-element',
                splicable: [
                    `"${key}": "${_.startCase(value)}",`
                ]
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + language + chalk.yellow(' not added as a new entity in the menu.\n'));
        }
    }

    /**
     * A a new element in the admin section of "global.json" translations.
     *
     * @param {string} key - Key for the menu entry
     * @param {string} value - Default translated value
     * @param {string} language - The language to which this translation should be added
     */
    addAdminElementTranslationKey(key, value, language) {
        const fullPath = `${CLIENT_MAIN_SRC_DIR}i18n/${language}/global.json`;
        try {
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-menu-add-admin-element',
                splicable: [
                    `"${key}": "${_.startCase(value)}",`
                ]
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + language + chalk.yellow(' not added as a new entry in the admin menu.\n'));
        }
    }

    /**
     * A a new entity in the "global.json" translations.
     *
     * @param {string} key - Key for the entity name
     * @param {string} value - Default translated value
     * @param {string} language - The language to which this translation should be added
     */
    addEntityTranslationKey(key, value, language) {
        const fullPath = `${CLIENT_MAIN_SRC_DIR}i18n/${language}/global.json`;
        try {
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-menu-add-entry',
                splicable: [
                    `"${key}": "${_.startCase(value)}",`
                ]
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + language + chalk.yellow(' not added as a new entity in the menu.\n'));
        }
    }

    /**
     * A a new entry as a root param in "global.json" translations.
     *
     * @param {string} key - Key for the entry
     * @param {string} value - Default translated value or object with multiple key and translated value
     * @param {string} language - The language to which this translation should be added
     */
    addGlobalTranslationKey(key, value, language) {
        const fullPath = `${CLIENT_MAIN_SRC_DIR}i18n/${language}/global.json`;
        try {
            jhipsterUtils.rewriteJSONFile(fullPath, (jsonObj) => {
                jsonObj[key] = value;
            }, this);
        } catch (e) {
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ')}(key: ${key}, value:${value})${chalk.yellow(' not added to global translations.\n')}`);
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
            this.getAllInstalledLanguages().forEach((language) => {
                this[method](key, value, language);
            });
        }
    }

    /**
     * get all the languages installed currently
     */
    getAllInstalledLanguages() {
        const languages = [];
        this.getAllSupportedLanguages().forEach((language) => {
            try {
                const stats = fs.lstatSync(`${CLIENT_MAIN_SRC_DIR}i18n/${language}`);
                if (stats.isDirectory()) {
                    languages.push(language);
                }
            } catch (e) {
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
     * get all the languages options supported by JHipster
     */
    getAllSupportedLanguageOptions() {
        return [
            { name: 'Arabic (Libya)', dispName: 'العربية', value: 'ar-ly', rtl: true, skipForLocale: true },
            { name: 'Armenian', dispName: 'Հայերեն', value: 'hy' },
            { name: 'Catalan', dispName: 'Català', value: 'ca' },
            { name: 'Chinese (Simplified)', dispName: '中文（简体）', value: 'zh-cn' },
            { name: 'Chinese (Traditional)', dispName: '繁體中文', value: 'zh-tw' },
            { name: 'Czech', dispName: 'Český', value: 'cs' },
            { name: 'Danish', dispName: 'Dansk', value: 'da' },
            { name: 'Dutch', dispName: 'Nederlands', value: 'nl' },
            { name: 'English', dispName: 'English', value: 'en' },
            { name: 'Estonian', dispName: 'Eesti', value: 'et' },
            { name: 'Farsi', dispName: 'فارسی', value: 'fa', rtl: true },
            { name: 'French', dispName: 'Français', value: 'fr' },
            { name: 'Galician', dispName: 'Galego', value: 'gl' },
            { name: 'German', dispName: 'Deutsch', value: 'de' },
            { name: 'Greek', dispName: 'Ελληνικά', value: 'el' },
            { name: 'Hindi', dispName: 'हिंदी', value: 'hi' },
            { name: 'Hungarian', dispName: 'Magyar', value: 'hu' },
            { name: 'Indonesian', dispName: 'Bahasa Indonesia', value: 'id' },
            { name: 'Italian', dispName: 'Italiano', value: 'it' },
            { name: 'Japanese', dispName: '日本語', value: 'ja' },
            { name: 'Korean', dispName: '한국어', value: 'ko' },
            { name: 'Marathi', dispName: 'मराठी', value: 'mr' },
            { name: 'Polish', dispName: 'Polski', value: 'pl' },
            { name: 'Portuguese (Brazilian)', dispName: 'Português (Brasil)', value: 'pt-br' },
            { name: 'Portuguese', dispName: 'Português', value: 'pt-pt' },
            { name: 'Romanian', dispName: 'Română', value: 'ro' },
            { name: 'Russian', dispName: 'Русский', value: 'ru' },
            { name: 'Slovak', dispName: 'Slovenský', value: 'sk' },
            { name: 'Serbian', dispName: 'Srpski', value: 'sr' },
            { name: 'Spanish', dispName: 'Español', value: 'es' },
            { name: 'Swedish', dispName: 'Svenska', value: 'sv' },
            { name: 'Turkish', dispName: 'Türkçe', value: 'tr' },
            { name: 'Tamil', dispName: 'தமிழ்', value: 'ta' },
            { name: 'Thai', dispName: 'ไทย', value: 'th' },
            { name: 'Ukrainian', dispName: 'Українська', value: 'ua' },
            { name: 'Vietnamese', dispName: 'Tiếng Việt', value: 'vi' }
        ];
    }

    /**
     * Add new social configuration in the "application.yml".
     *
     * @param {string} name - social name (twitter, facebook, ect.)
     * @param {string} clientId - clientId
     * @param {string} clientSecret - clientSecret
     * @param {string} comment - url of how to configure the social service
     */
    addSocialConfiguration(name, clientId, clientSecret, comment) {
        const fullPath = `${SERVER_MAIN_RES_DIR}config/application.yml`;
        try {
            this.log(chalk.yellow('   update ') + fullPath);
            let config = '';
            if (comment) {
                config += `# ${comment}\n        `;
            }
            config += `${name}:\n` +
                `            clientId: ${clientId}\n` +
                `            clientSecret: ${clientSecret}\n`;
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-add-social-configuration',
                splicable: [
                    config
                ]
            }, this);
        } catch (e) {
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ')}social configuration ${name}${chalk.yellow(' not added.\n')}`);
        }
    }

    /**
     * Add a new dependency in the "bower.json".
     *
     * @param {string} name - dependency name
     * @param {string} version - dependency version
     */
    addBowerDependency(name, version) {
        const fullPath = 'bower.json';
        try {
            jhipsterUtils.rewriteJSONFile(fullPath, (jsonObj) => {
                if (jsonObj.dependencies === undefined) {
                    jsonObj.dependencies = {};
                }
                jsonObj.dependencies[name] = version;
            }, this);
        } catch (e) {
            this.log(e);
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ')}bower dependency (name: ${name}, version:${version})${chalk.yellow(' not added.\n')}`);
        }
    }

    /**
     * Add a new override configuration in the "bower.json".
     *
     * @param {string} bowerPackageName - Bower package name use in dependencies
     * @param {array} main - You can specify which files should be selected
     * @param {boolean} isIgnored - Default: false, Set to true if you want to ignore this package.
     * @param {object} dependencies - You can override the dependencies of a package. Set to null to ignore the dependencies.
     *
     */
    addBowerOverride(bowerPackageName, main, isIgnored, dependencies) {
        const fullPath = 'bower.json';
        try {
            jhipsterUtils.rewriteJSONFile(fullPath, (jsonObj) => {
                const override = {};
                if (main !== undefined && main.length > 0) {
                    override.main = main;
                }
                if (isIgnored) {
                    override.ignore = true;
                }
                if (dependencies) {
                    override.dependencies = dependencies;
                }
                if (jsonObj.overrides === undefined) {
                    jsonObj.overrides = {};
                }
                jsonObj.overrides[bowerPackageName] = override;
            }, this);
        } catch (e) {
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ')}bower override configuration (bowerPackageName: ${bowerPackageName}, main:${JSON.stringify(main)}, ignore:${isIgnored})${chalk.yellow(' not added.\n')}`);
        }
    }

    /**
     * Add a new parameter in the ".bowerrc".
     *
     * @param {string} key - name of the parameter
     * @param {string, obj, bool, etc.} value - value of the parameter
     */
    addBowerrcParameter(key, value) {
        const fullPath = '.bowerrc';
        try {
            this.log(chalk.yellow('   update ') + fullPath);
            jhipsterUtils.rewriteJSONFile(fullPath, (jsonObj) => {
                jsonObj[key] = value;
            }, this);
        } catch (e) {
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ')}bowerrc parameter (key: ${key}, value:${value})${chalk.yellow(' not added.\n')}`);
        }
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
            jhipsterUtils.rewriteJSONFile(fullPath, (jsonObj) => {
                if (jsonObj.dependencies === undefined) {
                    jsonObj.dependencies = {};
                }
                jsonObj.dependencies[name] = version;
            }, this);
        } catch (e) {
            this.log(e);
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ')}npm dependency (name: ${name}, version:${version})${chalk.yellow(' not added.\n')}`);
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
            jhipsterUtils.rewriteJSONFile(fullPath, (jsonObj) => {
                if (jsonObj.devDependencies === undefined) {
                    jsonObj.devDependencies = {};
                }
                jsonObj.devDependencies[name] = version;
            }, this);
        } catch (e) {
            this.log(e);
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ')}npm devDependency (name: ${name}, version:${version})${chalk.yellow(' not added.\n')}`);
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
            jhipsterUtils.rewriteJSONFile(fullPath, (jsonObj) => {
                if (jsonObj.scripts === undefined) {
                    jsonObj.scripts = {};
                }
                jsonObj.scripts[name] = data;
            }, this);
        } catch (e) {
            this.log(e);
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow('. Reference to ')}npm script (name: ${name}, data:${data})${chalk.yellow(' not added.\n')}`);
        }
    }

    /**
     * Add a new module to the AngularJS application in "app.module.js".
     *
     * @param {string} moduleName - module name
     *
     */
    addAngularJsModule(moduleName) {
        const fullPath = `${CLIENT_MAIN_SRC_DIR}app/app.module.js`;
        try {
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-angularjs-add-module',
                splicable: [
                    `'${moduleName}',`
                ]
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + moduleName + chalk.yellow(' not added to JHipster app.\n'));
        }
    }

    /**
     * Add a new module in the TS modules file.
     *
     * @param {string} appName - Angular2 application name.
     * @param {string} adminAngularName - The name of the new admin item.
     * @param {string} adminFolderName - The name of the folder.
     * @param {string} adminFileName - The name of the file.
     * @param {boolean} enableTranslation - If translations are enabled or not.
     * @param {string} clientFramework - The name of the client framework.
     */
    addAngularModule(appName, angularName, folderName, fileName, enableTranslation, clientFramework) {
        const modulePath = `${CLIENT_MAIN_SRC_DIR}app/app.module.ts`;
        try {
            if (clientFramework === 'angular1') {
                return;
            }
            let importStatement = `|import { ${appName}${angularName}Module } from './${folderName}/${fileName}.module';`;
            if (importStatement.length > constants.LINE_LENGTH) {
                importStatement =
                    `|import {
                     |    ${appName}${angularName}Module
                     |} from './${folderName}/${fileName}.module';`;
            }
            jhipsterUtils.rewriteFile({
                file: modulePath,
                needle: 'jhipster-needle-angular-add-module-import',
                splicable: [
                    this.stripMargin(importStatement)
                ]
            }, this);

            jhipsterUtils.rewriteFile({
                file: modulePath,
                needle: 'jhipster-needle-angular-add-module',
                splicable: [
                    this.stripMargin(
                        `|${appName}${angularName}Module,`
                    )
                ]
            }, this);
        } catch (e) {
            this.log(e);
            this.log(`${chalk.yellow('\nUnable to find ') + appName + chalk.yellow(' or missing required jhipster-needle. Reference to ') + angularName + folderName + fileName + enableTranslation + clientFramework} ${chalk.yellow(`not added to ${modulePath}.\n`)}`);
        }
    }

    /**
     * Add a new http interceptor to the angular application in "blocks/config/http.config.js".
     * The interceptor should be in its own .js file inside app/blocks/interceptor folder
     * @param {string} interceptorName - angular name of the interceptor
     *
     */
    addAngularJsInterceptor(interceptorName) {
        const fullPath = `${CLIENT_MAIN_SRC_DIR}app/blocks/config/http.config.js`;
        try {
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-angularjs-add-interceptor',
                splicable: [
                    `$httpProvider.interceptors.push('${interceptorName}');`
                ]
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Interceptor not added to JHipster app.\n'));
        }
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
        // Add the entity to ehcache
        this.addEntryToCache(`${packageName}.domain.${entityClass}.class.getName()`, packageFolder, cacheProvider);
        // Add the collections linked to that entity to ehcache
        relationships.forEach((relationship) => {
            const relationshipType = relationship.relationshipType;
            if (relationshipType === 'one-to-many' || relationshipType === 'many-to-many') {
                this.addEntryToCache(`${packageName}.domain.${entityClass}.class.getName() + ".${relationship.relationshipFieldNamePlural}"`, packageFolder, cacheProvider);
            }
        });
    }

    /**
     * Add a new entry to the chosen cache provider in CacheConfiguration.java
     *
     * @param {string} entry - the entry (including package name) to cache
     * @param {string} packageFolder - the Java package folder
     * @param {string} cacheProvider - the cache provider
     */
    addEntryToCache(entry, packageFolder, cacheProvider) {
        try {
            const cachePath = `${SERVER_MAIN_SRC_DIR}${packageFolder}/config/CacheConfiguration.java`;
            if (cacheProvider === 'ehcache') {
                jhipsterUtils.rewriteFile({
                    file: cachePath,
                    needle: 'jhipster-needle-ehcache-add-entry',
                    splicable: [`cm.createCache(${entry}, jcacheConfiguration);`
                    ]
                }, this);
            } else if (cacheProvider === 'infinispan') {
                jhipsterUtils.rewriteFile({
                    file: cachePath,
                    needle: 'jhipster-needle-infinispan-add-entry',
                    splicable: [`registerPredefinedCache(${entry}, new JCache<Object, Object>(
                cacheManager.getCache(${entry}).getAdvancedCache(), this,
                ConfigurationAdapter.create()));`
                    ]
                }, this);
            }
        } catch (e) {
            this.log(chalk.yellow(`\nUnable to add ${entry} to CacheConfiguration.java file.\n\t${e.message}`));
        }
    }

    /**
     * Add a new changelog to the Liquibase master.xml file.
     *
     * @param {string} changelogName - The name of the changelog (name of the file without .xml at the end).
     */
    addChangelogToLiquibase(changelogName) {
        this.addLiquibaseChangelogToMaster(changelogName, 'jhipster-needle-liquibase-add-changelog');
    }

    /**
     * Add a new constraints changelog to the Liquibase master.xml file.
     *
     * @param {string} changelogName - The name of the changelog (name of the file without .xml at the end).
     */
    addConstraintsChangelogToLiquibase(changelogName) {
        this.addLiquibaseChangelogToMaster(changelogName, 'jhipster-needle-liquibase-add-constraints-changelog');
    }

    /**
     * Add a new changelog to the Liquibase master.xml file.
     *
     * @param {string} changelogName - The name of the changelog (name of the file without .xml at the end).
     * @param {string} needle - The needle at where it has to be added.
     */
    addLiquibaseChangelogToMaster(changelogName, needle) {
        const fullPath = `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`;
        try {
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle,
                splicable: [
                    `<include file="classpath:config/liquibase/changelog/${changelogName}.xml" relativeToChangelogFile="false"/>`
                ]
            }, this);
        } catch (e) {
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + changelogName}.xml ${chalk.yellow('not added.\n')}`);
        }
    }

    /**
     * A a new column to a Liquibase changelog file for entity.
     *
     * @param {string} filePath - The full path of the changelog file.
     * @param {string} content - The content to be added as column, can have multiple columns as well
     */
    addColumnToLiquibaseEntityChangeset(filePath, content) {
        try {
            jhipsterUtils.rewriteFile({
                file: filePath,
                needle: 'jhipster-needle-liquibase-add-column',
                splicable: [
                    content
                ]
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + filePath + chalk.yellow(' or missing required jhipster-needle. Column not added.\n') + e);
        }
    }

    /**
     * Add a new social button in the login and register modules
     *
     * @param {string} socialName - name of the social module. ex: 'facebook'
     * @param {string} socialParameter - parameter to send to social connection ex: 'public_profile,email'
     * @param {string} buttonColor - color of the social button. ex: '#3b5998'
     * @param {string} buttonHoverColor - color of the social button when is hover. ex: '#2d4373'
     * @param {string} clientFramework - The name of the client framework
     */
    addSocialButton(isUseSass, socialName, socialParameter, buttonColor, buttonHoverColor, clientFramework) {
        const socialServicefullPath = `${CLIENT_MAIN_SRC_DIR}app/account/social/social.service.js`;
        let loginfullPath;
        let registerfullPath;
        if (clientFramework === 'angular1') {
            loginfullPath = `${CLIENT_MAIN_SRC_DIR}app/account/login/login.html`;
            registerfullPath = `${CLIENT_MAIN_SRC_DIR}app/account/register/register.html`;
        } else {
            loginfullPath = `${CLIENT_MAIN_SRC_DIR}app/account/login/login.component.html`;
            registerfullPath = `${CLIENT_MAIN_SRC_DIR}app/account/register/register.component.html`;
        }
        try {
            this.log(chalk.yellow('\nupdate ') + socialServicefullPath);
            const serviceCode = `case '${socialName}': return '${socialParameter}';`;
            jhipsterUtils.rewriteFile({
                file: socialServicefullPath,
                needle: 'jhipster-needle-add-social-button',
                splicable: [
                    serviceCode
                ]
            }, this);

            const buttonCode = `<jh-social ng-provider="${socialName}"></jh-social>`;
            this.log(chalk.yellow('update ') + loginfullPath);
            jhipsterUtils.rewriteFile({
                file: loginfullPath,
                needle: 'jhipster-needle-add-social-button',
                splicable: [
                    buttonCode
                ]
            }, this);
            this.log(chalk.yellow('update ') + registerfullPath);
            jhipsterUtils.rewriteFile({
                file: registerfullPath,
                needle: 'jhipster-needle-add-social-button',
                splicable: [
                    buttonCode
                ]
            }, this);

            const buttonStyle = `.jh-btn-${socialName} {
                    background-color: ${buttonColor};
                    border-color: rgba(0, 0, 0, 0.2);
                    color: #fff;
                }\n
                .jh-btn-${socialName}:hover, .jh-btn-${socialName}:focus, .jh-btn-${socialName}:active, .jh-btn-${socialName}.active, .open > .dropdown-toggle.jh-btn-${socialName} {
                    background-color: ${buttonHoverColor};
                    border-color: rgba(0, 0, 0, 0.2);
                    color: #fff;
                }`;
            this.addMainCSSStyle(isUseSass, buttonStyle, `Add sign in style for ${socialName}`);
        } catch (e) {
            this.log(chalk.yellow(`\nUnable to add social button modification.\n${e}`));
        }
    }

    /**
     * Add a new social connection factory in the SocialConfiguration.java file.
     *
     * @param {string} javaDir - default java directory of the project (JHipster const)
     * @param {string} importPackagePath - package path of the ConnectionFactory class
     * @param {string} socialName - name of the social module
     * @param {string} connectionFactoryClassName - name of the ConnectionFactory class
     * @param {string} configurationName - name of the section in the config yaml file
     */
    addSocialConnectionFactory(javaDir, importPackagePath, socialName, connectionFactoryClassName, configurationName) {
        const fullPath = `${javaDir}config/social/SocialConfiguration.java`;
        try {
            this.log(chalk.yellow('\nupdate ') + fullPath);
            const javaImport = `import ${importPackagePath};\n`;
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-add-social-connection-factory-import-package',
                splicable: [
                    javaImport
                ]
            }, this);

            const clientId = `${socialName}ClientId`;
            const clientSecret = `${socialName}ClientSecret`;
            const javaCode = `// ${socialName} configuration\n` +
                `        String ${clientId} = environment.getProperty("spring.social.${configurationName}.clientId");\n` +
                `        String ${clientSecret} = environment.getProperty("spring.social.${configurationName}.clientSecret");\n` +
                `        if (${clientId} != null && ${clientSecret} != null) {\n` +
                `            log.debug("Configuring ${connectionFactoryClassName}");\n` +
                '            connectionFactoryConfigurer.addConnectionFactory(\n' +
                `                new ${connectionFactoryClassName}(\n` +
                `                    ${clientId},\n` +
                `                    ${clientSecret}\n` +
                '                )\n' +
                '            );\n' +
                '        } else {\n' +
                `            log.error("Cannot configure ${connectionFactoryClassName} id or secret null");\n` +
                '        }\n';

            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-add-social-connection-factory',
                splicable: [
                    javaCode
                ]
            }, this);
        } catch (e) {
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Social connection ') + e} ${chalk.yellow('not added.\n')}`);
        }
    }

    /**
     * Add new css style to the angular application in "main.css".
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
    addMainCSSStyle(isUseSass, style, comment) {
        if (isUseSass) {
            this.addMainSCSSStyle(style, comment);
        }

        const fullPath = `${CLIENT_MAIN_SRC_DIR}content/css/main.css`;
        let styleBlock = '';
        if (comment) {
            styleBlock += '/* ==========================================================================\n';
            styleBlock += `${comment}\n`;
            styleBlock += '========================================================================== */\n';
        }
        styleBlock += `${style}\n`;
        try {
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-css-add-main',
                splicable: [
                    styleBlock
                ]
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Style not added to JHipster app.\n'));
        }
    }

    /**
     * Add new scss style to the angular application in "main.scss".
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
    addMainSCSSStyle(style, comment) {
        const fullPath = `${CLIENT_MAIN_SRC_DIR}scss/main.scss`;
        let styleBlock = '';
        if (comment) {
            styleBlock += '/* ==========================================================================\n';
            styleBlock += `${comment}\n`;
            styleBlock += '========================================================================== */\n';
        }
        styleBlock += `${style}\n`;
        try {
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-scss-add-main',
                splicable: [
                    styleBlock
                ]
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Style not added to JHipster app.\n'));
        }
    }

    /**
     * Add a new Maven dependency.
     *
     * @param {string} groupId - dependency groupId
     * @param {string} artifactId - dependency artifactId
     * @param {string} version - explicit dependency version number
     * @param {string} other - explicit other thing: scope, exclusions...
     */
    addMavenDependency(groupId, artifactId, version, other) {
        const fullPath = 'pom.xml';
        try {
            let dependency = `${'<dependency>\n' +
                '            <groupId>'}${groupId}</groupId>\n` +
                `            <artifactId>${artifactId}</artifactId>\n`;
            if (version) {
                dependency += `            <version>${version}</version>\n`;
            }
            if (other) {
                dependency += `${other}\n`;
            }
            dependency += '        </dependency>';
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-maven-add-dependency',
                splicable: [
                    dependency
                ]
            }, this);
        } catch (e) {
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ')}maven dependency (groupId: ${groupId}, artifactId:${artifactId}, version:${version})${chalk.yellow(' not added.\n')}`);
        }
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
        const fullPath = 'pom.xml';
        try {
            let plugin = `${'<plugin>\n' +
                '                <groupId>'}${groupId}</groupId>\n` +
                `                <artifactId>${artifactId}</artifactId>\n`;
            if (version) {
                plugin += `                <version>${version}</version>\n`;
            }
            if (other) {
                plugin += `${other}\n`;
            }
            plugin += '            </plugin>';
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-maven-add-plugin',
                splicable: [
                    plugin
                ]
            }, this);
        } catch (e) {
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ')}maven plugin (groupId: ${groupId}, artifactId:${artifactId}, version:${version})${chalk.yellow(' not added.\n')}`);
        }
    }

    /**
     * A new Gradle plugin.
     *
     * @param {string} group - plugin GroupId
     * @param {string} name - plugin name
     * @param {string} version - explicit plugin version number
     */
    addGradlePlugin(group, name, version) {
        const fullPath = 'build.gradle';
        try {
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-gradle-buildscript-dependency',
                splicable: [
                    `classpath '${group}:${name}:${version}'`
                ]
            }, this);
        } catch (e) {
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ')}classpath: ${group}:${name}:${version}${chalk.yellow(' not added.\n')}`);
        }
    }

    /**
     * A new dependency to build.gradle file.
     *
     * @param {string} scope - scope of the new dependency, e.g. compile
     * @param {string} group - maven GroupId
     * @param {string} name - maven ArtifactId
     * @param {string} version - explicit version number
     */
    addGradleDependency(scope, group, name, version) {
        const fullPath = 'build.gradle';
        try {
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-gradle-dependency',
                splicable: [
                    `${scope} '${group}:${name}:${version}'`
                ]
            }, this);
        } catch (e) {
            this.log(`${chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + group}:${name}:${version}${chalk.yellow(' not added.\n')}`);
        }
    }

    /**
     * Apply from an external Gradle build script.
     *
     * @param {string} name - name of the file to apply from, must be 'fileName.gradle'
     */
    applyFromGradleScript(name) {
        const fullPath = 'build.gradle';
        try {
            jhipsterUtils.rewriteFile({
                file: fullPath,
                needle: 'jhipster-needle-gradle-apply-from',
                splicable: [
                    `apply from: '${name}.gradle'`
                ]
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + fullPath + chalk.yellow(' or missing required jhipster-needle. Reference to ') + name + chalk.yellow(' not added.\n'));
        }
    }

    /**
     * Generate a date to be used by Liquibase changelogs.
     */
    dateFormatForLiquibase() {
        const now = new Date();
        const nowUTC = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
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
        case 'stripHtml' :
            regex = new RegExp([
                /( (data-t|jhiT)ranslate="([a-zA-Z0-9 +{}'_](\.)?)+")/, // data-translate or jhiTranslate
                /( translate(-v|V)alues="\{([a-zA-Z]|\d|:|\{|\}|\[|\]|-|'|\s|\.|_)*?\}")/, // translate-values or translateValues
                /( translate-compile)/, // translate-compile
                /( translate-value-max="[0-9{}()|]*")/, // translate-value-max
            ].map(r => r.source).join('|'), 'g');

            jhipsterUtils.copyWebResource(source, dest, regex, 'html', _this, opt, template);
            break;
        case 'stripJs' :
            regex = new RegExp([
                /(,[\s]*(resolve):[\s]*[{][\s]*(translatePartialLoader)['a-zA-Z0-9$,(){.<%=\->;\s:[\]]*(;[\s]*\}\][\s]*\}))/, // ng1 resolve block
                /([\s]import\s\{\s?JhiLanguageService\s?\}\sfrom\s["|']ng-jhipster["|'];)/, // ng2 import jhiLanguageService
                /(,?\s?JhiLanguageService,?\s?)/, // ng2 import jhiLanguageService
                /(private\s[a-zA-Z0-9]*(L|l)anguageService\s?:\s?JhiLanguageService\s?,*[\s]*)/, // ng2 jhiLanguageService constructor argument
                /(this\.[a-zA-Z0-9]*(L|l)anguageService\.setLocations\(\[['"a-zA-Z0-9\-_,\s]+\]\);[\s]*)/, // jhiLanguageService invocations
            ].map(r => r.source).join('|'), 'g');

            jhipsterUtils.copyWebResource(source, dest, regex, 'js', _this, opt, template);
            break;
        case 'copy' :
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
     * Rewrite the specified file with provided content at the needle location
     *
     * @param {string} fullPath - path of the source file to rewrite
     * @param {string} needle - needle to look for where content will be inserted
     * @param {string} content - content to be written
     */
    rewriteFile(filePath, needle, content) {
        try {
            jhipsterUtils.rewriteFile({
                file: filePath,
                needle,
                splicable: [
                    content
                ]
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + filePath + chalk.yellow(' or missing required needle. File rewrite failed.\n'));
        }
    }

    /**
     * Replace the pattern/regex with provided content
     *
     * @param {string} fullPath - path of the source file to rewrite
     * @param {string} pattern - pattern to look for where content will be replaced
     * @param {string} content - content to be written
     * @param {string} regex - true if pattern is regex
     */
    replaceContent(filePath, pattern, content, regex) {
        try {
            jhipsterUtils.replaceContent({
                file: filePath,
                pattern,
                content,
                regex
            }, this);
        } catch (e) {
            this.log(chalk.yellow('\nUnable to find ') + filePath + chalk.yellow(' or missing required pattern. File rewrite failed.\n') + e);
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
            }
            if (!error && !duplicate) {
                modules.push(moduleConfig);
                this.fs.writeJSON(MODULES_HOOK_FILE, modules, null, 4);
            }
        } catch (err) {
            this.log(`\n${chalk.bold.red('Could not add jhipster module configuration')}`);
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
     * @param {string} hookFor : "app" or "entity"
     * @param {string} hookType : "pre" or "post"
     * @param options : the options to pass to the hooks
     */
    callHooks(hookFor, hookType, options) {
        const modules = this.getModuleHooks();
        // run through all module hooks, which matches the hookFor and hookType
        modules.forEach((module) => {
            if (module.hookFor === hookFor && module.hookType === hookType) {
                // compose with the modules callback generator
                try {
                    this.composeWith(module.generatorCallback, options);
                } catch (err) {
                    this.log(chalk.red('Could not compose module ') + chalk.bold.yellow(module.npmPackageName) +
                        chalk.red('. \nMake sure you have installed the module with ') + chalk.bold.yellow(`'npm install -g ${module.npmPackageName}'`));
                }
            }
        });
    }

    /**
     * get an entity from the configuration file
     * @param {string} file - configuration file name for the entity
     */
    getEntityJson(file) {
        let entityJson = null;

        try {
            entityJson = this.fs.readJSON(path.join(JHIPSTER_CONFIG_DIR, `${_.upperFirst(file)}.json`));
        } catch (err) {
            this.log(chalk.red(`The JHipster entity configuration file could not be read for file ${file}!`) + err);
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

        return shelljs.ls(
            path.join(JHIPSTER_CONFIG_DIR, '*.json')
        ).reduce((acc, file) => {
            try {
                const definition = jhiCore.readEntityJSON(file);
                acc.push({ name: path.basename(file, '.json'), definition });
            } catch (error) {
                // not an entity file / malformed?
                this.warning(`Unable to parse entity file ${file}`);
            }
            return acc;
        }, entities).sort(isBefore);
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
        _this.copy(`${webappDir}i18n/${lang}/${fileToCopy}`, `${webappDir}i18n/${lang}/${fileToCopy}`);
    }

    /**
     * Check if the JHipster version used to generate an existing project is less than the passed version argument
     *
     * @param {string} version - A valid semver version string
     */
    isJhipsterVersionLessThan(version) {
        const jhipsterVersion = this.config.get('jhipsterVersion');
        if (!jhipsterVersion) {
            return true;
        }
        return semver.lt(jhipsterVersion, version);
    }

    /**
     * executes a git command using shellJS
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
        options.async = true;
        options.silent = true;

        if (!Array.isArray(args)) {
            args = [args];
        }
        const command = `git ${args.join(' ')}`;
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
        if (prodDatabaseType === 'oracle' && joinTableName.length > 30) {
            this.warning(`The generated join table "${joinTableName}" is too long for Oracle (which has a 30 characters limit). It will be truncated!`);

            limit = 30;
        } else if (prodDatabaseType === 'mysql' && joinTableName.length > 64) {
            this.warning(`The generated join table "${joinTableName}" is too long for MySQL (which has a 64 characters limit). It will be truncated!`);

            limit = 64;
        }
        if (limit > 0) {
            const halfLimit = Math.floor(limit / 2);
            const entityTable = _.snakeCase(this.getTableName(entityName).substring(0, halfLimit));
            const relationTable = _.snakeCase(this.getTableName(relationshipName).substring(0, halfLimit - 1));
            return `${entityTable}_${relationTable}`;
        }
        return joinTableName;
    }

    /**
     * get a constraint name for tables in JHipster preferred style.
     *
     * @param {string} entityName - name of the entity
     * @param {string} relationshipName - name of the related entity
     * @param {string} prodDatabaseType - database type
     * @param {boolean} noSnakeCase - do not convert names to snakecase
     */
    getConstraintName(entityName, relationshipName, prodDatabaseType, noSnakeCase) {
        let constraintName;
        if (noSnakeCase) {
            constraintName = `fk_${entityName}_${relationshipName}_id`;
        } else {
            constraintName = `fk_${this.getTableName(entityName)}_${this.getTableName(relationshipName)}_id`;
        }
        let limit = 0;

        if (prodDatabaseType === 'oracle' && constraintName.length > 30) {
            this.warning(`The generated constraint name "${constraintName}" is too long for Oracle (which has a 30 characters limit). It will be truncated!`);

            limit = 28;
        } else if (prodDatabaseType === 'mysql' && constraintName.length > 64) {
            this.warning(`The generated constraint name "${constraintName}" is too long for MySQL (which has a 64 characters limit). It will be truncated!`);

            limit = 62;
        }
        if (limit > 0) {
            const halfLimit = Math.floor(limit / 2);
            const entityTable = noSnakeCase ? entityName.substring(0, halfLimit) : _.snakeCase(this.getTableName(entityName).substring(0, halfLimit));
            const relationTable = noSnakeCase ? relationshipName.substring(0, halfLimit - 1) : _.snakeCase(this.getTableName(relationshipName).substring(0, halfLimit - 1));
            return `${entityTable}_${relationTable}_id`;
        }
        return constraintName;
    }

    /**
     * Print an error message.
     *
     * @param {string} msg - message to print
     */
    error(msg) {
        this.env.error(`${chalk.red.bold('ERROR!')} ${msg}`);
    }

    /**
     * Print a warning message.
     *
     * @param {string} value - message to print
     */
    warning(msg) {
        this.log(`${chalk.yellow.bold('WARNING!')} ${msg}`);
    }

    /**
     * Generate a KeyStore for uaa authorization server.
     */
    generateKeyStore() {
        const keyStoreFile = `${SERVER_MAIN_RES_DIR}keystore.jks`;
        if (this.fs.exists(keyStoreFile)) {
            this.log(chalk.cyan(`\nKeyStore '${keyStoreFile}' already exists. Leaving unchanged.\n`));
        } else {
            shelljs.mkdir('-p', SERVER_MAIN_RES_DIR);
            const javaHome = shelljs.env.JAVA_HOME;
            let keytoolPath = '';
            if (javaHome) {
                keytoolPath = `${javaHome}/bin/`;
            }
            shelljs.exec(`"${keytoolPath}keytool" -genkey -noprompt ` +
                '-keyalg RSA ' +
                '-alias selfsigned ' +
                `-keystore ${keyStoreFile} ` +
                '-storepass password ' +
                '-keypass password ' +
                '-keysize 2048 ' +
                `-dname "CN=Java Hipster, OU=Development, O=${this.packageName}, L=, ST=, C="`
                , (code) => {
                if (code !== 0) {
                    this.error('\nFailed to create a KeyStore with \'keytool\'', code);
                } else {
                    this.log(chalk.green(`\nKeyStore '${keyStoreFile}' generated successfully.\n`));
                }
            });
        }
    }

    /**
     * Prints a JHipster logo.
     */
    printJHipsterLogo() {
        this.log(`${chalk.green('\n        ██╗')}${chalk.red(' ██╗   ██╗ ████████╗ ███████╗   ██████╗ ████████╗ ████████╗ ███████╗')}`);
        this.log(`${chalk.green('        ██║')}${chalk.red(' ██║   ██║ ╚══██╔══╝ ██╔═══██╗ ██╔════╝ ╚══██╔══╝ ██╔═════╝ ██╔═══██╗')}`);
        this.log(`${chalk.green('        ██║')}${chalk.red(' ████████║    ██║    ███████╔╝ ╚█████╗     ██║    ██████╗   ███████╔╝')}`);
        this.log(`${chalk.green('  ██╗   ██║')}${chalk.red(' ██╔═══██║    ██║    ██╔════╝   ╚═══██╗    ██║    ██╔═══╝   ██╔══██║')}`);
        this.log(`${chalk.green('  ╚██████╔╝')}${chalk.red(' ██║   ██║ ████████╗ ██║       ██████╔╝    ██║    ████████╗ ██║  ╚██╗')}`);
        this.log(`${chalk.green('   ╚═════╝ ')}${chalk.red(' ╚═╝   ╚═╝ ╚═══════╝ ╚═╝       ╚═════╝     ╚═╝    ╚═══════╝ ╚═╝   ╚═╝')}\n`);
        this.log(chalk.white.bold('                            https://jhipster.github.io\n'));
        this.log(chalk.white('Welcome to the JHipster Generator ') + chalk.yellow(`v${packagejs.version}`));
        this.log(chalk.white(`Documentation for creating an application: ${chalk.yellow('https://jhipster.github.io/creating-an-app/')}`));
        this.log(chalk.white(`Application files will be generated in folder: ${chalk.yellow(process.cwd())}`));
    }

    /**
     * Checks if there is a newer JHipster version available.
     */
    checkForNewVersion() {
        try {
            const done = this.async();
            shelljs.exec(`npm show ${GENERATOR_JHIPSTER} version`, { silent: true }, (code, stdout, stderr) => {
                if (!stderr && semver.lt(packagejs.version, stdout)) {
                    this.log(
                        `${chalk.yellow(' ______________________________________________________________________________\n\n') +
                        chalk.yellow('  JHipster update available: ') + chalk.green.bold(stdout.replace('\n', '')) + chalk.gray(` (current: ${packagejs.version})`)}\n`
                    );
                    if (this.useYarn) {
                        this.log(chalk.yellow(`  Run ${chalk.magenta(`yarn global upgrade ${GENERATOR_JHIPSTER}`)} to update.\n`));
                    } else {
                        this.log(chalk.yellow(`  Run ${chalk.magenta(`npm install -g ${GENERATOR_JHIPSTER}`)} to update.\n`));
                    }
                    this.log(chalk.yellow(' ______________________________________________________________________________\n'));
                }
                done();
            });
        } catch (err) {
            // fail silently as this function doesn't affect normal generator flow
        }
    }

    /**
     * get the Angular application name.
     */
    getAngularAppName() {
        return _.camelCase(this.baseName, true) + (this.baseName.endsWith('App') ? '' : 'App');
    }

    /**
     * get the Angular 2+ application name.
     */
    getAngular2AppName() {
        return this.getAngularXAppName();
    }

    getAngularXAppName() {
        return _.upperFirst(_.camelCase(this.baseName, true));
    }

    /**
     * get the java main class name.
     */
    getMainClassName() {
        const main = _.upperFirst(this.getAngularAppName());
        const acceptableForJava = new RegExp('^[A-Z][a-zA-Z0-9_]*$');

        return acceptableForJava.test(main) ? main : 'Application';
    }

    /**
     * ask a prompt for apps name.
     *
     * @param {object} generator - generator instance to use
     */
    askModuleName(generator) {
        const done = generator.async();
        const defaultAppBaseName = this.getDefaultAppName();
        generator.prompt({
            type: 'input',
            name: 'baseName',
            validate: (input) => {
                if (!(/^([a-zA-Z0-9_]*)$/.test(input))) {
                    return 'Your application name cannot contain special characters or a blank space';
                } else if (generator.applicationType === 'microservice' && /_/.test(input)) {
                    return 'Your microservice name cannot contain underscores as this does not meet the URI spec';
                } else if (input === 'application') {
                    return 'Your application name cannot be named \'application\' as this is a reserved name for Spring Boot';
                }
                return true;
            },
            message: response => this.getNumberedQuestion('What is the base name of your application?', true),
            default: defaultAppBaseName
        }).then((prompt) => {
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
                message: response => this.getNumberedQuestion('Would you like to enable internationalization support?', true),
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

        generator.prompt(prompts).then((prompt) => {
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
                'skip-install': true,
                'skip-server': skipServer,
                'skip-client': skipClient,
                configOptions,
                force: generator.options.force,
                languages: generator.languages
            });
        }
    }

    /**
     * Add numbering to a question
     *
     * @param {String} msg - question text
     * @param {boolean} cond - increment question
     */
    getNumberedQuestion(msg, cond) {
        if (cond) {
            ++this.currentQuestion;
        }
        return `(${this.currentQuestion}/${this.totalQuestions}) ${msg}`;
    }

    /**
     * build a generated application.
     *
     * @param {String} buildTool - maven | gradle
     * @param {String} profile - dev | prod
     * @param {Function} cb - callback when build is complete
     */
    buildApplication(buildTool, profile, cb) {
        let buildCmd = 'mvnw package -DskipTests=true -B';

        if (buildTool === 'gradle') {
            buildCmd = 'gradlew bootRepackage -x test';
        }

        if (os.platform() !== 'win32') {
            buildCmd = `./${buildCmd}`;
        }
        buildCmd += ` -P${profile}`;
        const child = {};
        child.stdout = exec(buildCmd, { maxBuffer: 1024 * 500 }, cb).stdout;
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
                    const path = blockTemplate.path ? blockTemplate.path : '';
                    blockTemplate.templates.forEach((templateObj) => {
                        let templatePath = path;
                        let method = 'template';
                        let useTemplate = false;
                        let options = {};
                        let templatePathTo;
                        if (typeof templateObj === 'string') {
                            templatePath += templateObj;
                        } else {
                            templatePath += templateObj.file;
                            method = templateObj.method ? templateObj.method : method;
                            useTemplate = templateObj.template ? templateObj.template : useTemplate;
                            options = templateObj.options ? templateObj.options : options;
                        }
                        if (templateObj && templateObj.renameTo) {
                            templatePathTo = path + templateObj.renameTo(_this);
                        } else {
                            templatePathTo = templatePath.replace(/([/])_|^_/, '$1');
                        }
                        filesOut.push(templatePathTo);
                        if (!returnFiles) {
                            const templatePathFrom = prefix ? `${prefix}/${templatePath}` : templatePath;
                            // if (method === 'template')
                            _this[method](templatePathFrom, templatePathTo, _this, options, useTemplate);
                        }
                    });
                }
            }
        }
        if (this.isDebugEnabled) {
            this.debug(`Time taken to write files: ${new Date() - startTime}ms`);
        }
        return filesOut;
    }
};
