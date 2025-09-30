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
import type { JDLRuntime } from '../types/runtime.ts';

import JDLApplication from './jdl-application.ts';

/**
 * Creates a JDL application from a passed configuration.
 * @param {Object} config - the application configuration.
 * @returns {JDLApplication} the created JDL application.
 */
export function createJDLApplication(config: any, runtime: JDLRuntime, namespaceConfigs?: Record<string, Record<string, any>>) {
  return new JDLApplication({ config: { baseName: 'jhipster', ...config }, namespaceConfigs }, runtime);
}
