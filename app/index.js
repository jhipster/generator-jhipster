'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk'),
    _s = require('underscore.string'),
    shelljs = require('shelljs'),
    scriptBase = require('../script-base'),
    packagejs = require(__dirname + '/../package.json');

var JhipsterGenerator = module.exports = function JhipsterGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        this.installDependencies({ skipInstall: options['skip-install'] });
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(JhipsterGenerator, yeoman.generators.Base);
util.inherits(JhipsterGenerator, scriptBase);

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
            validate: function (input) {
                if (/^([a-zA-Z0-9_]*)$/.test(input)) return true;
                return 'Your application name cannot contain special characters or a blank space, using the default name instead';
            },
            message: '(1/13) What is the base name of your application?',
            default: 'jhipster'
        },
        {
            type: 'input',
            name: 'packageName',
            validate: function (input) {
                if (/^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input)) return true;
                return 'The package name you have provided is not a valid Java package name.';
            },
            message: '(2/13) What is your default Java package name?',
            default: 'com.mycompany.myapp'
        },
        {
            type: 'list',
            name: 'javaVersion',
            message: '(3/13) Do you want to use Java 8?',
            choices: [
                {
                    value: '8',
                    name: 'Yes (use Java 8)'
                },
                {
                    value: '7',
                    name: 'No (use Java 7)'
                }
            ],
            default: 0
        },
        {
            type: 'list',
            name: 'authenticationType',
            message: '(4/13) Which *type* of authentication would you like to use?',
            choices: [
                {
                    value: 'cookie',
                    name: 'Cookie-Based Authentication (Session)'
                },
                {
                    value: 'token',
                    name: 'Token-Based Authentication (Oauth2)'
                }
            ],
            default: 0
        },
        {
            type: 'list',
            name: 'databaseType',
            message: '(5/13) Which *type* of database would you like to use?',
            choices: [
                {
                    value: 'sql',
                    name: 'SQL (H2, MySQL, PostgreSQL)'
                },
                {
                    value: 'nosql',
                    name: 'NoSQL (MongoDB)'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.databaseType == 'sql';
            },
            type: 'list',
            name: 'prodDatabaseType',
            message: '(6/13) Which *production* database would you like to use?',
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
            when: function (response) {
                return response.databaseType == 'nosql';
            },
            type: 'list',
            name: 'prodDatabaseType',
            message: '(6/13) Which *production* database would you like to use?',
            choices: [
                {
                    value: 'mongodb',
                    name: 'MongoDB'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.databaseType == 'sql';
            },
            type: 'list',
            name: 'devDatabaseType',
            message: '(7/13) Which *development* database would you like to use?',
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
            when: function (response) {
                return response.databaseType == 'nosql';
            },
            type: 'list',
            name: 'devDatabaseType',
            message: '(7/13) Which *development* database would you like to use?',
            choices: [
                {
                    value: 'mongodb',
                    name: 'MongoDB'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return response.databaseType == 'sql';
            },
            type: 'list',
            name: 'hibernateCache',
            message: '(8/13) Do you want to use Hibernate 2nd level cache?',
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
            when: function (response) {
                return response.databaseType == 'nosql';
            },
            type: 'list',
            name: 'hibernateCache',
            message: '(8/13) Do you want to use Hibernate 2nd level cache?',
            choices: [
                {
                    value: 'no',
                    name: 'No (this not possible with the NoSQL option)'
                },
            ],
            default: 0
        },
        {
            type: 'list',
            name: 'clusteredHttpSession',
            message: '(9/13) Do you want to use clustered HTTP sessions?',
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
            message: '(10/13) Do you want to use WebSockets?',
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
            name: 'buildTool',
            message: '(11/13) Would you like to use Maven or Gradle for building the backend?',
            choices: [
                {
                    value: 'maven',
                    name: 'Maven (recommended)'
                },
                {
                    value: 'gradle',
                    name: 'Gradle'
                }
            ],
            default: 'maven'
        },
        {
            type: 'list',
            name: 'frontendBuilder',
            choices: [
                {
                    value: 'grunt',
                    name: 'Grunt (recommended)'
                },
                {
                    value: 'gulp',
                    name: 'Gulp.js'
                }
            ],
            message: '(12/13) Would you like to use Grunt or Gulp.js for building the frontend?',
            default: 'grunt'
        },
        {
            type: 'confirm',
            name: 'useCompass',
            message: '(13/13) Would you like to use the Compass CSS Authoring Framework?',
            default: false
        }
    ];

    this.baseName = this.config.get('baseName');
    this.packageName = this.config.get('packageName');
    this.authenticationType = this.config.get('authenticationType')
    this.hibernateCache = this.config.get('hibernateCache');
    this.clusteredHttpSession = this.config.get('clusteredHttpSession');
    this.websocket = this.config.get('websocket');
    this.databaseType = this.config.get('databaseType');
    this.devDatabaseType = this.config.get('devDatabaseType');
    this.prodDatabaseType = this.config.get('prodDatabaseType');
    this.useCompass = this.config.get('useCompass');
    this.javaVersion = this.config.get('javaVersion');
    this.buildTool = this.config.get('buildTool');
    this.frontendBuilder = this.config.get('frontendBuilder');
    this.packagejs = packagejs;

    if (this.baseName != null &&
        this.packageName != null &&
        this.authenticationType != null &&
        this.hibernateCache != null &&
        this.clusteredHttpSession != null &&
        this.websocket != null &&
        this.databaseType != null &&
        this.devDatabaseType != null &&
        this.prodDatabaseType != null &&
        this.useCompass != null &&
        this.buildTool != null &&
        this.frontendBuilder != null &&
        this.javaVersion != null) {

        console.log(chalk.green('This is an existing project, using the configuration from your .yo-rc.json file \n' +
            'to re-generate the project...\n'));

        cb();
    } else {
        this.prompt(prompts, function (props) {
            this.baseName = props.baseName;
            this.packageName = props.packageName;
            this.authenticationType = props.authenticationType;
            this.hibernateCache = props.hibernateCache;
            this.clusteredHttpSession = props.clusteredHttpSession;
            this.websocket = props.websocket;
            this.databaseType = props.databaseType;
            this.devDatabaseType = props.devDatabaseType;
            this.prodDatabaseType = props.prodDatabaseType;
            this.useCompass = props.useCompass;
            this.buildTool = props.buildTool;
            this.frontendBuilder = props.frontendBuilder;
            this.javaVersion = props.javaVersion;

            cb();
        }.bind(this));
    }
};

JhipsterGenerator.prototype.app = function app() {

    var packageFolder = this.packageName.replace(/\./g, '/');
    var javaDir = 'src/main/java/' + packageFolder + '/';
    var resourceDir = 'src/main/resources/';
    var webappDir = 'src/main/webapp/';

    // Remove old files
    removefile(resourceDir + 'config/liquibase/db-changelog-001.xml');
    removefile(resourceDir + 'config/liquibase/users_upd_001.csv');
    removefile(resourceDir + 'config/liquibase/users_authorities_upd_001.csv');
    removefile(javaDir + 'web/servlet/HealthCheckServlet.java');
    removefile(javaDir + 'config/metrics/JavaMailHealthCheck.java');
    removefile(javaDir + 'config/metrics/HealthCheckIndicator.java');
    removefile(javaDir + 'config/metrics/DatabaseHealthCheckIndicator.java');
    removefile(javaDir + 'config/metrics/JavaMailHealthCheckIndicator.java');
    removefile(javaDir + 'config/metrics/DatabaseHealthCheck.java');
    removefile(javaDir + 'config/apidoc/ApiPathProvider.java');
    removefile('spring_loaded/springloaded.jar');
    removefolder(javaDir + '/config/reload');
    removefolder(javaDir + '/apidoc');
    removefile(resourceDir + 'mails/messages/messages_da.properties');
    removefile(resourceDir + 'mails/messages/messages_de.properties');
    removefile(resourceDir + 'mails/messages/messages_en.properties');
    removefile(resourceDir + 'mails/messages/messages_es.properties');
    removefile(resourceDir + 'mails/messages/messages_fr.properties');
    removefile(resourceDir + 'mails/messages/messages_kr.properties');
    removefile(resourceDir + 'mails/messages/messages_pl.properties');
    removefile(resourceDir + 'mails/messages/messages_ru.properties');
    removefile(resourceDir + 'mails/messages/messages_tr.properties');
    removefile(resourceDir + 'i18n/messages_pt.properties');
    removefile(webappDir + 'i18n/pt.json');
    removefile(webappDir + 'protected/transparent.gif');
    removefile(webappDir + 'styles/famfamfam-flags.css');
    removefile(webappDir + 'images/famfamfam-flags.png');

    // Create application
    this.template('_package.json', 'package.json');
    this.template('_bower.json', 'bower.json');
    this.template('_README.md', 'README.md');
    this.template('bowerrc', '.bowerrc');
    this.copy('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');

    switch (this.frontendBuilder) {
        case 'gulp':
            this.template('gulpfile.js', 'gulpfile.js');
            break;
        case 'grunt':
        default:
            this.template('Gruntfile.js', 'Gruntfile.js');
    }

    switch (this.buildTool) {
        case 'gradle':
            this.template('_build.gradle', 'build.gradle');
            this.template('_gradle.properties', 'gradle.properties');
            this.template('_yeoman.gradle', 'yeoman.gradle');
            this.template('_profile_dev.gradle', 'profile_dev.gradle');
            this.template('_profile_prod.gradle', 'profile_prod.gradle');
            this.template('_profile_fast.gradle', 'profile_fast.gradle');
            this.copy('gradlew', 'gradlew');
            this.copy('gradlew.bat', 'gradlew.bat');
            this.copy('gradle/wrapper/gradle-wrapper.jar', 'gradle/wrapper/gradle-wrapper.jar');
            this.copy('gradle/wrapper/gradle-wrapper.properties', 'gradle/wrapper/gradle-wrapper.properties');
            break;
        case 'maven':
        default :
            this.template('_pom.xml', 'pom.xml', null, { 'interpolate': /<%=([\s\S]+?)%>/g });
    }

    // Create Java resource files
    this.mkdir(resourceDir);
    this.copy(resourceDir + '/banner.txt', resourceDir + '/banner.txt');

    if (this.hibernateCache == "ehcache") {
        this.template(resourceDir + '_ehcache.xml', resourceDir + 'ehcache.xml');
    }
    if (this.devDatabaseType == "h2Memory") {
        this.copy(resourceDir + 'h2.server.properties', resourceDir + '.h2.server.properties');
    }

    // i18n resources used by thymeleaf
    this.copy(resourceDir + '/i18n/messages_ca.properties', resourceDir + 'i18n/messages_ca.properties');
    this.copy(resourceDir + '/i18n/messages_da.properties', resourceDir + 'i18n/messages_da.properties');
    this.copy(resourceDir + '/i18n/messages_de.properties', resourceDir + 'i18n/messages_de.properties');
    this.copy(resourceDir + '/i18n/messages_en.properties', resourceDir + 'i18n/messages_en.properties');
    this.copy(resourceDir + '/i18n/messages_es.properties', resourceDir + 'i18n/messages_es.properties');
    this.copy(resourceDir + '/i18n/messages_fr.properties', resourceDir + 'i18n/messages_fr.properties');
    this.copy(resourceDir + '/i18n/messages_kr.properties', resourceDir + 'i18n/messages_kr.properties');
    this.copy(resourceDir + '/i18n/messages_pl.properties', resourceDir + 'i18n/messages_pl.properties');
    this.copy(resourceDir + '/i18n/messages_pt_BR.properties', resourceDir + 'i18n/messages_pt_BR.properties');
    this.copy(resourceDir + '/i18n/messages_ru.properties', resourceDir + 'i18n/messages_ru.properties');
    this.copy(resourceDir + '/i18n/messages_sv.properties', resourceDir + 'i18n/messages_sv.properties');
    this.copy(resourceDir + '/i18n/messages_tr.properties', resourceDir + 'i18n/messages_tr.properties');
    this.copy(resourceDir + '/i18n/messages_zh_TW.properties', resourceDir + 'i18n/messages_zh_TW.properties');

    // Thymeleaf templates
    this.copy(resourceDir + '/templates/error.html', resourceDir + 'templates/error.html');

    this.template(resourceDir + '_logback.xml', resourceDir + 'logback.xml');

    this.template(resourceDir + '/config/_application.yml', resourceDir + 'config/application.yml');
    this.template(resourceDir + '/config/_application-dev.yml', resourceDir + 'config/application-dev.yml');
    this.template(resourceDir + '/config/_application-prod.yml', resourceDir + 'config/application-prod.yml');

    if (this.databaseType == "sql") {
        this.template(resourceDir + '/config/liquibase/changelog/_initial_schema.xml', resourceDir + 'config/liquibase/changelog/00000000000000_initial_schema.xml');
        this.copy(resourceDir + '/config/liquibase/master.xml', resourceDir + 'config/liquibase/master.xml');
        this.copy(resourceDir + '/config/liquibase/users.csv', resourceDir + 'config/liquibase/users.csv');
        this.copy(resourceDir + '/config/liquibase/authorities.csv', resourceDir + 'config/liquibase/authorities.csv');
        this.copy(resourceDir + '/config/liquibase/users_authorities.csv', resourceDir + 'config/liquibase/users_authorities.csv');
    }

    if (this.databaseType == "nosql") {
        this.copy(resourceDir + '/config/mongeez/authorities.xml', resourceDir + 'config/mongeez/authorities.xml');
        this.copy(resourceDir + '/config/mongeez/master.xml', resourceDir + 'config/mongeez/master.xml');
        this.copy(resourceDir + '/config/mongeez/users.xml', resourceDir + 'config/mongeez/users.xml');
    }

    // Create mail templates
    this.copy(resourceDir + '/mails/activationEmail.html', resourceDir + 'mails/activationEmail.html');

    // Create Java files
    this.template('src/main/java/package/_Application.java', javaDir + '/Application.java');
    this.template('src/main/java/package/_ApplicationWebXml.java', javaDir + '/ApplicationWebXml.java');

    this.template('src/main/java/package/aop/logging/_LoggingAspect.java', javaDir + 'aop/logging/LoggingAspect.java');

    this.template('src/main/java/package/config/apidoc/_package-info.java', javaDir + 'config/apidoc/package-info.java');
    this.template('src/main/java/package/config/apidoc/_SwaggerConfiguration.java', javaDir + 'config/apidoc/SwaggerConfiguration.java');

    this.template('src/main/java/package/async/_package-info.java', javaDir + 'async/package-info.java');
    this.template('src/main/java/package/async/_ExceptionHandlingAsyncTaskExecutor.java', javaDir + 'async/ExceptionHandlingAsyncTaskExecutor.java');

    this.template('src/main/java/package/config/_package-info.java', javaDir + 'config/package-info.java');
    this.template('src/main/java/package/config/_AsyncConfiguration.java', javaDir + 'config/AsyncConfiguration.java');
    this.template('src/main/java/package/config/_CacheConfiguration.java', javaDir + 'config/CacheConfiguration.java');
    this.template('src/main/java/package/config/_Constants.java', javaDir + 'config/Constants.java');
    this.template('src/main/java/package/config/_CloudDatabaseConfiguration.java', javaDir + 'config/CloudDatabaseConfiguration.java');
    if (this.databaseType == 'nosql') {
        this.template('src/main/java/package/config/_CloudMongoDbConfiguration.java', javaDir + 'config/CloudMongoDbConfiguration.java');
    }
    this.template('src/main/java/package/config/_DatabaseConfiguration.java', javaDir + 'config/DatabaseConfiguration.java');
    this.template('src/main/java/package/config/_LocaleConfiguration.java', javaDir + 'config/LocaleConfiguration.java');
    this.template('src/main/java/package/config/_LoggingAspectConfiguration.java', javaDir + 'config/LoggingAspectConfiguration.java');
    this.template('src/main/java/package/config/_MailConfiguration.java', javaDir + 'config/MailConfiguration.java');
    this.template('src/main/java/package/config/_MetricsConfiguration.java', javaDir + 'config/MetricsConfiguration.java');

    if (this.authenticationType == 'token') {
        this.template('src/main/java/package/config/_OAuth2ServerConfiguration.java', javaDir + 'config/OAuth2ServerConfiguration.java');
    }

    if (this.databaseType == 'nosql' &&  this.authenticationType == 'token') {
        this.template('src/main/java/package/config/oauth2/_OAuth2AuthenticationReadConverter.java', javaDir + 'config/oauth2/OAuth2AuthenticationReadConverter.java');
        this.template('src/main/java/package/config/oauth2/_MongoDBTokenStore.java', javaDir + 'config/oauth2/MongoDBTokenStore.java');
        this.template('src/main/java/package/domain/_OAuth2AuthenticationAccessToken.java', javaDir + 'domain/OAuth2AuthenticationAccessToken.java');
        this.template('src/main/java/package/domain/_OAuth2AuthenticationRefreshToken.java', javaDir + 'domain/OAuth2AuthenticationRefreshToken.java');
        this.template('src/main/java/package/repository/_OAuth2AccessTokenRepository.java', javaDir + 'repository/OAuth2AccessTokenRepository.java');
        this.template('src/main/java/package/repository/_OAuth2RefreshTokenRepository.java', javaDir + 'repository/OAuth2RefreshTokenRepository.java');
    }

    this.template('src/main/java/package/config/_SecurityConfiguration.java', javaDir + 'config/SecurityConfiguration.java');
    this.template('src/main/java/package/config/_ThymeleafConfiguration.java', javaDir + 'config/ThymeleafConfiguration.java');
    this.template('src/main/java/package/config/_WebConfigurer.java', javaDir + 'config/WebConfigurer.java');

    this.template('src/main/java/package/config/audit/_package-info.java', javaDir + 'config/audit/package-info.java');
    this.template('src/main/java/package/config/audit/_AuditEventConverter.java', javaDir + 'config/audit/AuditEventConverter.java');

    this.template('src/main/java/package/config/locale/_package-info.java', javaDir + 'config/locale/package-info.java');
    this.template('src/main/java/package/config/locale/_AngularCookieLocaleResolver.java', javaDir + 'config/locale/AngularCookieLocaleResolver.java');

    this.template('src/main/java/package/config/metrics/_package-info.java', javaDir + 'config/metrics/package-info.java');
    this.template('src/main/java/package/config/metrics/_DatabaseHealthIndicator.java', javaDir + 'config/metrics/DatabaseHealthIndicator.java');
    this.template('src/main/java/package/config/metrics/_JavaMailHealthIndicator.java', javaDir + 'config/metrics/JavaMailHealthIndicator.java');
    this.template('src/main/java/package/config/metrics/_JHipsterHealthIndicatorConfiguration.java', javaDir + 'config/metrics/JHipsterHealthIndicatorConfiguration.java');

    if (this.hibernateCache == "hazelcast") {
        this.template('src/main/java/package/config/hazelcast/_HazelcastCacheRegionFactory.java', javaDir + 'config/hazelcast/HazelcastCacheRegionFactory.java');
        this.template('src/main/java/package/config/hazelcast/_package-info.java', javaDir + 'config/hazelcast/package-info.java');
    }

    this.template('src/main/java/package/domain/_package-info.java', javaDir + 'domain/package-info.java');
    this.template('src/main/java/package/domain/_AbstractAuditingEntity.java', javaDir + 'domain/AbstractAuditingEntity.java');
    this.template('src/main/java/package/domain/_Authority.java', javaDir + 'domain/Authority.java');
    this.template('src/main/java/package/domain/_PersistentAuditEvent.java', javaDir + 'domain/PersistentAuditEvent.java');
    if (this.authenticationType == 'cookie') {
        this.template('src/main/java/package/domain/_PersistentToken.java', javaDir + 'domain/PersistentToken.java');
    }
    this.template('src/main/java/package/domain/_User.java', javaDir + 'domain/User.java');
    this.template('src/main/java/package/domain/util/_CustomLocalDateSerializer.java', javaDir + 'domain/util/CustomLocalDateSerializer.java');
    this.template('src/main/java/package/domain/util/_CustomDateTimeSerializer.java', javaDir + 'domain/util/CustomDateTimeSerializer.java');
    this.template('src/main/java/package/domain/util/_CustomDateTimeDeserializer.java', javaDir + 'domain/util/CustomDateTimeDeserializer.java');

    this.template('src/main/java/package/repository/_package-info.java', javaDir + 'repository/package-info.java');
    this.template('src/main/java/package/repository/_AuthorityRepository.java', javaDir + 'repository/AuthorityRepository.java');
    this.template('src/main/java/package/repository/_CustomAuditEventRepository.java', javaDir + 'repository/CustomAuditEventRepository.java');

    this.template('src/main/java/package/repository/_UserRepository.java', javaDir + 'repository/UserRepository.java');
    if (this.authenticationType == 'cookie') {
        this.template('src/main/java/package/repository/_PersistentTokenRepository.java', javaDir + 'repository/PersistentTokenRepository.java');
    }
    this.template('src/main/java/package/repository/_PersistenceAuditEventRepository.java', javaDir + 'repository/PersistenceAuditEventRepository.java');

    this.template('src/main/java/package/security/_package-info.java', javaDir + 'security/package-info.java');
    this.template('src/main/java/package/security/_AjaxAuthenticationFailureHandler.java', javaDir + 'security/AjaxAuthenticationFailureHandler.java');
    this.template('src/main/java/package/security/_AjaxAuthenticationSuccessHandler.java', javaDir + 'security/AjaxAuthenticationSuccessHandler.java');
    this.template('src/main/java/package/security/_AjaxLogoutSuccessHandler.java', javaDir + 'security/AjaxLogoutSuccessHandler.java');
    this.template('src/main/java/package/security/_AuthoritiesConstants.java', javaDir + 'security/AuthoritiesConstants.java');
    if (this.authenticationType == 'cookie') {
        this.template('src/main/java/package/security/_CustomPersistentRememberMeServices.java', javaDir + 'security/CustomPersistentRememberMeServices.java');
    }
    this.template('src/main/java/package/security/_Http401UnauthorizedEntryPoint.java', javaDir + 'security/Http401UnauthorizedEntryPoint.java');
    this.template('src/main/java/package/security/_SecurityUtils.java', javaDir + 'security/SecurityUtils.java');
    this.template('src/main/java/package/security/_SpringSecurityAuditorAware.java', javaDir + 'security/SpringSecurityAuditorAware.java');
    this.template('src/main/java/package/security/_UserDetailsService.java', javaDir + 'security/UserDetailsService.java');
    this.template('src/main/java/package/security/_UserNotActivatedException.java', javaDir + 'security/UserNotActivatedException.java');

    this.template('src/main/java/package/service/_package-info.java', javaDir + 'service/package-info.java');
    this.template('src/main/java/package/service/_AuditEventService.java', javaDir + 'service/AuditEventService.java');
    this.template('src/main/java/package/service/_UserService.java', javaDir + 'service/UserService.java');
    this.template('src/main/java/package/service/_MailService.java', javaDir + 'service/MailService.java');
    this.template('src/main/java/package/service/util/_RandomUtil.java', javaDir + 'service/util/RandomUtil.java');

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

    if (this.databaseType == "nosql") {
        this.template('src/test/java/package/config/_MongoConfiguration.java', testDir + 'config/MongoConfiguration.java');
    }

    this.template('src/test/java/package/service/_UserServiceTest.java', testDir + 'service/UserServiceTest.java');
    this.template('src/test/java/package/web/rest/_AccountResourceTest.java', testDir + 'web/rest/AccountResourceTest.java');
    this.template('src/test/java/package/web/rest/_TestUtil.java', testDir + 'web/rest/TestUtil.java');
    this.template('src/test/java/package/web/rest/_UserResourceTest.java', testDir + 'web/rest/UserResourceTest.java');

    this.template(testResourceDir + 'config/_application.yml', testResourceDir + 'config/application.yml');
    this.template(testResourceDir + '_logback-test.xml', testResourceDir + 'logback-test.xml');

    if (this.hibernateCache == "ehcache") {
        this.template(testResourceDir + '_ehcache.xml', testResourceDir + 'ehcache.xml');
    }

    // Create Webapp
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
    this.template(webappDir + '/i18n/_ca.json', webappDir + 'i18n/ca.json');
    this.template(webappDir + '/i18n/_da.json', webappDir + 'i18n/da.json');
    this.template(webappDir + '/i18n/_de.json', webappDir + 'i18n/de.json');
    this.template(webappDir + '/i18n/_en.json', webappDir + 'i18n/en.json');
    this.template(webappDir + '/i18n/_es.json', webappDir + 'i18n/es.json');
    this.template(webappDir + '/i18n/_fr.json', webappDir + 'i18n/fr.json');
    this.template(webappDir + '/i18n/_kr.json', webappDir + 'i18n/kr.json');
    this.template(webappDir + '/i18n/_pl.json', webappDir + 'i18n/pl.json');
    this.template(webappDir + '/i18n/_pt-br.json', webappDir + 'i18n/pt-br.json');
    this.template(webappDir + '/i18n/_ru.json', webappDir + 'i18n/ru.json');
    this.template(webappDir + '/i18n/_sv.json', webappDir + 'i18n/sv.json');
    this.template(webappDir + '/i18n/_tr.json', webappDir + 'i18n/tr.json');
    this.template(webappDir + '/i18n/_zh-tw.json', webappDir + 'i18n/zh-tw.json');


    // Protected resources - used to check if a customer is still connected
    this.copy(webappDir + '/protected/authentication_check.gif', webappDir + '/protected/authentication_check.gif');

    // Swagger-ui for Jhipster
    this.template(webappDir + '/swagger-ui/_index.html', webappDir + 'swagger-ui/index.html');
    this.copy(webappDir + '/swagger-ui/images/throbber.gif', webappDir + 'swagger-ui/images/throbber.gif');

    // Angular JS views
    this.angularAppName = _s.camelize(_s.slugify(this.baseName)) + 'App';
    this.copy(webappDir + '/views/activate.html', webappDir + 'views/activate.html');
    this.copy(webappDir + '/views/audits.html', webappDir + 'views/audits.html');
    this.copy(webappDir + '/views/configuration.html', webappDir + 'views/configuration.html');
    this.copy(webappDir + '/views/docs.html', webappDir + 'views/docs.html');
    this.copy(webappDir + '/views/error.html', webappDir + 'views/error.html');
    this.copy(webappDir + '/views/health.html', webappDir + 'views/health.html');
    this.copy(webappDir + '/views/login.html', webappDir + 'views/login.html');
    this.copy(webappDir + '/views/logs.html', webappDir + 'views/logs.html');
    this.copy(webappDir + '/views/main.html', webappDir + 'views/main.html');
    this.copy(webappDir + '/views/password.html', webappDir + 'views/password.html');
    this.copy(webappDir + '/views/register.html', webappDir + 'views/register.html');
    this.copy(webappDir + '/views/settings.html', webappDir + 'views/settings.html');
    if (this.authenticationType == 'cookie') {
        this.copy(webappDir + '/views/sessions.html', webappDir + 'views/sessions.html');
    }
    if (this.websocket == 'atmosphere') {
        this.copy(webappDir + '/views/tracker.html', webappDir + 'views/tracker.html');
    }
    this.template(webappDir + '/views/_metrics.html', webappDir + 'views/metrics.html');

    // Index page
    this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), webappDir + '_index.html'));
    this.indexFile = this.engine(this.indexFile, this);

    // JavaScript
    this.copy(webappDir + 'scripts/http-auth-interceptor.js', webappDir + 'scripts/http-auth-interceptor.js');
    this.copy(webappDir + 'scripts/truncate.js', webappDir + 'scripts/truncate.js');
    this.template(webappDir + 'scripts/_app.js', webappDir + 'scripts/app.js');
    this.template(webappDir + 'scripts/_constants.js', webappDir + 'scripts/constants.js');
    this.template(webappDir + 'scripts/_controllers.js', webappDir + 'scripts/controllers.js');
    this.template(webappDir + 'scripts/_services.js', webappDir + 'scripts/services.js');
    this.template(webappDir + 'scripts/_directives.js', webappDir + 'scripts/directives.js');
    this.template(webappDir + 'scripts/_utils.js', webappDir + 'scripts/utils.js');

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

    // Images
    this.copy(webappDir + 'images/development_ribbon.png', webappDir + 'images/development_ribbon.png');
    this.copy(webappDir + 'images/hipster.png', webappDir + 'images/hipster.png');
    this.copy(webappDir + 'images/hipster2x.png', webappDir + 'images/hipster2x.png');

    var indexScripts = [
        'bower_components/modernizr/modernizr.js',
        'bower_components/jquery/dist/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-resource/angular-resource.js',
        'bower_components/angular-cookies/angular-cookies.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-translate/angular-translate.js',
        'bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
        'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
        'bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
        'bower_components/angular-cache-buster/angular-cache-buster.js',

        'scripts/http-auth-interceptor.js',
        'scripts/truncate.js',
        'scripts/utils.js',
        'scripts/app.js',
        'scripts/constants.js',
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
    this.config.set('authenticationType', this.authenticationType);
    this.config.set('hibernateCache', this.hibernateCache);
    this.config.set('clusteredHttpSession', this.clusteredHttpSession);
    this.config.set('websocket', this.websocket);
    this.config.set('databaseType', this.databaseType);
    this.config.set('devDatabaseType', this.devDatabaseType);
    this.config.set('prodDatabaseType', this.prodDatabaseType);
    this.config.set('useCompass', this.useCompass);
    this.config.set('buildTool', this.buildTool);
    this.config.set('frontendBuilder', this.frontendBuilder);
    this.config.set('javaVersion', this.javaVersion);
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
