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

import { matchWrittenConfig, matchWrittenFiles, runResult } from '../../../../../lib/testing/index.ts';
import { JAVA_DOCKER_DIR, SERVER_MAIN_SRC_DIR } from '../../../../generator-constants.ts';

const expectedElasticsearchFiles = () => [`${JAVA_DOCKER_DIR}elasticsearch.yml`];

const expectedElasticsearchUserFiles = () => {
  const { application } = runResult;
  return application?.generateBuiltInUserEntity ?
      [`${SERVER_MAIN_SRC_DIR}${application.packageFolder}/repository/search/UserSearchRepository.java`]
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
