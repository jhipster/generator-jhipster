import { it } from 'esmocha';

import { matchWrittenConfig, matchWrittenFiles } from '../../../lib/testing/index.ts';
import { JAVA_DOCKER_DIR } from '../../generator-constants.js';

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
