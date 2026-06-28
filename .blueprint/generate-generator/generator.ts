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

import { camelCase, upperFirst } from 'lodash-es';

import EnvironmentBuilder from '../../cli/environment-builder.ts';
import BaseCoreGenerator from '../../generators/base-core/index.ts';

export default class extends BaseCoreGenerator {
  generatorNamespace!: string;

  async beforeQueue() {
    await this.dependsOnJHipster('bootstrap');
  }

  get [BaseCoreGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async writing() {
        const { generatorNamespace } = this;
        const namespaceParts = generatorNamespace.split('/');
        const devBlueprint = namespaceParts[0] === '@dev-blueprint';
        if (devBlueprint) {
          namespaceParts.shift();
        }
        await this.writeFiles({
          sections: {
            generatorFiles: [
              {
                renameTo: (data, filePath) => `${data.generatorPath}/${filePath}`,
                templates: ['command.ts', 'generator.spec.ts', 'generator.ts', 'index.ts'],
              },
            ],
          },
          context: {
            generatorNamespace,
            generatorClass: upperFirst(camelCase([...namespaceParts].pop())),
            generatorPath: `${devBlueprint ? '.blueprint' : 'generators'}/${namespaceParts.join('/generators/')}`,
            generatorRelativePath: devBlueprint ? '../../generators/' : '../'.repeat((namespaceParts.length - 1) * 2 + 1),
          },
        });
      },
    });
  }

  get [BaseCoreGenerator.END]() {
    return this.asAnyTaskGroup({
      async updateGenerators() {
        const envBuilder = new EnvironmentBuilder(this.env);
        await envBuilder.updateJHipsterGenerators();
        await this.composeWithJHipster('@jhipster/jhipster-dev:update-generators');
      },
    });
  }
}
