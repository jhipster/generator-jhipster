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
import { asWritingEntitiesTask, getEnumInfo } from '../base-application/support/index.js';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.js';
import type {
  Entity as DeprecatedEntity,
  Field as DeprecatedField,
  Relationship as DeprecatedRelationship,
} from '../../lib/types/application/index.js';
import type { PrimaryKey as DeprecatedPrimarykey } from '../../lib/types/application/entity.js';
import type { ApplicationType } from '../../lib/types/application/application.js';
import type LanguagesGenerator from './generator.js';

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
export const entityClientI18nFiles = {
  entityBaseFiles: [
    {
      templates: [
        {
          sourceFile: context => `entity/i18n/entity_${context.lang}.json.ejs`,
          destinationFile: context => `${context.clientSrcDir}i18n/${context.lang}/${context.entityTranslationKey}.json`,
        },
      ],
    },
  ],
};

export const userTranslationfiles = {
  userTranslationfiles: [
    {
      from: context => `${CLIENT_MAIN_SRC_DIR}/i18n/${context.lang}/`,
      to: context => `${context.clientSrcDir}/i18n/${context.lang}/`,
      transform: false,
      templates: ['user-management.json'],
    },
  ],
};

export const enumClientI18nFiles = {
  enumBaseFiles: [
    {
      templates: [
        {
          sourceFile: 'entity/i18n/enum.json.ejs',
          destinationFile: context => `${context.clientSrcDir}i18n/${context.lang}/${context.clientRootFolder}${context.enumInstance}.json`,
        },
      ],
    },
  ],
};

export function writeEntityFiles() {
  return {
    writeEnumFiles: asWritingEntitiesTask<
      DeprecatedField,
      DeprecatedPrimarykey<DeprecatedField>,
      DeprecatedRelationship<any>,
      DeprecatedEntity<DeprecatedField, DeprecatedPrimarykey<DeprecatedField>, DeprecatedRelationship<any>>,
      ApplicationType,
      any
    >(async function (this: LanguagesGenerator, { entities, application }) {
      if (application.skipClient) return;
      const languagesToApply = application.enableTranslation ? this.languagesToApply : [...new Set([application.nativeLanguage, 'en'])];
      entities = entities.filter(entity => !entity.skipClient && !entity.builtInUser);
      const { clientSrcDir, packageName, frontendAppName } = application;
      await Promise.all(
        entities
          .map(entity =>
            entity.fields
              .map(field => {
                if (!field.fieldIsEnum) return undefined;
                return languagesToApply.map(lang =>
                  this.writeFiles({
                    sections: enumClientI18nFiles,
                    context: {
                      ...getEnumInfo(field, entity.clientRootFolder),
                      lang,
                      frontendAppName,
                      packageName,
                      clientSrcDir,
                    },
                  }),
                );
              })
              .flat(),
          )
          .flat(),
      );
    }),

    writeClientFiles: asWritingEntitiesTask<
      DeprecatedField,
      DeprecatedPrimarykey<DeprecatedField>,
      DeprecatedRelationship<any>,
      DeprecatedEntity<DeprecatedField, DeprecatedPrimarykey<DeprecatedField>, DeprecatedRelationship<any>>,
      ApplicationType,
      any
    >(async function (this: LanguagesGenerator, { application, entities }) {
      if (application.skipClient) return;
      const entitiesToWriteTranslationFor = entities.filter(entity => !entity.skipClient && !entity.builtInUser);
      if (application.userManagement?.skipClient) {
        entitiesToWriteTranslationFor.push(application.userManagement);
      }

      // Copy each
      const { clientSrcDir, frontendAppName } = application;
      const languagesToApply = application.enableTranslation ? this.languagesToApply : [...new Set([application.nativeLanguage, 'en'])];
      for (const entity of entitiesToWriteTranslationFor) {
        for (const lang of languagesToApply) {
          if (entity.builtInUserManagement) {
            await this.writeFiles({ sections: userTranslationfiles, context: { ...entity, clientSrcDir, frontendAppName, lang } });
          } else {
            await this.writeFiles({ sections: entityClientI18nFiles, context: { ...entity, clientSrcDir, frontendAppName, lang } });
          }
        }
      }
    }),
  };
}
