'use strict';
const util = require('util');
const generator = require('yeoman-generator');
const _ = require('lodash');
const chalk = require('chalk');
const scriptBase = require('../generator-base');

const constants = require('../generator-constants');

const ModulesGenerator = generator.extend({});

util.inherits(ModulesGenerator, scriptBase);

module.exports = ModulesGenerator.extend({
    constructor: function () {
        generator.apply(this, arguments);

        const jhipsterconst = this.options.jhipsterconst;
        const jhipsterFunc = this.options.jhipsterFunc;
        if (jhipsterconst === undefined || jhipsterconst.moduleName === undefined) {
            this.error(chalk.red('This sub-generator must be used by JHipster modules, and the module name is not defined.'));
        }

        this.log('Composing JHipster configuration with module ' + chalk.red(jhipsterconst.moduleName));

        const baseName = this.config.get('baseName');
        const packageName = this.config.get('packageName');
        const packageFolder = this.config.get('packageFolder');

        if (!this.options.skipValidation && (baseName === undefined || packageName === undefined)) {
            this.log(chalk.red('ERROR! There is no existing JHipster configuration file in this directory.'));
            this.error('JHipster ' + jhipsterconst.moduleName + ' is a JHipster module, and needs a .yo-rc.json configuration file made by JHipster.');
        }
        // add required JHipster constiables
        jhipsterconst.baseName = this.baseName = baseName;
        jhipsterconst.packageName = packageName;
        jhipsterconst.packageFolder = packageFolder;

        jhipsterconst.jhipsterConfig = this.config.getAll();
        jhipsterconst.applicationType = this.config.get('applicationType');
        jhipsterconst.authenticationType = this.config.get('authenticationType');
        jhipsterconst.hibernateCache = this.config.get('hibernateCache');
        jhipsterconst.clusteredHttpSession = this.config.get('clusteredHttpSession');
        jhipsterconst.websocket = this.config.get('websocket');
        jhipsterconst.databaseType = this.config.get('databaseType');
        jhipsterconst.devDatabaseType = this.config.get('devDatabaseType');
        jhipsterconst.prodDatabaseType = this.config.get('prodDatabaseType');
        jhipsterconst.searchEngine = this.config.get('searchEngine');
        jhipsterconst.useSass = this.config.get('useSass');
        jhipsterconst.buildTool = this.config.get('buildTool');
        jhipsterconst.enableTranslation = this.config.get('enableTranslation');
        jhipsterconst.nativeLanguage = this.config.get('nativeLanguage');
        jhipsterconst.languages = this.config.get('languages');
        jhipsterconst.enableSocialSignIn = this.config.get('enableSocialSignIn');
        jhipsterconst.testFrameworks = this.config.get('testFrameworks');
        jhipsterconst.jhiPrefix = this.config.get('jhiPrefix');
        jhipsterconst.jhiPrefixCapitalized = _.upperFirst(jhipsterconst.jhiPrefix);
        jhipsterconst.jhipsterVersion = this.config.get('jhipsterVersion');
        jhipsterconst.serverPort = this.config.get('serverPort');
        jhipsterconst.clientFramework = this.config.get('clientFramework');

        jhipsterconst.angularAppName = this.getAngularAppName();
        jhipsterconst.mainClassName = this.getMainClassName();
        jhipsterconst.javaDir = constants.SERVER_MAIN_SRC_DIR + packageFolder + '/';
        jhipsterconst.resourceDir = constants.SERVER_MAIN_RES_DIR;
        jhipsterconst.webappDir = constants.CLIENT_MAIN_SRC_DIR;
        jhipsterconst.CONSTANTS = constants;

        // alias fs and log methods so that we can use it in script-base when invoking functions from jhipsterFunc context in modules
        jhipsterFunc.fs = this.fs;
        jhipsterFunc.log = this.log;

        //add common methods from script-base.js
        jhipsterFunc.addSocialButton = this.addSocialButton;
        jhipsterFunc.addSocialConnectionFactory = this.addSocialConnectionFactory;
        jhipsterFunc.addMavenDependency = this.addMavenDependency;
        jhipsterFunc.addMavenPlugin = this.addMavenPlugin;
        jhipsterFunc.addGradlePlugin = this.addGradlePlugin;
        jhipsterFunc.addGradleDependency = this.addGradleDependency;
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
        jhipsterFunc.addAngularJsModule = this.addAngularJsModule;
        jhipsterFunc.addAngularJsInterceptor = this.addAngularJsInterceptor;
        jhipsterFunc.addElementToMenu = this.addElementToMenu;
        jhipsterFunc.addElementToAdminMenu = this.addElementToAdminMenu;
        jhipsterFunc.addEntityToMenu = this.addEntityToMenu;
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
        jhipsterFunc.getMainClassName = this.getMainClassName;
        jhipsterFunc.askModuleName = this.askModuleName;
        jhipsterFunc.aski18n = this.aski18n;
        jhipsterFunc.composeLanguagesSub = this.composeLanguagesSub;
        jhipsterFunc.getNumberedQuestion = this.getNumberedQuestion;
        jhipsterFunc.buildApplication = this.buildApplication;
        jhipsterFunc.writeFilesToDisk = this.writeFilesToDisk;
        jhipsterFunc.getEntityJson = this.getEntityJson;
    },

    initializing: function () {
        const insight = this.insight();
        insight.trackWithEvent('generator', 'modules');

        this.log('Reading the JHipster project configuration for your module');
    }
});
