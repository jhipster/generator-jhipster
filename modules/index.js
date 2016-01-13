'use strict';
var util = require('util'),
    path = require('path'),
    generators = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    scriptBase = require('../script-base');

// Stores JHipster variables
this.jhipsterVar = {};

// Stores JHipster functions
this.jhipsterFunc = {};

var ModulesGenerator = generators.Base.extend({});

util.inherits(ModulesGenerator, scriptBase);

module.exports = ModulesGenerator.extend({
    constructor: function() {
        generators.Base.apply(this, arguments);
        this.jhipsterVar = this.options.jhipsterVar;
        this.jhipsterFunc = this.options.jhipsterFunc;

    },

    initializing : {
        displayLogo : function () {

            if (this.jhipsterVar == null || this.jhipsterVar.moduleName == null) {
                this.env.error(chalk.red('ERROR! This sub-generator must be used by JHipster modules, and the module name is not defined.'));
            };
            this.log('Composing JHipster configuration with module ' + chalk.red(this.jhipsterVar.moduleName));
        },

        setupVars : function () {
            this.log('Reading the JHipster project configuration for your module');

            this.baseName = this.config.get('baseName');
            this.packageName = this.config.get('packageName');
            this.packageFolder = this.config.get('packageFolder');

            if (this.baseName == null ||
                this.packageName == null) {
                this.log(chalk.red('ERROR! There is no existing JHipster configuration file in this directory.'));
                this.env.error('JHipster ' + this.jhipsterVar.moduleName + ' is a JHipster module, and needs a .yo-rc.json configuration file made by JHipster.');
            }

            this.jhipsterVar['baseName'] = this.baseName;
            this.jhipsterVar['packageName'] = this.packageName;
            this.jhipsterVar['packageFolder'] = this.packageFolder;

            this.jhipsterVar['authenticationType'] = this.config.get('authenticationType');
            this.jhipsterVar['hibernateCache'] = this.config.get('hibernateCache');
            this.jhipsterVar['clusteredHttpSession'] = this.config.get('clusteredHttpSession');
            this.jhipsterVar['websocket'] = this.config.get('websocket');
            this.jhipsterVar['databaseType'] = this.config.get('databaseType');
            this.jhipsterVar['devDatabaseType'] = this.config.get('devDatabaseType');
            this.jhipsterVar['prodDatabaseType'] = this.config.get('prodDatabaseType');
            this.jhipsterVar['searchEngine'] = this.config.get('searchEngine');
            this.jhipsterVar['useSass'] = this.config.get('useSass');
            this.jhipsterVar['buildTool'] = this.config.get('buildTool');
            this.jhipsterVar['frontendBuilder'] = this.config.get('frontendBuilder');
            this.jhipsterVar['enableTranslation'] = this.config.get('enableTranslation');
            this.jhipsterVar['enableSocialSignIn'] = this.config.get('enableSocialSignIn');
            this.jhipsterVar['testFrameworks'] = this.config.get('testFrameworks');

            this.jhipsterVar['angularAppName'] = _.camelize(_.slugify(this.baseName)) + 'App';
            this.jhipsterVar['javaDir'] = 'src/main/java/' + this.packageFolder + '/';
            this.jhipsterVar['resourceDir'] = 'src/main/resources/';
            this.jhipsterVar['webappDir'] = 'src/main/webapp/';
        },

        setupFunc : function () {
            // alias fs and log methods so that we can use it in script-base when invoking functions from jhipsterFunc context in modules
            this.jhipsterFunc['fs'] = this.fs;
            this.jhipsterFunc['log'] = this.log;
            //add common methods from script-base.js
            this.jhipsterFunc['addSocialButton'] = this.addSocialButton;
            this.jhipsterFunc['addSocialConnectionFactory'] = this.addSocialConnectionFactory;
            this.jhipsterFunc['addMavenDependency'] = this.addMavenDependency;
            this.jhipsterFunc['addMavenPlugin'] = this.addMavenPlugin;
            this.jhipsterFunc['addGradlePlugin'] = this.addGradlePlugin;
            this.jhipsterFunc['addGradleDependency'] = this.addGradleDependency;
            this.jhipsterFunc['addSocialConfiguration'] = this.addSocialConfiguration;
            this.jhipsterFunc['applyFromGradleScript'] = this.applyFromGradleScript;
            this.jhipsterFunc['addBowerrcParameter'] = this.addBowerrcParameter;
            this.jhipsterFunc['addBowerDependency'] = this.addBowerDependency;
            this.jhipsterFunc['addBowerOverride'] = this.addBowerOverride;
            this.jhipsterFunc['addMainCSSStyle'] = this.addMainCSSStyle;
            this.jhipsterFunc['addMainSCSSStyle'] = this.addMainSCSSStyle;
            this.jhipsterFunc['addAngularJsModule'] = this.addAngularJsModule;
            this.jhipsterFunc['addAngularJsConfig'] = this.addAngularJsConfig;
            this.jhipsterFunc['addAngularJsInterceptor'] = this.addAngularJsInterceptor;
            this.jhipsterFunc['addJavaScriptToIndex'] = this.addJavaScriptToIndex;
            this.jhipsterFunc['addMessageformatLocaleToIndex'] = this.addMessageformatLocaleToIndex;
            this.jhipsterFunc['addElementToMenu'] = this.addElementToMenu;
            this.jhipsterFunc['addElementToAdminMenu'] = this.addElementToAdminMenu;
            this.jhipsterFunc['addEntityToMenu'] = this.addEntityToMenu;
            this.jhipsterFunc['addElementTranslationKey'] = this.addElementTranslationKey;
            this.jhipsterFunc['addAdminElementTranslationKey'] = this.addAdminElementTranslationKey;
            this.jhipsterFunc['addGlobalTranslationKey'] = this.addGlobalTranslationKey;
            this.jhipsterFunc['addTranslationKeyToAllLanguages'] = this.addTranslationKeyToAllLanguages;
            this.jhipsterFunc['getAllSupportedLanguages'] = this.getAllSupportedLanguages;
            this.jhipsterFunc['getAllInstalledLanguages'] = this.getAllInstalledLanguages;
            this.jhipsterFunc['addEntityTranslationKey'] = this.addEntityTranslationKey;
            this.jhipsterFunc['addChangelogToLiquibase'] = this.addChangelogToLiquibase;
            this.jhipsterFunc['addColumnToLiquibaseEntityChangeset'] = this.addColumnToLiquibaseEntityChangeset;
            this.jhipsterFunc['dateFormatForLiquibase'] = this.dateFormatForLiquibase;
            this.jhipsterFunc['copyI18nFilesByName'] = this.copyI18nFilesByName;
            this.jhipsterFunc['copyTemplate'] = this.copyTemplate;
            this.jhipsterFunc['copyHtml'] = this.copyHtml;
            this.jhipsterFunc['copyJs'] = this.copyJs;
            this.jhipsterFunc['rewriteFile'] = this.rewriteFile;
            this.jhipsterFunc['replaceContent'] = this.replaceContent;
            this.jhipsterFunc['registerModule'] = this.registerModule;
            this.jhipsterFunc['updateEntityConfig'] = this.updateEntityConfig;
            this.jhipsterFunc['getModuleHooks'] = this.getModuleHooks;
            this.log(this.jhipsterVar);
        }
    }
});
