/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import fs from 'fs';
import { doesFileExist } from '../../core/utils/file-utils.js';
import type { JHipsterYoRcContent } from '../../core/types/json-config.js';
import { YO_RC_FILE, mergeYoRcContent, readYoRcFile } from '../../../utils/yo-rc.js';

export const GENERATOR_NAME = 'generator-jhipster';

/**
 * This function writes a Yeoman config file in the current folder.
 * @param config the configuration.
 * @param yoRcPath the yeoman conf file path
 */
export function writeConfigFile(config: JHipsterYoRcContent, yoRcPath = YO_RC_FILE): void {
  let newYoRc: JHipsterYoRcContent = { ...config };
  if (doesFileExist(yoRcPath)) {
    const yoRc = readYoRcFile(yoRcPath) as JHipsterYoRcContent;
    newYoRc = mergeYoRcContent(yoRc, config);
  }
  fs.writeFileSync(yoRcPath, JSON.stringify(newYoRc, null, 2).concat('\n'));
}
