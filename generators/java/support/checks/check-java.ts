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
import chalk from 'chalk';
import { execaCommandSync } from 'execa';
import { type ValidationResult } from '../../../base/api.js';

/**
 * Check if installed java version is compatible
 * @param javaCompatibleVersions
 */
export default (javaCompatibleVersions: string[]): ValidationResult & { javaVersion?: string } => {
  try {
    const { exitCode, stderr } = execaCommandSync('java -version', { stdio: 'pipe' });
    if (exitCode === 0 && stderr) {
      const matchResult = /(?:java|openjdk)(?: version)? "?(.*)"? /s.exec(stderr);
      if (matchResult && matchResult.length > 0) {
        const javaVersion = matchResult[1];
        const debug = `Detected java version ${javaVersion}`;
        if (javaCompatibleVersions && !new RegExp(`(${javaCompatibleVersions.map(ver => `^${ver}`).join('|')})`).exec(javaVersion)) {
          const [latest, ...others] = javaCompatibleVersions.concat().reverse();
          const humanizedVersions = `${others.reverse().join(', ')} or ${latest}`;
          const warning = `Java ${humanizedVersions} are not found on your computer. Your Java version is: ${chalk.yellow(javaVersion)}`;
          return { debug, warning, javaVersion };
        }
        return { debug, javaVersion };
      }
    }
    return { error: `Error parsing Java version. Output: ${stderr}` };
  } catch (error) {
    return { error: `Java was not found on your computer (${(error as any).message}).` };
  }
};
