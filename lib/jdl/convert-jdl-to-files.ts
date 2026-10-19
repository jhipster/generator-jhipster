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

import type { ApplicationType } from '../core/application-types.ts';
import { getDefaultRuntime } from '../jdl-config/jdl-runtime.ts';

import { type JDLFiles, astToFiles } from './converters/ast-to-files/ast-to-files.ts';
import { type JDLRuntime, type ParsedJDLApplications, checkSemantics, errorLocation } from './core/parsing/index.ts';
import { parseFromContent } from './core/readers/jdl-reader.ts';
import logger from './core/utils/objects/logger.ts';

export type { JDLFiles };

/** The application the entities of a jdl without application are imported into. */
export type ImportTarget = {
  applicationName?: string;
  applicationType?: ApplicationType;
};

/**
 * The semantic rules report every problem of the jdl, with its position: the warnings are logged, the errors thrown together;
 * the converters take a jdl without any error.
 */
export function checkSemanticErrors(content: ParsedJDLApplications, runtime: JDLRuntime) {
  const diagnostics = checkSemantics(content, runtime);
  for (const warning of diagnostics.filter(diagnostic => diagnostic.severity === 'warning')) {
    logger.warn(`${warning.message}${errorLocation(warning.location)}`);
  }
  const errors = diagnostics.filter(diagnostic => diagnostic.severity === 'error');
  if (errors.length > 0) {
    throw new Error(errors.map(error => `${error.message}${errorLocation(error.location)}`).join('\n'));
  }
}

/**
 * Converts a jdl to the json files of its applications, entities and deployments, by path relative to the folder holding
 * the applications, and the folder of the application the caller runs in (see `astToFiles`), after checking it: its errors
 * are thrown together, its warnings logged. The files hold what the jdl declares: `applyCompatibilityDefaults` adds the
 * values the generators still expect. It reads and writes no file, and depends on the jdl only.
 * @param runtime - the definitions the jdl is parsed and checked with (see `createJDLRuntime`).
 */
export function convertJDLToFiles(jdlString: string, runtime: JDLRuntime = getDefaultRuntime()): JDLFiles {
  if (!jdlString) {
    throw new Error('A JDL content must be passed to be converted.');
  }
  const content = parseFromContent(jdlString, runtime);
  checkSemanticErrors(content, runtime);
  return astToFiles(content, runtime);
}
