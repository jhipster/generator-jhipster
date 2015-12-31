'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    scriptBase = require('../script-base');

// Stores JHipster variables
this.jhipsterVar = {};

// Stores JHipster functions
this.jhipsterFunc = {};

var ModulesGenerator = module.exports = function ModulesGenerator(args, options, config) {
    this.jhipsterVar = options.jhipsterVar;
    this.jhipsterFunc = options.jhipsterFunc;
    if (this.jhipsterVar == null ||
        this.jhipsterVar.moduleName == null) {
        console.log(chalk.red('ERROR! This sub-generator must be used by JHipster modules, and the module name is not defined.'));
        process.exit(1);
    };
    console.log('Composing JHipster configuration with module ' + chalk.red(this.jhipsterVar.moduleName));
    yeoman.generators.Base.apply(this, arguments);

    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.packageFolder = this.config.get('packageFolder');
    this.authenticationType = this.config.get('authenticationType');
    this.hibernateCache = this.config.get('hibernateCache');
    this.clusteredHttpSession = this.config.get('clusteredHttpSession');
    this.websocket = this.config.get('websocket');
    this.databaseType = this.config.get('databaseType');
    this.devDatabaseType = this.config.get('devDatabaseType');
    this.prodDatabaseType = this.config.get('prodDatabaseType');
    this.searchEngine = this.config.get('searchEngine');
    this.useSass = this.config.get('useSass');
    this.buildTool = this.config.get('buildTool');
    this.frontendBuilder = this.config.get('frontendBuilder');
    this.enableTranslation = this.config.get('enableTranslation');
    this.enableSocialSignIn = this.config.get('enableSocialSignIn');
    this.testFrameworks = this.config.get('testFrameworks');

    this.jhipsterVar['baseName'] = this.baseName;
    this.jhipsterVar['packageName'] = this.packageName;
    this.jhipsterVar['packageFolder'] = this.packageFolder;
    this.jhipsterVar['authenticationType'] = this.authenticationType;
    this.jhipsterVar['hibernateCache'] = this.hibernateCache;
    this.jhipsterVar['clusteredHttpSession'] = this.clusteredHttpSession;
    this.jhipsterVar['websocket'] = this.websocket;
    this.jhipsterVar['databaseType'] = this.databaseType;
    this.jhipsterVar['devDatabaseType'] = this.devDatabaseType;
    this.jhipsterVar['prodDatabaseType'] = this.prodDatabaseType;
    this.jhipsterVar['searchEngine'] = this.searchEngine;
    this.jhipsterVar['useSass'] = this.useSass;
    this.jhipsterVar['buildTool'] = this.buildTool;
    this.jhipsterVar['frontendBuilder'] = this.frontendBuilder;
    this.jhipsterVar['enableTranslation'] = this.enableTranslation;
    this.jhipsterVar['enableSocialSignIn'] = this.enableSocialSignIn;
    this.jhipsterVar['testFrameworks'] = this.testFrameworks;
};

util.inherits(ModulesGenerator, yeoman.generators.Base);
util.inherits(ModulesGenerator, scriptBase);

ModulesGenerator.prototype.configurer = function configurer() {
    console.log('Reading the JHipster project configuration for your module');
    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    if (this.baseName == null ||
        this.packageName == null) {
        console.log(chalk.red('ERROR! There is no existing JHipster configuration file in this directory.'));
        console.log('JHipster ' + this.jhipsterVar.moduleName + ' is a JHipster module, and needs a .yo-rc.json configuration file made by JHipster.');
        process.exit(1);
    }
    this.angularAppName = _.camelize(_.slugify(this.baseName)) + 'App';
    this.packageFolder = this.packageName.replace(/\./g, '/');
    this.javaDir = 'src/main/java/' + this.packageFolder + '/';
    this.resourceDir = 'src/main/resources/';
    this.webappDir = 'src/main/webapp/';

    this.jhipsterVar['baseName'] = this.baseName;
    this.jhipsterVar['packageName'] = this.packageName;
    this.jhipsterVar['packageFolder'] = this.packageFolder;
    this.jhipsterVar['angularAppName'] = this.angularAppName;
    this.jhipsterVar['javaDir'] = this.javaDir;
    this.jhipsterVar['resourceDir'] = this.resourceDir;
    this.jhipsterVar['webappDir'] = this.webappDir;

    this.jhipsterFunc['addSocialButton'] = this.addSocialButton;
    this.jhipsterFunc['addSocialConnectionFactory'] = this.addSocialConnectionFactory;
    this.jhipsterFunc['addMavenDependency'] = this.addMavenDependency;
    this.jhipsterFunc['addMavenPlugin'] = this.addMavenPlugin;
    this.jhipsterFunc['addGradlePlugin'] = this.addGradlePlugin;
    this.jhipsterFunc['addGradleDependency'] = this.addGradleDependency;
    this.jhipsterFunc['applyFromGradleScript'] = this.applyFromGradleScript;
    this.jhipsterFunc['addBowerrcParameter'] = this.addBowerrcParameter;
    this.jhipsterFunc['addBowerDependency'] = this.addBowerDependency;
    this.jhipsterFunc['addBowerOverride'] = this.addBowerOverride;
    this.jhipsterFunc['addMainCSSStyle'] = this.addMainCSSStyle;
    this.jhipsterFunc['addMainSCSSStyle'] = this.addMainSCSSStyle;
    this.jhipsterFunc['addAngularJsModule'] = this.addAngularJsModule;
    this.jhipsterFunc['addAngularJsConfig'] = this.addAngularJsConfig;
    this.jhipsterFunc['addJavaScriptToIndex'] = this.addJavaScriptToIndex;
    this.jhipsterFunc['addMessageformatLocaleToIndex'] = this.addMessageformatLocaleToIndex;
    this.jhipsterFunc['addElementToMenu'] = this.addElementToMenu;
    this.jhipsterFunc['addEntityToMenu'] = this.addEntityToMenu;
    this.jhipsterFunc['addElementTranslationKey'] = this.addElementTranslationKey;
    this.jhipsterFunc['addEntityTranslationKey'] = this.addEntityTranslationKey;
    this.jhipsterFunc['addChangelogToLiquibase'] = this.addChangelogToLiquibase;
    this.jhipsterFunc['dateFormatForLiquibase'] = this.dateFormatForLiquibase;
    this.jhipsterFunc['copyI18nFilesByName'] = this.copyI18nFilesByName;
};
