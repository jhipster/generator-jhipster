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
const chalk = require('chalk');
const databaseTypes = require('jhipster-core').JHipsterDatabaseTypes;

const BaseGenerator = require('../generator-base');
const docker = require('../docker-base');
const dockerCli = require('../docker-cli');
const dockerUtils = require('../docker-utils');
const dockerPrompts = require('../docker-prompts');
const constants = require('../generator-constants');
const awsConstants = require('./constants');

const prompts = require('./prompts');
const awsClient = require('./aws-client');

const AWS_SSM_ARTIFACT = 'aws-java-sdk-ssm';
const AWS_SSM_GROUP = 'com.amazonaws';
const SPRING_CLOUD_GROUP = 'org.springframework.cloud';
const SPRING_CLOUD_ARTIFACT = 'spring-cloud-context';

const BASE_TEMPLATE_PATH = 'base.template.yml';
const APP_TEMPLATE_PATH = baseName => `${baseName}.template.yml`;
const AWSSSM_CONFIG_PATH = (directory, packageFolder) =>
    `${directory}/${constants.SERVER_MAIN_SRC_DIR}/${packageFolder}/bootstrap/AwsSSMConfiguration.java`;
const SPRING_FACTORIES_PATH = directory => `${directory}/${constants.SERVER_MAIN_RES_DIR}/META-INF/spring.factories`;
const BOOTSTRAP_PATH = directory => `${directory}/${constants.SERVER_MAIN_RES_DIR}/config/bootstrap-aws.yml`;

const BASE_TEMPLATE_FILENAME = `${BASE_TEMPLATE_PATH}.ejs`;
const APP_TEMPLATE_FILENAME = 'application.template.yml.ejs';

const AWSSSM_CONFIG_FILENAME = 'AwsSSMConfiguration.java.ejs';
const SPRING_FACTORIES_FILENAME = 'spring.factories.ejs';
const BOOTSTRAP_FILENAME = 'bootstrap-aws.yml.ejs';

/**
 * Returns the password property to be stored within Amazon SSM
 * @param stacKName Name of the root stack
 * @param applicationName Name of the application property
 * @returns {string}
 *  Full property path
 */
const ssmPasswordProperty = (stacKName, applicationName) => `/${stacKName}/${applicationName}/spring.datasource.password`;

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

        this.configOptions = this.options.configOptions || {};
        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });
        // This adds support for a `--skip-build` flag
        this.option('skip-build', {
            desc: 'Disables the project build step',
            type: Boolean,
            defaults: false
        });

        // This adds support for a `--skip-upload` flag
        this.option('skip-upload', {
            desc: 'Skips the Docker Image Tag + Upload process',
            type: Boolean,
            defaults: false
        });
    }

    get initializing() {
        return {
            validateFromCli() {
                this.checkInvocationFromCLI();
            },
            bonjour() {
                this.log(chalk.bold('This AWS generator will help you deploy your JHipster app as a Docker container on AWS.'));
            },
            option() {
                this.deployNow = this.options['skip-install'];
                this.skipUpload = this.options['skip-upload'];
                this.skipBuild = this.options['skip-build'];
            },
            getConfig() {
                this.aws = {
                    apps: [],
                    vpc: {},
                    dockerLogin: {
                        accountId: null,
                        password: null
                    },
                    ...this.config.get('aws')
                };

                this.defaultAppsFolders = this.aws.apps.map(a => a.baseName);
            },
            checkDocker: docker.checkDocker,
            loadAWS() {
                if (this.abort) return;
                const done = this.async();
                awsClient
                    .loadAWS(this)
                    .then(() => done())
                    .catch(() => done('Error while loading the AWS library'));
            },
            checkAwsCredentials() {
                if (this.abort) return;
                const done = this.async();
                let profile = process.env.AWS_PROFILE;
                if (!profile) {
                    profile = 'default';
                }
                awsClient
                    .saveCredentialsInAWS(profile)
                    .then(() => {
                        this.log.ok(`AWS credentials using profile ${chalk.bold(profile)}.`);
                        done();
                    })
                    .catch(() => {
                        this.log.error(chalk.red(`No AWS credentials found for profile ${chalk.bold(profile)}`));
                        this.abort = true;
                        done();
                    });
            },
            initAwsStuff() {
                awsClient.initAwsStuff();
            },
            setOutputs() {
                dockerCli.setOutputs(data => this.log(chalk.white(data.toString().trim())), data => this.log.error(data.toString().trim()));

                awsClient.CF().setOutputs(message => this.log(message), message => this.log.error(message));
            },
            fetchRegion() {
                if (this.abort) return;
                const done = this.async();
                this.awsFacts = {
                    apps: [],
                    defaultRegion: awsClient.DEFAULT_REGION,
                    database_Password_InSSM: false
                };
                awsClient
                    .listRegions()
                    .then(regions => {
                        const regionsLabel = _.map(regions, r => r.RegionName);
                        prompts.setRegionList(regionsLabel);
                        done();
                    })
                    .catch(err => {
                        this.log.error(err);
                        this.abort = true;
                        done();
                    });
            }
        };
    }

    get prompting() {
        return {
            bonjour() {
                if (this.abort) return;
                this.log(chalk.bold('❓ AWS prompting'));
            },
            askTypeOfApplication: prompts.askTypeOfApplication,
            askDirectoryPath: dockerPrompts.askForPath,
            askForApps: dockerPrompts.askForApps,
            getAppConfig: dockerPrompts.loadConfigs,
            askRegion: prompts.askRegion,
            initAwsAndLoadVPCs() {
                awsClient.initAwsStuff(this.aws.region);
                return awsClient.listVpcs().then(listOfVpcs => {
                    this.awsFacts.availableVpcs = listOfVpcs;
                });
            },
            askVPC: prompts.askVPC,
            initSubnets() {
                const done = this.async;
                return awsClient
                    .listSubnets(this.aws.vpc.id)
                    .then(subnets => {
                        this.awsFacts.availableSubnets = subnets;
                        done();
                    })
                    .catch(() => {
                        this.log.error('Unable to fetch the subnets');
                        done();
                    });
            },
            askForSubnets: prompts.askForSubnets,
            askCloudFormation: prompts.askCloudFormation,
            askPerformances: prompts.askPerformances,
            askScaling: prompts.askScaling,
            retrievePassword() {
                const done = this.async;
                // Attempts to retrieve a previously set database password from SSM.
                const promises = this.aws.apps.map(app =>
                    awsClient
                        .SSM()
                        .getSSMParameter(ssmPasswordProperty(this.aws.cloudFormationName, app.baseName))
                        .then(password => {
                            if (password) {
                                let fact = this.awsFacts.apps.find(a => a.baseName === app.baseName);
                                if (_.isUndefined(fact)) {
                                    fact = {
                                        baseName: app.baseName
                                    };
                                    this.awsFacts.apps.push(fact);
                                }

                                fact.database_Password = password;
                                fact.database_Password_InSSM = true;
                            }
                        })
                        .catch(() => {
                            this.log.error('Unable to fetch the SSM Parameters');
                        })
                );

                return Promise.all(promises)
                    .then(() => done())
                    .catch(() => {
                        this.abort = true;
                        done();
                    });
            },
            askForDBPassword: prompts.askForDBPasswords,
            askDeployNow: prompts.askDeployNow
        };
    }

    get configuring() {
        return {
            bonjour() {
                if (this.abort) return;
                this.log(chalk.bold('🔧🛠️ AWS configuring'));
            },
            purgeAwsApps() {
                this.aws.apps = this.aws.apps.filter(app => this.appConfigs.find(conf => conf.baseName === app.baseName));
            },
            getDockerLogin() {
                if (this.abort) return null;
                const done = this.async;
                return awsClient
                    .getDockerLogin()
                    .then(token => {
                        this.log.ok('ECR Auth token has been retrieved.');
                        this.aws.dockerLogin = token;
                        done();
                    })
                    .catch(error => {
                        this.log.error(error);
                        this.abort = true;
                        done();
                    });
            },
            setBucketName() {
                this.aws.s3BucketName =
                    this.aws.s3BucketName || awsClient.sanitizeBucketName(`${this.aws.cloudFormationName}_${new Date().getTime()}`);
            }
        };
    }

    get default() {
        return {
            bonjour() {
                if (this.abort) return;
                this.log(chalk.bold('AWS default'));
            },
            updateBaseName() {
                this.appConfigs.forEach(config => {
                    config.awsBaseName = config.baseName.toLowerCase().replace(/[^a-z^\d]/, '');
                });
            },
            showAwsCacheWarning() {
                this.appConfigs.forEach(config => {
                    if (config.cacheProvider !== 'no') {
                        this.log(
                            chalk.yellow(
                                `Warning ${
                                    config.baseName
                                } is using a cache provider, scaling will not be available. Refer to an AWS native scaling service.`
                            )
                        );
                    }
                });
            },
            addAWSSpringDependencies() {
                this.appConfigs.forEach(config => {
                    const directory = `${this.directoryPath}${config.appFolder}`;
                    if (config.buildTool === 'maven') {
                        this.addMavenDependencyInDirectory(directory, AWS_SSM_GROUP, AWS_SSM_ARTIFACT);
                        this.addMavenDependencyInDirectory(directory, SPRING_CLOUD_GROUP, SPRING_CLOUD_ARTIFACT);
                    } else if (config.buildTool === 'gradle') {
                        this.addGradleDependencyInDirectory(directory, 'compile', AWS_SSM_GROUP, AWS_SSM_ARTIFACT);
                        this.addGradleDependencyInDirectory(directory, 'compile', SPRING_CLOUD_GROUP, SPRING_CLOUD_ARTIFACT);
                    }
                });
            },
            setAuroraParameters() {
                if (this.abort) return;
                this.appConfigs.forEach(appConfig => {
                    const app = this.aws.apps.find(a => a.baseName === appConfig.baseName);
                    const postgresqlType = databaseTypes.POSTGRESQL;
                    app.dbType = appConfig.prodDatabaseType;

                    app.auroraEngine = appConfig.prodDatabaseType === postgresqlType ? 'aurora-postgresql' : 'aurora-mysql';
                    app.auroraFamily = appConfig.prodDatabaseType === postgresqlType ? 'aurora-postgresql9.6' : 'aurora-mysql5.7';
                    app.auroraClusterParameterGroupName =
                        appConfig.prodDatabaseType === postgresqlType ? 'default.aurora-postgresql9.6' : 'default.aurora-mysql5.7';
                    app.auroraDbParam =
                        appConfig.prodDatabaseType === postgresqlType ? 'check_function_bodies: 0' : 'sql_mode: IGNORE_SPACE';
                });
            },
            springProjectChanges() {
                if (this.abort) return;
                const done = this.async();

                this.appConfigs.forEach(config => {
                    const directory = `${this.directoryPath}${config.appFolder}`;
                    this.temp = {
                        baseName: config.baseName,
                        packageName: config.packageName
                    };
                    this.template(AWSSSM_CONFIG_FILENAME, AWSSSM_CONFIG_PATH(directory, config.packageFolder));
                    this.template(SPRING_FACTORIES_FILENAME, SPRING_FACTORIES_PATH(directory));
                    this.template(BOOTSTRAP_FILENAME, BOOTSTRAP_PATH(directory));
                });

                this.conflicter.resolve(() => {
                    delete this.temp;
                    done();
                });
            },
            generateCloudFormationTemplate() {
                if (this.abort) return;
                const done = this.async();

                this.template(BASE_TEMPLATE_FILENAME, BASE_TEMPLATE_PATH);
                this.aws.apps.forEach(config =>
                    this.template(APP_TEMPLATE_FILENAME, APP_TEMPLATE_PATH(config.baseName), null, {}, { aws: this.aws, app: config })
                );
                this.conflicter.resolve(() => {
                    done();
                });
            }
        };
    }

    _uploadTemplateToAWS(filename, path) {
        if (this.abort) return null;
        const done = this.async;

        return awsClient
            .uploadTemplate(this.aws.s3BucketName, filename, path)
            .then(result => {
                this.log.ok(
                    `${chalk.bold(filename)} has been updated to the S3 Bucket and can be found here: ${chalk.underline(result.Location)}`
                );
                done();
                return result;
            })
            .catch(error => {
                this.log.error(error.message);
                this.abort = true;
                done();
            });
    }

    get end() {
        return {
            checkAndBuildImages() {
                if (this.abort || !this.deployNow || this.skipBuild) return null;
                const done = this.async();
                const cwd = process.cwd();
                const promises = this.appConfigs.map(config =>
                    dockerUtils.checkAndBuildImages.call(this, {
                        cwd: `${this.directoryPath}${config.appFolder}/`,
                        appConfig: { buildTool: config.buildTool }
                    })
                );

                return Promise.all(promises)
                    .then(() => {
                        process.chdir(cwd);
                        done();
                    })
                    .catch(() => {
                        this.abort = true;
                        done();
                    });
            },
            createS3Bucket() {
                if (this.abort || !this.deployNow) return null;
                const done = this.async;
                return awsClient
                    .createS3Bucket(this.aws.s3BucketName, this.aws.region)
                    .then(result => {
                        this.aws.s3bucketLocation = result.Location;
                        this.log.ok(`The S3 Bucket ${chalk.bold(this.aws.s3BucketName)} has been created.`);
                        done();
                    })
                    .catch(error => {
                        this.log.error(`Could not create the S3 bucket : ${error.message}`);
                        this.abort = true;
                        done();
                    });
            },
            uploadBaseTemplate() {
                if (this.abort || !this.deployNow) return null;
                const done = this.async;
                return this._uploadTemplateToAWS('base.template.yml', BASE_TEMPLATE_PATH).then(result => {
                    this.aws.s3BaseTemplate = result;
                    done();
                });
            },
            uploadAppTemplate() {
                if (this.abort || !this.deployNow) return null;
                const done = this.async;
                const promises = this.aws.apps.map(config =>
                    this._uploadTemplateToAWS(APP_TEMPLATE_PATH(config.baseName), APP_TEMPLATE_PATH(config.baseName))
                );

                return Promise.all(promises)
                    .then(() => done())
                    .catch(e => {
                        this.abort = true;
                        done();
                    });
            },
            createOrUpdateStack() {
                if (this.abort || !this.deployNow) return null;
                const done = this.async;

                return awsClient
                    .CF()
                    .getStack(this.aws.cloudFormationName)
                    .then(() => {
                        const promises = this.aws.apps.map(app =>
                            awsClient
                                .CF()
                                .getStack(app.stackId)
                                .then(() => {
                                    this.log.ok(`Existing CloudFormation Stack for app ${chalk.bold(app.baseName)} Found ☁️`);
                                })
                                .catch(() => {
                                    this.log.error(`Issue retrieving nested stack for app ${chalk.bold(app.baseName)} doesn't exist`);
                                })
                        );

                        return Promise.all(promises)
                            .then(() => done())
                            .catch(() => {
                                this.abort = true;
                                done();
                            });
                    })
                    .catch(() => {
                        this.log.ok('Initialising CloudFormation Stack ☁️ (this can take up to 15 minutes depending on load)');
                        const databasePasswords = this.awsFacts.apps.map(a =>
                            awsClient.CF().cfParameter(`${a.baseName}DBPassword`, a.database_Password)
                        );
                        return awsClient
                            .CF()
                            .createCloudFormationStack(this.aws.cloudFormationName, this.aws.s3BaseTemplate.Location, databasePasswords)
                            .then(result => {
                                this.log.ok(`The CloudFormation Stack ${chalk.bold(result.StackId)} has been created.`);
                                this.aws.apps.forEach(app => {
                                    const stack = result.nestedStacks.find(stack => stack.appName.includes(app.baseName));
                                    app.stackId = stack.stackId;
                                });
                                done();
                            })
                            .catch(error => {
                                this.log.error(`There was an error creating the stack: ${error.message}`);
                                this.abort = true;
                                done();
                            });
                    });
            },
            getElasticContainerRepositoryName() {
                if (this.abort || !this.deployNow) return null;
                const done = this.async;

                const promises = this.aws.apps.map(app =>
                    awsClient
                        .CF()
                        .getEcrId(app.stackId)
                        .then(result => {
                            app.EcrRepositoryName = result;
                            this.log.ok(`ECR Repository ID for app ${chalk.bold(app.baseName)} was found: ${result}`);
                        })
                        .catch(error => {
                            this.log.error(`Couldn't get ECR Repository Id for app ${chalk.bold(app.baseName)}: ${error.message}`);
                            this.abort = true;
                        })
                );

                return Promise.all(promises).then(() => done());
            },
            setSSMDatabasePassword() {
                if (this.abort || !this.deployNow) return null;
                const done = this.async;

                const promises = this.aws.apps.map(app => {
                    const fact = this.awsFacts.apps.find(fact => fact.baseName === app.baseName);

                    if (fact.database_Password_InSSM) {
                        return null;
                    }
                    const passwordProperty = ssmPasswordProperty(this.aws.cloudFormationName, app.baseName);
                    return awsClient
                        .SSM()
                        .setSSMParameter(passwordProperty, fact.database_Password, `Database master password for ${app.baseName}`)
                        .then(() => {
                            this.log.ok(`Password has been set in ASM Parameter: ${passwordProperty}`);
                        })
                        .catch(err => {
                            this.log.error(`Issue setting SSM property. Error: ${err.message}`);
                        });
                });

                return Promise.all(promises)
                    .then(() => done())
                    .catch(() => {
                        this.abort = true;
                        done();
                    });
            },
            getEcrRepositoryURI() {
                if (this.abort || !this.deployNow) return null;
                const done = this.async;

                const promises = this.aws.apps.map(app =>
                    awsClient
                        .ECR()
                        .getEcrRepositoryURI(app.EcrRepositoryName)
                        .then(uri => {
                            app.EcrRepositoryUri = uri;
                            this.log.ok(`ECR Repository URI for ${app.baseName} was found: ${uri}`);
                        })
                        .catch(error => {
                            this.log.error(`Couldn't get ECR URI for ${app.baseName} : ${error.message}`);
                            this.abort = true;
                        })
                );

                return Promise.all(promises)
                    .then(() => done())
                    .catch(e => {
                        this.abort = true;
                        done();
                    });
            },
            tagDockerImage() {
                if (this.abort || !this.deployNow || this.skipUpload) return null;
                const done = this.async;

                const promises = this.aws.apps.map(app => {
                    const from = `${app.baseName}:latest`;
                    const to = `${app.EcrRepositoryUri}:latest`;
                    return dockerCli
                        .tagImage(from, to)
                        .then(() => {
                            app.dockerImageTag = to;
                            this.log.ok(`The Docker image was tagged: ${chalk.bold(to)}`);
                        })
                        .catch(error => {
                            this.log.error(error);
                            this.log.error(`There was an error tagging the Docker image: ${error.message}`);
                        });
                });

                return Promise.all(promises)
                    .then(() => done())
                    .catch(e => {
                        this.abort = true;
                        done();
                    });
            },
            loginToAws() {
                if (this.abort || !this.deployNow || this.skipUpload) return null;
                const done = this.async;
                return dockerCli
                    .loginToAws(
                        this.aws.region,
                        this.aws.dockerLogin.accountId,
                        this.aws.dockerLogin.username,
                        this.aws.dockerLogin.password
                    )
                    .then(() => {
                        this.log.ok(`Docker is now connected to your account in the region ${this.aws.region}.`);
                        done();
                    })
                    .catch(() => {
                        this.log.error("Couldn't connect to AWS with Docker");
                        this.abort = true;
                        done();
                    });
            },
            pushDockerImage() {
                if (this.abort || !this.deployNow || this.skipUpload) return null;
                const done = this.async;

                const promises = this.aws.apps.map(app => {
                    const repository = `${app.EcrRepositoryUri}:latest`;
                    return dockerCli
                        .pushImage(repository)
                        .then(ok => {
                            this.log.ok(`Image is now pushed to repository ${repository}.`);
                        })
                        .catch(err => {
                            this.log.error("Couldn't push image to AWS ECR Repository");
                        });
                });

                return Promise.all(promises)
                    .then(() => done())
                    .catch(() => {
                        this.abort = true;
                        done();
                    });
            },
            updateStack() {
                if (this.abort || !this.deployNow) return null;
                const done = this.async;
                const databasePasswords = this.awsFacts.apps.map(a =>
                    awsClient.CF().cfParameter(`${a.baseName}DBPassword`, a.database_Password)
                );
                const nestedStackIds = this.aws.apps.map(app => app.stackId);
                this.log.ok('Updating Existing CloudFormation Stack ☁️');
                return awsClient
                    .CF()
                    .updateCloudFormationStack(
                        this.aws.cloudFormationName,
                        nestedStackIds,
                        this.aws.s3BaseTemplate.Location,
                        databasePasswords,
                        'true'
                    )
                    .then(result => {
                        this.log(`The CloudFormation Stack ${chalk.bold(this.aws.cloudFormationName)} has been updated`);
                        if (_.has(result, 'Stacks[0].Outputs')) {
                            this.log.ok('Applications Accessible at Load Balancers:');
                            _(result)
                                .get('Stacks[0].Outputs')
                                .filter(output => output.OutputKey.startsWith('LoadBalancerOutput'))
                                .forEach(output => this.log(`\thttp://${output.OutputValue}`));
                        }

                        done();
                    })
                    .catch(error => {
                        this.log.error(`There was an error updating the stack: ${error.message}`);
                        this.abort = true;
                        done();
                    });
            },
            saveConf() {
                delete this.aws.dockerLogin;
                this.config.set(awsConstants.conf.aws, this.aws);
            }
        };
    }
};
