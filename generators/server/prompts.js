'use strict';

var path = require('path'),
    shelljs = require('shelljs'),
    crypto = require('crypto');

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

    var done = this.async();
    var getNumberedQuestion = this.getNumberedQuestion.bind(this);
    var applicationType = this.applicationType;
    var prompts = [
        {
            when: function (response) {
                return (applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa');
            },
            type: 'input',
            name: 'serverPort',
            validate: function (input) {
                if (/^([0-9]*)$/.test(input)) return true;
                return 'This is not a valid port number.';
            },
            message: function (response) {
                return getNumberedQuestion('As you are running in a microservice architecture, on which port would like your server to run? It should be unique to avoid port conflicts.', applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa');
            },
            default: applicationType === 'gateway' ? '8080' : applicationType === 'uaa' ? '9999' : '8081'
        },
        {
            type: 'input',
            name: 'packageName',
            validate: function (input) {
                if (/^([a-z_]{1}[a-z0-9_]*(\.[a-z_]{1}[a-z0-9_]*)*)$/.test(input)) return true;
                return 'The package name you have provided is not a valid Java package name.';
            },
            message: function (response) {
                return getNumberedQuestion('What is your default Java package name?', true);
            },
            default: 'com.mycompany.myapp',
            store: true
        },
        {
            when: function (response) {
                return applicationType === 'monolith';
            },
            type: 'list',
            name: 'authenticationType',
            message: function (response) {
                return getNumberedQuestion('Which *type* of authentication would you like to use?', applicationType === 'monolith');
            },
            choices: [
                {
                    value: 'session',
                    name: 'HTTP Session Authentication (stateful, default Spring Security mechanism)'
                },
                {
                    value: 'oauth2',
                    name: 'OAuth2 Authentication (stateless, with an OAuth2 server implementation)'
                },
                {
                    value: 'jwt',
                    name: 'JWT authentication (stateless, with a token)'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return applicationType === 'gateway' || applicationType === 'microservice';
            },
            type: 'list',
            name: 'authenticationType',
            message: function (response) {
                return getNumberedQuestion('Which *type* of authentication would you like to use?', applicationType === 'gateway' || applicationType === 'microservice');
            },
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
            when: function (response) {
                return ((applicationType === 'gateway' || applicationType === 'microservice') && response.authenticationType === 'uaa');
            },
            type: 'input',
            name: 'uaaBaseName',
            message: function (response) {
                return getNumberedQuestion('What is the folder path of your UAA application?.', (applicationType === 'gateway' || applicationType === 'microservice') && response.authenticationType === 'uaa');
            },
            default: '../uaa',
            validate: function (input) {
                var uaaAppData = getUaaAppName.call(this, input);

                if (uaaAppData && uaaAppData.baseName && uaaAppData.applicationType === 'uaa') {
                    return true;
                } else {
                    return 'Could not find a valid JHipster UAA server in path "' + input + '"';
                }
            }.bind(this)
        },
        {
            when: function (response) {
                return applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa';
            },
            type: 'list',
            name: 'serviceDiscoveryType',
            message: function (response) {
                return getNumberedQuestion('Which Service Discovery and Configuration solution would you like to use?', applicationType === 'gateway' || applicationType === 'microservice' ||  applicationType === 'uaa');
            },
            choices: [
                {
                    value: 'eureka',
                    name: 'JHipster Registry (using Eureka and Spring Cloud Config)'
                },
                {
                    value: 'consul',
                    name: '[BETA] Consul (using Spring Cloud Consul)'
                },
                {
                    value: false,
                    name: 'No Service Discovery and Configuration'
                }
            ],
            default: 'eureka'
        },
        {
            when: function (response) {
                return applicationType === 'microservice';
            },
            type: 'list',
            name: 'databaseType',
            message: function (response) {
                return getNumberedQuestion('Which *type* of database would you like to use?', applicationType === 'microservice');
            },
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
            when: function (response) {
                return response.enableSocialSignIn;
            },
            type: 'list',
            name: 'databaseType',
            message: function (response) {
                return getNumberedQuestion('Which *type* of database would you like to use?', response.enableSocialSignIn);
            },
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
            when: function (response) {
                return response.authenticationType === 'oauth2' && !response.enableSocialSignIn && applicationType !== 'microservice';
            },
            type: 'list',
            name: 'databaseType',
            message: function (response) {
                return getNumberedQuestion('Which *type* of database would you like to use?', response.authenticationType === 'oauth2' && !response.enableSocialSignIn && applicationType !== 'microservice');
            },
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
            when: function (response) {
                return response.authenticationType !== 'oauth2' && !response.enableSocialSignIn && applicationType !== 'microservice';
            },
            type: 'list',
            name: 'databaseType',
            message: function (response) {
                return getNumberedQuestion('Which *type* of database would you like to use?', response.authenticationType !== 'oauth2' && !response.enableSocialSignIn && applicationType !== 'microservice');
            },
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
            when: function (response) {
                return response.databaseType === 'sql';
            },
            type: 'list',
            name: 'prodDatabaseType',
            message: function (response) {
                return getNumberedQuestion('Which *production* database would you like to use?', response.databaseType === 'sql');
            },
            choices: [
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
                    name: 'Oracle - Warning! The Oracle JDBC driver (ojdbc) is not bundled because it is not Open Source. Please follow our documentation to install it manually.'
                },
                {
                    value: 'mssql',
                    name: 'Microsoft SQL Server'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return (response.databaseType === 'sql' && response.prodDatabaseType === 'mysql');
            },
            type: 'list',
            name: 'devDatabaseType',
            message: function (response) {
                return getNumberedQuestion('Which *development* database would you like to use?', response.databaseType === 'sql' && response.prodDatabaseType === 'mysql');
            },
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
            when: function (response) {
                return (response.databaseType === 'sql' && response.prodDatabaseType === 'mariadb');
            },
            type: 'list',
            name: 'devDatabaseType',
            message: function (response) {
                return getNumberedQuestion('Which *development* database would you like to use?', response.databaseType === 'sql' && response.prodDatabaseType === 'mariadb');
            },
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
            when: function (response) {
                return (response.databaseType === 'sql' && response.prodDatabaseType === 'postgresql');
            },
            type: 'list',
            name: 'devDatabaseType',
            message: function (response) {
                return getNumberedQuestion('Which *development* database would you like to use?', response.databaseType === 'sql' && response.prodDatabaseType === 'postgresql');
            },
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
            when: function (response) {
                return (response.databaseType === 'sql' && response.prodDatabaseType === 'oracle');
            },
            type: 'list',
            name: 'devDatabaseType',
            message: function (response) {
                return getNumberedQuestion('Which *development* database would you like to use?', response.databaseType === 'sql' && response.prodDatabaseType === 'oracle');
            },
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
            when: function (response) {
                return (response.databaseType === 'sql' && response.prodDatabaseType === 'mssql');
            },
            type: 'list',
            name: 'devDatabaseType',
            message: function (response) {
                return getNumberedQuestion('Which *development* database would you like to use?', response.databaseType === 'sql' && response.prodDatabaseType === 'mssql');
            },
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
            when: function (response) {
                return response.databaseType === 'sql';
            },
            type: 'list',
            name: 'hibernateCache',
            message: function (response) {
                return getNumberedQuestion('Do you want to use Hibernate 2nd level cache?', response.databaseType === 'sql');
            },
            choices: [
                {
                    value: 'no',
                    name: 'No'
                },
                {
                    value: 'ehcache',
                    name: 'Yes, with ehcache (local cache, for a single node)'
                },
                {
                    value: 'hazelcast',
                    name: 'Yes, with HazelCast (distributed cache, for multiple nodes)'
                }
            ],
            default: (applicationType === 'gateway' || applicationType === 'microservice' || applicationType === 'uaa') ? 2 : 1
        },
        {
            type: 'list',
            name: 'buildTool',
            message: function (response) {
                return getNumberedQuestion('Would you like to use Maven or Gradle for building the backend?', true);
            },
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

    this.prompt(prompts).then(function (props) {
        this.authenticationType = props.authenticationType;

        if (this.authenticationType === 'session') {
            this.rememberMeKey = crypto.randomBytes(20).toString('hex');
        }

        if (this.authenticationType === 'jwt' || this.applicationType === 'microservice') {
            this.jwtSecretKey = crypto.randomBytes(20).toString('hex');
        }

        //this will be handled by the UAA app
        if(this.applicationType === 'gateway' && this.authenticationType === 'uaa') {
            this.skipUserManagement = true;
        }

        if(this.applicationType === 'uaa') {
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
        this.serviceDiscoveryType = props.serviceDiscoveryType;
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

        done();
    }.bind(this));
}

function askForOptionalItems() {
    if (this.existingProject) return;

    var done = this.async();
    var getNumberedQuestion = this.getNumberedQuestion.bind(this);
    var applicationType = this.applicationType;
    var choices = [];
    var defaultChoice = [];
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
                name: 'Search engine using ElasticSearch',
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
            message: function (response) {
                return getNumberedQuestion('Which other technologies would you like to use?', true);
            },
            choices: choices,
            default: defaultChoice
        }).then(function (prompt) {
            this.serverSideOptions = prompt.serverSideOptions;
            this.clusteredHttpSession = this.getOptionFromArray(this.serverSideOptions, 'clusteredHttpSession');
            this.websocket = this.getOptionFromArray(this.serverSideOptions, 'websocket');
            this.searchEngine = this.getOptionFromArray(this.serverSideOptions, 'searchEngine');
            this.enableSocialSignIn = this.getOptionFromArray(this.serverSideOptions, 'enableSocialSignIn');
            this.messageBroker = this.getOptionFromArray(this.serverSideOptions, 'messageBroker');
            done();
        }.bind(this));
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
    var fromPath = '';
    if(path.isAbsolute(input)) {
        fromPath = input + '/' + '.yo-rc.json';
    } else {
        fromPath = this.destinationPath(input + '/' + '.yo-rc.json');
    }

    if (shelljs.test('-f', fromPath)) {
        var fileData = this.fs.readJSON(fromPath);
        if (fileData && fileData['generator-jhipster']) {
            return fileData['generator-jhipster'];
        } else return false;
    } else {
        return false;
    }
}
