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
import { extname } from 'path';
import { passthrough } from 'p-transform';
import memFsEditor from 'mem-fs-editor';

const {
  State: { isFileStateDeleted },
} = memFsEditor as any;

const generatedAnnotationTransform = packageName => {
  return passthrough(file => {
    if (
      !file.path.endsWith('package-info.java') &&
      extname(file.path) === '.java' &&
      !isFileStateDeleted(file) &&
      !file.path.endsWith('GeneratedByJHipster.java')
    ) {
      const content = file.contents.toString('utf8');

      if (!new RegExp(`import ${packageName.replace('.', '\\.')}.GeneratedByJHipster;`).test(content)) {
        const newContent = content
          // add the import statement just after the package statement, prettier will arrange it correctly
          .replace(/(package [\w.]+;\n)/, `$1import ${packageName}.GeneratedByJHipster;\n`)
          // add the annotation before class or interface
          .replace(/\n([a-w ]*(class|interface|enum) )/g, '\n@GeneratedByJHipster\n$1');
        file.contents = Buffer.from(newContent);
      }
    }
  }, 'jhipster:generated-by-annotation');
};

export default generatedAnnotationTransform;
