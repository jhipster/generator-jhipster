/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
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

const path = require('path');
const shelljs = require('shelljs');
const crypto = require('crypto');

const constants = require('../generator-constants');

module.exports = {
    askForModuleName,
    askForServerSideOpts,
    askForOptionalItems,
    askFori18n
};

function askForModuleName() {
    if (this.baseName) return;

    this.askModuleName(this);
}

function askForServerSideOpts() {
    if (this.existingProject) return;

    const done = this.async();
    const applicationType = this.applicationType;
    let defaultPort = applicationType === 'gateway' ? '8080' : '8081';
    if (applicationType === 'uaa') {
        defaultPort = '9999';
    }
    const prompts = [
        {
            when: response => (applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa'),
            type: 'input',
            name: 'serverPort',
            validate: input => (/^([0-9]*)$/.test(input) ? true : 'This is not a valid port number.'),
            message: response => this.getNumberedQuestion(
                'As you are running in a microservice architecture, on which port would like your server to run? It should be unique to avoid port conflicts.',
                applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa'
            ),
            default: defaultPort
        },
        {
            type: 'input',
            name: 'packageName',
            validate: input => (/^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input) ?
                true : 'The package name you have provided is not a valid Java package name.'),
            message: response => this.getNumberedQuestion('What is your default Java package name?', true),
            default: 'com.mycompany.myapp',
            store: true
        },
        {
            when: response => applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa',
            type: 'list',
            name: 'serviceDiscoveryType',
            message: response => this.getNumberedQuestion(
                'Do you want to use the JHipster Registry to configure, monitor and scale your microservices and gateways?',
                applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa'
            ),
            choices: [
                {
                    value: 'eureka',
                    name: 'Yes'
                },
                {
                    value: 'consul',
                    name: '[BETA] No, use Consul as an alternative solution (uses Spring Cloud Consul)'
                },
                {
                    value: false,
                    name: 'No'
                }
            ],
            default: 'eureka'
        },
        {
            when: response => applicationType === 'monolith',
            type: 'list',
            name: 'serviceDiscoveryType',
            message: response => this.getNumberedQuestion(
                'Do you want to use the JHipster Registry to configure, monitor and scale your application?',
                applicationType === 'monolith'
            ),
            choices: [
                {
                    value: false,
                    name: 'No'
                },
                {
                    value: 'eureka',
                    name: 'Yes'
                }
            ],
            default: false
        },
        {
            when: response => applicationType === 'monolith' && response.serviceDiscoveryType !== 'eureka',
            type: 'list',
            name: 'authenticationType',
            message: response => this.getNumberedQuestion('Which *type* of authentication would you like to use?', applicationType === 'monolith'),
            choices: [
                {
                    value: 'jwt',
                    name: 'JWT authentication (stateless, with a token)'
                },
                {
                    value: 'session',
                    name: 'HTTP Session Authentication (stateful, default Spring Security mechanism)'
                },
                {
                    value: 'oauth2',
                    name: 'OAuth2 Authentication (stateless, with an OAuth2 server implementation)'
                }
            ],
            default: 0
        },
        {
            when: response => applicationType === 'gateway' || applicationType === 'microservice',
            type: 'list',
            name: 'authenticationType',
            message: response => this.getNumberedQuestion(
                'Which *type* of authentication would you like to use?',
                applicationType === 'gateway' || applicationType === 'microservice'
            ),
            choices: [
                {
                    value: 'jwt',
                    name: 'JWT authentication (stateless, with a token)'
                },
                {
                    value: 'uaa',
                    name: '[BETA] Authentication with JHipster UAA server (the server must be generated separately)'
                }
            ],
            default: 0
        },
        {
            when: response => ((applicationType === 'gateway' || applicationType === 'microservice') && response.authenticationType === 'uaa'),
            type: 'input',
            name: 'uaaBaseName',
            message: response => this.getNumberedQuestion(
                'What is the folder path of your UAA application?',
                (applicationType === 'gateway' || applicationType === 'microservice') && response.authenticationType === 'uaa'
            ),
            default: '../uaa',
            validate: (input) => {
                const uaaAppData = getUaaAppName.call(this, input);

                if (uaaAppData && uaaAppData.baseName && uaaAppData.applicationType === 'uaa') {
                    return true;
                }
                return `Could not find a valid JHipster UAA server in path "${input}"`;
            }
        },
        {
            when: response => applicationType === 'microservice' || (response.authenticationType === 'uaa' && applicationType === 'gateway'),
            type: 'list',
            name: 'databaseType',
            message: response => this.getNumberedQuestion(
                'Which *type* of database would you like to use?',
                applicationType === 'microservice' || (response.authenticationType === 'uaa' && applicationType === 'gateway')
            ),
            choices: [
                {
                    value: 'no',
                    name: 'No database'
                },
                {
                    value: 'sql',
                    name: 'SQL (H2, MySQL, MariaDB, PostgreSQL, Oracle)'
                },
                {
                    value: 'mongodb',
                    name: 'MongoDB'
                },
                {
                    value: 'cassandra',
                    name: 'Cassandra'
                }
            ],
            default: 1
        },
        {
            when: response => response.authenticationType === 'oauth2' && !response.databaseType,
            type: 'list',
            name: 'databaseType',
            message: response => this.getNumberedQuestion(
                'Which *type* of database would you like to use?', response.authenticationType === 'oauth2' && !response.databaseType
            ),
            choices: [
                {
                    value: 'sql',
                    name: 'SQL (H2, MySQL, MariaDB, PostgreSQL, Oracle)'
                },
                {
                    value: 'mongodb',
                    name: 'MongoDB'
                }
            ],
            default: 0
        },
        {
            when: response => !response.databaseType,
            type: 'list',
            name: 'databaseType',
            message: response => this.getNumberedQuestion('Which *type* of database would you like to use?', !response.databaseType),
            choices: [
                {
                    value: 'sql',
                    name: 'SQL (H2, MySQL, MariaDB, PostgreSQL, Oracle, MSSQL)'
                },
                {
                    value: 'mongodb',
                    name: 'MongoDB'
                },
                {
                    value: 'cassandra',
                    name: 'Cassandra'
                }
            ],
            default: 0
        },
        {
            when: response => response.databaseType === 'sql',
            type: 'list',
            name: 'prodDatabaseType',
            message: response => this.getNumberedQuestion('Which *production* database would you like to use?', response.databaseType === 'sql'),
            choices: constants.SQL_DB_OPTIONS,
            default: 0
        },
        {
            when: response => (response.databaseType === 'sql' && response.prodDatabaseType === 'mysql'),
            type: 'list',
            name: 'devDatabaseType',
            message: response => this.getNumberedQuestion(
                'Which *development* database would you like to use?',
                response.databaseType === 'sql' && response.prodDatabaseType === 'mysql'
            ),
            choices: [
                {
                    value: 'h2Disk',
                    name: 'H2 with disk-based persistence'
                },
                {
                    value: 'h2Memory',
                    name: 'H2 with in-memory persistence'
                },
                {
                    value: 'mysql',
                    name: 'MySQL'
                }
            ],
            default: 0
        },
        {
            when: response => (response.databaseType === 'sql' && response.prodDatabaseType === 'mariadb'),
            type: 'list',
            name: 'devDatabaseType',
            message: response => this.getNumberedQuestion(
                'Which *development* database would you like to use?', response.databaseType === 'sql' && response.prodDatabaseType === 'mariadb'
            ),
            choices: [
                {
                    value: 'h2Disk',
                    name: 'H2 with disk-based persistence'
                },
                {
                    value: 'h2Memory',
                    name: 'H2 with in-memory persistence'
                },
                {
                    value: 'mariadb',
                    name: 'MariaDB'
                }
            ],
            default: 0
        },
        {
            when: response => (response.databaseType === 'sql' && response.prodDatabaseType === 'postgresql'),
            type: 'list',
            name: 'devDatabaseType',
            message: response => this.getNumberedQuestion(
                'Which *development* database would you like to use?',
                response.databaseType === 'sql' && response.prodDatabaseType === 'postgresql'
            ),
            choices: [
                {
                    value: 'h2Disk',
                    name: 'H2 with disk-based persistence'
                },
                {
                    value: 'h2Memory',
                    name: 'H2 with in-memory persistence'
                },
                {
                    value: 'postgresql',
                    name: 'PostgreSQL'
                }
            ],
            default: 0
        },
        {
            when: response => (response.databaseType === 'sql' && response.prodDatabaseType === 'oracle'),
            type: 'list',
            name: 'devDatabaseType',
            message: response => this.getNumberedQuestion(
                'Which *development* database would you like to use?',
                response.databaseType === 'sql' && response.prodDatabaseType === 'oracle'
            ),
            choices: [
                {
                    value: 'h2Disk',
                    name: 'H2 with disk-based persistence'
                },
                {
                    value: 'h2Memory',
                    name: 'H2 with in-memory persistence'
                },
                {
                    value: 'oracle',
                    name: 'Oracle 12c'
                }
            ],
            default: 0
        },
        {
            when: response => (response.databaseType === 'sql' && response.prodDatabaseType === 'mssql'),
            type: 'list',
            name: 'devDatabaseType',
            message: response => this.getNumberedQuestion(
                'Which *development* database would you like to use?',
                response.databaseType === 'sql' && response.prodDatabaseType === 'mssql'
            ),
            choices: [
                {
                    value: 'h2Disk',
                    name: 'H2 with disk-based persistence'
                },
                {
                    value: 'h2Memory',
                    name: 'H2 with in-memory persistence'
                },
                {
                    value: 'mssql',
                    name: 'Microsoft SQL Server'
                }
            ],
            default: 0
        },
        {
            when: response => (response.databaseType === 'sql' && applicationType !== 'gateway'),
            type: 'list',
            name: 'hibernateCache',
            message: response => this.getNumberedQuestion('Do you want to use Hibernate 2nd level cache?', response.databaseType === 'sql'),
            choices: [
                {
                    value: 'ehcache',
                    name: 'Yes, with ehcache (local cache, for a single node)'
                },
                {
                    value: 'hazelcast',
                    name: 'Yes, with HazelCast (distributed cache, for multiple nodes)'
                },
                {
                    value: 'infinispan',
                    name: '[BETA] Yes, with Infinispan (hybrid cache, for multiple nodes)'
                },
                {
                    value: 'no',
                    name: 'No'
                }
            ],
            default: (applicationType === 'microservice' || applicationType === 'uaa') ? 1 : 0
        },
        {
            type: 'list',
            name: 'buildTool',
            message: response => this.getNumberedQuestion('Would you like to use Maven or Gradle for building the backend?', true),
            choices: [
                {
                    value: 'maven',
                    name: 'Maven'
                },
                {
                    value: 'gradle',
                    name: 'Gradle'
                }
            ],
            default: 'maven'
        }
    ];

    this.prompt(prompts).then((props) => {
        this.serviceDiscoveryType = props.serviceDiscoveryType;
        this.authenticationType = props.authenticationType;

        // JWT authentication is mandatory with Eureka, so the JHipster Registry
        // can control the applications
        if (this.serviceDiscoveryType === 'eureka' && this.authenticationType !== 'uaa') {
            this.authenticationType = 'jwt';
        }

        if (this.authenticationType === 'session') {
            this.rememberMeKey = crypto.randomBytes(20).toString('hex');
        }

        if (this.authenticationType === 'jwt' || this.applicationType === 'microservice') {
            this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
        }

        // this will be handled by the UAA app
        if (this.applicationType === 'gateway' && this.authenticationType === 'uaa') {
            this.skipUserManagement = true;
        }

        if (this.applicationType === 'uaa') {
            this.authenticationType = 'uaa';
        }

        this.packageName = props.packageName;
        this.serverPort = props.serverPort;
        if (this.serverPort === undefined) {
            this.serverPort = '8080';
        }
        this.hibernateCache = props.hibernateCache;
        this.databaseType = props.databaseType;
        this.devDatabaseType = props.devDatabaseType;
        this.prodDatabaseType = props.prodDatabaseType;
        this.searchEngine = props.searchEngine;
        this.buildTool = props.buildTool;
        this.uaaBaseName = getUaaAppName.call(this, props.uaaBaseName).baseName;

        if (this.databaseType === 'no') {
            this.devDatabaseType = 'no';
            this.prodDatabaseType = 'no';
            this.hibernateCache = 'no';
        } else if (this.databaseType === 'mongodb') {
            this.devDatabaseType = 'mongodb';
            this.prodDatabaseType = 'mongodb';
            this.hibernateCache = 'no';
        } else if (this.databaseType === 'cassandra') {
            this.devDatabaseType = 'cassandra';
            this.prodDatabaseType = 'cassandra';
            this.hibernateCache = 'no';
        }
        // Hazelcast is mandatory for Gateways, as it is used for rate limiting
        if (this.applicationType === 'gateway') {
            this.hibernateCache = 'hazelcast';
        }
        done();
    });
}

function askForOptionalItems() {
    if (this.existingProject) return;

    const done = this.async();
    const applicationType = this.applicationType;
    const choices = [];
    const defaultChoice = [];
    if (this.databaseType !== 'cassandra' && applicationType === 'monolith' && (this.authenticationType === 'session' || this.authenticationType === 'jwt')) {
        choices.push(
            {
                name: 'Social login (Google, Facebook, Twitter)',
                value: 'enableSocialSignIn:true'
            }
        );
    }
    if (this.databaseType === 'sql') {
        choices.push(
            {
                name: 'Search engine using Elasticsearch',
                value: 'searchEngine:elasticsearch'
            }
        );
    }
    if ((applicationType === 'monolith' || applicationType === 'gateway') &&
            (this.hibernateCache === 'no' || this.hibernateCache === 'hazelcast')) {
        choices.push(
            {
                name: 'Clustered HTTP sessions using Hazelcast',
                value: 'clusteredHttpSession:hazelcast'
            }
        );
    }
    if (applicationType === 'monolith' || applicationType === 'gateway') {
        choices.push(
            {
                name: 'WebSockets using Spring Websocket',
                value: 'websocket:spring-websocket'
            }
        );
    }

    choices.push(
        {
            name: '[BETA] Asynchronous messages using Apache Kafka',
            value: 'messageBroker:kafka'
        }
    );

    if (choices.length > 0) {
        this.prompt({
            type: 'checkbox',
            name: 'serverSideOptions',
            message: response => this.getNumberedQuestion('Which other technologies would you like to use?', true),
            choices,
            default: defaultChoice
        }).then((prompt) => {
            this.serverSideOptions = prompt.serverSideOptions;
            this.clusteredHttpSession = this.getOptionFromArray(this.serverSideOptions, 'clusteredHttpSession');
            this.websocket = this.getOptionFromArray(this.serverSideOptions, 'websocket');
            this.searchEngine = this.getOptionFromArray(this.serverSideOptions, 'searchEngine');
            this.enableSocialSignIn = this.getOptionFromArray(this.serverSideOptions, 'enableSocialSignIn');
            this.messageBroker = this.getOptionFromArray(this.serverSideOptions, 'messageBroker');
            // Only set this option if it hasn't been set in a previous question, as it's only optional for monoliths
            if (!this.serviceDiscoveryType) {
                this.serviceDiscoveryType = this.getOptionFromArray(this.serverSideOptions, 'serviceDiscoveryType');
            }
            done();
        });
    } else {
        done();
    }
}

function askFori18n() {
    if (this.existingProject || this.configOptions.skipI18nQuestion) return;

    this.aski18n(this);
}

function getUaaAppName(input) {
    if (!input) return false;

    input = input.trim();
    let fromPath = '';
    if (path.isAbsolute(input)) {
        fromPath = `${input}/.yo-rc.json`;
    } else {
        fromPath = this.destinationPath(`${input}/.yo-rc.json`);
    }

    if (shelljs.test('-f', fromPath)) {
        const fileData = this.fs.readJSON(fromPath);
        if (fileData && fileData['generator-jhipster']) {
            return fileData['generator-jhipster'];
        } return false;
    }
    return false;
}
