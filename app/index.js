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
    this.authenticationType = this.config.get('authenticationType');
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

    // Angular JS app
    this.angularAppName = _s.camelize(_s.slugify(this.baseName)) + 'App';

    // Create application
    this.template('_package.json', 'package.json', this, {});
    this.template('_bower.json', 'bower.json', this, {});
    this.template('_README.md', 'README.md', this, {});
    this.template('bowerrc', '.bowerrc', this, {});
    this.copy('gitignore', '.gitignore');
    this.copy('gitattributes', '.gitattributes');

    switch (this.frontendBuilder) {
        case 'gulp':
            this.template('gulpfile.js', 'gulpfile.js', this, {});
            break;
        case 'grunt':
        default:
            this.template('Gruntfile.js', 'Gruntfile.js', this, {});
    }

    switch (this.buildTool) {
        case 'gradle':
            this.template('_build.gradle', 'build.gradle', this, {});
            this.template('_gradle.properties', 'gradle.properties', this, {});
            this.template('_yeoman.gradle', 'yeoman.gradle', this, {});
            this.template('_profile_dev.gradle', 'profile_dev.gradle', this, {});
            this.template('_profile_prod.gradle', 'profile_prod.gradle', this, {});
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
        this.template(resourceDir + '_ehcache.xml', resourceDir + 'ehcache.xml', this, {});
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

    this.template(resourceDir + '_logback.xml', resourceDir + 'logback.xml', this, {});

    this.template(resourceDir + '/config/_application.yml', resourceDir + 'config/application.yml', this, {});
    this.template(resourceDir + '/config/_application-dev.yml', resourceDir + 'config/application-dev.yml', this, {});
    this.template(resourceDir + '/config/_application-prod.yml', resourceDir + 'config/application-prod.yml', this, {});

    if (this.databaseType == "sql") {
        this.template(resourceDir + '/config/liquibase/changelog/_initial_schema.xml', resourceDir + 'config/liquibase/changelog/00000000000000_initial_schema.xml', this, {});
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
    this.template('src/main/java/package/_Application.java', javaDir + '/Application.java', this, {});
    this.template('src/main/java/package/_ApplicationWebXml.java', javaDir + '/ApplicationWebXml.java', this, {});

    this.template('src/main/java/package/aop/logging/_LoggingAspect.java', javaDir + 'aop/logging/LoggingAspect.java', this, {});

    this.template('src/main/java/package/config/apidoc/_package-info.java', javaDir + 'config/apidoc/package-info.java', this, {});
    this.template('src/main/java/package/config/apidoc/_SwaggerConfiguration.java', javaDir + 'config/apidoc/SwaggerConfiguration.java', this, {});

    this.template('src/main/java/package/async/_package-info.java', javaDir + 'async/package-info.java', this, {});
    this.template('src/main/java/package/async/_ExceptionHandlingAsyncTaskExecutor.java', javaDir + 'async/ExceptionHandlingAsyncTaskExecutor.java', this, {});

    this.template('src/main/java/package/config/_package-info.java', javaDir + 'config/package-info.java', this, {});
    this.template('src/main/java/package/config/_AsyncConfiguration.java', javaDir + 'config/AsyncConfiguration.java', this, {});
    this.template('src/main/java/package/config/_CacheConfiguration.java', javaDir + 'config/CacheConfiguration.java', this, {});
    this.template('src/main/java/package/config/_Constants.java', javaDir + 'config/Constants.java', this, {});
    this.template('src/main/java/package/config/_CloudDatabaseConfiguration.java', javaDir + 'config/CloudDatabaseConfiguration.java', this, {});
    if (this.databaseType == 'nosql') {
        this.template('src/main/java/package/config/_CloudMongoDbConfiguration.java', javaDir + 'config/CloudMongoDbConfiguration.java', this, {});
    }
    this.template('src/main/java/package/config/_DatabaseConfiguration.java', javaDir + 'config/DatabaseConfiguration.java', this, {});
    this.template('src/main/java/package/config/_LocaleConfiguration.java', javaDir + 'config/LocaleConfiguration.java', this, {});
    this.template('src/main/java/package/config/_LoggingAspectConfiguration.java', javaDir + 'config/LoggingAspectConfiguration.java', this, {});
    this.template('src/main/java/package/config/_MailConfiguration.java', javaDir + 'config/MailConfiguration.java', this, {});
    this.template('src/main/java/package/config/_MetricsConfiguration.java', javaDir + 'config/MetricsConfiguration.java', this, {});

    if (this.authenticationType == 'token') {
        this.template('src/main/java/package/config/_OAuth2ServerConfiguration.java', javaDir + 'config/OAuth2ServerConfiguration.java', this, {});
    }

    if (this.databaseType == 'nosql' &&  this.authenticationType == 'token') {
        this.template('src/main/java/package/config/oauth2/_OAuth2AuthenticationReadConverter.java', javaDir + 'config/oauth2/OAuth2AuthenticationReadConverter.java', this, {});
        this.template('src/main/java/package/config/oauth2/_MongoDBTokenStore.java', javaDir + 'config/oauth2/MongoDBTokenStore.java', this, {});
        this.template('src/main/java/package/domain/_OAuth2AuthenticationAccessToken.java', javaDir + 'domain/OAuth2AuthenticationAccessToken.java', this, {});
        this.template('src/main/java/package/domain/_OAuth2AuthenticationRefreshToken.java', javaDir + 'domain/OAuth2AuthenticationRefreshToken.java', this, {});
        this.template('src/main/java/package/repository/_OAuth2AccessTokenRepository.java', javaDir + 'repository/OAuth2AccessTokenRepository.java', this, {});
        this.template('src/main/java/package/repository/_OAuth2RefreshTokenRepository.java', javaDir + 'repository/OAuth2RefreshTokenRepository.java', this, {});
    }

    this.template('src/main/java/package/config/_SecurityConfiguration.java', javaDir + 'config/SecurityConfiguration.java', this, {});
    this.template('src/main/java/package/config/_ThymeleafConfiguration.java', javaDir + 'config/ThymeleafConfiguration.java', this, {});
    this.template('src/main/java/package/config/_WebConfigurer.java', javaDir + 'config/WebConfigurer.java', this, {});

    this.template('src/main/java/package/config/audit/_package-info.java', javaDir + 'config/audit/package-info.java', this, {});
    this.template('src/main/java/package/config/audit/_AuditEventConverter.java', javaDir + 'config/audit/AuditEventConverter.java', this, {});

    this.template('src/main/java/package/config/locale/_package-info.java', javaDir + 'config/locale/package-info.java', this, {});
    this.template('src/main/java/package/config/locale/_AngularCookieLocaleResolver.java', javaDir + 'config/locale/AngularCookieLocaleResolver.java', this, {});

    this.template('src/main/java/package/config/metrics/_package-info.java', javaDir + 'config/metrics/package-info.java', this, {});
    this.template('src/main/java/package/config/metrics/_DatabaseHealthIndicator.java', javaDir + 'config/metrics/DatabaseHealthIndicator.java', this, {});
    this.template('src/main/java/package/config/metrics/_JavaMailHealthIndicator.java', javaDir + 'config/metrics/JavaMailHealthIndicator.java', this, {});
    this.template('src/main/java/package/config/metrics/_JHipsterHealthIndicatorConfiguration.java', javaDir + 'config/metrics/JHipsterHealthIndicatorConfiguration.java', this, {});

    if (this.hibernateCache == "hazelcast") {
        this.template('src/main/java/package/config/hazelcast/_HazelcastCacheRegionFactory.java', javaDir + 'config/hazelcast/HazelcastCacheRegionFactory.java', this, {});
        this.template('src/main/java/package/config/hazelcast/_package-info.java', javaDir + 'config/hazelcast/package-info.java', this, {});
    }

    this.template('src/main/java/package/domain/_package-info.java', javaDir + 'domain/package-info.java', this, {});
    this.template('src/main/java/package/domain/_AbstractAuditingEntity.java', javaDir + 'domain/AbstractAuditingEntity.java', this, {});
    this.template('src/main/java/package/domain/_Authority.java', javaDir + 'domain/Authority.java', this, {});
    this.template('src/main/java/package/domain/_PersistentAuditEvent.java', javaDir + 'domain/PersistentAuditEvent.java', this, {});
    this.template('src/main/java/package/domain/_PersistentToken.java', javaDir + 'domain/PersistentToken.java', this, {});
    this.template('src/main/java/package/domain/_User.java', javaDir + 'domain/User.java', this, {});
    this.template('src/main/java/package/domain/util/_CustomLocalDateSerializer.java', javaDir + 'domain/util/CustomLocalDateSerializer.java', this, {});
    this.template('src/main/java/package/domain/util/_CustomDateTimeSerializer.java', javaDir + 'domain/util/CustomDateTimeSerializer.java', this, {});
    this.template('src/main/java/package/domain/util/_CustomDateTimeDeserializer.java', javaDir + 'domain/util/CustomDateTimeDeserializer.java', this, {});
    this.template('src/main/java/package/domain/util/_ISO8601LocalDateDeserializer.java', javaDir + 'domain/util/ISO8601LocalDateDeserializer.java', this, {});

    this.template('src/main/java/package/repository/_package-info.java', javaDir + 'repository/package-info.java', this, {});
    this.template('src/main/java/package/repository/_AuthorityRepository.java', javaDir + 'repository/AuthorityRepository.java', this, {});
    this.template('src/main/java/package/repository/_CustomAuditEventRepository.java', javaDir + 'repository/CustomAuditEventRepository.java', this, {});

    this.template('src/main/java/package/repository/_UserRepository.java', javaDir + 'repository/UserRepository.java', this, {});
    if (this.authenticationType == 'cookie') {
        this.template('src/main/java/package/repository/_PersistentTokenRepository.java', javaDir + 'repository/PersistentTokenRepository.java', this, {});
    }
    this.template('src/main/java/package/repository/_PersistenceAuditEventRepository.java', javaDir + 'repository/PersistenceAuditEventRepository.java', this, {});

    this.template('src/main/java/package/security/_package-info.java', javaDir + 'security/package-info.java', this, {});
    this.template('src/main/java/package/security/_AjaxAuthenticationFailureHandler.java', javaDir + 'security/AjaxAuthenticationFailureHandler.java', this, {});
    this.template('src/main/java/package/security/_AjaxAuthenticationSuccessHandler.java', javaDir + 'security/AjaxAuthenticationSuccessHandler.java', this, {});
    this.template('src/main/java/package/security/_AjaxLogoutSuccessHandler.java', javaDir + 'security/AjaxLogoutSuccessHandler.java', this, {});
    this.template('src/main/java/package/security/_AuthoritiesConstants.java', javaDir + 'security/AuthoritiesConstants.java', this, {});
    if (this.authenticationType == 'cookie') {
        this.template('src/main/java/package/security/_CustomPersistentRememberMeServices.java', javaDir + 'security/CustomPersistentRememberMeServices.java', this, {});
    }
    this.template('src/main/java/package/security/_Http401UnauthorizedEntryPoint.java', javaDir + 'security/Http401UnauthorizedEntryPoint.java', this, {});
    this.template('src/main/java/package/security/_SecurityUtils.java', javaDir + 'security/SecurityUtils.java', this, {});
    this.template('src/main/java/package/security/_SpringSecurityAuditorAware.java', javaDir + 'security/SpringSecurityAuditorAware.java', this, {});
    this.template('src/main/java/package/security/_UserDetailsService.java', javaDir + 'security/UserDetailsService.java', this, {});
    this.template('src/main/java/package/security/_UserNotActivatedException.java', javaDir + 'security/UserNotActivatedException.java', this, {});

    this.template('src/main/java/package/service/_package-info.java', javaDir + 'service/package-info.java', this, {});
    this.template('src/main/java/package/service/_AuditEventService.java', javaDir + 'service/AuditEventService.java', this, {});
    this.template('src/main/java/package/service/_UserService.java', javaDir + 'service/UserService.java', this, {});
    this.template('src/main/java/package/service/_MailService.java', javaDir + 'service/MailService.java', this, {});
    this.template('src/main/java/package/service/util/_RandomUtil.java', javaDir + 'service/util/RandomUtil.java', this, {});

    this.template('src/main/java/package/web/filter/_package-info.java', javaDir + 'web/filter/package-info.java', this, {});
    this.template('src/main/java/package/web/filter/_CachingHttpHeadersFilter.java', javaDir + 'web/filter/CachingHttpHeadersFilter.java', this, {});
    this.template('src/main/java/package/web/filter/_StaticResourcesProductionFilter.java', javaDir + 'web/filter/StaticResourcesProductionFilter.java', this, {});

    this.template('src/main/java/package/web/filter/gzip/_package-info.java', javaDir + 'web/filter/gzip/package-info.java', this, {});
    this.template('src/main/java/package/web/filter/gzip/_GzipResponseHeadersNotModifiableException.java', javaDir + 'web/filter/gzip/GzipResponseHeadersNotModifiableException.java', this, {});
    this.template('src/main/java/package/web/filter/gzip/_GZipResponseUtil.java', javaDir + 'web/filter/gzip/GZipResponseUtil.java', this, {});
    this.template('src/main/java/package/web/filter/gzip/_GZipServletFilter.java', javaDir + 'web/filter/gzip/GZipServletFilter.java', this, {});
    this.template('src/main/java/package/web/filter/gzip/_GZipServletOutputStream.java', javaDir + 'web/filter/gzip/GZipServletOutputStream.java', this, {});
    this.template('src/main/java/package/web/filter/gzip/_GZipServletResponseWrapper.java', javaDir + 'web/filter/gzip/GZipServletResponseWrapper.java', this, {});

    this.template('src/main/java/package/web/propertyeditors/_package-info.java', javaDir + 'web/propertyeditors/package-info.java', this, {});
    this.template('src/main/java/package/web/propertyeditors/_LocaleDateTimeEditor.java', javaDir + 'web/propertyeditors/LocaleDateTimeEditor.java', this, {});

    this.template('src/main/java/package/web/rest/dto/_package-info.java', javaDir + 'web/rest/dto/package-info.java', this, {});
    this.template('src/main/java/package/web/rest/dto/_LoggerDTO.java', javaDir + 'web/rest/dto/LoggerDTO.java', this, {});
    this.template('src/main/java/package/web/rest/dto/_UserDTO.java', javaDir + 'web/rest/dto/UserDTO.java', this, {});
    this.template('src/main/java/package/web/rest/_package-info.java', javaDir + 'web/rest/package-info.java', this, {});
    this.template('src/main/java/package/web/rest/_AccountResource.java', javaDir + 'web/rest/AccountResource.java', this, {});
    this.template('src/main/java/package/web/rest/_AuditResource.java', javaDir + 'web/rest/AuditResource.java', this, {});
    this.template('src/main/java/package/web/rest/_LogsResource.java', javaDir + 'web/rest/LogsResource.java', this, {});
    this.template('src/main/java/package/web/rest/_UserResource.java', javaDir + 'web/rest/UserResource.java', this, {});

    if (this.websocket == 'atmosphere') {
        this.template('src/main/java/package/web/websocket/_package-info.java', javaDir + 'web/websocket/package-info.java', this, {});
        this.template('src/main/java/package/web/websocket/_ActivityService.java', javaDir + 'web/websocket/ActivityService.java', this, {});
        this.template('src/main/java/package/web/websocket/_TrackerService.java', javaDir + 'web/websocket/TrackerService.java', this, {});
        this.template('src/main/java/package/web/websocket/dto/_package-info.java', javaDir + 'web/websocket/dto/package-info.java', this, {});
        this.template('src/main/java/package/web/websocket/dto/_ActivityDTO.java', javaDir + 'web/websocket/dto/ActivityDTO.java', this, {});
        this.template('src/main/java/package/web/websocket/dto/_ActivityDTOJacksonDecoder.java', javaDir + 'web/websocket/dto/ActivityDTOJacksonDecoder.java', this, {});
    }

    // Create Test Java files
    var testDir = 'src/test/java/' + packageFolder + '/';
    var testResourceDir = 'src/test/resources/';
    this.mkdir(testDir);

    if (this.databaseType == "nosql") {
        this.template('src/test/java/package/config/_MongoConfiguration.java', testDir + 'config/MongoConfiguration.java', this, {});
    }

    this.template('src/test/java/package/service/_UserServiceTest.java', testDir + 'service/UserServiceTest.java', this, {});
    this.template('src/test/java/package/web/rest/_AccountResourceTest.java', testDir + 'web/rest/AccountResourceTest.java', this, {});
    this.template('src/test/java/package/web/rest/_TestUtil.java', testDir + 'web/rest/TestUtil.java', this, {});
    this.template('src/test/java/package/web/rest/_UserResourceTest.java', testDir + 'web/rest/UserResourceTest.java', this, {});

    this.template(testResourceDir + 'config/_application.yml', testResourceDir + 'config/application.yml', this, {});
    this.template(testResourceDir + '_logback-test.xml', testResourceDir + 'logback-test.xml', this, {});

    if (this.hibernateCache == "ehcache") {
        this.template(testResourceDir + '_ehcache.xml', testResourceDir + 'ehcache.xml', this, {});
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
    this.template(webappDir + '/i18n/_ca.json', webappDir + 'i18n/ca.json', this, {});
    this.template(webappDir + '/i18n/_da.json', webappDir + 'i18n/da.json', this, {});
    this.template(webappDir + '/i18n/_de.json', webappDir + 'i18n/de.json', this, {});
    this.template(webappDir + '/i18n/_en.json', webappDir + 'i18n/en.json', this, {});
    this.template(webappDir + '/i18n/_es.json', webappDir + 'i18n/es.json', this, {});
    this.template(webappDir + '/i18n/_fr.json', webappDir + 'i18n/fr.json', this, {});
    this.template(webappDir + '/i18n/_kr.json', webappDir + 'i18n/kr.json', this, {});
    this.template(webappDir + '/i18n/_pl.json', webappDir + 'i18n/pl.json', this, {});
    this.template(webappDir + '/i18n/_pt-br.json', webappDir + 'i18n/pt-br.json', this, {});
    this.template(webappDir + '/i18n/_ru.json', webappDir + 'i18n/ru.json', this, {});
    this.template(webappDir + '/i18n/_sv.json', webappDir + 'i18n/sv.json', this, {});
    this.template(webappDir + '/i18n/_tr.json', webappDir + 'i18n/tr.json', this, {});
    this.template(webappDir + '/i18n/_zh-tw.json', webappDir + 'i18n/zh-tw.json', this, {});


    // Protected resources - used to check if a customer is still connected
    this.copy(webappDir + '/protected/authentication_check.gif', webappDir + '/protected/authentication_check.gif');

    // Swagger-ui for Jhipster
    this.template(webappDir + '/swagger-ui/_index.html', webappDir + 'swagger-ui/index.html', this, {});
    this.copy(webappDir + '/swagger-ui/images/throbber.gif', webappDir + 'swagger-ui/images/throbber.gif');

    // Angular JS views
    this.template(webappDir + '/_app.js', webappDir + 'app.js', this, {});
    // Client Components
    this.template(webappDir + '/components/admin/_audits.service.js', webappDir + 'components/admin/audits.service.js', this, {});
    this.template(webappDir + '/components/admin/_configuration.service.js', webappDir + 'components/admin/configuration.service.js', this, {});
    this.template(webappDir + '/components/admin/_logs.service.js', webappDir + 'components/admin/logs.service.js', this, {});
    this.template(webappDir + '/components/admin/_monitoring.service.js', webappDir + 'components/admin/monitoring.service.js', this, {});
    this.template(webappDir + '/components/auth/_auth.service.js', webappDir + 'components/auth/auth.service.js', this, {});
    this.template(webappDir + '/components/auth/_principal.service.js', webappDir + 'components/auth/principal.service.js', this, {});
    if (this.authenticationType == 'token') {
        this.template(webappDir + '/components/auth/provider/_auth.oauth2.service.js', webappDir + 'components/auth/provider/auth.oauth2.service.js', this, {});
    } else {
        this.template(webappDir + '/components/auth/provider/_auth.session.service.js', webappDir + 'components/auth/provider/auth.session.service.js', this, {});
    }
    this.template(webappDir + '/components/auth/services/_account.service.js', webappDir + 'components/auth/services/account.service.js', this, {});
    this.template(webappDir + '/components/auth/services/_activate.service.js', webappDir + 'components/auth/services/activate.service.js', this, {});
    this.template(webappDir + '/components/auth/services/_password.service.js', webappDir + 'components/auth/services/password.service.js', this, {});
    this.template(webappDir + '/components/auth/services/_register.service.js', webappDir + 'components/auth/services/register.service.js', this, {});
    if (this.authenticationType == 'cookie') {
        this.template(webappDir + '/components/auth/services/_sessions.service.js', webappDir + 'components/auth/services/sessions.service.js', this, {});
    }
    this.template(webappDir + '/components/form/_form.directive.js', webappDir + 'components/form/form.directive.js', this, {});
    this.template(webappDir + '/components/language/_language.controller.js', webappDir + 'components/language/language.controller.js', this, {});
    this.template(webappDir + '/components/language/_language.service.js', webappDir + 'components/language/language.service.js', this, {});
    this.template(webappDir + '/components/navbar/_navbar.directive.js', webappDir + 'components/navbar/navbar.directive.js', this, {});
    this.copy(webappDir + '/components/navbar/navbar.html', webappDir + 'components/navbar/navbar.html');
    this.template(webappDir + '/components/navbar/_navbar.controller.js', webappDir + 'components/navbar/navbar.controller.js', this, {});
    this.template(webappDir + '/components/util/_base64.service.js', webappDir + 'components/util/base64.service.js', this, {});
    this.template(webappDir + '/components/util/_truncate.filter.js', webappDir + 'components/util/truncate.filter.js', this, {});

    // Client App
    this.template(webappDir + '/app/account/_account.js', webappDir + 'app/account/account.js', this, {});
    this.copy(webappDir + '/app/account/activate/activate.html', webappDir + 'app/account/activate/activate.html');
    this.template(webappDir + '/app/account/activate/_activate.controller.js', webappDir + 'app/account/activate/activate.controller.js', this, {});
    this.copy(webappDir + '/app/account/login/login.html', webappDir + 'app/account/login/login.html');
    this.template(webappDir + '/app/account/login/_login.controller.js', webappDir + 'app/account/login/login.controller.js', this, {});
    this.template(webappDir + '/app/account/logout/_logout.controller.js', webappDir + 'app/account/logout/logout.controller.js', this, {});
    this.copy(webappDir + '/app/account/password/password.html', webappDir + 'app/account/password/password.html');
    this.template(webappDir + '/app/account/password/_password.controller.js', webappDir + 'app/account/password/password.controller.js', this, {});
    this.template(webappDir + '/app/account/password/_password.directive.js', webappDir + 'app/account/password/password.directive.js', this, {});
    this.copy(webappDir + '/app/account/register/register.html', webappDir + 'app/account/register/register.html');
    this.template(webappDir + '/app/account/register/_register.controller.js', webappDir + 'app/account/register/register.controller.js', this, {});
    if (this.authenticationType == 'cookie') {
        this.copy(webappDir + '/app/account/sessions/sessions.html', webappDir + 'app/account/sessions/sessions.html');
        this.template(webappDir + '/app/account/sessions/_sessions.controller.js', webappDir + 'app/account/sessions/sessions.controller.js', this, {});
    }
    this.copy(webappDir + '/app/account/settings/settings.html', webappDir + 'app/account/settings/settings.html');
    this.template(webappDir + '/app/account/settings/_settings.controller.js', webappDir + 'app/account/settings/settings.controller.js', this, {});
    this.template(webappDir + '/app/admin/_admin.js', webappDir + 'app/admin/admin.js', this, {});
    this.copy(webappDir + '/app/admin/audits/audits.html', webappDir + 'app/admin/audits/audits.html');
    this.template(webappDir + '/app/admin/audits/_audits.controller.js', webappDir + 'app/admin/audits/audits.controller.js', this, {});
    this.copy(webappDir + '/app/admin/configuration/configuration.html', webappDir + 'app/admin/configuration/configuration.html');
    this.template(webappDir + '/app/admin/configuration/_configuration.controller.js', webappDir + 'app/admin/configuration/configuration.controller.js', this, {});
    this.copy(webappDir + '/app/admin/docs/docs.html', webappDir + 'app/admin/docs/docs.html');
    this.template(webappDir + '/app/admin/docs/_docs.controller.js', webappDir + 'app/admin/docs/docs.controller.js', this, {});
    this.copy(webappDir + '/app/admin/health/health.html', webappDir + 'app/admin/health/health.html');
    this.template(webappDir + '/app/admin/health/_health.controller.js', webappDir + 'app/admin/health/health.controller.js', this, {});
    this.copy(webappDir + '/app/admin/logs/logs.html', webappDir + 'app/admin/logs/logs.html');
    this.template(webappDir + '/app/admin/logs/_logs.controller.js', webappDir + 'app/admin/logs/logs.controller.js', this, {});
    this.template(webappDir + '/app/admin/metrics/_metrics.html', webappDir + 'app/admin/metrics/metrics.html', this, {});
    this.template(webappDir + '/app/admin/metrics/_metrics.controller.js', webappDir + 'app/admin/metrics/metrics.controller.js', this, {});
    if (this.websocket == 'atmosphere') {
        this.copy(webappDir + '/app/admin/tracker/tracker.html', webappDir + 'app/admin/tracker/tracker.html');
        this.template(webappDir + '/app/admin/tracker/_tracker.controller.js', webappDir + 'app/admin/tracker/tracker.controller.js', this, {});
    }
    this.copy(webappDir + '/app/error/error.html', webappDir + 'app/error/error.html');
    this.copy(webappDir + '/app/error/accessdenied.html', webappDir + 'app/error/accessdenied.html');
    this.template(webappDir + '/app/entities/_entity.js', webappDir + 'app/entities/entity.js', this, {});
    this.template(webappDir + '/app/error/_error.js', webappDir + 'app/error/error.js', this, {});
    this.copy(webappDir + '/app/main/main.html', webappDir + 'app/main/main.html');
    this.template(webappDir + '/app/main/_main.controller.js', webappDir + 'app/main/main.controller.js', this, {});

    // Index page
    this.indexFile = this.readFileAsString(path.join(this.sourceRoot(), webappDir + '_index.html'));
    this.indexFile = this.engine(this.indexFile, this, {});

    // Create Test Javascript files
    var testJsDir = 'src/main/webapp/test/';
    this.copy(testJsDir + 'karma.conf.js', testJsDir + 'karma.conf.js');
    if (this.websocket == 'atmosphere') {
        this.copy(testJsDir + 'mock/atmosphere.mock.js', testJsDir + 'mock/atmosphere.mock.js');
    }
    this.template(testJsDir + 'spec/app/account/login/_loginControllerSpec.js', testJsDir + 'spec/app/account/login/loginControllerSpec.js', this, {});
    this.template(testJsDir + 'spec/app/account/password/_passwordControllerSpec.js', testJsDir + 'spec/app/account/password/passwordControllerSpec.js', this, {});
    this.template(testJsDir + 'spec/app/account/password/_passwordDirectiveSpec.js', testJsDir + 'spec/app/account/password/passwordDirectiveSpec.js', this, {});
    this.template(testJsDir + 'spec/app/account/sessions/_sessionsControllerSpec.js', testJsDir + 'spec/app/account/sessions/sessionsControllerSpec.js', this, {});
    this.template(testJsDir + 'spec/app/account/settings/_settingsControllerSpec.js', testJsDir + 'spec/app/account/settings/settingsControllerSpec.js', this, {});
    this.template(testJsDir + 'spec/components/auth/_authServicesSpec.js', testJsDir + 'spec/components/auth/authServicesSpec.js', this, {});

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
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        'bower_components/angular-resource/angular-resource.js',
        'bower_components/angular-cookies/angular-cookies.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/angular-translate/angular-translate.js',
        'bower_components/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
        'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
        'bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
        'bower_components/angular-local-storage/dist/angular-local-storage.js',
        'bower_components/angular-cache-buster/angular-cache-buster.js',

        'app.js',
        'components/auth/auth.service.js',
        'components/auth/principal.service.js',
        'components/auth/services/account.service.js',
        'components/auth/services/activate.service.js',
        'components/auth/services/password.service.js',
        'components/auth/services/register.service.js',
        'components/auth/services/sessions.service.js',
        'components/form/form.directive.js',
        'components/language/language.service.js',
        'components/language/language.controller.js',
        'components/admin/audits.service.js',
        'components/admin/logs.service.js',
        'components/admin/configuration.service.js',
        'components/admin/monitoring.service.js',
        'components/navbar/navbar.directive.js',
        'components/navbar/navbar.controller.js',
        'components/util/truncate.filter.js',
        'components/util/base64.service.js',
        'app/account/account.js',
        'app/account/activate/activate.controller.js',
        'app/account/login/login.controller.js',
        'app/account/logout/logout.controller.js',
        'app/account/password/password.controller.js',
        'app/account/password/password.directive.js',
        'app/account/register/register.controller.js',
        'app/account/sessions/sessions.controller.js',
        'app/account/settings/settings.controller.js',
        'app/admin/admin.js',
        'app/admin/audits/audits.controller.js',
        'app/admin/configuration/configuration.controller.js',
        'app/admin/docs/docs.controller.js',
        'app/admin/health/health.controller.js',
        'app/admin/logs/logs.controller.js',
        'app/admin/metrics/metrics.controller.js',
        'app/entities/entity.js',
        'app/error/error.js',
        'app/main/main.controller.js'
        ];

    if (this.authenticationType == 'token') {
        indexScripts = indexScripts.concat([
            'components/auth/provider/auth.oauth2.service.js']);
    } else {
        indexScripts = indexScripts.concat([
            'components/auth/provider/auth.session.service.js']);
    }

    if (this.websocket == 'atmosphere') {
        indexScripts = indexScripts.concat([
            'app/admin/tracker/tracker.controller.js',
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
