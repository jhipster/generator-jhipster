// version of docker images
const DOCKER_JHIPSTER_REGISTRY = 'jhipster/jhipster-registry:v2.6.0';
const DOCKER_JAVA_JRE = 'openjdk:8-jre-alpine';
const DOCKER_MYSQL = 'mysql:5.7.13'; // mysql.5.7.14+ doesn't work well with zoned date time, see https://github.com/jhipster/generator-jhipster/pull/4038
const DOCKER_MARIADB = 'mariadb:10.1.17';
const DOCKER_POSTGRESQL = 'postgres:9.6.2';
const DOCKER_MONGODB = 'mongo:3.2.10';
const DOCKER_CASSANDRA = 'cassandra:3.9';
const DOCKER_MSSQL = 'microsoft/mssql-server-linux:latest';
const DOCKER_ORACLE = 'sath89/oracle-12c:latest';
const DOCKER_ELASTICSEARCH = 'elasticsearch:2.4.1';
const DOCKER_KAFKA = 'wurstmeister/kafka:0.10.1.1';
const DOCKER_ZOOKEEPER = 'wurstmeister/zookeeper:3.4.6';
const DOCKER_SONAR = 'sonarqube:6.2-alpine';
const DOCKER_JHIPSTER_CONSOLE = 'jhipster/jhipster-console:v2.0.1';
const DOCKER_JHIPSTER_ELASTICSEARCH = 'jhipster/jhipster-elasticsearch:v2.0.1';
const DOCKER_JHIPSTER_LOGSTASH = 'jhipster/jhipster-logstash:v2.0.1';
const DOCKER_JHIPSTER_ZIPKIN = 'jhipster/jhipster-zipkin:v2.0.1';
const DOCKER_CONSUL = 'consul:0.7.2';
const DOCKER_CONSUL_CONFIG_LOADER = 'jhipster/consul-config-loader:v0.2.1';
const DOCKER_PROMETHEUS = 'prom/prometheus:v1.4.1';
const DOCKER_PROMETHEUS_ALERTMANAGER = 'prom/alertmanager:v0.5.1';
const DOCKER_GRAFANA = 'grafana/grafana:4.0.2';
const DOCKER_JENKINS = 'jenkins:latest';

// version of Node, Yarn, NPM
const NODE_VERSION = '6.10.0';
const YARN_VERSION = '0.21.3';
const NPM_VERSION = '4.3.0';

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
    QUESTIONS: 15, // maximum possible number of questions
    CLIENT_QUESTIONS: 4,
    SERVER_QUESTIONS: 15,
    INTERPOLATE_REGEX: /<%:([\s\S]+?)%>/g, // so that tags in templates do not get mistreated as _ templates
    DOCKER_DIR: `${MAIN_DIR}docker/`,

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
    DOCKER_JHIPSTER_ELASTICSEARCH,
    DOCKER_JHIPSTER_LOGSTASH,
    DOCKER_JHIPSTER_ZIPKIN,
    DOCKER_CONSUL,
    DOCKER_CONSUL_CONFIG_LOADER,
    DOCKER_PROMETHEUS,
    DOCKER_PROMETHEUS_ALERTMANAGER,
    DOCKER_GRAFANA,
    NODE_VERSION,
    YARN_VERSION,
    NPM_VERSION,
    DOCKER_JENKINS
};

module.exports = constants;
