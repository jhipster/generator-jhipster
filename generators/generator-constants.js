/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
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

// version of docker images
const DOCKER_JHIPSTER_REGISTRY = 'jhipster/jhipster-registry:v5.0.2';
const DOCKER_JAVA_JRE = 'adoptopenjdk:11-jre-hotspot';
const DOCKER_MYSQL = 'mysql:8.0.17';
const DOCKER_MARIADB = 'mariadb:10.4.7';
const DOCKER_POSTGRESQL = 'postgres:11.5';
const DOCKER_MONGODB = 'mongo:4.0.12';
const DOCKER_COUCHBASE = 'couchbase:6.0.0';
const DOCKER_CASSANDRA = 'cassandra:3.11.4';
const DOCKER_MSSQL = 'microsoft/mssql-server-linux:latest';
const DOCKER_HAZELCAST_MANAGEMENT_CENTER = 'hazelcast/management-center:3.12.5';
const DOCKER_MEMCACHED = 'memcached:1.5.17-alpine';
const DOCKER_KEYCLOAK = 'jboss/keycloak:6.0.1'; // The version should match the attribute 'keycloakVersion' from /docker-compose/templates/realm-config/jhipster-realm.json.ejs and /server/templates/src/main/docker/config/realm-config/jhipster-realm.json.ejs
const DOCKER_ELASTICSEARCH = 'docker.elastic.co/elasticsearch/elasticsearch:6.4.3'; // The version should be coerent with the one from spring-data-elasticsearch project
const DOCKER_KAFKA = 'confluentinc/cp-kafka:5.3.1';
const DOCKER_ZOOKEEPER = 'confluentinc/cp-zookeeper:5.3.1';
const DOCKER_SONAR = 'sonarqube:7.9.1-community';
const DOCKER_JHIPSTER_CONSOLE = 'jhipster/jhipster-console:v4.1.0';
const DOCKER_JHIPSTER_CURATOR = 'jhipster/jhipster-curator:v4.1.0';
const DOCKER_JHIPSTER_ELASTICSEARCH = 'jhipster/jhipster-elasticsearch:v4.1.0';
const DOCKER_JHIPSTER_LOGSTASH = 'jhipster/jhipster-logstash:v4.1.0';
const DOCKER_JHIPSTER_IMPORT_DASHBOARDS = 'jhipster/jhipster-import-dashboards:v4.1.0';
const DOCKER_JHIPSTER_ZIPKIN = 'jhipster/jhipster-zipkin:v4.1.0';
const DOCKER_TRAEFIK = 'traefik:1.7.15';
const DOCKER_CONSUL = 'consul:1.6.1';
const DOCKER_CONSUL_CONFIG_LOADER = 'jhipster/consul-config-loader:v0.3.0';
const DOCKER_PROMETHEUS = 'prom/prometheus:v2.12.0';
const DOCKER_PROMETHEUS_ALERTMANAGER = 'prom/alertmanager:v0.19.0';
const DOCKER_GRAFANA = 'grafana/grafana:6.3.5';
const DOCKER_JENKINS = 'jenkins:latest';
const DOCKER_SWAGGER_EDITOR = 'swaggerapi/swagger-editor:latest';
const DOCKER_COMPOSE_FORMAT_VERSION = '2';
const DOCKER_PROMETHEUS_OPERATOR = 'quay.io/coreos/prometheus-operator:v0.33.0';
const DOCKER_GRAFANA_WATCHER = 'quay.io/coreos/grafana-watcher:v0.0.8';

// Kubernetes versions
const KUBERNETES_CORE_API_VERSION = 'v1';
const KUBERNETES_BATCH_API_VERSION = 'batch/v1';
const KUBERNETES_DEPLOYMENT_API_VERSION = 'apps/v1';
const KUBERNETES_STATEFULSET_API_VERSION = 'apps/v1';
const KUBERNETES_INGRESS_API_VERSION = 'extensions/v1beta1';
const KUBERNETES_ISTIO_NETWORKING_API_VERSION = 'networking.istio.io/v1alpha3';
const KUBERNETES_RBAC_API_VERSION = 'rbac.authorization.k8s.io/v1';

// Version of Java
const JAVA_VERSION = '1.8'; // Java version is forced to be 1.8. We keep the variable as it might be useful in the future.

// version of Node, Yarn, NPM
const NODE_VERSION = '10.16.3';
const YARN_VERSION = '1.17.3';
const NPM_VERSION = '6.11.3';

// Libraries version
const JIB_VERSION = '1.5.1';

// all constants used throughout all generators

const MAIN_DIR = 'src/main/';
const TEST_DIR = 'src/test/';

// Note: this will be prepended with 'target/classes' for Maven, or with 'build/resources/main' for Gradle.
const CLIENT_DIST_DIR = 'static/';

const SUPPORTED_VALIDATION_RULES = ['required', 'unique', 'max', 'min', 'maxlength', 'minlength', 'maxbytes', 'minbytes', 'pattern'];

// documentation constants
const JHIPSTER_DOCUMENTATION_URL = 'https://www.jhipster.tech';
const JHIPSTER_DOCUMENTATION_ARCHIVE_PATH = '/documentation-archive/';

const SQL_DB_OPTIONS = [
    {
        value: 'mysql',
        name: 'MySQL'
    },
    {
        value: 'mariadb',
        name: 'MariaDB'
    },
    {
        value: 'postgresql',
        name: 'PostgreSQL'
    },
    {
        value: 'oracle',
        name: 'Oracle (Please follow our documentation to use the Oracle proprietary driver)'
    },
    {
        value: 'mssql',
        name: 'Microsoft SQL Server'
    }
];

const LANGUAGES = [
    {
        name: 'Albanian',
        dispName: 'Shqip',
        value: 'al',
        momentLocaleId: 'sq'
    },
    {
        name: 'Arabic (Libya)',
        dispName: 'العربية',
        value: 'ar-ly',
        rtl: true,
        skipForLocale: true
    },
    {
        name: 'Armenian',
        dispName: 'Հայերեն',
        value: 'hy',
        momentLocaleId: 'hy-am'
    },
    {
        name: 'Belorussian',
        dispName: 'Беларускі',
        value: 'by',
        momentLocaleId: 'be-by'
    },
    {
        name: 'Bengali',
        dispName: 'বাংলা',
        value: 'bn',
        momentLocaleId: 'bn-bd'
    },
    {
        name: 'Catalan',
        dispName: 'Català',
        value: 'ca'
    },
    {
        name: 'Chinese (Simplified)',
        dispName: '中文（简体）',
        value: 'zh-cn',
        localeId: 'zh-Hans'
    },
    {
        name: 'Chinese (Traditional)',
        dispName: '繁體中文',
        value: 'zh-tw',
        localeId: 'zh-Hant'
    },
    { name: 'Czech', dispName: 'Český', value: 'cs' },
    { name: 'Danish', dispName: 'Dansk', value: 'da' },
    { name: 'Dutch', dispName: 'Nederlands', value: 'nl' },
    { name: 'English', dispName: 'English', value: 'en' },
    { name: 'Estonian', dispName: 'Eesti', value: 'et' },
    {
        name: 'Farsi',
        dispName: 'فارسی',
        value: 'fa',
        rtl: true
    },
    { name: 'Finnish', dispName: 'Suomi', value: 'fi' },
    { name: 'French', dispName: 'Français', value: 'fr' },
    { name: 'Galician', dispName: 'Galego', value: 'gl' },
    { name: 'German', dispName: 'Deutsch', value: 'de' },
    { name: 'Greek', dispName: 'Ελληνικά', value: 'el' },
    { name: 'Hindi', dispName: 'हिंदी', value: 'hi' },
    { name: 'Hungarian', dispName: 'Magyar', value: 'hu' },
    {
        name: 'Indonesian',
        dispName: 'Bahasa Indonesia',
        /*
           To fix a nasty bug in the JDK ("Indonesian Locale does not comply with ISO 639")
           The locale is set to "in" for Indonesia
           See https://bugs.openjdk.java.net/browse/JDK-6457127
           And https://github.com/jhipster/generator-jhipster/issues/9494
        */
        value: 'in',
        localeId: 'id',
        momentLocaleId: 'id'
    },
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
        localeId: 'pt'
    },
    {
        name: 'Portuguese',
        dispName: 'Português',
        value: 'pt-pt',
        localeId: 'pt-PT'
    },
    { name: 'Romanian', dispName: 'Română', value: 'ro' },
    { name: 'Russian', dispName: 'Русский', value: 'ru' },
    { name: 'Slovak', dispName: 'Slovenský', value: 'sk' },
    { name: 'Serbian', dispName: 'Srpski', value: 'sr' },
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
        momentLocaleId: 'uk'
    },
    {
        name: 'Uzbek (Cyrillic)',
        dispName: 'Ўзбекча',
        value: 'uz-Cyrl-uz',
        localeId: 'uz-Cyrl'
    },
    {
        name: 'Uzbek (Latin)',
        dispName: 'O`zbekcha',
        value: 'uz-Latn-uz',
        localeId: 'uz-Latn'
    },
    { name: 'Vietnamese', dispName: 'Tiếng Việt', value: 'vi' }
];

const constants = {
    INTERPOLATE_REGEX: /<%:([\s\S]+?)%>/g, // so that tags in templates do not get mistreated as _ templates
    DOCKER_DIR: `${MAIN_DIR}docker/`,
    LINE_LENGTH: 180,
    LANGUAGES,

    MAIN_DIR,
    TEST_DIR,

    CLIENT_MAIN_SRC_DIR: `${MAIN_DIR}webapp/`,
    CLIENT_TEST_SRC_DIR: `${TEST_DIR}javascript/`,
    CLIENT_WEBPACK_DIR: 'webpack/',
    CLIENT_DIST_DIR,
    ANGULAR_DIR: `${MAIN_DIR}webapp/app/`,
    REACT_DIR: `${MAIN_DIR}webapp/app/`,

    SERVER_MAIN_SRC_DIR: `${MAIN_DIR}java/`,
    SERVER_MAIN_RES_DIR: `${MAIN_DIR}resources/`,
    SERVER_TEST_SRC_DIR: `${TEST_DIR}java/`,
    SERVER_TEST_RES_DIR: `${TEST_DIR}resources/`,

    // entity related
    SUPPORTED_VALIDATION_RULES,

    JHIPSTER_DOCUMENTATION_URL,
    JHIPSTER_DOCUMENTATION_ARCHIVE_PATH,

    DOCKER_JHIPSTER_REGISTRY,
    DOCKER_JAVA_JRE,
    DOCKER_MYSQL,
    DOCKER_MARIADB,
    DOCKER_POSTGRESQL,
    DOCKER_MONGODB,
    DOCKER_COUCHBASE,
    DOCKER_CASSANDRA,
    DOCKER_MSSQL,
    DOCKER_HAZELCAST_MANAGEMENT_CENTER,
    DOCKER_MEMCACHED,
    DOCKER_ELASTICSEARCH,
    DOCKER_KEYCLOAK,
    DOCKER_KAFKA,
    DOCKER_ZOOKEEPER,
    DOCKER_SONAR,
    DOCKER_JHIPSTER_CONSOLE,
    DOCKER_JHIPSTER_CURATOR,
    DOCKER_JHIPSTER_ELASTICSEARCH,
    DOCKER_JHIPSTER_LOGSTASH,
    DOCKER_JHIPSTER_IMPORT_DASHBOARDS,
    DOCKER_JHIPSTER_ZIPKIN,
    DOCKER_TRAEFIK,
    DOCKER_CONSUL,
    DOCKER_CONSUL_CONFIG_LOADER,
    DOCKER_PROMETHEUS,
    DOCKER_PROMETHEUS_ALERTMANAGER,
    DOCKER_GRAFANA,
    JAVA_VERSION,
    NODE_VERSION,
    YARN_VERSION,
    NPM_VERSION,

    // Libraries
    JIB_VERSION,

    DOCKER_JENKINS,
    DOCKER_SWAGGER_EDITOR,
    SQL_DB_OPTIONS,
    DOCKER_COMPOSE_FORMAT_VERSION,
    DOCKER_PROMETHEUS_OPERATOR,
    DOCKER_GRAFANA_WATCHER,
    KUBERNETES_CORE_API_VERSION,
    KUBERNETES_BATCH_API_VERSION,
    KUBERNETES_DEPLOYMENT_API_VERSION,
    KUBERNETES_STATEFULSET_API_VERSION,
    KUBERNETES_INGRESS_API_VERSION,
    KUBERNETES_ISTIO_NETWORKING_API_VERSION,
    KUBERNETES_RBAC_API_VERSION
};

module.exports = constants;
