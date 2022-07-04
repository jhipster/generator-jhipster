/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import assert from 'assert';
import lodash from 'lodash';

import BaseEntityGenerator from '../generator-base-entities.cjs';
import {
  PRIORITY_PREFIX,
  LOADING_PRIORITY,
  PREPARING_PRIORITY,
  CONFIGURING_EACH_ENTITY_PRIORITY,
  LOADING_EACH_ENTITY_PRIORITY,
  PREPARING_EACH_ENTITY_PRIORITY,
  PREPARING_EACH_ENTITY_FIELD_PRIORITY,
  PREPARING_EACH_ENTITY_RELATIONSHIP_PRIORITY,
  POST_PREPARING_EACH_ENTITY_PRIORITY,
} from '../../lib/constants/priorities.mjs';

import validations from '../../jdl/jhipster/validations.js';
import fieldTypes from '../../jdl/jhipster/field-types.js';
import authenticationType from '../../jdl/jhipster/authentication-types.js';
import constants from '../generator-constants.js';
import utils from '../../utils/index.js';
import entityUtils from '../../utils/entity.js';
import fieldUtils from '../../utils/field.js';
import relationshipUtils from '../../utils/relationship.js';
import { createUserEntity } from '../../utils/user.js';

const { sortedUniq, intersection, upperFirst } = lodash;
const { prepareFieldForTemplates, fieldIsEnum } = fieldUtils;
const { prepareRelationshipForTemplates } = relationshipUtils;
const { OAUTH2 } = authenticationType;

const { CommonDBTypes, RelationalOnlyDBTypes, BlobTypes } = fieldTypes;

const { BIG_DECIMAL, BOOLEAN, DURATION, INSTANT, LOCAL_DATE, UUID, ZONED_DATE_TIME } = CommonDBTypes;
const { BYTES, BYTE_BUFFER } = RelationalOnlyDBTypes;
const { IMAGE, TEXT } = BlobTypes;

const { prepareEntityForTemplates, prepareEntityPrimaryKeyForTemplates, derivedPrimaryKeyProperties, loadRequiredConfigIntoEntity } =
  entityUtils;

const { MAX, MIN, MAXLENGTH, MINLENGTH, MAXBYTES, MINBYTES, PATTERN } = validations;
const { SUPPORTED_VALIDATION_RULES } = constants;
const { stringify } = utils;

export default class extends BaseEntityGenerator {
  constructor(args, options, features) {
    super(args, options, { unique: 'namespace', taskPrefix: PRIORITY_PREFIX, ...features });

    if (this.options.help) return;

    this.loadStoredAppOptions();
    this.loadRuntimeOptions();
  }

  get loading() {
    return {
      loadApplication({ application }) {
        this.loadAppConfig(undefined, application);
        this.loadClientConfig(undefined, application);
        this.loadServerConfig(undefined, application);
        this.loadTranslationConfig(undefined, application);
        this.loadPlatformConfig(undefined, application);
      },
      loadUser() {
        if (this.jhipsterConfig.skipUserManagement && this.jhipsterConfig.authenticationType !== OAUTH2) {
          return;
        }
        if (this.sharedData.hasEntity('User')) {
          throw new Error("Fail to bootstrap 'User', already exists.");
        }

        this.sharedData.setEntity('User', createUserEntity.call(this));
      },
    };
  }

  get [LOADING_PRIORITY]() {
    return this.loading;
  }

  get preparing() {
    return {
      prepareApplication({ application }) {
        this.loadDerivedAppConfig(application);
        this.loadDerivedClientConfig(application);
        this.loadDerivedServerConfig(application);
        this.loadDerivedPlatformConfig(application);
      },
    };
  }

  get [PREPARING_PRIORITY]() {
    return this.preparing;
  }

  get configuringEachEntity() {
    return {
      configureEntity({ entityStorage, entityConfig }) {
        entityStorage.defaults({ fields: [], relationships: [] });

        if (entityConfig.changelogDate === undefined) {
          entityConfig.changelogDate = this.dateFormatForLiquibase();
        }
      },
      configureFields({ entityName, entityConfig }) {
        entityConfig.fields.forEach(field => {
          const { fieldName, fieldType, fieldValidateRules } = field;

          assert(fieldName, `fieldName is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);
          assert(fieldType, `fieldType is missing in .jhipster/${entityName}.json for field ${stringify(field)}`);

          if (fieldValidateRules !== undefined) {
            assert(
              Array.isArray(fieldValidateRules),
              `fieldValidateRules is not an array in .jhipster/${entityName}.json for field ${stringify(field)}`
            );
            fieldValidateRules.forEach(fieldValidateRule => {
              assert(
                SUPPORTED_VALIDATION_RULES.includes(fieldValidateRule),
                `fieldValidateRules contains unknown validation rule ${fieldValidateRule} in .jhipster/${entityName}.json for field ${stringify(
                  field
                )} [supported validation rules ${SUPPORTED_VALIDATION_RULES}]`
              );
            });
            assert(
              !fieldValidateRules.includes(MAX) || field.fieldValidateRulesMax !== undefined,
              `fieldValidateRulesMax is missing in .jhipster/${entityName}.json for field ${stringify(field)}`
            );
            assert(
              !fieldValidateRules.includes(MIN) || field.fieldValidateRulesMin !== undefined,
              `fieldValidateRulesMin is missing in .jhipster/${entityName}.json for field ${stringify(field)}`
            );
            assert(
              !fieldValidateRules.includes(MAXLENGTH) || field.fieldValidateRulesMaxlength !== undefined,
              `fieldValidateRulesMaxlength is missing in .jhipster/${entityName}.json for field ${stringify(field)}`
            );
            assert(
              !fieldValidateRules.includes(MINLENGTH) || field.fieldValidateRulesMinlength !== undefined,
              `fieldValidateRulesMinlength is missing in .jhipster/${entityName}.json for field ${stringify(field)}`
            );
            assert(
              !fieldValidateRules.includes(MAXBYTES) || field.fieldValidateRulesMaxbytes !== undefined,
              `fieldValidateRulesMaxbytes is missing in .jhipster/${entityName}.json for field ${stringify(field)}`
            );
            assert(
              !fieldValidateRules.includes(MINBYTES) || field.fieldValidateRulesMinbytes !== undefined,
              `fieldValidateRulesMinbytes is missing in .jhipster/${entityName}.json for field ${stringify(field)}`
            );
            assert(
              !fieldValidateRules.includes(PATTERN) || field.fieldValidateRulesPattern !== undefined,
              `fieldValidateRulesPattern is missing in .jhipster/${entityName}.json for field ${stringify(field)}`
            );
          }
        });
      },
      configureRelationships({ entityName, entityStorage, entityConfig }) {
        // Validate entity json relationship content
        entityConfig.relationships.forEach(relationship => {
          const { otherEntityName, relationshipType } = relationship;

          assert(otherEntityName, `otherEntityName is missing in .jhipster/${entityName}.json for relationship ${stringify(relationship)}`);
          assert(
            relationshipType,
            `relationshipType is missing in .jhipster/${entityName}.json for relationship ${stringify(relationship)}`
          );

          if (relationship.relationshipName === undefined) {
            relationship.relationshipName = otherEntityName;
            this.warning(
              `relationshipName is missing in .jhipster/${entityName}.json for relationship ${stringify(relationship)}, using ${
                relationship.otherEntityName
              } as fallback`
            );
          }
        });
        entityStorage.save();
      },
    };
  }

  get [CONFIGURING_EACH_ENTITY_PRIORITY]() {
    return this.configuringEachEntity;
  }

  get loadingEachEntity() {
    return {
      loadingEntities({ application, entityName, entityStorage }) {
        // if already loaded, let the entity generator to initialize entities.
        if (this.sharedData.hasEntity(entityName)) {
          throw new Error(`Fail to bootstrap '${entityName}', already exists.`);
        }
        const entity = entityStorage.getAll();
        this.sharedData.setEntity(entityName, entity);
        loadRequiredConfigIntoEntity(entity, application);
      },
    };
  }

  get [LOADING_EACH_ENTITY_PRIORITY]() {
    return this.loadingEachEntity;
  }

  get preparingEachEntity() {
    return {
      preparingEachEntity({ entity }) {
        prepareEntityForTemplates(entity, this);
      },
    };
  }

  get [PREPARING_EACH_ENTITY_PRIORITY]() {
    return this.preparingEachEntity;
  }

  get preparingEachEntityField() {
    return {
      loadAnnotations({ entity, field }) {
        if (field.options) {
          Object.assign(field, field.options);
        }
      },

      // If primaryKey doesn't exist, create it.
      preparePrimaryKey({ entity }) {
        if (!entity.embedded && !entity.primaryKey) {
          prepareEntityPrimaryKeyForTemplates(entity, this);
        }
      },

      prepareFieldsForTemplates({ entity, field }) {
        prepareFieldForTemplates(entity, field, this);
      },
    };
  }

  get [PREPARING_EACH_ENTITY_FIELD_PRIORITY]() {
    return this.preparingEachEntityField;
  }

  get preparingEachEntityRelationship() {
    return {
      prepareRelationship({ entity, relationship, entityName }) {
        const { otherEntityName, options } = relationship;
        if (options) {
          Object.assign(relationship, options);
        }
        relationship.otherEntity = this.sharedData.getEntity(upperFirst(otherEntityName));
      },

      prepareRelationshipsForTemplates({ entity, relationship }) {
        prepareRelationshipForTemplates(entity, relationship, this);
      },
    };
  }

  get [PREPARING_EACH_ENTITY_RELATIONSHIP_PRIORITY]() {
    return this.preparingEachEntityRelationship;
  }

  get postPreparingEachEntity() {
    return {
      processEntityPrimaryKeysDerivedProperties({ entity }) {
        if (!entity.primaryKey) return;
        derivedPrimaryKeyProperties(entity.primaryKey);
      },

      prepareEntityFieldsDerivedProperties({ entity }) {
        const { fields } = entity;
        const fieldsType = sortedUniq(fields.map(({ fieldType }) => fieldType).filter(fieldType => !fieldIsEnum(fieldType)));

        // TODO move to react generator
        entity.fieldsIsReactAvField = intersection(fieldsType, [INSTANT, ZONED_DATE_TIME, BOOLEAN]).length > 0;

        entity.i18nToLoad = fields.filter(({ fieldType }) => fieldIsEnum(fieldType)).map(({ enumInstance }) => enumInstance);

        // TODO move to server generator
        entity.haveFieldWithJavadoc = entity.fields.some(({ javadoc }) => javadoc);

        entity.fieldsContainZonedDateTime = fieldsType.includes(ZONED_DATE_TIME);
        entity.fieldsContainInstant = fieldsType.includes(INSTANT);
        entity.fieldsContainDuration = fieldsType.includes(DURATION);
        entity.fieldsContainLocalDate = fieldsType.includes(LOCAL_DATE);
        entity.fieldsContainBigDecimal = fieldsType.includes(BIG_DECIMAL);
        entity.fieldsContainUUID = fieldsType.includes(UUID);
        entity.fieldsContainDate = intersection(fieldsType, [ZONED_DATE_TIME, INSTANT, LOCAL_DATE]).length > 0;
        entity.fieldsContainTimed = intersection(fieldsType, [ZONED_DATE_TIME, INSTANT]).length > 0;

        entity.fieldsContainBlob = intersection(fieldsType, [BYTES, BYTE_BUFFER]).length > 0;
        if (entity.fieldsContainBlob) {
          entity.blobFields = fields.filter(({ fieldType }) => [BYTES, BYTE_BUFFER].includes(fieldType));
          const blobFieldsContentType = sortedUniq(entity.blobFields.map(({ fieldTypeBlobContent }) => fieldTypeBlobContent));
          entity.fieldsContainImageBlob = blobFieldsContentType.includes(IMAGE);
          entity.fieldsContainBlobOrImage = blobFieldsContentType.some(fieldTypeBlobContent => fieldTypeBlobContent !== TEXT);
          entity.fieldsContainTextBlob = blobFieldsContentType.includes(TEXT);
        }

        entity.validation = entity.validation || fields.some(({ fieldValidate }) => fieldValidate);
      },

      prepareEntityRelationshipsDerivedProperties({ entity }) {
        const { relationships } = entity;
        const oneToOneRelationships = relationships.filter(({ relationshipType }) => relationshipType === 'one-to-one');
        entity.fieldsContainNoOwnerOneToOne = oneToOneRelationships.some(({ ownerSide }) => !ownerSide);
        entity.fieldsContainOwnerOneToOne = oneToOneRelationships.some(({ ownerSide }) => ownerSide);

        entity.fieldsContainManyToOne = relationships.some(({ relationshipType }) => relationshipType === 'many-to-one');
        entity.fieldsContainOneToMany = relationships.some(({ relationshipType }) => relationshipType === 'one-to-many');

        entity.fieldsContainOwnerManyToMany = relationships.some(
          ({ relationshipType, ownerSide }) => ownerSide && relationshipType === 'many-to-many'
        );

        entity.fieldsContainEmbedded = relationships.some(({ otherEntityIsEmbedded }) => otherEntityIsEmbedded);
        entity.validation = entity.validation || relationships.some(({ relationshipValidate }) => relationshipValidate);

        const relationshipsByType = relationships
          .map(relationship => [relationship.otherEntity.entityNameCapitalized, relationship])
          .reduce((relationshipsByType, [type, relationship]) => {
            if (!relationshipsByType[type]) {
              relationshipsByType[type] = [relationship];
            } else {
              relationshipsByType[type].push(relationship);
            }
            return relationshipsByType;
          }, {});

        entity.differentTypes = Object.keys(relationshipsByType);
        entity.differentRelationships = relationshipsByType;
      },
    };
  }

  get [POST_PREPARING_EACH_ENTITY_PRIORITY]() {
    return this.postPreparingEachEntity;
  }
}
