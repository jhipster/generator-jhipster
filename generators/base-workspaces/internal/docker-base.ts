/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { existsSync } from 'fs';
import chalk from 'chalk';

import { normalizePathEnd } from '../../../lib/utils/index.ts';
import { buildToolTypes } from '../../../lib/jhipster/index.ts';
import type { BaseKubernetesGenerator } from '../../kubernetes/generator.ts';
import type { WorkspacesApplication } from '../types.js';
import { asPreparingWorkspacesTask } from '../support/task-type-inference.ts';

const { MAVEN } = buildToolTypes;

export { checkDocker } from '../../docker/support/index.ts';

/**
 * Check Images
 */
export const checkImages = function checkImages(
  this: BaseKubernetesGenerator,
  { applications }: { applications: WorkspacesApplication[] },
) {
  this.log.log('\nChecking Docker images in applications directories...');

  let imagePath = '';
  let runCommand = '';
  let hasWarning = false;
  let warningMessage = 'To generate the missing Docker image(s), please run:\n';
  for (const app of applications) {
    if (app.buildTool === MAVEN) {
      imagePath = this.workspacePath(app.appFolder!, '/target/jib-cache');
      runCommand = `./mvnw -ntp -Pprod verify jib:dockerBuild${process.arch === 'arm64' ? ' -Djib-maven-plugin.architecture=arm64' : ''}`;
    } else {
      imagePath = this.workspacePath(app.appFolder!, '/build/jib-cache');
      runCommand = `./gradlew bootJar -Pprod jibDockerBuild${process.arch === 'arm64' ? ' -PjibArchitecture=arm64' : ''}`;
    }
    if (!existsSync(imagePath)) {
      hasWarning = true;
      warningMessage += `  ${chalk.cyan(runCommand)} in ${this.workspacePath(app.appFolder!)}\n`;
    }
  }

  return { hasWarning, warningMessage };
};

/**
 * Configure Image Names
 */
export const configureImageNames = asPreparingWorkspacesTask(function configureImageNames({
  applications,
}: {
  applications: WorkspacesApplication[];
}) {
  for (const app of applications) {
    const originalImageName = app.baseName.toLowerCase();
    const targetImageName = `${normalizePathEnd(this.jhipsterConfigWithDefaults.dockerRepositoryName)}${originalImageName}`;
    app.targetImageName = targetImageName;
  }
});
