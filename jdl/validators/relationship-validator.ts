/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import Validator from './validator.js';
import { relationshipTypes, relationshipOptions } from '../jhipster/index.mjs';
import JDLRelationship from '../models/jdl-relationship.js';
import { relationshipTypeExists } from '../jhipster/relationship-types.js';

const { ONE_TO_ONE, MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY } = relationshipTypes;
const { BUILT_IN_ENTITY } = relationshipOptions;

export default class RelationshipValidator extends Validator {
  constructor() {
    super('relationship', ['from', 'to', 'type']);
  }

  validate(jdlRelationship: JDLRelationship) {
    super.validate(jdlRelationship);
    checkType(jdlRelationship);
    checkInjectedFields(jdlRelationship);
    checkForRequiredReflexiveRelationship(jdlRelationship);
    checkRelationshipType(jdlRelationship);
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

function checkForRequiredReflexiveRelationship(jdlRelationship: JDLRelationship) {
  if (
    jdlRelationship.from.toLowerCase() === jdlRelationship.to.toLowerCase() &&
    (jdlRelationship.isInjectedFieldInFromRequired || jdlRelationship.isInjectedFieldInToRequired)
  ) {
    throw new Error(`Required relationships to the same entity are not supported, for relationship from and to '${jdlRelationship.from}'.`);
  }
}

function checkRelationshipType(jdlRelationship: JDLRelationship) {
  switch (jdlRelationship.type) {
    case ONE_TO_ONE:
      checkOneToOneRelationship(jdlRelationship);
      break;
    case MANY_TO_ONE:
    case MANY_TO_MANY:
    case ONE_TO_MANY:
      return;
    default:
      // never happens, ever.
      throw new Error(`This case shouldn't have happened with type ${jdlRelationship.type}.`);
  }
}

function checkOneToOneRelationship(jdlRelationship: JDLRelationship) {
  if (!jdlRelationship.injectedFieldInFrom) {
    throw new Error(
      `In the One-to-One relationship from ${jdlRelationship.from} to ${jdlRelationship.to}, ` +
        'the source entity must possess the destination, or you must invert the direction of the relationship.'
    );
  }
}
