import type { RunResult } from 'yeoman-test';
import type BaseApplicationGenerator from '../../base-application/index.js';
import type { SpringBootApplication } from '../../server/types.js';

import { SERVER_MAIN_SRC_DIR, JAVA_DOCKER_DIR } from '../../generator-constants.js';
import { matchWrittenConfig, matchWrittenFiles } from '../../../testing/index.js';

const expectedElasticsearchFiles = () => {
  return [`${JAVA_DOCKER_DIR}elasticsearch.yml`];
};

const expectedElasticsearchUserFiles = (resultGetter: () => RunResult) => {
  const application = ((resultGetter() as any).generator as BaseApplicationGenerator<SpringBootApplication>).sharedData.getApplication();
  return application.generateBuiltInUserEntity
    ? [`${SERVER_MAIN_SRC_DIR}${application.packageFolder}/repository/search/UserSearchRepository.java`]
    : [];
};

const desiredConfig = {
  'generator-jhipster': {
    searchEngine: 'elasticsearch',
  },
};

export const matchElasticSearchDocker = (resultGetter: () => RunResult, shouldMatch: boolean) => {
  matchWrittenFiles('elasticsearch', resultGetter, expectedElasticsearchFiles, shouldMatch);
};

export const matchElasticSearch = (resultGetter: () => RunResult, shouldMatch: boolean) => {
  matchWrittenConfig('elasticsearch', resultGetter, desiredConfig, shouldMatch);
};

export const matchElasticSearchUser = (resultGetter: () => RunResult, shouldMatch: boolean) => {
  matchWrittenFiles('elasticsearch user', resultGetter, () => expectedElasticsearchUserFiles(resultGetter), shouldMatch);
};
