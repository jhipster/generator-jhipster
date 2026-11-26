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
import { isContentTypeField } from '../../../base-application/internal/content-type-fields.ts';
import { asWriteEntityFilesSection, asWritingEntitiesTask } from '../../../base-application/support/task-type-inference.ts';
import { TEST_DIR } from '../../../generator-constants.ts';
import type { Entity as SpringBootEntity } from '../../../spring-boot/types.ts';

export const gatlingFiles = asWriteEntityFilesSection({
  gatlingFiles: [
    {
      path: TEST_DIR,
      templates: [
        {
          file: 'java/gatling/simulations/_entityClass_GatlingTest.java',
          renameTo: generator => `java/gatling/simulations/${generator.entityClass}GatlingTest.java`,
        },
      ],
    },
  ],
});

export function cleanupEntitiesTask() {}

const escapeJavaString = (value: string) => value.replace(/"/g, '\\"');

export default asWritingEntitiesTask(async function writeEntitiesTask({ application, entities }) {
  for (const entity of entities.filter(entity => (entity as Partial<SpringBootEntity>).entityRestLayer !== false && !entity.skipServer)) {
    const jsonFieldValue = (field: (typeof entity.fields)[number]) => {
      if (field.fieldTypeString) return '"SAMPLE_TEXT"';
      if (field.fieldTypeInteger || field.fieldTypeLong || field.fieldTypeFloat || field.fieldTypeDouble || field.fieldTypeBigDecimal)
        return '0';
      if (field.fieldTypeInstant || field.fieldTypeZonedDateTime || field.fieldTypeLocalDate) return '"2020-01-01T00:00:00.000Z"';
      if (field.fieldIsEnum) return `"${field.enumValues?.[0]?.name}"`;
      return 'null';
    };
    const jsonFields = entity.fields.filter(field => !(field.id && field.autoGenerate) && !isContentTypeField(field));
    // A composite primary key is serialized as an object, its parts are not entity properties.
    const entityJsonFields = (
      entity.primaryKey?.composite ?
        [
          {
            name: entity.primaryKey.name,
            value: `{ ${entity.primaryKey.fields.map(field => `"${field.fieldName}": ${jsonFieldValue(field)}`).join(', ')} }`,
          },
          ...jsonFields.filter(field => !field.id).map(field => ({ name: field.fieldName, value: jsonFieldValue(field) })),
        ]
      : jsonFields.map(field => ({ name: field.fieldName, value: jsonFieldValue(field) }))).map(({ name, value }) => ({
      name,
      value: escapeJavaString(value),
    }));
    await this.writeFiles({
      sections: gatlingFiles,
      context: { ...application, ...entity, entityJsonFields },
    });
  }
});
