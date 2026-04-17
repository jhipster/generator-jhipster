/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { getPackageRoot } from '../../../../lib/index.ts';
import { BLUEPRINT_API_VERSION } from '../../../generator-constants.ts';
import { GENERATE_SNAPSHOTS } from '../../constants.ts';
import { GenerateBlueprintBaseGenerator } from '../../generator.ts';

const defaultPublishedFiles = ['generators', '!**/__*', '!**/*.snap', '!**/*.spec.?(c|m)js'];

export default class StandaloneBlueprintGenerator extends GenerateBlueprintBaseGenerator {
  recreatePackageLock!: boolean;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    await this.dependsOnBootstrap('generate-blueprint');
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      requiredConfig() {
        this.jhipsterConfig.defaultCommand ??= 'generate-blueprint';
      },
    });
  }

  get [GenerateBlueprintBaseGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writeBlueprintFiles({ application }) {
        await this.writeFiles({
          blocks: [
            {
              templates: [
                '.github/workflows/generator.yml',
                '.gitignore.jhi.blueprint',
                '.prettierignore.jhi.blueprint',
                'eslint.config.ts.jhi.blueprint',
                'README.md',
                'tsconfig.json',
                'vitest.config.ts',
                'vitest.test-setup.ts',
                '.blueprint/cli/commands.mjs',
                '.blueprint/generate-sample/command.mjs',
                '.blueprint/generate-sample/generator.mjs',
                '.blueprint/generate-sample/index.mjs',
                // Always write cli for devBlueprint usage
                'cli/cli.cjs',
                { sourceFile: 'cli/cli-customizations.cjs', override: false },
              ],
            },
            {
              condition: ctx => ctx.githubWorkflows,
              templates: [
                '.blueprint/github-build-matrix/command.mjs',
                '.blueprint/github-build-matrix/generator.mjs',
                '.blueprint/github-build-matrix/generator.spec.mjs',
                '.blueprint/github-build-matrix/index.mjs',
              ],
            },
            {
              condition: ctx => ctx.githubWorkflows && !ctx.skipWorkflows,
              templates: ['.github/workflows/build-cache.yml', '.github/workflows/samples.yml'],
            },
            {
              condition: ctx => !ctx.sampleWritten,
              templates: ['.blueprint/generate-sample/templates/samples/sample.jdl'],
            },
          ],
          context: application,
        });
      },
    });
  }

  get [GenerateBlueprintBaseGenerator.WRITING]() {
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
        const { jhipsterPackageJson } = application;
        const mainDependencies: Record<string, string> = {
          ...jhipsterPackageJson.dependencies,
          ...jhipsterPackageJson.devDependencies,
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
            'ejs-lint': mainDependencies['ejs-lint'],
            eslint: mainDependencies.eslint,
            jiti: mainDependencies.jiti,
            globals: mainDependencies.globals,
            vitest: mainDependencies.vitest,
            prettier: mainDependencies.prettier,
            /*
             * yeoman-test version is loaded through generator-jhipster peer dependency.
             * generator-jhipster uses a fixed version, blueprints must set a compatible range.
             */
            'yeoman-test': '>=10',
          },
          engines: {
            node: jhipsterPackageJson.engines.node,
          },
        });
      },
      addCliToPackageJson({ application }) {
        const { cli, cliName } = application;
        if (!cli || !cliName) return;
        this.packageJson.merge({
          bin: {
            [cliName]: 'cli/cli.cjs',
          },
          files: ['cli', ...defaultPublishedFiles],
        });
      },
      addGeneratorJHipsterDependency({ application }) {
        const { jhipsterPackageJson } = application;
        const exactDependency = {
          'generator-jhipster':
            this.options.linkJhipsterDependency ?
              `file:${this.relativeDir(this.destinationRoot(), getPackageRoot())}`
            : jhipsterPackageJson.version,
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
            dependencies: application.gitDependency ? { 'generator-jhipster': application.gitDependency } : exactDependency,
            engines: this.jhipsterConfig.caret ? caretDependency : exactDependency,
          });
        }
      },
    });
  }

  get [GenerateBlueprintBaseGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }

  get postInstall() {
    return this.asPostInstallTaskGroup({
      async addSnapshot({ control }) {
        const {
          skipInstall,
          skipGit,
          [GENERATE_SNAPSHOTS]: generateSnapshots = !skipInstall && !skipGit && !control.existingProject,
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

  get [GenerateBlueprintBaseGenerator.POST_INSTALL]() {
    return this.delegateTasksToBlueprint(() => this.postInstall);
  }

  get end() {
    return this.asEndTaskGroup({
      end({ application }) {
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

  get [GenerateBlueprintBaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }
}
