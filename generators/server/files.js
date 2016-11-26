'use strict';

const mkdirp = require('mkdirp'),
    cleanup = require('../cleanup');

/* Constants use throughout */
const constants = require('../generator-constants'),
    INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX,
    DOCKER_DIR = constants.DOCKER_DIR,
    TEST_DIR = constants.TEST_DIR,
    SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR,
    SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR,
    SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR,
    SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;

module.exports = {
    writeFiles
};

var javaDir;

function writeFiles() {
    return {
        cleanupOldServerFiles: function() {
            javaDir = this.javaDir = constants.SERVER_MAIN_SRC_DIR + this.packageFolder + '/';
            cleanup.cleanupOldServerFiles(this, this.javaDir, this.testDir);
        },

        writeGlobalFiles: function () {
            this.template('_README.md', 'README.md', this, {});
            this.copy('gitignore', '.gitignore');
            this.copy('gitattributes', '.gitattributes');
            this.copy('editorconfig', '.editorconfig');
            this.template('_travis.yml', '.travis.yml', this, {});
            this.template('_Jenkinsfile', 'Jenkinsfile', this, {});
        },

        writeDockerFiles: function () {
            // Create Docker and Docker Compose files
            this.template(DOCKER_DIR + '_Dockerfile', DOCKER_DIR + 'Dockerfile', this, {});
            this.template(DOCKER_DIR + '_app.yml', DOCKER_DIR + 'app.yml', this, {});
            if (this.prodDatabaseType === 'mysql') {
                this.template(DOCKER_DIR + '_mysql.yml', DOCKER_DIR + 'mysql.yml', this, {});
            }
            if (this.prodDatabaseType === 'mariadb') {
                this.template(DOCKER_DIR + '_mariadb.yml', DOCKER_DIR + 'mariadb.yml', this, {});
            }
            if (this.prodDatabaseType === 'postgresql') {
                this.template(DOCKER_DIR + '_postgresql.yml', DOCKER_DIR + 'postgresql.yml', this, {});
            }
            if (this.prodDatabaseType === 'mongodb') {
                this.template(DOCKER_DIR + '_mongodb.yml', DOCKER_DIR + 'mongodb.yml', this, {});
                this.template(DOCKER_DIR + '_mongodb-cluster.yml', DOCKER_DIR + 'mongodb-cluster.yml', this, {});
                this.copy(DOCKER_DIR + 'mongodb/MongoDB.Dockerfile', DOCKER_DIR + 'mongodb/MongoDB.Dockerfile', this, {});
                this.template(DOCKER_DIR + 'mongodb/scripts/init_replicaset.js', DOCKER_DIR + 'mongodb/scripts/init_replicaset.js', this, {});
            }
            if (this.prodDatabaseType === 'mssql') {
                this.template(DOCKER_DIR + '_mssql.yml', DOCKER_DIR + 'mssql.yml', this, {});
            }
            if (this.applicationType === 'gateway' || this.prodDatabaseType === 'cassandra') {
                // docker-compose files
                this.template(DOCKER_DIR + '_cassandra.yml', DOCKER_DIR + 'cassandra.yml', this, {});
                this.template(DOCKER_DIR + '_cassandra-cluster.yml', DOCKER_DIR + 'cassandra-cluster.yml', this, {});
                this.template(DOCKER_DIR + '_cassandra-migration.yml', DOCKER_DIR + 'cassandra-migration.yml', this, {});
                // dockerfiles
                this.template(DOCKER_DIR + 'cassandra/_Cassandra-Migration.Dockerfile', DOCKER_DIR + 'cassandra/Cassandra-Migration.Dockerfile', this, {});
                // scripts
                this.template(DOCKER_DIR + 'cassandra/scripts/_autoMigrate.sh', DOCKER_DIR + 'cassandra/scripts/autoMigrate.sh', this, {});
                this.template(DOCKER_DIR + 'cassandra/scripts/_execute-cql.sh', DOCKER_DIR + 'cassandra/scripts/execute-cql.sh', this, {});
            }
            if (this.searchEngine === 'elasticsearch') {
                this.template(DOCKER_DIR + '_elasticsearch.yml', DOCKER_DIR + 'elasticsearch.yml', this, {});
            }
            if (this.messageBroker === 'kafka') {
                this.template(DOCKER_DIR + '_kafka.yml', DOCKER_DIR + 'kafka.yml', this, {});
            }

            if (this.applicationType === 'microservice' || this.applicationType === 'gateway' || this.applicationType === 'uaa') {
                this.template(DOCKER_DIR + 'config/_README.md', DOCKER_DIR + 'central-server-config/README.md',this, {});

                if (this.serviceDiscoveryType === 'consul') {
                    this.template(DOCKER_DIR + '_consul.yml', DOCKER_DIR + 'consul.yml', this, {});
                    this.copy(DOCKER_DIR + 'config/git2consul.json', DOCKER_DIR + 'config/git2consul.json');
                    this.copy(DOCKER_DIR + 'config/consul-config/application.yml', DOCKER_DIR + 'central-server-config/application.yml');
                }

                if (this.serviceDiscoveryType === 'eureka') {
                    this.template(DOCKER_DIR + '_jhipster-registry.yml', DOCKER_DIR + 'jhipster-registry.yml', this, {});
                    this.copy(DOCKER_DIR + 'config/docker-config/application.yml', DOCKER_DIR + 'central-server-config/docker-config/application.yml');
                    this.copy(DOCKER_DIR + 'config/localhost-config/application.yml', DOCKER_DIR + 'central-server-config/localhost-config/application.yml');
                }
            }


            this.template(DOCKER_DIR + '_sonar.yml', DOCKER_DIR + 'sonar.yml', this, {});
        },

        writeServerBuildFiles: function () {

            switch (this.buildTool) {
            case 'gradle':
                this.template('_build.gradle', 'build.gradle', this, {});
                this.template('_settings.gradle', 'settings.gradle', this, {});
                this.template('_gradle.properties', 'gradle.properties', this, {});
                if (!this.skipClient) {
                    this.template('gradle/_yeoman.gradle', 'gradle/yeoman.gradle', this, {});
                }
                this.template('gradle/_sonar.gradle', 'gradle/sonar.gradle', this, {});
                this.template('gradle/_docker.gradle', 'gradle/docker.gradle', this, {});
                this.template('gradle/_profile_dev.gradle', 'gradle/profile_dev.gradle', this, {'interpolate': INTERPOLATE_REGEX});
                this.template('gradle/_profile_prod.gradle', 'gradle/profile_prod.gradle', this, {'interpolate': INTERPOLATE_REGEX});
                this.template('gradle/_mapstruct.gradle', 'gradle/mapstruct.gradle', this, {'interpolate': INTERPOLATE_REGEX});
                if (this.testFrameworks.indexOf('gatling') !== -1) {
                    this.template('gradle/_gatling.gradle', 'gradle/gatling.gradle', this, {});
                }
                if (this.databaseType === 'sql') {
                    this.template('gradle/_liquibase.gradle', 'gradle/liquibase.gradle', this, {});
                }
                this.copy('gradlew', 'gradlew');
                this.copy('gradlew.bat', 'gradlew.bat');
                this.copy('gradle/wrapper/gradle-wrapper.jar', 'gradle/wrapper/gradle-wrapper.jar');
                this.copy('gradle/wrapper/gradle-wrapper.properties', 'gradle/wrapper/gradle-wrapper.properties');
                break;
            case 'maven':
            default :
                this.copy('mvnw', 'mvnw');
                this.copy('mvnw.cmd', 'mvnw.cmd');
                this.copy('.mvn/wrapper/maven-wrapper.jar', '.mvn/wrapper/maven-wrapper.jar');
                this.copy('.mvn/wrapper/maven-wrapper.properties', '.mvn/wrapper/maven-wrapper.properties');
                this.template('_pom.xml', 'pom.xml', null, {'interpolate': INTERPOLATE_REGEX});
            }
        },

        writeServerResourceFiles: function () {
            javaDir = this.javaDir = constants.SERVER_MAIN_SRC_DIR + this.packageFolder + '/';

            // Create Java resource files
            mkdirp(SERVER_MAIN_RES_DIR);
            this.copy(SERVER_MAIN_RES_DIR + 'banner.txt', SERVER_MAIN_RES_DIR + 'banner.txt');

            if (this.hibernateCache === 'ehcache') {
                this.template(SERVER_MAIN_RES_DIR + '_ehcache.xml', SERVER_MAIN_RES_DIR + 'ehcache.xml', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/jcache/_SpringCacheRegionFactory.java', javaDir + 'config/jcache/SpringCacheRegionFactory.java', this, {});
            }
            if (this.hibernateCache === 'ehcache' || this.hibernateCache === 'hazelcast') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/jcache/_JCacheGaugeSet.java', javaDir + 'config/jcache/JCacheGaugeSet.java', this, {});
            }
            if (this.devDatabaseType === 'h2Disk' || this.devDatabaseType === 'h2Memory') {
                this.copy(SERVER_MAIN_RES_DIR + 'h2.server.properties', SERVER_MAIN_RES_DIR + '.h2.server.properties');
            }

            // Thymeleaf templates
            this.copy(SERVER_MAIN_RES_DIR + 'templates/error.html', SERVER_MAIN_RES_DIR + 'templates/error.html');

            this.template(SERVER_MAIN_RES_DIR + '_logback-spring.xml', SERVER_MAIN_RES_DIR + 'logback-spring.xml', this, {'interpolate': INTERPOLATE_REGEX});

            this.template(SERVER_MAIN_RES_DIR + 'config/_application.yml', SERVER_MAIN_RES_DIR + 'config/application.yml', this, {});
            this.template(SERVER_MAIN_RES_DIR + 'config/_application-dev.yml', SERVER_MAIN_RES_DIR + 'config/application-dev.yml', this, {});
            this.template(SERVER_MAIN_RES_DIR + 'config/_application-prod.yml', SERVER_MAIN_RES_DIR + 'config/application-prod.yml', this, {});

            if (this.databaseType === 'sql') {
                this.template(SERVER_MAIN_RES_DIR + '/config/liquibase/changelog/_initial_schema.xml', SERVER_MAIN_RES_DIR + 'config/liquibase/changelog/00000000000000_initial_schema.xml', this, {'interpolate': INTERPOLATE_REGEX});
                this.copy(SERVER_MAIN_RES_DIR + '/config/liquibase/master.xml', SERVER_MAIN_RES_DIR + 'config/liquibase/master.xml');
            }

            if (this.databaseType === 'mongodb' && !this.skipUserManagement) {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/dbmigrations/_InitialSetupMigration.java', javaDir + 'config/dbmigrations/InitialSetupMigration.java', this, {});
            }

            if (this.databaseType === 'cassandra' || this.applicationType === 'gateway') {
                this.template(SERVER_MAIN_RES_DIR + 'config/cql/_create-keyspace-prod.cql', SERVER_MAIN_RES_DIR + 'config/cql/create-keyspace-prod.cql', this, {});
                this.template(SERVER_MAIN_RES_DIR + 'config/cql/_create-keyspace.cql', SERVER_MAIN_RES_DIR + 'config/cql/create-keyspace.cql', this, {});
                this.template(SERVER_MAIN_RES_DIR + 'config/cql/_drop-keyspace.cql', SERVER_MAIN_RES_DIR + 'config/cql/drop-keyspace.cql', this, {});
                this.copy(SERVER_MAIN_RES_DIR + 'config/cql/changelog/README.md', SERVER_MAIN_RES_DIR + 'config/cql/changelog/README.md');

                /* Skip the code below for --skip-user-management */
                if (this.skipUserManagement) return;
                if (this.applicationType !== 'microservice' && this.databaseType === 'cassandra') {
                    this.template(SERVER_MAIN_RES_DIR + 'config/cql/changelog/_create-tables.cql', SERVER_MAIN_RES_DIR + 'config/cql/changelog/00000000000000_create-tables.cql', this, {});
                    this.template(SERVER_MAIN_RES_DIR + 'config/cql/changelog/_insert_default_users.cql', SERVER_MAIN_RES_DIR + 'config/cql/changelog/00000000000001_insert_default_users.cql', this, {});
                }
            }

            if (this.applicationType === 'uaa') {
                this.generateKeyStore();
            }
        },

        writeServerPropertyFiles: function () {
            this.template('../../languages/templates/' + SERVER_MAIN_RES_DIR + 'i18n/_messages_en.properties', SERVER_MAIN_RES_DIR + 'i18n/messages.properties', this, {});
        },

        writeServerJavaAuthConfigFiles: function () {
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_SpringSecurityAuditorAware.java', javaDir + 'security/SpringSecurityAuditorAware.java', this, {});
            }
            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_SecurityUtils.java', javaDir + 'security/SecurityUtils.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_AuthoritiesConstants.java', javaDir + 'security/AuthoritiesConstants.java', this, {});

            if (this.authenticationType === 'jwt') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/jwt/_TokenProvider.java', javaDir + 'security/jwt/TokenProvider.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/jwt/_JWTConfigurer.java', javaDir + 'security/jwt/JWTConfigurer.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/jwt/_JWTFilter.java', javaDir + 'security/jwt/JWTFilter.java', this, {});
            }

            /* Skip the code below for --skip-user-management */
            if (this.skipUserManagement) return;

            if(this.applicationType === 'uaa') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_UaaWebSecurityConfiguration.java', javaDir + 'config/UaaWebSecurityConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_UaaConfiguration.java', javaDir + 'config/UaaConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_LoadBalancedResourceDetails.java', javaDir + 'config/LoadBalancedResourceDetails.java', this, {});
            } else {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_SecurityConfiguration.java', javaDir + 'config/SecurityConfiguration.java', this, {});
            }

            if (this.authenticationType === 'session') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_PersistentToken.java', javaDir + 'domain/PersistentToken.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_PersistentTokenRepository.java', javaDir + 'repository/PersistentTokenRepository.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_Http401UnauthorizedEntryPoint.java', javaDir + 'security/Http401UnauthorizedEntryPoint.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_UserDetailsService.java', javaDir + 'security/UserDetailsService.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_UserNotActivatedException.java', javaDir + 'security/UserNotActivatedException.java', this, {});


            if (this.authenticationType === 'jwt') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/vm/_LoginVM.java', javaDir + 'web/rest/vm/LoginVM.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_UserJWTController.java', javaDir + 'web/rest/UserJWTController.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_JWTToken.java', javaDir + 'web/rest/JWTToken.java', this, {});
            }

            if (this.authenticationType === 'oauth2') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_OAuth2ServerConfiguration.java', javaDir + 'config/OAuth2ServerConfiguration.java', this, {});
            }

            if (this.databaseType === 'mongodb' && this.authenticationType === 'oauth2') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/oauth2/_OAuth2AuthenticationReadConverter.java', javaDir + 'config/oauth2/OAuth2AuthenticationReadConverter.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/oauth2/_MongoDBApprovalStore.java', javaDir + 'config/oauth2/MongoDBApprovalStore.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/oauth2/_MongoDBAuthorizationCodeServices.java', javaDir + 'config/oauth2/MongoDBAuthorizationCodeServices.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/oauth2/_MongoDBClientDetailsService.java', javaDir + 'config/oauth2/MongoDBClientDetailsService.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/oauth2/_MongoDBTokenStore.java', javaDir + 'config/oauth2/MongoDBTokenStore.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_OAuth2AuthenticationAccessToken.java', javaDir + 'domain/OAuth2AuthenticationAccessToken.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_OAuth2AuthenticationApproval.java', javaDir + 'domain/OAuth2AuthenticationApproval.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_OAuth2AuthenticationClientDetails.java', javaDir + 'domain/OAuth2AuthenticationClientDetails.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_OAuth2AuthenticationCode.java', javaDir + 'domain/OAuth2AuthenticationCode.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_OAuth2AuthenticationRefreshToken.java', javaDir + 'domain/OAuth2AuthenticationRefreshToken.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_OAuth2AccessTokenRepository.java', javaDir + 'repository/OAuth2AccessTokenRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_OAuth2ApprovalRepository.java', javaDir + 'repository/OAuth2ApprovalRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_OAuth2ClientDetailsRepository.java', javaDir + 'repository/OAuth2ClientDetailsRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_OAuth2CodeRepository.java', javaDir + 'repository/OAuth2CodeRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_OAuth2RefreshTokenRepository.java', javaDir + 'repository/OAuth2RefreshTokenRepository.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/security/_package-info.java', javaDir + 'security/package-info.java', this, {});
            if (this.authenticationType === 'session') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_AjaxAuthenticationFailureHandler.java', javaDir + 'security/AjaxAuthenticationFailureHandler.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_AjaxAuthenticationSuccessHandler.java', javaDir + 'security/AjaxAuthenticationSuccessHandler.java', this, {});
            }
            if (this.authenticationType === 'session' || this.authenticationType === 'oauth2') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_AjaxLogoutSuccessHandler.java', javaDir + 'security/AjaxLogoutSuccessHandler.java', this, {});
            }

            if (this.authenticationType === 'session') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/_CustomPersistentRememberMeServices.java', javaDir + 'security/CustomPersistentRememberMeServices.java', this, {});
            }

            if (this.enableSocialSignIn) {
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/social/_package-info.java', javaDir + 'security/social/package-info.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/social/_SocialConfiguration.java', javaDir + 'config/social/SocialConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_SocialUserConnection.java', javaDir + 'domain/SocialUserConnection.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_CustomSocialConnectionRepository.java', javaDir + 'repository/CustomSocialConnectionRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_CustomSocialUsersConnectionRepository.java', javaDir + 'repository/CustomSocialUsersConnectionRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_SocialUserConnectionRepository.java', javaDir + 'repository/SocialUserConnectionRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/social/_CustomSignInAdapter.java', javaDir + 'security/social/CustomSignInAdapter.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/security/social/_package-info.java', javaDir + 'security/social/package-info.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/service/_SocialService.java', javaDir + 'service/SocialService.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_SocialController.java', javaDir + 'web/rest/SocialController.java', this, {});
            }
        },

        writeServerJavaGatewayFiles: function () {

            if (this.applicationType !== 'gateway') return;

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_GatewayConfiguration.java', javaDir + 'config/GatewayConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/apidoc/_GatewaySwaggerResourcesProvider.java', javaDir + 'config/apidoc/GatewaySwaggerResourcesProvider.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/gateway/ratelimiting/_RateLimitingFilter.java', javaDir + 'gateway/ratelimiting/RateLimitingFilter.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/gateway/_TokenRelayFilter.java', javaDir + 'gateway/TokenRelayFilter.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/gateway/ratelimiting/_RateLimitingRepository.java', javaDir + 'gateway/ratelimiting/RateLimitingRepository.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/gateway/accesscontrol/_AccessControlFilter.java', javaDir + 'gateway/accesscontrol/AccessControlFilter.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/gateway/responserewriting/_SwaggerBasePathRewritingFilter.java', javaDir + 'gateway/responserewriting/SwaggerBasePathRewritingFilter.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/vm/_RouteVM.java', javaDir + 'web/rest/vm/RouteVM.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_GatewayResource.java', javaDir + 'web/rest/GatewayResource.java', this, {});
        },

        writeServerMicroserviceFiles: function () {
            if (this.applicationType !== 'microservice' && !(this.applicationType === 'gateway' && this.authenticationType === 'uaa')) return;

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_MicroserviceSecurityConfiguration.java', javaDir + 'config/MicroserviceSecurityConfiguration.java', this, {});
            if (this.applicationType === 'microservice' && this.authenticationType === 'uaa') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_LoadBalancedResourceDetails.java', javaDir + 'config/LoadBalancedResourceDetails.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_FeignConfiguration.java', javaDir + 'config/FeignConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/client/_AuthorizedFeignClient.java', javaDir + 'client/AuthorizedFeignClient.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/client/_OAuth2InterceptedFeignConfiguration.java', javaDir + 'client/OAuth2InterceptedFeignConfiguration.java', this, {});
            }
        },

        writeServerMicroserviceAndGatewayFiles: function () {
            if (this.applicationType !== 'microservice' && this.applicationType !== 'gateway' && this.applicationType !== 'uaa') return;

            this.template(SERVER_MAIN_RES_DIR + 'config/_bootstrap.yml', SERVER_MAIN_RES_DIR + 'config/bootstrap.yml', this, {});
            this.template(SERVER_MAIN_RES_DIR + 'config/_bootstrap-dev.yml', SERVER_MAIN_RES_DIR + 'config/bootstrap-dev.yml', this, {});
            this.template(SERVER_MAIN_RES_DIR + 'config/_bootstrap-prod.yml', SERVER_MAIN_RES_DIR + 'config/bootstrap-prod.yml', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/metrics/_SpectatorLogMetricWriter.java', javaDir + 'config/metrics/SpectatorLogMetricWriter.java', this, {});
        },

        writeServerJavaAppFiles: function () {

            // Create Java files
            // Spring Boot main
            this.template(SERVER_MAIN_SRC_DIR + 'package/_Application.java', javaDir + '/' + this.mainClass + '.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/_ApplicationWebXml.java', javaDir + '/ApplicationWebXml.java', this, {});
        },

        writeServerJavaConfigFiles: function () {

            this.template(SERVER_MAIN_SRC_DIR + 'package/aop/logging/_LoggingAspect.java', javaDir + 'aop/logging/LoggingAspect.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_DefaultProfileUtil.java', javaDir + 'config/DefaultProfileUtil.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/apidoc/_package-info.java', javaDir + 'config/apidoc/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/apidoc/_SwaggerConfiguration.java', javaDir + 'config/apidoc/SwaggerConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/apidoc/_PageableParameterBuilderPlugin.java', javaDir + 'config/apidoc/PageableParameterBuilderPlugin.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/async/_package-info.java', javaDir + 'async/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/async/_ExceptionHandlingAsyncTaskExecutor.java', javaDir + 'async/ExceptionHandlingAsyncTaskExecutor.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_package-info.java', javaDir + 'config/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_AsyncConfiguration.java', javaDir + 'config/AsyncConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_CacheConfiguration.java', javaDir + 'config/CacheConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_Constants.java', javaDir + 'config/Constants.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_DateTimeFormatConfiguration.java', javaDir + 'config/DateTimeFormatConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_LoggingConfiguration.java', javaDir + 'config/LoggingConfiguration.java', this, {});

            if (this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_JSR310DateConverters.java', javaDir + 'domain/util/JSR310DateConverters.java', this, {});
            }
            if (this.databaseType === 'sql'|| this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_CloudDatabaseConfiguration.java', javaDir + 'config/CloudDatabaseConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_DatabaseConfiguration.java', javaDir + 'config/DatabaseConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/audit/_package-info.java', javaDir + 'config/audit/package-info.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/audit/_AuditEventConverter.java', javaDir + 'config/audit/AuditEventConverter.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_JHipsterProperties.java', javaDir + 'config/JHipsterProperties.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_LocaleConfiguration.java', javaDir + 'config/LocaleConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_LoggingAspectConfiguration.java', javaDir + 'config/LoggingAspectConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_MetricsConfiguration.java', javaDir + 'config/MetricsConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_ThymeleafConfiguration.java', javaDir + 'config/ThymeleafConfiguration.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/_WebConfigurer.java', javaDir + 'config/WebConfigurer.java', this, {});
            if (this.websocket === 'spring-websocket') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_WebsocketConfiguration.java', javaDir + 'config/WebsocketConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_WebsocketSecurityConfiguration.java', javaDir + 'config/WebsocketSecurityConfiguration.java', this, {});
            }

            this.template(SERVER_MAIN_SRC_DIR + 'package/config/locale/_package-info.java', javaDir + 'config/locale/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/config/locale/_AngularCookieLocaleResolver.java', javaDir + 'config/locale/AngularCookieLocaleResolver.java', this, {});

            if (this.databaseType === 'cassandra') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/metrics/_package-info.java', javaDir + 'config/metrics/package-info.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/metrics/_JHipsterHealthIndicatorConfiguration.java', javaDir + 'config/metrics/JHipsterHealthIndicatorConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/metrics/_CassandraHealthIndicator.java', javaDir + 'config/metrics/CassandraHealthIndicator.java', this, {});
            }

            if (this.databaseType === 'cassandra' || this.applicationType === 'gateway') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/cassandra/_CassandraConfiguration.java', javaDir + 'config/cassandra/CassandraConfiguration.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/cassandra/_CustomZonedDateTimeCodec.java', javaDir + 'config/cassandra/CustomZonedDateTimeCodec.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/cassandra/_package-info.java', javaDir + 'config/cassandra/package-info.java', this, {});
            }

            if (this.databaseType === 'sql') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/liquibase/_AsyncSpringLiquibase.java', javaDir + 'config/liquibase/AsyncSpringLiquibase.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/liquibase/_package-info.java', javaDir + 'config/liquibase/package-info.java', this, {});
            }
            if (this.searchEngine === 'elasticsearch') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_ElasticSearchConfiguration.java', javaDir + 'config/ElasticSearchConfiguration.java', this, {});
            }
            if (this.messageBroker === 'kafka') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/config/_MessagingConfiguration.java', javaDir + 'config/MessagingConfiguration.java', this, {});
            }
        },

        writeServerJavaDomainFiles: function () {

            this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_package-info.java', javaDir + 'domain/package-info.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_JSR310DateConverters.java', javaDir + 'domain/util/JSR310DateConverters.java', this, {});
            if (this.databaseType === 'sql') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_FixedH2Dialect.java', javaDir + 'domain/util/FixedH2Dialect.java', this, {});
                if (this.prodDatabaseType === 'postgresql') {
                    this.template(SERVER_MAIN_SRC_DIR + 'package/domain/util/_FixedPostgreSQL82Dialect.java', javaDir + 'domain/util/FixedPostgreSQL82Dialect.java', this, {});
                }
            }
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_AbstractAuditingEntity.java', javaDir + 'domain/AbstractAuditingEntity.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_PersistentAuditEvent.java', javaDir + 'domain/PersistentAuditEvent.java', this, {});
            }
        },

        writeServerJavaRepoFiles: function () {

            if (this.searchEngine === 'elasticsearch') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/search/_package-info.java', javaDir + 'repository/search/package-info.java', this, {});
            }
            this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_package-info.java', javaDir + 'repository/package-info.java', this, {});
        },

        writeServerJavaServiceFiles: function () {
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/_package-info.java', javaDir + 'service/package-info.java', this, {});

            /* Skip the code below for --skip-user-management */
            if (this.skipUserManagement) return;

            this.template(SERVER_MAIN_SRC_DIR + 'package/service/util/_RandomUtil.java', javaDir + 'service/util/RandomUtil.java', this, {});
        },

        writeServerJavaWebErrorFiles: function () {

            // error handler code - server side
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_ErrorConstants.java', javaDir + 'web/rest/errors/ErrorConstants.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_CustomParameterizedException.java', javaDir + 'web/rest/errors/CustomParameterizedException.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_ErrorVM.java', javaDir + 'web/rest/errors/ErrorVM.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_ExceptionTranslator.java', javaDir + 'web/rest/errors/ExceptionTranslator.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_FieldErrorVM.java', javaDir + 'web/rest/errors/FieldErrorVM.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/errors/_ParameterizedErrorVM.java', javaDir + 'web/rest/errors/ParameterizedErrorVM.java', this, {});

        },

        writeServerJavaWebFiles: function () {

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/filter/_package-info.java', javaDir + 'web/filter/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/filter/_CachingHttpHeadersFilter.java', javaDir + 'web/filter/CachingHttpHeadersFilter.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/vm/_package-info.java', javaDir + 'web/rest/vm/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/vm/_LoggerVM.java', javaDir + 'web/rest/vm/LoggerVM.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/util/_HeaderUtil.java', javaDir + 'web/rest/util/HeaderUtil.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/util/_PaginationUtil.java', javaDir + 'web/rest/util/PaginationUtil.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_package-info.java', javaDir + 'web/rest/package-info.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_LogsResource.java', javaDir + 'web/rest/LogsResource.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_ProfileInfoResource.java', javaDir + 'web/rest/ProfileInfoResource.java', this, {});

        },

        writeServerJavaWebsocketFiles: function () {

            if (this.websocket !== 'spring-websocket') return;

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/websocket/_package-info.java', javaDir + 'web/websocket/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/websocket/_ActivityService.java', javaDir + 'web/websocket/ActivityService.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/websocket/dto/_package-info.java', javaDir + 'web/websocket/dto/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/websocket/dto/_ActivityDTO.java', javaDir + 'web/websocket/dto/ActivityDTO.java', this, {});

        },

        writeServerTestFwFiles: function () {

            // Create Test Java files
            var testDir = this.testDir;

            mkdirp(testDir);

            if (this.databaseType === 'cassandra') {
                this.template(SERVER_TEST_SRC_DIR + 'package/_CassandraKeyspaceUnitTest.java', testDir + 'CassandraKeyspaceUnitTest.java', this, {});
                this.template(SERVER_TEST_SRC_DIR + 'package/_AbstractCassandraTest.java', testDir + 'AbstractCassandraTest.java', this, {});
                this.template(SERVER_TEST_SRC_DIR + 'package/config/_CassandraTestConfiguration.java', testDir + 'config/CassandraTestConfiguration.java', this, {});
                this.template(SERVER_TEST_RES_DIR + '_cassandra-random-port.yml', SERVER_TEST_RES_DIR + 'cassandra-random-port.yml', this, {});
            }

            this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_TestUtil.java', testDir + 'web/rest/TestUtil.java', this, {});

            this.template(SERVER_TEST_RES_DIR + 'config/_application.yml', SERVER_TEST_RES_DIR + 'config/application.yml', this, {});
            this.template(SERVER_TEST_RES_DIR + '_logback-test.xml', SERVER_TEST_RES_DIR + 'logback-test.xml', this, {});

            // Create Gateway tests files
            if (this.applicationType === 'gateway'){
                this.template(SERVER_TEST_SRC_DIR + 'package/gateway/responserewriting/_SwaggerBasePathRewritingFilterTest.java', testDir + 'gateway/responserewriting/SwaggerBasePathRewritingFilterTest.java', this, {});
            }

            if (this.applicationType === 'gateway' || this.applicationType === 'microservice'  || this.applicationType === 'uaa'){
                this.template(SERVER_TEST_RES_DIR + 'config/_bootstrap.yml', SERVER_TEST_RES_DIR + 'config/bootstrap.yml', this, {});
            }

            if (this.authenticationType === 'uaa') {
                this.template(SERVER_TEST_SRC_DIR + 'package/security/_OAuth2TokenMockUtil.java', testDir + 'security/OAuth2TokenMockUtil.java', this, {});
                this.template(SERVER_TEST_SRC_DIR + 'package/config/_SecurityBeanOverrideConfiguration.java', testDir + 'config/SecurityBeanOverrideConfiguration.java', this, {});
            }

            if (this.hibernateCache === 'ehcache') {
                this.template(SERVER_TEST_RES_DIR + '_ehcache.xml', SERVER_TEST_RES_DIR + 'ehcache.xml', this, {});
            }

            // Create Gatling test files
            if (this.testFrameworks.indexOf('gatling') !== -1) {
                this.copy(TEST_DIR + 'gatling/conf/gatling.conf', TEST_DIR + 'gatling/conf/gatling.conf');
                this.copy(TEST_DIR + 'gatling/conf/logback.xml', TEST_DIR + 'gatling/conf/logback.xml');
                mkdirp(TEST_DIR + 'gatling/data');
                mkdirp(TEST_DIR + 'gatling/bodies');
                mkdirp(TEST_DIR + 'gatling/simulations');
            }

            // Create Cucumber test files
            if (this.testFrameworks.indexOf('cucumber') !== -1) {
                this.template(SERVER_TEST_SRC_DIR + 'package/cucumber/_CucumberTest.java', testDir + 'cucumber/CucumberTest.java', this, {});
                this.template(SERVER_TEST_SRC_DIR + 'package/cucumber/stepdefs/_StepDefs.java', testDir + 'cucumber/stepdefs/StepDefs.java', this, {});
                mkdirp(TEST_DIR + 'features/');
            }

            // Create ElasticSearch test files
            if (this.searchEngine === 'elasticsearch') {
                this.template(SERVER_TEST_SRC_DIR + 'package/config/elasticsearch/_IndexReinitializer.java', testDir + 'config/elasticsearch/IndexReinitializer.java', this, {});
            }
        },

        writeJavaUserManagementFiles: function () {

            if (this.skipUserManagement) return;
            // user management related files

            /* User management resources files */
            if (this.databaseType === 'sql') {
                this.copy(SERVER_MAIN_RES_DIR + 'config/liquibase/users.csv', SERVER_MAIN_RES_DIR + 'config/liquibase/users.csv');
                this.copy(SERVER_MAIN_RES_DIR + 'config/liquibase/authorities.csv', SERVER_MAIN_RES_DIR + 'config/liquibase/authorities.csv');
                this.copy(SERVER_MAIN_RES_DIR + 'config/liquibase/users_authorities.csv', SERVER_MAIN_RES_DIR + 'config/liquibase/users_authorities.csv');
                if (this.authenticationType === 'oauth2') {
                    this.copy(SERVER_MAIN_RES_DIR + 'config/liquibase/oauth_client_details.csv', SERVER_MAIN_RES_DIR + 'config/liquibase/oauth_client_details.csv');
                }
            }

            // Email templates
            this.copy(SERVER_MAIN_RES_DIR + 'mails/activationEmail.html', SERVER_MAIN_RES_DIR + 'mails/activationEmail.html');
            this.copy(SERVER_MAIN_RES_DIR + 'mails/creationEmail.html', SERVER_MAIN_RES_DIR + 'mails/creationEmail.html');
            this.copy(SERVER_MAIN_RES_DIR + 'mails/passwordResetEmail.html', SERVER_MAIN_RES_DIR + 'mails/passwordResetEmail.html');
            if (this.enableSocialSignIn) {
                this.copy(SERVER_MAIN_RES_DIR + 'mails/socialRegistrationValidationEmail.html', SERVER_MAIN_RES_DIR + 'mails/socialRegistrationValidationEmail.html');
            }

            /* User management java domain files */
            this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_User.java', javaDir + 'domain/User.java', this, {});

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/domain/_Authority.java', javaDir + 'domain/Authority.java', this, {});
            }

            /* User management java repo files */
            if (this.searchEngine === 'elasticsearch') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/search/_UserSearchRepository.java', javaDir + 'repository/search/UserSearchRepository.java', this, {});
            }
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_CustomAuditEventRepository.java', javaDir + 'repository/CustomAuditEventRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_AuthorityRepository.java', javaDir + 'repository/AuthorityRepository.java', this, {});
                this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_PersistenceAuditEventRepository.java', javaDir + 'repository/PersistenceAuditEventRepository.java', this, {});

            }
            this.template(SERVER_MAIN_SRC_DIR + 'package/repository/_UserRepository.java', javaDir + 'repository/UserRepository.java', this, {});

            /* User management java service files */
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/_UserService.java', javaDir + 'service/UserService.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/_MailService.java', javaDir + 'service/MailService.java', this, {});
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/service/_AuditEventService.java', javaDir + 'service/AuditEventService.java', this, {});
            }

            /* User management java web files */
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/dto/_package-info.java', javaDir + 'service/dto/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/dto/_UserDTO.java', javaDir + 'service/dto/UserDTO.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/vm/_ManagedUserVM.java', javaDir + 'web/rest/vm/ManagedUserVM.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_UserResource.java', javaDir + 'web/rest/UserResource.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_AccountResource.java', javaDir + 'web/rest/AccountResource.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/vm/_KeyAndPasswordVM.java', javaDir + 'web/rest/vm/KeyAndPasswordVM.java', this, {});

            this.template(SERVER_MAIN_SRC_DIR + 'package/service/mapper/_package-info.java', javaDir + 'service/mapper/package-info.java', this, {});
            this.template(SERVER_MAIN_SRC_DIR + 'package/service/mapper/_UserMapper.java', javaDir + 'service/mapper/UserMapper.java', this, {});


            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_MAIN_SRC_DIR + 'package/web/rest/_AuditResource.java', javaDir + 'web/rest/AuditResource.java', this, {});
            }

            /* User management java test files */
            var testDir = this.testDir;

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_TEST_SRC_DIR + 'package/service/_UserServiceIntTest.java', testDir + 'service/UserServiceIntTest.java', this, {});
            }
            this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_UserResourceIntTest.java', testDir + 'web/rest/UserResourceIntTest.java', this, {});
            if (this.enableSocialSignIn) {
                this.template(SERVER_TEST_SRC_DIR + 'package/repository/_CustomSocialUsersConnectionRepositoryIntTest.java', testDir + 'repository/CustomSocialUsersConnectionRepositoryIntTest.java', this, {});
                this.template(SERVER_TEST_SRC_DIR + 'package/service/_SocialServiceIntTest.java', testDir + 'service/SocialServiceIntTest.java', this, {});
            }

            this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_AccountResourceIntTest.java', testDir + 'web/rest/AccountResourceIntTest.java', this, {});
            this.template(SERVER_TEST_SRC_DIR + 'package/security/_SecurityUtilsUnitTest.java', testDir + 'security/SecurityUtilsUnitTest.java', this, {});

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(SERVER_TEST_SRC_DIR + 'package/web/rest/_AuditResourceIntTest.java', testDir + 'web/rest/AuditResourceIntTest.java', this, {});
            }
            //Cucumber user management tests
            if (this.testFrameworks.indexOf('cucumber') !== -1) {
                this.template(SERVER_TEST_SRC_DIR + 'package/cucumber/stepdefs/_UserStepDefs.java', testDir + 'cucumber/stepdefs/UserStepDefs.java', this, {});
                this.copy('src/test/features/user/user.feature', 'src/test/features/user/user.feature');
            }
        }
    };
}
