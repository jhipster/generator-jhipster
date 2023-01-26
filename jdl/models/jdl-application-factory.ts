/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import { applicationTypes, defaultApplicationOptions } from '../jhipster/index.mjs';
import JDLApplication from './jdl-application.js';

const {
  getDefaultConfigForNewApplication,
  getConfigForMicroserviceApplication,
  getConfigForMonolithApplication,
  getConfigForGatewayApplication,
} = defaultApplicationOptions;

/**
 * Creates a JDL application from a passed configuration.
 * @param {Object} config - the application configuration.
 * @returns {JDLApplication} the created JDL application.
 */
export default function createJDLApplication(config: any = {}) {
  const baseConfig = getDefaultConfigForNewApplication(config);
  switch (config.applicationType) {
    case applicationTypes.MICROSERVICE:
      return new JDLApplication({
        config: getConfigForMicroserviceApplication(baseConfig),
      });
    case applicationTypes.GATEWAY:
      return new JDLApplication({
        config: getConfigForGatewayApplication(baseConfig),
      });
    case applicationTypes.MONOLITH:
    default:
      return new JDLApplication({
        config: getConfigForMonolithApplication(baseConfig),
      });
  }
}
