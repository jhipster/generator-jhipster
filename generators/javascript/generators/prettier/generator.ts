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
import { packageJson } from '../../../../lib/index.js';
import BaseApplicationGenerator from '../../../base-application/index.js';

export default class PrettierGenerator extends BaseApplicationGenerator {
  fromInit?: boolean;
  prettierConfigFile!: string;
  monorepositoryRoot?: boolean;

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      if (!this.options.fromInit) {
        await this.dependsOnBootstrapApplication();
      }
      await this.dependsOnJHipster('jhipster:javascript:bootstrap');
    }
  }

  get loading() {
    return this.asLoadingTaskGroup({
      loadNodeDependencies({ application }) {
        this.loadNodeDependencies(application.nodeDependencies, {
          prettier: packageJson.dependencies.prettier,
          'prettier-plugin-java': packageJson.dependencies['prettier-plugin-java'],
          'prettier-plugin-packagejson': packageJson.dependencies['prettier-plugin-packagejson'],
        });
      },
      loadDefaults({ application, applicationDefaults }) {
        applicationDefaults({
          prettierFolders: ',**/',
          prettierExtensions: 'md,json,yml,js,cjs,mjs,ts,cts,mts',
        });

        application.addPrettierExtensions = (extensions: string[]) => {
          const currentExtensions = application.prettierExtensions!.split(',');
          const extensionsToAdd = extensions.filter(ext => !currentExtensions.includes(ext));
          if (extensionsToAdd.length > 0) {
            application.prettierExtensions = `${application.prettierExtensions},${extensionsToAdd.join(',')}`;
          }
        };
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      source({ source }) {
        source.mergePrettierConfig = config => this.mergeDestinationYaml(this.prettierConfigFile, config);
        // `.prettierignore` file is only supported in the root of a project refer to https://github.com/prettier/prettier/issues/4081.
        // TODO make it aware of the monorepository root path
        source.addPrettierIgnore = newContent => this.editFile('.prettierignore', content => `${content}\n${newContent}`);
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        await this.writeFiles({
          blocks: [
            { templates: [{ sourceFile: '.prettierrc.yml.jhi', destinationFile: `${this.prettierConfigFile}.jhi` }] },
            { templates: ['.prettierignore.jhi'] },
          ],
          context: application,
        });
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addPrettierDependencies({ application }) {
        const { clientBundlerWebpack, clientFrameworkBuiltIn, clientFrameworkNo, monorepository, nodeDependencies, prettierExtensions } =
          application;
        this.packageJson.merge({
          devDependencies: {
            prettier: nodeDependencies.prettier,
          },
        });
        if (monorepository && !this.monorepositoryRoot) return;

        if (this.fromInit) {
          this.packageJson.merge({
            scripts: {
              'prettier-check': 'prettier --check "{,**/}*.{md,json,yml,html,cjs,mjs,js,cts,mts,ts,tsx,css,scss,vue,java}"',
              'prettier-format': 'prettier --write "{,**/}*.{md,json,yml,html,cjs,mjs,js,cts,mts,ts,tsx,css,scss,vue,java}"',
            },
          });
        } else if (clientFrameworkBuiltIn || clientFrameworkNo) {
          const folders = ['', 'src/**/', ...(clientBundlerWebpack ? ['webpack/'] : []), '.blueprint/**/'];
          this.packageJson.merge({
            scripts: {
              'prettier:check': `prettier --check "{${folders.join(',')}}*.{${prettierExtensions}}"`,
              'prettier:format': `prettier --write "{${folders.join(',')}}*.{${prettierExtensions}}"`,
            },
          });
        }
      },
      addPrettierPackagejson({ application, source }) {
        source.mergePrettierConfig!({ plugins: ['prettier-plugin-packagejson'] });
        this.packageJson.merge({
          devDependencies: {
            'prettier-plugin-packagejson': application.nodeDependencies['prettier-plugin-packagejson'],
          },
        });
      },
    });
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
