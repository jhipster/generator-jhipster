/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const fs = require('fs');

module.exports = {
  exportToJDL
};

/**
 * Writes down the given JDL to a file.
 * @param jdl the JDL to write.
 * @param path the path where the file will be written.
 */
function exportToJDL(jdl, path) {
  if (!jdl) {
    throw new Error('A JDLObject has to be passed to be exported.');
  }
  if (!path) {
    path = './jhipster-jdl.jh';
  }
  fs.writeFileSync(path, jdl.toString());
}
