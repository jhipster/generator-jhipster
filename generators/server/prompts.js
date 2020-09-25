/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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

const chalk = require('chalk');

const constants = require('../generator-constants');
const { serverDefaultConfig } = require('../generator-defaults');

module.exports = {
    askForModuleName,
    askForServerSideOpts,
    askForOptionalItems,
};

function askForModuleName() {
    if (this.jhipsterConfig.baseName) return undefined;

    return this.askModuleName(this);
}

function askForServerSideOpts() {
    if (this.existingProject) return undefined;

    const applicationType = this.jhipsterConfig.applicationType;
    const reactive = this.jhipsterConfig.reactive;
    const uaaBaseName = this.jhipsterConfig.uaaBaseName;
    let defaultPort = applicationType === 'gateway' ? '8080' : '8081';
    if (applicationType === 'uaa') {
        defaultPort = '9999';
    }
    const prompts = [
        {
            when: response => applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa',
            type: 'input',
            name: 'serverPort',
            validate: input => (/^([0-9]*)$/.test(input) ? true : 'This is not a valid port number.'),
            message:
                'As you are running in a microservice architecture, on which port would like your server to run? It should be unique to avoid port conflicts.',
            default: defaultPort,
        },
        {
            type: 'input',
            name: 'packageName',
            validate: input =>
                /^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input)
                    ? true
                    : 'The package name you have provided is not a valid Java package name.',
            message: 'What is your default Java package name?',
            default: serverDefaultConfig.packageName,
            store: true,
        },
        {
            when: response => applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa',
            type: 'list',
            name: 'serviceDiscoveryType',
            message: 'Which service discovery server do you want to use?',
            choices: [
                {
                    value: 'eureka',
                    name: 'JHipster Registry (uses Eureka, provides Spring Cloud Config support and monitoring dashboards)',
                },
                {
                    value: 'consul',
                    name: 'Consul',
                },
                {
                    value: false,
                    name: 'No service discovery',
                },
            ],
            default: 'eureka',
        },
        {
            when: applicationType === 'monolith',
            type: 'list',
            name: 'serviceDiscoveryType',
            message: 'Do you want to use the JHipster Registry to configure, monitor and scale your application?',
            choices: [
                {
                    value: false,
                    name: 'No',
                },
                {
                    value: 'eureka',
                    name: 'Yes',
                },
            ],
            default: serverDefaultConfig.serviceDiscoveryType,
        },
        {
            when: response =>
                (applicationType === 'monolith' && response.serviceDiscoveryType !== 'eureka') ||
                ['gateway', 'microservice'].includes(applicationType),
            type: 'list',
            name: 'authenticationType',
            message: `Which ${chalk.yellow('*type*')} of authentication would you like to use?`,
            choices: response => {
                const opts = [
                    {
                        value: 'jwt',
                        name: 'JWT authentication (stateless, with a token)',
                    },
                ];
                if (applicationType === 'monolith' && response.serviceDiscoveryType !== 'eureka') {
                    opts.push({
                        value: 'session',
                        name: 'HTTP Session Authentication (stateful, default Spring Security mechanism)',
                    });
                }
                opts.push({
                    value: 'oauth2',
                    name: 'OAuth 2.0 / OIDC Authentication (stateful, works with Keycloak and Okta)',
                });
                if (!reactive) {
                    if (['gateway', 'microservice'].includes(applicationType)) {
                        opts.push({
                            value: 'uaa',
                            name: 'Authentication with JHipster UAA server (the server must be generated separately)',
                        });
                    }
                }
                return opts;
            },
            default: serverDefaultConfig.authenticationType,
        },
        {
            when: response =>
                (applicationType === 'gateway' || applicationType === 'microservice') &&
                response.authenticationType === 'uaa' &&
                uaaBaseName === undefined,
            type: 'input',
            name: 'uaaBaseName',
            message: 'What is the folder path of your UAA application?',
            default: '../uaa',
            validate: input => {
                const uaaAppData = this.getUaaAppName(input);

                if (uaaAppData && uaaAppData.baseName && uaaAppData.applicationType === 'uaa') {
                    return true;
                }
                return `Could not find a valid JHipster UAA server in path "${input}"`;
            },
            filter: input => {
                const uaaAppData = this.getUaaAppName(input);
                if (uaaAppData) {
                    return uaaAppData.baseName;
                }
                return uaaBaseName;
            },
        },
        {
            type: 'list',
            name: 'databaseType',
            message: `Which ${chalk.yellow('*type*')} of database would you like to use?`,
            choices: response => {
                const opts = [];
                if (!reactive) {
                    opts.push({
                        value: 'sql',
                        name: 'SQL (H2, MySQL, MariaDB, PostgreSQL, Oracle, MSSQL)',
                    });
                } else {
                    opts.push({
                        value: 'sql',
                        name: 'SQL (H2, MySQL, MariaDB, PostgreSQL, MSSQL)',
                    });
                }
                opts.push({
                    value: 'mongodb',
                    name: 'MongoDB',
                });
                if (response.authenticationType !== 'oauth2') {
                    opts.push({
                        value: 'cassandra',
                        name: 'Cassandra',
                    });
                }
                opts.push({
                    value: 'couchbase',
                    name: '[BROKEN] Couchbase',
                });
                opts.push({
                    value: 'neo4j',
                    name: '[BETA] Neo4j',
                });
                if (applicationType !== 'uaa') {
                    opts.push({
                        value: 'no',
                        name: 'No database',
                    });
                }
                return opts;
            },
            default: serverDefaultConfig.databaseType,
        },
        {
            when: response => response.databaseType === 'sql',
            type: 'list',
            name: 'prodDatabaseType',
            message: `Which ${chalk.yellow('*production*')} database would you like to use?`,
            choices: reactive ? constants.R2DBC_DB_OPTIONS : constants.SQL_DB_OPTIONS,
            default: serverDefaultConfig.prodDatabaseType,
        },
        {
            when: response => response.databaseType === 'sql',
            type: 'list',
            name: 'devDatabaseType',
            message: `Which ${chalk.yellow('*development*')} database would you like to use?`,
            choices: response =>
                [
                    {
                        value: 'h2Disk',
                        name: 'H2 with disk-based persistence',
                    },
                    {
                        value: 'h2Memory',
                        name: 'H2 with in-memory persistence',
                    },
                ].concat(constants.SQL_DB_OPTIONS.find(it => it.value === response.prodDatabaseType)),
            default: serverDefaultConfig.devDatabaseType,
        },
        {
            when: () => !reactive,
            type: 'list',
            name: 'cacheProvider',
            message: 'Do you want to use the Spring cache abstraction?',
            choices: [
                {
                    value: 'ehcache',
                    name: 'Yes, with the Ehcache implementation (local cache, for a single node)',
                },
                {
                    value: 'caffeine',
                    name: 'Yes, with the Caffeine implementation (local cache, for a single node)',
                },
                {
                    value: 'hazelcast',
                    name:
                        'Yes, with the Hazelcast implementation (distributed cache, for multiple nodes, supports rate-limiting for gateway applications)',
                },
                {
                    value: 'infinispan',
                    name: '[BETA] Yes, with the Infinispan implementation (hybrid cache, for multiple nodes)',
                },
                {
                    value: 'memcached',
                    name:
                        'Yes, with Memcached (distributed cache) - Warning, when using an SQL database, this will disable the Hibernate 2nd level cache!',
                },
                {
                    value: 'redis',
                    name: 'Yes, with the Redis implementation',
                },
                {
                    value: 'no',
                    name: 'No - Warning, when using an SQL database, this will disable the Hibernate 2nd level cache!',
                },
            ],
            default: applicationType === 'microservice' || applicationType === 'uaa' ? 2 : serverDefaultConfig.cacheProvider,
        },
        {
            when: response =>
                ((response.cacheProvider !== 'no' && response.cacheProvider !== 'memcached') || applicationType === 'gateway') &&
                response.databaseType === 'sql' &&
                !reactive,
            type: 'confirm',
            name: 'enableHibernateCache',
            message: 'Do you want to use Hibernate 2nd level cache?',
            default: serverDefaultConfig.enableHibernateCache,
        },
        {
            type: 'list',
            name: 'buildTool',
            message: 'Would you like to use Maven or Gradle for building the backend?',
            choices: [
                {
                    value: 'maven',
                    name: 'Maven',
                },
                {
                    value: 'gradle',
                    name: 'Gradle',
                },
            ],
            default: serverDefaultConfig.buildTool,
        },
    ];

    return this.prompt(prompts).then(props => {
        this.serviceDiscoveryType = this.jhipsterConfig.serviceDiscoveryType = props.serviceDiscoveryType;
        this.authenticationType = this.jhipsterConfig.authenticationType = props.authenticationType;

        this.packageName = this.jhipsterConfig.packageName = props.packageName;
        this.serverPort = this.jhipsterConfig.serverPort = props.serverPort || '8080';
        this.cacheProvider = this.jhipsterConfig.cacheProvider = !reactive ? props.cacheProvider : 'no';
        this.enableHibernateCache = this.jhipsterConfig.enableHibernateCache = !['no', 'memcached'].includes(this.cacheProvider) ? props.enableHibernateCache : false;
        this.databaseType = this.jhipsterConfig.databaseType = props.databaseType;
        this.devDatabaseType = this.jhipsterConfig.devDatabaseType = props.devDatabaseType;
        this.prodDatabaseType = this.jhipsterConfig.prodDatabaseType = props.prodDatabaseType;
        this.searchEngine = this.jhipsterConfig.searchEngine = props.searchEngine;
        this.buildTool = this.jhipsterConfig.buildTool = props.buildTool;
        this.uaaBaseName = this.jhipsterConfig.uaaBaseName = props.uaaBaseName || uaaBaseName;
    });
}

function askForOptionalItems() {
    if (this.existingProject) return undefined;

    const applicationType = this.jhipsterConfig.applicationType;
    const reactive = this.jhipsterConfig.reactive;
    const databaseType = this.jhipsterConfig.databaseType;

    const choices = [];
    const defaultChoice = [];
    if (['sql', 'mongodb', 'neo4j'].includes(databaseType)) {
        choices.push({
            name: 'Search engine using Elasticsearch',
            value: 'searchEngine:elasticsearch',
        });
    }
    if (databaseType === 'couchbase') {
        choices.push({
            name: 'Search engine using Couchbase FTS',
            value: 'searchEngine:couchbase',
        });
    }
    if (!reactive) {
        if (applicationType === 'monolith' || applicationType === 'gateway') {
            choices.push({
                name: 'WebSockets using Spring Websocket',
                value: 'websocket:spring-websocket',
            });
        }
    }
    choices.push({
        name: 'Asynchronous messages using Apache Kafka',
        value: 'messageBroker:kafka',
    });
    choices.push({
        name: 'API first development using OpenAPI-generator',
        value: 'enableSwaggerCodegen:true',
    });

    const PROMPTS = {
        type: 'checkbox',
        name: 'serverSideOptions',
        message: 'Which other technologies would you like to use?',
        choices,
        default: defaultChoice,
    };

    if (choices.length > 0) {
        return this.prompt(PROMPTS).then(prompt => {
            this.serverSideOptions = this.jhipsterConfig.serverSideOptions = prompt.serverSideOptions;
            this.websocket = this.jhipsterConfig.websocket = this.getOptionFromArray(this.serverSideOptions, 'websocket');
            this.searchEngine = this.jhipsterConfig.searchEngine = this.getOptionFromArray(this.serverSideOptions, 'searchEngine');
            this.messageBroker = this.jhipsterConfig.messageBroker = this.getOptionFromArray(this.serverSideOptions, 'messageBroker');
            this.enableSwaggerCodegen = this.jhipsterConfig.enableSwaggerCodegen = this.getOptionFromArray(
                this.serverSideOptions,
                'enableSwaggerCodegen'
            );
            // Only set this option if it hasn't been set in a previous question, as it's only optional for monoliths
            if (!this.jhipsterConfig.serviceDiscoveryType) {
                this.serviceDiscoveryType = this.jhipsterConfig.serviceDiscoveryType = this.getOptionFromArray(
                    this.serverSideOptions,
                    'serviceDiscoveryType'
                );
            }
        });
    }
    return undefined;
}
