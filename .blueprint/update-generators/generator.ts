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
import { dirname } from 'node:path';

import BaseCoreGenerator from '../../generators/base-core/index.ts';
import { createNeedleCallback } from '../../generators/base-core/support/needles.ts';
import { getSourceRoot } from '../../lib/index.ts';
import { lookupGeneratorsWithNamespace } from '../../lib/utils/lookup.ts';

export default class UpdateGeneratorsGenerator extends BaseCoreGenerator {
  async beforeQueue() {
    await this.composeWith('jhipster:bootstrap');
  }

  get [BaseCoreGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async writing() {
        const generators = lookupGeneratorsWithNamespace().map(({ namespace, generator }) => ({
          namespace: `jhipster:${namespace}`,
          generator: getSourceRoot(generator),
        }));
        generators.sort((a, b) => {
          return a.namespace.localeCompare(b.namespace);
        });

        const contentToAdd = generators
          .map(({ namespace, generator }) => {
            if (namespace.startsWith('jhipster:base') && namespace.split(':').length === 2) {
              // Base generators cannot be composed with.
              return [];
            }
            const parts = namespace.split(':').length;
            const relativePath = this.relativeDir(this.templatePath('../../../generators/'), dirname(generator));

            const generateImport = (key: string) =>
              `${/[:-]/.test(key) ? `'${key}'` : key}: import('./${relativePath}generator.ts').default;`;
            return parts === 2
              ? [generateImport(namespace.replace('jhipster:', '')), generateImport(namespace)]
              : [generateImport(namespace)];
          })
          .flat();

        const generatorsWithBootstrap = generators
          .map(({ namespace }) => namespace)
          .filter(ns => ns.split(':').length > 2 && ns.endsWith(':bootstrap'))
          .map(ns => ns.replace(':bootstrap', '').replace('jhipster:', ''));

        this.editFile(
          this.templatePath('../../../generators/types.d.ts'),
          createNeedleCallback({
            needle: 'add-generator-by-namespace',
            contentToAdd,
          }),
          createNeedleCallback({
            needle: 'add-generator-with-bootstrap',
            contentToAdd: `export type GeneratorsWithBootstrap = '${generatorsWithBootstrap.join("' | '")}';`,
          }),
        );
      },
    });
  }
}
