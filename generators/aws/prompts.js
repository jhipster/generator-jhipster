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
            message: 'Database name:',
            default: this.baseName
        },
        {
            type: 'input',
            name: 'dbUsername',
            message: 'Database username:',
            validate: (input) => {
                if (input === '') return 'Please provide a username';
                return true;
            }
        },
        {
            type: 'password',
            name: 'dbPassword',
            message: 'Database password:',
            validate: (input) => {
                if (input === '') return 'Please provide a password';
                else if (input.length < 8) return 'Password must contain minimum 8 chars';
                return true;
            }
        },
        {
            type: 'list',
            name: 'instanceType',
            message: 'On which EC2 instance type do you want to deploy?',
            choices: ['t2.micro', 't2.small', 't2.medium', 'm3.large', 'm3.xlarge', 'm3.2xlarge', 'c3.large', 'c3.xlarge',
                'c3.2xlarge', 'c3.4xlarge', 'c3.8xlarge', 'hs1.8xlarge', 'i2.xlarge', 'i2.2xlarge', 'i2.4xlarge',
                'i2.8xlarge', 'r3.large', 'r3.xlarge', 'r3.2xlarge'],
            default: 0
        },
        {
            type: 'list',
            name: 'dbInstanceClass',
            message: 'On which RDS instance class do you want to deploy?',
            choices: ['db.t1.micro', 'db.m1.small', 'db.m1.medium', 'db.m1.large', 'db.m1.xlarge', 'db.m2.xlarge ',
                'db.m2.2xlarge', 'db.m2.4xlarge', 'db.m3.medium', 'db.m3.large', 'db.m3.xlarge', 'db.m3.2xlarge',
                'db.r3.large', 'db.r3.xlarge', 'db.r3.2xlarge', 'db.r3.4xlarge', 'db.r3.8xlarge', 'db.t2.micro',
                'db.t2.small', 'db.t2.medium'],
            default: 17
        },
        {
            type: 'list',
            name: 'awsRegion',
            message: 'On which region do you want to deploy?',
            choices: ['ap-northeast-1', 'ap-southeast-1', 'ap-southeast-2', 'eu-central-1', 'eu-west-1', 'sa-east-1',
                'us-east-1', 'us-west-1', 'us-west-2'],
            default: 3
        }];

    this.prompt(prompts).then((props) => {
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
