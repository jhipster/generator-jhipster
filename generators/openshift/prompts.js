const _ = require('lodash');
const dockerPrompts = require('../docker-prompts');

module.exports = _.extend({
    askForOpenShiftNamespace,
    askForStorageType,
    askForMSSQLConfig,
}, dockerPrompts);

function askForOpenShiftNamespace() {
    const done = this.async();

    const prompts = [{
        type: 'input',
        name: 'openshiftNamespace',
        message: 'What should we use for the OpenShift namespace?',
        default: this.openshiftNamespace ? this.openshiftNamespace : 'default'
    },{
        type: 'input',
        name: 'openshiftUrl',
        message: 'What is the address of your openshift console?',
        default: this.openshiftUrl ? this.openshiftUrl : 'master.openshift.local:8443'
    }];

    this.prompt(prompts).then((props) => {
        this.openshiftNamespace = props.openshiftNamespace;
        this.openshiftUrl = props.openshiftUrl;
        done();
    });
}

function askForMSSQLConfig() {
    const done = this.async();
    this.appConfigs.some((appConfig, index) => {
        if (appConfig.prodDatabaseType !== 'mssql') {
            done();
            return;
        }
    });
    //ask questions
    const prompts = [{
        type: 'input',
        name: 'mssqlURL',
        message: 'What is the address of your MSSQL Server?',
        default: this.mssqlURL ? this.mssqlURL : 'MSSQL\SQLExpress'
    },{
        type: 'input',
        name: 'mssqlUser',
        message: 'What is your MS SQL Username?',
        default: this.mssqlUser ? this.mssqlUser : 'sa'
    },{
        type: 'input',
        name: 'mssqlPass',
        message: 'What is the users password?',
        default: this.mssqlPass ? this.mssqlPass : 'Password'
    },{
        type: 'input',
        name: 'mssqlDb',
        message: 'What is the database name?',
        default: this.mssqlDb ? this.mssqlDb : 'master'
    }];

    this.prompt(prompts).then((props) => {
        this.mssqlURL = props.mssqlURL;
        this.mssqlUser = props.mssqlUser;
        this.mssqlPass = props.mssqlPass;
        this.mssqlDb = props.mssqlDb;
        done();
    });
}


function askForStorageType() {
    const done = this.async();

    let storageEnabled = false;
    this.appConfigs.some((appConfig, index) => {
        if (appConfig.prodDatabaseType !== 'no' || appConfig.searchEngine === 'elasticsearch' || appConfig.monitoring === 'elk' || appConfig.monitoring === 'prometheus') {
            storageEnabled = true;
            return storageEnabled;
        }
        return false;
    });

    if (storageEnabled === false) {
        done();
        return;
    }

    // prompt this only when prodDatabaseType !== 'no' for any of the chosen apps
    const prompts = [{
        type: 'list',
        name: 'storageType',
        message: 'Which *type* of database storage would you like to use?',
        choices: [
            {
                value: 'persistent',
                name: 'Persistent Storage'
            },
            {
                value: 'ephemeral',
                name: 'Ephemeral Storage'
            }
        ],
        default: 'ephemeral'
    }];

    this.prompt(prompts).then((props) => {
        this.storageType = props.storageType;
        done();
    });
}
