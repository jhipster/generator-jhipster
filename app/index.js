'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk');

var JhipsterGenerator = module.exports = function JhipsterGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(JhipsterGenerator, yeoman.generators.Base);

JhipsterGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  console.log(chalk.red('\n'+
  ' _     _   ___   __  _____  ____  ___       __  _____   __    __    _    \n'+        
  '| |_| | | | |_) ( (`  | |  | |_  | |_)     ( (`  | |   / /\\  / /`  | |_/ \n'+       
  '|_| | |_| |_|   _)_)  |_|  |_|__ |_| \\     _)_)  |_|  /_/--\\ \\_\\_, |_| \\ \n'+       
  '                             ____  ___   ___                             \n'+                                  
  '                            | |_  / / \\ | |_)                            \n'+                                  
  '                            |_|   \\_\\_/ |_| \\                            \n'+                                  
  '              _    __    _       __        ___   ____  _      __        \n'+             
  '             | |  / /\\  \\ \\  /  / /\\      | | \\ | |_  \\ \\  / ( (`       \n'+             
  '           \\_|_| /_/--\\  \\_\\/  /_/--\\     |_|_/ |_|__  \\_\\/  _)_)       \n'+   
  '\n'));

console.log('\nWelcome to the Jhipster Generator\n\n');

var prompts = [
        {
            type: 'input',
            name: 'baseName',
            message: '(1/5) What is the base name of your application?',
            default: 'jhipster'
        },
        {
            type: 'input',
            name: 'packageName',
            message: '(2/5) What is your default package name?',
            default: 'com.mycompany'
        }, 
        { 
            type: 'list',
            name: 'springVersion',
            message: '(3/5) Which version of the Spring Framework would you like to use?',
            choices: [{
              value: 'spring32',
              name: 'Spring 3.2 (stable)',
              checked: true
            }, {
              value: 'spring4',
              name: 'Spring 4.0 (release candidate)',
              checked: false
            }]
        },
        { 
            type: 'list',
            name: 'databaseType',
            message: '(4/5) Which development database would you like to use?',
            choices: [{
              value: 'hsqldbMemory',
              name: 'HSQLDB in-memory',
              checked: true
            }, {
              value: 'postgresql',
              name: 'PostgreSQL',
              checked: false
            }]
        },
        {
            type: 'confirm',
            name: 'useCompass',
            message: '(5/5) Would you like to use the Compass CSS Authoring Framework?',
            default: false,
        }
		];

this.prompt(prompts, function (props) {
    this.springVersion = props.springVersion;
    this.springSecurityVersion = props.springSecurityVersion;
    this.packageName = props.packageName;
    this.baseName = props.baseName;
    this.databaseType = props.databaseType;
    this.useCompass = props.useCompass;

    cb();
  }.bind(this));
};

JhipsterGenerator.prototype.app = function app() {  

  this.template('_package.json', 'package.json');
  this.template('_bower.json', 'bower.json');
  this.template('bowerrc', '.bowerrc');
  this.template('Gruntfile.js', 'Gruntfile.js');
  this.copy('gitignore', '.gitignore');

  var packageFolder = this.packageName.replace(/\./g, '/');
  this.template('_pom.xml', 'pom.xml');

  // Create Java resource files
  var resourceDir = 'src/main/resources/';
  this.mkdir(resourceDir);
  this.template(resourceDir + '_ehcache.xml', resourceDir + 'ehcache.xml');
  this.template(resourceDir + '_logback.xml', resourceDir + 'logback.xml');

  this.copy(resourceDir + '/META-INF/persistence.xml', resourceDir + 'META-INF/persistence.xml');
  this.copy(resourceDir + '/META-INF/application/application.properties', resourceDir + 'META-INF/' + this.baseName + '/' + this.baseName + '.properties');
  this.copy(resourceDir + '/META-INF/liquibase/db-changelog.xml', resourceDir + 'META-INF/liquibase/db-changelog.xml');
  this.copy(resourceDir + '/META-INF/liquibase/users.csv', resourceDir + 'META-INF/liquibase/users.csv');
  this.copy(resourceDir + '/META-INF/liquibase/authorities.csv', resourceDir + 'META-INF/liquibase/authorities.csv');
  this.copy(resourceDir + '/META-INF/liquibase/users_authorities.csv', resourceDir + 'META-INF/liquibase/users_authorities.csv');
  this.copy(resourceDir + '/META-INF/spring/applicationContext-metrics.xml', resourceDir + 'META-INF/spring/applicationContext-metrics.xml');
  this.copy(resourceDir + '/META-INF/spring/applicationContext-database.xml', resourceDir + 'META-INF/spring/applicationContext-database.xml');
  this.template(resourceDir + '/META-INF/spring/_applicationContext-security.xml', resourceDir + 'META-INF/spring/applicationContext-security.xml');
 
  // Create Java files
  var javaDir = 'src/main/java/' + packageFolder + '/';

  this.template('src/main/java/package/conf/_package-info.java', javaDir + 'conf/package-info.java');
  this.template('src/main/java/package/conf/_ApplicationConfiguration.java', javaDir + 'conf/ApplicationConfiguration.java');
  this.template('src/main/java/package/conf/_AsyncConfiguration.java', javaDir + 'conf/AsyncConfiguration.java');
  this.template('src/main/java/package/conf/_CacheConfiguration.java', javaDir + 'conf/CacheConfiguration.java');
  this.template('src/main/java/package/conf/_MetricsConfiguration.java', javaDir + 'conf/MetricsConfiguration.java');
  this.template('src/main/java/package/conf/_Constants.java', javaDir + 'conf/Constants.java');
  this.template('src/main/java/package/conf/_DispatcherServletConfiguration.java', javaDir + 'conf/DispatcherServletConfiguration.java');
  this.template('src/main/java/package/conf/_WebConfigurer.java', javaDir + 'conf/WebConfigurer.java');

  this.template('src/main/java/package/conf/metrics/_package-info.java', javaDir + 'conf/metrics/package-info.java');
  this.template('src/main/java/package/conf/metrics/_DatabaseHealthCheck.java', javaDir + 'conf/metrics/DatabaseHealthCheck.java');

  this.template('src/main/java/package/domain/_package-info.java', javaDir + 'domain/package-info.java');
  this.template('src/main/java/package/domain/_User.java', javaDir + 'domain/User.java');
  this.template('src/main/java/package/domain/_Authority.java', javaDir + 'domain/Authority.java');

  this.template('src/main/java/package/repository/_package-info.java', javaDir + 'repository/package-info.java');
  this.template('src/main/java/package/repository/_UserRepository.java', javaDir + 'repository/UserRepository.java');

  this.template('src/main/java/package/security/_package-info.java', javaDir + 'security/package-info.java');
  this.template('src/main/java/package/security/_UserDetailsService.java', javaDir + 'security/UserDetailsService.java');
  this.template('src/main/java/package/security/_AuthoritiesConstants.java', javaDir + 'security/AuthoritiesConstants.java');
  this.template('src/main/java/package/security/_Http401UnauthorizedEntryPoint.java', javaDir + 'security/Http401UnauthorizedEntryPoint.java');
  this.template('src/main/java/package/security/_AjaxAuthenticationFailureHandler.java', javaDir + 'security/AjaxAuthenticationFailureHandler.java');
  this.template('src/main/java/package/security/_AjaxAuthenticationSuccessHandler.java', javaDir + 'security/AjaxAuthenticationSuccessHandler.java');
  this.template('src/main/java/package/security/_AjaxLogoutSuccessHandler.java', javaDir + 'security/AjaxLogoutSuccessHandler.java');

  this.template('src/main/java/package/web/controller/_package-info.java', javaDir + 'web/controller/package-info.java');
  this.template('src/main/java/package/web/controller/_HomeController.java', javaDir + 'web/controller/HomeController.java');  

  this.template('src/main/java/package/web/rest/_package-info.java', javaDir + 'web/rest/package-info.java'); 
  this.template('src/main/java/package/web/rest/_UserResource.java', javaDir + 'web/rest/UserResource.java'); 
  this.template('src/main/java/package/web/rest/_AccountResource.java', javaDir + 'web/rest/AccountResource.java');
  
  // Create Test Java files
  var testDir = 'src/test/java/' + packageFolder;
  this.mkdir(testDir);
  
  // Create Webapp
  var webappDir = 'src/main/webapp/';
  this.mkdir(webappDir);
  this.mkdir(webappDir + 'WEB-INF');
  this.template(webappDir + 'WEB-INF/_web.xml', webappDir + 'WEB-INF/web.xml');

  // normal CSS or SCSS?
  if (this.useCompass) {
    this.copy('src/main/scss/main.scss', 'src/main/scss/main.scss');
  } else {
    this.copy('src/main/webapp/images/glyphicons-halflings.png', 'src/main/webapp/images/glyphicons-halflings.png');
    this.copy('src/main/webapp/images/glyphicons-halflings-white.png', 'src/main/webapp/images/glyphicons-halflings-white.png');
    this.copy('src/main/webapp/styles/bootstrap.css', 'src/main/webapp/styles/bootstrap.css');
    this.copy('src/main/webapp/styles/main.css', 'src/main/webapp/styles/main.css');
    this.copy('src/main/webapp/fonts/glyphicons-halflings-regular.eot', 'src/main/webapp/fonts/glyphicons-halflings-regular.eot');
    this.copy('src/main/webapp/fonts/glyphicons-halflings-regular.svg', 'src/main/webapp/fonts/glyphicons-halflings-regular.svg');
    this.copy('src/main/webapp/fonts/glyphicons-halflings-regular.ttf', 'src/main/webapp/fonts/glyphicons-halflings-regular.ttf');
    this.copy('src/main/webapp/fonts/glyphicons-halflings-regular.woff', 'src/main/webapp/fonts/glyphicons-halflings-regular.woff');
  }
  
  // HTML5 BoilerPlate
  this.copy(webappDir + 'favicon.ico', webappDir + 'favicon.ico');
  this.copy(webappDir + '404.html', webappDir + '404.html');
  this.copy(webappDir + '500.html', webappDir + '500.html');
  this.copy(webappDir + 'robots.txt', webappDir + 'robots.txt');
  this.copy(webappDir + 'htaccess.txt', webappDir + '.htaccess');

  // Angular JS views
  this.copy(webappDir + '/views/main.html', webappDir + '/views/main.html');
  this.copy(webappDir + '/views/login.html', webappDir + '/views/login.html');

  // Index page  
  this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), webappDir + '_index.html'));
  this.indexFile = this.engine(this.indexFile, this);

  // JavaScript
  this.template(webappDir + 'scripts/_app.js', webappDir + 'scripts/app.js');
  this.template(webappDir + 'scripts/_controllers.js', webappDir + 'scripts/controllers.js');
  this.template(webappDir + 'scripts/_services.js', webappDir + 'scripts/services.js');
  this.indexFile = this.appendScripts(this.indexFile, 'scripts/main.js', [
    'scripts/app.js',
    'scripts/controllers.js',
    'scripts/services.js'
  ]);

  // CSS
  this.copy(webappDir + 'styles/documentation.css', webappDir + 'styles/documentation.css'); 

  this.indexFile = this.appendScripts(this.indexFile, 'scripts/plugins.js', [
    'bower_components/sass-bootstrap/js/affix.js',
    'bower_components/sass-bootstrap/js/alert.js',
    'bower_components/sass-bootstrap/js/dropdown.js',
    'bower_components/sass-bootstrap/js/tooltip.js',
    'bower_components/sass-bootstrap/js/modal.js',
    'bower_components/sass-bootstrap/js/transition.js',
    'bower_components/sass-bootstrap/js/button.js',
    'bower_components/sass-bootstrap/js/popover.js',
    'bower_components/sass-bootstrap/js/carousel.js',
    'bower_components/sass-bootstrap/js/scrollspy.js',
    'bower_components/sass-bootstrap/js/collapse.js',
    'bower_components/sass-bootstrap/js/tab.js'
  ]);
  this.write(webappDir + 'index.html', this.indexFile);

  this.config.set('packageName', this.packageName);
  this.config.set('packageFolder', packageFolder);
};

JhipsterGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
};
