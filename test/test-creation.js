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

  it('creates expected files', function (done) {

    var resourceDir = 'src/main/resources/';
    var webappDir = 'src/main/webapp/'

    var expected = [
      // add files you expect to exist here.
      '.jshintrc',
      '.editorconfig',
      'bower.json',
      'package.json',
      'pom.xml',
      '.bowerrc',
      '.gitignore',
      'README.md',
      '.yo-rc.json',
      resourceDir + 'config/liquibase/changelog/db-changelog-001.xml',
      resourceDir + 'config/liquibase/master.xml',
      resourceDir + 'config/liquibase/users.csv',
      resourceDir + 'config/liquibase/authorities.csv',
      resourceDir + 'config/liquibase/users_authorities.csv',
      webappDir + 'images/glyphicons-halflings.png', 
      webappDir + 'images/glyphicons-halflings-white.png', 
      webappDir + 'styles/bootstrap.css', 
      webappDir + 'styles/main.css', 
      webappDir + 'fonts/glyphicons-halflings-regular.eot',
      webappDir + 'fonts/glyphicons-halflings-regular.svg',
      webappDir + 'fonts/glyphicons-halflings-regular.ttf',
      webappDir + 'fonts/glyphicons-halflings-regular.woff'
    ];

    helpers.mockPrompt(this.app, {
      'baseName': 'jhipster',
      'packageName': 'com.mycompany.myapp',
      'javaVersion': '7',
      'authenticationType': 'cookie',
      'databaseType': 'sql',
      'hibernateCache': 'no',
      'clusteredHttpSession': 'no',
      'websocket': 'no',
      'prodDatabaseType': 'mysql',
      'devDatabaseType': 'h2Memory',
      'useCompass': false
    });
    this.app.options['skip-install'] = true;
    this.app.run({}, function () {
      helpers.assertFiles(expected);
      done();
    });
  });
});
