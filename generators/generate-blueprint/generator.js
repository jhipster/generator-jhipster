/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import chalk from 'chalk';
import { camelCase, upperFirst, snakeCase } from 'lodash-es';

import BaseGenerator from '../base/index.js';
import { PRIORITY_NAMES_LIST as BASE_PRIORITY_NAMES_LIST } from '../base/priorities.js';

import {
  requiredConfig,
  defaultConfig,
  defaultSubGeneratorConfig,
  allGeneratorsConfig,
  prompts,
  subGeneratorPrompts,
  GENERATE_SNAPSHOTS,
  LINK_JHIPSTER_DEPENDENCY,
  ALL_GENERATORS,
  GENERATORS,
  PRIORITIES,
  SUB_GENERATORS,
  ADDITIONAL_SUB_GENERATORS,
  WRITTEN,
  LOCAL_BLUEPRINT_OPTION,
  ALL_PRIORITIES,
  DYNAMIC,
} from './constants.js';

import * as GENERATOR_LIST from '../generator-list.js';
import { files, generatorFiles } from './files.js';
import { packageJson } from '../../lib/index.js';
import { SKIP_COMMIT_HOOK } from '../init/constants.js';
import command from './command.js';
import { BLUEPRINT_API_VERSION, NODE_VERSION } from '../generator-constants.js';

const { GENERATOR_PROJECT_NAME, GENERATOR_INIT } = GENERATOR_LIST;

export default class extends BaseGenerator {
  async _beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster(GENERATOR_PROJECT_NAME);
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      async loadOptions() {
        await this.parseCurrentJHipsterCommand();

        if (this[ALL_GENERATORS]) {
          this.config.set(allGeneratorsConfig());
        }
        if (this.options.defaults) {
          this.config.defaults(defaultConfig({ config: this.jhipsterConfig }));
        }
      },
    });
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return {
      async prompting() {
        await this.prompt(prompts(this), this.config);
      },
      async eachSubGenerator() {
        const { localBlueprint } = this.jhipsterConfig;
        const { [ALL_PRIORITIES]: allPriorities } = this.options;
        const subGenerators = this.config.get(SUB_GENERATORS) || [];
        for (const subGenerator of subGenerators) {
          const subGeneratorStorage = this.getSubGeneratorStorage(subGenerator);
          if (allPriorities) {
            subGeneratorStorage.defaults({ [PRIORITIES]: BASE_PRIORITY_NAMES_LIST });
          }
          await this.prompt(subGeneratorPrompts({ subGenerator, localBlueprint, options: this.options }), subGeneratorStorage);
        }
      },
      async eachAdditionalSubGenerator() {
        const { localBlueprint } = this.jhipsterConfig;
        const { [ALL_PRIORITIES]: allPriorities } = this.options;
        const additionalSubGenerators = this.config.get(ADDITIONAL_SUB_GENERATORS) || '';
        for (const subGenerator of additionalSubGenerators
          .split(',')
          .map(sub => sub.trim())
          .filter(Boolean)) {
          const subGeneratorStorage = this.getSubGeneratorStorage(subGenerator);
          if (allPriorities) {
            subGeneratorStorage.defaults({ [PRIORITIES]: BASE_PRIORITY_NAMES_LIST });
          }
          await this.prompt(subGeneratorPrompts({ subGenerator, localBlueprint, additionalSubGenerator: true }), subGeneratorStorage);
        }
      },
    };
  }

  get [BaseGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return {
      requiredConfig() {
        this.config.defaults(requiredConfig());
      },
      conditionalConfig() {
        if (this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) {
          this.config.defaults({
            [SKIP_COMMIT_HOOK]: true,
            [DYNAMIC]: true,
            js: false,
          });
        }
      },
    };
  }

  get [BaseGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get composing() {
    return {
      async compose() {
        if (this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) return;
        const initGenerator = await this.composeWithJHipster(GENERATOR_INIT);
        initGenerator.generateReadme = false;
      },
    };
  }

  get [BaseGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      async createContext() {
        this.application = { ...defaultConfig(), ...this.config.getAll() };
        await this.loadCurrentJHipsterCommandConfig(this.application);
      },
      async load() {
        this.application.packagejs = packageJson;
      },
    });
  }

  get [BaseGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return {
      prepareCommands() {
        this.application.commands = [];
        this.application.nodeVersion = NODE_VERSION;
        if (!this.application[GENERATORS]) return;
        for (const generator of Object.keys(this.application[GENERATORS])) {
          const subGeneratorConfig = this.getSubGeneratorStorage(generator).getAll();
          if (subGeneratorConfig.command) {
            this.application.commands.push(generator);
          }
        }
      },
      preparePath() {
        this.application.blueprintsPath = this.application[LOCAL_BLUEPRINT_OPTION] ? '.blueprint/' : 'generators/';
      },
      prepare() {
        const { cli, cliName, baseName } = this.application;
        this.application.githubRepository = this.jhipsterConfig.githubRepository ?? `jhipster/generator-jhipster-${baseName}`;
        if (cli) {
          this.application.cliName = cliName ?? `jhipster-${baseName}`;
        }
      },
    };
  }

  get [BaseGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return {
      async writing() {
        this.application.sampleWritten = this.jhipsterConfig.sampleWritten;
        await this.writeFiles({
          sections: files,
          context: this.application,
        });
        this.jhipsterConfig.sampleWritten = true;
      },
      async writingGenerators() {
        if (!this.application[GENERATORS]) return;
        for (const generator of Object.keys(this.application[GENERATORS])) {
          const subGeneratorStorage = this.getSubGeneratorStorage(generator);
          const subGeneratorConfig = subGeneratorStorage.getAll();
          const priorities = (subGeneratorConfig[PRIORITIES] || []).map(priority => ({
            name: priority,
            asTaskGroup: `as${upperFirst(priority)}TaskGroup`,
            constant: `${snakeCase(priority).toUpperCase()}`,
          }));
          const customGenerator = !Object.values(GENERATOR_LIST).includes(generator);
          const jhipsterGenerator = customGenerator || subGeneratorConfig.sbs ? 'base-application' : generator;
          const subTemplateData = {
            js: this.application.js,
            application: this.application,
            ...defaultSubGeneratorConfig(),
            ...subGeneratorConfig,
            generator,
            customGenerator,
            jhipsterGenerator,
            subGenerator: generator,
            generatorClass: upperFirst(camelCase(jhipsterGenerator)),
            priorities,
          };
          await this.writeFiles({
            sections: generatorFiles,
            context: subTemplateData,
          });
          subGeneratorStorage.set(WRITTEN, true);
        }
      },
    };
  }

  get [BaseGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      packageJson() {
        if (this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) return;
        const { packagejs } = this.application;
        const mainDependencies = {
          ...packagejs.dependencies,
          ...packagejs.devDependencies,
        };
        this.loadNodeDependenciesFromPackageJson(
          mainDependencies,
          this.fetchFromInstalledJHipster('generate-blueprint/resources/package.json'),
        );
        this.packageJson.merge({
          name: `generator-jhipster-${this.jhipsterConfig.baseName}`,
          keywords: ['yeoman-generator', 'jhipster-blueprint', BLUEPRINT_API_VERSION],
          type: 'module',
          files: ['generators'],
          scripts: {
            ejslint: 'ejslint generators/**/*.ejs',
            lint: 'eslint .',
            'lint-fix': 'npm run ejslint && npm run lint -- --fix',
            pretest: 'npm run prettier-check && npm run lint',
            test: 'vitest run',
            'update-snapshot': 'vitest run --update',
            vitest: 'vitest',
          },
          devDependencies: {
            'ejs-lint': `${mainDependencies['ejs-lint']}`,
            eslint: `${mainDependencies.eslint}`,
            'eslint-config-prettier': `${mainDependencies['eslint-config-prettier']}`,
            'eslint-plugin-import': `${mainDependencies['eslint-plugin-import']}`,
            'eslint-plugin-prettier': `${mainDependencies['eslint-plugin-prettier']}`,
            vitest: mainDependencies.vitest,
            prettier: `${mainDependencies.prettier}`,
            /*
             * yeoman-test version is loaded through generator-jhipster peer dependency.
             * generator-jhipster uses a fixed version, blueprints must set a compatible range.
             */
            'yeoman-test': '>=8.2.0',
          },
          engines: {
            node: packagejs.engines.node,
          },
        });
      },
      addCliToPackageJson() {
        if (!this.jhipsterConfig.cli || this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) return;
        const { cliName } = this.application;
        this.packageJson.merge({
          bin: {
            [cliName]: 'cli/cli.cjs',
          },
          files: ['cli', 'generators'],
        });
      },
      addGeneratorJHipsterDependency() {
        if (this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) return;
        const { packagejs } = this.application;
        if (this.jhipsterConfig.dynamic) {
          this.packageJson.merge({
            devDependencies: {
              'generator-jhipster': `${packagejs.version}`,
            },
            peerDependencies: {
              'generator-jhipster': `^${packagejs.version}`,
            },
          });
        } else {
          this.packageJson.merge({
            dependencies: {
              'generator-jhipster': `${packagejs.version}`,
            },
          });
        }
      },
    });
  }

  get [BaseGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get postInstall() {
    return {
      async addSnapshot() {
        const { [LOCAL_BLUEPRINT_OPTION]: localBlueprint } = this.jhipsterConfig;
        const {
          skipInstall,
          skipGit,
          existed,
          [GENERATE_SNAPSHOTS]: generateSnapshots = !localBlueprint && !skipInstall && !skipGit && !existed,
        } = this.options;
        if (!generateSnapshots) return;

        try {
          if (this.options[LINK_JHIPSTER_DEPENDENCY]) {
            this.log.verboseInfo('Linking generator-jhipster');
            await this.spawnCommand('npm', ['link', 'generator-jhipster'], { stdio: 'inherit' });
          }

          // Generate snapshots to add to git.
          this.log.verboseInfo(`
This is a new blueprint, executing '${chalk.yellow('npm run update-snapshot')}' to generate snapshots and commit to git.`);
          await this.spawnCommand('npm', ['run', 'update-snapshot']);
        } catch (error) {
          if (generateSnapshots !== undefined) {
            // We are forcing to generate snapshots fail the generation.
            throw error;
          }
          this.log.warn('Fail to generate snapshots');
        }
      },
    };
  }

  get [BaseGenerator.POST_INSTALL]() {
    return this.delegateTasksToBlueprint(() => this.postInstall);
  }

  get end() {
    return {
      end() {
        if (this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) return;

        this.log.log(`${chalk.bold.green('##### USAGE #####')}
To begin to work:
- launch: ${chalk.yellow.bold('npm install')}
- link: ${chalk.yellow.bold('npm link')}
- link JHipster: ${chalk.yellow.bold('npm link generator-jhipster')}
- test your module in a JHipster project:
    - create a new directory and go into it
    - link the blueprint: ${chalk.yellow.bold(`npm link generator-jhipster-${this.moduleName}`)}
    - launch JHipster with flags: ${chalk.yellow.bold(`jhipster --blueprints ${this.moduleName}`)}
- then, come back here, and begin to code!
`);
      },
    };
  }

  get [BaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  getSubGeneratorStorage(subGenerator) {
    return this.config.createStorage(`${GENERATORS}.${subGenerator}`);
  }

  validateGitHubName(input) {
    if (/^([a-zA-Z0-9]+)(-([a-zA-Z0-9])+)*$/.test(input) && input !== '') return true;
    return 'Your username is mandatory, cannot contain special characters or a blank space';
  }

  validateModuleName(input) {
    return /^[a-zA-Z0-9-]+$/.test(input)
      ? true
      : 'Your blueprint name is mandatory, cannot contain special characters or a blank space, using the default name instead';
  }
}
