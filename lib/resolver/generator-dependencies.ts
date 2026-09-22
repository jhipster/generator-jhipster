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
import type { StoreGeneratorMeta } from 'yeoman-environment';

import type { JHipsterCommandDefinition } from '../command/types.ts';

export type GeneratorDependency = {
  /** Namespace as requested, `app`, `jhipster:spring-boot:cache` or `jhipster-foo:app` for a blueprint override. */
  namespace: string;
  meta: StoreGeneratorMeta;
  /** Set when the generator comes from a blueprint. */
  blueprintNamespace?: string;
  command?: JHipsterCommandDefinition;
};

export type ResolveGeneratorDependenciesOptions = {
  getGeneratorMeta: (namespace: string) => StoreGeneratorMeta | undefined;
  blueprintNamespaces?: string[];
  /** Namespace prefix of the generators without one; defaults to `jhipster`. */
  namespacePrefix?: string;
  /** Called for a generator that is not registered. */
  onMissing?: (namespace: string) => void;
};

type JHipsterModule = { command?: JHipsterCommandDefinition };

/**
 * Resolve the generators contributing options to a command the way the cli does: the generators, their `import`s
 * recursively, and the blueprint generators overriding them (a blueprint command with `override` replaces the
 * original). The result is ordered as the cli registers the options.
 *
 * Synchronous: the modules are loaded through `requireModule` of the store metas, which throws for a module that
 * cannot be required - a generator, of a blueprint too, has to be loadable with `require`.
 */
export const resolveGeneratorDependencies = (
  generatorNames: string[],
  { getGeneratorMeta, blueprintNamespaces = [], namespacePrefix = 'jhipster', onMissing }: ResolveGeneratorDependenciesOptions,
): GeneratorDependency[] => {
  const dependencies: GeneratorDependency[] = [];
  const isRegistered = (namespace: string) => dependencies.some(dependency => dependency.namespace === namespace);

  const register = ({ namespace, blueprintNamespace }: { namespace: string; blueprintNamespace?: string }) => {
    const meta = getGeneratorMeta(namespace.includes(':') ? namespace : `${namespacePrefix}:${namespace}`);
    if (!meta) {
      if (!blueprintNamespace) onMissing?.(namespace);
      return undefined;
    }
    const module = meta.requireModule?.() as JHipsterModule | undefined;
    dependencies.push({ namespace, meta, blueprintNamespace, command: module?.command });
    return module;
  };

  const lookup = ({ namespace, blueprintNamespace }: { namespace: string; blueprintNamespace?: string }) => {
    const lookupGeneratorAndImports = (options: { namespace: string; blueprintNamespace?: string }) => {
      const module = register(options);
      for (const imported of module?.command?.import ?? []) {
        lookup({ namespace: imported, blueprintNamespace: options.blueprintNamespace });
      }
      return module?.command?.override;
    };

    let overridden = false;
    if (!namespace.includes(':')) {
      for (const nextBlueprint of blueprintNamespaces) {
        const blueprintSubGenerator = `${nextBlueprint}:${namespace}`;
        if (
          !isRegistered(blueprintSubGenerator) &&
          lookupGeneratorAndImports({ namespace: blueprintSubGenerator, blueprintNamespace: nextBlueprint })
        ) {
          overridden = true;
        }
      }
    }
    if (!overridden && !isRegistered(namespace)) {
      lookupGeneratorAndImports({ namespace, blueprintNamespace });
    }
  };

  for (const generatorName of generatorNames) {
    lookup({ namespace: generatorName });
  }
  return dependencies;
};
