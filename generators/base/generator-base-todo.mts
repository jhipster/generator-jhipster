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
import JHipsterBaseCoreGenerator from '../base-core/index.mjs';
import { loadLanguagesConfig } from '../languages/support/index.mjs';
import {
  loadDerivedPlatformConfig,
  loadDerivedServerConfig,
  loadPlatformConfig,
  loadServerAndPlatformConfig,
  loadServerConfig,
} from '../server/support/index.mjs';
import { loadClientConfig, loadDerivedClientConfig } from '../client/support/index.mjs';
import { loadAppConfig, loadDerivedAppConfig } from '../app/support/index.mjs';

/**
 * Class the contains the methods that should be refactored and converted to typescript.
 */
export default abstract class JHipsterBaseGenerator extends JHipsterBaseCoreGenerator {
  abstract get jhipsterConfigWithDefaults(): any;

  /**
   * @deprecated
   */
  loadAppConfig(config = this.jhipsterConfigWithDefaults, dest: any = this) {
    loadAppConfig({ config, application: dest, useVersionPlaceholders: (this as any).useVersionPlaceholders });
  }

  /**
   * @deprecated
   */
  loadDerivedAppConfig(dest: any = this) {
    loadDerivedAppConfig({ application: dest });
  }

  /**
   * @deprecated
   */
  loadClientConfig(config = this.jhipsterConfigWithDefaults, dest: any = this) {
    loadClientConfig({ config, application: dest });
  }

  /**
   * @deprecated
   */
  loadDerivedClientConfig(dest: any = this) {
    loadDerivedClientConfig({ application: dest });
  }

  /**
   * @deprecated
   */
  loadTranslationConfig(config = this.jhipsterConfigWithDefaults, application: any = this) {
    loadLanguagesConfig({ application, config });
  }

  /**
   * @deprecated
   */
  loadServerConfig(config = this.jhipsterConfigWithDefaults, application: any = this) {
    loadServerConfig({ config, application });
  }

  /**
   * @deprecated
   */
  loadServerAndPlatformConfig(application: any = this) {
    loadServerAndPlatformConfig({ application });
  }

  /**
   * @deprecated
   */
  loadDerivedServerConfig(application: any = this) {
    loadDerivedServerConfig({ application });
    (this as any).loadServerAndPlatformConfig(application);
  }

  /**
   * @deprecated
   */
  loadPlatformConfig(config = this.jhipsterConfigWithDefaults, application: any = this) {
    loadPlatformConfig({ config, application });
    (this as any).loadDerivedPlatformConfig(application);
  }

  /**
   * @deprecated
   */
  loadDerivedPlatformConfig(application: any = this) {
    loadDerivedPlatformConfig({ application });
    (this as any).loadServerAndPlatformConfig(application);
  }
}
