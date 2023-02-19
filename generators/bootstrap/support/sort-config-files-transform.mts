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
import File from 'vinyl';
import sortKeys from 'sort-keys';
import environmentTransform from 'yeoman-environment/transform';

const { patternSpy } = environmentTransform;

const sortJsonFileContent = (contents: Exclude<File['contents'], null>) => {
  return Buffer.from(`${JSON.stringify(sortKeys(JSON.parse(contents.toString('utf8')), { deep: true }), null, 2)}\n`);
};

export default function createSortConfigFilesTransform(pattern = '**/{.yo-rc.json,.jhipster/*.json}') {
  return patternSpy((file: any) => {
    if (file.contents) {
      file.contents = sortJsonFileContent(file.contents);
    }
  }, pattern).name('jhipster:sort-json-files');
}
