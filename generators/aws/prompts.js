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
const _ = require('lodash');

module.exports = {
    prompting
};

function prompting() {
    if (this.existingProject) {
        return;
    }

    const done = this.async();

    const prompts = [
        {
            type: 'input',
            name: 'applicationName',
            message: 'Application name:',
            default: this.baseName
        },
        {
            type: 'input',
            name: 'environmentName',
            message: 'Environment name:',
            default: `${this.baseName}-env`
        },
        {
            type: 'input',
            name: 'bucketName',
            message: 'Name of S3 bucket:',
            default: this.baseName
        },
        {
            type: 'input',
            name: 'dbName',
            validate: input => {
                if (!/^[a-zA-Z][a-zA-Z0-9]*$/g.test(input)) {
                    return 'Your database name must begin with a letter and contain only alphanumeric characters';
                }
                return true;
            },
            message: 'Database name:',
            default: this.baseName
        },
        {
            type: 'input',
            name: 'dbUsername',
            message: 'Database username:',
            validate: input => {
                if (input === '') return 'Please provide a username';
                return true;
            }
        },
        {
            type: 'password',
            name: 'dbPassword',
            message: 'Database password:',
            validate: input => {
                if (input === '') return 'Please provide a password';
                if (input.length < 8) return 'Password must contain minimum 8 chars';
                return true;
            }
        },
        {
            type: 'list',
            name: 'instanceType',
            message: 'On which EC2 instance type do you want to deploy?',
            choices: [
                't2.micro',
                't2.small',
                't2.medium',
                't2.large',
                'm5.large',
                'm5.xlarge',
                'm5.2xlarge',
                'c5.large',
                'c5.xlarge',
                'c5.2xlarge',
                'c5.4xlarge',
                'c5.8xlarge',
                'i3.xlarge',
                'i3.2xlarge',
                'i3.4xlarge',
                'i3.8xlarge',
                'r5.large',
                'r5.xlarge',
                'r5.2xlarge'
            ],
            default: 0
        },
        {
            type: 'list',
            name: 'dbInstanceClass',
            message: 'On which RDS instance class do you want to deploy?',
            choices: [
                'db.m3.medium',
                'db.m3.large',
                'db.m3.xlarge',
                'db.m3.2xlarge',
                'db.r3.large',
                'db.r3.xlarge',
                'db.r3.2xlarge',
                'db.r3.4xlarge',
                'db.r3.8xlarge',
                'db.t2.micro',
                'db.t2.small',
                'db.t2.medium'
            ],
            default: 9
        },
        {
            type: 'list',
            name: 'awsRegion',
            message: 'On which region do you want to deploy?',
            choices: [
                'ap-northeast-1',
                'ap-northeast-2',
                'ap-south-1',
                'ap-southeast-1',
                'ap-southeast-2',
                'ca-central-1',
                'eu-central-1',
                'eu-north-1',
                'eu-west-1',
                'eu-west-2',
                'eu-west-3',
                'sa-east-1',
                'us-east-1',
                'us-east-2',
                'us-west-1',
                'us-west-2'
            ],
            default: 6
        }
    ];

    this.prompt(prompts).then(props => {
        this.applicationName = _.kebabCase(props.applicationName);
        this.environmentName = _.kebabCase(props.environmentName);
        this.bucketName = _.kebabCase(props.bucketName);
        this.instanceType = props.instanceType;
        this.awsRegion = props.awsRegion;
        this.dbName = props.dbName;
        this.dbUsername = props.dbUsername;
        this.dbPassword = props.dbPassword;
        this.dbInstanceClass = props.dbInstanceClass;

        done();
    });
}
