/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
// jhipster-bom version
export const JHIPSTER_DEPENDENCIES_VERSION = '8.0.0-beta.1';
// Version of Java
export const JAVA_VERSION = '17';
export const JAVA_COMPATIBLE_VERSIONS = ['17', '18', '19'];
// Force spring milestone repository. Spring Boot milestones are detected.
export const ADD_SPRING_MILESTONE_REPOSITORY = false;

// Version of Node, NPM
export const NODE_VERSION = '18.16.0';
export const OPENAPI_GENERATOR_CLI_VERSION = '2.5.1';

export const javaDependencies: Record<string, string> = {
  /**
   * spring-boot version should match the one managed by https://mvnrepository.com/artifact/tech.jhipster/jhipster-dependencies/JHIPSTER_DEPENDENCIES_VERSION
   */
  'spring-boot': '3.0.7',
  /*
   * hibernate version should match the one managed by https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-dependencies/SPRING_BOOT_VERSION
   * Required due to hibernate-jpamodelgen annotation processor.
   */
  hibernate: '6.1.7.Final',
  /*
   * cassandra driver version should match the one managed by https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-dependencies/SPRING_BOOT_VERSION
   * Required due to java-driver-mapper-processor annotation processor.
   */
  cassandra: '4.15.0',
  /**
   * TODO drop once spring-boot 3.1.0 is released https://github.com/spring-projects/spring-boot/issues/34625
   */
  'r2dbc-mariadb': '1.1.2',
};
Object.freeze(javaDependencies);

// The version should be coherent with the one from spring-data-elasticsearch project
export const ELATICSEARCH_TAG = '8.5.3';
export const ELATICSEARCH_IMAGE = 'docker.elastic.co/elasticsearch/elasticsearch';

/**
 * Manually updated docker containers
 */
export const dockerContainers: Record<string, string> = {
  elasticsearchTag: ELATICSEARCH_TAG,
  elasticsearchImage: ELATICSEARCH_IMAGE,
  elasticsearch: `${ELATICSEARCH_IMAGE}:${ELATICSEARCH_TAG}`,
};
Object.freeze(dockerContainers);

// Kubernetes versions
export const KUBERNETES_CORE_API_VERSION = 'v1';
export const KUBERNETES_BATCH_API_VERSION = 'batch/v1';
export const KUBERNETES_DEPLOYMENT_API_VERSION = 'apps/v1';
export const KUBERNETES_STATEFULSET_API_VERSION = 'apps/v1';
export const KUBERNETES_INGRESS_API_VERSION = 'networking.k8s.io/v1';
export const KUBERNETES_ISTIO_NETWORKING_API_VERSION = 'networking.istio.io/v1beta1';
export const KUBERNETES_RBAC_API_VERSION = 'rbac.authorization.k8s.io/v1';

// Helm versions
export const HELM_KAFKA = '^0.20.1';
export const HELM_ELASTICSEARCH = '^1.32.0';
export const HELM_PROMETHEUS = '^9.2.0';
export const HELM_GRAFANA = '^4.0.0';
export const HELM_MYSQL = '^1.4.0';
export const HELM_MARIADB = '^6.12.2';
export const HELM_POSTGRESQL = '^6.5.3';
export const HELM_MOGODB_REPLICASET = '^3.10.1';
export const HELM_COUCHBASE_OPERATOR = '^2.2.1';

// all constants used throughout all generators

export const LOGIN_REGEX = '^(?>[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\\\.[a-zA-Z0-9-]+)*)|(?>[_.@A-Za-z0-9-]+)$';
// JS does not support atomic groups
export const LOGIN_REGEX_JS = '^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$';

// documentation constants
export const JHIPSTER_DOCUMENTATION_URL = 'https://www.jhipster.tech';
export const JHIPSTER_DOCUMENTATION_ARCHIVE_PATH = '/documentation-archive/';

export const MAIN_DIR = 'src/main/';
export const TEST_DIR = 'src/test/';

// Note: this will be prepended with 'target/classes' for Maven, or with 'build/resources/main' for Gradle.
export const CLIENT_DIST_DIR = 'static/';

export const GENERATOR_JHIPSTER = 'generator-jhipster';

export const JHIPSTER_CONFIG_DIR = '.jhipster';
export const DOCKER_DIR = `${MAIN_DIR}docker/`;
export const LINE_LENGTH = 180;
export const CLIENT_MAIN_SRC_DIR = `${MAIN_DIR}webapp/`;
export const CLIENT_TEST_SRC_DIR = `${TEST_DIR}javascript/`;
export const CLIENT_WEBPACK_DIR = 'webpack/';
export const SERVER_MAIN_SRC_DIR = `${MAIN_DIR}java/`;
export const SERVER_MAIN_RES_DIR = `${MAIN_DIR}resources/`;
export const SERVER_TEST_SRC_DIR = `${TEST_DIR}java/`;
export const SERVER_TEST_RES_DIR = `${TEST_DIR}resources/`;
export const PRETTIER_EXTENSIONS = 'md,json,yml,html,cjs,mjs,js,ts,tsx,css,scss,vue,svelte,java';
