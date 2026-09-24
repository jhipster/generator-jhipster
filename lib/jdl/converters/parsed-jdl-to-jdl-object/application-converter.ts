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

import type AbstractJDLOption from '../../core/models/abstract-jdl-option.ts';
import { createJDLApplication } from '../../core/models/jdl-application-factory.ts';
import type JDLApplication from '../../core/models/jdl-application.ts';
import type { ParsedJDLApplication } from '../../core/parsing/types/parsed.ts';
import type { JDLRuntime } from '../../core/parsing/types/runtime.ts';

import { convertOptions } from './option-converter.ts';

export default { convertApplications };

/**
 * Converts parsed applications to JDL applications.
 * @param {Array<Object>} parsedApplications - the parsed applications.
 * @return {Array} the converted JDL applications.
 */
export function convertApplications(parsedApplications: ParsedJDLApplication[], runtime: JDLRuntime): JDLApplication[] {
  if (!parsedApplications) {
    throw new Error('Applications have to be passed so as to be converted.');
  }
  return parsedApplications.map(parsedApplication => {
    const jdlApplication = createJDLApplication(parsedApplication.config, runtime, parsedApplication.namespaceConfigs);
    jdlApplication.addEntityNames(parsedApplication.entities);
    getEntityOptionsInApplication(parsedApplication).forEach(option => jdlApplication.addOption(option));
    return jdlApplication;
  });
}

function getEntityOptionsInApplication(parsedApplication: ParsedJDLApplication): AbstractJDLOption[] {
  return convertOptions(parsedApplication.options, parsedApplication.useOptions ?? []);
}
