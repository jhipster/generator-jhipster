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
import type { JDLFieldTypesDefinition } from '../jdl/core/parsing/types/parsing.ts';
import { CommonDBValidations, RelationalOnlyDBTypes } from '../jhipster/field-types.ts';

const { Enum: enumValidations, ...typeValidations } = CommonDBValidations;

const defaultJDLFieldTypesConfig: JDLFieldTypesDefinition = Object.freeze({
  types: {
    ...Object.fromEntries(Object.entries(typeValidations).map(([type, validations]) => [type, { validations: [...validations] }])),
    // Supported by some databases only, they take no validation.
    ...Object.fromEntries(Object.values(RelationalOnlyDBTypes).map(type => [type, { validations: [] }])),
    // The Joda-Time types of old applications, the server generator migrates them to Instant.
    ...Object.fromEntries(
      ['Date', 'DateTime'].map(type => [
        type,
        { validations: [...CommonDBValidations.Instant], deprecated: 'use Instant, which it is migrated to' },
      ]),
    ),
  },
  enum: { validations: [...enumValidations] },
});

export const getDefaultJDLFieldTypesConfig = (): Readonly<JDLFieldTypesDefinition> => defaultJDLFieldTypesConfig;
