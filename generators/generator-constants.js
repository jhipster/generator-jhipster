'use strict';

// version of docker images
const DOCKER_JHIPSTER_REGISTRY = 'jhipster/jhipster-registry:v2.5.2';
const DOCKER_JAVA_JRE = 'openjdk:8-jre-alpine';
const DOCKER_MYSQL = 'mysql:5.7.13'; // mysql.5.7.14+ doesn't work well with zoned date time, see https://github.com/jhipster/generator-jhipster/pull/4038
const DOCKER_MARIADB = 'mariadb:10.1.17';
const DOCKER_POSTGRESQL = 'postgres:9.5.4';
const DOCKER_MONGODB = 'mongo:3.3.12';
const DOCKER_CASSANDRA = 'cassandra:2.2.7';
const DOCKER_ELASTICSEARCH = 'elasticsearch:2.4.0';
const DOCKER_KAFKA = 'wurstmeister/kafka:0.10.0.1';
const DOCKER_ZOOKEEPER = 'wurstmeister/zookeeper:3.4.6';
const DOCKER_SONAR = 'sonarqube:6.0-alpine';
const DOCKER_JHIPSTER_CONSOLE = 'jhipster/jhipster-console:v1.3.1';
const DOCKER_JHIPSTER_ELASTICSEARCH = 'jhipster/jhipster-elasticsearch:v1.3.1';
const DOCKER_JHIPSTER_LOGSTASH = 'jhipster/jhipster-logstash:v1.3.1';
const DOCKER_CONSUL = 'consul:v0.7.0 ';
const DOCKER_CONSUL_CONFIG_LOADER = 'jhipster/consul-config-loader:v0.1.2';

// all constants used throughout all generators

const MAIN_DIR = 'src/main/';
const TEST_DIR = 'src/test/';

// Note: this will be prepended with 'target/' for Maven, or with 'build/' for Gradle.
const CLIENT_DIST_DIR = 'www/';

const SUPPORTED_VALIDATION_RULES = ['required', 'max', 'min', 'maxlength', 'minlength', 'maxbytes', 'minbytes', 'pattern'];

// documentation constants
const JHIPSTER_DOCUMENTATION_URL = 'https://jhipster.github.io';
const JHIPSTER_DOCUMENTATION_ARCHIVE_PATH = '/documentation-archive/';

const constants = {
    QUESTIONS: 13, // maximum possible number of questions
    CLIENT_QUESTIONS: 3,
    SERVER_QUESTIONS: 10,
    INTERPOLATE_REGEX: /<%:([\s\S]+?)%>/g, // so that tags in templates do not get mistreated as _ templates
    DOCKER_DIR: MAIN_DIR + 'docker/',

    MAIN_DIR: MAIN_DIR,
    TEST_DIR: TEST_DIR,

    CLIENT_MAIN_SRC_DIR: MAIN_DIR + 'webapp/',
    CLIENT_TEST_SRC_DIR: TEST_DIR + 'javascript/',
    CLIENT_DIST_DIR: CLIENT_DIST_DIR,
    ANGULAR_DIR: MAIN_DIR + 'webapp/app/',

    SERVER_MAIN_SRC_DIR: MAIN_DIR + 'java/',
    SERVER_MAIN_RES_DIR: MAIN_DIR + 'resources/',
    SERVER_TEST_SRC_DIR: TEST_DIR + 'java/',
    SERVER_TEST_RES_DIR: TEST_DIR + 'resources/',

    //entity related
    SUPPORTED_VALIDATION_RULES: SUPPORTED_VALIDATION_RULES,

    JHIPSTER_DOCUMENTATION_URL: JHIPSTER_DOCUMENTATION_URL,
    JHIPSTER_DOCUMENTATION_ARCHIVE_PATH: JHIPSTER_DOCUMENTATION_ARCHIVE_PATH,

    DOCKER_JHIPSTER_REGISTRY: DOCKER_JHIPSTER_REGISTRY,
    DOCKER_JAVA_JRE: DOCKER_JAVA_JRE,
    DOCKER_MYSQL: DOCKER_MYSQL,
    DOCKER_MARIADB: DOCKER_MARIADB,
    DOCKER_POSTGRESQL: DOCKER_POSTGRESQL,
    DOCKER_MONGODB: DOCKER_MONGODB,
    DOCKER_CASSANDRA: DOCKER_CASSANDRA,
    DOCKER_ELASTICSEARCH: DOCKER_ELASTICSEARCH,
    DOCKER_KAFKA: DOCKER_KAFKA,
    DOCKER_ZOOKEEPER: DOCKER_ZOOKEEPER,
    DOCKER_SONAR: DOCKER_SONAR,
    DOCKER_JHIPSTER_CONSOLE: DOCKER_JHIPSTER_CONSOLE,
    DOCKER_JHIPSTER_ELASTICSEARCH: DOCKER_JHIPSTER_ELASTICSEARCH,
    DOCKER_JHIPSTER_LOGSTASH: DOCKER_JHIPSTER_LOGSTASH,
    DOCKER_CONSUL: DOCKER_CONSUL,
    DOCKER_CONSUL_CONFIG_LOADER: DOCKER_CONSUL_CONFIG_LOADER
};


module.exports = constants;
