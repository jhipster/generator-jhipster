/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { rm } from 'node:fs/promises';

import chalk from 'chalk';
import { camelCase, snakeCase, upperFirst } from 'lodash-es';
import type { Storage } from 'yeoman-generator';

import { getGeneratorNamespaces, getPackageRoot } from '../../lib/index.ts';
import { PRIORITY_NAMES_LIST as BASE_PRIORITY_NAMES_LIST } from '../base-core/priorities.ts';
import BaseSimpleApplicationGenerator from '../base-simple-application/index.ts';
import { BLUEPRINT_API_VERSION } from '../generator-constants.js';

import {
  DYNAMIC,
  GENERATE_SNAPSHOTS,
  LOCAL_BLUEPRINT_OPTION,
  PRIORITIES,
  WRITTEN,
  allGeneratorsConfig,
  defaultConfig,
  defaultSubGeneratorConfig,
  prompts,
  requiredConfig,
  subGeneratorPrompts,
} from './constants.ts';
import { files, generatorFiles } from './files.ts';
import type {
  Application as GenerateBlueprintApplication,
  Config as GenerateBlueprintConfig,
  Features as GenerateBlueprintFeatures,
  Options as GenerateBlueprintOptions,
} from './types.ts';

const defaultPublishedFiles = ['generators', '!**/__*', '!**/*.snap', '!**/*.spec.?(c|m)js'];

export default class extends BaseSimpleApplicationGenerator<
  GenerateBlueprintApplication,
  GenerateBlueprintConfig,
  GenerateBlueprintOptions
> {
  recreatePackageLock!: boolean;
  skipWorkflows!: boolean;
  ignoreExistingGenerators!: boolean;
  gitDependency!: string;
  allGenerators!: boolean;

  constructor(args?: string[], options?: GenerateBlueprintOptions, features?: GenerateBlueprintFeatures) {
    super(args, options, { storeJHipsterVersion: true, ...features });
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('ci-cd');

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('javascript-simple-application');
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      async loadOptions() {
        if (this.allGenerators) {
          this.config.set(allGeneratorsConfig());
        }
        if (this.options.defaults) {
          this.config.defaults(defaultConfig({ config: this.jhipsterConfig }));
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      async prompting() {
        await this.prompt(prompts(), this.config);
      },
      async eachSubGenerator() {
        const { localBlueprint } = this.jhipsterConfig;
        const { allPriorities } = this.options;
        const subGenerators = (this.jhipsterConfig.subGenerators ?? []) as string[];
        for (const subGenerator of subGenerators) {
          const subGeneratorStorage = this.getSubGeneratorStorage(subGenerator) as Storage<Record<string, any>>;
          if (allPriorities) {
            subGeneratorStorage.defaults({ [PRIORITIES]: BASE_PRIORITY_NAMES_LIST });
          }
          await this.prompt(subGeneratorPrompts({ subGenerator, localBlueprint, additionalSubGenerator: false }), subGeneratorStorage);
        }
      },
      async eachAdditionalSubGenerator() {
        const { localBlueprint } = this.jhipsterConfig;
        const { allPriorities } = this.options;
        const additionalSubGenerators = this.jhipsterConfig.additionalSubGenerators ?? '';
        for (const subGenerator of additionalSubGenerators
          .split(',')
          .map(sub => sub.trim())
          .filter(Boolean)) {
          const subGeneratorStorage = this.getSubGeneratorStorage(subGenerator) as Storage<Record<string, any>>;
          if (allPriorities) {
            subGeneratorStorage.defaults({ [PRIORITIES]: BASE_PRIORITY_NAMES_LIST });
          }
          await this.prompt(subGeneratorPrompts({ subGenerator, localBlueprint, additionalSubGenerator: true }), subGeneratorStorage);
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      requiredConfig() {
        this.config.defaults(requiredConfig());
      },
      conditionalConfig() {
        if (this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) {
          this.config.defaults({
            [DYNAMIC]: true,
            js: false,
          });
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get composing() {
    return this.asComposingTaskGroup({
      async compose() {
        if (this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) return;
        const initGenerator = await this.composeWithJHipster('init');
        initGenerator.generateReadme = false;
      },
    });
  }

  get [BaseSimpleApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      async loadDefaults({ applicationDefaults }) {
        applicationDefaults(this.config.getAll(), defaultConfig(), { commands: [] });
      },
    });
  }

  get [BaseSimpleApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareCommands({ application }) {
        if (!application.generators) return;
        for (const generator of Object.keys(application.generators)) {
          const subGeneratorConfig = this.getSubGeneratorStorage(generator).getAll();
          if (subGeneratorConfig.command) {
            application.commands.push(generator);
          }
        }
      },
      preparePath({ application }) {
        application.blueprintsPath = application[LOCAL_BLUEPRINT_OPTION] ? '.blueprint/' : 'generators/';
      },
      prepare({ application }) {
        const { cli, cliName, baseName } = application;
        application.githubRepository = this.jhipsterConfig.githubRepository ?? `jhipster/generator-jhipster-${baseName}`;
        application.blueprintMjsExtension = application.js ? 'js' : 'mjs';
        if (cli) {
          application.cliName = cliName ?? `jhipster-${baseName}`;
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async cleanup({ control }) {
        await control.cleanupFiles({
          '8.5.1': ['.eslintrc.json'],
          '8.7.2': ['.eslintignore', 'vitest.test-setup.ts'],
          '8.7.4': ['.blueprint/generate-sample/get-samples.mjs', '.blueprint/github-build-matrix/build-matrix.mjs'],
        });
      },
      async writing({ application }) {
        application.sampleWritten = this.jhipsterConfig.sampleWritten;
        const { skipWorkflows, ignoreExistingGenerators } = this;
        await this.writeFiles({
          sections: files,
          context: {
            skipWorkflows,
            ignoreExistingGenerators,
            ...application,
          },
        });
        this.jhipsterConfig.sampleWritten = true;
      },
      async writingGenerators({ application }) {
        if (!application.generators) return;
        const { skipWorkflows, ignoreExistingGenerators } = this;
        for (const generator of Object.keys(application.generators)) {
          const subGeneratorStorage = this.getSubGeneratorStorage(generator);
          const subGeneratorConfig = subGeneratorStorage.getAll();
          const priorities: { name: string; asTaskGroup: string; constant: string }[] = (subGeneratorConfig[PRIORITIES] || []).map(
            (priority: string) => ({
              name: priority,
              asTaskGroup: `as${upperFirst(priority)}TaskGroup`,
              constant: `${snakeCase(priority).toUpperCase()}`,
            }),
          );
          const customGenerator = !getGeneratorNamespaces().includes(generator);
          const jhipsterGenerator = customGenerator || subGeneratorConfig.sbs ? 'base-application' : generator;
          const subTemplateData = {
            ...application,
            skipWorkflows,
            ignoreExistingGenerators,
            application,
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
    });
  }

  get [BaseSimpleApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      upgrade({ application, control }) {
        if (!application.generators) return;
        if (!control.isJhipsterVersionLessThan('8.7.2')) return;
        for (const generator of Object.keys(application.generators)) {
          const commandFile = `${application.blueprintsPath}${generator}/command.${application.blueprintMjsExtension}`;
          this.editFile(commandFile, { ignoreNonExisting: true }, content =>
            content
              .replace(
                `/**
 * @type {import('generator-jhipster').JHipsterCommandDefinition}
 */`,
                `import { asCommand } from 'generator-jhipster';
`,
              )
              .replace('const command = ', 'export default asCommand(')
              .replace(
                `
};`,
                '});',
              )
              .replace('export default command;', ''),
          );

          const generatorSpec = `${application.blueprintsPath}${generator}/generator.spec.${application.blueprintMjsExtension}`;
          this.editFile(generatorSpec, { ignoreNonExisting: true }, content =>
            content.replaceAll(/blueprint: '([\w-]*)'/g, "blueprint: ['$1']"),
          );
        }
      },
      packageJson({ application }) {
        if (this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) return;
        const { jhipsterPackageJson } = application;
        const mainDependencies: Record<string, string> = {
          ...jhipsterPackageJson.dependencies!,
          ...jhipsterPackageJson.devDependencies!,
        } as Record<string, string>;
        this.loadNodeDependenciesFromPackageJson(
          mainDependencies,
          this.fetchFromInstalledJHipster('generate-blueprint/resources/package.json'),
        );
        this.packageJson.merge({
          name: `generator-jhipster-${application.baseName}`,
          keywords: ['yeoman-generator', 'jhipster-blueprint', BLUEPRINT_API_VERSION],
          files: defaultPublishedFiles,
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
            jiti: `${mainDependencies.jiti}`,
            globals: `${mainDependencies.globals}`,
            vitest: mainDependencies.vitest,
            prettier: `${mainDependencies.prettier}`,
            /*
             * yeoman-test version is loaded through generator-jhipster peer dependency.
             * generator-jhipster uses a fixed version, blueprints must set a compatible range.
             */
            'yeoman-test': '>=10',
          },
          engines: {
            node: jhipsterPackageJson.engines!.node!,
          },
        });
      },
      addCliToPackageJson({ application }) {
        const { cli, cliName } = application;
        if (!cli || !cliName || this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) return;
        this.packageJson.merge({
          bin: {
            [cliName!]: 'cli/cli.cjs',
          },
          files: ['cli', ...defaultPublishedFiles],
        });
      },
      addGeneratorJHipsterDependency({ application }) {
        if (this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) return;
        const { jhipsterPackageJson } = application;
        const exactDependency = {
          'generator-jhipster': this.options.linkJhipsterDependency
            ? `file:${this.relativeDir(this.destinationRoot(), getPackageRoot())}`
            : `${jhipsterPackageJson.version}`,
        };
        const caretDependency = {
          'generator-jhipster': `^${jhipsterPackageJson.version}`,
        };
        if (this.jhipsterConfig.dynamic) {
          this.packageJson.merge({
            devDependencies: exactDependency,
            peerDependencies: caretDependency,
            engines: caretDependency,
          });
        } else {
          this.packageJson.merge({
            dependencies: this.gitDependency ? { 'generator-jhipster': this.gitDependency } : exactDependency,
            engines: this.jhipsterConfig.caret ? caretDependency : exactDependency,
          });
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get postInstall() {
    return this.asPostInstallTaskGroup({
      async addSnapshot({ control }) {
        const { [LOCAL_BLUEPRINT_OPTION]: localBlueprint } = this.jhipsterConfig;
        const {
          skipInstall,
          skipGit,
          [GENERATE_SNAPSHOTS]: generateSnapshots = !localBlueprint && !skipInstall && !skipGit && !control.existingProject,
        } = this.options;

        if (this.recreatePackageLock) {
          await rm(this.destinationPath('package-lock.json'), { force: true });
          await rm(this.destinationPath('node_modules'), { force: true, recursive: true });
          await this.spawn('npm', ['install'], { stdio: 'inherit' });
        }

        if (generateSnapshots) {
          try {
            // Generate snapshots to add to git.
            this.log.verboseInfo(`
This is a new blueprint, executing '${chalk.yellow('npm run update-snapshot')}' to generate snapshots and commit to git.`);
            await this.spawn('npm', ['run', 'update-snapshot']);
          } catch (error) {
            if (generateSnapshots !== undefined) {
              // We are forcing to generate snapshots fail the generation.
              throw error;
            }
            this.log.warn('Fail to generate snapshots');
          }
        }

        if (control.jhipsterOldVersion) {
          // Apply prettier and eslint to fix non generated files on upgrade.
          try {
            await this.spawn('npm', ['run', 'prettier-format']);
          } catch {
            // Ignore error
          }

          try {
            await this.spawn('npm', ['run', 'lint-fix']);
          } catch {
            // Ignore error
          }
        }
      },
    });
  }

  get [BaseSimpleApplicationGenerator.POST_INSTALL]() {
    return this.delegateTasksToBlueprint(() => this.postInstall);
  }

  get end() {
    return this.asEndTaskGroup({
      end({ application }) {
        if (this.jhipsterConfig[LOCAL_BLUEPRINT_OPTION]) return;

        this.log.log(`${chalk.bold.green('##### USAGE #####')}
To begin to work:
- launch: ${chalk.yellow.bold('npm install')}
- link: ${chalk.yellow.bold('npm link')}
- link JHipster: ${chalk.yellow.bold('npm link generator-jhipster')}
- test your module in a JHipster project:
    - create a new directory and go into it
    - link the blueprint: ${chalk.yellow.bold(`npm link generator-jhipster-${application.baseName}`)}
    - launch JHipster with flags: ${chalk.yellow.bold(`jhipster --blueprints ${application.baseName}`)}
- then, come back here, and begin to code!
`);
      },
    });
  }

  get [BaseSimpleApplicationGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  getSubGeneratorStorage(subGenerator: string) {
    return this.config.createStorage<Record<string, any>>(`generators.${subGenerator}`);
  }

  validateGitHubName(input: string): boolean | string {
    if (/^([a-zA-Z0-9]+)(-([a-zA-Z0-9])+)*$/.test(input) && input !== '') return true;
    return 'Your username is mandatory, cannot contain special characters or a blank space';
  }

  validateModuleName(input: string): boolean | string {
    return /^[a-zA-Z0-9-]+$/.test(input)
      ? true
      : 'Your blueprint name is mandatory, cannot contain special characters or a blank space, using the default name instead';
  }
}
