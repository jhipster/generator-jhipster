'use strict';

var path = require('path'),
    shelljs = require('shelljs'),
    crypto = require('crypto');

module.exports = {
    askForModuleName,
    askForServerSideOpts,
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
                return (applicationType === 'gateway' && response.authenticationType === 'uaa');
            },
            type: 'input',
            name: 'uaaBaseName',
            message: function (response) {
                return getNumberedQuestion('What is the folder path of your UAA application?.', applicationType === 'gateway' && response.authenticationType === 'uaa');
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
                return applicationType === 'monolith' && (response.authenticationType === 'session' || response.authenticationType === 'jwt');
            },
            type: 'list',
            name: 'enableSocialSignIn',
            message: function (response) {
                return getNumberedQuestion('Do you want to use social login (Google, Facebook, Twitter)? Warning, this doesn\'t work with Cassandra!',
                    applicationType === 'monolith' && (response.authenticationType === 'session' || response.authenticationType === 'jwt'));
            },
            choices: [
                {
                    value: false,
                    name: 'No'
                },
                {
                    value: true,
                    name: 'Yes, use social login'
                }
            ],
            default: false
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
            when: function (response) {
                return response.databaseType === 'sql';
            },
            type: 'list',
            name: 'searchEngine',
            message: function (response) {
                return getNumberedQuestion('Do you want to use a search engine in your application?', response.databaseType === 'sql');
            },
            choices: [
                {
                    value: 'no',
                    name: 'No'
                },
                {
                    value: 'elasticsearch',
                    name: 'Yes, with ElasticSearch'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return applicationType === 'monolith' || applicationType === 'gateway';
            },
            type: 'list',
            name: 'clusteredHttpSession',
            message: function (response) {
                return getNumberedQuestion('Do you want to use clustered HTTP sessions?', applicationType === 'monolith' || applicationType === 'gateway');
            },
            choices: [
                {
                    value: 'no',
                    name: 'No'
                },
                {
                    value: 'hazelcast',
                    name: 'Yes, with HazelCast'
                }
            ],
            default: 0
        },
        {
            when: function (response) {
                return applicationType === 'monolith' || applicationType === 'gateway';
            },
            type: 'list',
            name: 'websocket',
            message: function (response) {
                return getNumberedQuestion('Do you want to use WebSockets?', applicationType === 'monolith' || applicationType === 'gateway');
            },
            choices: [
                {
                    value: 'no',
                    name: 'No'
                },
                {
                    value: 'spring-websocket',
                    name: 'Yes, with Spring Websocket'
                }
            ],
            default: 0
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

    this.prompt(prompts, function (props) {
        this.authenticationType = props.authenticationType;

        if (this.authenticationType === 'session') {
            this.rememberMeKey = crypto.randomBytes(20).toString('hex');
        }

        if (this.authenticationType === 'jwt' || this.authenticationType === 'uaa' || this.applicationType === 'microservice' || this.applicationType === 'uaa') {
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
        this.clusteredHttpSession = props.clusteredHttpSession;
        this.websocket = props.websocket;
        this.databaseType = props.databaseType;
        this.devDatabaseType = props.devDatabaseType;
        this.prodDatabaseType = props.prodDatabaseType;
        this.searchEngine = props.searchEngine;
        this.buildTool = props.buildTool;
        this.enableSocialSignIn = props.enableSocialSignIn;
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
        if (this.searchEngine === undefined) {
            this.searchEngine = 'no';
        }

        done();
    }.bind(this));
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
