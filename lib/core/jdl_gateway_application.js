/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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

const AbstractJDLApplication = require('./abstract_jdl_application');
const ApplicationOptions = require('./jhipster/application_options');

const { getConfigForGatewayApplication } = require('./jhipster/default_application_options');

class JDLGatewayApplication extends AbstractJDLApplication {
  constructor(args) {
    const config = getConfigForGatewayApplication(args.config);
    super({ config, entities: args.entities });
    // TODO the two ifs are weird, might be something wrong in the getDefaultConfigForNewApplication function
    // TODO find out what's causing the tests to fail, why, and handle these two lines in the default option file
    if (this.config.serviceDiscoveryType === false) {
      this.config.serviceDiscoveryType = ApplicationOptions.serviceDiscoveryType.eureka;
    }
    if (this.config.serviceDiscoveryType === ApplicationOptions.serviceDiscoveryType.no) {
      this.config.serviceDiscoveryType = false;
    }
  }
}

module.exports = JDLGatewayApplication;
