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
const fs = require('fs');
const exec = require('child_process').exec;
const chalk = require('chalk');
const _ = require('lodash');
const glob = require('glob');
const BaseGenerator = require('../generator-base');
const statistics = require('../statistics');

const constants = require('../generator-constants');

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        // This adds support for a `--from-cli` flag
        this.option('from-cli', {
            desc: 'Indicates the command is run from JHipster CLI',
            type: Boolean,
            defaults: false
        });
        this.option('skip-build', {
            desc: 'Skips building the app',
            type: Boolean,
            defaults: false
        });

        this.option('skip-deploy', {
            desc: 'Skips deployment to Heroku',
            type: Boolean,
            defaults: false
        });

        this.herokuSkipBuild = this.options['skip-build'];
        this.herokuSkipDeploy = this.options['skip-deploy'] || this.options['skip-build'];
        this.registerPrettierTransform();
    }

    initializing() {
        if (!this.options['from-cli']) {
            this.warning(
                `Deprecated: JHipster seems to be invoked using Yeoman command. Please use the JHipster CLI. Run ${chalk.red(
                    'jhipster <command>'
                )} instead of ${chalk.red('yo jhipster:<command>')}`
            );
        }

        this.log(chalk.bold('Heroku configuration is starting'));
        this.env.options.appPath = this.config.get('appPath') || constants.CLIENT_MAIN_SRC_DIR;
        this.baseName = this.config.get('baseName');
        this.packageName = this.config.get('packageName');
        this.packageFolder = this.config.get('packageFolder');
        this.cacheProvider = this.config.get('cacheProvider') || this.config.get('hibernateCache') || 'no';
        this.enableHibernateCache = this.config.get('enableHibernateCache') && !['no', 'memcached'].includes(this.cacheProvider);
        this.databaseType = this.config.get('databaseType');
        this.prodDatabaseType = this.config.get('prodDatabaseType');
        this.searchEngine = this.config.get('searchEngine');
        this.angularAppName = this.getAngularAppName();
        this.buildTool = this.config.get('buildTool');
        this.applicationType = this.config.get('applicationType');
        this.serviceDiscoveryType = this.config.get('serviceDiscoveryType');
        this.herokuAppName = this.config.get('herokuAppName');
        this.dynoSize = 'Free';
        this.herokuDeployType = this.config.get('herokuDeployType');
    }

    get prompting() {
        return {
            askForApp() {
                const done = this.async();

                if (this.herokuAppName) {
                    exec('heroku apps:info --json', (err, stdout) => {
                        if (err) {
                            this.config.set({
                                herokuAppName: null,
                                herokuDeployType: this.herokuDeployType
                            });
                            this.abort = true;
                            this.log.error(`Could not find app: ${chalk.cyan(this.herokuAppName)}`);
                            this.log.error('Run the generator again to create a new app.');
                        } else {
                            const json = JSON.parse(stdout);
                            this.herokuAppName = json.app.name;
                            if (json.dynos.length > 0) {
                                this.dynoSize = json.dynos[0].size;
                            }
                            this.log(`Deploying as existing app: ${chalk.bold(this.herokuAppName)}`);
                            this.herokuAppExists = true;
                            this.config.set({
                                herokuAppName: this.herokuAppName,
                                herokuDeployType: this.herokuDeployType
                            });
                        }
                        done();
                    });
                } else {
                    const prompts = [
                        {
                            type: 'input',
                            name: 'herokuAppName',
                            message: 'Name to deploy as:',
                            default: this.baseName
                        },
                        {
                            type: 'list',
                            name: 'herokuRegion',
                            message: 'On which region do you want to deploy ?',
                            choices: ['us', 'eu'],
                            default: 0
                        }
                    ];

                    this.prompt(prompts).then(props => {
                        this.herokuAppName = _.kebabCase(props.herokuAppName);
                        this.herokuRegion = props.herokuRegion;
                        this.herokuAppExists = false;
                        done();
                    });
                }
            },

            askForHerokuDeployType() {
                if (this.abort) return;
                if (this.herokuDeployType) return;
                const done = this.async();
                const prompts = [
                    {
                        type: 'list',
                        name: 'herokuDeployType',
                        message: 'Which type of deployment do you want ?',
                        choices: [
                            {
                                value: 'git',
                                name: 'Git (compile on Heroku)'
                            },
                            {
                                value: 'jar',
                                name: 'JAR (compile locally)'
                            }
                        ],
                        default: 0
                    }
                ];

                this.prompt(prompts).then(props => {
                    this.herokuDeployType = props.herokuDeployType;
                    done();
                });
            }
        };
    }

    get configuring() {
        return {
            checkInstallation() {
                if (this.abort) return;
                const done = this.async();

                exec('heroku --version', err => {
                    if (err) {
                        this.log.error("You don't have the Heroku CLI installed. Download it from https://cli.heroku.com/");
                        this.abort = true;
                    }
                    done();
                });
            },

            saveConfig() {
                this.config.set({
                    herokuAppName: this.herokuAppName,
                    herokuDeployType: this.herokuDeployType
                });
            }
        };
    }

    get default() {
        return {
            insight() {
                statistics.sendSubGenEvent('generator', 'heroku');
            },

            gitInit() {
                if (this.abort) return;
                const done = this.async();

                try {
                    fs.lstatSync('.git');
                    this.log(chalk.bold('\nUsing existing Git repository'));
                    done();
                } catch (e) {
                    // An exception is thrown if the folder doesn't exist
                    this.log(chalk.bold('\nInitializing Git repository'));
                    const child = exec('git init', (err, stdout, stderr) => {
                        done();
                    });
                    child.stdout.on('data', data => {
                        this.log(data.toString());
                    });
                }
            },

            installHerokuDeployPlugin() {
                if (this.abort) return;
                const done = this.async();
                const cliPlugin = 'heroku-cli-deploy';

                exec('heroku plugins', (err, stdout) => {
                    if (_.includes(stdout, cliPlugin)) {
                        this.log('\nHeroku CLI deployment plugin already installed');
                        done();
                    } else {
                        this.log(chalk.bold('\nInstalling Heroku CLI deployment plugin'));
                        const child = exec(`heroku plugins:install ${cliPlugin}`, (err, stdout) => {
                            if (err) {
                                this.abort = true;
                                this.log.error(err);
                            }

                            done();
                        });

                        child.stdout.on('data', data => {
                            this.log(data.toString());
                        });
                    }
                });
            },

            herokuCreate() {
                if (this.abort || this.herokuAppExists) return;
                const done = this.async();

                const regionParams = this.herokuRegion !== 'us' ? ` --region ${this.herokuRegion}` : '';

                this.log(chalk.bold('\nCreating Heroku application and setting up node environment'));
                const child = exec(`heroku create ${this.herokuAppName}${regionParams}`, (err, stdout, stderr) => {
                    if (err) {
                        if (stderr.includes('is already taken')) {
                            const prompts = [
                                {
                                    type: 'list',
                                    name: 'herokuForceName',
                                    message: `The Heroku app "${chalk.cyan(this.herokuAppName)}" already exists! Use it anyways?`,
                                    choices: [
                                        {
                                            value: 'Yes',
                                            name: 'Yes, I have access to it'
                                        },
                                        {
                                            value: 'No',
                                            name: 'No, generate a random name'
                                        }
                                    ],
                                    default: 0
                                }
                            ];

                            this.log('');
                            this.prompt(prompts).then(props => {
                                if (props.herokuForceName === 'Yes') {
                                    exec(`heroku git:remote --app ${this.herokuAppName}`, (err, stdout, stderr) => {
                                        if (err) {
                                            this.abort = true;
                                            this.log.error(err);
                                        } else {
                                            this.log(stdout.trim());
                                            this.config.set({
                                                herokuAppName: this.herokuAppName,
                                                herokuDeployType: this.herokuDeployType
                                            });
                                        }
                                        done();
                                    });
                                } else {
                                    exec(`heroku create ${regionParams}`, (err, stdout, stderr) => {
                                        if (err) {
                                            this.abort = true;
                                            this.log.error(err);
                                        } else {
                                            // Extract from "Created random-app-name-1234... done"
                                            this.herokuAppName = stdout.substring(
                                                stdout.indexOf('https://') + 8,
                                                stdout.indexOf('.herokuapp')
                                            );
                                            this.log(stdout.trim());

                                            // ensure that the git remote is the same as the appName
                                            exec(`heroku git:remote --app ${this.herokuAppName}`, (err, stdout, stderr) => {
                                                if (err) {
                                                    this.abort = true;
                                                    this.log.error(err);
                                                } else {
                                                    this.config.set({
                                                        herokuAppName: this.herokuAppName,
                                                        herokuDeployType: this.herokuDeployType
                                                    });
                                                }
                                                done();
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            this.abort = true;
                            this.log.error(err);
                            done();
                        }
                    } else {
                        done();
                    }
                });

                child.stdout.on('data', data => {
                    const output = data.toString();
                    if (data.search('Heroku credentials') >= 0) {
                        this.abort = true;
                        this.log.error("Error: Not authenticated. Run 'heroku login' to login to your heroku account and try again.");
                        done();
                    } else {
                        this.log(output.trim());
                    }
                });
            },

            herokuAddonsCreate() {
                if (this.abort) return;
                const done = this.async();

                const addonCreateCallback = (addon, err, stdout, stderr) => {
                    if (err) {
                        const verifyAccountUrl = 'https://heroku.com/verify';
                        if (_.includes(err, verifyAccountUrl)) {
                            this.abort = true;
                            this.log.error(`Account must be verified to use addons. Please go to: ${verifyAccountUrl}`);
                            this.log.error(err);
                        } else {
                            this.log(`No new ${addon} addon created`);
                        }
                    } else {
                        this.log(`Created ${addon} addon`);
                    }
                };

                this.log(chalk.bold('\nProvisioning addons'));
                if (this.searchEngine === 'elasticsearch') {
                    exec(
                        `heroku addons:create bonsai --as BONSAI --app ${this.herokuAppName}`,
                        addonCreateCallback.bind(this, 'Elasticsearch')
                    );
                }

                let dbAddOn = '';
                if (this.prodDatabaseType === 'postgresql') {
                    dbAddOn = 'heroku-postgresql --as DATABASE';
                } else if (this.prodDatabaseType === 'mysql') {
                    dbAddOn = 'jawsdb:kitefin --as DATABASE';
                } else if (this.prodDatabaseType === 'mariadb') {
                    dbAddOn = 'jawsdb-maria:kitefin --as DATABASE';
                } else if (this.prodDatabaseType === 'mongodb') {
                    dbAddOn = 'mongolab:sandbox --as MONGODB';
                } else {
                    done();
                    return;
                }

                exec(`heroku addons:create ${dbAddOn} --app ${this.herokuAppName}`, (err, stdout, stderr) => {
                    addonCreateCallback('Database', err, stdout, stderr);
                    done();
                });
            },

            configureJHipsterRegistry() {
                if (this.abort || this.herokuAppExists) return;
                const done = this.async();

                if (this.serviceDiscoveryType === 'eureka') {
                    const prompts = [
                        {
                            type: 'input',
                            name: 'herokuJHipsterRegistryApp',
                            message: 'What is the name of your JHipster Registry Heroku app?'
                        },
                        {
                            type: 'input',
                            name: 'herokuJHipsterRegistryUsername',
                            message: 'What is your JHipster Registry username?',
                            default: 'admin'
                        },
                        {
                            type: 'input',
                            name: 'herokuJHipsterRegistryPassword',
                            message: 'What is your JHipster Registry password?'
                        }
                    ];

                    this.log('');
                    this.prompt(prompts).then(props => {
                        // Encode username/password to avoid errors caused by spaces
                        props.herokuJHipsterRegistryUsername = encodeURIComponent(props.herokuJHipsterRegistryUsername);
                        props.herokuJHipsterRegistryPassword = encodeURIComponent(props.herokuJHipsterRegistryPassword);
                        const herokuJHipsterRegistry = `https://${props.herokuJHipsterRegistryUsername}:${
                            props.herokuJHipsterRegistryPassword
                        }@${props.herokuJHipsterRegistryApp}.herokuapp.com`;
                        const configSetCmd = `heroku config:set JHIPSTER_REGISTRY_URL=${herokuJHipsterRegistry} --app ${
                            this.herokuAppName
                        }`;
                        const child = exec(configSetCmd, (err, stdout, stderr) => {
                            if (err) {
                                this.abort = true;
                                this.log.error(err);
                            }
                            done();
                        });

                        child.stdout.on('data', data => {
                            this.log(data.toString());
                        });
                    });
                } else {
                    this.conflicter.resolve(err => {
                        done();
                    });
                }
            },

            copyHerokuFiles() {
                if (this.abort) return;

                const done = this.async();
                this.log(chalk.bold('\nCreating Heroku deployment files'));

                this.template('bootstrap-heroku.yml.ejs', `${constants.SERVER_MAIN_RES_DIR}/config/bootstrap-heroku.yml`);
                this.template('application-heroku.yml.ejs', `${constants.SERVER_MAIN_RES_DIR}/config/application-heroku.yml`);
                this.template('Procfile.ejs', 'Procfile');
                if (this.buildTool === 'gradle') {
                    this.template('heroku.gradle.ejs', 'gradle/heroku.gradle');
                }

                this.conflicter.resolve(err => {
                    done();
                });
            },

            addHerokuDependencies() {
                if (this.buildTool === 'maven') {
                    this.addMavenDependency('org.springframework.cloud', 'spring-cloud-localconfig-connector');
                    this.addMavenDependency('org.springframework.cloud', 'spring-cloud-heroku-connector');
                } else if (this.buildTool === 'gradle') {
                    this.addGradleDependency('compile', 'org.springframework.cloud', 'spring-cloud-localconfig-connector');
                    this.addGradleDependency('compile', 'org.springframework.cloud', 'spring-cloud-heroku-connector');
                }
            },

            addHerokuBuildPlugin() {
                if (this.buildTool !== 'gradle') return;
                this.addGradlePlugin('gradle.plugin.com.heroku.sdk', 'heroku-gradle', '1.0.4');
                this.applyFromGradleScript('gradle/heroku');
            },

            addHerokuMavenProfile() {
                if (this.buildTool === 'maven') {
                    this.render('pom-profile.xml.ejs', profile => {
                        this.addMavenProfile('heroku', `            ${profile.toString().trim()}`);
                    });
                }
            }
        };
    }

    get end() {
        return {
            productionBuild() {
                if (this.abort) return;

                if (this.herokuSkipBuild || this.herokuDeployType === 'git') {
                    this.log(chalk.bold('\nSkipping build'));
                    return;
                }

                const done = this.async();
                this.log(chalk.bold('\nBuilding application'));

                const child = this.buildApplication(this.buildTool, 'prod', false, err => {
                    if (err) {
                        this.abort = true;
                        this.log.error(err);
                    }
                    done();
                });

                this.buildCmd = child.buildCmd;

                child.stdout.on('data', data => {
                    process.stdout.write(data.toString());
                });
            },

            productionDeploy() {
                if (this.abort) return;

                if (this.herokuSkipDeploy) {
                    this.log(chalk.bold('\nSkipping deployment'));
                    return;
                }

                const done = this.async();
                if (this.herokuDeployType === 'git') {
                    const gitAddCmd = 'git add .';
                    this.log(chalk.bold('\nUpdating Git repository'));
                    this.log(chalk.cyan(gitAddCmd));
                    exec(gitAddCmd, (err, stdout, stderr) => {
                        if (err) {
                            this.abort = true;
                            this.log.error(err);
                        } else {
                            const line = stderr.toString().trimRight();
                            if (line.trim().length !== 0) this.log(line);
                            const gitCommitCmd = 'git commit -m "Deploy to Heroku" --allow-empty';
                            this.log(chalk.cyan(gitCommitCmd));
                            exec(gitCommitCmd, (err, stdout, stderr) => {
                                if (err) {
                                    this.abort = true;
                                    this.log.error(err);
                                } else {
                                    const line = stderr.toString().trimRight();
                                    if (line.trim().length !== 0) this.log(line);

                                    let buildpack = 'heroku/java';
                                    let configVars = 'MAVEN_CUSTOM_OPTS="-Pprod,heroku -DskipTests" ';
                                    if (this.buildTool === 'gradle') {
                                        buildpack = 'heroku/gradle';
                                        configVars = 'GRADLE_TASK="stage -Pprod" ';
                                    }
                                    this.log(chalk.bold('\nConfiguring Heroku'));
                                    exec(
                                        `heroku config:set NPM_CONFIG_PRODUCTION="false" ${configVars}--app ${this.herokuAppName}`,
                                        (err, stdout, stderr) => {
                                            if (err) {
                                                this.log(stderr);
                                            }
                                            exec(
                                                `heroku buildpacks:add -i 1 heroku/nodejs --app ${this.herokuAppName}`,
                                                (err, stdout, stderr) => {
                                                    if (err) {
                                                        const line = stderr.toString().trimRight();
                                                        if (line.trim().length !== 0 && line.indexOf('is already set') < 0) this.log(line);
                                                    }
                                                    exec(
                                                        `heroku buildpacks:add ${buildpack} --app ${this.herokuAppName}`,
                                                        (err, stdout, stderr) => {
                                                            if (err) {
                                                                const line = stderr.toString().trimRight();
                                                                if (line.trim().length !== 0 && line.indexOf('is already set') < 0)
                                                                    this.log(line);
                                                            }
                                                            this.log(chalk.bold('\nDeploying application'));
                                                            const child = exec(
                                                                'git push heroku HEAD:master',
                                                                { maxBuffer: 1024 * 10000 },
                                                                err => {
                                                                    if (err) {
                                                                        this.abort = true;
                                                                        this.log.error(err);
                                                                    } else {
                                                                        this.log(
                                                                            chalk.green(
                                                                                `\nYour app should now be live. To view it run\n\t${chalk.bold(
                                                                                    'heroku open'
                                                                                )}`
                                                                            )
                                                                        );
                                                                        this.log(
                                                                            chalk.yellow(
                                                                                `And you can view the logs with this command\n\t${chalk.bold(
                                                                                    'heroku logs --tail'
                                                                                )}`
                                                                            )
                                                                        );
                                                                        this.log(
                                                                            chalk.yellow(
                                                                                `After application modification, redeploy it with\n\t${chalk.bold(
                                                                                    'jhipster heroku'
                                                                                )}`
                                                                            )
                                                                        );
                                                                    }
                                                                    done();
                                                                }
                                                            );
                                                            child.stderr.on('data', data => {
                                                                const line = data.toString().trimRight();
                                                                if (line.trim().length !== 0) this.log(line);
                                                            });
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            });
                        }
                    });
                } else {
                    this.log(chalk.bold('\nDeploying application'));
                    let jarFileWildcard = 'target/*.jar';
                    if (this.buildTool === 'gradle') {
                        jarFileWildcard = 'build/libs/*.jar';
                    }

                    const files = glob.sync(jarFileWildcard, {});
                    const jarFile = files[0];
                    const herokuDeployCommand = `heroku deploy:jar ${jarFile} --app ${this.herokuAppName}`;

                    this.log(
                        chalk.bold(
                            `\nUploading your application code.\nThis may take ${chalk.cyan(
                                'several minutes'
                            )} depending on your connection speed...`
                        )
                    );
                    const child = exec(herokuDeployCommand, (err, stdout) => {
                        if (err) {
                            this.abort = true;
                            this.log.error(err);
                        }
                        this.log(chalk.green(`\nYour app should now be live. To view it run\n\t${chalk.bold('heroku open')}`));
                        this.log(chalk.yellow(`And you can view the logs with this command\n\t${chalk.bold('heroku logs --tail')}`));
                        this.log(chalk.yellow(`After application modification, redeploy it with\n\t${chalk.bold('jhipster heroku')}`));
                        done();
                    });

                    child.stdout.on('data', data => {
                        const line = data.toString().trimRight();
                        if (line.trim().length !== 0) this.log(line);
                    });
                }
            }
        };
    }
};
