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
import assert from 'node:assert';

import { validations } from '../../../../lib/jhipster/index.ts';
import BaseApplicationGenerator from '../../../base-application/index.ts';
import { stringifyApplicationData } from '../../../base-application/support/index.ts';
import type { Application as CommonApplication, Entity as CommonEntity, Field as CommonField } from '../../../common/types.ts';

const {
  Validations: { MAX, MIN, MAXLENGTH, MINLENGTH, MAXBYTES, MINBYTES, PATTERN },
  SUPPORTED_VALIDATION_RULES,
} = validations;

export default class BootstrapApplicationGenerator extends BaseApplicationGenerator<CommonEntity, CommonApplication> {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (this.delegateToBlueprint) {
      throw new Error('Only sbs blueprint is supported');
    }

    await this.dependsOnBootstrap('client');
    await this.dependsOnBootstrap('server');
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      preparing({ applicationDefaults }) {
        applicationDefaults({
          gatewayServicesApiAvailable: undefined,
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

        entityConfig.fields!.forEach((field: CommonField) => {
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
}
