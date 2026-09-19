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
import BaseWorkspacesGenerator from '../../../base-workspaces/index.ts';
import {
  askForAdminPassword,
  askForApplicationType,
  askForApps,
  askForClustersMode,
  askForDockerPushCommand,
  askForDockerRepositoryName,
  askForMonitoring,
  askForPath,
  askForServiceDiscovery,
} from '../../../base-workspaces/internal/docker-prompts.ts';
import { BaseKubernetesGenerator } from '../../generator.ts';
import {
  askForIngressDomain,
  askForIngressType,
  askForIstioSupport,
  askForKubernetesNamespace,
  askForKubernetesServiceType,
  askForPersistentStorage,
  askForStorageClassName,
} from '../../prompts.ts';
import { askForGeneratorType } from '../knative/prompts.ts';

export type KubernetesTarget = 'kubernetes' | 'helm' | 'knative';

export default class KubernetesCommonGenerator extends BaseKubernetesGenerator {
  /**
   * The generator the questions are asked for, set by the generator that composes this one.
   */
  target: KubernetesTarget = 'kubernetes';

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:kubernetes:bootstrap');
    }
  }

  get prompting() {
    return this.asPromptingTaskGroup({
      async askForApplicationType(taskParam) {
        // Knative only deploys microservices.
        if (this.target === 'knative') return;
        await askForApplicationType.call(this, taskParam);
      },
      askForPath,
      askForApps,
    });
  }

  get [BaseWorkspacesGenerator.PROMPTING]() {
    return this.delegateTasksToBlueprint(() => this.prompting);
  }

  get promptingWorkspaces() {
    return this.asPromptingWorkspacesTaskGroup({
      async askForGeneratorType(taskParam) {
        if (this.target !== 'knative') return;
        await askForGeneratorType.call(this, taskParam);
      },
      askForMonitoring,
      askForClustersMode,
      askForServiceDiscovery,
      askForAdminPassword,
      askForKubernetesNamespace,
      askForDockerRepositoryName,
      askForDockerPushCommand,
      async askForIstioSupport(taskParam) {
        // Knative always runs on Istio and exposes its services through it.
        if (this.target === 'knative') return;
        await askForIstioSupport.call(this, taskParam);
      },
      async askForKubernetesServiceType(taskParam) {
        if (this.target === 'knative') return;
        await askForKubernetesServiceType.call(this, taskParam);
      },
      async askForIngressType(taskParam) {
        if (this.target === 'knative') return;
        await askForIngressType.call(this, taskParam);
      },
      askForIngressDomain,
      async askForPersistentStorage(taskParam) {
        if (this.target !== 'kubernetes') return;
        await askForPersistentStorage.call(this, taskParam);
      },
      async askForStorageClassName(taskParam) {
        if (this.target !== 'kubernetes') return;
        await askForStorageClassName.call(this, taskParam);
      },
    });
  }

  get [BaseWorkspacesGenerator.PROMPTING_WORKSPACES]() {
    return this.delegateTasksToBlueprint(() => this.promptingWorkspaces);
  }
}
