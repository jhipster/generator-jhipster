/*global describe, beforeEach, it*/
'use strict';

var path     = require('path');
var fs = require('fs');
var fsExtra = require('fs.extra');
var helpers  = require('yeoman-generator').test;
var TestUtils = require('./test-utils');
var _DEBUG = false;

describe('jhipster generate app hibernate ehcache', function () {

  var testUtils = new TestUtils();
  var targetDir = testUtils.createTargetPath(__filename);

  afterEach(function (done) {
    if (_DEBUG) {
      done();
    } else {
      fsExtra.rmrf(targetDir, done)
    }
  });
  
  var resourceDir = 'src/main/resources/';
  var testResourceDir = 'src/test/resources/';
  var webappDir = 'src/main/webapp/';
  var javaSrcDir = 'src/main/java/';
  var javaTestDir = 'src/test/java/';
  var javaPackageDir = javaSrcDir + 'com/mycompany/myapp/';


  it('generates files for option hibernateCache "ehcache"', function (done) {

    helpers.testDirectory(targetDir, function (err) {
      if (_DEBUG) console.log('Dir ' + targetDir);
      if (err) {
        return done(err);
      }

      this.app = helpers.createGenerator('jhipster:app', [
        '../../../app'
      ]);
      
      helpers.mockPrompt(this.app, {
        'baseName': 'jhipster',
        'packageName': 'com.mycompany.myapp',
        'javaVersion': '7',
        'authenticationType': 'token',
        'databaseType': 'sql',
        'hibernateCache': 'ehcache',
        'clusteredHttpSession': 'no',
        'websocket': 'no',
        'prodDatabaseType': 'mysql',
        'devDatabaseType': 'h2Memory',
        'frontendBuilder': 'grunt',
        'useCompass': false
      });
      this.app.options['skip-install'] = true;
      this.app.run({}, function () {
      	testUtils.fixDateInGeneratedGruntfileJs(targetDir);
        fixRememberMeKeyInGeneratedFiles();
        var expectedFilesDir = testUtils.createArchetypesDir('app-hibernate-ehcache');
        testUtils.assertGeneratedFiles(expectedFilesDir, targetDir);
        done();
      });
    }.bind(this));
  });


  var rememberKeyLineStart = testUtils.rememberKeyLineStart;
  var rememberKeyPregenerated = 'edd44237637a11657087ce937cca7e3925161366';
  var rememberKeyLineStartApplicationYml = 'jhipster.security.rememberme.key: ';
  
  function fixRememberMeKeyInGeneratedFiles() {
    var file = path.resolve(targetDir, ".yo-rc.json");
    var rememberMeKey = testUtils.findGeneratedRememberMeKey(file);

    testUtils.replaceInGeneratedFile(file, rememberKeyLineStart + '"' + rememberMeKey + '"', rememberKeyLineStart + '"' + rememberKeyPregenerated + '"');

    file = path.resolve(targetDir, "src" + path.sep + "main" + path.sep + "resources" + path.sep + "config" + path.sep + "application.yml");
    testUtils.replaceInGeneratedFile(file, rememberKeyLineStartApplicationYml + rememberMeKey, rememberKeyLineStartApplicationYml + rememberKeyPregenerated);
    file = path.resolve(targetDir, "src" + path.sep + "test" + path.sep + "resources" + path.sep + "config" + path.sep + "application.yml");
    testUtils.replaceInGeneratedFile(file, rememberKeyLineStartApplicationYml + rememberMeKey, rememberKeyLineStartApplicationYml + rememberKeyPregenerated);

  }

});

