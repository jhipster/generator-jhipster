/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
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

const JDLApplication = require('./jdl_application');
const ApplicationTypes = require('./jhipster/application_types');
const ApplicationOptions = require('./jhipster/application_options');

class JDLUaaApplication extends JDLApplication {
  constructor(args) {
    super(args);
    this.config.applicationType = ApplicationTypes.UAA;
    this.config = this.fixApplicationConfig(this.config);
  }

  fixApplicationConfig(passedConfig) {
    const config = super.fixApplicationConfig(passedConfig);
    if (!config.authenticationType) {
      config.authenticationType = ApplicationOptions.authenticationType.uaa;
    }
    if (!config.cacheProvider) {
      config.cacheProvider = ApplicationOptions.cacheProvider.hazelcast;
    }
    if (config.clientFramework) {
      delete config.clientFramework;
    }
    if (!config.serverPort) {
      config.serverPort = '9999';
    }
    if (!config.serviceDiscoveryType) {
      config.serviceDiscoveryType = ApplicationOptions.serviceDiscoveryType.eureka;
    }
    if (config.skipServer) {
      delete config.skipServer;
    }
    config.skipClient = true;
    config.skipUserManagement = true;
    return config;
  }
}

module.exports = JDLUaaApplication;
