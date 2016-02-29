'use strict';
var util = require('util'),
    path = require('path'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    scriptBase = require('../generator-base');

const constants = require('../generator-constants'),
    CLIENT_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR,
    SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR,
    SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;

var ModulesGenerator = generators.Base.extend({});

util.inherits(ModulesGenerator, scriptBase);

module.exports = ModulesGenerator.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);

        var jhipsterVar = this.options.jhipsterVar;
        var jhipsterFunc = this.options.jhipsterFunc;
        if (jhipsterVar == null || jhipsterVar.moduleName == null) {
            this.env.error(chalk.red('ERROR! This sub-generator must be used by JHipster modules, and the module name is not defined.'));
        };
        this.log('Composing JHipster configuration with module ' + chalk.red(jhipsterVar.moduleName));

        var baseName = this.config.get('baseName');
        var packageName = this.config.get('packageName');
        var packageFolder = this.config.get('packageFolder');

        if (!this.options.skipValidation && (baseName == null || packageName == null)) {
            this.log(chalk.red('ERROR! There is no existing JHipster configuration file in this directory.'));
            this.env.error('JHipster ' + jhipsterVar.moduleName + ' is a JHipster module, and needs a .yo-rc.json configuration file made by JHipster.');
        }
        // add required Jhipster variables
        jhipsterVar['baseName'] = this.baseName = baseName;
        jhipsterVar['packageName'] = packageName;
        jhipsterVar['packageFolder'] = packageFolder;

        jhipsterVar['authenticationType'] = this.config.get('authenticationType');
        jhipsterVar['hibernateCache'] = this.config.get('hibernateCache');
        jhipsterVar['clusteredHttpSession'] = this.config.get('clusteredHttpSession');
        jhipsterVar['websocket'] = this.config.get('websocket');
        jhipsterVar['databaseType'] = this.config.get('databaseType');
        jhipsterVar['devDatabaseType'] = this.config.get('devDatabaseType');
        jhipsterVar['prodDatabaseType'] = this.config.get('prodDatabaseType');
        jhipsterVar['searchEngine'] = this.config.get('searchEngine');
        jhipsterVar['useSass'] = this.config.get('useSass');
        jhipsterVar['buildTool'] = this.config.get('buildTool');
        jhipsterVar['enableTranslation'] = this.config.get('enableTranslation');
        jhipsterVar['enableSocialSignIn'] = this.config.get('enableSocialSignIn');
        jhipsterVar['testFrameworks'] = this.config.get('testFrameworks');

        jhipsterVar['angularAppName'] = this.getAngularAppName();
        jhipsterVar['mainClassName'] = this.getMainClassName();
        jhipsterVar['javaDir'] = SERVER_MAIN_SRC_DIR + packageFolder + '/';
        jhipsterVar['resourceDir'] = SERVER_MAIN_RES_DIR;
        jhipsterVar['webappDir'] = CLIENT_MAIN_SRC_DIR;

        // alias fs and log methods so that we can use it in script-base when invoking functions from jhipsterFunc context in modules
        jhipsterFunc['fs'] = this.fs;
        jhipsterFunc['log'] = this.log;

        //add common methods from script-base.js
        jhipsterFunc['addSocialButton'] = this.addSocialButton;
        jhipsterFunc['addSocialConnectionFactory'] = this.addSocialConnectionFactory;
        jhipsterFunc['addMavenDependency'] = this.addMavenDependency;
        jhipsterFunc['addMavenPlugin'] = this.addMavenPlugin;
        jhipsterFunc['addGradlePlugin'] = this.addGradlePlugin;
        jhipsterFunc['addGradleDependency'] = this.addGradleDependency;
        jhipsterFunc['addSocialConfiguration'] = this.addSocialConfiguration;
        jhipsterFunc['applyFromGradleScript'] = this.applyFromGradleScript;
        jhipsterFunc['addBowerrcParameter'] = this.addBowerrcParameter;
        jhipsterFunc['addBowerDependency'] = this.addBowerDependency;
        jhipsterFunc['addBowerOverride'] = this.addBowerOverride;
        jhipsterFunc['addMainCSSStyle'] = this.addMainCSSStyle;
        jhipsterFunc['addMainSCSSStyle'] = this.addMainSCSSStyle;
        jhipsterFunc['addAngularJsModule'] = this.addAngularJsModule;
        jhipsterFunc['addAngularJsInterceptor'] = this.addAngularJsInterceptor;
        jhipsterFunc['addJavaScriptToIndex'] = this.addJavaScriptToIndex;
        jhipsterFunc['addMessageformatLocaleToIndex'] = this.addMessageformatLocaleToIndex;
        jhipsterFunc['addElementToMenu'] = this.addElementToMenu;
        jhipsterFunc['addElementToAdminMenu'] = this.addElementToAdminMenu;
        jhipsterFunc['addEntityToMenu'] = this.addEntityToMenu;
        jhipsterFunc['addElementTranslationKey'] = this.addElementTranslationKey;
        jhipsterFunc['addAdminElementTranslationKey'] = this.addAdminElementTranslationKey;
        jhipsterFunc['addGlobalTranslationKey'] = this.addGlobalTranslationKey;
        jhipsterFunc['addTranslationKeyToAllLanguages'] = this.addTranslationKeyToAllLanguages;
        jhipsterFunc['getAllSupportedLanguages'] = this.getAllSupportedLanguages;
        jhipsterFunc['getAllInstalledLanguages'] = this.getAllInstalledLanguages;
        jhipsterFunc['addEntityTranslationKey'] = this.addEntityTranslationKey;
        jhipsterFunc['addChangelogToLiquibase'] = this.addChangelogToLiquibase;
        jhipsterFunc['addColumnToLiquibaseEntityChangeset'] = this.addColumnToLiquibaseEntityChangeset;
        jhipsterFunc['dateFormatForLiquibase'] = this.dateFormatForLiquibase;
        jhipsterFunc['copyI18nFilesByName'] = this.copyI18nFilesByName;
        jhipsterFunc['copyTemplate'] = this.copyTemplate;
        jhipsterFunc['copyHtml'] = this.copyHtml;
        jhipsterFunc['copyJs'] = this.copyJs;
        jhipsterFunc['rewriteFile'] = this.rewriteFile;
        jhipsterFunc['replaceContent'] = this.replaceContent;
        jhipsterFunc['registerModule'] = this.registerModule;
        jhipsterFunc['updateEntityConfig'] = this.updateEntityConfig;
        jhipsterFunc['getModuleHooks'] = this.getModuleHooks;
        jhipsterFunc['getExistingEntities'] = this.getExistingEntities;

    },

    initializing : function () {
        //at least one method is required for yeoman to initilize the generator
        this.log('Reading the JHipster project configuration for your module');
    }
});
