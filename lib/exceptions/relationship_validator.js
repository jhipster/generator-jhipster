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

const Validator = require('./validator');
const { exists } = require('../core/jhipster/relationship_types');

const { JPA_DERIVED_IDENTIFIER } = require('../core/jhipster/relationship_options');
const { ONE_TO_ONE, MANY_TO_MANY, MANY_TO_ONE, ONE_TO_MANY } = require('../core/jhipster/relationship_types');

class RelationshipValidator extends Validator {
  constructor() {
    super('relationship', ['from', 'to', 'type']);
  }

  validate(jdlRelationship, skippedUserManagementOption) {
    super.validate(jdlRelationship);
    checkType(jdlRelationship);
    checkInjectedFields(jdlRelationship);
    checkForValidUseOfJPaDerivedIdentifier(jdlRelationship);
    checkForRequiredReflexiveRelationship(jdlRelationship);
    checkForInvalidUseOfTheUserEntity(jdlRelationship, skippedUserManagementOption);
    checkRelationshipType(jdlRelationship, skippedUserManagementOption);
  }
}

module.exports = RelationshipValidator;

function checkType(jdlRelationship) {
  if (!exists(jdlRelationship.type)) {
    throw new Error(`The relationship type '${jdlRelationship.type}' doesn't exist.`);
  }
}

function checkInjectedFields(jdlRelationship) {
  if (!(jdlRelationship.injectedFieldInFrom || jdlRelationship.injectedFieldInTo)) {
    throw new Error('At least one injected field is required.');
  }
}

function checkForValidUseOfJPaDerivedIdentifier(jdlRelationship) {
  if (jdlRelationship.type !== ONE_TO_ONE && jdlRelationship.hasOption(JPA_DERIVED_IDENTIFIER)) {
    throw new Error(`Only a ${ONE_TO_ONE} relationship can have the '${JPA_DERIVED_IDENTIFIER}' option.`);
  }
}

function checkForRequiredReflexiveRelationship(jdlRelationship) {
  if (
    jdlRelationship.from.toLowerCase() === jdlRelationship.to.toLowerCase() &&
    (jdlRelationship.isInjectedFieldInFromRequired || jdlRelationship.isInjectedFieldInToRequired)
  ) {
    throw new Error(
      'Required relationships to the same entity are not supported, for relationship from and to ' +
        `'${jdlRelationship.from}'.`
    );
  }
}

function checkForInvalidUseOfTheUserEntity(jdlRelationship, skippedUserManagementOption) {
  const userIsTheSourceAndTheDestination = isEntityTheUser(jdlRelationship.from) && isEntityTheUser(jdlRelationship.to);
  if (userIsTheSourceAndTheDestination && !skippedUserManagementOption) {
    throw new Error(
      'Having the source and the destination entities being the User is forbidden unless the User ' +
        "entity is not managed by JHipster (use the 'skipUserManagement' option)."
    );
  }
  checkForForbiddenUseOfUserAsSource(jdlRelationship, skippedUserManagementOption);
}

function checkForForbiddenUseOfUserAsSource(jdlRelationship, skippedUserManagementOption) {
  const userIsTheSource = isEntityTheUser(jdlRelationship.from);
  if (userIsTheSource && !skippedUserManagementOption) {
    throw new Error(
      `Relationships from the User entity is not supported in the declaration between '${jdlRelationship.from}' and ` +
        `'${jdlRelationship.to}'. You can have this by using the 'skipUserManagement' option.`
    );
  }
}

function checkRelationshipType(jdlRelationship, skippedUserManagementOption) {
  switch (jdlRelationship.type) {
    case ONE_TO_ONE:
      checkOneToOneRelationship(jdlRelationship, skippedUserManagementOption);
      break;
    case MANY_TO_ONE:
      checkManyToOneRelationship(jdlRelationship, skippedUserManagementOption);
      break;
    case MANY_TO_MANY:
      checkManyToManyRelationship(jdlRelationship);
      break;
    case ONE_TO_MANY:
      return;
    default:
      // never happens, ever.
      throw new Error(`This case shouldn't have happened with type ${jdlRelationship.type}.`);
  }
}

function checkOneToOneRelationship(jdlRelationship) {
  if (!jdlRelationship.injectedFieldInFrom) {
    throw new Error(
      `In the One-to-One relationship from ${jdlRelationship.from} to ${jdlRelationship.to}, ` +
        'the source entity must possess the destination, or you must invert the direction of the relationship.'
    );
  }
}

function checkManyToOneRelationship(jdlRelationship, skippedUserManagementOption) {
  const bidirectionalRelationship = jdlRelationship.injectedFieldInFrom && jdlRelationship.injectedFieldInTo;
  if (bidirectionalRelationship) {
    throw new Error(
      `In the Many-to-One relationship from ${jdlRelationship.from} to ${jdlRelationship.to}, ` +
        'only unidirectionality is supported, you should either create a bidirectional One-to-Many relationship or ' +
        'remove the injected field in the destination entity instead.'
    );
  }
  const unidirectionalRelationship = !jdlRelationship.injectedFieldInFrom || !jdlRelationship.injectedFieldInTo;
  const userIsTheSourceEntity = isEntityTheUser(jdlRelationship.from);
  const userIsTheDestinationEntity = isEntityTheUser(jdlRelationship.to);
  const userHasTheInjectedField =
    (userIsTheSourceEntity && jdlRelationship.injectedFieldInFrom) ||
    (userIsTheDestinationEntity && jdlRelationship.injectedFieldInTo);
  if (unidirectionalRelationship && userHasTheInjectedField && !skippedUserManagementOption) {
    throw new Error(
      `In the Many-to-One relationship from ${jdlRelationship.from} to ${jdlRelationship.to}, ` +
        'the User entity has the injected field without its management being skipped. ' +
        "To have such a relation, you should use the 'skipUserManagement' option."
    );
  }
}

function checkManyToManyRelationship(jdlRelationship) {
  const destinationEntityIsTheUser = isEntityTheUser(jdlRelationship.to);
  if (jdlRelationship.injectedFieldInFrom && !jdlRelationship.injectedFieldInTo && destinationEntityIsTheUser) {
    // This is a valid case: even though bidirectionality is required for MtM relationships, having the destination
    // entity being the User is possible.
    return;
  }
  const unidirectionalRelationship = !jdlRelationship.injectedFieldInFrom || !jdlRelationship.injectedFieldInTo;
  if (unidirectionalRelationship) {
    const injectedFieldInSourceEntity = !jdlRelationship.injectedFieldInFrom
      ? 'not set'
      : `'${jdlRelationship.injectedFieldInFrom}'`;
    const injectedFieldInDestinationEntity = !jdlRelationship.injectedFieldInTo
      ? 'not set'
      : `'${jdlRelationship.injectedFieldInTo}'`;
    throw new Error(
      `In the Many-to-Many relationship from ${jdlRelationship.from} to ${jdlRelationship.to}, only ` +
        `bidirectionality is supported. The injected field in the source entity is ${injectedFieldInSourceEntity} ` +
        `and the injected field in the destination entity is ${injectedFieldInDestinationEntity}.`
    );
  }
}

function isEntityTheUser(entityName) {
  return entityName.toLowerCase() === 'user';
}
