/*global describe, beforeEach, it*/
'use strict';

var path    = require('path');
var helpers = require('yeoman-generator').test;


describe('jhipster generator', function () {
  beforeEach(function (done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
      if (err) {
        return done(err);
      }

      this.app = helpers.createGenerator('jhipster:app', [
        '../../app'
      ]);
      done();
    }.bind(this));
  });

  var defaultFiles = [
      '.jshintrc',
      '.editorconfig',
      'bower.json',
      'package.json',
      'pom.xml',
      '.bowerrc',
      '.gitignore',
      'README.md',
      '.yo-rc.json'
    ];

  var resourceDir = 'src/main/resources/';
  var testResourceDir = 'src/test/resources/';
  var webappDir = 'src/main/webapp/';
  var javaSrcDir = 'src/main/java/';
  var javaTestDir = 'src/test/java/';
  var javaPackageDir = javaSrcDir + 'com/mycompany/myapp/';

  it('creates expected files', function (done) {

    var expectedAdditionalFiles = [
      resourceDir + 'config/liquibase/changelog/00000000000000_initial_schema.xml',
      resourceDir + 'config/liquibase/master.xml',
      resourceDir + 'config/liquibase/users.csv',
      resourceDir + 'config/liquibase/authorities.csv',
      resourceDir + 'config/liquibase/users_authorities.csv',
      webappDir + 'assets/styles/main.css',
    ];

    var expected = defaultFiles.concat(expectedAdditionalFiles);

    helpers.mockPrompt(this.app, {
      'baseName': 'jhipster',
      'packageName': 'com.mycompany.myapp',
      'javaVersion': '7',
      'authenticationType': 'session',
      'databaseType': 'sql',
      'hibernateCache': 'no',
      'clusteredHttpSession': 'no',
      'websocket': 'no',
      'prodDatabaseType': 'mysql',
      'devDatabaseType': 'h2Memory',
      'frontendBuilder': 'grunt',
      'useCompass': false,
      'enableTranslation' : true
    });
    this.app.options['skip-install'] = true;
    this.app.run({}, function () {
      helpers.assertFiles(expected);
      done();
    });
  });

  it('creates expected files with authenticationType "oauth2"', function (done) {

    var expectedAdditionalFiles = [
      resourceDir + 'config/liquibase/changelog/00000000000000_initial_schema.xml',
      resourceDir + 'config/liquibase/master.xml',
      resourceDir + 'config/liquibase/users.csv',
      resourceDir + 'config/liquibase/authorities.csv',
      resourceDir + 'config/liquibase/users_authorities.csv',
      webappDir + 'assets/styles/main.css',
      javaPackageDir + 'config/OAuth2ServerConfiguration.java'
    ];

    var expected = defaultFiles.concat(expectedAdditionalFiles);

    helpers.mockPrompt(this.app, {
      'baseName': 'jhipster',
      'packageName': 'com.mycompany.myapp',
      'javaVersion': '7',
      'authenticationType': 'oauth2',
      'databaseType': 'sql',
      'hibernateCache': 'no',
      'clusteredHttpSession': 'no',
      'websocket': 'no',
      'prodDatabaseType': 'mysql',
      'devDatabaseType': 'h2Memory',
      'frontendBuilder': 'grunt',
      'useCompass': false,
      'enableTranslation' : true
    });
    this.app.options['skip-install'] = true;
    this.app.run({}, function () {
      helpers.assertFiles(expected);
      done();
    });
  });

  it('creates expected files with hibernateCache "ehcache"', function (done) {

    var expectedAdditionalFiles = [
      resourceDir + 'config/liquibase/changelog/00000000000000_initial_schema.xml',
      resourceDir + 'config/liquibase/master.xml',
      resourceDir + 'config/liquibase/users.csv',
      resourceDir + 'config/liquibase/authorities.csv',
      resourceDir + 'config/liquibase/users_authorities.csv',
      webappDir + 'assets/styles/main.css',
      resourceDir + 'ehcache.xml',
      testResourceDir + 'ehcache.xml'
    ];

    var expected = defaultFiles.concat(expectedAdditionalFiles);

    helpers.mockPrompt(this.app, {
      'baseName': 'jhipster',
      'packageName': 'com.mycompany.myapp',
      'javaVersion': '7',
      'authenticationType': 'oauth2',
      'databaseType': 'sql',
      'hibernateCache': 'ehcache',
      'clusteredHttpSession': 'no',
      'websocket': 'no',
      'prodDatabaseType': 'mysql',
      'devDatabaseType': 'h2Memory',
      'frontendBuilder': 'grunt',
      'useCompass': false,
      'enableTranslation' : true
    });
    this.app.options['skip-install'] = true;
    this.app.run({}, function () {
      helpers.assertFiles(expected);
      done();
    });
  });

  it('creates expected files with hibernateCache "hazelcast"', function (done) {

    var expectedAdditionalFiles = [
      resourceDir + 'config/liquibase/changelog/00000000000000_initial_schema.xml',
      resourceDir + 'config/liquibase/master.xml',
      resourceDir + 'config/liquibase/users.csv',
      resourceDir + 'config/liquibase/authorities.csv',
      resourceDir + 'config/liquibase/users_authorities.csv',
      webappDir + 'assets/styles/main.css',
      javaPackageDir + 'config/hazelcast/HazelcastCacheRegionFactory.java',
      javaPackageDir + 'config/hazelcast/package-info.java'
    ];

    var expected = defaultFiles.concat(expectedAdditionalFiles);

    helpers.mockPrompt(this.app, {
      'baseName': 'jhipster',
      'packageName': 'com.mycompany.myapp',
      'javaVersion': '7',
      'authenticationType': 'oauth2',
      'databaseType': 'sql',
      'hibernateCache': 'hazelcast',
      'clusteredHttpSession': 'no',
      'websocket': 'no',
      'prodDatabaseType': 'mysql',
      'devDatabaseType': 'h2Memory',
      'frontendBuilder': 'grunt',
      'useCompass': false,
      'enableTranslation' : true
    });
    this.app.options['skip-install'] = true;
    this.app.run({}, function () {
      helpers.assertFiles(expected);
      done();
    });
  });

  it('creates expected files with translation enabled', function (done) {

    var expectedAdditionalFiles = [
        resourceDir + 'i18n/messages_en.properties',
        resourceDir + 'i18n/messages_fr.properties',
        webappDir + 'i18n/en/global.json',
        webappDir + 'i18n/fr/global.json',
        webappDir + 'scripts/components/language/language.controller.js',
        webappDir + 'scripts/components/language/language.service.js'
    ];

    var expected = defaultFiles.concat(expectedAdditionalFiles);

    helpers.mockPrompt(this.app, {
        'baseName': 'jhipster',
        'packageName': 'com.mycompany.myapp',
        'javaVersion': '7',
        'authenticationType': 'session',
        'databaseType': 'sql',
        'hibernateCache': 'no',
        'clusteredHttpSession': 'no',
        'websocket': 'no',
        'prodDatabaseType': 'mysql',
        'devDatabaseType': 'h2Memory',
        'frontendBuilder': 'grunt',
        'useCompass': false,
        'enableTranslation' : true
    });
    this.app.options['skip-install'] = true;
    this.app.run({}, function () {
        helpers.assertFiles(expected);
        done();
    });
  });
});
