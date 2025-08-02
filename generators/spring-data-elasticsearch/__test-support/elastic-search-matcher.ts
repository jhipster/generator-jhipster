import { it } from 'esmocha';

import { matchWrittenConfig, matchWrittenFiles, runResult } from '../../../lib/testing/index.ts';
import { JAVA_DOCKER_DIR, SERVER_MAIN_SRC_DIR } from '../../generator-constants.js';

const expectedElasticsearchFiles = () => [`${JAVA_DOCKER_DIR}elasticsearch.yml`];

const expectedElasticsearchUserFiles = () => {
  const application = runResult.application;
  return application?.generateBuiltInUserEntity
    ? [`${SERVER_MAIN_SRC_DIR}${application.packageFolder}/repository/search/UserSearchRepository.java`]
    : [];
};

const desiredConfig = {
  'generator-jhipster': {
    searchEngine: 'elasticsearch',
  },
};

export const matchElasticSearchDocker = (shouldMatch: boolean) => {
  it(...matchWrittenFiles('elasticsearch', expectedElasticsearchFiles, shouldMatch));
};

export const matchElasticSearch = (shouldMatch: boolean) => {
  it(...matchWrittenConfig('elasticsearch', desiredConfig, shouldMatch));
};

export const matchElasticSearchUser = (shouldMatch: boolean) => {
  it(...matchWrittenFiles('elasticsearch user', () => expectedElasticsearchUserFiles(), shouldMatch));
};
