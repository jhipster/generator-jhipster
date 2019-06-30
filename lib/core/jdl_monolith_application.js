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

class JDLMonolithApplication extends AbstractJDLApplication {
  constructor(args) {
    super(args);
    this.config.applicationType = ApplicationTypes.MONOLITH;
    if (!this.config.authenticationType) {
      this.config.authenticationType = ApplicationOptions.authenticationType.jwt;
    }
    if (!this.config.cacheProvider) {
      this.config.cacheProvider = ApplicationOptions.cacheProvider.ehcache;
    }
    if (!this.config.clientFramework) {
      this.config.clientFramework = ApplicationOptions.clientFramework.angularX;
    }
    if (!this.config.clientTheme) {
      this.config.clientTheme = ApplicationOptions.clientTheme;
      this.config.clientThemeVariant = ApplicationOptions.clientThemeVariant.none;
    } else if (this.config.clientTheme !== ApplicationOptions.clientTheme && !this.config.clientThemeVariant) {
      this.config.clientThemeVariant = ApplicationOptions.clientThemeVariant.default;
    }
    if (!this.config.serverPort) {
      this.config.serverPort = ApplicationOptions.serverPort;
    }
    if (this.config.authenticationType === ApplicationOptions.authenticationType.oauth2) {
      this.config.skipUserManagement = true;
    }
    if (this.config.useSass !== true && this.config.useSass !== false) {
      this.config.useSass = true;
    }
  }
}

module.exports = JDLMonolithApplication;
