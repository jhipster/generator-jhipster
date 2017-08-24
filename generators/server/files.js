/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const mkdirp = require('mkdirp');
const cleanup = require('../cleanup');
const constants = require('../generator-constants');

/* Constants use throughout */
const INTERPOLATE_REGEX = constants.INTERPOLATE_REGEX;
const DOCKER_DIR = constants.DOCKER_DIR;
const TEST_DIR = constants.TEST_DIR;
const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;
const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const SERVER_TEST_SRC_DIR = constants.SERVER_TEST_SRC_DIR;
const SERVER_TEST_RES_DIR = constants.SERVER_TEST_RES_DIR;

module.exports = {
    writeFiles
};

let javaDir;

function writeFiles() {
    return {

        setUpJavaDir() {
            javaDir = this.javaDir = `${constants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
        },

        cleanupOldServerFiles() {
            cleanup.cleanupOldServerFiles(this, this.javaDir, this.testDir);
        },

        writeGlobalFiles() {
            this.template('_README.md', 'README.md');
            this.template('gitignore', '.gitignore');
            this.copy('gitattributes', '.gitattributes');
            this.copy('editorconfig', '.editorconfig');
        },

        writeDockerFiles() {
            // Create Docker and Docker Compose files
            this.template(`${DOCKER_DIR}_Dockerfile`, `${DOCKER_DIR}Dockerfile`);
            this.template(`${DOCKER_DIR}_app.yml`, `${DOCKER_DIR}app.yml`);
            if (this.prodDatabaseType === 'mysql') {
                this.template(`${DOCKER_DIR}_mysql.yml`, `${DOCKER_DIR}mysql.yml`);
            }
            if (this.prodDatabaseType === 'mariadb') {
                this.template(`${DOCKER_DIR}_mariadb.yml`, `${DOCKER_DIR}mariadb.yml`);
            }
            if (this.prodDatabaseType === 'postgresql') {
                this.template(`${DOCKER_DIR}_postgresql.yml`, `${DOCKER_DIR}postgresql.yml`);
            }
            if (this.prodDatabaseType === 'mongodb') {
                this.template(`${DOCKER_DIR}_mongodb.yml`, `${DOCKER_DIR}mongodb.yml`);
                this.template(`${DOCKER_DIR}_mongodb-cluster.yml`, `${DOCKER_DIR}mongodb-cluster.yml`);
                this.template(`${DOCKER_DIR}mongodb/MongoDB.Dockerfile`, `${DOCKER_DIR}mongodb/MongoDB.Dockerfile`);
                this.template(`${DOCKER_DIR}mongodb/scripts/init_replicaset.js`, `${DOCKER_DIR}mongodb/scripts/init_replicaset.js`);
            }
            if (this.prodDatabaseType === 'mssql') {
                this.template(`${DOCKER_DIR}_mssql.yml`, `${DOCKER_DIR}mssql.yml`);
            }
            if (this.prodDatabaseType === 'oracle') {
                this.template(`${DOCKER_DIR}_oracle.yml`, `${DOCKER_DIR}oracle.yml`);
            }
            if (this.prodDatabaseType === 'cassandra') {
                // docker-compose files
                this.template(`${DOCKER_DIR}_cassandra.yml`, `${DOCKER_DIR}cassandra.yml`);
                this.template(`${DOCKER_DIR}_cassandra-cluster.yml`, `${DOCKER_DIR}cassandra-cluster.yml`);
                this.template(`${DOCKER_DIR}_cassandra-migration.yml`, `${DOCKER_DIR}cassandra-migration.yml`);
                // dockerfiles
                this.template(`${DOCKER_DIR}cassandra/_Cassandra-Migration.Dockerfile`, `${DOCKER_DIR}cassandra/Cassandra-Migration.Dockerfile`);
                // scripts
                this.template(`${DOCKER_DIR}cassandra/scripts/_autoMigrate.sh`, `${DOCKER_DIR}cassandra/scripts/autoMigrate.sh`);
                this.template(`${DOCKER_DIR}cassandra/scripts/_execute-cql.sh`, `${DOCKER_DIR}cassandra/scripts/execute-cql.sh`);
            }
            if (this.searchEngine === 'elasticsearch') {
                this.template(`${DOCKER_DIR}_elasticsearch.yml`, `${DOCKER_DIR}elasticsearch.yml`);
            }
            if (this.messageBroker === 'kafka') {
                this.template(`${DOCKER_DIR}_kafka.yml`, `${DOCKER_DIR}kafka.yml`);
            }
            if (this.serviceDiscoveryType) {
                this.template(`${DOCKER_DIR}config/_README.md`, `${DOCKER_DIR}central-server-config/README.md`);

                if (this.serviceDiscoveryType === 'consul') {
                    this.template(`${DOCKER_DIR}_consul.yml`, `${DOCKER_DIR}consul.yml`);
                    this.copy(`${DOCKER_DIR}config/git2consul.json`, `${DOCKER_DIR}config/git2consul.json`);
                    this.copy(`${DOCKER_DIR}config/consul-config/application.yml`, `${DOCKER_DIR}central-server-config/application.yml`);
                }
                if (this.serviceDiscoveryType === 'eureka') {
                    this.template(`${DOCKER_DIR}_jhipster-registry.yml`, `${DOCKER_DIR}jhipster-registry.yml`);
                    this.copy(`${DOCKER_DIR}config/docker-config/application.yml`, `${DOCKER_DIR}central-server-config/docker-config/application.yml`);
                    this.copy(`${DOCKER_DIR}config/localhost-config/application.yml`, `${DOCKER_DIR}central-server-config/localhost-config/application.yml`);
                }
            }


            this.template(`${DOCKER_DIR}_sonar.yml`, `${DOCKER_DIR}sonar.yml`);
        },

        writeServerBuildFiles() {
            switch (this.buildTool) {
            case 'gradle':
                this.template('_build.gradle', 'build.gradle');
                this.template('_settings.gradle', 'settings.gradle');
                this.template('_gradle.properties', 'gradle.properties');
                if (!this.skipClient && this.clientFramework === 'angular1') {
                    this.template('gradle/_yeoman.gradle', 'gradle/yeoman.gradle');
                }
                this.template('gradle/_sonar.gradle', 'gradle/sonar.gradle');
                this.template('gradle/_docker.gradle', 'gradle/docker.gradle');
                this.template('gradle/_profile_dev.gradle', 'gradle/profile_dev.gradle', this, { interpolate: INTERPOLATE_REGEX });
                this.template('gradle/_profile_prod.gradle', 'gradle/profile_prod.gradle', this, { interpolate: INTERPOLATE_REGEX });
                this.template('gradle/_mapstruct.gradle', 'gradle/mapstruct.gradle', this, { interpolate: INTERPOLATE_REGEX });
                this.template('gradle/_graphite.gradle', 'gradle/graphite.gradle');
                this.template('gradle/_prometheus.gradle', 'gradle/prometheus.gradle');
                this.template('gradle/_zipkin.gradle', 'gradle/zipkin.gradle');
                if (this.gatlingTests) {
                    this.template('gradle/_gatling.gradle', 'gradle/gatling.gradle');
                }
                if (this.databaseType === 'sql') {
                    this.template('gradle/_liquibase.gradle', 'gradle/liquibase.gradle');
                }
                if (this.enableSwaggerCodegen) {
                    this.template('gradle/_swagger.gradle', 'gradle/swagger.gradle');
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
                this.template('_pom.xml', 'pom.xml', null, { interpolate: INTERPOLATE_REGEX });
            }
        },

        writeServerResourceFiles() {
            // Create Java resource files
            mkdirp(SERVER_MAIN_RES_DIR);
            this.copy(`${SERVER_MAIN_RES_DIR}banner.txt`, `${SERVER_MAIN_RES_DIR}banner.txt`);

            if (this.devDatabaseType === 'h2Disk' || this.devDatabaseType === 'h2Memory') {
                this.template(`${SERVER_MAIN_RES_DIR}h2.server.properties`, `${SERVER_MAIN_RES_DIR}.h2.server.properties`);
            }

            // Thymeleaf templates
            this.copy(`${SERVER_MAIN_RES_DIR}templates/error.html`, `${SERVER_MAIN_RES_DIR}templates/error.html`);

            this.template(`${SERVER_MAIN_RES_DIR}_logback-spring.xml`, `${SERVER_MAIN_RES_DIR}logback-spring.xml`, this, { interpolate: INTERPOLATE_REGEX });

            this.template(`${SERVER_MAIN_RES_DIR}config/_application.yml`, `${SERVER_MAIN_RES_DIR}config/application.yml`);
            this.template(`${SERVER_MAIN_RES_DIR}config/_application-dev.yml`, `${SERVER_MAIN_RES_DIR}config/application-dev.yml`);
            this.template(`${SERVER_MAIN_RES_DIR}config/_application-prod.yml`, `${SERVER_MAIN_RES_DIR}config/application-prod.yml`);

            if (this.enableSwaggerCodegen) {
                this.template(`${SERVER_MAIN_RES_DIR}swagger/_api.yml`, `${SERVER_MAIN_RES_DIR}swagger/api.yml`);
            }

            if (this.databaseType === 'sql') {
                this.template(`${SERVER_MAIN_RES_DIR}/config/liquibase/changelog/_initial_schema.xml`, `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`, this, { interpolate: INTERPOLATE_REGEX });
                this.copy(`${SERVER_MAIN_RES_DIR}/config/liquibase/master.xml`, `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`);
            }

            if (this.databaseType === 'mongodb') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/dbmigrations/_package-info.java`, `${javaDir}config/dbmigrations/package-info.java`);
                if (!this.skipUserManagement) {
                    this.template(`${SERVER_MAIN_SRC_DIR}package/config/dbmigrations/_InitialSetupMigration.java`, `${javaDir}config/dbmigrations/InitialSetupMigration.java`);
                }
            }

            if (this.databaseType === 'cassandra') {
                this.template(`${SERVER_MAIN_RES_DIR}config/cql/_create-keyspace-prod.cql`, `${SERVER_MAIN_RES_DIR}config/cql/create-keyspace-prod.cql`);
                this.template(`${SERVER_MAIN_RES_DIR}config/cql/_create-keyspace.cql`, `${SERVER_MAIN_RES_DIR}config/cql/create-keyspace.cql`);
                this.template(`${SERVER_MAIN_RES_DIR}config/cql/_drop-keyspace.cql`, `${SERVER_MAIN_RES_DIR}config/cql/drop-keyspace.cql`);
                this.copy(`${SERVER_MAIN_RES_DIR}config/cql/changelog/README.md`, `${SERVER_MAIN_RES_DIR}config/cql/changelog/README.md`);

                /* Skip the code below for --skip-user-management */
                if (this.skipUserManagement) return;
                if (this.applicationType !== 'microservice' && this.databaseType === 'cassandra') {
                    this.template(`${SERVER_MAIN_RES_DIR}config/cql/changelog/_create-tables.cql`, `${SERVER_MAIN_RES_DIR}config/cql/changelog/00000000000000_create-tables.cql`);
                    this.template(`${SERVER_MAIN_RES_DIR}config/cql/changelog/_insert_default_users.cql`, `${SERVER_MAIN_RES_DIR}config/cql/changelog/00000000000001_insert_default_users.cql`);
                }
            }

            if (this.applicationType === 'uaa') {
                this.generateKeyStore();
            }
        },

        writeServerPropertyFiles() {
            this.template(`../../languages/templates/${SERVER_MAIN_RES_DIR}i18n/_messages_en.properties`, `${SERVER_MAIN_RES_DIR}i18n/messages.properties`);
        },

        writeServerJavaAuthConfigFiles() {
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/security/_SpringSecurityAuditorAware.java`, `${javaDir}security/SpringSecurityAuditorAware.java`);
            }
            this.template(`${SERVER_MAIN_SRC_DIR}package/security/_SecurityUtils.java`, `${javaDir}security/SecurityUtils.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/security/_AuthoritiesConstants.java`, `${javaDir}security/AuthoritiesConstants.java`);

            if (this.authenticationType === 'jwt') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/security/jwt/_TokenProvider.java`, `${javaDir}security/jwt/TokenProvider.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/security/jwt/_JWTConfigurer.java`, `${javaDir}security/jwt/JWTConfigurer.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/security/jwt/_JWTFilter.java`, `${javaDir}security/jwt/JWTFilter.java`);
            }

            /* Skip the code below for --skip-user-management */
            if (this.skipUserManagement) return;

            if (this.applicationType === 'uaa') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/_UaaWebSecurityConfiguration.java`, `${javaDir}config/UaaWebSecurityConfiguration.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/_UaaConfiguration.java`, `${javaDir}config/UaaConfiguration.java`);
            } else {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/_SecurityConfiguration.java`, `${javaDir}config/SecurityConfiguration.java`);
            }

            if (this.authenticationType === 'session') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/domain/_PersistentToken.java`, `${javaDir}domain/PersistentToken.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_PersistentTokenRepository.java`, `${javaDir}repository/PersistentTokenRepository.java`);
            }

            this.template(`${SERVER_MAIN_SRC_DIR}package/security/_DomainUserDetailsService.java`, `${javaDir}security/DomainUserDetailsService.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/security/_UserNotActivatedException.java`, `${javaDir}security/UserNotActivatedException.java`);


            if (this.authenticationType === 'jwt') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/vm/_LoginVM.java`, `${javaDir}web/rest/vm/LoginVM.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/_UserJWTController.java`, `${javaDir}web/rest/UserJWTController.java`);
            }

            if (this.authenticationType === 'oauth2') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/_OAuth2ServerConfiguration.java`, `${javaDir}config/OAuth2ServerConfiguration.java`);
            }

            if (this.databaseType === 'mongodb' && this.authenticationType === 'oauth2') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/oauth2/_OAuth2AuthenticationReadConverter.java`, `${javaDir}config/oauth2/OAuth2AuthenticationReadConverter.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/oauth2/_MongoDBApprovalStore.java`, `${javaDir}config/oauth2/MongoDBApprovalStore.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/oauth2/_MongoDBAuthorizationCodeServices.java`, `${javaDir}config/oauth2/MongoDBAuthorizationCodeServices.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/oauth2/_MongoDBClientDetailsService.java`, `${javaDir}config/oauth2/MongoDBClientDetailsService.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/oauth2/_MongoDBTokenStore.java`, `${javaDir}config/oauth2/MongoDBTokenStore.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/domain/_OAuth2AuthenticationAccessToken.java`, `${javaDir}domain/OAuth2AuthenticationAccessToken.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/domain/_OAuth2AuthenticationApproval.java`, `${javaDir}domain/OAuth2AuthenticationApproval.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/domain/_OAuth2AuthenticationClientDetails.java`, `${javaDir}domain/OAuth2AuthenticationClientDetails.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/domain/_OAuth2AuthenticationCode.java`, `${javaDir}domain/OAuth2AuthenticationCode.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/domain/_OAuth2AuthenticationRefreshToken.java`, `${javaDir}domain/OAuth2AuthenticationRefreshToken.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_OAuth2AccessTokenRepository.java`, `${javaDir}repository/OAuth2AccessTokenRepository.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_OAuth2ApprovalRepository.java`, `${javaDir}repository/OAuth2ApprovalRepository.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_OAuth2ClientDetailsRepository.java`, `${javaDir}repository/OAuth2ClientDetailsRepository.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_OAuth2CodeRepository.java`, `${javaDir}repository/OAuth2CodeRepository.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_OAuth2RefreshTokenRepository.java`, `${javaDir}repository/OAuth2RefreshTokenRepository.java`);
            }

            this.template(`${SERVER_MAIN_SRC_DIR}package/security/_package-info.java`, `${javaDir}security/package-info.java`);

            if (this.authenticationType === 'session') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/security/_PersistentTokenRememberMeServices.java`, `${javaDir}security/PersistentTokenRememberMeServices.java`);
            }

            if (this.enableSocialSignIn) {
                this.template(`${SERVER_MAIN_SRC_DIR}package/security/social/_package-info.java`, `${javaDir}security/social/package-info.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/social/_SocialConfiguration.java`, `${javaDir}config/social/SocialConfiguration.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/domain/_SocialUserConnection.java`, `${javaDir}domain/SocialUserConnection.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_CustomSocialConnectionRepository.java`, `${javaDir}repository/CustomSocialConnectionRepository.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_CustomSocialUsersConnectionRepository.java`, `${javaDir}repository/CustomSocialUsersConnectionRepository.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_SocialUserConnectionRepository.java`, `${javaDir}repository/SocialUserConnectionRepository.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/security/social/_CustomSignInAdapter.java`, `${javaDir}security/social/CustomSignInAdapter.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/security/social/_package-info.java`, `${javaDir}security/social/package-info.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/service/_SocialService.java`, `${javaDir}service/SocialService.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/_SocialController.java`, `${javaDir}web/rest/SocialController.java`);
            }
        },

        writeServerJavaGatewayFiles() {
            if (this.applicationType !== 'gateway') return;

            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_GatewayConfiguration.java`, `${javaDir}config/GatewayConfiguration.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/config/apidoc/_GatewaySwaggerResourcesProvider.java`, `${javaDir}config/apidoc/GatewaySwaggerResourcesProvider.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/gateway/ratelimiting/_RateLimitingFilter.java`, `${javaDir}gateway/ratelimiting/RateLimitingFilter.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/gateway/_TokenRelayFilter.java`, `${javaDir}gateway/TokenRelayFilter.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/gateway/accesscontrol/_AccessControlFilter.java`, `${javaDir}gateway/accesscontrol/AccessControlFilter.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/gateway/responserewriting/_SwaggerBasePathRewritingFilter.java`, `${javaDir}gateway/responserewriting/SwaggerBasePathRewritingFilter.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/vm/_RouteVM.java`, `${javaDir}web/rest/vm/RouteVM.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/_GatewayResource.java`, `${javaDir}web/rest/GatewayResource.java`);
        },

        writeServerMicroserviceFiles() {
            if (this.applicationType !== 'microservice' && !(this.applicationType === 'gateway' && this.authenticationType === 'uaa')) return;

            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_MicroserviceSecurityConfiguration.java`, `${javaDir}config/MicroserviceSecurityConfiguration.java`);
            if (this.applicationType === 'microservice' && this.authenticationType === 'uaa') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/_FeignConfiguration.java`, `${javaDir}config/FeignConfiguration.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/client/_AuthorizedFeignClient.java`, `${javaDir}client/AuthorizedFeignClient.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/client/_OAuth2InterceptedFeignConfiguration.java`, `${javaDir}client/OAuth2InterceptedFeignConfiguration.java`);
            }
            this.copy(`${SERVER_MAIN_RES_DIR}static/microservices_index.html`, `${SERVER_MAIN_RES_DIR}static/index.html`);
        },

        writeServerMicroserviceAndGatewayFiles() {
            if (!this.serviceDiscoveryType) return;

            this.template(`${SERVER_MAIN_RES_DIR}config/_bootstrap.yml`, `${SERVER_MAIN_RES_DIR}config/bootstrap.yml`);
            this.template(`${SERVER_MAIN_RES_DIR}config/_bootstrap-prod.yml`, `${SERVER_MAIN_RES_DIR}config/bootstrap-prod.yml`);
        },

        writeServerJavaAppFiles() {
            // Create Java files
            // Spring Boot main
            this.template(`${SERVER_MAIN_SRC_DIR}package/_Application.java`, `${javaDir}/${this.mainClass}.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/_ApplicationWebXml.java`, `${javaDir}/ApplicationWebXml.java`);
        },

        writeServerJavaConfigFiles() {
            this.template(`${SERVER_MAIN_SRC_DIR}package/aop/logging/_LoggingAspect.java`, `${javaDir}aop/logging/LoggingAspect.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_DefaultProfileUtil.java`, `${javaDir}config/DefaultProfileUtil.java`);

            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_package-info.java`, `${javaDir}config/package-info.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_AsyncConfiguration.java`, `${javaDir}config/AsyncConfiguration.java`);
            if (this.hibernateCache === 'ehcache' || this.hibernateCache === 'hazelcast' || this.hibernateCache === 'infinispan' || this.clusteredHttpSession === 'hazelcast' || this.applicationType === 'gateway') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/_CacheConfiguration.java`, `${javaDir}config/CacheConfiguration.java`);
            }
            if (this.hibernateCache === 'infinispan') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/_CacheFactoryConfiguration.java`, `${javaDir}config/CacheFactoryConfiguration.java`);
            }
            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_Constants.java`, `${javaDir}config/Constants.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_DateTimeFormatConfiguration.java`, `${javaDir}config/DateTimeFormatConfiguration.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_LoggingConfiguration.java`, `${javaDir}config/LoggingConfiguration.java`);

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/_CloudDatabaseConfiguration.java`, `${javaDir}config/CloudDatabaseConfiguration.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/_DatabaseConfiguration.java`, `${javaDir}config/DatabaseConfiguration.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/audit/_package-info.java`, `${javaDir}config/audit/package-info.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/audit/_AuditEventConverter.java`, `${javaDir}config/audit/AuditEventConverter.java`);
            }

            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_ApplicationProperties.java`, `${javaDir}config/ApplicationProperties.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_JacksonConfiguration.java`, `${javaDir}config/JacksonConfiguration.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_LocaleConfiguration.java`, `${javaDir}config/LocaleConfiguration.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_LoggingAspectConfiguration.java`, `${javaDir}config/LoggingAspectConfiguration.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_MetricsConfiguration.java`, `${javaDir}config/MetricsConfiguration.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_ThymeleafConfiguration.java`, `${javaDir}config/ThymeleafConfiguration.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/config/_WebConfigurer.java`, `${javaDir}config/WebConfigurer.java`);
            if (this.websocket === 'spring-websocket') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/_WebsocketConfiguration.java`, `${javaDir}config/WebsocketConfiguration.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/_WebsocketSecurityConfiguration.java`, `${javaDir}config/WebsocketSecurityConfiguration.java`);
            }

            if (this.databaseType === 'cassandra') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/metrics/_package-info.java`, `${javaDir}config/metrics/package-info.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/metrics/_JHipsterHealthIndicatorConfiguration.java`, `${javaDir}config/metrics/JHipsterHealthIndicatorConfiguration.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/metrics/_CassandraHealthIndicator.java`, `${javaDir}config/metrics/CassandraHealthIndicator.java`);
            }

            if (this.databaseType === 'cassandra') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/cassandra/_CassandraConfiguration.java`, `${javaDir}config/cassandra/CassandraConfiguration.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/cassandra/_package-info.java`, `${javaDir}config/cassandra/package-info.java`);
            }
            if (this.searchEngine === 'elasticsearch') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/_ElasticsearchConfiguration.java`, `${javaDir}config/ElasticsearchConfiguration.java`);
            }
            if (this.messageBroker === 'kafka') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/config/_MessagingConfiguration.java`, `${javaDir}config/MessagingConfiguration.java`);
            }
        },

        writeServerJavaDomainFiles() {
            this.template(`${SERVER_MAIN_SRC_DIR}package/domain/_package-info.java`, `${javaDir}domain/package-info.java`);

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/domain/_AbstractAuditingEntity.java`, `${javaDir}domain/AbstractAuditingEntity.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/domain/_PersistentAuditEvent.java`, `${javaDir}domain/PersistentAuditEvent.java`);
            }
        },

        writeServerJavaPackageInfoFiles() {
            if (this.searchEngine === 'elasticsearch') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/search/_package-info.java`, `${javaDir}repository/search/package-info.java`);
            }
            this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_package-info.java`, `${javaDir}repository/package-info.java`);
        },

        writeServerJavaServiceFiles() {
            this.template(`${SERVER_MAIN_SRC_DIR}package/service/_package-info.java`, `${javaDir}service/package-info.java`);

            /* Skip the code below for --skip-user-management */
            if (this.skipUserManagement) return;

            this.template(`${SERVER_MAIN_SRC_DIR}package/service/util/_RandomUtil.java`, `${javaDir}service/util/RandomUtil.java`);
        },

        writeServerJavaWebErrorFiles() {
            // error handler code - server side
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/_ErrorConstants.java`, `${javaDir}web/rest/errors/ErrorConstants.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/_CustomParameterizedException.java`, `${javaDir}web/rest/errors/CustomParameterizedException.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/_ErrorVM.java`, `${javaDir}web/rest/errors/ErrorVM.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/_ExceptionTranslator.java`, `${javaDir}web/rest/errors/ExceptionTranslator.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/_FieldErrorVM.java`, `${javaDir}web/rest/errors/FieldErrorVM.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/errors/_ParameterizedErrorVM.java`, `${javaDir}web/rest/errors/ParameterizedErrorVM.java`);
        },

        writeServerJavaWebFiles() {
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/vm/_package-info.java`, `${javaDir}web/rest/vm/package-info.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/vm/_LoggerVM.java`, `${javaDir}web/rest/vm/LoggerVM.java`);

            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/util/_HeaderUtil.java`, `${javaDir}web/rest/util/HeaderUtil.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/util/_PaginationUtil.java`, `${javaDir}web/rest/util/PaginationUtil.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/_package-info.java`, `${javaDir}web/rest/package-info.java`);

            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/_LogsResource.java`, `${javaDir}web/rest/LogsResource.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/_ProfileInfoResource.java`, `${javaDir}web/rest/ProfileInfoResource.java`);
        },

        writeServerJavaWebsocketFiles() {
            if (this.websocket !== 'spring-websocket') return;

            this.template(`${SERVER_MAIN_SRC_DIR}package/web/websocket/_package-info.java`, `${javaDir}web/websocket/package-info.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/websocket/_ActivityService.java`, `${javaDir}web/websocket/ActivityService.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/websocket/dto/_package-info.java`, `${javaDir}web/websocket/dto/package-info.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/websocket/dto/_ActivityDTO.java`, `${javaDir}web/websocket/dto/ActivityDTO.java`);
        },

        writeServerTestFwFiles() {
            // Create Test Java files
            const testDir = this.testDir;

            mkdirp(testDir);

            if (this.databaseType === 'cassandra') {
                this.template(`${SERVER_TEST_SRC_DIR}package/_CassandraKeyspaceUnitTest.java`, `${testDir}CassandraKeyspaceUnitTest.java`);
                this.template(`${SERVER_TEST_SRC_DIR}package/_AbstractCassandraTest.java`, `${testDir}AbstractCassandraTest.java`);
                this.template(`${SERVER_TEST_SRC_DIR}package/config/_CassandraTestConfiguration.java`, `${testDir}config/CassandraTestConfiguration.java`);
                this.template(`${SERVER_TEST_RES_DIR}_cassandra-random-port.yml`, `${SERVER_TEST_RES_DIR}cassandra-random-port.yml`);
            }

            this.template(`${SERVER_TEST_SRC_DIR}package/config/_WebConfigurerTest.java`, `${testDir}config/WebConfigurerTest.java`);
            this.template(`${SERVER_TEST_SRC_DIR}package/config/_WebConfigurerTestController.java`, `${testDir}config/WebConfigurerTestController.java`);
            this.template(`${SERVER_TEST_SRC_DIR}package/web/rest/_TestUtil.java`, `${testDir}web/rest/TestUtil.java`);
            this.template(`${SERVER_TEST_SRC_DIR}package/web/rest/_LogsResourceIntTest.java`, `${testDir}web/rest/LogsResourceIntTest.java`);
            this.template(`${SERVER_TEST_SRC_DIR}package/web/rest/_ProfileInfoResourceIntTest.java`, `${testDir}web/rest/ProfileInfoResourceIntTest.java`);
            this.template(`${SERVER_TEST_SRC_DIR}package/web/rest/errors/_ExceptionTranslatorIntTest.java`, `${testDir}web/rest/errors/ExceptionTranslatorIntTest.java`);
            this.template(`${SERVER_TEST_SRC_DIR}package/web/rest/errors/_ExceptionTranslatorTestController.java`, `${testDir}web/rest/errors/ExceptionTranslatorTestController.java`);
            this.template(`${SERVER_TEST_SRC_DIR}package/web/rest/util/_PaginationUtilUnitTest.java`, `${testDir}web/rest/util/PaginationUtilUnitTest.java`);

            this.template(`${SERVER_TEST_RES_DIR}config/_application.yml`, `${SERVER_TEST_RES_DIR}config/application.yml`);
            this.template(`${SERVER_TEST_RES_DIR}_logback.xml`, `${SERVER_TEST_RES_DIR}logback.xml`);

            // Create Gateway tests files
            if (this.applicationType === 'gateway') {
                this.template(`${SERVER_TEST_SRC_DIR}package/gateway/responserewriting/_SwaggerBasePathRewritingFilterTest.java`, `${testDir}gateway/responserewriting/SwaggerBasePathRewritingFilterTest.java`);
            }
            if (this.serviceDiscoveryType) {
                this.template(`${SERVER_TEST_RES_DIR}config/_bootstrap.yml`, `${SERVER_TEST_RES_DIR}config/bootstrap.yml`);
            }

            if (this.authenticationType === 'uaa') {
                this.template(`${SERVER_TEST_SRC_DIR}package/security/_OAuth2TokenMockUtil.java`, `${testDir}security/OAuth2TokenMockUtil.java`);
                this.template(`${SERVER_TEST_SRC_DIR}package/config/_SecurityBeanOverrideConfiguration.java`, `${testDir}config/SecurityBeanOverrideConfiguration.java`);
            }

            // Create Gatling test files
            if (this.gatlingTests) {
                this.copy(`${TEST_DIR}gatling/conf/gatling.conf`, `${TEST_DIR}gatling/conf/gatling.conf`);
                this.copy(`${TEST_DIR}gatling/conf/logback.xml`, `${TEST_DIR}gatling/conf/logback.xml`);
                mkdirp(`${TEST_DIR}gatling/user-files/data`);
                mkdirp(`${TEST_DIR}gatling/user-files/bodies`);
                mkdirp(`${TEST_DIR}gatling/user-files/simulations`);
            }

            // Create Cucumber test files
            if (this.cucumberTests) {
                this.template(`${SERVER_TEST_SRC_DIR}package/cucumber/_CucumberTest.java`, `${testDir}cucumber/CucumberTest.java`);
                this.template(`${SERVER_TEST_SRC_DIR}package/cucumber/stepdefs/_StepDefs.java`, `${testDir}cucumber/stepdefs/StepDefs.java`);
                this.copy(`${TEST_DIR}features/gitkeep`, `${TEST_DIR}features/.gitkeep`);
            }

            // Create Elasticsearch test files
            if (this.searchEngine === 'elasticsearch') {
                this.template(`${SERVER_TEST_SRC_DIR}package/config/elasticsearch/_IndexReinitializer.java`, `${testDir}config/elasticsearch/IndexReinitializer.java`);
            }
        },

        writeJavaUserManagementFiles() {
            if (this.skipUserManagement) return;
            // user management related files

            /* User management resources files */
            if (this.databaseType === 'sql') {
                this.template(`${SERVER_MAIN_RES_DIR}config/liquibase/users.csv`, `${SERVER_MAIN_RES_DIR}config/liquibase/users.csv`);
                this.copy(`${SERVER_MAIN_RES_DIR}config/liquibase/authorities.csv`, `${SERVER_MAIN_RES_DIR}config/liquibase/authorities.csv`);
                this.copy(`${SERVER_MAIN_RES_DIR}config/liquibase/users_authorities.csv`, `${SERVER_MAIN_RES_DIR}config/liquibase/users_authorities.csv`);
                if (this.authenticationType === 'oauth2') {
                    this.template(`${SERVER_MAIN_RES_DIR}config/liquibase/oauth_client_details.csv`, `${SERVER_MAIN_RES_DIR}config/liquibase/oauth_client_details.csv`);
                }
            }

            // Email templates
            this.copy(`${SERVER_MAIN_RES_DIR}mails/activationEmail.html`, `${SERVER_MAIN_RES_DIR}mails/activationEmail.html`);
            this.copy(`${SERVER_MAIN_RES_DIR}mails/creationEmail.html`, `${SERVER_MAIN_RES_DIR}mails/creationEmail.html`);
            this.copy(`${SERVER_MAIN_RES_DIR}mails/passwordResetEmail.html`, `${SERVER_MAIN_RES_DIR}mails/passwordResetEmail.html`);
            if (this.enableSocialSignIn) {
                this.copy(`${SERVER_MAIN_RES_DIR}mails/socialRegistrationValidationEmail.html`, `${SERVER_MAIN_RES_DIR}mails/socialRegistrationValidationEmail.html`);
            }

            /* User management java domain files */
            this.template(`${SERVER_MAIN_SRC_DIR}package/domain/_User.java`, `${javaDir}domain/User.java`);

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/domain/_Authority.java`, `${javaDir}domain/Authority.java`);
            }

            /* User management java repo files */
            if (this.searchEngine === 'elasticsearch') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/search/_UserSearchRepository.java`, `${javaDir}repository/search/UserSearchRepository.java`);
            }
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_CustomAuditEventRepository.java`, `${javaDir}repository/CustomAuditEventRepository.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_AuthorityRepository.java`, `${javaDir}repository/AuthorityRepository.java`);
                this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_PersistenceAuditEventRepository.java`, `${javaDir}repository/PersistenceAuditEventRepository.java`);
            }
            this.template(`${SERVER_MAIN_SRC_DIR}package/repository/_UserRepository.java`, `${javaDir}repository/UserRepository.java`);

            /* User management java service files */
            this.template(`${SERVER_MAIN_SRC_DIR}package/service/_UserService.java`, `${javaDir}service/UserService.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/service/_MailService.java`, `${javaDir}service/MailService.java`);
            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/service/_AuditEventService.java`, `${javaDir}service/AuditEventService.java`);
            }

            /* User management java web files */
            this.template(`${SERVER_MAIN_SRC_DIR}package/service/dto/_package-info.java`, `${javaDir}service/dto/package-info.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/service/dto/_UserDTO.java`, `${javaDir}service/dto/UserDTO.java`);

            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/vm/_ManagedUserVM.java`, `${javaDir}web/rest/vm/ManagedUserVM.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/_UserResource.java`, `${javaDir}web/rest/UserResource.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/_AccountResource.java`, `${javaDir}web/rest/AccountResource.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/vm/_KeyAndPasswordVM.java`, `${javaDir}web/rest/vm/KeyAndPasswordVM.java`);

            this.template(`${SERVER_MAIN_SRC_DIR}package/service/mapper/_package-info.java`, `${javaDir}service/mapper/package-info.java`);
            this.template(`${SERVER_MAIN_SRC_DIR}package/service/mapper/_UserMapper.java`, `${javaDir}service/mapper/UserMapper.java`);


            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(`${SERVER_MAIN_SRC_DIR}package/web/rest/_AuditResource.java`, `${javaDir}web/rest/AuditResource.java`);
            }

            /* User management java test files */
            const testDir = this.testDir;

            this.copy(`${SERVER_TEST_RES_DIR}mails/_testEmail.html`, `${SERVER_TEST_RES_DIR}mails/testEmail.html`);
            this.copy(`${SERVER_TEST_RES_DIR}i18n/_messages_en.properties`, `${SERVER_TEST_RES_DIR}i18n/messages_en.properties`);

            this.template(`${SERVER_TEST_SRC_DIR}package/service/_MailServiceIntTest.java`, `${testDir}service/MailServiceIntTest.java`);
            this.template(`${SERVER_TEST_SRC_DIR}package/service/_UserServiceIntTest.java`, `${testDir}service/UserServiceIntTest.java`);
            this.template(`${SERVER_TEST_SRC_DIR}package/web/rest/_UserResourceIntTest.java`, `${testDir}web/rest/UserResourceIntTest.java`);
            if (this.enableSocialSignIn) {
                this.template(`${SERVER_TEST_SRC_DIR}package/repository/_CustomSocialUsersConnectionRepositoryIntTest.java`, `${testDir}repository/CustomSocialUsersConnectionRepositoryIntTest.java`);
                this.template(`${SERVER_TEST_SRC_DIR}package/service/_SocialServiceIntTest.java`, `${testDir}service/SocialServiceIntTest.java`);
            }

            this.template(`${SERVER_TEST_SRC_DIR}package/web/rest/_AccountResourceIntTest.java`, `${testDir}web/rest/AccountResourceIntTest.java`);
            this.template(`${SERVER_TEST_SRC_DIR}package/security/_SecurityUtilsUnitTest.java`, `${testDir}security/SecurityUtilsUnitTest.java`);
            if (this.authenticationType === 'jwt') {
                this.template(`${SERVER_TEST_SRC_DIR}package/security/jwt/_JWTFilterTest.java`, `${testDir}security/jwt/JWTFilterTest.java`);
                this.template(`${SERVER_TEST_SRC_DIR}package/security/jwt/_TokenProviderTest.java`, `${testDir}security/jwt/TokenProviderTest.java`);
                this.template(`${SERVER_TEST_SRC_DIR}package/web/rest/_UserJWTControllerIntTest.java`, `${testDir}web/rest/UserJWTControllerIntTest.java`);
            }

            if (this.databaseType === 'sql' || this.databaseType === 'mongodb') {
                this.template(`${SERVER_TEST_SRC_DIR}package/repository/_CustomAuditEventRepositoryIntTest.java`, `${testDir}repository/CustomAuditEventRepositoryIntTest.java`);
                this.template(`${SERVER_TEST_SRC_DIR}package/web/rest/_AuditResourceIntTest.java`, `${testDir}web/rest/AuditResourceIntTest.java`);
            }
            // Cucumber user management tests
            if (this.cucumberTests) {
                this.template(`${SERVER_TEST_SRC_DIR}package/cucumber/stepdefs/_UserStepDefs.java`, `${testDir}cucumber/stepdefs/UserStepDefs.java`);
                this.copy('src/test/features/user/user.feature', 'src/test/features/user/user.feature');
            }
        }
    };
}
