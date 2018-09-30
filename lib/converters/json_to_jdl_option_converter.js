/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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

const JDLObject = require('../core/jdl_object');
const JDLUnaryOption = require('../core/jdl_unary_option');
const { SKIP_CLIENT, SKIP_SERVER, SKIP_USER_MANAGEMENT } = require('../core/jhipster/unary_options');

module.exports = {
  convertServerOptionsToJDL
};

/**
 * Parses the jhipster configuration into JDL.
 * @param config the jhipster config ('generator-jhipster' in .yo-rc.json)
 * @param jdl {JDLObject} to which the parsed options are added. If undefined a new JDLObject is created.
 * @returns {JDLObject} the JDLObject
 */
function convertServerOptionsToJDL(config, jdl) {
  const jdlObject = jdl || new JDLObject();
  const jhipsterConfig = config || {};
  [SKIP_CLIENT, SKIP_SERVER, SKIP_USER_MANAGEMENT].forEach(option => {
    if (jhipsterConfig[option] === true) {
      jdlObject.addOption(
        new JDLUnaryOption({
          name: option,
          value: jhipsterConfig[option]
        })
      );
    }
  });
  return jdlObject;
}
