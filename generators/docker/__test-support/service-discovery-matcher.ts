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

import { it } from 'esmocha';

import { matchWrittenConfig, matchWrittenFiles } from '../../../lib/testing/index.ts';
import { JAVA_DOCKER_DIR } from '../../generator-constants.ts';

const expectedEurekaFiles = () => {
  return [
    `${JAVA_DOCKER_DIR}central-server-config/localhost-config/application.yml`,
    `${JAVA_DOCKER_DIR}central-server-config/docker-config/application.yml`,
    `${JAVA_DOCKER_DIR}jhipster-registry.yml`,
  ];
};

const desiredEurekaConfig = {
  'generator-jhipster': {
    serviceDiscoveryType: 'eureka',
  },
};

const expectedConsulFiles = () => {
  return [
    `${JAVA_DOCKER_DIR}central-server-config/application.yml`,
    `${JAVA_DOCKER_DIR}consul.yml`,
    `${JAVA_DOCKER_DIR}config/git2consul.json`,
  ];
};

const desiredConsulConfig = {
  'generator-jhipster': {
    serviceDiscoveryType: 'consul',
  },
};

export const matchEureka = (shouldMatch: boolean) => {
  it(...matchWrittenFiles('eureka', expectedEurekaFiles, shouldMatch));
  it(...matchWrittenConfig('eureka', desiredEurekaConfig, shouldMatch));
};

export const matchConsul = (shouldMatch: boolean) => {
  it(...matchWrittenFiles('consul', expectedConsulFiles, shouldMatch));
  it(...matchWrittenConfig('consul', desiredConsulConfig, shouldMatch));
};
