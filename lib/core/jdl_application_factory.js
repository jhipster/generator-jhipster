/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const ApplicationTypes = require('./jhipster/application_types');
const JDLMonolithApplication = require('./jdl_monolith_application');
const JDLMIcroserviceApplication = require('./jdl_microservice_application');
const JDLGatewayApplication = require('./jdl_gateway_application');
const JDLUaaApplication = require('./jdl_uaa_application');

module.exports = {
  createJDLApplication
};

function createJDLApplication(config) {
  switch (config.applicationType) {
    case ApplicationTypes.MONOLITH:
      return new JDLMonolithApplication({ config });
    case ApplicationTypes.MICROSERVICE:
      return new JDLMIcroserviceApplication({ config });
    case ApplicationTypes.GATEWAY:
      return new JDLGatewayApplication({ config });
    case ApplicationTypes.UAA:
      return new JDLUaaApplication({ config });
    default:
      throw new Error(`Unknown application type: ${config.applicationType}`);
  }
}
