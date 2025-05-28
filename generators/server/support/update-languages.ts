/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { asPostWritingTask } from '../../base-application/support/task-type-inference.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../../lib/types/application/entity.js';
import type { ApplicationType } from '../../../lib/types/application/application.js';

/**
 * Update Languages In MailServiceIT
 *
 * @param application
 */
export const updateLanguagesInMailServiceITTask = asPostWritingTask<
  DeprecatedField,
  DeprecatedPrimarykey<DeprecatedField>,
  DeprecatedRelationship<any>,
  DeprecatedEntity<DeprecatedField, DeprecatedPrimarykey<DeprecatedField>, DeprecatedRelationship<any>>,
  ApplicationType,
  any
>(function updateLanguagesInMailServiceITTask({ application, control }) {
  const { javaPackageTestDir, languagesDefinition } = application;
  const { ignoreNeedlesError: ignoreNonExisting } = control;
  let newContent = 'private static final String[] languages = {\n';
  languagesDefinition?.forEach((language, i) => {
    newContent += `        "${language.languageTag}"${i !== languagesDefinition.length - 1 ? ',' : ''}\n`;
  });
  newContent += '        // jhipster-needle-i18n-language-constant - JHipster will add/remove languages in this array\n    };';

  this.editFile(`${javaPackageTestDir}/service/MailServiceIT.java`, { ignoreNonExisting }, content =>
    content.replace(/private.*static.*String.*languages.*\{([^}]*jhipster-needle-i18n-language-constant[^}]*)\};/g, newContent),
  );
});

export default asPostWritingTask<
  DeprecatedField,
  DeprecatedPrimarykey<DeprecatedField>,
  DeprecatedRelationship<any>,
  DeprecatedEntity<DeprecatedField, DeprecatedPrimarykey<DeprecatedField>, DeprecatedRelationship<any>>,
  ApplicationType,
  any
>(function updateLanguagesTask(this, taskParam) {
  updateLanguagesInMailServiceITTask.call(this, taskParam);
});
