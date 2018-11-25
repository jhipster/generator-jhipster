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

const AbstractJDLApplication = require('./abstract_jdl_application');
const ApplicationTypes = require('./jhipster/application_types');
const ApplicationOptions = require('./jhipster/application_options');

class JDLUaaApplication extends AbstractJDLApplication {
  constructor(args) {
    super(args);
    this.config.applicationType = ApplicationTypes.UAA;
    if (!this.config.authenticationType) {
      this.config.authenticationType = ApplicationOptions.authenticationType.uaa;
    }
    if (!this.config.cacheProvider) {
      this.config.cacheProvider = ApplicationOptions.cacheProvider.hazelcast;
    }
    delete this.config.clientFramework;
    if (!this.config.serverPort) {
      this.config.serverPort = '9999';
    }
    if (this.config.serviceDiscoveryType === false) {
      this.config.serviceDiscoveryType = ApplicationOptions.serviceDiscoveryType.eureka;
    }
    if (this.config.serviceDiscoveryType === ApplicationOptions.serviceDiscoveryType.no) {
      this.config.serviceDiscoveryType = false;
    }
    delete this.config.skipServer;
    this.config.skipUserManagement = false;
    this.config.skipClient = true;
  }
}

module.exports = JDLUaaApplication;
