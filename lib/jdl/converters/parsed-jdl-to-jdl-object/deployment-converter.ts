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

import JDLDeployment from '../../core/models/jdl-deployment.ts';
import type { ParsedJDLDeployment } from '../../core/parsing/types/parsed.ts';
import type { JDLRuntime } from '../../core/parsing/types/runtime.ts';

export default { convertDeployments };

/**
 * Converts a parsed JDL content corresponding to deployments to an array of JDLDeployment objects.
 * @param {Array} parsedDeployments - parsed JDL deployments.
 * @param runtime - the runtime, whose deployment definition says which values an option allows.
 * @return the converted JDLDeployment objects.
 */
export function convertDeployments(parsedDeployments: ParsedJDLDeployment[], runtime: JDLRuntime): JDLDeployment[] {
  if (!parsedDeployments) {
    throw new Error('Deployments have to be passed so as to be converted.');
  }
  return parsedDeployments.map(parsedDeployment => {
    // Like the application configuration: an option with choices only takes one of them.
    for (const [optionName, optionValue] of Object.entries(parsedDeployment)) {
      if (
        (Array.isArray(optionValue) || typeof optionValue === 'string') &&
        runtime.deploymentDefinition.doesOptionExist(optionName) &&
        !runtime.deploymentDefinition.doesOptionValueExist(optionName, optionValue)
      ) {
        throw new Error(`The value '${optionValue}' is not allowed for the deployment option '${optionName}'.`);
      }
    }
    return new JDLDeployment(parsedDeployment);
  });
}
