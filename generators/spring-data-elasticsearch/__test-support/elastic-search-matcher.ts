import type { RunResult } from 'yeoman-test';

import { JAVA_DOCKER_DIR, SERVER_MAIN_SRC_DIR } from '../../generator-constants.js';
import { matchWrittenConfig, matchWrittenFiles } from '../../../lib/testing/index.js';

const expectedElasticsearchFiles = () => {
  return [`${JAVA_DOCKER_DIR}elasticsearch.yml`];
};

const expectedElasticsearchUserFiles = (resultGetter: () => RunResult) => {
  const application = (resultGetter() as any).generator.sharedData.getApplication();
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
