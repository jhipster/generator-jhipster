/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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
const _ = require('lodash');
const chalk = require('chalk');
const BaseGenerator = require('../generator-base');

const constants = require('../generator-constants');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

        const jhipsterVar = this.options.jhipsterVar;
        const jhipsterFunc = this.options.jhipsterFunc;
        if (jhipsterVar === undefined || jhipsterVar.moduleName === undefined) {
            this.error(chalk.red('This sub-generator must be used by JHipster modules, and the module name is not defined.'));
        }

        this.log(`Composing JHipster configuration with module ${chalk.red(jhipsterVar.moduleName)}`);

        this.warning(`${chalk.red('DEPRECATED!')} The JHipster module sub-generator is deprecated.`);
        this.warning(`Please import the ${chalk.yellow('generator-base.js')} using commonJS require or ES2015 import.`);
        this.warning(`See ${chalk.yellow('http://www.jhipster.tech/modules/creating-a-module')} for more details.\n`);

        const baseName = this.config.get('baseName');
        const packageName = this.config.get('packageName');
        const packageFolder = this.config.get('packageFolder');

        if (!this.options.skipValidation && (baseName === undefined || packageName === undefined)) {
            this.log(chalk.red('ERROR! There is no existing JHipster configuration file in this directory.'));
            this.error(`JHipster ${jhipsterVar.moduleName} is a JHipster module, and needs a .yo-rc.json configuration file made by JHipster.`);
        }
        // add required JHipster variables
        jhipsterVar.baseName = this.baseName = baseName;
        jhipsterVar.packageName = packageName;
        jhipsterVar.packageFolder = packageFolder;

        jhipsterVar.jhipsterConfig = this.config.getAll();
        jhipsterVar.applicationType = this.config.get('applicationType');
        jhipsterVar.authenticationType = this.config.get('authenticationType');
        jhipsterVar.cacheProvider = this.config.get('cacheProvider') || this.config.get('hibernateCache') || 'no';
        jhipsterVar.enableHibernateCache = this.config.get('enableHibernateCache') || (this.config.get('hibernateCache') !== undefined && this.config.get('hibernateCache') !== 'no');
        jhipsterVar.websocket = this.config.get('websocket');
        jhipsterVar.databaseType = this.config.get('databaseType');
        jhipsterVar.devDatabaseType = this.config.get('devDatabaseType');
        jhipsterVar.prodDatabaseType = this.config.get('prodDatabaseType');
        jhipsterVar.searchEngine = this.config.get('searchEngine');
        jhipsterVar.useSass = this.config.get('useSass');
        jhipsterVar.buildTool = this.config.get('buildTool');
        jhipsterVar.enableTranslation = this.config.get('enableTranslation');
        jhipsterVar.nativeLanguage = this.config.get('nativeLanguage');
        jhipsterVar.languages = this.config.get('languages');
        jhipsterVar.enableSocialSignIn = this.config.get('enableSocialSignIn');
        jhipsterVar.testFrameworks = this.config.get('testFrameworks');
        jhipsterVar.enableSwaggerCodegen = this.config.get('enableSwaggerCodegen');
        jhipsterVar.jhiPrefix = this.config.get('jhiPrefix');
        jhipsterVar.jhiPrefixCapitalized = _.upperFirst(jhipsterVar.jhiPrefix);
        jhipsterVar.jhipsterVersion = this.config.get('jhipsterVersion');
        jhipsterVar.serverPort = this.config.get('serverPort');
        // For backward compatibility
        const clientFramework = this.config.get('clientFramework');
        jhipsterVar.clientFramework = clientFramework === 'angularX' ? 'angular2' : clientFramework;
        jhipsterVar.clientPackageManager = this.config.get('clientPackageManager');

        jhipsterVar.angularAppName = this.getAngularAppName();
        jhipsterVar.angular2AppName = this.getAngularXAppName();
        jhipsterVar.mainClassName = this.getMainClassName();
        jhipsterVar.javaDir = `${constants.SERVER_MAIN_SRC_DIR + packageFolder}/`;
        jhipsterVar.resourceDir = constants.SERVER_MAIN_RES_DIR;
        jhipsterVar.webappDir = constants.CLIENT_MAIN_SRC_DIR;
        jhipsterVar.CONSTANTS = constants;

        // alias fs and log methods so that we can use it in script-base when invoking functions from jhipsterFunc context in modules
        jhipsterFunc.fs = this.fs;
        jhipsterFunc.log = this.log;

        // add common methods from generator-base.js
        jhipsterFunc.addSocialButton = this.addSocialButton;
        jhipsterFunc.addSocialConnectionFactory = this.addSocialConnectionFactory;
        jhipsterFunc.addMavenDependency = this.addMavenDependency;
        jhipsterFunc.addMavenDependencyManagement = this.addMavenDependencyManagement;
        jhipsterFunc.addMavenPlugin = this.addMavenPlugin;
        jhipsterFunc.addGradlePlugin = this.addGradlePlugin;
        jhipsterFunc.addGradleDependency = this.addGradleDependency;
        jhipsterFunc.addGradleDependencyManagement = this.addGradleDependencyManagement;
        jhipsterFunc.addSocialConfiguration = this.addSocialConfiguration;
        jhipsterFunc.applyFromGradleScript = this.applyFromGradleScript;
        jhipsterFunc.addBowerrcParameter = this.addBowerrcParameter;
        jhipsterFunc.addBowerDependency = this.addBowerDependency;
        jhipsterFunc.addBowerOverride = this.addBowerOverride;
        jhipsterFunc.addNpmDependency = this.addNpmDependency;
        jhipsterFunc.addNpmDevDependency = this.addNpmDevDependency;
        jhipsterFunc.addNpmScript = this.addNpmScript;
        jhipsterFunc.addMainCSSStyle = this.addMainCSSStyle;
        jhipsterFunc.addMainSCSSStyle = this.addMainSCSSStyle;
        jhipsterFunc.addVendorSCSSStyle = this.addVendorSCSSStyle;
        jhipsterFunc.copyExternalAssetsInWebpack = this.copyExternalAssetsInWebpack;
        jhipsterFunc.addExternalResourcesToRoot = this.addExternalResourcesToRoot;
        jhipsterFunc.addAngularJsModule = this.addAngularJsModule;
        jhipsterFunc.addAngularJsInterceptor = this.addAngularJsInterceptor;
        jhipsterFunc.addElementToMenu = this.addElementToMenu;
        jhipsterFunc.addElementToAdminMenu = this.addElementToAdminMenu;
        jhipsterFunc.addEntityToMenu = this.addEntityToMenu;
        jhipsterFunc.addEntityToModule = this.addEntityToModule;
        jhipsterFunc.addAdminToModule = this.addAdminToModule;
        jhipsterFunc.addElementTranslationKey = this.addElementTranslationKey;
        jhipsterFunc.addAdminElementTranslationKey = this.addAdminElementTranslationKey;
        jhipsterFunc.addGlobalTranslationKey = this.addGlobalTranslationKey;
        jhipsterFunc.addTranslationKeyToAllLanguages = this.addTranslationKeyToAllLanguages;
        jhipsterFunc.getAllSupportedLanguages = this.getAllSupportedLanguages;
        jhipsterFunc.getAllSupportedLanguageOptions = this.getAllSupportedLanguageOptions;
        jhipsterFunc.isSupportedLanguage = this.isSupportedLanguage;
        jhipsterFunc.getAllInstalledLanguages = this.getAllInstalledLanguages;
        jhipsterFunc.addEntityTranslationKey = this.addEntityTranslationKey;
        jhipsterFunc.addEntityToEhcache = this.addEntityToEhcache;
        jhipsterFunc.addEntryToEhcache = this.addEntryToEhcache;
        jhipsterFunc.addChangelogToLiquibase = this.addChangelogToLiquibase;
        jhipsterFunc.addConstraintsChangelogToLiquibase = this.addConstraintsChangelogToLiquibase;
        jhipsterFunc.addLiquibaseChangelogToMaster = this.addLiquibaseChangelogToMaster;
        jhipsterFunc.addColumnToLiquibaseEntityChangeset = this.addColumnToLiquibaseEntityChangeset;
        jhipsterFunc.dateFormatForLiquibase = this.dateFormatForLiquibase;
        jhipsterFunc.copyI18nFilesByName = this.copyI18nFilesByName;
        jhipsterFunc.copyTemplate = this.copyTemplate;
        jhipsterFunc.copyHtml = this.processHtml;
        jhipsterFunc.processHtml = this.processHtml;
        jhipsterFunc.copyJs = this.processJs;
        jhipsterFunc.processJs = this.processJs;
        jhipsterFunc.rewriteFile = this.rewriteFile;
        jhipsterFunc.replaceContent = this.replaceContent;
        jhipsterFunc.registerModule = this.registerModule;
        jhipsterFunc.stripMargin = this.stripMargin;
        jhipsterFunc.updateEntityConfig = this.updateEntityConfig;
        jhipsterFunc.getModuleHooks = this.getModuleHooks;
        jhipsterFunc.getExistingEntities = this.getExistingEntities;
        jhipsterFunc.isJhipsterVersionLessThan = this.isJhipsterVersionLessThan;
        jhipsterFunc.getTableName = this.getTableName;
        jhipsterFunc.getColumnName = this.getColumnName;
        jhipsterFunc.getPluralColumnName = this.getPluralColumnName;
        jhipsterFunc.getJoinTableName = this.getJoinTableName;
        jhipsterFunc.getConstraintName = this.getConstraintName;
        jhipsterFunc.error = this.error;
        jhipsterFunc.warning = this.warning;
        jhipsterFunc.printJHipsterLogo = this.printJHipsterLogo;
        jhipsterFunc.checkForNewVersion = this.checkForNewVersion;
        jhipsterFunc.getAngularAppName = this.getAngularAppName;
        jhipsterFunc.getAngular2AppName = this.angularXAppName;
        jhipsterFunc.getMainClassName = this.getMainClassName;
        jhipsterFunc.askModuleName = this.askModuleName;
        jhipsterFunc.aski18n = this.aski18n;
        jhipsterFunc.composeLanguagesSub = this.composeLanguagesSub;
        jhipsterFunc.getNumberedQuestion = this.getNumberedQuestion;
        jhipsterFunc.buildApplication = this.buildApplication;
        jhipsterFunc.writeFilesToDisk = this.writeFilesToDisk;
        jhipsterFunc.getEntityJson = this.getEntityJson;
    }

    initializing() {
        const insight = this.insight();
        insight.trackWithEvent('generator', 'modules');

        this.log('Reading the JHipster project configuration for your module');
    }
};
