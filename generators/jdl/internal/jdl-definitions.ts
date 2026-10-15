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

import { resolveCommand } from '../../../lib/command/resolve-command.ts';
import type { JDLApplicationConfig, JDLDefinitions } from '../../../lib/jdl/core/parsing/types/parsing.ts';
import { buildJDLApplicationConfig } from '../../../lib/jdl-config/jhipster-jdl-config.ts';
import type { ResolveGeneratorDependenciesOptions } from '../../../lib/resolver/generator-dependencies.ts';
import { packageNameToNamespace } from '../../../lib/utils/namespace.ts';
import { parseBlueprints } from '../../base/internal/blueprint.ts';

/**
 * The definitions of the jdl, from `jdlDefinitions`, and from the deprecated `jdlDefinition`, the application definitions
 * only; undefined for the JHipster ones. The cli passes both, `jdlDefinition` being the application definitions of
 * `jdlDefinitions`: another `jdlDefinition` was set by a generator composing this one, and replaces them.
 */
export const resolveJDLDefinitions = ({
  jdlDefinitions,
  jdlDefinition,
}: {
  jdlDefinitions?: Partial<JDLDefinitions>;
  jdlDefinition?: JDLApplicationConfig;
}): Partial<JDLDefinitions> | undefined =>
  !jdlDefinition || jdlDefinition === jdlDefinitions?.application ? jdlDefinitions : { ...jdlDefinitions, application: jdlDefinition };

/**
 * The definitions of the jdl of a run with blueprints, as the cli builds them: the application options of the configs of
 * the generators of the jdl command, the ones of the blueprints last.
 */
export const resolveJDLDefinitionsOf = ({
  blueprints,
  entrypointGenerator,
  getGeneratorMeta,
}: {
  blueprints: string;
  entrypointGenerator: string;
  getGeneratorMeta: ResolveGeneratorDependenciesOptions['getGeneratorMeta'];
}): Partial<JDLDefinitions> => {
  const resolved = resolveCommand(
    // A blueprint replaces a generator named without the jhipster namespace, as the cli names it.
    { command: 'jdl', entrypointGenerator: entrypointGenerator.replace(/^jhipster:/, '') },
    { getGeneratorMeta, blueprintNamespaces: parseBlueprints(blueprints).map(({ name }) => packageNameToNamespace(name)) },
  );
  return { application: buildJDLApplicationConfig(resolved?.configs ?? {}) };
};
