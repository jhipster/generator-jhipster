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
import { JHIPSTER_BOM_BRANCH, JHIPSTER_BOM_CICD_VERSION } from '../.blueprint/github-build-matrix/support/integration-test-constants.ts';
import { getGithubOutputFile, setGithubTaskOutput } from '../lib/ci/index.ts';

const ciUtilsCommand: (positionalArgs: [string[]], options: any) => Promise<any> = async (_args, options) => {
  if (options.exportGithubOutput) {
    // eslint-disable-next-line no-console
    console.log(JHIPSTER_BOM_BRANCH);
    const githubOutputFile = getGithubOutputFile();
    if (githubOutputFile) {
      setGithubTaskOutput('jhipster-bom-branch', JHIPSTER_BOM_BRANCH);
      setGithubTaskOutput('jhipster-dependencies-version', JHIPSTER_BOM_CICD_VERSION);
    }
  }
};

export default ciUtilsCommand;
