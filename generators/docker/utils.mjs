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
import { DockerfileParser } from 'dockerfile-ast';
import _ from 'lodash';

const { camelCase } = _;

/**
 * Extract version properties from pom content
 * @param {string} pomContent
 * @returns {Record<string, string>}
 */
export function getDockerfileContainers(dockerfileContent) {
  const dockerfile = DockerfileParser.parse(dockerfileContent);
  const containers = {};
  let imageWithTag;
  let image;
  let tag;
  for (const instruction of dockerfile.getInstructions()) {
    let alias;
    if (instruction.getKeyword() === 'FROM') {
      imageWithTag = instruction.getArgumentsContent();
      const split = instruction.getArgumentsContent().split(':');
      image = split[0];
      tag = split[1];
      containers[image] = imageWithTag;
      if (/^[a-zA-Z0-9-]*$/.test(image)) {
        // If the container name is simple enough, use it as alias
        alias = camelCase(image);
      }
    } else if (instruction.getKeyword() === 'LABEL') {
      const split = instruction.getArgumentsContent().split('=');
      if (split[0].toUpperCase() === 'ALIAS') {
        alias = camelCase(split[1]);
      }
    }
    if (alias) {
      containers[alias] = imageWithTag;
      containers[`${alias}Tag`] = tag;
      containers[`${alias}Image`] = image;
    }
  }
  return containers;
}

/**
 * Generates a placeholder
 * Generated value should be yaml safe
 * @param {string}
 * @returns {string}
 */
export const dockerPlaceholderGenerator = value => `${_.kebabCase(value)}-placeholder`;
