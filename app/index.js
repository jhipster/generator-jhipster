'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _s = require('underscore.string');

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

    console.log(chalk.red('\n' +
        ' _     _   ___   __  _____  ____  ___       __  _____   __    __    _    \n' +
        '| |_| | | | |_) ( (`  | |  | |_  | |_)     ( (`  | |   / /\\  / /`  | |_/ \n' +
        '|_| | |_| |_|   _)_)  |_|  |_|__ |_| \\     _)_)  |_|  /_/--\\ \\_\\_, |_| \\ \n' +
        '                             ____  ___   ___                             \n' +
        '                            | |_  / / \\ | |_)                            \n' +
        '                            |_|   \\_\\_/ |_| \\                            \n' +
        '              _    __    _       __        ___   ____  _      __        \n' +
        '             | |  / /\\  \\ \\  /  / /\\      | | \\ | |_  \\ \\  / ( (`       \n' +
        '           \\_|_| /_/--\\  \\_\\/  /_/--\\     |_|_/ |_|__  \\_\\/  _)_)       \n' +
        '\n'));

    console.log('\nWelcome to the Jhipster Generator\n\n');

    var prompts = [
        {
            type: 'input',
            name: 'baseName',
            message: '(1/8) What is the base name of your application?',
            default: 'jhipster'
        },
        {
            type: 'input',
            name: 'packageName',
            message: '(2/8) What is your default Java package name?',
            default: 'com.mycompany.myapp'
        },
        {
            type: 'list',
            name: 'hibernateCache',
            message: '(3/8) Do you want to use Hibernate 2nd level cache?',
            choices: [
                {
                    value: 'no',
                    name: 'No'
                },
                {
                    value: 'ehcache',
                    name: 'Yes, with ehcache (local cache, for a single node)'
                },
                {
                    value: 'hazelcast',
                    name: 'Yes, with HazelCast (distributed cache, for multiple nodes)'
                }
            ],
            default: 1
        },
        {
            type: 'list',
            name: 'clusteredHttpSession',
            message: '(4/8) Do you want to use clustered HTTP sessions?',
            choices: [
                {
                    value: 'no',
                    name: 'No'
                },
                {
                    value: 'hazelcast',
                    name: 'Yes, with HazelCast'
                }
            ],
            default: 0
        },
        {
            type: 'list',
            name: 'websocket',
            message: '(5/8) Do you want to use WebSockets?',
            choices: [
                {
                    value: 'no',
                    name: 'No'
                },
                {
                    value: 'atmosphere',
                    name: 'Yes, with Atmosphere'
                }
            ],
            default: 0
        },
        {
            type: 'list',
            name: 'prodDatabaseType',
            message: '(6/8) Which *production* database would you like to use?',
            choices: [
                {
                    value: 'mysql',
                    name: 'MySQL'
                },
                {
                    value: 'postgresql',
                    name: 'PostgreSQL'
                }
            ],
            default: 0
        },
        {
            type: 'list',
            name: 'devDatabaseType',
            message: '(7/8) Which *development* database would you like to use?',
            choices: [
                {
                    value: 'hsqldbMemory',
                    name: 'HSQLDB in-memory'
                },
                {
                    value: 'mysql',
                    name: 'MySQL'
                },
                {
                    value: 'postgresql',
                    name: 'PostgreSQL'
                }
            ],
            default: 0
        },
        {
            type: 'confirm',
            name: 'useCompass',
            message: '(8/8) Would you like to use the Compass CSS Authoring Framework?',
            default: false
        }
    ];

    this.prompt(prompts, function (props) {
        this.springVersion = props.springVersion;
        this.springSecurityVersion = props.springSecurityVersion;
        this.packageName = props.packageName;
        this.baseName = props.baseName;
        this.hibernateCache = props.hibernateCache;
        this.clusteredHttpSession = props.clusteredHttpSession;
        this.websocket = props.websocket;
        this.devDatabaseType = props.devDatabaseType;
        this.prodDatabaseType = props.prodDatabaseType;
        this.useCompass = props.useCompass;

        cb();
    }.bind(this));
};

JhipsterGenerator.prototype.app = function app() {

    this.template('_package.json', 'package.json');
    this.template('_bower.json', 'bower.json');
    this.template('_README.md', 'README.md');
    this.template('bowerrc', '.bowerrc');
    this.template('Gruntfile.js', 'Gruntfile.js');
    this.copy('gitignore', '.gitignore');
    this.copy('spring_loaded/springloaded-1.1.5-dev.jar', 'spring_loaded/springloaded-1.1.5-dev.jar');

    var packageFolder = this.packageName.replace(/\./g, '/');
    this.template('_pom.xml', 'pom.xml');

    // Create Java resource files
    var resourceDir = 'src/main/resources/';
    this.mkdir(resourceDir);

    if (this.hibernateCache == "ehcache") {
        this.template(resourceDir + '_ehcache.xml', resourceDir + 'ehcache.xml');
    }

    this.template(resourceDir + '_logback.xml', resourceDir + 'logback.xml');

    this.template(resourceDir + '/config/_application.yml', resourceDir + 'config/application.yml');
    this.template(resourceDir + '/config/_application-dev.yml', resourceDir + 'config/application-dev.yml');
    this.template(resourceDir + '/config/_application-prod.yml', resourceDir + 'config/application-prod.yml');

    this.copy(resourceDir + '/config/liquibase/db-changelog.xml', resourceDir + 'config/liquibase/db-changelog.xml');
    this.copy(resourceDir + '/config/liquibase/users.csv', resourceDir + 'config/liquibase/users.csv');
    this.copy(resourceDir + '/config/liquibase/authorities.csv', resourceDir + 'config/liquibase/authorities.csv');
    this.copy(resourceDir + '/config/liquibase/users_authorities.csv', resourceDir + 'config/liquibase/users_authorities.csv');

    // Create Java files
    var javaDir = 'src/main/java/' + packageFolder + '/';

    this.template('src/main/java/package/_Application.java', javaDir + '/Application.java');
    this.template('src/main/java/package/_ApplicationWebXml.java', javaDir + '/ApplicationWebXml.java');

    this.template('src/main/java/package/config/_package-info.java', javaDir + 'config/package-info.java');
    this.template('src/main/java/package/config/_AsyncConfiguration.java', javaDir + 'config/AsyncConfiguration.java');
    this.template('src/main/java/package/config/_CacheConfiguration.java', javaDir + 'config/CacheConfiguration.java');
    this.template('src/main/java/package/config/_Constants.java', javaDir + 'config/Constants.java');
    this.template('src/main/java/package/config/_DatabaseConfiguration.java', javaDir + 'config/DatabaseConfiguration.java');
    this.template('src/main/java/package/config/_MailConfiguration.java', javaDir + 'config/MailConfiguration.java');
    this.template('src/main/java/package/config/_MetricsConfiguration.java', javaDir + 'config/MetricsConfiguration.java');
    this.template('src/main/java/package/config/_SecurityConfiguration.java', javaDir + 'config/SecurityConfiguration.java');
    this.template('src/main/java/package/config/_WebConfigurer.java', javaDir + 'config/WebConfigurer.java');

    this.template('src/main/java/package/config/metrics/_package-info.java', javaDir + 'config/metrics/package-info.java');
    this.template('src/main/java/package/config/metrics/_DatabaseHealthCheck.java', javaDir + 'config/metrics/DatabaseHealthCheck.java');
    this.template('src/main/java/package/config/metrics/_JavaMailHealthCheck.java', javaDir + 'config/metrics/JavaMailHealthCheck.java');

    if (this.hibernateCache == "hazelcast") {
        this.template('src/main/java/package/config/hazelcast/_HazelcastCacheRegionFactory.java', javaDir + 'config/hazelcast/HazelcastCacheRegionFactory.java');
        this.template('src/main/java/package/config/hazelcast/_package-info.java', javaDir + 'config/hazelcast/package-info.java');
    }

    this.template('src/main/java/package/domain/_package-info.java', javaDir + 'domain/package-info.java');
    this.template('src/main/java/package/domain/_Authority.java', javaDir + 'domain/Authority.java');
    this.template('src/main/java/package/domain/_PersistentToken.java', javaDir + 'domain/PersistentToken.java');
    this.template('src/main/java/package/domain/_User.java', javaDir + 'domain/User.java');
    this.template('src/main/java/package/domain/util/_CustomLocalDateSerializer.java', javaDir + 'domain/util/CustomLocalDateSerializer.java');

    this.template('src/main/java/package/repository/_package-info.java', javaDir + 'repository/package-info.java');
    this.template('src/main/java/package/repository/_AuthorityRepository.java', javaDir + 'repository/AuthorityRepository.java');
    this.template('src/main/java/package/repository/_UserRepository.java', javaDir + 'repository/UserRepository.java');
    this.template('src/main/java/package/repository/_PersistentTokenRepository.java', javaDir + 'repository/PersistentTokenRepository.java');

    this.template('src/main/java/package/security/_package-info.java', javaDir + 'security/package-info.java');
    this.template('src/main/java/package/security/_AjaxAuthenticationFailureHandler.java', javaDir + 'security/AjaxAuthenticationFailureHandler.java');
    this.template('src/main/java/package/security/_AjaxAuthenticationSuccessHandler.java', javaDir + 'security/AjaxAuthenticationSuccessHandler.java');
    this.template('src/main/java/package/security/_AjaxLogoutSuccessHandler.java', javaDir + 'security/AjaxLogoutSuccessHandler.java');
    this.template('src/main/java/package/security/_AuthoritiesConstants.java', javaDir + 'security/AuthoritiesConstants.java');
    this.template('src/main/java/package/security/_CustomPersistentRememberMeServices.java', javaDir + 'security/CustomPersistentRememberMeServices.java');
    this.template('src/main/java/package/security/_Http401UnauthorizedEntryPoint.java', javaDir + 'security/Http401UnauthorizedEntryPoint.java');
    this.template('src/main/java/package/security/_SecurityUtils.java', javaDir + 'security/SecurityUtils.java');
    this.template('src/main/java/package/security/_UserDetailsService.java', javaDir + 'security/UserDetailsService.java');

    this.template('src/main/java/package/service/_package-info.java', javaDir + 'service/package-info.java');
    this.template('src/main/java/package/service/_UserService.java', javaDir + 'service/UserService.java');
    this.template('src/main/java/package/service/_MailService.java', javaDir + 'service/MailService.java');

    this.template('src/main/java/package/web/filter/_package-info.java', javaDir + 'web/filter/package-info.java');
    this.template('src/main/java/package/web/filter/_CachingHttpHeadersFilter.java', javaDir + 'web/filter/CachingHttpHeadersFilter.java');
    this.template('src/main/java/package/web/filter/_StaticResourcesProductionFilter.java', javaDir + 'web/filter/StaticResourcesProductionFilter.java');

    this.template('src/main/java/package/web/filter/gzip/_package-info.java', javaDir + 'web/filter/gzip/package-info.java');
    this.template('src/main/java/package/web/filter/gzip/_GzipResponseHeadersNotModifiableException.java', javaDir + 'web/filter/gzip/GzipResponseHeadersNotModifiableException.java');
    this.template('src/main/java/package/web/filter/gzip/_GZipResponseUtil.java', javaDir + 'web/filter/gzip/GZipResponseUtil.java');
    this.template('src/main/java/package/web/filter/gzip/_GZipServletFilter.java', javaDir + 'web/filter/gzip/GZipServletFilter.java');
    this.template('src/main/java/package/web/filter/gzip/_GZipServletOutputStream.java', javaDir + 'web/filter/gzip/GZipServletOutputStream.java');
    this.template('src/main/java/package/web/filter/gzip/_GZipServletResponseWrapper.java', javaDir + 'web/filter/gzip/GZipServletResponseWrapper.java');

    this.template('src/main/java/package/web/rest/dto/_LoggerDTO.java', javaDir + 'web/rest/dto/LoggerDTO.java');
    this.template('src/main/java/package/web/rest/dto/_UserDTO.java', javaDir + 'web/rest/dto/UserDTO.java');
    this.template('src/main/java/package/web/rest/_package-info.java', javaDir + 'web/rest/package-info.java');
    this.template('src/main/java/package/web/rest/_AccountResource.java', javaDir + 'web/rest/AccountResource.java');
    this.template('src/main/java/package/web/rest/_LogsResource.java', javaDir + 'web/rest/LogsResource.java');
    this.template('src/main/java/package/web/rest/_UserResource.java', javaDir + 'web/rest/UserResource.java');

    this.template('src/main/java/package/web/servlet/_package-info.java', javaDir + 'web/servlet/package-info.java');
    this.template('src/main/java/package/web/servlet/_HealthCheckServlet.java', javaDir + 'web/servlet/HealthCheckServlet.java');

    if (this.websocket == 'atmosphere') {
        this.template('src/main/java/package/web/websocket/_ActivityService.java', javaDir + 'web/websocket/ActivityService.java');
        this.template('src/main/java/package/web/websocket/_TrackerService.java', javaDir + 'web/websocket/TrackerService.java');
        this.template('src/main/java/package/web/websocket/dto/_ActivityDTO.java', javaDir + 'web/websocket/dto/ActivityDTO.java');
        this.template('src/main/java/package/web/websocket/dto/_ActivityDTOJacksonDecoder.java', javaDir + 'web/websocket/dto/ActivityDTOJacksonDecoder.java');
    }

    // Create Test Java files
    var testDir = 'src/test/java/' + packageFolder + '/';
    var testResourceDir = 'src/test/resources/';
    this.mkdir(testDir);
    this.template('src/test/java/package/service/_UserServiceTest.java', testDir + 'service/UserServiceTest.java');
    this.template('src/test/java/package/web/rest/_AccountResourceTest.java', testDir + 'web/rest/AccountResourceTest.java');
    this.template('src/test/java/package/web/rest/_UserResourceTest.java', testDir + 'web/rest/UserResourceTest.java');

    this.template(testResourceDir + 'config/_application.yml', testResourceDir + 'config/application.yml');
    this.template(testResourceDir + '_logback.xml', testResourceDir + 'logback.xml');

    if (this.hibernateCache == "ehcache") {
        this.template(testResourceDir + '_ehcache.xml', testResourceDir + 'ehcache.xml');
    }

    // Create Webapp
    var webappDir = 'src/main/webapp/';
    this.mkdir(webappDir);

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

    // i18n
    this.template(webappDir + '/i18n/_en.json', webappDir + 'i18n/en.json');
    this.template(webappDir + '/i18n/_fr.json', webappDir + 'i18n/fr.json');
    this.template(webappDir + '/i18n/_de.json', webappDir + 'i18n/de.json');

    // Angular JS views
    this.angularAppName = _s.camelize(this.baseName) + 'App';
    this.copy(webappDir + '/views/main.html', webappDir + 'views/main.html');
    this.copy(webappDir + '/views/login.html', webappDir + 'views/login.html');
    this.copy(webappDir + '/views/logs.html', webappDir + 'views/logs.html');
    this.copy(webappDir + '/views/password.html', webappDir + 'views/password.html');
    this.copy(webappDir + '/views/settings.html', webappDir + 'views/settings.html');
    this.copy(webappDir + '/views/sessions.html', webappDir + 'views/sessions.html');
    if (this.websocket == 'atmosphere') {
        this.copy(webappDir + '/views/tracker.html', webappDir + 'views/tracker.html');
    }
    this.template(webappDir + '/views/_metrics.html', webappDir + 'views/metrics.html');

    // Index page
    this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), webappDir + '_index.html'));
    this.indexFile = this.engine(this.indexFile, this);

    // JavaScript
    this.copy(webappDir + 'scripts/http-auth-interceptor.js', webappDir + 'scripts/http-auth-interceptor.js');
    this.template(webappDir + 'scripts/_app.js', webappDir + 'scripts/app.js');
    this.template(webappDir + 'scripts/_controllers.js', webappDir + 'scripts/controllers.js');
    this.template(webappDir + 'scripts/_services.js', webappDir + 'scripts/services.js');
    this.template(webappDir + 'scripts/_directives.js', webappDir + 'scripts/directives.js');

    // Create Test Javascript files
    var testJsDir = 'src/test/javascript/';
    this.copy('src/test/javascript/karma.conf.js', testJsDir + 'karma.conf.js');
    if (this.websocket == 'atmosphere') {
        this.copy('src/test/javascript/mock/atmosphere.mock.js', testJsDir + 'mock/atmosphere.mock.js');
    }
    this.template('src/test/javascript/spec/_controllersSpec.js', testJsDir + 'spec/controllersSpec.js');
    this.template('src/test/javascript/spec/_servicesSpec.js', testJsDir + 'spec/servicesSpec.js');

    // CSS
    this.copy(webappDir + 'styles/documentation.css', webappDir + 'styles/documentation.css');
    this.copy(webappDir + 'styles/famfamfam-flags.css', webappDir + 'styles/famfamfam-flags.css');

    // Images
    this.copy(webappDir + 'images/development_ribbon.png', webappDir + 'images/development_ribbon.png');
    this.copy(webappDir + 'images/hipster.jpg', webappDir + 'images/hipster.jpg');
    this.copy(webappDir + 'images/famfamfam-flags.png', webappDir + 'images/famfamfam-flags.png');

    var indexScripts = [
        'bower_components/modernizr/modernizr.js',

        'bower_components/jquery/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-resource/angular-resource.js',
        'bower_components/angular-cookies/angular-cookies.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-translate/angular-translate.js',
        'bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
        'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',

        'scripts/http-auth-interceptor.js',

        'scripts/app.js',
        'scripts/controllers.js',
        'scripts/services.js',
        'scripts/directives.js'];

    if (this.websocket == 'atmosphere') {
        indexScripts = indexScripts.concat([
            'bower_components/atmosphere/atmosphere.js',
            'bower_components/jquery-atmosphere/jquery.atmosphere.js']);
    }   

    indexScripts = indexScripts.concat([
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
        'bower_components/sass-bootstrap/js/tab.js']);    

    this.indexFile = this.appendScripts(this.indexFile, 'scripts/scripts.js', indexScripts);
    this.write(webappDir + 'index.html', this.indexFile);

    this.config.set('baseName', this.baseName);
    this.config.set('packageName', this.packageName);
    this.config.set('packageFolder', packageFolder);
    this.config.set('hibernateCache', this.hibernateCache);
};

JhipsterGenerator.prototype.projectfiles = function projectfiles() {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
};
