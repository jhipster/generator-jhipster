/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

export const BLUEPRINT_API_VERSION = 'jhipster-8';
// jhipster-bom version
export const JHIPSTER_DEPENDENCIES_VERSION = '8.7.1';
// Version of Java
export const JAVA_VERSION = '17';
// Supported Java versions, https://www.oracle.com/java/technologies/java-se-support-roadmap.html
export const JAVA_COMPATIBLE_VERSIONS = ['17', '21', '23'];
// Force spring milestone repository. Spring Boot milestones are detected.
export const ADD_SPRING_MILESTONE_REPOSITORY = false;

// Version of Node, NPM
export const NODE_VERSION = readFileSync(join(fileURLToPath(import.meta.url), '../init/resources/.node-version'), 'utf-8').trim();
export const OPENAPI_GENERATOR_CLI_VERSION = '2.13.1';

// The version should be coherent with the one from spring-data-elasticsearch project
export const ELASTICSEARCH_TAG = '8.13.4';
export const ELASTICSEARCH_IMAGE = 'docker.elastic.co/elasticsearch/elasticsearch';

/**
 * @type {Record<string, string>}
 * Manually updated docker containers
 */
export const dockerContainers = {
  elasticsearchTag: ELASTICSEARCH_TAG,
  elasticsearchImage: ELASTICSEARCH_IMAGE,
  elasticsearch: `${ELASTICSEARCH_IMAGE}:${ELASTICSEARCH_TAG}`,
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
export const HELM_MONGODB_REPLICASET = '^3.10.1';
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

export const GRADLE_BUILD_SRC_DIR = 'buildSrc/';
export const GRADLE_BUILD_SRC_MAIN_DIR = `${GRADLE_BUILD_SRC_DIR}/src/main/groovy/`;

// Note: this will be prepended with 'target/classes' for Maven, or with 'build/resources/main' for Gradle.
export const CLIENT_DIST_DIR = 'static/';

export const GENERATOR_JHIPSTER = 'generator-jhipster';
export const YO_RC_FILE = '.yo-rc.json';

export const JHIPSTER_CONFIG_DIR = '.jhipster';
export const TEMPLATES_DOCKER_DIR = 'docker/';
export const JAVA_DOCKER_DIR = `${MAIN_DIR}docker/`;
export const LINE_LENGTH = 180;
export const CLIENT_MAIN_SRC_DIR = `${MAIN_DIR}webapp/`;
export const CLIENT_TEST_SRC_DIR = `${TEST_DIR}javascript/`;
export const CLIENT_WEBPACK_DIR = 'webpack/';
export const SERVER_MAIN_SRC_DIR = `${MAIN_DIR}java/`;
export const SERVER_MAIN_RES_DIR = `${MAIN_DIR}resources/`;
export const SERVER_TEST_SRC_DIR = `${TEST_DIR}java/`;
export const SERVER_TEST_RES_DIR = `${TEST_DIR}resources/`;
export const JS_PRETTIER_EXTENSIONS = 'cjs,mjs,js,cts,mts,ts';
export const PRETTIER_EXTENSIONS = `md,json,yml,html,${JS_PRETTIER_EXTENSIONS},tsx,css,scss,vue,java`;
