'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _s = require('underscore.string'),
    shelljs = require('shelljs');

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
        '           \\_|_| /_/--\\  \\_\\/  /_/--\\     |_|_/ |_|__  \\_\\/  _)_)       \n'));

    console.log('\nWelcome to the JHipster Generator\n');

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
                    value: 'h2Memory',
                    name: 'H2 in-memory with web console'
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
	
    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.hibernateCache = this.config.get('hibernateCache');
    this.clusteredHttpSession = this.config.get('clusteredHttpSession');
    this.websocket = this.config.get('websocket');
    this.devDatabaseType = this.config.get('devDatabaseType');
    this.prodDatabaseType = this.config.get('prodDatabaseType');
    this.useCompass = this.config.get('useCompass');
	
	if (this.baseName != null &&
	    this.packageName != null &&
		this.hibernateCache != null &&
		this.clusteredHttpSession != null &&
		this.websocket != null &&
		this.devDatabaseType != null &&
		this.prodDatabaseType != null &&
		this.useCompass != null) {
	
	    console.log(chalk.green('This is an existing project, using the configuration from your .yo-rc.json file \n' +
			'to re-generate the project...\n'));
			
		cb();	
	} else {
    	this.prompt(prompts, function (props) {
			this.baseName = props.baseName;
        	this.packageName = props.packageName;
        	this.hibernateCache = props.hibernateCache;
        	this.clusteredHttpSession = props.clusteredHttpSession;
        	this.websocket = props.websocket;
        	this.devDatabaseType = props.devDatabaseType;
        	this.prodDatabaseType = props.prodDatabaseType;
        	this.useCompass = props.useCompass;

        	cb();
    	}.bind(this));
	}
};

JhipsterGenerator.prototype.app = function app() {

    this.template('_package.json', 'package.json');
    this.template('_bower.json', 'bower.json');
    this.template('_README.md', 'README.md');
    this.template('bowerrc', '.bowerrc');
    this.template('Gruntfile.js', 'Gruntfile.js');
    this.copy('gitignore', '.gitignore');

    var packageFolder = this.packageName.replace(/\./g, '/');

    this.template('_pom.xml', 'pom.xml');

    // Create Java resource files
    var resourceDir = 'src/main/resources/';
    this.mkdir(resourceDir);

    if (this.hibernateCache == "ehcache") {
        this.template(resourceDir + '_ehcache.xml', resourceDir + 'ehcache.xml');
    }

    // i18n resources used by thymeleaf
    this.copy(resourceDir + '/i18n/messages_en.properties', resourceDir + 'i18n/messages_en.properties');
    this.copy(resourceDir + '/i18n/messages_fr.properties', resourceDir + 'i18n/messages_fr.properties');
    this.copy(resourceDir + '/i18n/messages_da.properties', resourceDir + 'i18n/messages_da.properties');
    this.copy(resourceDir + '/i18n/messages_de.properties', resourceDir + 'i18n/messages_de.properties');
    this.copy(resourceDir + '/i18n/messages_pl.properties', resourceDir + 'i18n/messages_pl.properties');

    // Thymeleaf templates
    this.copy(resourceDir + '/templates/error.html', resourceDir + 'templates/error.html');

    this.template(resourceDir + '_logback.xml', resourceDir + 'logback.xml');

    this.template(resourceDir + '/config/_application.yml', resourceDir + 'config/application.yml');
    this.template(resourceDir + '/config/_application-dev.yml', resourceDir + 'config/application-dev.yml');
    this.template(resourceDir + '/config/_application-prod.yml', resourceDir + 'config/application-prod.yml');

    this.copy(resourceDir + '/config/liquibase/changelog/db-changelog-001.xml', resourceDir + 'config/liquibase/changelog/db-changelog-001.xml');
    this.copy(resourceDir + '/config/liquibase/master.xml', resourceDir + 'config/liquibase/master.xml');
    this.copy(resourceDir + '/config/liquibase/users.csv', resourceDir + 'config/liquibase/users.csv');
    this.copy(resourceDir + '/config/liquibase/authorities.csv', resourceDir + 'config/liquibase/authorities.csv');
    this.copy(resourceDir + '/config/liquibase/users_authorities.csv', resourceDir + 'config/liquibase/users_authorities.csv');

    // Create Java files
    var javaDir = 'src/main/java/' + packageFolder + '/';

    // Remove old files
    removefile(javaDir + '/web/servlet/HealthCheckServlet.java');
    removefile(javaDir + '/config/metrics/JavaMailHealthCheck.java');
    removefile('spring_loaded/springloaded.jar');
    removefolder(javaDir + '/config/reload');

    this.template('src/main/java/package/_Application.java', javaDir + '/Application.java');
    this.template('src/main/java/package/_ApplicationWebXml.java', javaDir + '/ApplicationWebXml.java');

    this.template('src/main/java/package/aop/logging/_LoggingAspect.java', javaDir + 'aop/logging/LoggingAspect.java');

    this.template('src/main/java/package/config/_package-info.java', javaDir + 'config/package-info.java');
    this.template('src/main/java/package/config/_AsyncConfiguration.java', javaDir + 'config/AsyncConfiguration.java');
    this.template('src/main/java/package/config/_CacheConfiguration.java', javaDir + 'config/CacheConfiguration.java');
    this.template('src/main/java/package/config/_Constants.java', javaDir + 'config/Constants.java');
    this.template('src/main/java/package/config/_DatabaseConfiguration.java', javaDir + 'config/DatabaseConfiguration.java');
    this.template('src/main/java/package/config/_LocaleConfiguration.java', javaDir + 'config/LocaleConfiguration.java');
    this.template('src/main/java/package/config/_LoggingAspectConfiguration.java', javaDir + 'config/LoggingAspectConfiguration.java');
    this.template('src/main/java/package/config/_MailConfiguration.java', javaDir + 'config/MailConfiguration.java');
    this.template('src/main/java/package/config/_MetricsConfiguration.java', javaDir + 'config/MetricsConfiguration.java');
    this.template('src/main/java/package/config/_SecurityConfiguration.java', javaDir + 'config/SecurityConfiguration.java');
    this.template('src/main/java/package/config/_ThymeleafConfiguration.java', javaDir + 'config/ThymeleafConfiguration.java');
    this.template('src/main/java/package/config/_WebConfigurer.java', javaDir + 'config/WebConfigurer.java');

    this.template('src/main/java/package/config/audit/_package-info.java', javaDir + 'config/audit/package-info.java');
    this.template('src/main/java/package/config/audit/_AuditEventConverter.java', javaDir + 'config/audit/AuditEventConverter.java');

    this.template('src/main/java/package/config/locale/_package-info.java', javaDir + 'config/locale/package-info.java');
    this.template('src/main/java/package/config/locale/_AngularCookieLocaleResolver.java', javaDir + 'config/locale/AngularCookieLocaleResolver.java');

    this.template('src/main/java/package/config/metrics/_package-info.java', javaDir + 'config/metrics/package-info.java');
    this.template('src/main/java/package/config/metrics/_DatabaseHealthCheckIndicator.java', javaDir + 'config/metrics/DatabaseHealthCheckIndicator.java');
    this.template('src/main/java/package/config/metrics/_HealthCheckIndicator.java', javaDir + 'config/metrics/HealthCheckIndicator.java');
    this.template('src/main/java/package/config/metrics/_JavaMailHealthCheckIndicator.java', javaDir + 'config/metrics/JavaMailHealthCheckIndicator.java');
    this.template('src/main/java/package/config/metrics/_JHipsterHealthIndicatorConfiguration.java', javaDir + 'config/metrics/JHipsterHealthIndicatorConfiguration.java');

    if (this.hibernateCache == "hazelcast") {
        this.template('src/main/java/package/config/hazelcast/_HazelcastCacheRegionFactory.java', javaDir + 'config/hazelcast/HazelcastCacheRegionFactory.java');
        this.template('src/main/java/package/config/hazelcast/_package-info.java', javaDir + 'config/hazelcast/package-info.java');
    }

    this.template('src/main/java/package/domain/_package-info.java', javaDir + 'domain/package-info.java');
    this.template('src/main/java/package/domain/_Authority.java', javaDir + 'domain/Authority.java');
    this.template('src/main/java/package/domain/_PersistentAuditEvent.java', javaDir + 'domain/PersistentAuditEvent.java');
    this.template('src/main/java/package/domain/_PersistentToken.java', javaDir + 'domain/PersistentToken.java');
    this.template('src/main/java/package/domain/_User.java', javaDir + 'domain/User.java');
    this.template('src/main/java/package/domain/util/_CustomLocalDateSerializer.java', javaDir + 'domain/util/CustomLocalDateSerializer.java');

    this.template('src/main/java/package/repository/_package-info.java', javaDir + 'repository/package-info.java');
    this.template('src/main/java/package/repository/_AuthorityRepository.java', javaDir + 'repository/AuthorityRepository.java');
    this.template('src/main/java/package/repository/_CustomAuditEventRepository.java', javaDir + 'repository/CustomAuditEventRepository.java');
    this.template('src/main/java/package/repository/_UserRepository.java', javaDir + 'repository/UserRepository.java');
    this.template('src/main/java/package/repository/_PersistentTokenRepository.java', javaDir + 'repository/PersistentTokenRepository.java');
    this.template('src/main/java/package/repository/_PersistenceAuditEventRepository.java', javaDir + 'repository/PersistenceAuditEventRepository.java');

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
    this.template('src/main/java/package/service/_AuditEventService.java', javaDir + 'service/AuditEventService.java');
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

    this.template('src/main/java/package/web/propertyeditors/_package-info.java', javaDir + 'web/propertyeditors/package-info.java');
    this.template('src/main/java/package/web/propertyeditors/_LocaleDateTimeEditor.java', javaDir + 'web/propertyeditors/LocaleDateTimeEditor.java');

    this.template('src/main/java/package/web/rest/dto/_package-info.java', javaDir + 'web/rest/dto/package-info.java');
    this.template('src/main/java/package/web/rest/dto/_LoggerDTO.java', javaDir + 'web/rest/dto/LoggerDTO.java');
    this.template('src/main/java/package/web/rest/dto/_UserDTO.java', javaDir + 'web/rest/dto/UserDTO.java');
    this.template('src/main/java/package/web/rest/_package-info.java', javaDir + 'web/rest/package-info.java');
    this.template('src/main/java/package/web/rest/_AccountResource.java', javaDir + 'web/rest/AccountResource.java');
    this.template('src/main/java/package/web/rest/_AuditResource.java', javaDir + 'web/rest/AuditResource.java');
    this.template('src/main/java/package/web/rest/_LogsResource.java', javaDir + 'web/rest/LogsResource.java');
    this.template('src/main/java/package/web/rest/_UserResource.java', javaDir + 'web/rest/UserResource.java');

    if (this.websocket == 'atmosphere') {
        this.template('src/main/java/package/web/websocket/_package-info.java', javaDir + 'web/websocket/package-info.java');
        this.template('src/main/java/package/web/websocket/_ActivityService.java', javaDir + 'web/websocket/ActivityService.java');
        this.template('src/main/java/package/web/websocket/_TrackerService.java', javaDir + 'web/websocket/TrackerService.java');
        this.template('src/main/java/package/web/websocket/dto/_package-info.java', javaDir + 'web/websocket/dto/package-info.java');
        this.template('src/main/java/package/web/websocket/dto/_ActivityDTO.java', javaDir + 'web/websocket/dto/ActivityDTO.java');
        this.template('src/main/java/package/web/websocket/dto/_ActivityDTOJacksonDecoder.java', javaDir + 'web/websocket/dto/ActivityDTOJacksonDecoder.java');
    }

    // Create Test Java files
    var testDir = 'src/test/java/' + packageFolder + '/';
    var testResourceDir = 'src/test/resources/';
    this.mkdir(testDir);
    this.template('src/test/java/package/service/_UserServiceTest.java', testDir + 'service/UserServiceTest.java');
    this.template('src/test/java/package/web/rest/_AccountResourceTest.java', testDir + 'web/rest/AccountResourceTest.java');
    this.template('src/test/java/package/web/rest/_TestUtil.java', testDir + 'web/rest/TestUtil.java');
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
    this.copy(webappDir + 'robots.txt', webappDir + 'robots.txt');
    this.copy(webappDir + 'htaccess.txt', webappDir + '.htaccess');

    // i18n
    this.template(webappDir + '/i18n/_en.json', webappDir + 'i18n/en.json');
    this.template(webappDir + '/i18n/_fr.json', webappDir + 'i18n/fr.json');
    this.template(webappDir + '/i18n/_da.json', webappDir + 'i18n/da.json');
    this.template(webappDir + '/i18n/_de.json', webappDir + 'i18n/de.json');
    this.template(webappDir + '/i18n/_pl.json', webappDir + 'i18n/pl.json');

    // Protected resources - used to check if a customer is still connected
    this.copy(webappDir + '/protected/transparent.gif', webappDir + 'transparent.gif');

    // Swagger-ui for Jhipster
    this.copy(webappDir + '/swagger-ui/index.html', webappDir + 'swagger-ui/index.html');

    // Angular JS views
    this.angularAppName = _s.camelize(_s.slugify(this.baseName)) + 'App';
    this.copy(webappDir + '/views/audits.html', webappDir + 'views/audits.html');
    this.copy(webappDir + '/views/docs.html', webappDir + 'views/docs.html');
    this.copy(webappDir + '/views/error.html', webappDir + 'views/error.html');
    this.copy(webappDir + '/views/login.html', webappDir + 'views/login.html');
    this.copy(webappDir + '/views/logs.html', webappDir + 'views/logs.html');
    this.copy(webappDir + '/views/main.html', webappDir + 'views/main.html');
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
        'bower_components/angular-dynamic-locale/src/tmhDinamicLocale.js',

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
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/affix.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/alert.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/dropdown.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/tooltip.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/modal.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/transition.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/button.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/popover.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/carousel.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/scrollspy.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/collapse.js',
        'bower_components/bootstrap-sass/vendor/assets/javascripts/bootstrap/tab.js']);

    this.indexFile = this.appendScripts(this.indexFile, 'scripts/scripts.js', indexScripts);
    this.write(webappDir + 'index.html', this.indexFile);

    this.config.set('baseName', this.baseName);
    this.config.set('packageName', this.packageName);
    this.config.set('packageFolder', packageFolder);
    this.config.set('hibernateCache', this.hibernateCache);
	this.config.set('clusteredHttpSession', this.clusteredHttpSession);
	this.config.set('websocket', this.websocket);
	this.config.set('devDatabaseType', this.devDatabaseType);
	this.config.set('prodDatabaseType', this.prodDatabaseType);
	this.config.set('useCompass', this.useCompass);
};

JhipsterGenerator.prototype.projectfiles = function projectfiles() {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
};

function removefile(file) {
    if (shelljs.test('-f', file)) {
        shelljs.rm(file);
    }
}

function removefolder(folder) {
    if (shelljs.test('-d', folder)) {
        shelljs.rm("-rf", folder);
    }
}

