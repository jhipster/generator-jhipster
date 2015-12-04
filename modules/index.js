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
        return;
    };
    console.log('Composing JHipster configuration with module ' + chalk.red(this.jhipsterVar.moduleName));
    yeoman.generators.Base.apply(this, arguments);
    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.packageFolder = this.config.get('packageFolder');
    this.databaseType = this.config.get('databaseType');
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
        console.log('JHipster Fortune is a JHipster module, and needs a .yo-rc.json configuration file made by JHipster.');
        done();
        return;
    }
    this.angularAppName = _.camelize(_.slugify(this.baseName)) + 'App';
    this.packageFolder = this.packageName.replace(/\./g, '/');
    this.javaDir = 'src/main/java/' + this.packageFolder + '/';
    this.resourceDir = 'src/main/resources/';
    this.webappDir = 'src/main/webapp/';

    this.jhipsterVar['baseName'] = this.baseName;
    this.jhipsterVar['packageName'] = this.packageName;
    this.jhipsterVar['angularAppName'] = this.angularAppName;
    this.jhipsterVar['javaDir'] = this.javaDir;
    this.jhipsterVar['resourceDir'] = this.resourceDir;
    this.jhipsterVar['webappDir'] = this.webappDir;

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
