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

import { validations } from '../../core/built-in-options/index.js';
import type JDLValidation from '../../core/models/jdl-validation.ts';
import Validator from './validator.js';

const {
  Validations: { exists, needsValue, MINLENGTH, MAXLENGTH, MAXBYTES, MINBYTES },
} = validations;

export default class ValidationValidator extends Validator {
  constructor() {
    super('validation', ['name']);
  }

  validate(jdlValidation: JDLValidation) {
    super.validate(jdlValidation);
    checkForInvalidName(jdlValidation);
    checkForRequiredValue(jdlValidation);
    if (([MINLENGTH, MAXLENGTH, MAXBYTES, MINBYTES] as string[]).includes(jdlValidation.name)) {
      checkForInvalidNumericValue(jdlValidation);
    }
  }
}

function checkForInvalidName(jdlValidation: JDLValidation) {
  if (!exists(jdlValidation.name)) {
    throw new Error(`The validation ${jdlValidation.name} doesn't exist.`);
  }
}

function checkForRequiredValue(jdlValidation: JDLValidation) {
  if (jdlValidation.value == null && needsValue(jdlValidation.name)) {
    throw new Error(`The validation ${jdlValidation.name} requires a value.`);
  }
}

function checkForInvalidNumericValue(jdlValidation: JDLValidation) {
  if (jdlValidation.value!.toString().includes('.')) {
    throw new Error(`Decimal values are forbidden for the ${jdlValidation.name} validation.`);
  }
}
