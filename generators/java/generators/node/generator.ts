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
import type { ExecaError } from 'execa';
import BaseApplicationGenerator from '../../../base-application/index.js';

export default class NodeGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplication();
      await this.dependsOnJHipster('jhipster:java:build-tool');
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async compose() {
        const { buildTool } = this.jhipsterConfigWithDefaults;
        if (buildTool === 'maven') {
          await this.composeWithJHipster('jhipster:maven:frontend-plugin');
        } else if (buildTool === 'gradle') {
          await this.composeWithJHipster('jhipster:gradle:node-gradle');
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      async javaNodeBuildFiles({ application }) {
        application.javaNodeBuildFiles ??= [];
        const {
          clientFrameworkAngular,
          clientFrameworkReact,
          clientFrameworkVue,
          clientFrameworkBuiltIn,
          clientBundlerVite,
          clientBundlerWebpack,
          microfrontend,
          srcMainWebapp,
          javaNodeBuildFiles,
        } = application;

        javaNodeBuildFiles.push(
          `${srcMainWebapp}**/*.*`,
          'target/classes/static/**/*.*',
          'package-lock.json',
          'package.json',
          'tsconfig.json',
        );
        if (clientFrameworkAngular) {
          javaNodeBuildFiles.push('tsconfig.app.json');
        } else if (clientFrameworkReact) {
          javaNodeBuildFiles.push('.postcss.config.js');
        } else if (clientFrameworkVue) {
          javaNodeBuildFiles.push('.postcssrc.js', 'tsconfig.app.json');
          if (microfrontend) {
            javaNodeBuildFiles.push('module-federation.config.cjs');
          }
        }
        if (clientFrameworkBuiltIn) {
          if (clientBundlerWebpack) {
            javaNodeBuildFiles.push('webpack/');
          } else if (clientBundlerVite) {
            javaNodeBuildFiles.push('vite.config.mts');
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get postPreparing() {
    return this.asPostPreparingTaskGroup({
      useNpmWrapper({ application }) {
        if (application.useNpmWrapper) {
          this.useNpmWrapperInstallTask();
        }
      },
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.postPreparing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        await this.writeFiles({
          blocks: [
            {
              condition: (ctx: any) => ctx.useNpmWrapper,
              transform: false,
              templates: ['npmw', 'npmw.cmd'],
            },
          ],
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  useNpmWrapperInstallTask() {
    this.setFeatures({
      customInstallTask: async (preferredPm, defaultInstallTask) => {
        const buildTool = this.jhipsterConfigWithDefaults.buildTool;
        if ((preferredPm && preferredPm !== 'npm') || this.jhipsterConfig.skipClient || (buildTool !== 'gradle' && buildTool !== 'maven')) {
          await defaultInstallTask();
          return;
        }

        const npmCommand = process.platform === 'win32' ? 'npmw' : './npmw';
        try {
          await this.spawn(npmCommand, ['install'], { preferLocal: true });
        } catch (error: unknown) {
          this.log.error(
            chalk.red(`Error executing '${npmCommand} install', please execute it yourself. (${(error as ExecaError).shortMessage})`),
          );
        }
      },
    });
  }
}
