/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
// Version of Java
const JAVA_VERSION = '17';
const JAVA_COMPATIBLE_VERSIONS = ['17', '18', '19'];

/**
 * Manually updated java dependencies
 * @type {Record<string,string>}
 */
const javaDependencies = {};
Object.freeze(javaDependencies);

// The version should be coherent with the one from spring-data-elasticsearch project
const ELATICSEARCH_TAG = '8.5.3';
const ELATICSEARCH_IMAGE = 'docker.elastic.co/elasticsearch/elasticsearch';

/**
 * Manually updated docker containers
 */
const dockerContainers = {
  elasticsearchTag: ELATICSEARCH_TAG,
  elasticsearchImage: ELATICSEARCH_IMAGE,
  elasticsearch: `${ELATICSEARCH_IMAGE}:${ELATICSEARCH_TAG}`,
};
Object.freeze(dockerContainers);

// Version of Node, NPM
const NODE_VERSION = '16.17.0';
const OPENAPI_GENERATOR_CLI_VERSION = '2.5.1';

// Libraries version
const JHIPSTER_DEPENDENCIES_VERSION = '8.0.0-SNAPSHOT';
// The spring-boot version should match the one managed by https://mvnrepository.com/artifact/tech.jhipster/jhipster-dependencies/JHIPSTER_DEPENDENCIES_VERSION
const SPRING_BOOT_VERSION = '3.0.1';
const SPRING_CLOUD_VERSION = '2022.0.0';
const HIBERNATE_VERSION = '6.1.6.Final';
const JACOCO_VERSION = '0.8.8';
const JACKSON_DATABIND_NULLABLE_VERSION = '0.2.4';

// Kubernetes versions
const KUBERNETES_CORE_API_VERSION = 'v1';
const KUBERNETES_BATCH_API_VERSION = 'batch/v1';
const KUBERNETES_DEPLOYMENT_API_VERSION = 'apps/v1';
const KUBERNETES_STATEFULSET_API_VERSION = 'apps/v1';
const KUBERNETES_INGRESS_API_VERSION = 'networking.k8s.io/v1';
const KUBERNETES_ISTIO_NETWORKING_API_VERSION = 'networking.istio.io/v1beta1';
const KUBERNETES_RBAC_API_VERSION = 'rbac.authorization.k8s.io/v1';

// Helm versions
const HELM_KAFKA = '^0.20.1';
const HELM_ELASTICSEARCH = '^1.32.0';
const HELM_PROMETHEUS = '^9.2.0';
const HELM_GRAFANA = '^4.0.0';
const HELM_MYSQL = '^1.4.0';
const HELM_MARIADB = '^6.12.2';
const HELM_POSTGRESQL = '^6.5.3';
const HELM_MOGODB_REPLICASET = '^3.10.1';
const HELM_COUCHBASE_OPERATOR = '^2.2.1';

// all constants used throughout all generators

const LOGIN_REGEX = '^(?>[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\\\.[a-zA-Z0-9-]+)*)|(?>[_.@A-Za-z0-9-]+)$';
// JS does not support atomic groups
const LOGIN_REGEX_JS = '^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$';

const MAIN_DIR = 'src/main/';
const TEST_DIR = 'src/test/';

// Note: this will be prepended with 'target/classes' for Maven, or with 'build/resources/main' for Gradle.
const CLIENT_DIST_DIR = 'static/';

// documentation constants
const JHIPSTER_DOCUMENTATION_URL = 'https://www.jhipster.tech';
const JHIPSTER_DOCUMENTATION_ARCHIVE_PATH = '/documentation-archive/';

const LANGUAGES = [
  {
    name: 'Albanian',
    dispName: 'Shqip',
    value: 'al',
    dayjsLocaleId: 'sq',
    localeId: 'sq',
  },
  {
    name: 'Arabic (Libya)',
    dispName: 'العربية',
    value: 'ar-ly',
    rtl: true,
    skipForLocale: true,
    localeId: 'ar-LY',
  },
  {
    name: 'Armenian',
    dispName: 'Հայերեն',
    value: 'hy',
    dayjsLocaleId: 'hy-am',
  },
  {
    name: 'Belarusian',
    dispName: 'Беларускі',
    value: 'by',
    dayjsLocaleId: 'be',
    localeId: 'be',
  },
  {
    name: 'Bengali',
    dispName: 'বাংলা',
    value: 'bn',
    dayjsLocaleId: 'bn',
  },
  { name: 'Bulgarian', dispName: 'Български', value: 'bg' },
  {
    name: 'Catalan',
    dispName: 'Català',
    value: 'ca',
  },
  {
    name: 'Chinese (Simplified)',
    dispName: '中文（简体）',
    value: 'zh-cn',
    localeId: 'zh-Hans',
  },
  {
    name: 'Chinese (Traditional)',
    dispName: '繁體中文',
    value: 'zh-tw',
    localeId: 'zh-Hant',
  },
  { name: 'Croatian', dispName: 'Hrvatski', value: 'hr' },
  { name: 'Czech', dispName: 'Český', value: 'cs' },
  { name: 'Danish', dispName: 'Dansk', value: 'da' },
  { name: 'Dutch', dispName: 'Nederlands', value: 'nl' },
  { name: 'English', dispName: 'English', value: 'en' },
  { name: 'Estonian', dispName: 'Eesti', value: 'et' },
  {
    name: 'Farsi',
    dispName: 'فارسی',
    value: 'fa',
    rtl: true,
  },
  { name: 'Finnish', dispName: 'Suomi', value: 'fi' },
  { name: 'French', dispName: 'Français', value: 'fr' },
  { name: 'Galician', dispName: 'Galego', value: 'gl' },
  { name: 'German', dispName: 'Deutsch', value: 'de' },
  { name: 'Greek', dispName: 'Ελληνικά', value: 'el' },
  { name: 'Hindi', dispName: 'हिंदी', value: 'hi' },
  { name: 'Hungarian', dispName: 'Magyar', value: 'hu' },
  { name: 'Indonesian', dispName: 'Bahasa Indonesia', value: 'id' },
  { name: 'Italian', dispName: 'Italiano', value: 'it' },
  { name: 'Japanese', dispName: '日本語', value: 'ja' },
  { name: 'Korean', dispName: '한국어', value: 'ko' },
  { name: 'Marathi', dispName: 'मराठी', value: 'mr' },
  { name: 'Myanmar', dispName: 'မြန်မာ', value: 'my' },
  { name: 'Polish', dispName: 'Polski', value: 'pl' },
  {
    name: 'Portuguese (Brazilian)',
    dispName: 'Português (Brasil)',
    value: 'pt-br',
    localeId: 'pt',
  },
  {
    name: 'Portuguese',
    dispName: 'Português',
    value: 'pt-pt',
    localeId: 'pt-PT',
    dayjsLocaleId: 'pt',
  },
  {
    name: 'Punjabi',
    dispName: 'ਪੰਜਾਬੀ',
    value: 'pa',
    dayjsLocaleId: 'pa-in',
  },
  { name: 'Romanian', dispName: 'Română', value: 'ro' },
  { name: 'Russian', dispName: 'Русский', value: 'ru' },
  { name: 'Slovak', dispName: 'Slovenský', value: 'sk' },
  { name: 'Serbian', dispName: 'Srpski', value: 'sr' },
  { name: 'Sinhala', dispName: 'සිංහල', value: 'si' },
  { name: 'Spanish', dispName: 'Español', value: 'es' },
  { name: 'Swedish', dispName: 'Svenska', value: 'sv' },
  { name: 'Turkish', dispName: 'Türkçe', value: 'tr' },
  { name: 'Tamil', dispName: 'தமிழ்', value: 'ta' },
  { name: 'Telugu', dispName: 'తెలుగు', value: 'te' },
  { name: 'Thai', dispName: 'ไทย', value: 'th' },
  {
    name: 'Ukrainian',
    dispName: 'Українська',
    value: 'ua',
    localeId: 'uk',
    dayjsLocaleId: 'uk',
  },
  {
    name: 'Uzbek (Cyrillic)',
    dispName: 'Ўзбекча',
    value: 'uz-Cyrl-uz',
    localeId: 'uz-Cyrl',
    dayjsLocaleId: 'uz',
  },
  {
    name: 'Uzbek (Latin)',
    dispName: 'O`zbekcha',
    value: 'uz-Latn-uz',
    localeId: 'uz-Latn',
    dayjsLocaleId: 'uz-latn',
  },
  { name: 'Vietnamese', dispName: 'Tiếng Việt', value: 'vi' },
];

const constants = {
  GENERATOR_JHIPSTER: 'generator-jhipster',
  JHIPSTER_CONFIG_DIR: '.jhipster',
  DOCKER_DIR: `${MAIN_DIR}docker/`,
  LINE_LENGTH: 180,
  LANGUAGES,

  MAIN_DIR,
  TEST_DIR,

  LOGIN_REGEX,
  LOGIN_REGEX_JS,
  // supported client frameworks
  SUPPORTED_CLIENT_FRAMEWORKS: { ANGULAR: 'angular', REACT: 'react', VUE: 'vue' },

  CLIENT_MAIN_SRC_DIR: `${MAIN_DIR}webapp/`,
  CLIENT_TEST_SRC_DIR: `${TEST_DIR}javascript/`,
  CLIENT_WEBPACK_DIR: 'webpack/',
  CLIENT_DIST_DIR,
  ANGULAR_DIR: `${MAIN_DIR}webapp/app/`,
  REACT_DIR: `${MAIN_DIR}webapp/app/`,
  VUE_DIR: `${MAIN_DIR}webapp/app/`,

  SERVER_MAIN_SRC_DIR: `${MAIN_DIR}java/`,
  SERVER_MAIN_RES_DIR: `${MAIN_DIR}resources/`,
  SERVER_TEST_SRC_DIR: `${TEST_DIR}java/`,
  SERVER_TEST_RES_DIR: `${TEST_DIR}resources/`,
  PRETTIER_EXTENSIONS: 'md,json,yml,html,cjs,mjs,js,ts,tsx,css,scss,vue,svelte,java',

  JHIPSTER_DOCUMENTATION_URL,
  JHIPSTER_DOCUMENTATION_ARCHIVE_PATH,

  JAVA_VERSION,
  JAVA_COMPATIBLE_VERSIONS,

  // NPM
  NODE_VERSION,
  OPENAPI_GENERATOR_CLI_VERSION,

  // Libraries
  JHIPSTER_DEPENDENCIES_VERSION,
  SPRING_BOOT_VERSION,
  SPRING_CLOUD_VERSION,
  HIBERNATE_VERSION,
  JACOCO_VERSION,
  JACKSON_DATABIND_NULLABLE_VERSION,

  // Kubernetes
  KUBERNETES_CORE_API_VERSION,
  KUBERNETES_BATCH_API_VERSION,
  KUBERNETES_DEPLOYMENT_API_VERSION,
  KUBERNETES_STATEFULSET_API_VERSION,
  KUBERNETES_INGRESS_API_VERSION,
  KUBERNETES_ISTIO_NETWORKING_API_VERSION,
  KUBERNETES_RBAC_API_VERSION,

  // Helm
  HELM_KAFKA,
  HELM_ELASTICSEARCH,
  HELM_PROMETHEUS,
  HELM_GRAFANA,
  HELM_MYSQL,
  HELM_MARIADB,
  HELM_POSTGRESQL,
  HELM_MOGODB_REPLICASET,
  HELM_COUCHBASE_OPERATOR,

  javaDependencies,
  dockerContainers,
};

module.exports = constants;
