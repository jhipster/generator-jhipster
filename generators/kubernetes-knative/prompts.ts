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
import { kubernetesPlatformTypes } from '../../lib/jhipster/index.js';
import { generatorDefaultConfig } from '../kubernetes/kubernetes-constants.js';
import { asPromptingTask } from '../base-application/support/index.js';
import type { BaseKubernetesGenerator } from '../kubernetes/generator.ts';

const { GeneratorTypes } = kubernetesPlatformTypes;
const { HELM, K8S } = GeneratorTypes;

export const askForGeneratorType = asPromptingTask(async function askForGeneratorType(this: BaseKubernetesGenerator, { control }) {
  if (!this.options.askAnswered && control.existingProject) return;

  const props = await this.prompt(
    [
      {
        type: 'list',
        name: 'generatorType',
        message: 'Which *type* of generator would you like to base this on?',
        choices: [
          {
            value: K8S,
            name: 'Kubernetes generator',
          },
          {
            value: HELM,
            name: 'Helm Kubernetes generator',
          },
        ],
        default: this.generatorType ? this.generatorType : generatorDefaultConfig.generatorType,
      },
    ],
    this.config,
  );
  this.generatorType = props.generatorType;
});
