import type { RunResult } from 'yeoman-test';
import type BaseApplicationGenerator from '../../base-application/index.mjs';
import type { SpringBootApplication } from '../../server/types.mjs';

import { SERVER_MAIN_SRC_DIR, DOCKER_DIR } from '../../generator-constants.mjs';
import { matchWrittenConfig, matchWrittenFiles } from '../../../test/support/matcher.mjs';

const expectedElasticsearchFiles = () => {
  return [`${DOCKER_DIR}elasticsearch.yml`];
};

const expectedElasticsearchUserFiles = (resultGetter: () => RunResult) => {
  const application = ((resultGetter() as any).generator as BaseApplicationGenerator<SpringBootApplication>).sharedData.getApplication();
  return [`${SERVER_MAIN_SRC_DIR}${application.packageFolder}/repository/search/UserSearchRepository.java`];
};

const desiredConfig = {
  'generator-jhipster': {
    searchEngine: 'elasticsearch',
  },
};

export const matchElasticSearchDocker = (resultGetter: () => RunResult, shouldMatch: boolean) => {
  matchWrittenFiles('elaticsearch', resultGetter, expectedElasticsearchFiles, shouldMatch);
};

export const matchElasticSearch = (resultGetter: () => RunResult, shouldMatch: boolean) => {
  matchWrittenConfig('elaticsearch', resultGetter, desiredConfig, shouldMatch);
};

export const matchElasticSearchUser = (resultGetter: () => RunResult, shouldMatch: boolean) => {
  matchWrittenFiles('elaticsearch user', resultGetter, () => expectedElasticsearchUserFiles(resultGetter), shouldMatch);
};
