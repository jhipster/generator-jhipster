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
const prompts = require('./docker-prompts');
const BaseGenerator = require('./generator-base');
const { loadFromYoRc, checkDocker, checkImages, generateJwtSecret, setAppsFolderPaths } = require('./docker-base');
const statistics = require('./statistics');

const constants = require('./generator-constants');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });
        // This adds support for a `--skip-checks` flag
        this.option('skip-checks', {
            desc: 'Check the status of the required tools',
            type: Boolean,
            defaults: false
        });
        // This adds support for a `--skip-prompts` flag
        this.option('skip-prompts', {
            desc: 'Generate pre-existing configuration',
            type: Boolean,
            defaults: false
        });
        this.regenerate = this.options['skip-prompts'];
        this.skipChecks = this.options['skip-checks'];
        this.registerPrettierTransform();
    }

    get initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },

            setupServerConsts() {
                // Make constants available in templates
                this.DOCKER_KAFKA = constants.DOCKER_KAFKA;
                this.DOCKER_ZOOKEEPER = constants.DOCKER_ZOOKEEPER;
                this.DOCKER_JHIPSTER_REGISTRY = constants.DOCKER_JHIPSTER_REGISTRY;
                this.DOCKER_JHIPSTER_CONSOLE = constants.DOCKER_JHIPSTER_CONSOLE;
                this.DOCKER_JHIPSTER_CURATOR = constants.DOCKER_JHIPSTER_CURATOR;
                this.DOCKER_JHIPSTER_ELASTICSEARCH = constants.DOCKER_JHIPSTER_ELASTICSEARCH;
                this.DOCKER_JHIPSTER_LOGSTASH = constants.DOCKER_JHIPSTER_LOGSTASH;
                this.DOCKER_JHIPSTER_IMPORT_DASHBOARDS = constants.DOCKER_JHIPSTER_IMPORT_DASHBOARDS;
                this.DOCKER_JHIPSTER_ZIPKIN = constants.DOCKER_JHIPSTER_ZIPKIN;
                this.DOCKER_KEYCLOAK = constants.DOCKER_KEYCLOAK;
                this.DOCKER_TRAEFIK = constants.DOCKER_TRAEFIK;
                this.DOCKER_CONSUL = constants.DOCKER_CONSUL;
                this.DOCKER_CONSUL_CONFIG_LOADER = constants.DOCKER_CONSUL_CONFIG_LOADER;
                this.DOCKER_PROMETHEUS = constants.DOCKER_PROMETHEUS;
                this.DOCKER_PROMETHEUS_ALERTMANAGER = constants.DOCKER_PROMETHEUS_ALERTMANAGER;
                this.DOCKER_GRAFANA = constants.DOCKER_GRAFANA;
                this.DOCKER_COMPOSE_FORMAT_VERSION = constants.DOCKER_COMPOSE_FORMAT_VERSION;

                this.DOCKER_MYSQL = constants.DOCKER_MYSQL;
                this.DOCKER_MSSQL = constants.DOCKER_MSSQL;
                this.DOCKER_MARIADB = constants.DOCKER_MARIADB;
                this.DOCKER_POSTGRESQL = constants.DOCKER_POSTGRESQL;
                this.DOCKER_MONGODB = constants.DOCKER_MONGODB;
                this.DOCKER_COUCHBASE = constants.DOCKER_COUCHBASE;
                this.DOCKER_MEMCACHED = constants.DOCKER_MEMCACHED;
                this.DOCKER_REDIS = constants.DOCKER_REDIS;
                this.DOCKER_ELASTICSEARCH = constants.DOCKER_ELASTICSEARCH;
                this.DOCKER_PROMETHEUS_OPERATOR = constants.DOCKER_PROMETHEUS_OPERATOR;
                this.DOCKER_GRAFANA_WATCHER = constants.DOCKER_GRAFANA_WATCHER;

                this.DOCKER_CASSANDRA = constants.DOCKER_CASSANDRA;
                this.DOCKER_GRAFANA = constants.DOCKER_GRAFANA;
            },

            checkDocker,

            loadConfig() {
                loadFromYoRc.call(this);
            }
        };
    }

    get prompting() {
        return {
            askForApplicationType: prompts.askForApplicationType,
            askForGatewayType: prompts.askForGatewayType,
            askForPath: prompts.askForPath,
            askForApps: prompts.askForApps,
            askForClustersMode: prompts.askForClustersMode,
            askForMonitoring: prompts.askForMonitoring,
            askForConsoleOptions: prompts.askForConsoleOptions,
            askForServiceDiscovery: prompts.askForServiceDiscovery,
            askForAdminPassword: prompts.askForAdminPassword
        };
    }

    get configuring() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'docker-compose');
            },

            checkImages,
            generateJwtSecret,
            setAppsFolderPaths
        };
    }
};
