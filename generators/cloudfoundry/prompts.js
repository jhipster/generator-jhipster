'use strict';

var chalk = require('chalk'),
    _ = require('lodash');

module.exports = {
    prompting
};

function prompting() {
    var done = this.async();
    var databaseType = this.databaseType;
    var prompts = [
        {
            name: 'cloudfoundryDeployedName',
            message: 'Name to deploy as:',
            default: this.baseName
        },
        {
            type: 'list',
            name: 'cloudfoundryProfile',
            message: 'Which profile would you like to use?',
            choices: [
                {
                    value: 'dev',
                    name: 'dev'
                },
                {
                    value: 'prod',
                    name: 'prod'
                }
            ],
            default: 0
        },
        {
            when: function(response) {
                return databaseType !== 'no';
            },
            name: 'cloudfoundryDatabaseServiceName',
            message: 'What is the name of your database service?',
            default: 'elephantsql'
        },
        {
            when: function(response) {
                return databaseType !== 'no';
            },
            name: 'cloudfoundryDatabaseServicePlan',
            message: 'What is the name of your database plan?',
            default: 'turtle'
        }];

    this.prompt(prompts).then(function (props) {
        this.cloudfoundryDeployedName = _.kebabCase(props.cloudfoundryDeployedName).split('-').join('');
        this.cloudfoundryProfile = props.cloudfoundryProfile;
        this.cloudfoundryDatabaseServiceName = props.cloudfoundryDatabaseServiceName;
        this.cloudfoundryDatabaseServicePlan = props.cloudfoundryDatabaseServicePlan;

        if ((this.devDatabaseType === 'h2Disk' || this.devDatabaseType === 'h2Memory') && this.cloudfoundryProfile === 'dev') {
            this.log(chalk.yellow('\nH2 database will not work with development profile. Setting production profile.'));
            this.cloudfoundryProfile = 'prod';
        }
        done();
    }.bind(this));
}
