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
import { passthrough } from '@yeoman/transform';
import { Minimatch } from 'minimatch';

export function convertVueTranslations(body) {
  return body.replace(/\{\{\s*(\w+)\s*\}\}/g, '{ $1 }').replace(/([@|||$])/g, "{'$1'}");
}

const convertTranslationsSupport = ({ clientSrcDir }) => {
  const minimatch = new Minimatch(`**/${clientSrcDir}i18n/**/*.json`);
  const isTranslationFile = (file: { path: string }) => minimatch.match(file.path);
  const transform = passthrough(file => {
    if (isTranslationFile(file)) {
      file.contents = Buffer.from(convertVueTranslations(file.contents.toString()));
    }
  });
  return { transform, isTranslationFile };
};

export default convertTranslationsSupport;
