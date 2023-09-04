/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import os from 'os';
import { exec } from 'child_process';
import { buildToolTypes } from '../../../jdl/index.js';

const { GRADLE } = buildToolTypes;
const isWin32 = os.platform() === 'win32';

/**
 * build a generated application.
 *
 * @param {String} buildTool - maven | gradle
 * @param {String} profile - dev | prod
 * @param {Boolean} buildWar - build a war instead of a jar
 * @param {Function} cb - callback when build is complete
 * @returns {object} the command line and its result
 */
export const buildApplication = (buildTool, profile, buildWar, cb) => {
  let buildCmd = 'mvnw -ntp verify -B';

  if (buildTool === GRADLE) {
    buildCmd = 'gradlew';
    if (buildWar) {
      buildCmd += ' bootWar';
    } else {
      buildCmd += ' bootJar';
    }
  }
  if (buildWar) {
    buildCmd += ' -Pwar';
  }

  if (!isWin32) {
    buildCmd = `./${buildCmd}`;
  }
  buildCmd += ` -P${profile}`;
  return {
    stdout: exec(buildCmd, { maxBuffer: 1024 * 10000 }, cb).stdout,
    buildCmd,
  };
};
