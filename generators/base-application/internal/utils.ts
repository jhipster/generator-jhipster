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
import { defaults } from 'lodash-es';

import { Validations, databaseTypes, fieldTypes } from '../../../lib/jhipster/index.ts';
import type { Field as BaseField } from '../../../lib/jhipster/types/field.ts';
import type { EntityAll, EntityAll as ApplicationEntity, UserEntity } from '../../../lib/types/application-all.d.ts';
import { type MutateDataParam, mutateData } from '../../../lib/utils/object.ts';
import { formatDateForChangelog } from '../../base/support/timestamp.ts';
import { LOGIN_REGEX, LOGIN_REGEX_JS } from '../../generator-constants.ts';
import { getDatabaseTypeData } from '../../server/support/database.ts';
import type BaseApplicationGenerator from '../generator.ts';
import { loadRequiredConfigIntoEntity } from '../support/index.ts';
import type {
  Application as BaseApplicationApplication,
  Entity as BaseApplicationEntity,
  Field as BaseApplicationField,
  Relationship as BaseApplicationRelationship,
} from '../types.d.ts';

const { CASSANDRA } = databaseTypes;
const { CommonDBTypes } = fieldTypes;

const { STRING: TYPE_STRING, BOOLEAN: TYPE_BOOLEAN, INSTANT: TYPE_INSTANT } = CommonDBTypes;

const authorityEntityName = 'Authority';

export const getChangelogDateForBuiltInEntities = (
  creationTimestamp: number = Date.now(),
): { User: string; UserManagement: string; Authority: string } => {
  const date = new Date(creationTimestamp);
  return {
    User: formatDateForChangelog(date),
    UserManagement: formatDateForChangelog(new Date(date.getTime() + 1 * 60000)),
    Authority: formatDateForChangelog(new Date(date.getTime() + 2 * 60000)),
  };
};

export function createUserEntity(
  this: BaseApplicationGenerator,
  customUserData: Partial<UserEntity> = {},
  application: BaseApplicationApplication<BaseApplicationEntity>,
): Partial<UserEntity> {
  if (customUserData.relationships?.length) {
    this.log.warn('Relationships on the User entity side will be disregarded');
  }
  if (customUserData.fields?.some(field => field.fieldName !== 'id')) {
    this.log.warn('Fields on the User entity side (other than id) will be disregarded');
  }

  const cassandraOrNoDatabase = application.databaseTypeNo || application.databaseTypeCassandra;
  const hasImageField = !cassandraOrNoDatabase;
  // Create entity definition for built-in entity to make easier to deal with relationships.
  const user: Partial<UserEntity> = {
    name: 'User',
    builtIn: true,
    changelogDate: getChangelogDateForBuiltInEntities(this.jhipsterConfig.creationTimestamp).User,
    entityTableName: `${application.jhiTablePrefix}_user`,
    relationships: [],
    fields: customUserData.fields ?? [],
    dto: 'any',
    dtoMapstruct: true,
    dtoAny: true,
    adminUserDto: `AdminUser${application.dtoSuffix ?? ''}`,
    builtInUser: true,
    skipClient: application.clientFrameworkReact || application.clientFrameworkVue,
    skipDbChangelog: true,
    entityDomainLayer: false,
    entityPersistenceLayer: false,
    entityRestLayer: false,
    entitySearchLayer: false,
    hasImageField: !cassandraOrNoDatabase,
    pagination: cassandraOrNoDatabase ? 'no' : 'pagination',
    auditableEntity: !cassandraOrNoDatabase,
    i18nKeyPrefix: 'userManagement',
    ...customUserData,
  };

  loadRequiredConfigIntoEntity(user, application);
  // Fallback to defaults for test cases.
  loadRequiredConfigIntoEntity(user, this.jhipsterConfigWithDefaults as BaseApplicationApplication<BaseApplicationEntity>);

  const oauth2 = application.authenticationTypeOauth2;
  // If oauth2 or databaseType is cassandra, force type string, otherwise keep undefined for later processing.
  const userIdType = oauth2 || user.databaseType === CASSANDRA ? TYPE_STRING : undefined;
  const fieldValidateRulesMaxlength = userIdType === TYPE_STRING ? 100 : undefined;

  addOrExtendFields(user.fields!, [
    {
      fieldName: 'id',
      fieldType: userIdType,
      fieldValidateRulesMaxlength,
      propertyTranslationKey: 'global.field.id',
      fieldNameHumanized: 'ID',
      readonly: true,
      id: true,
      builtIn: true,
    },
    {
      fieldName: 'login',
      fieldType: TYPE_STRING,
      fieldValidateRules: [Validations.REQUIRED, Validations.UNIQUE, Validations.MAXLENGTH, Validations.PATTERN],
      fieldValidateRulesMaxlength: 50,
      fieldValidateRulesPattern: LOGIN_REGEX_JS,
      fieldValidateRulesPatternJava: LOGIN_REGEX,
      builtIn: true,
      fakerTemplate: '{{internet.username}}',
    },
    {
      fieldName: 'firstName',
      fieldType: TYPE_STRING,
      fieldValidateRules: [Validations.MAXLENGTH],
      fieldValidateRulesMaxlength: 50,
      builtIn: true,
      fakerTemplate: '{{person.firstName}}',
    },
    {
      fieldName: 'lastName',
      fieldType: TYPE_STRING,
      fieldValidateRules: [Validations.MAXLENGTH],
      fieldValidateRulesMaxlength: 50,
      builtIn: true,
      fakerTemplate: '{{person.lastName}}',
    },
    {
      fieldName: 'email',
      fieldType: TYPE_STRING,
      fieldValidateRules: [Validations.REQUIRED, Validations.UNIQUE, Validations.MAXLENGTH, Validations.MINLENGTH],
      fieldValidateRulesMinlength: 5,
      fieldValidateRulesMaxlength: 191,
      builtIn: true,
      fakerTemplate: '{{internet.email}}',
    },
    ...(application.enableTranslation ?
      [
        {
          fieldName: 'langKey',
          fieldType: TYPE_STRING,
          fieldValidateRules: [Validations.MAXLENGTH],
          fieldValidateRulesMaxlength: 10,
          builtIn: true,
        },
      ]
    : []),
    ...(hasImageField ?
      [
        {
          fieldName: 'imageUrl',
          fieldType: TYPE_STRING,
          fieldValidateRules: [Validations.MAXLENGTH],
          fieldValidateRulesMaxlength: 256,
          builtIn: true,
        },
      ]
    : []),
    {
      fieldName: 'activated',
      fieldType: TYPE_BOOLEAN,
      builtIn: true,
      autoGenerate: true,
      defaultValue: true,
    },
  ] as BaseApplicationField[]);

  return user;
}

function getAuditFields(): (BaseField & Partial<BaseApplicationField>)[] {
  return [
    {
      fieldName: 'createdBy',
      fieldType: TYPE_STRING,
      autoGenerate: true,
      readonly: true,
    },
    {
      fieldName: 'createdDate',
      fieldType: TYPE_INSTANT,
      autoGenerate: true,
      readonly: true,
    },
    {
      fieldName: 'lastModifiedBy',
      fieldType: TYPE_STRING,
      autoGenerate: true,
      readonly: true,
    },
    {
      fieldName: 'lastModifiedDate',
      fieldType: TYPE_INSTANT,
      autoGenerate: true,
      readonly: true,
    },
  ] as const;
}

export function createUserManagementEntity(
  this: BaseApplicationGenerator,
  {
    fields: customUserManagementFields = [],
    relationships: customUserManagementRelationships = [],
    ...customUserManagementData
  }: Partial<ApplicationEntity> = {},
  application: BaseApplicationApplication<EntityAll>,
): Partial<ApplicationEntity> {
  const user = createUserEntity.call(this, {}, application);

  const userManagement = {
    ...user,
    name: 'UserManagement',
    skipClient: true,
    skipServer: true,
    changelogDate: getChangelogDateForBuiltInEntities(this.jhipsterConfig.creationTimestamp).UserManagement,
    clientRootFolder: 'admin',
    entityAngularName: 'UserManagement',
    entityApiUrl: 'admin/users',
    entityFileName: 'user-management',
    ...customUserManagementData,
    adminEntity: true,
    builtInUser: false,
    builtInUserManagement: true,
    entityRestLayer: true,
    entityTranslationKeyMenuPath: 'userManagement.home.title',
    entityTranslationKey: 'userManagement',
  };

  mutateData(userManagement, {
    entityPage: ({ skipClient }) => (skipClient && !application.clientFrameworkAngular ? 'admin/user-management' : undefined),
  });

  mutateFields(userManagement.fields!, [
    { fieldName: 'login', id: true },
    {
      fieldName: 'id',
      hidden: true,
      id: false,
      // Set id type fallback since it's not id anymore and will not be calculated.
      fieldType: ({ fieldType }) => fieldType ?? getDatabaseTypeData(application.databaseType).defaultPrimaryKeyType,
    },
    { fieldName: 'firstName', hideListView: true },
    { fieldName: 'lastName', hideListView: true },
  ]);

  if (user.hasImageField) {
    mutateFields(userManagement.fields!, [{ fieldName: 'imageUrl', hidden: true }]);
  }

  if (application.enableTranslation) {
    const langKeyFieldValues = (application.languages as string[])?.map(lang => lang)?.join(',');
    mutateFields(userManagement.fields!, [
      {
        fieldName: 'langKey',
        skipServer: true,
        fieldType: 'Languages',
        fieldValues: langKeyFieldValues,
      },
    ]);
  }

  if (!application.databaseTypeCassandra) {
    addOrExtendFields(userManagement.fields!, getAuditFields());
  }

  if (application.generateBuiltInAuthorityEntity) {
    addOrExtendRelationships(userManagement.relationships!, [
      {
        otherEntityName: 'Authority',
        relationshipName: 'authority',
        relationshipType: 'many-to-many',
        relationshipIgnoreBackReference: true,
        propertyTranslationKey: 'userManagement.profiles',
      },
    ]);
  }

  addOrExtendFields(userManagement.fields!, customUserManagementFields);
  addOrExtendRelationships(userManagement.relationships!, customUserManagementRelationships);

  return userManagement;
}

export function createAuthorityEntity(
  this: BaseApplicationGenerator,
  customAuthorityData: Partial<ApplicationEntity> = {},
  application: BaseApplicationApplication<BaseApplicationEntity>,
): Partial<ApplicationEntity> {
  if (customAuthorityData.relationships?.length) {
    this.log.warn(`Relationships on the ${authorityEntityName} entity side will be disregarded`);
  }
  if (customAuthorityData.fields?.some(field => field.fieldName !== 'name')) {
    this.log.warn(`Fields on the ${authorityEntityName} entity side (other than name) will be disregarded`);
  }

  // Create entity definition for built-in entity to make easier to deal with relationships.
  const authorityEntity: Partial<ApplicationEntity> = {
    name: authorityEntityName,
    entitySuffix: '',
    clientRootFolder: 'admin',
    builtIn: true,
    changelogDate: getChangelogDateForBuiltInEntities(this.jhipsterConfig.creationTimestamp).Authority,
    adminEntity: true,
    entityTableName: `${application.jhiTablePrefix}_authority`,
    relationships: [],
    fields: customAuthorityData.fields ?? [],
    builtInAuthority: true,
    skipClient: !application.backendTypeSpringBoot || application.clientFrameworkReact || application.clientFrameworkVue,
    searchEngine: 'no',
    service: 'no',
    dto: 'no',
    entityR2dbcRepository: true,
    skipDbChangelog: true,
    entityDomainLayer: application.backendTypeSpringBoot,
    entityPersistenceLayer: application.backendTypeSpringBoot,
    entityRestLayer: application.backendTypeSpringBoot && !application.applicationTypeMicroservice,
    ...customAuthorityData,
  };

  loadRequiredConfigIntoEntity(authorityEntity, application);
  // Fallback to defaults for test cases.
  loadRequiredConfigIntoEntity(authorityEntity, this.jhipsterConfigWithDefaults as BaseApplicationApplication<BaseApplicationEntity>);

  addOrExtendFields(authorityEntity.fields!, [
    {
      fieldName: 'name',
      fieldType: TYPE_STRING,
      id: true,
      fieldValidateRules: [Validations.MAXLENGTH, Validations.REQUIRED],
      fieldValidateRulesMaxlength: 50,
      builtIn: true,
    },
  ]);

  return authorityEntity;
}

function mutateFields<const F extends BaseField = BaseField>(fields: F[], fieldsToMutate: MutateDataParam<F>[]): void {
  for (const fieldToMutate of fieldsToMutate) {
    const { fieldName: fieldNameToMutate } = fieldToMutate;
    const field = fields.find(field => field.fieldName === fieldNameToMutate);
    if (!field) {
      throw new Error(`Field with name ${fieldNameToMutate} not found`);
    }
    mutateData(field, { __override__: true, ...fieldToMutate });
  }
}

function addOrExtendFields<const F extends BaseField = BaseField>(
  fields: F[],
  fieldsToAdd: ({ fieldName: string; id?: boolean } & Partial<F>)[],
): void {
  for (const fieldToAdd of fieldsToAdd) {
    const { fieldName: newFieldName, id } = fieldToAdd;
    let field = fields.find(field => field.fieldName === newFieldName);
    if (field) {
      Object.assign(field, fieldToAdd);
    } else {
      field = { ...fieldToAdd } as F;
      if (id) {
        fields.unshift(field);
      } else {
        fields.push(field);
      }
    }
  }
}

function addOrExtendRelationships<const R extends BaseApplicationRelationship>(relationships: R[], relationshipsToAdd: Partial<R>[]): void {
  for (const relationshipToAdd of relationshipsToAdd) {
    const { relationshipName: newrelationshipName } = relationshipToAdd;
    let relationship = relationships.find(relationship => relationship.relationshipName === newrelationshipName);
    if (relationship) {
      defaults(relationship, relationshipToAdd);
    } else {
      relationship = { ...relationshipToAdd } as R;
      relationships.push(relationship);
    }
  }
}
