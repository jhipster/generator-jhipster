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
import { defaults } from 'lodash-es';

import { removeFieldsWithNullishValues } from '../../../../lib/utils/object.ts';
import { normalizePathEnd } from '../../../../lib/utils/path.ts';
import { CONTEXT_DATA_EXISTING_PROJECT } from '../../../base/support/constants.ts';
import BaseWorkspacesGenerator from '../../index.ts';

export default class BootstrapWorkspacesGenerator extends BaseWorkspacesGenerator {
  async beforeQueue() {
    this.getContextData(CONTEXT_DATA_EXISTING_PROJECT, {
      factory: () => Boolean(this.jhipsterConfig.appsFolders),
    });

    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }
  }

  get configuring() {
    return this.asConfiguringTaskGroup({
      configureWorkspaces() {
        if (this.jhipsterConfig.directoryPath) {
          this.jhipsterConfig.directoryPath = normalizePathEnd(this.jhipsterConfigWithDefaults.directoryPath);
        }
      },
    });
  }

  get [BaseWorkspacesGenerator.CONFIGURING]() {
    return this.delegateTasksToBlueprint(() => this.configuring);
  }

  get postPreparing() {
    return this.asPostPreparingTaskGroup({
      async bootstrapApplications() {
        await this.bootstrapApplications();
      },
    });
  }

  get [BaseWorkspacesGenerator.POST_PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.postPreparing);
  }

  get loadingWorkspaces() {
    return this.asLoadingWorkspacesTaskGroup({
      async loadDefaults({ deployment }) {
        defaults(deployment, removeFieldsWithNullishValues(this.jhipsterConfig));
      },
    });
  }

  get [BaseWorkspacesGenerator.LOADING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.loadingWorkspaces);
  }

  get preparingWorkspaces() {
    return this.asLoadingWorkspacesTaskGroup({
      async loadDefaults({ deployment }) {
        defaults(deployment, this.jhipsterConfigWithDefaults);
      },
      derivedProperties({ deployment }) {
        deployment.monitoringElk = deployment.monitoring === 'elk';
        deployment.monitoringPrometheus = deployment.monitoring === 'prometheus';

        deployment.serviceDiscoveryAny = deployment.serviceDiscoveryType !== 'no';
        deployment.serviceDiscoveryConsul = deployment.serviceDiscoveryType === 'consul';
        deployment.serviceDiscoveryEureka = deployment.serviceDiscoveryType === 'eureka';

        deployment.serviceDiscoveryTypeAny = (deployment.serviceDiscoveryType ?? 'no') !== 'eureka';
        deployment.serviceDiscoveryTypeEureka = deployment.serviceDiscoveryType === 'eureka';
        deployment.serviceDiscoveryTypeConsul = deployment.serviceDiscoveryType === 'consul';
      },
    });
  }

  get [BaseWorkspacesGenerator.PREPARING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.preparingWorkspaces);
  }
}
