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
import chalk from 'chalk';
import lodash from 'lodash';

import BaseGenerator from '../base/index.mjs';
import { PRIORITY_NAMES_LIST as BASE_PRIORITY_NAMES_LIST } from '../base/priorities.mjs';

import {
  options,
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
} from './constants.mjs';

import * as GENERATOR_LIST from '../generator-list.mjs';
import { files, generatorFiles } from './files.mjs';
import { packageJson } from '../../lib/index.mjs';
import { SKIP_COMMIT_HOOK } from '../init/constants.mjs';

const { camelCase, upperFirst, snakeCase } = lodash;
const { GENERATOR_PROJECT_NAME, GENERATOR_INIT, GENERATOR_GENERATE_BLUEPRINT } = GENERATOR_LIST;

export default class extends BaseGenerator {
  constructor(args, opts, features) {
    super(args, opts, { jhipsterModular: true, unique: 'namespace', ...features });

    // Register options available to cli.
    if (!this.fromBlueprint) {
      this.registerCommonOptions();
    }

    this.jhipsterOptions(options());

    if (this.options.help) return;

    if (this[ALL_GENERATORS]) {
      this.config.set(allGeneratorsConfig());
    }
    if (this.options.defaults) {
      this.config.defaults(defaultConfig({ config: this.jhipsterConfig }));
    }
  }

  /** @inheritdoc */
  async getPossibleDependencies() {
    return [GENERATOR_PROJECT_NAME, GENERATOR_INIT];
  }

  async _beforeQueue() {
    if (!this.fromBlueprint) {
      await this.dependsOnJHipster(GENERATOR_PROJECT_NAME);
      await this.composeWithBlueprints(GENERATOR_GENERATE_BLUEPRINT);
    }
  }

  get initializing() {
    return {
      loadRuntimeOptions() {
        this.loadRuntimeOptions();
      },
    };
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
        if (!this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) {
          this.config.defaults({
            [SKIP_COMMIT_HOOK]: true,
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
        await this.composeWithJHipster(GENERATOR_INIT);
      },
    };
  }

  get [BaseGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get loading() {
    return {
      createContext() {
        this.application = { ...defaultConfig(), ...this.config.getAll() };
      },
      async load() {
        this.application.packagejs = packageJson;
      },
    };
  }

  get [BaseGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return {
      prepareCommands() {
        this.application.commands = [];
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
    };
  }

  get [BaseGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return {
      async writing() {
        await this.writeFiles({
          sections: files,
          context: this.application,
        });
      },
      async writingGenerators() {
        if (!this.application[GENERATORS]) return;
        for (const generator of Object.keys(this.application[GENERATORS])) {
          const subGeneratorStorage = this.getSubGeneratorStorage(generator);
          const subGeneratorConfig = subGeneratorStorage.getAll();
          const priorities = (subGeneratorConfig[PRIORITIES] || []).map(priority => ({
            name: priority,
            constant: `${snakeCase(priority).toUpperCase()}`,
          }));
          const customGenerator = !Object.values(GENERATOR_LIST).includes(generator);
          const jhipsterGenerator = customGenerator ? 'base' : generator;
          const subTemplateData = {
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
    return {
      packageJson() {
        if (this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) return;
        const { packagejs } = this.application;
        this.packageJson.merge({
          name: `generator-jhipster-${this.jhipsterConfig.baseName}`,
          keywords: ['yeoman-generator', 'jhipster-blueprint', 'jhipster-7'],
          type: 'module',
          files: ['generators'],
          scripts: {
            ejslint: "ejslint generators/**/*.ejs && ejslint generators/**/*.ejs -d '&'",
            lint: 'eslint .',
            'lint-fix': 'npm run ejslint && npm run lint -- --fix',
            mocha: 'mocha generators --no-insight --forbid-only',
            'prettier-format': 'prettier --write "{,**/}*.{md,json,yml,html,js,cjs,mjs,ts,tsx,css,scss,vue,java}"',
            pretest: 'npm run prettier-check && npm run lint',
            test: 'npm run mocha --',
            'update-snapshot': 'npm run mocha -- --no-parallel --updateSnapshot',
          },
          dependencies: {
            chalk: `${packagejs.dependencies.chalk}`,
          },
          devDependencies: {
            'ejs-lint': `${packagejs.devDependencies['ejs-lint']}`,
            eslint: `${packagejs.devDependencies.eslint}`,
            'eslint-config-airbnb-base': `${packagejs.devDependencies['eslint-config-airbnb-base']}`,
            'eslint-config-prettier': `${packagejs.devDependencies['eslint-config-prettier']}`,
            'eslint-plugin-import': `${packagejs.devDependencies['eslint-plugin-import']}`,
            'eslint-plugin-mocha': `${packagejs.devDependencies['eslint-plugin-mocha']}`,
            'eslint-plugin-prettier': `${packagejs.devDependencies['eslint-plugin-prettier']}`,
            mocha: `${packagejs.devDependencies.mocha}`,
            'mocha-expect-snapshot': `${packagejs.devDependencies['mocha-expect-snapshot']}`,
            prettier: `${packagejs.dependencies.prettier}`,
            'yeoman-test': `${packagejs.devDependencies['yeoman-test']}`,
          },
          engines: {
            node: '>=16.13.0',
          },
          imports: {
            '#test-utils': './test/utils.mjs',
          },
        });
      },
      addCliToPackageJson() {
        if (!this.jhipsterConfig.cli || this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) return;
        const { baseName, cliName = `jhipster-${baseName}` } = this.application;
        this.packageJson.merge({
          bin: {
            [cliName]: `cli/cli.${this.jhipsterConfig.js ? '' : 'm'}js`,
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
    };
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

        // Generate snapshots to add to git.
        this.log(`
This is a new blueprint, executing '${chalk.yellow('npm run update-snapshot')}' to generate snapshots and commit to git.`);
        try {
          if (this.options[LINK_JHIPSTER_DEPENDENCY]) {
            await this.spawnCommand('npm', ['link', 'generator-jhipster']);
          }
          await this.spawnCommand('npm', ['run', 'update-snapshot']);
        } catch (error) {
          if (generateSnapshots !== undefined) {
            // We are forcing to generate snapshots fail the generation.
            throw error;
          }
          this.log('Fail to generate snapshots');
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

        this.log(`${chalk.bold.green('##### USAGE #####')}
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
