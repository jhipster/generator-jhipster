/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
const REACT = constants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;
const VUE = constants.SUPPORTED_CLIENT_FRAMEWORKS.VUE;

const shouldSkipUserManagement = generator =>
  generator.skipUserManagement && (generator.applicationType !== 'monolith' || generator.authenticationType !== 'oauth2');
/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const serverFiles = {
  jib: [
    {
      path: 'src/main/docker/jib/',
      templates: ['entrypoint.sh'],
    },
  ],
  packageJson: [
    {
      condition: generator => generator.skipClient,
      templates: ['package.json'],
    },
  ],
  docker: [
    {
      path: DOCKER_DIR,
      templates: [
        'app.yml',
        'jhipster-control-center.yml',
        'sonar.yml',
        'monitoring.yml',
        'prometheus/prometheus.yml',
        'grafana/provisioning/dashboards/dashboard.yml',
        'grafana/provisioning/dashboards/JVM.json',
        'grafana/provisioning/datasources/datasource.yml',
      ],
    },
    {
      condition: generator => generator.prodDatabaseType !== 'no' && generator.prodDatabaseType !== 'oracle',
      path: DOCKER_DIR,
      templates: [{ file: generator => `${generator.prodDatabaseType}.yml` }],
    },
    {
      condition: generator => generator.prodDatabaseType === 'mongodb',
      path: DOCKER_DIR,
      templates: ['mongodb-cluster.yml', 'mongodb/MongoDB.Dockerfile', 'mongodb/scripts/init_replicaset.js'],
    },
    {
      condition: generator => generator.prodDatabaseType === 'couchbase',
      path: DOCKER_DIR,
      templates: ['couchbase-cluster.yml', 'couchbase/Couchbase.Dockerfile', 'couchbase/scripts/configure-node.sh'],
    },
    {
      condition: generator => generator.prodDatabaseType === 'cassandra',
      path: DOCKER_DIR,
      templates: [
        // docker-compose files
        'cassandra-cluster.yml',
        'cassandra-migration.yml',
        // dockerfiles
        'cassandra/Cassandra-Migration.Dockerfile',
        // scripts
        'cassandra/scripts/autoMigrate.sh',
        'cassandra/scripts/execute-cql.sh',
      ],
    },
    {
      condition: generator => generator.cacheProvider === 'hazelcast',
      path: DOCKER_DIR,
      templates: ['hazelcast-management-center.yml'],
    },
    {
      condition: generator => generator.cacheProvider === 'memcached',
      path: DOCKER_DIR,
      templates: ['memcached.yml'],
    },
    {
      condition: generator => generator.cacheProvider === 'redis',
      path: DOCKER_DIR,
      templates: ['redis.yml', 'redis-cluster.yml', 'redis/Redis-Cluster.Dockerfile', 'redis/connectRedisCluster.sh'],
    },
    {
      condition: generator => generator.searchEngine === 'elasticsearch',
      path: DOCKER_DIR,
      templates: ['elasticsearch.yml'],
    },
    {
      condition: generator => generator.messageBroker === 'kafka',
      path: DOCKER_DIR,
      templates: ['kafka.yml'],
    },
    {
      condition: generator => !!generator.serviceDiscoveryType,
      path: DOCKER_DIR,
      templates: [{ file: 'config/README.md', renameTo: () => 'central-server-config/README.md' }],
    },
    {
      condition: generator => generator.serviceDiscoveryType && generator.serviceDiscoveryType === 'consul',
      path: DOCKER_DIR,
      templates: [
        'consul.yml',
        { file: 'config/git2consul.json', method: 'copy' },
        { file: 'config/consul-config/application.yml', renameTo: () => 'central-server-config/application.yml' },
      ],
    },
    {
      condition: generator => generator.serviceDiscoveryType && generator.serviceDiscoveryType === 'eureka',
      path: DOCKER_DIR,
      templates: [
        'jhipster-registry.yml',
        {
          file: 'config/docker-config/application.yml',
          renameTo: () => 'central-server-config/docker-config/application.yml',
        },
        {
          file: 'config/localhost-config/application.yml',
          renameTo: () => 'central-server-config/localhost-config/application.yml',
        },
      ],
    },
    {
      condition: generator => !!generator.enableSwaggerCodegen,
      path: DOCKER_DIR,
      templates: ['swagger-editor.yml'],
    },
    {
      condition: generator => generator.authenticationType === 'oauth2' && generator.applicationType !== 'microservice',
      path: DOCKER_DIR,
      templates: [
        'keycloak.yml',
        { file: 'config/realm-config/jhipster-realm.json', renameTo: () => 'realm-config/jhipster-realm.json' },
        { file: 'config/realm-config/jhipster-users-0.json', method: 'copy', renameTo: () => 'realm-config/jhipster-users-0.json' },
      ],
    },
  ],
  serverBuild: [
    {
      templates: [{ file: 'checkstyle.xml', options: { interpolate: INTERPOLATE_REGEX } }],
    },
    {
      condition: generator => generator.buildTool === 'gradle',
      templates: [
        'build.gradle',
        'settings.gradle',
        'gradle.properties',
        'gradle/sonar.gradle',
        'gradle/docker.gradle',
        { file: 'gradle/profile_dev.gradle', options: { interpolate: INTERPOLATE_REGEX } },
        { file: 'gradle/profile_prod.gradle', options: { interpolate: INTERPOLATE_REGEX } },
        'gradle/war.gradle',
        'gradle/zipkin.gradle',
        { file: 'gradlew', method: 'copy', noEjs: true },
        { file: 'gradlew.bat', method: 'copy', noEjs: true },
        { file: 'gradle/wrapper/gradle-wrapper.jar', method: 'copy', noEjs: true },
        'gradle/wrapper/gradle-wrapper.properties',
      ],
    },
    {
      condition: generator => generator.buildTool === 'gradle' && !!generator.enableSwaggerCodegen,
      templates: ['gradle/swagger.gradle'],
    },
    {
      condition: generator => generator.buildTool === 'maven',
      templates: [
        { file: 'mvnw', method: 'copy', noEjs: true },
        { file: 'mvnw.cmd', method: 'copy', noEjs: true },
        { file: '.mvn/wrapper/maven-wrapper.jar', method: 'copy', noEjs: true },
        { file: '.mvn/wrapper/maven-wrapper.properties', method: 'copy', noEjs: true },
        { file: '.mvn/wrapper/MavenWrapperDownloader.java', method: 'copy', noEjs: true },
        { file: 'pom.xml', options: { interpolate: INTERPOLATE_REGEX } },
      ],
    },
  ],
  serverResource: [
    {
      condition: generator => generator.clientFramework === REACT,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'banner-react.txt',
          method: 'copy',
          noEjs: true,
          renameTo: () => 'banner.txt',
        },
      ],
    },
    {
      condition: generator => generator.clientFramework === VUE,
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'banner-vue.txt',
          method: 'copy',
          noEjs: true,
          renameTo: () => 'banner.txt',
        },
      ],
    },
    {
      condition: generator => generator.clientFramework !== REACT && generator.clientFramework !== VUE,
      path: SERVER_MAIN_RES_DIR,
      templates: [{ file: 'banner.txt', method: 'copy', noEjs: true }],
    },
    {
      condition: generator => generator.devDatabaseType === 'h2Disk' || generator.devDatabaseType === 'h2Memory',
      path: SERVER_MAIN_RES_DIR,
      templates: [{ file: 'h2.server.properties', renameTo: () => '.h2.server.properties' }],
    },
    {
      condition: generator => !!generator.enableSwaggerCodegen,
      path: SERVER_MAIN_RES_DIR,
      templates: ['swagger/api.yml'],
    },
    {
      path: SERVER_MAIN_RES_DIR,
      templates: [
        // Thymeleaf templates
        { file: 'templates/error.html', method: 'copy' },
        'logback-spring.xml',
        'config/application.yml',
        'config/application-dev.yml',
        'config/application-tls.yml',
        'config/application-prod.yml',
        'i18n/messages.properties',
      ],
    },
    {
      condition: generator => generator.databaseType === 'sql',
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          override: generator => !generator.jhipsterConfig.incrementalChangelog || generator.configOptions.recreateInitialChangelog,
          file: 'config/liquibase/changelog/initial_schema.xml',
          renameTo: () => 'config/liquibase/changelog/00000000000000_initial_schema.xml',
          options: { interpolate: INTERPOLATE_REGEX },
        },
        {
          override: generator => !generator.jhipsterConfig.incrementalChangelog || generator.configOptions.recreateInitialChangelog,
          file: 'config/liquibase/master.xml',
        },
      ],
    },
    {
      condition: generator => generator.databaseType === 'mongodb',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/dbmigrations/package-info.java',
          renameTo: generator => `${generator.javaDir}config/dbmigrations/package-info.java`,
        },
      ],
    },
    {
      condition: generator =>
        generator.databaseType === 'mongodb' &&
        (!generator.skipUserManagement || (generator.skipUserManagement && generator.authenticationType === 'oauth2')),
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/dbmigrations/InitialSetupMigration.java',
          renameTo: generator => `${generator.javaDir}config/dbmigrations/InitialSetupMigration.java`,
        },
      ],
    },
    {
      condition: generator => generator.databaseType === 'couchbase',
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/couchmove/changelog/V0__create_indexes.n1ql'],
    },
    {
      condition: generator =>
        generator.databaseType === 'couchbase' && (!generator.skipUserManagement || generator.authenticationType === 'oauth2'),
      path: SERVER_MAIN_RES_DIR,
      templates: [
        'config/couchmove/changelog/V0.1__initial_setup/ROLE_ADMIN.json',
        'config/couchmove/changelog/V0.1__initial_setup/ROLE_USER.json',
        'config/couchmove/changelog/V0.1__initial_setup/user__admin.json',
        'config/couchmove/changelog/V0.1__initial_setup/user__user.json',
      ],
    },
    {
      condition: generator =>
        generator.databaseType === 'neo4j' && (!generator.skipUserManagement || generator.authenticationType === 'oauth2'),
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/neo4j/Neo4jMigrations.java',
          renameTo: generator => `${generator.javaDir}config/neo4j/Neo4jMigrations.java`,
        },
        {
          file: 'package/config/neo4j/package-info.java',
          renameTo: generator => `${generator.javaDir}config/neo4j/package-info.java`,
        },
      ],
    },
    {
      condition: generator =>
        generator.databaseType === 'neo4j' && (!generator.skipUserManagement || generator.authenticationType === 'oauth2'),
      path: SERVER_MAIN_RES_DIR,
      templates: [
        {
          file: 'config/couchmove/changelog/V0.1__initial_setup/user__admin.json',
          renameTo: () => 'config/neo4j/migrations/user__admin.json',
        },
        {
          file: 'config/couchmove/changelog/V0.1__initial_setup/user__user.json',
          renameTo: () => 'config/neo4j/migrations/user__user.json',
        },
      ],
    },
    {
      condition: generator => generator.databaseType === 'cassandra',
      path: SERVER_MAIN_RES_DIR,
      templates: [
        'config/cql/create-keyspace-prod.cql',
        'config/cql/create-keyspace.cql',
        'config/cql/drop-keyspace.cql',
        { file: 'config/cql/changelog/README.md', method: 'copy' },
      ],
    },
    {
      condition: generator =>
        generator.databaseType === 'cassandra' &&
        generator.applicationType !== 'microservice' &&
        (!generator.skipUserManagement || generator.authenticationType === 'oauth2'),
      path: SERVER_MAIN_RES_DIR,
      templates: [
        { file: 'config/cql/changelog/create-tables.cql', renameTo: () => 'config/cql/changelog/00000000000000_create-tables.cql' },
        {
          file: 'config/cql/changelog/insert_default_users.cql',
          renameTo: () => 'config/cql/changelog/00000000000001_insert_default_users.cql',
        },
      ],
    },
  ],
  serverJavaAuthConfig: [
    {
      condition: generator =>
        !generator.reactive &&
        (generator.databaseType === 'sql' || generator.databaseType === 'mongodb' || generator.databaseType === 'couchbase'),
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/security/SpringSecurityAuditorAware.java',
          renameTo: generator => `${generator.javaDir}security/SpringSecurityAuditorAware.java`,
        },
      ],
    },
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/security/SecurityUtils.java',
          renameTo: generator => `${generator.javaDir}security/SecurityUtils.java`,
        },
        {
          file: 'package/security/AuthoritiesConstants.java',
          renameTo: generator => `${generator.javaDir}security/AuthoritiesConstants.java`,
        },
        {
          file: 'package/security/package-info.java',
          renameTo: generator => `${generator.javaDir}security/package-info.java`,
        },
      ],
    },
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/security/SecurityUtilsUnitTest.java',
          renameTo: generator => `${generator.testDir}security/SecurityUtilsUnitTest.java`,
        },
      ],
    },
    {
      condition: generator => generator.authenticationType === 'jwt',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/security/jwt/TokenProvider.java',
          renameTo: generator => `${generator.javaDir}security/jwt/TokenProvider.java`,
        },
        {
          file: 'package/security/jwt/JWTFilter.java',
          renameTo: generator => `${generator.javaDir}security/jwt/JWTFilter.java`,
        },
      ],
    },
    {
      condition: generator => generator.authenticationType === 'jwt' && !generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/security/jwt/JWTConfigurer.java',
          renameTo: generator => `${generator.javaDir}security/jwt/JWTConfigurer.java`,
        },
      ],
    },
    {
      condition: generator => generator.reactive && generator.applicationType === 'gateway' && generator.authenticationType === 'jwt',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/security/jwt/JWTRelayGatewayFilterFactory.java',
          renameTo: generator => `${generator.testDir}security/jwt/JWTRelayGatewayFilterFactory.java`,
        },
      ],
    },
    {
      condition: generator => !generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/SecurityConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/SecurityConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/SecurityConfiguration_reactive.java',
          renameTo: generator => `${generator.javaDir}config/SecurityConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationType === 'session' && !generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/security/PersistentTokenRememberMeServices.java',
          renameTo: generator => `${generator.javaDir}security/PersistentTokenRememberMeServices.java`,
        },
        {
          file: 'package/domain/PersistentToken.java',
          renameTo: generator => `${generator.javaDir}domain/PersistentToken.java`,
        },
        {
          file: 'package/repository/PersistentTokenRepository.java',
          renameTo: generator => `${generator.javaDir}repository/PersistentTokenRepository.java`,
        },
      ],
    },
    {
      condition: generator => generator.authenticationType === 'oauth2',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/security/oauth2/AudienceValidator.java',
          renameTo: generator => `${generator.javaDir}security/oauth2/AudienceValidator.java`,
        },
        {
          file: 'package/security/oauth2/JwtGrantedAuthorityConverter.java',
          renameTo: generator => `${generator.javaDir}security/oauth2/JwtGrantedAuthorityConverter.java`,
        },
        {
          file: 'package/security/oauth2/OAuthIdpTokenResponseDTO.java',
          renameTo: generator => `${generator.javaDir}security/oauth2/OAuthIdpTokenResponseDTO.java`,
        },
      ],
    },
    {
      condition: generator => generator.authenticationType === 'oauth2',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/security/oauth2/AudienceValidatorTest.java',
          renameTo: generator => `${generator.javaDir}security/oauth2/AudienceValidatorTest.java`,
        },
        {
          file: 'package/config/TestSecurityConfiguration.java',
          renameTo: generator => `${generator.testDir}config/TestSecurityConfiguration.java`,
        },
      ],
    },
    {
      condition: generator =>
        !generator.reactive &&
        generator.authenticationType === 'oauth2' &&
        (generator.applicationType === 'microservice' || generator.applicationType === 'gateway'),
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/security/oauth2/AuthorizationHeaderUtilTest.java',
          renameTo: generator => `${generator.javaDir}security/oauth2/AuthorizationHeaderUtilTest.java`,
        },
      ],
    },
    {
      condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationType !== 'oauth2',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/security/DomainUserDetailsService.java',
          renameTo: generator => `${generator.javaDir}security/DomainUserDetailsService.java`,
        },
        {
          file: 'package/security/UserNotActivatedException.java',
          renameTo: generator => `${generator.javaDir}security/UserNotActivatedException.java`,
        },
      ],
    },
    {
      condition: generator => generator.applicationType !== 'microservice' && generator.authenticationType === 'jwt',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/vm/LoginVM.java',
          renameTo: generator => `${generator.javaDir}web/rest/vm/LoginVM.java`,
        },
        {
          file: 'package/web/rest/UserJWTController.java',
          renameTo: generator => `${generator.javaDir}web/rest/UserJWTController.java`,
        },
      ],
    },
    {
      condition: generator => !!generator.enableSwaggerCodegen,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/OpenApiConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/OpenApiConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => !generator.reactive && generator.authenticationType === 'oauth2' && generator.applicationType === 'monolith',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/security/oauth2/CustomClaimConverter.java',
          renameTo: generator => `${generator.javaDir}security/oauth2/CustomClaimConverter.java`,
        },
      ],
    },
    {
      condition: generator => !generator.reactive && generator.authenticationType === 'oauth2' && generator.applicationType === 'monolith',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/security/oauth2/CustomClaimConverterIT.java',
          renameTo: generator => `${generator.javaDir}security/oauth2/CustomClaimConverterIT.java`,
        },
      ],
    },
  ],
  serverJavaGateway: [
    {
      condition: generator => generator.applicationType === 'gateway' && generator.serviceDiscoveryType,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        { file: 'package/web/rest/vm/RouteVM.java', renameTo: generator => `${generator.javaDir}web/rest/vm/RouteVM.java` },
        {
          file: 'package/web/rest/GatewayResource.java',
          renameTo: generator => `${generator.javaDir}web/rest/GatewayResource.java`,
        },
      ],
    },
    {
      condition: generator =>
        generator.authenticationType === 'oauth2' && (generator.applicationType === 'monolith' || generator.applicationType === 'gateway'),
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/AuthInfoResource.java',
          renameTo: generator => `${generator.javaDir}web/rest/AuthInfoResource.java`,
        },
        {
          file: 'package/web/rest/LogoutResource.java',
          renameTo: generator => `${generator.javaDir}web/rest/LogoutResource.java`,
        },
      ],
    },
    {
      condition: generator => generator.applicationType === 'gateway' && generator.serviceDiscoveryType && generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/apidocs/GatewaySwaggerResourcesProvider.java',
          renameTo: generator => `${generator.javaDir}config/apidocs/GatewaySwaggerResourcesProvider.java`,
        },
        {
          file: 'package/web/filter/ModifyServersOpenApiFilter.java',
          renameTo: generator => `${generator.javaDir}web/filter/ModifyServersOpenApiFilter.java`,
        },
      ],
    },
    {
      condition: generator => generator.applicationType === 'gateway' && generator.serviceDiscoveryType && generator.reactive,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/filter/ModifyServersOpenApiFilterTest.java',
          renameTo: generator => `${generator.testDir}web/filter/ModifyServersOpenApiFilterTest.java`,
        },
        {
          file: 'package/config/apidocs/GatewaySwaggerResourcesProviderTest.java',
          renameTo: generator => `${generator.testDir}config/apidocs/GatewaySwaggerResourcesProviderTest.java`,
        },
      ],
    },
  ],
  serverMicroservice: [
    {
      condition: generator =>
        !generator.reactive &&
        (generator.applicationType === 'microservice' || generator.applicationType === 'gateway') &&
        generator.authenticationType === 'jwt',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/FeignConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/FeignConfiguration.java`,
        },
        {
          file: 'package/client/JWT_UserFeignClientInterceptor.java',
          renameTo: generator => `${generator.javaDir}client/UserFeignClientInterceptor.java`,
        },
      ],
    },
    {
      condition: generator =>
        !generator.reactive &&
        generator.authenticationType === 'oauth2' &&
        (generator.applicationType === 'microservice' || generator.applicationType === 'gateway'),
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/security/oauth2/AuthorizationHeaderUtil.java',
          renameTo: generator => `${generator.javaDir}security/oauth2/AuthorizationHeaderUtil.java`,
        },
        {
          file: 'package/config/FeignConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/FeignConfiguration.java`,
        },
        {
          file: 'package/client/AuthorizedFeignClient.java',
          renameTo: generator => `${generator.javaDir}client/AuthorizedFeignClient.java`,
        },
        {
          file: 'package/client/OAuth2InterceptedFeignConfiguration.java',
          renameTo: generator => `${generator.javaDir}client/OAuth2InterceptedFeignConfiguration.java`,
        },
        {
          file: 'package/client/TokenRelayRequestInterceptor.java',
          renameTo: generator => `${generator.javaDir}client/TokenRelayRequestInterceptor.java`,
        },
      ],
    },
    {
      condition: generator => !generator.reactive && generator.applicationType === 'gateway' && !generator.serviceDiscoveryType,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/RestTemplateConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/RestTemplateConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => generator.applicationType === 'microservice',
      path: SERVER_MAIN_RES_DIR,
      templates: [{ file: 'static/microservices_index.html', renameTo: () => 'static/index.html' }],
    },
  ],
  serverMicroserviceAndGateway: [
    {
      condition: generator => generator.serviceDiscoveryType,
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/bootstrap.yml', 'config/bootstrap-prod.yml'],
    },
  ],
  serverJavaApp: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [{ file: 'package/Application.java', renameTo: generator => `${generator.javaDir}${generator.mainClass}.java` }],
    },
    {
      condition: generator => !generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [{ file: 'package/ApplicationWebXml.java', renameTo: generator => `${generator.javaDir}ApplicationWebXml.java` }],
    },
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/ArchTest.java',
          renameTo: generator => `${generator.testDir}ArchTest.java`,
        },
      ],
    },
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/IntegrationTest.java',
          renameTo: generator => `${generator.testDir}/IntegrationTest.java`,
        },
      ],
    },
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/GeneratedByJHipster.java',
          renameTo: generator => `${generator.javaDir}GeneratedByJHipster.java`,
        },
      ],
    },
  ],
  serverJavaConfig: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/aop/logging/LoggingAspect.java',
          renameTo: generator => `${generator.javaDir}aop/logging/LoggingAspect.java`,
        },
        { file: 'package/config/package-info.java', renameTo: generator => `${generator.javaDir}config/package-info.java` },
        {
          file: 'package/config/AsyncConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/AsyncConfiguration.java`,
        },
        {
          file: 'package/config/DateTimeFormatConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/DateTimeFormatConfiguration.java`,
        },
        {
          file: 'package/config/LoggingConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/LoggingConfiguration.java`,
        },
        {
          file: 'package/config/ApplicationProperties.java',
          renameTo: generator => `${generator.javaDir}config/ApplicationProperties.java`,
        },
        {
          file: 'package/config/JacksonConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/JacksonConfiguration.java`,
        },
        {
          file: 'package/config/LocaleConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/LocaleConfiguration.java`,
        },
        {
          file: 'package/config/LoggingAspectConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/LoggingAspectConfiguration.java`,
        },
        { file: 'package/config/WebConfigurer.java', renameTo: generator => `${generator.javaDir}config/WebConfigurer.java` },
      ],
    },
    {
      condition: generator => !generator.skipClient && !generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/StaticResourcesWebConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/StaticResourcesWebConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => !generator.skipUserManagement || ['sql', 'mongodb', 'couchbase', 'neo4j'].includes(generator.databaseType),
      path: SERVER_MAIN_SRC_DIR,
      templates: [{ file: 'package/config/Constants.java', renameTo: generator => `${generator.javaDir}config/Constants.java` }],
    },
    {
      condition: generator => generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/ReactorConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/ReactorConfiguration.java`,
        },
      ],
    },
    {
      condition: generator =>
        ['ehcache', 'caffeine', 'hazelcast', 'infinispan', 'memcached', 'redis'].includes(generator.cacheProvider) ||
        generator.applicationType === 'gateway',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/CacheConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/CacheConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => generator.cacheProvider === 'infinispan',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/CacheFactoryConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/CacheFactoryConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => generator.cacheProvider === 'redis',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/RedisTestContainerExtension.java',
          renameTo: generator => `${generator.testDir}RedisTestContainerExtension.java`,
        },
      ],
    },
    {
      condition: generator => generator.databaseType !== 'no',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: generator => `package/config/DatabaseConfiguration_${generator.databaseType}.java`,
          renameTo: generator => `${generator.javaDir}config/DatabaseConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => generator.databaseType === 'sql',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/LiquibaseConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/LiquibaseConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => generator.databaseType === 'sql' && generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/ColumnConverter.java',
          renameTo: generator => `${generator.javaDir}service/ColumnConverter.java`,
        },
        {
          file: 'package/service/EntityManager.java',
          renameTo: generator => `${generator.javaDir}service/EntityManager.java`,
        },
      ],
    },
    {
      condition: generator =>
        generator.databaseType === 'sql' &&
        generator.reactive &&
        (!generator.skipUserManagement || generator.authenticationType === 'oauth2'),
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/rowmapper/UserRowMapper.java',
          renameTo: generator => `${generator.javaDir}repository/rowmapper/UserRowMapper.java`,
        },
      ],
    },
    {
      condition: generator => !generator.reactive && generator.databaseType === 'couchbase',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/N1qlCouchbaseRepository.java',
          renameTo: generator => `${generator.javaDir}repository/N1qlCouchbaseRepository.java`,
        },
        {
          file: 'package/repository/CustomN1qlCouchbaseRepository.java',
          renameTo: generator => `${generator.javaDir}repository/CustomN1qlCouchbaseRepository.java`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngine === 'couchbase',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/search/SearchCouchbaseRepository.java',
          renameTo: generator => `${generator.javaDir}repository/search/SearchCouchbaseRepository.java`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngine === 'couchbase',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/repository/CustomN1qlCouchbaseRepositoryTest.java',
          renameTo: generator => `${generator.testDir}repository/CustomN1qlCouchbaseRepositoryTest.java`,
        },
      ],
    },
    {
      condition: generator => generator.reactive && generator.databaseType === 'couchbase',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/ReactiveN1qlCouchbaseRepository.java',
          renameTo: generator => `${generator.javaDir}repository/ReactiveN1qlCouchbaseRepository.java`,
        },
        {
          file: 'package/repository/CustomReactiveN1qlCouchbaseRepository.java',
          renameTo: generator => `${generator.javaDir}repository/CustomReactiveN1qlCouchbaseRepository.java`,
        },
      ],
    },
    {
      condition: generator => generator.websocket === 'spring-websocket',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/WebsocketConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/WebsocketConfiguration.java`,
        },
        {
          file: 'package/config/WebsocketSecurityConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/WebsocketSecurityConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => generator.searchEngine === 'elasticsearch',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/ElasticsearchConfiguration.java',
          renameTo: generator => `${generator.javaDir}config/ElasticsearchConfiguration.java`,
        },
      ],
    },
  ],
  serverJavaDomain: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [{ file: 'package/domain/package-info.java', renameTo: generator => `${generator.javaDir}domain/package-info.java` }],
    },
    {
      condition: generator => ['sql', 'mongodb', 'neo4j', 'couchbase'].includes(generator.databaseType),
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/AbstractAuditingEntity.java',
          renameTo: generator => `${generator.javaDir}domain/AbstractAuditingEntity.java`,
        },
      ],
    },
  ],
  serverJavaPackageInfo: [
    {
      condition: generator => generator.searchEngine === 'elasticsearch',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/search/package-info.java',
          renameTo: generator => `${generator.javaDir}repository/search/package-info.java`,
        },
      ],
    },
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        { file: 'package/repository/package-info.java', renameTo: generator => `${generator.javaDir}repository/package-info.java` },
      ],
    },
  ],
  serverJavaServiceError: [
    {
      condition: generator => !generator.skipUserManagement,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/EmailAlreadyUsedException.java',
          renameTo: generator => `${generator.javaDir}service/EmailAlreadyUsedException.java`,
        },
        {
          file: 'package/service/InvalidPasswordException.java',
          renameTo: generator => `${generator.javaDir}service/InvalidPasswordException.java`,
        },
        {
          file: 'package/service/UsernameAlreadyUsedException.java',
          renameTo: generator => `${generator.javaDir}service/UsernameAlreadyUsedException.java`,
        },
      ],
    },
  ],
  serverJavaService: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [{ file: 'package/service/package-info.java', renameTo: generator => `${generator.javaDir}service/package-info.java` }],
    },
    {
      condition: generator => generator.messageBroker === 'kafka',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/config/KafkaProperties.java',
          renameTo: generator => `${generator.javaDir}config/KafkaProperties.java`,
        },
      ],
    },
  ],
  serverJavaWebError: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/errors/package-info.java',
          renameTo: generator => `${generator.javaDir}web/rest/errors/package-info.java`,
        },
        {
          file: 'package/web/rest/errors/BadRequestAlertException.java',
          renameTo: generator => `${generator.javaDir}web/rest/errors/BadRequestAlertException.java`,
        },
        {
          file: 'package/web/rest/errors/ErrorConstants.java',
          renameTo: generator => `${generator.javaDir}web/rest/errors/ErrorConstants.java`,
        },
        {
          file: 'package/web/rest/errors/ExceptionTranslator.java',
          renameTo: generator => `${generator.javaDir}web/rest/errors/ExceptionTranslator.java`,
        },
        {
          file: 'package/web/rest/errors/FieldErrorVM.java',
          renameTo: generator => `${generator.javaDir}web/rest/errors/FieldErrorVM.java`,
        },
      ],
    },
    {
      condition: generator => !generator.skipUserManagement,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/errors/EmailAlreadyUsedException.java',
          renameTo: generator => `${generator.javaDir}web/rest/errors/EmailAlreadyUsedException.java`,
        },
        {
          file: 'package/web/rest/errors/InvalidPasswordException.java',
          renameTo: generator => `${generator.javaDir}web/rest/errors/InvalidPasswordException.java`,
        },
        {
          file: 'package/web/rest/errors/LoginAlreadyUsedException.java',
          renameTo: generator => `${generator.javaDir}web/rest/errors/LoginAlreadyUsedException.java`,
        },
      ],
    },
  ],
  serverJavaWeb: [
    {
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/vm/package-info.java',
          renameTo: generator => `${generator.javaDir}web/rest/vm/package-info.java`,
        },
        {
          file: 'package/web/rest/package-info.java',
          renameTo: generator => `${generator.javaDir}web/rest/package-info.java`,
        },
      ],
    },
    {
      condition: generator => !generator.skipClient && !generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/ClientForwardController.java',
          renameTo: generator => `${generator.javaDir}web/rest/ClientForwardController.java`,
        },
      ],
    },
    {
      condition: generator => !generator.skipClient && generator.reactive,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/web/filter/SpaWebFilter.java',
          renameTo: generator => `${generator.javaDir}web/filter/SpaWebFilter.java`,
        },
      ],
    },
    {
      condition: generator => generator.messageBroker === 'kafka',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/KafkaResource.java',
          renameTo: generator => `${generator.javaDir}web/rest/${generator.upperFirstCamelCase(generator.baseName)}KafkaResource.java`,
        },
      ],
    },
  ],
  serverJavaWebsocket: [
    {
      condition: generator => generator.websocket === 'spring-websocket',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/web/websocket/package-info.java',
          renameTo: generator => `${generator.javaDir}web/websocket/package-info.java`,
        },
        {
          file: 'package/web/websocket/ActivityService.java',
          renameTo: generator => `${generator.javaDir}web/websocket/ActivityService.java`,
        },
        {
          file: 'package/web/websocket/dto/package-info.java',
          renameTo: generator => `${generator.javaDir}web/websocket/dto/package-info.java`,
        },
        {
          file: 'package/web/websocket/dto/ActivityDTO.java',
          renameTo: generator => `${generator.javaDir}web/websocket/dto/ActivityDTO.java`,
        },
      ],
    },
  ],
  serverTestReactive: [
    {
      condition: generator => generator.reactive,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/config/JHipsterBlockHoundIntegration.java',
          renameTo: generator => `${generator.testDir}config/JHipsterBlockHoundIntegration.java`,
        },
      ],
    },
    {
      condition: generator => generator.reactive,
      path: SERVER_TEST_RES_DIR,
      templates: ['META-INF/services/reactor.blockhound.integration.BlockHoundIntegration'],
    },
  ],
  serverTestFw: [
    {
      condition: generator => generator.databaseType === 'cassandra',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/CassandraKeyspaceIT.java',
          renameTo: generator => `${generator.testDir}CassandraKeyspaceIT.java`,
        },
        { file: 'package/AbstractCassandraTest.java', renameTo: generator => `${generator.testDir}AbstractCassandraTest.java` },
      ],
    },
    {
      condition: generator => generator.databaseType === 'couchbase',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/config/DatabaseConfigurationIT.java',
          renameTo: generator => `${generator.testDir}config/DatabaseConfigurationIT.java`,
        },
      ],
    },
    {
      condition: generator => generator.databaseType === 'neo4j',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/AbstractNeo4jIT.java',
          renameTo: generator => `${generator.testDir}/AbstractNeo4jIT.java`,
        },
      ],
    },
    {
      path: SERVER_TEST_SRC_DIR,
      templates: [
        { file: 'package/web/rest/TestUtil.java', renameTo: generator => `${generator.testDir}web/rest/TestUtil.java` },
        {
          file: 'package/web/rest/errors/ExceptionTranslatorIT.java',
          renameTo: generator => `${generator.testDir}web/rest/errors/ExceptionTranslatorIT.java`,
        },
        {
          file: 'package/web/rest/errors/ExceptionTranslatorTestController.java',
          renameTo: generator => `${generator.testDir}web/rest/errors/ExceptionTranslatorTestController.java`,
        },
      ],
    },
    {
      condition: generator => !generator.skipClient && !generator.reactive,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/ClientForwardControllerTest.java',
          renameTo: generator => `${generator.testDir}web/rest/ClientForwardControllerTest.java`,
        },
      ],
    },
    {
      condition: generator => generator.databaseType === 'sql' && !generator.reactive,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/config/timezone/HibernateTimeZoneIT.java',
          renameTo: generator => `${generator.testDir}config/timezone/HibernateTimeZoneIT.java`,
        },
        {
          file: 'package/repository/timezone/DateTimeWrapper.java',
          renameTo: generator => `${generator.testDir}repository/timezone/DateTimeWrapper.java`,
        },
        {
          file: 'package/repository/timezone/DateTimeWrapperRepository.java',
          renameTo: generator => `${generator.testDir}repository/timezone/DateTimeWrapperRepository.java`,
        },
      ],
    },
    {
      path: SERVER_TEST_RES_DIR,
      templates: ['config/application.yml', 'logback.xml'],
    },
    {
      condition: generator => generator.databaseType === 'sql' && !generator.reactive,
      path: SERVER_TEST_RES_DIR,
      templates: ['config/application-testcontainers.yml'],
    },
    {
      condition: generator => generator.prodDatabaseType === 'mariadb' && !generator.reactive,
      path: SERVER_TEST_RES_DIR,
      templates: [{ file: 'testcontainers/mariadb/my.cnf', method: 'copy', noEjs: true }],
    },
    {
      condition: generator => generator.reactiveSqlTestContainers,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/ReactiveSqlTestContainerExtension.java',
          renameTo: generator => `${generator.testDir}ReactiveSqlTestContainerExtension.java`,
        },
      ],
    },
    {
      // TODO : add these tests to reactive
      condition: generator => !generator.reactive,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/config/WebConfigurerTest.java',
          renameTo: generator => `${generator.testDir}config/WebConfigurerTest.java`,
        },
        {
          file: 'package/config/WebConfigurerTestController.java',
          renameTo: generator => `${generator.testDir}config/WebConfigurerTestController.java`,
        },
      ],
    },
    {
      // TODO : add these tests to reactive
      condition: generator => !generator.skipClient && !generator.reactive,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/config/StaticResourcesWebConfigurerTest.java',
          renameTo: generator => `${generator.testDir}config/StaticResourcesWebConfigurerTest.java`,
        },
      ],
    },
    {
      condition: generator => generator.serviceDiscoveryType,
      path: SERVER_TEST_RES_DIR,
      templates: ['config/bootstrap.yml'],
    },
    {
      condition: generator =>
        generator.authenticationType === 'oauth2' && (generator.applicationType === 'monolith' || generator.applicationType === 'gateway'),
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/LogoutResourceIT.java',
          renameTo: generator => `${generator.testDir}web/rest/LogoutResourceIT.java`,
        },
      ],
    },
    {
      condition: generator => generator.gatlingTests,
      path: TEST_DIR,
      templates: [
        // Create Gatling test files
        'gatling/conf/gatling.conf',
        'gatling/conf/logback.xml',
      ],
    },
    {
      condition: generator => generator.cucumberTests,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        // Create Cucumber test files
        { file: 'package/cucumber/CucumberIT.java', renameTo: generator => `${generator.testDir}cucumber/CucumberIT.java` },
        {
          file: 'package/cucumber/stepdefs/StepDefs.java',
          renameTo: generator => `${generator.testDir}cucumber/stepdefs/StepDefs.java`,
        },
        {
          file: 'package/cucumber/CucumberTestContextConfiguration.java',
          renameTo: generator => `${generator.testDir}cucumber/CucumberTestContextConfiguration.java`,
        },
        { file: '../features/gitkeep', noEjs: true },
      ],
    },
    {
      condition: generator => generator.cucumberTests,
      path: SERVER_TEST_RES_DIR,
      templates: ['cucumber.properties'],
    },
    {
      condition: generator => !shouldSkipUserManagement(generator) && generator.authenticationType !== 'oauth2',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        // Create auth config test files
        {
          file: 'package/security/DomainUserDetailsServiceIT.java',
          renameTo: generator => `${generator.testDir}security/DomainUserDetailsServiceIT.java`,
        },
      ],
    },
    {
      condition: generator => generator.messageBroker === 'kafka',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/KafkaResourceIT.java',
          renameTo: generator => `${generator.testDir}web/rest/${generator.upperFirstCamelCase(generator.baseName)}KafkaResourceIT.java`,
        },
      ],
    },
  ],
  serverJavaUserManagement: [
    {
      condition: generator => generator.isUsingBuiltInUser(),
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/domain/User.java',
          renameTo: generator => `${generator.javaDir}domain/${generator.asEntity('User')}.java`,
        },
      ],
    },
    {
      condition: generator => generator.isUsingBuiltInAuthority(),
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        { file: 'package/domain/Authority.java', renameTo: generator => `${generator.javaDir}domain/Authority.java` },
        {
          file: 'package/repository/AuthorityRepository.java',
          renameTo: generator => `${generator.javaDir}repository/AuthorityRepository.java`,
        },
      ],
    },
    {
      condition: generator =>
        (generator.authenticationType === 'oauth2' && generator.applicationType !== 'microservice') ||
        (!generator.skipUserManagement && generator.databaseType === 'sql'),
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/liquibase/data/user.csv'],
    },
    {
      condition: generator =>
        (generator.authenticationType === 'oauth2' && generator.applicationType !== 'microservice' && generator.databaseType === 'sql') ||
        (!generator.skipUserManagement && generator.databaseType === 'sql'),
      path: SERVER_MAIN_RES_DIR,
      templates: ['config/liquibase/data/authority.csv', 'config/liquibase/data/user_authority.csv'],
    },
    {
      condition: generator => generator.authenticationType === 'oauth2',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        { file: 'package/config/Constants.java', renameTo: generator => `${generator.javaDir}config/Constants.java` },
        { file: 'package/service/UserService.java', renameTo: generator => `${generator.javaDir}service/UserService.java` },
        {
          file: 'package/service/dto/package-info.java',
          renameTo: generator => `${generator.javaDir}service/dto/package-info.java`,
        },
        {
          file: 'package/service/dto/AdminUserDTO.java',
          renameTo: generator => `${generator.javaDir}service/dto/${generator.asDto('AdminUser')}.java`,
        },
        {
          file: 'package/service/dto/UserDTO.java',
          renameTo: generator => `${generator.javaDir}service/dto/${generator.asDto('User')}.java`,
        },
      ],
    },
    {
      condition: generator => generator.authenticationType === 'oauth2' && generator.databaseType !== 'no',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/service/mapper/package-info.java',
          renameTo: generator => `${generator.javaDir}service/mapper/package-info.java`,
        },
        {
          file: 'package/service/mapper/UserMapper.java',
          renameTo: generator => `${generator.javaDir}service/mapper/UserMapper.java`,
        },
        {
          file: 'package/repository/UserRepository.java',
          renameTo: generator => `${generator.javaDir}repository/UserRepository.java`,
        },
        { file: 'package/web/rest/UserResource.java', renameTo: generator => `${generator.javaDir}web/rest/UserResource.java` },
        {
          file: 'package/web/rest/PublicUserResource.java',
          renameTo: generator => `${generator.javaDir}web/rest/PublicUserResource.java`,
        },
        {
          file: 'package/web/rest/vm/ManagedUserVM.java',
          renameTo: generator => `${generator.javaDir}web/rest/vm/ManagedUserVM.java`,
        },
      ],
    },
    {
      condition: generator => generator.skipUserManagement && ['monolith', 'gateway'].includes(generator.applicationType),
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/AccountResource.java',
          renameTo: generator => `${generator.javaDir}web/rest/AccountResource.java`,
        },
      ],
    },
    {
      condition: generator => generator.authenticationType === 'oauth2',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/service/UserServiceIT.java',
          renameTo: generator => `${generator.testDir}service/UserServiceIT.java`,
        },
      ],
    },
    {
      condition: generator => generator.authenticationType === 'oauth2' && generator.databaseType !== 'no',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/service/mapper/UserMapperTest.java',
          renameTo: generator => `${generator.testDir}service/mapper/UserMapperTest.java`,
        },
        {
          file: 'package/web/rest/PublicUserResourceIT.java',
          renameTo: generator => `${generator.testDir}web/rest/PublicUserResourceIT.java`,
        },
        {
          file: 'package/web/rest/UserResourceIT.java',
          renameTo: generator => `${generator.testDir}web/rest/UserResourceIT.java`,
        },
      ],
    },
    {
      condition: generator =>
        generator.skipUserManagement &&
        generator.authenticationType !== 'oauth2' &&
        ['monolith', 'gateway'].includes(generator.applicationType),
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/AccountResourceIT_skipUserManagement.java',
          renameTo: generator => `${generator.testDir}web/rest/AccountResourceIT.java`,
        },
      ],
    },
    {
      condition: generator =>
        generator.skipUserManagement &&
        generator.authenticationType === 'oauth2' &&
        ['monolith', 'gateway'].includes(generator.applicationType),
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/AccountResourceIT_oauth2.java',
          renameTo: generator => `${generator.testDir}web/rest/AccountResourceIT.java`,
        },
      ],
    },
    {
      condition: generator => generator.authenticationType === 'oauth2' && generator.searchEngine === 'elasticsearch',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/search/UserSearchRepository.java',
          renameTo: generator => `${generator.javaDir}repository/search/UserSearchRepository.java`,
        },
      ],
    },
    {
      condition: generator => generator.authenticationType === 'oauth2' && generator.searchEngine === 'elasticsearch',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/repository/search/UserSearchRepositoryMockConfiguration.java',
          renameTo: generator => `${generator.testDir}repository/search/UserSearchRepositoryMockConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => !generator.skipUserManagement,
      path: SERVER_MAIN_RES_DIR,
      templates: ['templates/mail/activationEmail.html', 'templates/mail/creationEmail.html', 'templates/mail/passwordResetEmail.html'],
    },
    {
      condition: generator => !generator.skipUserManagement,
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/UserRepository.java',
          renameTo: generator => `${generator.javaDir}repository/UserRepository.java`,
        },

        /* User management java service files */
        { file: 'package/service/UserService.java', renameTo: generator => `${generator.javaDir}service/UserService.java` },
        { file: 'package/service/MailService.java', renameTo: generator => `${generator.javaDir}service/MailService.java` },

        /* User management java web files */
        {
          file: 'package/service/dto/package-info.java',
          renameTo: generator => `${generator.javaDir}service/dto/package-info.java`,
        },
        {
          file: 'package/service/dto/AdminUserDTO.java',
          renameTo: generator => `${generator.javaDir}service/dto/${generator.asDto('AdminUser')}.java`,
        },
        {
          file: 'package/service/dto/UserDTO.java',
          renameTo: generator => `${generator.javaDir}service/dto/${generator.asDto('User')}.java`,
        },
        {
          file: 'package/service/dto/PasswordChangeDTO.java',
          renameTo: generator => `${generator.javaDir}service/dto/PasswordChangeDTO.java`,
        },
        {
          file: 'package/web/rest/vm/ManagedUserVM.java',
          renameTo: generator => `${generator.javaDir}web/rest/vm/ManagedUserVM.java`,
        },
        {
          file: 'package/web/rest/AccountResource.java',
          renameTo: generator => `${generator.javaDir}web/rest/AccountResource.java`,
        },
        { file: 'package/web/rest/UserResource.java', renameTo: generator => `${generator.javaDir}web/rest/UserResource.java` },
        {
          file: 'package/web/rest/PublicUserResource.java',
          renameTo: generator => `${generator.javaDir}web/rest/PublicUserResource.java`,
        },
        {
          file: 'package/web/rest/vm/KeyAndPasswordVM.java',
          renameTo: generator => `${generator.javaDir}web/rest/vm/KeyAndPasswordVM.java`,
        },
        {
          file: 'package/service/mapper/package-info.java',
          renameTo: generator => `${generator.javaDir}service/mapper/package-info.java`,
        },
        {
          file: 'package/service/mapper/UserMapper.java',
          renameTo: generator => `${generator.javaDir}service/mapper/UserMapper.java`,
        },
      ],
    },
    {
      condition: generator => !generator.skipUserManagement && generator.searchEngine === 'elasticsearch',
      path: SERVER_MAIN_SRC_DIR,
      templates: [
        {
          file: 'package/repository/search/UserSearchRepository.java',
          renameTo: generator => `${generator.javaDir}repository/search/UserSearchRepository.java`,
        },
      ],
    },
    {
      condition: generator => !generator.skipUserManagement && generator.searchEngine === 'elasticsearch',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/repository/search/UserSearchRepositoryMockConfiguration.java',
          renameTo: generator => `${generator.testDir}repository/search/UserSearchRepositoryMockConfiguration.java`,
        },
      ],
    },
    {
      condition: generator => generator.authenticationType === 'jwt',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/security/jwt/TokenProviderTest.java',
          renameTo: generator => `${generator.testDir}security/jwt/TokenProviderTest.java`,
        },
        {
          file: 'package/security/jwt/JWTFilterTest.java',
          renameTo: generator => `${generator.testDir}security/jwt/JWTFilterTest.java`,
        },
      ],
    },
    {
      condition: generator => generator.applicationType !== 'microservice' && generator.authenticationType === 'jwt',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/UserJWTControllerIT.java',
          renameTo: generator => `${generator.testDir}web/rest/UserJWTControllerIT.java`,
        },
      ],
    },
    {
      condition: generator => !generator.skipUserManagement && generator.cucumberTests,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/cucumber/stepdefs/UserStepDefs.java',
          renameTo: generator => `${generator.testDir}cucumber/stepdefs/UserStepDefs.java`,
        },
        '../features/user/user.feature',
      ],
    },
    {
      condition: generator => !generator.skipUserManagement,
      path: SERVER_TEST_RES_DIR,
      templates: [
        /* User management java test files */
        'templates/mail/testEmail.html',
        'i18n/messages_en.properties',
      ],
    },
    {
      condition: generator => !generator.skipUserManagement,
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/service/MailServiceIT.java',
          renameTo: generator => `${generator.testDir}service/MailServiceIT.java`,
        },
        {
          file: 'package/service/UserServiceIT.java',
          renameTo: generator => `${generator.testDir}service/UserServiceIT.java`,
        },
        {
          file: 'package/service/mapper/UserMapperTest.java',
          renameTo: generator => `${generator.testDir}service/mapper/UserMapperTest.java`,
        },
        {
          file: 'package/config/NoOpMailConfiguration.java',
          renameTo: generator => `${generator.testDir}config/NoOpMailConfiguration.java`,
        },
        {
          file: 'package/web/rest/PublicUserResourceIT.java',
          renameTo: generator => `${generator.testDir}web/rest/PublicUserResourceIT.java`,
        },
        {
          file: 'package/web/rest/UserResourceIT.java',
          renameTo: generator => `${generator.testDir}web/rest/UserResourceIT.java`,
        },
      ],
    },
    {
      condition: generator => !generator.skipUserManagement && generator.authenticationType !== 'oauth2',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/AccountResourceIT.java',
          renameTo: generator => `${generator.testDir}web/rest/AccountResourceIT.java`,
        },
      ],
    },
    {
      condition: generator => !generator.skipUserManagement && generator.authenticationType === 'oauth2',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/AccountResourceIT_oauth2.java',
          renameTo: generator => `${generator.testDir}web/rest/AccountResourceIT.java`,
        },
      ],
    },
    {
      condition: generator => !generator.skipUserManagement && generator.authenticationType !== 'oauth2',
      path: SERVER_TEST_SRC_DIR,
      templates: [
        {
          file: 'package/web/rest/WithUnauthenticatedMockUser.java',
          renameTo: generator => `${generator.testDir}web/rest/WithUnauthenticatedMockUser.java`,
        },
      ],
    },
  ],
};

function writeFiles() {
  return {
    setUp() {
      this.javaDir = `${this.packageFolder}/`;
      this.testDir = `${this.packageFolder}/`;

      this.generateKeyStore();
    },

    cleanupOldServerFiles() {
      cleanup.cleanupOldServerFiles(
        this,
        `${SERVER_MAIN_SRC_DIR}/${this.javaDir}`,
        `${SERVER_TEST_SRC_DIR}/${this.testDir}`,
        SERVER_MAIN_RES_DIR,
        SERVER_TEST_RES_DIR
      );
    },

    writeFiles() {
      return this.writeFilesToDisk(serverFiles);
    },
  };
}

module.exports = {
  writeFiles,
  serverFiles,
};
