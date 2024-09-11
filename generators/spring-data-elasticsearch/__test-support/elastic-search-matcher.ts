import { it } from 'esmocha';
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
  it(...matchWrittenFiles('elasticsearch', expectedElasticsearchFiles, shouldMatch, resultGetter()));
};

export const matchElasticSearch = (resultGetter: () => RunResult, shouldMatch: boolean) => {
  it(...matchWrittenConfig('elasticsearch', desiredConfig, shouldMatch, resultGetter()));
};

export const matchElasticSearchUser = (resultGetter: () => RunResult, shouldMatch: boolean) => {
  it(...matchWrittenFiles('elasticsearch user', () => expectedElasticsearchUserFiles(resultGetter), shouldMatch, resultGetter()));
};
