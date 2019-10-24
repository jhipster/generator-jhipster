/** Copyright 2013-2019 the original author or authors from the JHipster project.
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

const Validator = require('./validator');
const { isReservedClassName } = require('../core/jhipster/reserved_keywords');

class EntityValidator extends Validator {
  constructor() {
    super('entity', ['name', 'tableName']);
  }

  validate(jdlEntity) {
    super.validate(jdlEntity);
    checkForReservedClassName(jdlEntity);
  }
}

module.exports = EntityValidator;

function checkForReservedClassName(jdlEntity) {
  if (isReservedClassName(jdlEntity.name)) {
    throw new Error(`The name '${jdlEntity.name}' is a reserved keyword and can not be used as an entity class name.`);
  }
}
