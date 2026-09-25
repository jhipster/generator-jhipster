/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { relationshipTypeExists } from '../../core/basic-types/relationship-types.ts';
import type JDLRelationship from '../../core/models/jdl-relationship.ts';

import Validator from './validator.ts';

export default class RelationshipValidator extends Validator {
  constructor() {
    super('relationship', ['from', 'to', 'type']);
  }

  validate(jdlRelationship: JDLRelationship) {
    super.validate(jdlRelationship);
    checkType(jdlRelationship);
    checkInjectedFields(jdlRelationship);
  }
}

function checkType(jdlRelationship: JDLRelationship) {
  if (!relationshipTypeExists(jdlRelationship.type)) {
    throw new Error(`The relationship type '${jdlRelationship.type}' doesn't exist.`);
  }
}

function checkInjectedFields(jdlRelationship: JDLRelationship) {
  if (!(jdlRelationship.injectedFieldInFrom || jdlRelationship.injectedFieldInTo)) {
    throw new Error('At least one injected field is required.');
  }
}
