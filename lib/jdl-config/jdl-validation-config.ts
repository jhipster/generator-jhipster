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
import type { JDLValidationsDefinition } from '../jdl/core/parsing/types/parsing.ts';

const defaultJDLValidationConfig: JDLValidationsDefinition = Object.freeze({
  configs: {
    min: { description: 'Minimum value of a number', jdl: { value: 'number' } },
    max: { description: 'Maximum value of a number', jdl: { value: 'number' } },
    minlength: { description: 'Minimum length of a string', jdl: { value: 'integer' } },
    maxlength: { description: 'Maximum length of a string', jdl: { value: 'integer' } },
    minbytes: { description: 'Minimum size of a blob', jdl: { value: 'integer' } },
    maxbytes: { description: 'Maximum size of a blob', jdl: { value: 'integer' } },
    pattern: { description: 'Pattern a string matches', jdl: { value: 'regex' } },
  },
});

export const getDefaultJDLValidationConfig = (): Readonly<JDLValidationsDefinition> => defaultJDLValidationConfig;
