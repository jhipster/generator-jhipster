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

// version of docker images
const DOCKER_JHIPSTER_REGISTRY = 'jhipster/jhipster-registry:v3.1.0';
const DOCKER_JAVA_JRE = 'openjdk:8-jre-alpine';
const DOCKER_MYSQL = 'mysql:5.7.18';
const DOCKER_MARIADB = 'mariadb:10.1.17';
const DOCKER_POSTGRESQL = 'postgres:9.6.2';
const DOCKER_MONGODB = 'mongo:3.2.10';
const DOCKER_CASSANDRA = 'cassandra:3.9';
const DOCKER_MSSQL = 'microsoft/mssql-server-linux:latest';
const DOCKER_ORACLE = 'sath89/oracle-12c:latest';
const DOCKER_ELASTICSEARCH = 'elasticsearch:2.4.1';
const DOCKER_KAFKA = 'wurstmeister/kafka:0.10.1.1';
const DOCKER_ZOOKEEPER = 'wurstmeister/zookeeper:3.4.6';
const DOCKER_SONAR = 'sonarqube:6.4-alpine';
const DOCKER_JHIPSTER_CONSOLE = 'jhipster/jhipster-console:v2.2.1';
const DOCKER_JHIPSTER_CURATOR = 'jhipster/jhipster-curator:v2.2.1';
const DOCKER_JHIPSTER_ELASTICSEARCH = 'jhipster/jhipster-elasticsearch:v2.2.1';
const DOCKER_JHIPSTER_LOGSTASH = 'jhipster/jhipster-logstash:v2.2.1';
const DOCKER_JHIPSTER_IMPORT_DASHBOARDS = 'jhipster/jhipster-import-dashboards:v2.2.1';
const DOCKER_JHIPSTER_ZIPKIN = 'jhipster/jhipster-zipkin:v2.2.1';
const DOCKER_CONSUL = 'consul:0.8.3';
const DOCKER_CONSUL_CONFIG_LOADER = 'jhipster/consul-config-loader:v0.2.2';
const DOCKER_PROMETHEUS = 'prom/prometheus:v1.6.3';
const DOCKER_PROMETHEUS_ALERTMANAGER = 'prom/alertmanager:v0.6.2';
const DOCKER_GRAFANA = 'grafana/grafana:4.3.2';
const DOCKER_JENKINS = 'jenkins:latest';
const DOCKER_COMPOSE_FORMAT_VERSION = '2';

// version of Node, Yarn, NPM
const NODE_VERSION = '6.11.1';
const YARN_VERSION = '0.27.5';
const NPM_VERSION = '5.3.0';

// all constants used throughout all generators

const MAIN_DIR = 'src/main/';
const TEST_DIR = 'src/test/';

// Note: this will be prepended with 'target/' for Maven, or with 'build/' for Gradle.
const CLIENT_DIST_DIR = 'www/';

const SUPPORTED_VALIDATION_RULES = ['required', 'max', 'min', 'maxlength', 'minlength', 'maxbytes', 'minbytes', 'pattern'];

// documentation constants
const JHIPSTER_DOCUMENTATION_URL = 'http://www.jhipster.tech';
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
    { name: 'Arabic (Libya)', dispName: 'العربية', value: 'ar-ly', rtl: true, skipForLocale: true },
    { name: 'Armenian', dispName: 'Հայերեն', value: 'hy' },
    { name: 'Catalan', dispName: 'Català', value: 'ca' },
    { name: 'Chinese (Simplified)', dispName: '中文（简体）', value: 'zh-cn' },
    { name: 'Chinese (Traditional)', dispName: '繁體中文', value: 'zh-tw' },
    { name: 'Czech', dispName: 'Český', value: 'cs' },
    { name: 'Danish', dispName: 'Dansk', value: 'da' },
    { name: 'Dutch', dispName: 'Nederlands', value: 'nl' },
    { name: 'English', dispName: 'English', value: 'en' },
    { name: 'Estonian', dispName: 'Eesti', value: 'et' },
    { name: 'Farsi', dispName: 'فارسی', value: 'fa', rtl: true },
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
    { name: 'Polish', dispName: 'Polski', value: 'pl' },
    { name: 'Portuguese (Brazilian)', dispName: 'Português (Brasil)', value: 'pt-br' },
    { name: 'Portuguese', dispName: 'Português', value: 'pt-pt' },
    { name: 'Romanian', dispName: 'Română', value: 'ro' },
    { name: 'Russian', dispName: 'Русский', value: 'ru' },
    { name: 'Slovak', dispName: 'Slovenský', value: 'sk' },
    { name: 'Serbian', dispName: 'Srpski', value: 'sr' },
    { name: 'Spanish', dispName: 'Español', value: 'es' },
    { name: 'Swedish', dispName: 'Svenska', value: 'sv' },
    { name: 'Turkish', dispName: 'Türkçe', value: 'tr' },
    { name: 'Tamil', dispName: 'தமிழ்', value: 'ta' },
    { name: 'Thai', dispName: 'ไทย', value: 'th' },
    { name: 'Ukrainian', dispName: 'Українська', value: 'ua' },
    { name: 'Vietnamese', dispName: 'Tiếng Việt', value: 'vi' }
];

const constants = {
    QUESTIONS: 16, // maximum possible number of questions
    CLIENT_QUESTIONS: 4,
    SERVER_QUESTIONS: 16,
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
    DOCKER_CASSANDRA,
    DOCKER_MSSQL,
    DOCKER_ORACLE,
    DOCKER_ELASTICSEARCH,
    DOCKER_KAFKA,
    DOCKER_ZOOKEEPER,
    DOCKER_SONAR,
    DOCKER_JHIPSTER_CONSOLE,
    DOCKER_JHIPSTER_CURATOR,
    DOCKER_JHIPSTER_ELASTICSEARCH,
    DOCKER_JHIPSTER_LOGSTASH,
    DOCKER_JHIPSTER_IMPORT_DASHBOARDS,
    DOCKER_JHIPSTER_ZIPKIN,
    DOCKER_CONSUL,
    DOCKER_CONSUL_CONFIG_LOADER,
    DOCKER_PROMETHEUS,
    DOCKER_PROMETHEUS_ALERTMANAGER,
    DOCKER_GRAFANA,
    NODE_VERSION,
    YARN_VERSION,
    NPM_VERSION,
    DOCKER_JENKINS,
    SQL_DB_OPTIONS,
    DOCKER_COMPOSE_FORMAT_VERSION
};

module.exports = constants;
