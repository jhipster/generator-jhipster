/*global describe, beforeEach, it*/
'use strict';

var path    = require('path');
var helpers = require('yeoman-generator').test;
var fs = require('fs');
var fsExtra = require('fs.extra');
var strings = require('underscore.string');
var assert    = require('assert');
var TestUtils = require('./test-utils');
var _DEBUG = false;

describe('jhipster generate entity', function () {
  var entityName = 'myEntity';
  var testUtils = new TestUtils();
  var targetDir = testUtils.createTargetPath(__filename);
  var entityConfigFileFolder = path.join(targetDir, '.jhipster');
  var entityConfigFileName =  strings.capitalize(entityName) + '.json';
  var entityConfigFile = path.join(entityConfigFileFolder, entityConfigFileName);
  
  var appConfigFileFolder = targetDir;
  var appConfigFileName = '.yo-rc.json';
  var appConfigFile = path.join(appConfigFileFolder, appConfigFileName);

  afterEach(function (done) {
    if (_DEBUG) {
      done();
    } else {
      fsExtra.rmrf(targetDir, done)
    }
  });

  var defaultFiles = [
      '.jhipster' + path.sep + entityConfigFileName,
      appConfigFileName
    ];

  var resourceDir = 'src/main/resources/';
  var testResourceDir = 'src/test/resources/';
  var webappDir = 'src/main/webapp/';
  var javaSrcDir = 'src/main/java/';
  var javaTestDir = 'src/test/java/';
  var javaPackageDir = javaSrcDir + 'com/mycompany/myapp/';

  it('creates expected files', function (done) {
    var entityConfigContent = '{'
+ '\n' + '   "relationships": [],'
+ '\n' + '    "fields": ['
+ '\n' + '        {'
+ '\n' + '            "fieldId": 1,'
+ '\n' + '            "fieldName": "field1",'
+ '\n' + '            "fieldType": "String",'
+ '\n' + '            "fieldNameCapitalized": "Field1",'
+ '\n' + '            "fieldNameUnderscored": "field1",'
+ '\n' + '            "fieldInJavaBeanMethod": "StringField",'
+ '\n' + '            "fieldValidate": true,'
+ '\n' + '            "fieldValidateRules": ['
+ '\n' + '                "required",'
+ '\n' + '                "minlength",'
+ '\n' + '                "maxlength"'
+ '\n' + '            ],'
+ '\n' + '            "fieldValidateRulesMinlength": "3",'
+ '\n' + '            "fieldValidateRulesMaxlength": "50"'
+ '\n' + '        }'
+ '\n' + '    ],'
+ '\n' + '    "fieldsContainOwnerManyToMany": false,'
+ '\n' + '    "fieldsContainOneToMany": false,'
+ '\n' + '    "fieldsContainLocalDate": false,'
+ '\n' + '    "fieldsContainCustomTime": false,'
+ '\n' + '    "fieldsContainBigDecimal": false,'
+ '\n' + '    "fieldsContainDateTime": false,'
+ '\n' + '    "fieldsContainDate": false,'
+ '\n' + '    "changelogDate": "20150405192020",'
+ '\n' + '    "pagination": "pagination",'
+ '\n' + '    "validation": true'
+ '\n' + '}'
+ '\n';

    var appConfigContent = '{'
+ '\n' + '  "generator-jhipster": {'
+ '\n' + '    "baseName": "jhipster",'
+ '\n' + '    "packageName": "com.mycompany.myapp",'
+ '\n' + '    "packageFolder": "com/mycompany/myapp",'
+ '\n' + '    "authenticationType": "session",'
+ '\n' + '    "hibernateCache": "ehcache",'
+ '\n' + '    "clusteredHttpSession": "no",'
+ '\n' + '    "websocket": "no",'
+ '\n' + '    "databaseType": "sql",'
+ '\n' + '    "devDatabaseType": "h2Memory",'
+ '\n' + '    "prodDatabaseType": "postgresql",'
+ '\n' + '    "useCompass": false,'
+ '\n' + '    "buildTool": "maven",'
+ '\n' + '    "frontendBuilder": "grunt",'
+ '\n' + '    "javaVersion": "8",'
+ '\n' + '    "rememberMeKey": "04af1da1d84e91cf1615032b1b11af27ab7877bf"'
+ '\n' + '  }'
+ '\n' + '}';


    helpers.testDirectory(targetDir, function (err) {
      if (err) {
        return done(err);
      }

      writeEntityConfig(entityConfigContent);
      writeAppConfig(appConfigContent)
      
      console.log('Create and run generator');

      this.app = helpers.createGenerator('jhipster:entity', [
        '../../../entity'
      ], entityName);
      this.app.options['skip-install'] = true;
      this.app.run({}, function () {
        var expectedFilesDir = testUtils.createArchetypesDir('entity');
        testUtils.assertGeneratedFiles(expectedFilesDir, targetDir);
        done();
      });
    }.bind(this));
  });

  function writeEntityConfig(entityConfigContent) {
    fs.mkdirSync(entityConfigFileFolder);
    fs.writeFileSync(entityConfigFile, entityConfigContent);
    console.log('Entity config file was saved to ' + entityConfigFile);
  }

  function writeAppConfig(appConfigContent) {
    fs.writeFileSync(appConfigFile, appConfigContent);
    console.log('App config file was saved to ' + appConfigFile);
  }

});

