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
const { startCase } = require('lodash');
const utils = require('../utils');

/**
 * The default is to use a file path string. It implies use of the template method.
 * For any other config an object { file:.., method:.., template:.. } can be used
 */
const entityClientI18nFiles = {
  entityBaseFiles: [
    {
      templates: [
        {
          sourceFile: context => `i18n/entity_${context.lang}.json.ejs`,
          destinationFile: context => `${context.clientSrcDir}i18n/${context.lang}/${context.entityTranslationKey}.json`,
        },
      ],
    },
  ],
};

const enumClientI18nFiles = {
  enumBaseFiles: [
    {
      templates: [
        {
          sourceFile: 'i18n/enum.json.ejs',
          destinationFile: context => `${context.clientSrcDir}i18n/${context.lang}/${context.clientRootFolder}${context.enumInstance}.json`,
        },
      ],
    },
  ],
};

module.exports = {
  entityClientI18nFiles,
  enumClientI18nFiles,
  writeFiles,
};

function writeFiles() {
  return {
    async writeEnumFiles() {
      if (this.skipClient || !this.enableTranslation) return;
      const { clientSrcDir, packageName, frontendAppName } = this;
      await Promise.all(
        this.fields
          .map(field => {
            if (!field.fieldIsEnum) return undefined;
            // Copy for each
            const languages = this.languages || this.getAllInstalledLanguages();
            return languages.map(lang =>
              this.writeFiles({
                sections: enumClientI18nFiles,
                context: {
                  ...utils.getEnumInfo(field, this.clientRootFolder),
                  lang,
                  frontendAppName,
                  packageName,
                  clientSrcDir,
                },
              })
            );
          })
          .flat()
      );
    },

    async writeClientFiles() {
      if (this.skipClient || !this.enableTranslation) return;

      // Copy each
      const { clientSrcDir, frontendAppName, languages = this.getAllInstalledLanguages() } = this;
      await Promise.all(
        languages.map(async lang => {
          await this.writeFiles({ sections: entityClientI18nFiles, context: { ...this.entity, clientSrcDir, frontendAppName, lang } });
          this.addEntityTranslationKey(this.entityTranslationKeyMenu, this.entityClassHumanized || startCase(this.entityClass), lang);
        })
      );
    },
  };
}
