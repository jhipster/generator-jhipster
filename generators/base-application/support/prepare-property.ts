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
import { snakeCase, upperFirst } from 'lodash-es';
import { mutateData } from '../../../lib/utils/object.js';
import type { Field } from '../../../lib/types/application/field.js';
import type { Relationship } from '../../../lib/types/application/relationship.js';

export const prepareProperty = (property: Field | Relationship) => {
  mutateData(property, {
    __override__: false,
    propertyNameCapitalized: ({ propertyName }) => upperFirst(propertyName),
    propertyNameUpperSnakeCase: ({ propertyName }) => snakeCase(propertyName).toUpperCase(),
  });
};
