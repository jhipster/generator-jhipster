'use strict';

// version of docker images
const DOCKER_JHIPSTER_REGISTRY = 'jhipster/jhipster-registry:v2.4.0';
const DOCKER_JAVA_JRE = 'java:openjdk-8-jre-alpine';
const DOCKER_MYSQL = 'mysql:5.7.14';
const DOCKER_MARIADB = 'mariadb:10.1.16';
const DOCKER_POSTGRESQL = 'postgres:9.5.3';
const DOCKER_MONGODB = 'mongo:3.3.9';
const DOCKER_CASSANDRA = 'cassandra:2.2.7';
const DOCKER_ELASTICSEARCH = 'elasticsearch:2.3.5';
const DOCKER_SONAR = 'sonarqube:5.6-alpine';
const DOCKER_JHIPSTER_CONSOLE = 'jhipster/jhipster-console:v1.3.0';
const DOCKER_JHIPSTER_ELASTICSEARCH = 'jhipster/jhipster-elasticsearch:v1.3.0';
const DOCKER_JHIPSTER_LOGSTASH = 'jhipster/jhipster-logstash:v1.3.0';

// all constants used throughout all generators

const MAIN_DIR = 'src/main/';
const TEST_DIR = 'src/test/';

// Note: this will be prepended with 'target/' for Maven, or with 'build/' for Gradle.
const CLIENT_DIST_DIR = 'www/';

const SUPPORTED_VALIDATION_RULES = ['required', 'max', 'min', 'maxlength', 'minlength', 'maxbytes', 'minbytes', 'pattern'];

const constants = {
    QUESTIONS: 16, // maximum possible number of questions
    CLIENT_QUESTIONS: 3,
    SERVER_QUESTIONS: 13,
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

    DOCKER_JHIPSTER_REGISTRY: DOCKER_JHIPSTER_REGISTRY,
    DOCKER_JAVA_JRE: DOCKER_JAVA_JRE,
    DOCKER_MYSQL: DOCKER_MYSQL,
    DOCKER_MARIADB: DOCKER_MARIADB,
    DOCKER_POSTGRESQL: DOCKER_POSTGRESQL,
    DOCKER_MONGODB: DOCKER_MONGODB,
    DOCKER_CASSANDRA: DOCKER_CASSANDRA,
    DOCKER_ELASTICSEARCH: DOCKER_ELASTICSEARCH,
    DOCKER_SONAR: DOCKER_SONAR,
    DOCKER_JHIPSTER_CONSOLE: DOCKER_JHIPSTER_CONSOLE,
    DOCKER_JHIPSTER_ELASTICSEARCH: DOCKER_JHIPSTER_ELASTICSEARCH,
    DOCKER_JHIPSTER_LOGSTASH: DOCKER_JHIPSTER_LOGSTASH
};

module.exports = constants;
