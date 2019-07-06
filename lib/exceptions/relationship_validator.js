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

const { JPA_DERIVED_IDENTIFIER, doesRelationshipOptionExist } = require('../core/jhipster/relationship_options');
const { ONE_TO_ONE } = require('../core/jhipster/relationship_types');

const USER = 'User';

let configuration = {};
let errors;

module.exports = {
  getRelationshipErrors
};

function getRelationshipErrors({
  jdlRelationships,
  doesEntityExist,
  configuration: { skipUserManagementOption, applicationsPerEntityName, applicationQuantity }
}) {
  errors = [];
  configuration = {
    jdlRelationships,
    doesEntityExist,
    skipUserManagementOption,
    applicationsPerEntityName,
    applicationQuantity
  };
  jdlRelationships.forEach(jdlRelationship => {
    checkForAbsentEntities(jdlRelationship);
    checkForForbiddenUseOfUserAsSource(jdlRelationship);
    checkRelationshipOptions(jdlRelationship);
    checkForValidUseOfJPaDerivedIdentifier(jdlRelationship);
    checkForRequiredReflexiveRelationship(jdlRelationship);
    if (applicationQuantity !== 0) {
      checkForRelationshipsBetweenApplications(jdlRelationship);
    }
  });
  return errors;
}

function checkForAbsentEntities(jdlRelationship) {
  const absentEntities = [];
  if (!configuration.doesEntityExist(jdlRelationship.from)) {
    absentEntities.push(jdlRelationship.from);
  }
  if (
    !configuration.doesEntityExist(jdlRelationship.to) &&
    (jdlRelationship.to.toLowerCase() !== USER.toLowerCase() || configuration.skipUserManagementOption)
  ) {
    absentEntities.push(jdlRelationship.to);
  }
  if (absentEntities.length !== 0) {
    errors.push(
      `In the relationship between ${jdlRelationship.from} and ${jdlRelationship.to}, ` +
        `${absentEntities.join(' and ')} ${absentEntities.length === 1 ? 'is' : 'are'} not declared.`
    );
  }
}
function checkRelationshipOptions(jdlRelationship) {
  const invalidOptions = [];
  jdlRelationship.forEachOption(option => {
    if (!doesRelationshipOptionExist(option)) {
      invalidOptions.push(option);
    }
  });
  if (invalidOptions.length !== 0) {
    const errorMessage = `Th${invalidOptions.length === 1 ? 'is' : 'ese'} relationship option${
      invalidOptions.length === 1 ? '' : 's'
    } do${invalidOptions.length === 1 ? 'es' : ''} not exist`;
    errors.push(
      `${errorMessage}: '${invalidOptions.join(', ')}' for relationship from '${jdlRelationship.from}' to '${
        jdlRelationship.to
      }'.`
    );
  }
}
function checkForValidUseOfJPaDerivedIdentifier(jdlRelationship) {
  if (jdlRelationship.type !== ONE_TO_ONE && jdlRelationship.hasOption(JPA_DERIVED_IDENTIFIER)) {
    errors.push(`Only a One to One relationship can have the '${JPA_DERIVED_IDENTIFIER}' option.`);
  }
}
function checkForForbiddenUseOfUserAsSource(jdlRelationship) {
  if (jdlRelationship.from.toLowerCase() === USER.toLowerCase() && !configuration.skipUserManagementOption) {
    errors.push(
      `Relationships from the User entity is not supported in the declaration between '${jdlRelationship.from}' and '${jdlRelationship.to}'.`
    );
  }
}
function checkForRequiredReflexiveRelationship(jdlRelationship) {
  if (
    jdlRelationship.from.toLowerCase() === jdlRelationship.to.toLowerCase() &&
    (jdlRelationship.isInjectedFieldInFromRequired || jdlRelationship.isInjectedFieldInToRequired)
  ) {
    errors.push(
      'Required relationships to the same entity are not supported, for relationship from ' +
        `'${jdlRelationship.from}' to '${jdlRelationship.to}'.`
    );
  }
}
function checkForRelationshipsBetweenApplications(jdlRelationship) {
  let applicationsForSourceEntity = configuration.applicationsPerEntityName[jdlRelationship.from];
  let applicationsForDestinationEntity = configuration.applicationsPerEntityName[jdlRelationship.to];
  if (!applicationsForDestinationEntity || !applicationsForSourceEntity) {
    return;
  }
  applicationsForSourceEntity = applicationsForSourceEntity.map(jdlApplication => jdlApplication.config.baseName);
  applicationsForDestinationEntity = applicationsForDestinationEntity.map(
    jdlApplication => jdlApplication.config.baseName
  );
  const difference = applicationsForSourceEntity.filter(
    application => !applicationsForDestinationEntity.includes(application)
  );
  if (difference.length !== 0) {
    errors.push(
      `Entities for the ${jdlRelationship.type} relationship from '${jdlRelationship.from}' to '${jdlRelationship.to}' do not belong to the same application.`
    );
  }
}
