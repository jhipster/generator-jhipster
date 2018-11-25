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

const ERROR_CASES = {
  applications: {
    NoApplication: 'No application',
    NoName: 'No name',
    NoVersion: 'No generator version',
    NoAuthenticationType: 'No authentication type',
    NoBuildTool: 'No build tool',
    NoChosenLanguage: 'No chosen language when selecting i18n option',
    ShouldSkipClient: 'Client generation should be skipped for microservice and UAA applications',
    ShouldNotSkipServer: 'Server generation should not be skipped for microservice and UAA applications',
    IllegalSkipServer: 'A database type and authentication type should be defined when using skip server',
    NoUAAAppFolderPath: 'No UAA application folder path'
  },
  deployments: {
    NoDeployment: 'No deployment',
    NoDeploymentType: 'No deployment type',
    NoApplications: 'No applications',
    NoRepository: 'No Docker repository'
  },
  entities: {
    NoEntity: 'No entity',
    NoName: 'No entity name',
    NoTableName: 'No table name',
    NoFields: 'No fields object',
    ReservedWordAsName: 'The entity name cannot be a reserved keyword',
    ReservedWordAsTableName: 'The entity table name cannot be a reserved keyword'
  },
  fields: {
    NoField: 'No field',
    NoName: 'No field name',
    NoType: 'No field type',
    ReservedWordAsName: 'The field name cannot be a reserved keyword'
  },
  validations: {
    NoValidation: 'No validation',
    NoName: 'No validation name',
    WrongValidation: 'Wrong validation',
    NoValue: 'No value'
  },
  enums: {
    NoEnum: 'No enumeration',
    NoName: 'No enumeration name',
    ReservedWordAsName: 'The enum name cannot be a reserved keyword'
  },
  relationships: {
    NoRelationship: 'No relationship',
    WrongType: 'Wrong type'
  },
  options: {
    NoOption: 'No option',
    NoName: 'No option name',
    NoEntityNames: 'No entity names',
    NilInEntityNames: 'Nil value in entity names',
    NoExcludedNames: 'No excluded names',
    NilInExcludedNames: 'Nil value in excluded names',
    NoType: 'No type'
  }
};

module.exports = {
  ErrorCases: ERROR_CASES
};
