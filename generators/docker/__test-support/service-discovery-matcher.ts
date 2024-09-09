import { it } from 'esmocha';
import type { RunResult } from 'yeoman-test';

import { JAVA_DOCKER_DIR } from '../../generator-constants.js';
import { matchWrittenConfig, matchWrittenFiles } from '../../../testing/index.js';

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
  it(...matchWrittenFiles('eureka', expectedEurekaFiles, shouldMatch, resultGetter()));
  it(...matchWrittenConfig('eureka', desiredEurekaConfig, shouldMatch, resultGetter()));
};

export const matchConsul = (resultGetter: () => RunResult, shouldMatch: boolean) => {
  it(...matchWrittenFiles('consul', expectedConsulFiles, shouldMatch, resultGetter()));
  it(...matchWrittenConfig('consul', desiredConsulConfig, shouldMatch, resultGetter()));
};
