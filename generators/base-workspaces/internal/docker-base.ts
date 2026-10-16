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
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import chalk from 'chalk';

import { normalizePathEnd } from '../../../lib/utils/index.ts';
import type BaseWorkspacesGenerator from '../generator.ts';
import { asPreparingWorkspacesTask } from '../support/task-type-inference.ts';
import type { WorkspacesApplication } from '../types.ts';

/**
 * Lists the applications whose Docker image may be missing, with the command that builds it: an application builds its
 * image with its docker:build script, the jib build for a Java application. Only the jib cache of a Java build tool
 * tells that the image was built: the other applications are always listed.
 */
export const checkImages = function checkImages(
  this: Pick<BaseWorkspacesGenerator<any, any, any, any, any, any, any>, 'log' | 'workspacePath' | 'fs'>,
  { applications }: { applications: WorkspacesApplication[] },
) {
  this.log.log('\nChecking Docker images in applications directories...');

  const missingImages: string[] = [];
  for (const app of applications) {
    const appPath = this.workspacePath(app.appFolder!);
    if (app.buildToolGradle && existsSync(join(appPath, 'build/jib-cache'))) continue;
    if (app.buildToolMaven && existsSync(join(appPath, 'target/jib-cache'))) continue;
    missingImages.push(`  ${chalk.cyan('npm run docker:build')} in ${appPath}`);
  }

  return {
    hasWarning: missingImages.length > 0,
    warningMessage: `To generate the missing Docker image(s), please run:\n${missingImages.join('\n')}\n`,
  };
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
