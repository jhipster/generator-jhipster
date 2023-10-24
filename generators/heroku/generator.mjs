/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import fs from 'fs';
import * as _ from 'lodash-es';
import chalk from 'chalk';
import { glob } from 'glob';

import BaseGenerator from '../base/index.mjs';

import statistics from '../statistics.mjs';
import { CLIENT_MAIN_SRC_DIR, JAVA_COMPATIBLE_VERSIONS, JAVA_VERSION, SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';
import { GENERATOR_HEROKU } from '../generator-list.mjs';
import { buildToolTypes, cacheTypes, databaseTypes, searchEngineTypes, serviceDiscoveryTypes } from '../../jdl/jhipster/index.mjs';
import { mavenProfileContent } from './templates.mjs';
import { createPomStorage } from '../maven/support/pom-store.mjs';
import { addGradlePluginCallback, applyFromGradleCallback } from '../gradle/internal/needles.mjs';
import { getFrontendAppName } from '../base/support/index.mjs';
import { loadAppConfig, loadDerivedAppConfig } from '../app/support/index.mjs';
import { loadDerivedPlatformConfig, loadDerivedServerConfig, loadPlatformConfig, loadServerConfig } from '../server/support/index.mjs';
import { loadLanguagesConfig } from '../languages/support/index.mjs';

const cacheProviderOptions = cacheTypes;
const { MEMCACHED, REDIS } = cacheTypes;
const { GRADLE, MAVEN } = buildToolTypes;
const { ELASTICSEARCH } = searchEngineTypes;
const { MARIADB, MYSQL, POSTGRESQL } = databaseTypes;
const { EUREKA } = serviceDiscoveryTypes;

const NO_CACHE_PROVIDER = cacheProviderOptions.NO;

export default class HerokuGenerator extends BaseGenerator {
  constructor(args, options, features) {
    super(args, options, features);

    this.option('skip-build', {
      description: 'Skips building the application',
      type: Boolean,
      default: false,
    });

    this.option('skip-deploy', {
      description: 'Skips deployment to Heroku',
      type: Boolean,
      default: false,
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
        loadAppConfig({ config: this.jhipsterConfigWithDefaults, application: this, useVersionPlaceholders: this.useVersionPlaceholders });
        loadServerConfig({ config: this.jhipsterConfigWithDefaults, application: this });
        loadLanguagesConfig({ application: this, config: this.jhipsterConfigWithDefaults });
        loadPlatformConfig({ config: this.jhipsterConfigWithDefaults, application: this });

        loadDerivedAppConfig({ application: this });
        loadDerivedPlatformConfig({ application: this });
        loadDerivedServerConfig({ application: this });
      },

      initializing() {
        this.log.log(chalk.bold('Heroku configuration is starting'));
        const configuration = this.config;
        this.env.options.appPath = configuration.get('appPath') || CLIENT_MAIN_SRC_DIR;
        this.cacheProvider = this.cacheProvider || NO_CACHE_PROVIDER;
        this.enableHibernateCache = this.enableHibernateCache && ![NO_CACHE_PROVIDER, MEMCACHED].includes(this.cacheProvider);
        this.frontendAppName = getFrontendAppName({ baseName: this.jhipsterConfig.baseName });
        this.herokuAppName = configuration.get('herokuAppName');
        this.dynoSize = 'Free';
        this.herokuDeployType = configuration.get('herokuDeployType');
        this.herokuJavaVersion = configuration.get('herokuJavaVersion');
      },
    };
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return {
      async askForApp() {
        if (this.herokuAppName) {
          const { stdout, exitCode } = await this.spawnCommand(`heroku apps:info --json ${this.herokuAppName}`, {
            reject: false,
            stdio: 'pipe',
          });
          if (exitCode !== 0) {
            this.cancelCancellableTasks();
            this.log.error(`Could not find application: ${chalk.cyan(this.herokuAppName)}`);
            this.log.error('Run the generator again to create a new application.');
            this.herokuAppName = null;
          } else {
            const json = JSON.parse(stdout);
            this.herokuAppName = json.app.name;
            if (json.dynos.length > 0) {
              this.dynoSize = json.dynos[0].size;
            }
            this.log.verboseInfo(`Deploying as existing application: ${chalk.bold(this.herokuAppName)}`);
            this.herokuAppExists = true;
            this.config.set({
              herokuAppName: this.herokuAppName,
              herokuDeployType: this.herokuDeployType,
            });
          }
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

          const props = await this.prompt(prompts);
          this.herokuAppName = _.kebabCase(props.herokuAppName);
          this.herokuRegion = props.herokuRegion;
          this.herokuAppExists = false;
        }
      },

      askForHerokuDeployType() {
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
    };
  }

  get [BaseGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return {
      async checkInstallation() {
        const { exitCode } = await this.spawnCommand('heroku --version', { reject: false, stdio: 'pipe' });
        if (exitCode !== 0) {
          this.log.error("You don't have the Heroku CLI installed. Download it from https://cli.heroku.com/");
          this.cancelCancellableTasks();
        }
      },

      saveConfig() {
        this.config.set({
          herokuAppName: this.herokuAppName,
          herokuDeployType: this.herokuDeployType,
          herokuJavaVersion: this.herokuJavaVersion,
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

      async gitInit() {
        try {
          fs.lstatSync('.git');
          this.log.log(chalk.bold('\nUsing existing Git repository'));
        } catch (e) {
          // An exception is thrown if the folder doesn't exist
          this.log.log(chalk.bold('\nInitializing Git repository'));
          const { stdout } = await this.spawnCommand('git init', { reject: false, stdio: 'pipe' });
          stdout.on('data', data => {
            this.log.verboseInfo(data.toString());
          });
        }
      },

      async installHerokuDeployPlugin() {
        const cliPlugin = 'heroku-cli-deploy';

        const { stdout, stderr, exitCode } = await this.spawnCommand('heroku plugins', { reject: false, stdio: 'pipe' });
        if (exitCode !== 0) {
          if (_.includes(stdout, cliPlugin)) {
            this.log.log('\nHeroku CLI deployment plugin already installed');
            this.cancelCancellableTasks();
          } else {
            this.log.log(chalk.bold('\nInstalling Heroku CLI deployment plugin'));
            const { stdout, exitCode } = await this.spawnCommand(`heroku plugins:install ${cliPlugin}`, { reject: false, stdio: 'pipe' });
            if (exitCode !== 0) {
              this.log.error(stderr);
              this.cancelCancellableTasks();
            }
            stdout.on('data', data => {
              this.log.verboseInfo(data.toString());
            });
          }
        }
      },

      async herokuCreate() {
        if (this.herokuAppExists) return;

        const regionParams = this.herokuRegion !== 'us' ? ` --region ${this.herokuRegion}` : '';

        this.log.log(chalk.bold('\nCreating Heroku application and setting up node environment'));
        const { stderr, stdout, exitCode } = await this.spawnCommand(`heroku create ${this.herokuAppName}${regionParams}`, {
          reject: false,
          stdio: 'pipe',
        });

        if (exitCode !== 0) {
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

            this.log.verboseInfo('');
            const props = await this.prompt(prompts);
            if (props.herokuForceName === 'Yes') {
              this.spawnCommand(`heroku git:remote --app ${this.herokuAppName}`, (err, stdout) => {
                if (err) {
                  this.abort = true;
                  this.log.error(err);
                } else {
                  this.log.verboseInfo(stdout.trim());
                  this.config.set({
                    herokuAppName: this.herokuAppName,
                    herokuDeployType: this.herokuDeployType,
                  });
                }
              });
            } else {
              this.spawnCommand(`heroku create ${regionParams}`, (err, stdout) => {
                if (err) {
                  this.abort = true;
                  this.log.error(err);
                } else {
                  // Extract from "Created random-app-name-1234... done"
                  this.herokuAppName = stdout.substring(stdout.indexOf('https://') + 8, stdout.indexOf('.herokuapp'));
                  this.log.verboseInfo(stdout.trim());

                  // ensure that the git remote is the same as the appName
                  this.spawnCommand(`heroku git:remote --app ${this.herokuAppName}`, err => {
                    if (err) {
                      this.abort = true;
                      this.log.error(err);
                    } else {
                      this.config.set({
                        herokuAppName: this.herokuAppName,
                        herokuDeployType: this.herokuDeployType,
                      });
                    }
                  });
                }
              });
            }
          } else {
            this.cancelCancellableTasks();
            this.herokuAppName = null;
            if (stderr.includes('Invalid credentials')) {
              this.log.error("Error: Not authenticated. Run 'heroku login' to login to your heroku account and try again.");
            } else {
              this.log.error(stderr);
            }
          }
        }

        stdout.on('data', data => {
          const output = data.toString();
          if (data.search('Heroku credentials') >= 0) {
            this.cancelCancellableTasks();
            this.log.error("Error: Not authenticated. Run 'heroku login' to login to your heroku account and try again.");
          } else {
            this.log.verboseInfo(output.trim());
          }
        });
      },

      async herokuAddonsCreate() {
        const addonCreateCallback = (addon, err) => {
          if (err) {
            const verifyAccountUrl = 'https://heroku.com/verify';
            if (_.includes(err, verifyAccountUrl)) {
              this.abort = true;
              this.log.error(`Account must be verified to use addons. Please go to: ${verifyAccountUrl}`);
              this.log.error(err);
            } else {
              this.log.verboseInfo(`No new ${addon} addon created`);
            }
          } else {
            this.log.verboseInfo(`Created ${addon} addon`);
          }
        };

        this.log.log(chalk.bold('\nProvisioning addons'));
        if (this.searchEngine === ELASTICSEARCH) {
          this.log.log(chalk.bold('\nProvisioning bonsai elasticsearch addon'));
          const { stderr, stdout, exitCode } = await this.spawnCommand(
            `heroku addons:create bonsai:sandbox-6 --as BONSAI --app ${this.herokuAppName}`,
            { reject: false, stdio: 'pipe' },
          );
          addonCreateCallback.bind('Elasticsearch', exitCode, stdout, stderr);
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
          this.log.log(chalk.bold(`\nProvisioning database addon ${dbAddOn}`));
          const { stderr, stdout, exitCode } = await this.spawnCommand(`heroku addons:create ${dbAddOn} --app ${this.herokuAppName}`, {
            reject: false,
            stdio: 'pipe',
          });
          addonCreateCallback('Database', exitCode, stdout, stderr);
        } else {
          this.log.log(chalk.bold(`\nNo suitable database addon for database ${this.prodDatabaseType} available.`));
        }

        let cacheAddOn;
        if (this.cacheProvider === MEMCACHED) {
          cacheAddOn = 'memcachier:dev --as MEMCACHIER';
        } else if (this.cacheProvider === REDIS) {
          cacheAddOn = 'heroku-redis:hobby-dev --as REDIS';
        }

        if (cacheAddOn) {
          this.log.log(chalk.bold(`\nProvisioning cache addon ${cacheAddOn}`));

          const { stderr, stdout, exitCode } = await this.spawnCommand(`heroku addons:create ${cacheAddOn} --app ${this.herokuAppName}`, {
            reject: false,
            stdio: 'pipe',
          });
          addonCreateCallback('Cache', exitCode, stdout, stderr);
        } else {
          this.log.log(chalk.bold(`\nNo suitable cache addon for cacheprovider ${this.cacheProvider} available.`));
        }
      },

      configureJHipsterRegistry() {
        if (this.herokuAppExists) return undefined;

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

          this.log.verboseInfo('');
          return this.prompt(prompts).then(props => {
            // Encode username/password to avoid errors caused by spaces
            props.herokuJHipsterRegistryUsername = encodeURIComponent(props.herokuJHipsterRegistryUsername);
            props.herokuJHipsterRegistryPassword = encodeURIComponent(props.herokuJHipsterRegistryPassword);
            const herokuJHipsterRegistry = `https://${props.herokuJHipsterRegistryUsername}:${props.herokuJHipsterRegistryPassword}@${props.herokuJHipsterRegistryApp}.herokuapp.com`;
            const configSetCmd = `heroku config:set JHIPSTER_REGISTRY_URL=${herokuJHipsterRegistry} --app ${this.herokuAppName}`;
            const child = this.spawnCommand(configSetCmd, err => {
              if (err) {
                this.abort = true;
                this.log.error(err);
              }
            });

            child.stdout.on('data', data => {
              this.log.verboseInfo(data.toString());
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
        this.log.log(chalk.bold('\nCreating Heroku deployment files'));
        this.writeFile('bootstrap-heroku.yml.ejs', `${SERVER_MAIN_RES_DIR}/config/bootstrap-heroku.yml`);
        this.writeFile('application-heroku.yml.ejs', `${SERVER_MAIN_RES_DIR}/config/application-heroku.yml`);
        this.writeFile('Procfile.ejs', 'Procfile');
        this.writeFile('system.properties.ejs', 'system.properties');
        if (this.buildTool === GRADLE) {
          this.writeFile('heroku.gradle.ejs', 'gradle/heroku.gradle');
        }
      },

      addHerokuBuildPlugin() {
        if (this.buildTool !== GRADLE) return;
        // TODO addGradlePluginCallback is an internal api, switch to source api when converted to BaseApplicationGenerator
        this.editFile(
          'build.gradle',
          addGradlePluginCallback({ groupId: 'gradle.plugin.com.heroku.sdk', artifactId: 'heroku-gradle', version: '1.0.4' }),
        );
        // TODO applyFromGradleCallback is an internal api, switch to source api when converted to BaseApplicationGenerator
        this.editFile('build.gradle', applyFromGradleCallback({ script: 'gradle/heroku.gradle' }));
      },

      addHerokuMavenProfile() {
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
    return this.asEndTaskGroup({
      async productionBuild() {
        if (this.herokuSkipBuild || this.herokuDeployType === 'git') {
          this.log.log(chalk.bold('\nSkipping build'));
          return;
        }

        this.log.log(chalk.bold('\nBuilding application'));

        // Use npm script so blueprints just need to override it.
        await this.spawnCommand('npm run java:jar:prod', { stdio: 'inherit' });
      },

      async productionDeploy() {
        if (this.herokuSkipDeploy) {
          this.log.log(chalk.bold('\nSkipping deployment'));
          return;
        }

        if (this.herokuDeployType === 'git') {
          try {
            this.log.log(chalk.bold('\nUpdating Git repository'));
            const gitAddCmd = 'git add .';
            this.log.log(chalk.cyan(gitAddCmd));

            const gitAdd = this.spawnCommand(gitAddCmd);
            gitAdd.child.stdout.on('data', data => {
              this.log.verboseInfo(data);
            });

            gitAdd.child.stderr.on('data', data => {
              this.log.verboseInfo(data);
            });
            await gitAdd;

            const gitCommitCmd = 'git commit -m "Deploy to Heroku" --allow-empty';
            this.log.log(chalk.cyan(gitCommitCmd));

            const gitCommit = await this.spawnCommand(gitCommitCmd);
            gitCommit.child.stdout.on('data', data => {
              this.log.verboseInfo(data);
            });

            gitCommit.child.stderr.on('data', data => {
              this.log.verboseInfo(data);
            });
            await gitCommit;

            let buildpack = 'heroku/java';
            let configVars = 'MAVEN_CUSTOM_OPTS="-Pprod,heroku -DskipTests" ';
            if (this.buildTool === GRADLE) {
              buildpack = 'heroku/gradle';
              configVars = 'GRADLE_TASK="stage -Pprod -PnodeInstall" ';
            }

            this.log.log(chalk.bold('\nConfiguring Heroku'));
            await this.spawnCommand(`heroku config:set ${configVars}--app ${this.herokuAppName}`);
            const { stdout: data } = await this.spawnCommand(`heroku buildpacks:add ${buildpack} --app ${this.herokuAppName}`);
            if (data) {
              this.logger.info(data);
              // remote:  !     The following add-ons were automatically provisioned: . These add-ons may incur additional cost,
              // which is prorated to the second. Run `heroku addons` for more info.
              if (data.includes('Run `heroku addons` for more info.')) {
                await this.spawnCommand('heroku addons');
              }

              this.log('');
              const prompts = [
                {
                  type: 'list',
                  name: 'userDeployDecision',
                  message: 'Continue to deploy?',
                  choices: [
                    {
                      value: 'Yes',
                      name: 'Yes, I confirm',
                    },
                    {
                      value: 'No',
                      name: 'No, abort (Recommended)',
                    },
                  ],
                  default: 0,
                },
              ];

              this.log('');
              const props = await this.prompt(prompts);
              if (props.userDeployDecision === 'Yes') {
                this.log.info(chalk.bold('Continuing deployment...'));
              } else {
                this.log(this.logger);
                this.log.info(chalk.bold('You aborted deployment!'));
                this.abort = true;
                this.herokuAppName = null;
                return;
              }
              this.log('');
            }

            this.log.log(chalk.bold('\nDeploying application'));

            const herokuPush = this.spawnCommand('git push heroku HEAD:main', { maxBuffer: 1024 * 10000 });

            herokuPush.child.stdout.on('data', data => {
              this.log.verboseInfo(data);
            });

            herokuPush.child.stderr.on('data', data => {
              this.log.verboseInfo(data);
            });

            await herokuPush;

            this.log.log(chalk.green(`\nYour app should now be live. To view it run\n\t${chalk.bold('heroku open')}`));
            this.log.log(chalk.yellow(`And you can view the logs with this command\n\t${chalk.bold('heroku logs --tail')}`));
            this.log.log(chalk.yellow(`After application modification, redeploy it with\n\t${chalk.bold('jhipster heroku')}`));
          } catch (err) {
            this.log.error(err);
          }
        } else {
          this.log.log(chalk.bold('\nDeploying application'));
          let jarFileWildcard = 'target/*.jar';
          if (this.buildTool === GRADLE) {
            jarFileWildcard = 'build/libs/*.jar';
          }

          const files = glob.sync(jarFileWildcard, {});
          const jarFile = files[0];
          const herokuDeployCommand = `heroku deploy:jar ${jarFile} --app ${this.herokuAppName}`;
          const herokuSetBuildpackCommand = 'heroku buildpacks:set heroku/jvm';

          this.log.log(
            chalk.bold(
              `\nUploading your application code.\nThis may take ${chalk.cyan('several minutes')} depending on your connection speed...`,
            ),
          );
          try {
            await this.spawnCommand(herokuSetBuildpackCommand);
            const herokuDeploy = this.spawnCommand(herokuDeployCommand);
            herokuDeploy.child.stdout.on('data', data => {
              this.log.verboseInfo(data);
            });

            herokuDeploy.child.stderr.on('data', data => {
              this.log.verboseInfo(data);
            });
            await herokuDeploy;
            this.log.log(chalk.green(`\nYour app should now be live. To view it run\n\t${chalk.bold('heroku open')}`));
            this.log.log(chalk.yellow(`And you can view the logs with this command\n\t${chalk.bold('heroku logs --tail')}`));
            this.log.log(chalk.yellow(`After application modification, redeploy it with\n\t${chalk.bold('jhipster heroku')}`));
          } catch (err) {
            this.log.error(err);
          }
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  /**
   * TODO drop when dropped from gae, azure-spring-cloud and heroku generators
   * @private
   * Add a new Maven profile.
   *
   * @param {string} profileId - profile ID
   * @param {string} other - explicit other thing: build, dependencies...
   */
  addMavenProfile(profileId, other) {
    createPomStorage(this).addProfile({ id: profileId, content: other });
  }
}
