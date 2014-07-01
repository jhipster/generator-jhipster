'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _s = require('underscore.string'),
    scriptBase = require('../script-base');

var EntityGenerator = module.exports = function EntityGenerator(args, options, config) {
  yeoman.generators.NamedBase.apply(this, arguments);	
  console.log('The entity ' + this.name + ' is being created.');
  this.env.options.appPath = this.config.get('appPath') || 'src/main/webapp';
  this.baseName = this.config.get('baseName');
  this.packageName = this.config.get('packageName');
  this.packageFolder = this.config.get('packageFolder');
  this.javaVersion = this.config.get('javaVersion');
  this.hibernateCache = this.config.get('hibernateCache');
  this.databaseType = this.config.get('databaseType');
  this.angularAppName = _s.camelize(_s.slugify(this.baseName)) + 'App';
};

util.inherits(EntityGenerator, yeoman.generators.Base);
util.inherits(EntityGenerator, scriptBase);

EntityGenerator.prototype.files = function files() {

  this.entityClass = _s.capitalize(this.name);
  this.entityInstance = this.name.toLowerCase();

  this.template('src/main/java/package/domain/_Entity.java', 
  	'src/main/java/' + this.packageFolder + '/domain/' +  this.entityClass + '.java');

  this.template('src/main/java/package/repository/_EntityRepository.java', 
    'src/main/java/' + this.packageFolder + '/repository/' +  this.entityClass + 'Repository.java');

  this.template('src/main/java/package/web/rest/_EntityResource.java', 
    'src/main/java/' + this.packageFolder + '/web/rest/' +  this.entityClass + 'Resource.java');

  this.template('src/main/webapp/views/_entities.html', 
    'src/main/webapp/views/' +  this.entityInstance + 's.html');

  this.template('src/main/webapp/scripts/_entity-router.js', 
    'src/main/webapp/scripts/' +  this.entityInstance + '/router_'+this.entityInstance+'.js');
  this.addScriptToIndex(this.entityInstance + '/router_'+this.entityInstance+'.js');

  this.template('src/main/webapp/scripts/_entity-controller.js',
    'src/main/webapp/scripts/' +  this.entityInstance + '/controller_'+this.entityInstance+'.js');
  this.addScriptToIndex(this.entityInstance + '/controller_'+this.entityInstance+'.js');

  this.template('src/main/webapp/scripts/_entity-service.js',
    'src/main/webapp/scripts/' +  this.entityInstance + '/service_'+this.entityInstance+'.js');
  this.addScriptToIndex(this.entityInstance + '/service_'+this.entityInstance+'.js');

  this.template('src/test/java/package/web/rest/_EntityResourceTest.java',
  	'src/test/java/' + this.packageFolder + '/web/rest/' +  this.entityClass + 'ResourceTest.java');

};




