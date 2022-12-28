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
import _ from 'lodash';
import { getEnumInfo } from '../utils.mjs';

const { startCase } = _;

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
    async writeEnumFiles({ entities, application }) {
      if (!application.enableTranslation || application.skipClient) return;
      entities = entities.filter(entity => !entity.skipClient && !entity.builtIn);
      const { clientSrcDir, packageName, frontendAppName } = application;
      await Promise.all(
        entities
          .map(entity =>
            entity.fields
              .map(field => {
                if (!field.fieldIsEnum) return undefined;
                // Copy for each
                const languages = application.languages || this.getAllInstalledLanguages();
                return languages.map(lang =>
                  this.writeFiles({
                    sections: enumClientI18nFiles,
                    context: {
                      ...getEnumInfo(field, entity.clientRootFolder),
                      lang,
                      frontendAppName,
                      packageName,
                      clientSrcDir,
                    },
                  })
                );
              })
              .flat()
          )
          .flat()
      );
    },

    async writeClientFiles({ application, entities }) {
      if (!application.enableTranslation || application.skipClient) return;
      entities = entities.filter(entity => !entity.skipClient && !entity.builtIn);

      // Copy each
      const { clientSrcDir, frontendAppName, languages = this.getAllInstalledLanguages() } = application;
      await Promise.all(
        entities.map(entity =>
          languages.map(async lang => {
            await this.writeFiles({ sections: entityClientI18nFiles, context: { ...entity, clientSrcDir, frontendAppName, lang } });
            this.addEntityTranslationKey(
              entity.entityTranslationKeyMenu,
              entity.entityClassHumanized || startCase(entity.entityClass),
              lang
            );
          })
        )
      );
    },
  };
}
