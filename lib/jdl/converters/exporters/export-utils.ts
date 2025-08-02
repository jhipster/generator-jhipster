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

import fs from 'node:fs';

import { YO_RC_FILE } from '../../../constants/yeoman.ts';
import type { YoRcJHipsterContent } from '../../../jhipster/types/yo-rc.js';
import { mergeYoRcContent, readYoRcFile } from '../../../utils/yo-rc.ts';
import { doesFileExist } from '../../core/utils/file-utils.ts';

export const GENERATOR_NAME = 'generator-jhipster';

/**
 * This function writes a Yeoman config file in the current folder.
 * @param config the configuration.
 * @param yoRcPath the yeoman conf file path
 */
export function writeConfigFile(config: YoRcJHipsterContent, yoRcPath = YO_RC_FILE): void {
  let newYoRc: YoRcJHipsterContent = { ...config };
  if (doesFileExist(yoRcPath)) {
    const yoRc = readYoRcFile(yoRcPath) as YoRcJHipsterContent;
    newYoRc = mergeYoRcContent(yoRc, config);
  }
  fs.writeFileSync(yoRcPath, JSON.stringify(newYoRc, null, 2).concat('\n'));
}
