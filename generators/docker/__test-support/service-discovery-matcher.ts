import type { RunResult } from 'yeoman-test';

import { JAVA_DOCKER_DIR } from '../../generator-constants.js';
import { matchWrittenConfig, matchWrittenFiles } from '../../../lib/testing/index.js';

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

export const matchEureka = (resultGetter: () => RunResult, shouldMatch: boolean) => {
  matchWrittenFiles('eureka', resultGetter, expectedEurekaFiles, shouldMatch);
  matchWrittenConfig('eureka', resultGetter, desiredEurekaConfig, shouldMatch);
};

export const matchConsul = (resultGetter: () => RunResult, shouldMatch: boolean) => {
  matchWrittenFiles('consul', resultGetter, expectedConsulFiles, shouldMatch);
  matchWrittenConfig('consul', resultGetter, desiredConsulConfig, shouldMatch);
};
