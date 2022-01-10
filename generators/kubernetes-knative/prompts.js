/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
const k8sPrompts = require('../kubernetes/prompts');
const { GeneratorTypes } = require('../../jdl/jhipster/kubernetes-platform-types');
const { generatorDefaultConfig } = require('../kubernetes/kubernetes-constants');

const { HELM, K8S } = GeneratorTypes;

module.exports = {
  askForGeneratorType,
  ...k8sPrompts,
};

async function askForGeneratorType() {
  if (this.regenerate) return;

  const prompts = [
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
  ];

  const props = await this.prompt(prompts);
  this.generatorType = props.generatorType;
}
