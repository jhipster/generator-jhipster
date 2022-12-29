/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* eslint-disable consistent-return */
import crypto from 'crypto';
import _ from 'lodash';
import fs from 'fs';
import ChildProcess from 'child_process';
import util from 'util';
import chalk from 'chalk';
import glob from 'glob';

import BaseGenerator from '../base/index.mjs';

import statistics from '../statistics.cjs';
import { CLIENT_MAIN_SRC_DIR, JAVA_COMPATIBLE_VERSIONS, JAVA_VERSION, SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';
import { GENERATOR_HEROKU } from '../generator-list.mjs';
import {
  authenticationTypes,
  buildToolTypes,
  cacheTypes,
  databaseTypes,
  searchEngineTypes,
  serviceDiscoveryTypes,
} from '../../jdl/jhipster/index.mjs';
import { mavenProfileContent } from './templates.mjs';

const cacheProviderOptions = cacheTypes;
const { MEMCACHED, REDIS } = cacheTypes;
const { OAUTH2 } = authenticationTypes;
const { GRADLE, MAVEN } = buildToolTypes;
const { ELASTICSEARCH } = searchEngineTypes;
const { MARIADB, MYSQL, POSTGRESQL } = databaseTypes;
const { EUREKA } = serviceDiscoveryTypes;

const NO_CACHE_PROVIDER = cacheProviderOptions.NO;
const execCmd = util.promisify(ChildProcess.exec);

export default class HerokuGenerator extends BaseGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.option('skip-build', {
      desc: 'Skips building the application',
      type: Boolean,
      defaults: false,
    });

    this.option('skip-deploy', {
      desc: 'Skips deployment to Heroku',
      type: Boolean,
      defaults: false,
    });

    if (this.options.help) {
      return;
    }

    this.randomPassword = crypto.randomBytes(20).toString('hex');
    this.herokuSkipBuild = this.options.skipBuild;
    this.herokuSkipDeploy = this.options.skipDeploy || this.options.skipBuild;
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_HEROKU);
    }
  }

  get initializing() {
    return {
      loadCommonConfig() {
        this.loadAppConfig();
        this.loadServerConfig();
        this.loadTranslationConfig();
        this.loadPlatformConfig();

        this.loadDerivedAppConfig();
        this.loadDerivedServerConfig();
      },

      initializing() {
        this.log(chalk.bold('Heroku configuration is starting'));
        const configuration = this.config;
        this.env.options.appPath = configuration.get('appPath') || CLIENT_MAIN_SRC_DIR;
        this.cacheProvider = this.cacheProvider || NO_CACHE_PROVIDER;
        this.enableHibernateCache = this.enableHibernateCache && ![NO_CACHE_PROVIDER, MEMCACHED].includes(this.cacheProvider);
        this.frontendAppName = this.getFrontendAppName();
        this.herokuAppName = configuration.get('herokuAppName');
        this.dynoSize = 'Free';
        this.herokuDeployType = configuration.get('herokuDeployType');
        this.herokuJavaVersion = configuration.get('herokuJavaVersion');
        this.useOkta = configuration.get('useOkta');
        this.oktaAdminLogin = configuration.get('oktaAdminLogin');
        this.oktaAdminPassword = configuration.get('oktaAdminPassword');
      },
    };
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return {
      askForApp() {
        const done = this.async();

        if (this.herokuAppName) {
          ChildProcess.exec(`heroku apps:info --json ${this.herokuAppName}`, (err, stdout) => {
            if (err) {
              this.abort = true;
              this.log.error(`Could not find application: ${chalk.cyan(this.herokuAppName)}`);
              this.log.error('Run the generator again to create a new application.');
              this.herokuAppName = null;
            } else {
              const json = JSON.parse(stdout);
              this.herokuAppName = json.app.name;
              if (json.dynos.length > 0) {
                this.dynoSize = json.dynos[0].size;
              }
              this.log(`Deploying as existing application: ${chalk.bold(this.herokuAppName)}`);
              this.herokuAppExists = true;
              this.config.set({
                herokuAppName: this.herokuAppName,
                herokuDeployType: this.herokuDeployType,
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
              default: this.baseName,
            },
            {
              type: 'list',
              name: 'herokuRegion',
              message: 'On which region do you want to deploy ?',
              choices: ['us', 'eu'],
              default: 0,
            },
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
        if (this.abort) return null;
        if (this.herokuDeployType) return null;
        const prompts = [
          {
            type: 'list',
            name: 'herokuDeployType',
            message: 'Which type of deployment do you want ?',
            choices: [
              {
                value: 'git',
                name: 'Git (compile on Heroku)',
              },
              {
                value: 'jar',
                name: 'JAR (compile locally)',
              },
            ],
            default: 0,
          },
        ];

        return this.prompt(prompts).then(props => {
          this.herokuDeployType = props.herokuDeployType;
        });
      },

      askForHerokuJavaVersion() {
        if (this.abort) return null;
        if (this.herokuJavaVersion) return null;
        const prompts = [
          {
            type: 'list',
            name: 'herokuJavaVersion',
            message: 'Which Java version would you like to use to build and run your app ?',
            choices: JAVA_COMPATIBLE_VERSIONS.map(version => ({ value: version })),
            default: JAVA_VERSION,
          },
        ];

        return this.prompt(prompts).then(props => {
          this.herokuJavaVersion = props.herokuJavaVersion;
        });
      },
      askForOkta() {
        if (this.abort) return null;
        if (this.authenticationType !== OAUTH2) return null;
        if (this.useOkta) return null;
        const prompts = [
          {
            type: 'list',
            name: 'useOkta',
            message:
              'You are using OAuth 2.0. Do you want to use Okta? When you choose Okta, the automated configuration of users and groups requires cURL and jq.',
            choices: [
              {
                value: true,
                name: 'Yes, provision the Okta add-on',
              },
              {
                value: false,
                name: 'No, I want to configure my identity provider manually',
              },
            ],
            default: 1,
          },
          {
            when: answers => answers.useOkta,
            type: 'input',
            name: 'oktaAdminLogin',
            message: 'Login (valid email) for the JHipster Admin user:',
            validate: input => {
              if (!input) {
                return 'You must enter a login for the JHipster admin';
              }
              return true;
            },
          },
        ];

        return this.prompt(prompts).then(props => {
          this.useOkta = props.useOkta;
          if (this.useOkta) {
            this.oktaAdminLogin = props.oktaAdminLogin;
            this.oktaAdminPassword = this.randomPassword;
          }
        });
      },
    };
  }

  get [BaseGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return {
      checkInstallation() {
        if (this.abort) return;
        const done = this.async();

        ChildProcess.exec('heroku --version', err => {
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
          herokuDeployType: this.herokuDeployType,
          herokuJavaVersion: this.herokuJavaVersion,
          useOkta: this.useOkta,
          oktaAdminLogin: this.oktaAdminLogin,
        });
      },
    };
  }

  get [BaseGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get default() {
    return {
      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_HEROKU);
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
          const child = ChildProcess.exec('git init', (err, stdout, stderr) => {
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

        ChildProcess.exec('heroku plugins', (err, stdout) => {
          if (_.includes(stdout, cliPlugin)) {
            this.log('\nHeroku CLI deployment plugin already installed');
            done();
          } else {
            this.log(chalk.bold('\nInstalling Heroku CLI deployment plugin'));
            const child = ChildProcess.exec(`heroku plugins:install ${cliPlugin}`, (err, stdout) => {
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
        const child = ChildProcess.exec(`heroku create ${this.herokuAppName}${regionParams}`, { timeout: 6000 }, (err, stdout, stderr) => {
          if (err) {
            if (stderr.includes('is already taken')) {
              const prompts = [
                {
                  type: 'list',
                  name: 'herokuForceName',
                  message: `The Heroku application "${chalk.cyan(this.herokuAppName)}" already exists! Use it anyways?`,
                  choices: [
                    {
                      value: 'Yes',
                      name: 'Yes, I have access to it',
                    },
                    {
                      value: 'No',
                      name: 'No, generate a random name',
                    },
                  ],
                  default: 0,
                },
              ];

              this.log('');
              this.prompt(prompts).then(props => {
                if (props.herokuForceName === 'Yes') {
                  ChildProcess.exec(`heroku git:remote --app ${this.herokuAppName}`, (err, stdout, stderr) => {
                    if (err) {
                      this.abort = true;
                      this.log.error(err);
                    } else {
                      this.log(stdout.trim());
                      this.config.set({
                        herokuAppName: this.herokuAppName,
                        herokuDeployType: this.herokuDeployType,
                      });
                    }
                    done();
                  });
                } else {
                  ChildProcess.exec(`heroku create ${regionParams}`, (err, stdout, stderr) => {
                    if (err) {
                      this.abort = true;
                      this.log.error(err);
                    } else {
                      // Extract from "Created random-app-name-1234... done"
                      this.herokuAppName = stdout.substring(stdout.indexOf('https://') + 8, stdout.indexOf('.herokuapp'));
                      this.log(stdout.trim());

                      // ensure that the git remote is the same as the appName
                      ChildProcess.exec(`heroku git:remote --app ${this.herokuAppName}`, (err, stdout, stderr) => {
                        if (err) {
                          this.abort = true;
                          this.log.error(err);
                        } else {
                          this.config.set({
                            herokuAppName: this.herokuAppName,
                            herokuDeployType: this.herokuDeployType,
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
              if (stderr.includes('Invalid credentials')) {
                this.log.error("Error: Not authenticated. Run 'heroku login' to login to your heroku account and try again.");
              } else {
                this.log.error(err);
              }
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
        if (this.searchEngine === ELASTICSEARCH) {
          this.log(chalk.bold('\nProvisioning bonsai elasticsearch addon'));
          ChildProcess.exec(`heroku addons:create bonsai:sandbox-6 --as BONSAI --app ${this.herokuAppName}`, (err, stdout, stderr) => {
            addonCreateCallback.bind('Elasticsearch', err, stdout, stderr);
          });
        }

        if (this.useOkta) {
          this.log(chalk.bold('\nProvisioning okta addon'));
          ChildProcess.exec(`heroku addons:create okta --app ${this.herokuAppName}`, (err, stdout, stderr) => {
            addonCreateCallback('Okta', err, stdout, stderr);
          });
        }

        let dbAddOn;
        if (this.prodDatabaseType === POSTGRESQL) {
          dbAddOn = 'heroku-postgresql --as DATABASE';
        } else if (this.prodDatabaseType === MYSQL) {
          dbAddOn = 'jawsdb:kitefin --as DATABASE';
        } else if (this.prodDatabaseType === MARIADB) {
          dbAddOn = 'jawsdb-maria:kitefin --as DATABASE';
        }

        if (dbAddOn) {
          this.log(chalk.bold(`\nProvisioning database addon ${dbAddOn}`));
          ChildProcess.exec(`heroku addons:create ${dbAddOn} --app ${this.herokuAppName}`, (err, stdout, stderr) => {
            addonCreateCallback('Database', err, stdout, stderr);
          });
        } else {
          this.log(chalk.bold(`\nNo suitable database addon for database ${this.prodDatabaseType} available.`));
        }

        let cacheAddOn;
        if (this.cacheProvider === MEMCACHED) {
          cacheAddOn = 'memcachier:dev --as MEMCACHIER';
        } else if (this.cacheProvider === REDIS) {
          cacheAddOn = 'heroku-redis:hobby-dev --as REDIS';
        }

        if (cacheAddOn) {
          this.log(chalk.bold(`\nProvisioning cache addon ${cacheAddOn}`));
          ChildProcess.exec(`heroku addons:create ${cacheAddOn} --app ${this.herokuAppName}`, (err, stdout, stderr) => {
            addonCreateCallback('Cache', err, stdout, stderr);
          });
        } else {
          this.log(chalk.bold(`\nNo suitable cache addon for cacheprovider ${this.cacheProvider} available.`));
        }

        done();
      },

      configureJHipsterRegistry() {
        if (this.abort || this.herokuAppExists) return undefined;

        if (this.serviceDiscoveryType === EUREKA) {
          const prompts = [
            {
              type: 'input',
              name: 'herokuJHipsterRegistryApp',
              message: 'What is the name of your JHipster Registry Heroku application?',
              default: 'jhipster-registry',
            },
            {
              type: 'input',
              name: 'herokuJHipsterRegistryUsername',
              message: 'What is your JHipster Registry username?',
              default: 'admin',
            },
            {
              type: 'input',
              name: 'herokuJHipsterRegistryPassword',
              message: 'What is your JHipster Registry password?',
              default: 'password',
            },
          ];

          this.log('');
          return this.prompt(prompts).then(props => {
            // Encode username/password to avoid errors caused by spaces
            props.herokuJHipsterRegistryUsername = encodeURIComponent(props.herokuJHipsterRegistryUsername);
            props.herokuJHipsterRegistryPassword = encodeURIComponent(props.herokuJHipsterRegistryPassword);
            const herokuJHipsterRegistry = `https://${props.herokuJHipsterRegistryUsername}:${props.herokuJHipsterRegistryPassword}@${props.herokuJHipsterRegistryApp}.herokuapp.com`;
            const configSetCmd = `heroku config:set JHIPSTER_REGISTRY_URL=${herokuJHipsterRegistry} --app ${this.herokuAppName}`;
            const child = ChildProcess.exec(configSetCmd, (err, stdout, stderr) => {
              if (err) {
                this.abort = true;
                this.log.error(err);
              }
            });

            child.stdout.on('data', data => {
              this.log(data.toString());
            });
          });
        }
        return undefined;
      },
    };
  }

  get [BaseGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      copyHerokuFiles() {
        if (this.abort) return;

        this.log(chalk.bold('\nCreating Heroku deployment files'));

        this.writeFile('bootstrap-heroku.yml.ejs', `${SERVER_MAIN_RES_DIR}/config/bootstrap-heroku.yml`);
        this.writeFile('application-heroku.yml.ejs', `${SERVER_MAIN_RES_DIR}/config/application-heroku.yml`);
        this.writeFile('Procfile.ejs', 'Procfile');
        this.writeFile('system.properties.ejs', 'system.properties');
        if (this.buildTool === GRADLE) {
          this.writeFile('heroku.gradle.ejs', 'gradle/heroku.gradle');
        }
        if (this.useOkta) {
          this.writeFile('provision-okta-addon.sh.ejs', 'provision-okta-addon.sh');
          fs.appendFile('.gitignore', 'provision-okta-addon.sh', 'utf8', (err, data) => {
            if (err) {
              this.log(`${chalk.yellow.bold('WARNING!')} Failed to add 'provision-okta-addon.sh' to .gitignore.'`);
            }
          });
        }
      },

      addHerokuBuildPlugin() {
        if (this.abort) return;
        if (this.buildTool !== GRADLE) return;
        this.addGradlePlugin('gradle.plugin.com.heroku.sdk', 'heroku-gradle', '1.0.4');
        this.applyFromGradleScript('gradle/heroku');
      },

      addHerokuMavenProfile() {
        if (this.abort) return;
        if (this.buildTool === MAVEN) {
          this.addMavenProfile('heroku', mavenProfileContent(this));
        }
      },
    });
  }

  get [BaseGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get end() {
    return {
      makeScriptExecutable() {
        if (this.abort) return;
        if (this.useOkta) {
          try {
            fs.chmodSync('provision-okta-addon.sh', '755');
          } catch (err) {
            this.log(
              `${chalk.yellow.bold(
                'WARNING!'
              )}Failed to make 'provision-okta-addon.sh' executable, you may need to run 'chmod +x provison-okta-addon.sh'`
            );
          }
        }
      },
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

      async productionDeploy() {
        if (this.abort) return;

        if (this.herokuSkipDeploy) {
          this.log(chalk.bold('\nSkipping deployment'));
          return;
        }

        if (this.herokuDeployType === 'git') {
          try {
            this.log(chalk.bold('\nUpdating Git repository'));
            const gitAddCmd = 'git add .';
            this.log(chalk.cyan(gitAddCmd));

            const gitAdd = execCmd(gitAddCmd);
            gitAdd.child.stdout.on('data', data => {
              this.log(data);
            });

            gitAdd.child.stderr.on('data', data => {
              this.log(data);
            });
            await gitAdd;

            const gitCommitCmd = 'git commit -m "Deploy to Heroku" --allow-empty';
            this.log(chalk.cyan(gitCommitCmd));

            const gitCommit = execCmd(gitCommitCmd);
            gitCommit.child.stdout.on('data', data => {
              this.log(data);
            });

            gitCommit.child.stderr.on('data', data => {
              this.log(data);
            });
            await gitCommit;

            let buildpack = 'heroku/java';
            let configVars = 'MAVEN_CUSTOM_OPTS="-Pprod,heroku -DskipTests" ';
            if (this.buildTool === GRADLE) {
              buildpack = 'heroku/gradle';
              configVars = 'GRADLE_TASK="stage -Pprod -PnodeInstall" ';
            }

            this.log(chalk.bold('\nConfiguring Heroku'));
            await execCmd(`heroku config:set ${configVars}--app ${this.herokuAppName}`);
            await execCmd(`heroku buildpacks:add ${buildpack} --app ${this.herokuAppName}`);

            this.log(chalk.bold('\nDeploying application'));

            const herokuPush = execCmd('git push heroku HEAD:main', { maxBuffer: 1024 * 10000 });

            herokuPush.child.stdout.on('data', data => {
              this.log(data);
            });

            herokuPush.child.stderr.on('data', data => {
              this.log(data);
            });

            await herokuPush;

            this.log(chalk.green(`\nYour app should now be live. To view it run\n\t${chalk.bold('heroku open')}`));
            this.log(chalk.yellow(`And you can view the logs with this command\n\t${chalk.bold('heroku logs --tail')}`));
            this.log(chalk.yellow(`After application modification, redeploy it with\n\t${chalk.bold('jhipster heroku')}`));

            if (this.useOkta) {
              let curlAvailable = false;
              let jqAvailable = false;
              try {
                await execCmd('curl --help');
                curlAvailable = true;
              } catch (err) {
                this.log(
                  chalk.red('cURL is not available but required. See https://curl.haxx.se/download.html for installation guidance.')
                );
                this.log(chalk.yellow('After you have installed curl execute ./provision-okta-addon.sh manually.'));
              }
              try {
                await execCmd('jq --help');
                jqAvailable = true;
              } catch (err) {
                this.log(
                  chalk.red('jq is not available but required. See https://stedolan.github.io/jq/download/ for installation guidance.')
                );
                this.log(chalk.yellow('After you have installed jq execute ./provision-okta-addon.sh manually.'));
              }
              if (curlAvailable && jqAvailable) {
                this.log(chalk.green('Running ./provision-okta-addon.sh to create all required roles and users for JHipster.'));
                try {
                  await execCmd('./provision-okta-addon.sh');
                  this.log(chalk.bold('\nOkta configured successfully!'));
                  this.log(chalk.green(`\nUse ${chalk.bold(`${this.oktaAdminLogin}/${this.oktaAdminPassword}`)} to login.\n`));
                } catch (err) {
                  this.log(
                    chalk.red(
                      'Failed to execute ./provision-okta-addon.sh. Make sure to setup okta according to https://www.jhipster.tech/heroku/.'
                    )
                  );
                }
              }
            }
          } catch (err) {
            this.log.error(err);
          }
        } else {
          this.log(chalk.bold('\nDeploying application'));
          let jarFileWildcard = 'target/*.jar';
          if (this.buildTool === GRADLE) {
            jarFileWildcard = 'build/libs/*.jar';
          }

          const files = glob.sync(jarFileWildcard, {});
          const jarFile = files[0];
          const herokuDeployCommand = `heroku deploy:jar ${jarFile} --app ${this.herokuAppName}`;
          const herokuSetBuildpackCommand = 'heroku buildpacks:set heroku/jvm';

          this.log(
            chalk.bold(
              `\nUploading your application code.\nThis may take ${chalk.cyan('several minutes')} depending on your connection speed...`
            )
          );
          try {
            await execCmd(herokuSetBuildpackCommand);
            const herokuDeploy = execCmd(herokuDeployCommand);
            herokuDeploy.child.stdout.on('data', data => {
              this.log(data);
            });

            herokuDeploy.child.stderr.on('data', data => {
              this.log(data);
            });
            await herokuDeploy;
            this.log(chalk.green(`\nYour app should now be live. To view it run\n\t${chalk.bold('heroku open')}`));
            this.log(chalk.yellow(`And you can view the logs with this command\n\t${chalk.bold('heroku logs --tail')}`));
            this.log(chalk.yellow(`After application modification, redeploy it with\n\t${chalk.bold('jhipster heroku')}`));

            if (this.useOkta) {
              let curlAvailable = false;
              let jqAvailable = false;
              try {
                await execCmd('curl --help');
                curlAvailable = true;
              } catch (err) {
                this.log(
                  chalk.red('cURL is not available but required. See https://curl.haxx.se/download.html for installation guidance.')
                );
                this.log(chalk.yellow('After you have installed curl execute ./provision-okta-addon.sh manually.'));
              }
              try {
                await execCmd('jq --help');
                jqAvailable = true;
              } catch (err) {
                this.log(
                  chalk.red('jq is not available but required. See https://stedolan.github.io/jq/download/ for installation guidance.')
                );
                this.log(chalk.yellow('After you have installed jq execute ./provision-okta-addon.sh manually.'));
              }
              if (curlAvailable && jqAvailable) {
                this.log(chalk.green('Running ./provision-okta-addon.sh to create all required roles and users for JHipster.'));
                try {
                  await execCmd('./provision-okta-addon.sh');
                  this.log(chalk.bold('\nOkta configured successfully!'));
                  this.log(chalk.green(`\nUse ${chalk.bold(`${this.oktaAdminLogin}/${this.oktaAdminPassword}`)} to login.`));
                } catch (err) {
                  this.log(
                    chalk.red(
                      'Failed to execute ./provision-okta-addon.sh. Make sure to set up Okta according to https://www.jhipster.tech/heroku/.'
                    )
                  );
                }
              }
            }
          } catch (err) {
            this.log.error(err);
          }
        }
      },
    };
  }

  get [BaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }
}
