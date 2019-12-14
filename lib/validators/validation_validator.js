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
const { exists, needsValue } = require('../core/jhipster/validations');

class ValidationValidator extends Validator {
  constructor() {
    super('validation', ['name']);
  }

  validate(jdlValidation) {
    super.validate(jdlValidation);
    checkForInvalidName(jdlValidation);
    checkForRequiredValue(jdlValidation);
  }
}

module.exports = ValidationValidator;

function checkForInvalidName(jdlValidation) {
  if (!exists(jdlValidation.name)) {
    throw new Error(`The validation ${jdlValidation.name} doesn't exist.`);
  }
}

function checkForRequiredValue(jdlValidation) {
  if (jdlValidation.value == null && needsValue(jdlValidation.name)) {
    throw new Error(`The validation ${jdlValidation.name} requires a value.`);
  }
}
