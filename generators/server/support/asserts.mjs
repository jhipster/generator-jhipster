/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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

import { exec } from 'child_process';
import chalk from 'chalk';
import { generatorSkipChecks } from '../../base/support/index.mjs';
import { JAVA_COMPATIBLE_VERSIONS } from '../../generator-constants.mjs';

const checkJavaVersionCompatible = javaVersionReturnString => {
  return javaVersionReturnString.match(new RegExp(`(${JAVA_COMPATIBLE_VERSIONS.map(ver => `^${ver}`).join('|')})`));
};

const extractJavaVersion = javaVersionReturnString => {
  return javaVersionReturnString.match(/(?:java|openjdk) version "(.*)"/)[1];
};

const printIncompatibleJavaVersionMessage = (context, javaVersion) => {
  const [latest, ...others] = JAVA_COMPATIBLE_VERSIONS.concat().reverse();
  context.warning(
    `Java ${others.reverse().join(', ')} or ${latest} are not found on your computer. Your Java version is: ${chalk.yellow(javaVersion)}`
  );
};

const printJavaShouldBeInPathMessage = context => {
  context.warning('Java is not found on your computer.');
};
/**
 * @private
 * Check if Java is installed
 */
const checkJava = context => {
  if (generatorSkipChecks(context) || context.skipServer) return;
  const done = context.async();
  exec('java -version', (err, stdout, stderr) => {
    if (err) {
      printJavaShouldBeInPathMessage(context);
    } else {
      const javaVersion = extractJavaVersion(stderr);
      if (!checkJavaVersionCompatible(javaVersion)) {
        printIncompatibleJavaVersionMessage(context, javaVersion);
      }
    }
    done();
  });
};

export default checkJava;
