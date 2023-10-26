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
import { kebabCase } from 'lodash-es';
import chalk from 'chalk';
import { glob } from 'glob';

import BaseGenerator from '../base-application/index.mjs';

import statistics from '../statistics.mjs';
import { JAVA_COMPATIBLE_VERSIONS, JAVA_VERSION, SERVER_MAIN_RES_DIR } from '../generator-constants.mjs';
import { GENERATOR_BOOTSTRAP_APPLICATION, GENERATOR_HEROKU } from '../generator-list.mjs';
import { mavenProfileContent } from './templates.mjs';
import { createPomStorage } from '../maven/support/pom-store.mjs';
import { addGradlePluginCallback, applyFromGradleCallback } from '../gradle/internal/needles.mjs';

export default class HerokuGenerator extends BaseGenerator {
  hasHerokuCli;

  herokuAppName;
  herokuDeployType;
  herokuJavaVersion;
  herokuRegion;
  herokuAppExists;
  herokuSkipDeploy;
  herokuSkipBuild;
  dynoSize;

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

    this.herokuSkipBuild = this.options.skipBuild;
    this.herokuSkipDeploy = this.options.skipDeploy || this.options.skipBuild;
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints(GENERATOR_HEROKU);
    }
    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      async checkInstallation() {
        const { exitCode } = await this.printChildOutput(this.spawnCommand('heroku --version', { reject: false, stdio: 'pipe' }));
        this.hasHerokuCli = exitCode === 0;
        if (!this.hasHerokuCli) {
          const error = "You don't have the Heroku CLI installed. Download it from https://cli.heroku.com/";
          if (this.skipChecks) {
            this.log.warn(error);
            this.log.warn('Generation will continue with limited support');
          } else {
            throw new Error(error);
          }
        }
      },

      initializing() {
        this.log.log(chalk.bold('Heroku configuration is starting'));
        this.dynoSize = 'Free';
        this.herokuAppExists = Boolean(this.jhipsterConfig.herokuAppName);
      },
    });
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      async askForApp() {
        if (this.hasHerokuCli && this.herokuAppExists) {
          const { stdout, exitCode } = await this.spawnCommand(`heroku apps:info --json ${this.jhipsterConfig.herokuAppName}`, {
            reject: false,
            stdio: 'pipe',
          });
          if (exitCode !== 0) {
            this.log.error(`Could not find application: ${chalk.cyan(this.jhipsterConfig.herokuAppName)}`);
            throw new Error('Run the generator again to create a new application.');
          } else {
            const json = JSON.parse(stdout);
            this.herokuAppName = json.app.name;
            if (json.dynos.length > 0) {
              this.dynoSize = json.dynos[0].size;
            }
            this.log.verboseInfo(`Deploying as existing application: ${chalk.bold(this.herokuAppName)}`);
            this.config.set({
              herokuAppName: this.herokuAppName,
            });
          }
        } else {
          await this.prompt(
            [
              {
                type: 'input',
                name: 'herokuAppName',
                message: 'Name to deploy as:',
                default: this.baseName,
              },
            ],
            this.config,
          );

          const answers = await this.prompt([
            {
              type: 'list',
              name: 'herokuRegion',
              message: 'On which region do you want to deploy ?',
              choices: ['us', 'eu'],
              default: 0,
            },
          ]);
          this.herokuRegion = answers.herokuRegion;
        }
      },
      async askForHerokuDeployType() {
        await this.prompt(
          [
            {
              type: 'list',
              name: 'herokuDeployType',
              message: 'Which type of deployment do you want ?',
              choices: [
                { value: 'git', name: 'Git (compile on Heroku)' },
                { value: 'jar', name: 'JAR (compile locally)' },
              ],
              default: 0,
            },
          ],
          this.config,
        );
      },

      async askForHerokuJavaVersion() {
        await this.prompt(
          [
            {
              type: 'list',
              name: 'herokuJavaVersion',
              message: 'Which Java version would you like to use to build and run your app ?',
              choices: JAVA_COMPATIBLE_VERSIONS.map(version => ({ value: version })),
              default: JAVA_VERSION,
            },
          ],
          this.config,
        );
      },
    });
  }

  get [BaseGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get loading() {
    return this.asConfiguringTaskGroup({
      saveConfig() {
        this.herokuAppName = kebabCase(this.jhipsterConfig.herokuAppName);
        this.herokuJavaVersion = this.jhipsterConfig.herokuJavaVersion;
        this.herokuDeployType = this.jhipsterConfig.herokuDeployType;
      },
    });
  }

  get [BaseGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get default() {
    return this.asDefaultTaskGroup({
      insight() {
        statistics.sendSubGenEvent('generator', GENERATOR_HEROKU);
      },

      async gitInit() {
        if (!this.herokuDeployType === 'git') return;

        const git = this.createGit();
        if (await git.checkIsRepo()) {
          this.log.log(chalk.bold('\nUsing existing Git repository'));
        } else {
          this.log.log(chalk.bold('\nInitializing Git repository'));
          await git.init();
        }
      },

      async installHerokuDeployPlugin() {
        if (!this.hasHerokuCli) return;

        const cliPlugin = 'heroku-cli-deploy';

        const { stdout, stderr, exitCode } = await this.spawnCommand('heroku plugins', { reject: false, stdio: 'pipe' });
        if (exitCode !== 0) {
          if (stdout.includes(cliPlugin)) {
            this.log.log('\nHeroku CLI deployment plugin already installed');
          } else {
            this.log.log(chalk.bold('\nInstalling Heroku CLI deployment plugin'));
            const { stdout, exitCode } = await this.spawnCommand(`heroku plugins:install ${cliPlugin}`, { reject: false, stdio: 'pipe' });
            if (exitCode !== 0) {
              throw new Error(stderr);
            }
            this.log.verboseInfo(stdout);
          }
        }
      },

      async herokuCreate() {
        if (!this.hasHerokuCli || this.herokuAppExists) return;

        const regionParams = this.herokuRegion !== 'us' ? ` --region ${this.herokuRegion}` : '';

        this.log.log(chalk.bold('\nCreating Heroku application and setting up node environment'));
        const { stdout, stderr, exitCode } = await this.printChildOutput(
          this.spawnCommand(`heroku create ${this.herokuAppName}${regionParams}`, {
            reject: false,
            stdio: 'pipe',
          }),
        );

        if (stdout.includes('Heroku credentials')) {
          throw new Error("Error: Not authenticated. Run 'heroku login' to login to your heroku account and try again.");
        }

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
              const { stdout } = await this.spawnCommand(`heroku git:remote --app ${this.herokuAppName}`);
              this.log.verboseInfo(stdout);
            } else {
              const { stdout } = await this.spawnCommand(`heroku create ${regionParams}`);
              // Extract from "Created random-app-name-1234... done"
              this.herokuAppName = stdout.substring(stdout.indexOf('https://') + 8, stdout.indexOf('.herokuapp'));
              this.log.verboseInfo(stdout);

              // ensure that the git remote is the same as the appName
              await this.spawnCommand(`heroku git:remote --app ${this.herokuAppName}`);
              this.jhipsterConfig.herokuAppName = this.herokuAppName;
            }
          } else if (stderr.includes('Invalid credentials')) {
            this.log.error("Error: Not authenticated. Run 'heroku login' to login to your heroku account and try again.");
          } else {
            throw new Error(stderr);
          }
        }
      },

      async herokuAddonsCreate({ application }) {
        if (!this.hasHerokuCli) return;

        this.log.log(chalk.bold('\nProvisioning addons'));
        if (application.searchEngineElasticsearch) {
          this.log.log(chalk.bold('\nProvisioning bonsai elasticsearch addon'));
          const { stderr } = await this.spawnCommand(`heroku addons:create bonsai:sandbox-6 --as BONSAI --app ${this.herokuAppName}`, {
            reject: false,
            stdio: 'pipe',
          });
          this.checkAddOnReturn({ addOn: 'Elasticsearch', stderr });
        }

        let dbAddOn;
        if (application.prodDatabaseTypePostgresql) {
          dbAddOn = 'heroku-postgresql --as DATABASE';
        } else if (application.prodDatabaseTypeMysql) {
          dbAddOn = 'jawsdb:kitefin --as DATABASE';
        } else if (application.prodDatabaseTypeMariadb) {
          dbAddOn = 'jawsdb-maria:kitefin --as DATABASE';
        }

        if (dbAddOn) {
          this.log.log(chalk.bold(`\nProvisioning database addon ${dbAddOn}`));
          const { stderr } = await this.spawnCommand(`heroku addons:create ${dbAddOn} --app ${this.herokuAppName}`, {
            reject: false,
            stdio: 'pipe',
          });
          this.checkAddOnReturn({ addOn: 'Database', stderr });
        } else {
          this.log.log(chalk.bold(`\nNo suitable database addon for database ${this.prodDatabaseType} available.`));
        }

        let cacheAddOn;
        if (application.cacheProviderMemcached) {
          cacheAddOn = 'memcachier:dev --as MEMCACHIER';
        } else if (application.cacheProviderRedis) {
          cacheAddOn = 'heroku-redis:hobby-dev --as REDIS';
        }

        if (cacheAddOn) {
          this.log.log(chalk.bold(`\nProvisioning cache addon '${cacheAddOn}'`));

          const { stderr } = await this.spawnCommand(`heroku addons:create ${cacheAddOn} --app ${this.herokuAppName}`, {
            reject: false,
            stdio: 'pipe',
          });
          this.checkAddOnReturn({ addOn: 'Cache', stderr });
        } else {
          this.log.log(chalk.bold(`\nNo suitable cache addon for cacheprovider ${this.cacheProvider} available.`));
        }
      },

      async configureJHipsterRegistry({ application }) {
        if (!this.hasHerokuCli || this.herokuAppExists || !application.serviceDiscoveryEureka) return undefined;

        this.log.verboseInfo('');
        const answers = await this.prompt([
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
        ]);

        // Encode username/password to avoid errors caused by spaces
        const herokuJHipsterRegistryUsername = encodeURIComponent(answers.herokuJHipsterRegistryUsername);
        const herokuJHipsterRegistryPassword = encodeURIComponent(answers.herokuJHipsterRegistryPassword);
        const herokuJHipsterRegistry = `https://${herokuJHipsterRegistryUsername}:${herokuJHipsterRegistryPassword}@${answers.herokuJHipsterRegistryApp}.herokuapp.com`;
        const configSetCmd = `heroku config:set JHIPSTER_REGISTRY_URL=${herokuJHipsterRegistry} --app ${this.herokuAppName}`;
        await this.printChildOutput(this.spawnCommand(configSetCmd, { stdio: 'pipe' }));
      },
    });
  }

  get [BaseGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get writing() {
    return this.asWritingTaskGroup({
      copyHerokuFiles({ application }) {
        this.log.log(chalk.bold('\nCreating Heroku deployment files'));
        const context = {
          ...application,
          herokuAppName: this.herokuAppName,
          dynoSize: this.dynoSize,
          herokuJavaVersion: this.herokuJavaVersion,
          herokuDeployType: this.herokuDeployType,
        };

        this.writeFile('bootstrap-heroku.yml.ejs', `${SERVER_MAIN_RES_DIR}/config/bootstrap-heroku.yml`, context);
        this.writeFile('application-heroku.yml.ejs', `${SERVER_MAIN_RES_DIR}/config/application-heroku.yml`, context);
        this.writeFile('Procfile.ejs', 'Procfile', context);
        this.writeFile('system.properties.ejs', 'system.properties', context);
        if (application.buildToolGradle) {
          this.writeFile('heroku.gradle.ejs', 'gradle/heroku.gradle', context);
        }
      },

      addHerokuBuildPlugin({ application }) {
        if (!application.buildToolGradle) return;
        // TODO addGradlePluginCallback is an internal api, switch to source api when converted to BaseApplicationGenerator
        this.editFile(
          'build.gradle',
          addGradlePluginCallback({ groupId: 'gradle.plugin.com.heroku.sdk', artifactId: 'heroku-gradle', version: '1.0.4' }),
        );
        // TODO applyFromGradleCallback is an internal api, switch to source api when converted to BaseApplicationGenerator
        this.editFile('build.gradle', applyFromGradleCallback({ script: 'gradle/heroku.gradle' }));
      },

      addHerokuMavenProfile({ application }) {
        if (application.buildToolMaven) {
          this.addMavenProfile('heroku', mavenProfileContent(application));
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

      async productionDeploy({ application }) {
        if (this.herokuSkipDeploy || !this.hasHerokuCli) {
          this.log.log(chalk.bold('\nSkipping deployment'));
          return;
        }

        if (this.herokuDeployType === 'git') {
          try {
            this.log.log(chalk.bold('\nUpdating Git repository'));
            const git = this.createGit();
            await git.add('.').commit('Deploy to Heroku', { '--allow-empty': null });

            let buildpack = 'heroku/java';
            let configVars = 'MAVEN_CUSTOM_OPTS="-Pprod,heroku -DskipTests" ';
            if (application.buildToolGradle) {
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
                this.log.info(chalk.bold('You aborted deployment!'));
                this.cancelCancellableTasks();
                return;
              }
              this.log('');
            }

            this.log.log(chalk.bold('\nDeploying application'));

            await git.push('heroku', 'HEAD:main');

            this.log.log(chalk.green(`\nYour app should now be live. To view it run\n\t${chalk.bold('heroku open')}`));
            this.log.log(chalk.yellow(`And you can view the logs with this command\n\t${chalk.bold('heroku logs --tail')}`));
            this.log.log(chalk.yellow(`After application modification, redeploy it with\n\t${chalk.bold('jhipster heroku')}`));
          } catch (err) {
            this.log.error(err);
          }
        } else {
          this.log.log(chalk.bold('\nDeploying application'));
          let jarFileWildcard = 'target/*.jar';
          if (application.buildToolGradle) {
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
            await this.printChildOutput(this.spawnCommand(herokuSetBuildpackCommand, { stdio: 'pipe' }));
            await this.printChildOutput(this.spawnCommand(herokuDeployCommand, { stdio: 'pipe' }));
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

  /**
   * @param {ReturnType<BaseGenerator['spawnCommand']>} child
   * @param {(chunk: any) => void} child
   * @returns {ReturnType<BaseGenerator['spawnCommand']>}
   */
  printChildOutput(child, log = data => this.log.verboseInfo(data)) {
    child.stdout.on('data', data => {
      data.toString().split(/\r?\n/).forEach(log);
    });
    child.stderr.on('data', data => {
      data.toString().split(/\r?\n/).forEach(log);
    });
    return child;
  }

  checkAddOnReturn({ addon, stderr }) {
    if (stderr) {
      const verifyAccountUrl = 'https://heroku.com/verify';
      if (stderr.includes(verifyAccountUrl)) {
        this.log.error(`Account must be verified to use addons. Please go to: ${verifyAccountUrl}`);
        throw new Error(stderr);
      } else {
        this.log.verboseInfo(`No new ${addon} addon created`);
      }
    } else {
      this.log.ok(`Created ${addon} addon`);
    }
  }
}
