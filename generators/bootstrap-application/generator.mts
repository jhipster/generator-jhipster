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

import BaseApplicationGenerator from '../base-application/index.mjs';

import { fieldTypes, validations } from '../../jdl/jhipster/index.mjs';
import { stringify } from '../../utils/index.mjs';
import {
  derivedPrimaryKeyProperties,
  preparePostEntitiesCommonDerivedProperties,
  preparePostEntityCommonDerivedProperties,
  preparePostEntityServerDerivedProperties,
} from '../../utils/entity.mjs';
import { fieldIsEnum } from '../../utils/field.mjs';
import { GENERATOR_BOOTSTRAP_APPLICATION_CLIENT, GENERATOR_BOOTSTRAP_APPLICATION_SERVER } from '../generator-list.mjs';

import type { ClientServerApplication } from '../common/types.mjs';

const { CommonDBTypes, RelationalOnlyDBTypes, BlobTypes } = fieldTypes;
const { sortedUniq, intersection } = lodash;

const { BIG_DECIMAL, BOOLEAN, DURATION, INSTANT, LOCAL_DATE, UUID, ZONED_DATE_TIME } = CommonDBTypes;
const { BYTES, BYTE_BUFFER } = RelationalOnlyDBTypes;
const { IMAGE, TEXT } = BlobTypes;

const {
  Validations: { MAX, MIN, MAXLENGTH, MINLENGTH, MAXBYTES, MINBYTES, PATTERN },
  SUPPORTED_VALIDATION_RULES,
} = validations;

/**
 * @class
 * @extends {BaseApplicationGenerator<ClientServerApplication>}
 */
export default class extends BaseApplicationGenerator<ClientServerApplication> {
  constructor(args: any, options: any, features: any) {
    super(args, options, { unique: 'namespace', ...features });

    if (this.options.help) return;

    this.loadStoredAppOptions();
    this.loadRuntimeOptions();
  }

  async _postConstruct() {
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_CLIENT);
    await this.dependsOnJHipster(GENERATOR_BOOTSTRAP_APPLICATION_SERVER);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ application }) {
        if (application.authenticationType === 'oauth2' || application.databaseType === 'no') {
          application.skipUserManagement = true;
        }

        let prettierExtensions = 'md,json,yml,html';
        if (!application.applicationTypeAny) {
          prettierExtensions = `${prettierExtensions},cjs,mjs,js,ts,tsx,css,scss`;
          if (application.applicationTypeVue) {
            prettierExtensions = `${prettierExtensions},vue`;
          }
          if (application.clientFrameworkSvelte) {
            prettierExtensions = `${prettierExtensions},svelte`;
          }
        }
        if (!application.skipServer) {
          prettierExtensions = `${prettierExtensions},java`;
        }
        application.prettierExtensions = prettierExtensions;
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.preparing;
  }

  get configuringEachEntity() {
    return this.asConfiguringEachEntityTaskGroup({
      configureFields({ entityName, entityConfig }) {
        if (entityConfig.name === undefined) {
          entityConfig.name = entityName;
        }

        entityConfig.fields.forEach((field: any) => {
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
        entityConfig.relationships.forEach((relationship: any) => {
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
    });
  }

  get [BaseApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.configuringEachEntity;
  }

  get preparingEachEntityRelationship() {
    return this.asPreparingEachEntityRelationshipTaskGroup({});
  }

  get [BaseApplicationGenerator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
    return this.preparingEachEntityRelationship;
  }

  get postPreparingEachEntity() {
    return this.asPostPreparingEachEntityTaskGroup({
      processEntityPrimaryKeysDerivedProperties({ entity }) {
        if (!entity.primaryKey) return;
        derivedPrimaryKeyProperties(entity.primaryKey);
      },

      prepareEntityDerivedProperties({ entity }) {
        preparePostEntityCommonDerivedProperties(entity);
        if (!entity.skipServer) {
          preparePostEntityServerDerivedProperties(entity);
        }
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
          const blobFields = fields.filter(({ fieldType }) => [BYTES, BYTE_BUFFER].includes(fieldType));
          entity.blobFields = blobFields;
          const blobFieldsContentType = sortedUniq(blobFields.map(({ fieldTypeBlobContent }) => fieldTypeBlobContent));
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
          .reduce((relationshipsByType: any, [type, relationship]) => {
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
    });
  }

  get [BaseApplicationGenerator.POST_PREPARING_EACH_ENTITY]() {
    return this.postPreparingEachEntity;
  }

  get default() {
    return this.asDefaultTaskGroup({
      postPreparingEntities({ entities }) {
        preparePostEntitiesCommonDerivedProperties(entities);
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.default;
  }
}
