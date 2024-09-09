/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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

import BaseApplicationGenerator from '../base-application/index.js';
import { validations } from '../../lib/jhipster/index.js';
import {
  derivedPrimaryKeyProperties,
  preparePostEntitiesCommonDerivedProperties,
  preparePostEntityCommonDerivedProperties,
  stringifyApplicationData,
} from '../base-application/support/index.js';

import { preparePostEntityServerDerivedProperties } from '../server/support/index.js';
import { loadStoredAppOptions } from '../app/support/index.js';
import { JHIPSTER_DOCUMENTATION_ARCHIVE_PATH, JHIPSTER_DOCUMENTATION_URL } from '../generator-constants.js';

const {
  Validations: { MAX, MIN, MAXLENGTH, MINLENGTH, MAXBYTES, MINBYTES, PATTERN },
  SUPPORTED_VALIDATION_RULES,
} = validations;

export default class BootstrapApplicationGenerator extends BaseApplicationGenerator {
  constructor(args: any, options: any, features: any) {
    super(args, options, { jhipsterBootstrap: false, ...features });

    if (this.options.help) return;

    loadStoredAppOptions.call(this);
  }

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (this.delegateToBlueprint) {
      throw new Error('Only sbs blueprint is supported');
    }

    await this.dependsOnBootstrapApplicationClient();
    await this.dependsOnBootstrapApplicationServer();
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ application, applicationDefaults }) {
        if (application.authenticationType === 'oauth2' || application.databaseType === 'no') {
          (application as any).skipUserManagement = true;
        }

        applicationDefaults({
          gatewayServicesApiAvailable: undefined,
        });

        let prettierExtensions = 'md,json,yml,html';
        if (application.clientFrameworkAny) {
          prettierExtensions = `${prettierExtensions},cjs,mjs,js,ts,tsx,css,scss`;
          if (application.clientFrameworkVue) {
            prettierExtensions = `${prettierExtensions},vue`;
          }
        }
        if (!application.skipServer) {
          prettierExtensions = `${prettierExtensions},java`;
        }

        applicationDefaults({
          // TODO remove prettierExtensions, moved to prettier generator
          prettierExtensions,
          useNpmWrapper: application => application.clientFrameworkAny && application.backendTypeJavaAny,
          documentationArchiveUrl: ({ jhipsterVersion }) =>
            `${JHIPSTER_DOCUMENTATION_URL}${JHIPSTER_DOCUMENTATION_ARCHIVE_PATH}v${jhipsterVersion}`,
        });
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

        entityConfig.fields!.forEach((field: any) => {
          const { fieldName, fieldType, fieldValidateRules } = field;

          assert(fieldName, `fieldName is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`);
          assert(fieldType, `fieldType is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`);

          if (fieldValidateRules !== undefined) {
            assert(
              Array.isArray(fieldValidateRules),
              `fieldValidateRules is not an array in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`,
            );
            fieldValidateRules.forEach(fieldValidateRule => {
              assert(
                SUPPORTED_VALIDATION_RULES.includes(fieldValidateRule),
                `fieldValidateRules contains unknown validation rule ${fieldValidateRule} in .jhipster/${entityName}.json for field ${stringifyApplicationData(
                  field,
                )} [supported validation rules ${SUPPORTED_VALIDATION_RULES}]`,
              );
            });
            assert(
              !fieldValidateRules.includes(MAX) || field.fieldValidateRulesMax !== undefined,
              `fieldValidateRulesMax is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`,
            );
            assert(
              !fieldValidateRules.includes(MIN) || field.fieldValidateRulesMin !== undefined,
              `fieldValidateRulesMin is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`,
            );
            assert(
              !fieldValidateRules.includes(MAXLENGTH) || field.fieldValidateRulesMaxlength !== undefined,
              `fieldValidateRulesMaxlength is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`,
            );
            assert(
              !fieldValidateRules.includes(MINLENGTH) || field.fieldValidateRulesMinlength !== undefined,
              `fieldValidateRulesMinlength is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`,
            );
            assert(
              !fieldValidateRules.includes(MAXBYTES) || field.fieldValidateRulesMaxbytes !== undefined,
              `fieldValidateRulesMaxbytes is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`,
            );
            assert(
              !fieldValidateRules.includes(MINBYTES) || field.fieldValidateRulesMinbytes !== undefined,
              `fieldValidateRulesMinbytes is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`,
            );
            assert(
              !fieldValidateRules.includes(PATTERN) || field.fieldValidateRulesPattern !== undefined,
              `fieldValidateRulesPattern is missing in .jhipster/${entityName}.json for field ${stringifyApplicationData(field)}`,
            );
          }
        });
      },
    });
  }

  get [BaseApplicationGenerator.CONFIGURING_EACH_ENTITY]() {
    return this.configuringEachEntity;
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
      checkProperties({ entities }) {
        for (const entity of entities) {
          const properties = [...entity.fields.map(entity => entity.propertyName), ...entity.relationships.map(rel => rel.propertyName)];
          if (new Set(properties).size !== properties.length) {
            // Has duplicated properties.
            const duplicated = [...new Set(properties.filter((v, i, a) => a.indexOf(v) !== i))];
            throw new Error(`You have duplicate properties in entity ${entity.name}: ${duplicated.join(', ')}`);
          }
        }
      },
    });
  }

  get [BaseApplicationGenerator.DEFAULT]() {
    return this.default;
  }
}
