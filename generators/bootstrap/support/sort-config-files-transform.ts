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
import { transformContents } from '@yeoman/transform';
import type { MemFsEditorFile } from 'mem-fs-editor';
import sortKeys from 'sort-keys';
import type File from 'vinyl';

const sortJsonFileContent = (contents: Exclude<File['contents'], null>) =>
  Buffer.from(`${JSON.stringify(sortKeys(JSON.parse(contents.toString('utf8')), { deep: true }), null, 2)}\n`);

export default function createSortConfigFilesTransform(pattern = '**/{.yo-rc.json,.jhipster/*.json}') {
  return transformContents<MemFsEditorFile>(contents => sortJsonFileContent(contents!), {
    filter: file => Boolean(file.contents),
    pattern,
  });
}
