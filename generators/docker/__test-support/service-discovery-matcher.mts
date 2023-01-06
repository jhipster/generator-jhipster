import type { RunResult } from 'yeoman-test';

import { DOCKER_DIR } from '../../generator-constants.mjs';
import { matchWrittenConfig, matchWrittenFiles } from '../../../test/support/matcher.mjs';

const expectedEurekaFiles = () => {
  return [
    `${DOCKER_DIR}central-server-config/localhost-config/application.yml`,
    `${DOCKER_DIR}central-server-config/docker-config/application.yml`,
    `${DOCKER_DIR}jhipster-registry.yml`,
  ];
};

const desiredEurekaConfig = {
  'generator-jhipster': {
    serviceDiscoveryType: 'eureka',
  },
};

const expectedConsulFiles = () => {
  return [`${DOCKER_DIR}central-server-config/application.yml`, `${DOCKER_DIR}consul.yml`, `${DOCKER_DIR}config/git2consul.json`];
};

const desiredConsultConfig = {
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
  matchWrittenConfig('consul', resultGetter, desiredConsultConfig, shouldMatch);
};
