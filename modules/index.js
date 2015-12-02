'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _ = require('underscore.string'),
    scriptBase = require('../script-base');

this.configuration = {};

var ModulesGenerator = module.exports = function ModulesGenerator(args, options, config) {
    this.configuration = options.configuration;
    if (this.configuration == null ||
        this.configuration.moduleName == null) {
        console.log(chalk.red('ERROR! This sub-generator must be used by JHipster modules, and the module name is not defined.'));
        return;
    };
    console.log('Composing JHipster configuration with module ' + chalk.red(this.configuration.moduleName));
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
    this.packageFolder = this.packageName.replace(/\./g, '/');
    this.javaDir = 'src/main/java/' + this.packageFolder + '/';
    this.resourceDir = 'src/main/resources/';
    this.webappDir = 'src/main/webapp/';

    this.configuration['baseName'] = this.baseName;
    this.configuration['packageName'] = this.packageName;
    this.configuration['javaDir'] = this.javaDir;
    this.configuration['resourceDir'] = this.resourceDir;
    this.configuration['webappDir'] = this.webappDir;
};
