/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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

const fs = require('fs');
const FileUtils = require('../utils/file-utils');

const GENERATOR_NAME = 'generator-jhipster';

module.exports = {
  writeConfigFile,
  GENERATOR_NAME,
};

/**
 * This function writes a Yeoman config file in the current folder.
 * @param config the configuration.
 * @param yoRcPath the yeoman conf file path
 */
function writeConfigFile(config, yoRcPath = '.yo-rc.json') {
  let newYoRc = { ...config };
  if (FileUtils.doesFileExist(yoRcPath)) {
    const yoRc = JSON.parse(fs.readFileSync(yoRcPath, { encoding: 'utf-8' }));
    let creationTimestamp = config[GENERATOR_NAME].creationTimestamp;
    if (yoRc[GENERATOR_NAME] && yoRc[GENERATOR_NAME].creationTimestamp) {
      creationTimestamp = yoRc[GENERATOR_NAME].creationTimestamp;
    }
    newYoRc = {
      ...yoRc,
      ...config,
      [GENERATOR_NAME]: {
        ...yoRc[GENERATOR_NAME],
        ...config[GENERATOR_NAME],
        creationTimestamp,
      },
    };
  }
  fs.writeFileSync(yoRcPath, JSON.stringify(newYoRc, null, 2).concat('\n'));
}
