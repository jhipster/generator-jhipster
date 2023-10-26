/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { WriteFileSection } from '../base/api.mjs';
import { javaMainPackageTemplatesBlock, javaTestPackageTemplatesBlock } from './support/index.mjs';

export const entityServerFiles: WriteFileSection = {
  model: [
    javaMainPackageTemplatesBlock({
      templates: ['_entityPackage_/domain/_persistClass_.java.jhi'],
    }),
  ],
  modelTestFiles: [
    javaTestPackageTemplatesBlock({
      templates: ['_entityPackage_/domain/_persistClass_Test.java'],
    }),
  ],
  server: [
    javaMainPackageTemplatesBlock({
      condition: ctx => ctx.useJakartaValidation,
      templates: ['_entityPackage_/domain/_persistClass_.java.jhi.jakarta_validation'],
    }),
  ],
};

export const enumFiles: WriteFileSection = {
  enumFiles: [
    javaMainPackageTemplatesBlock({
      renameTo: (data, filepath) => filepath.replace('_enumName_', data.enumName),
      templates: ['_entityPackage_/domain/enumeration/_enumName_.java'],
    }),
  ],
};
