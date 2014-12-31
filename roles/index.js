'use strict';
var util = require('util'),
path = require('path'),
yeoman = require('yeoman-generator'),
exec = require('child_process').exec,
chalk = require('chalk'),
_s = require('underscore.string'),
scriptBase = require('../script-base');

var RolesGenerator = module.exports = function RolesGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);
    console.log(chalk.bold('Roles configuration is starting'));
    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.packageFolder = this.config.get('packageFolder');
    this.roleNames = this.config.get('roleNames');
    this.databaseType = this.config.get('databaseType');
    this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
};

util.inherits(RolesGenerator, yeoman.generators.Base);
util.inherits(RolesGenerator, scriptBase);

RolesGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    var prompts = [
    {
        type: 'input',
        name: 'roleNames',
        message: 'What additional roles should be supported (separate the values with space or comma)?',
        default: this.roleNames
    }];

    this.prompt(prompts, function (props) {
        this.roleNames = props.roleNames;
        cb();
    }.bind(this));
};

RolesGenerator.prototype.updateFiles = function updateFiles() {
    var prefix = '../../app/templates/';
    var javaDir = 'src/main/java/' + this.packageFolder + '/';
    var resourceDir = 'src/main/resources/';
    
    this.roles = this.buildRoleMap(this.roleNames);
    
    this.template(prefix + 'src/main/java/package/security/_AuthoritiesConstants.java', javaDir + 'security/AuthoritiesConstants.java', this, {});
    if (this.databaseType == "sql") {
        this.template(prefix + resourceDir + '/config/liquibase/authorities.csv', resourceDir + 'config/liquibase/authorities.csv');
    }
    if (this.databaseType == "nosql") {
        this.template(prefix + resourceDir + '/config/mongeez/authorities.xml', resourceDir + 'config/mongeez/authorities.xml', this, {});
    }
    this.config.set('roleNames', this.roleNames);
};

