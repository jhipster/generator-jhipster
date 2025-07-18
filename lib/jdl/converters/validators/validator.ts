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

export default class Validator {
  objectType: string;
  fieldsToCheck: string[];

  constructor(objectType: string, fieldsToCheck: string[]) {
    this.objectType = objectType;
    this.fieldsToCheck = fieldsToCheck;
  }

  validate(object: Record<string, any>) {
    if (!object) {
      throw new Error(`No ${this.objectType}.`);
    }
    checkForAbsentAttributes(this, object);
  }
}

function checkForAbsentAttributes(validator: Validator, object: Record<string, any>) {
  const absentAttributes: string[] = [];
  validator.fieldsToCheck.forEach(attribute => {
    if (object[attribute] === undefined) {
      absentAttributes.push(attribute);
    }
  });
  if (absentAttributes.length !== 0) {
    const plural = absentAttributes.length > 1;
    throw new Error(
      `The ${validator.objectType} attribute${plural ? 's' : ''} ${absentAttributes.join(', ')} ${plural ? 'were not' : 'was not'} found.`,
    );
  }
}
