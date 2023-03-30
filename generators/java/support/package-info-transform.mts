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
import { dirname, join, relative } from 'path';
import { passthrough } from 'p-transform';
import { Editor } from 'mem-fs-editor';

type PackageInfoTransformOptions = { javaRoots: string[]; editor: Editor; javadocs?: Record<string, string> };

const packageInfoTransform = ({ javaRoots, editor, javadocs }: PackageInfoTransformOptions) => {
  return passthrough(function (file) {
    for (const root of javaRoots) {
      if (file.path.startsWith(root)) {
        const directory = dirname(file.path);
        const packageName = relative(root, directory).replaceAll('/', '.');
        const packageInfoFile = join(directory, 'package-info.java');
        const packageJavadoc = javadocs?.[packageName];
        const javadoc = packageJavadoc
          ? `/**
 * ${packageJavadoc}
 */
`
          : '';
        if (!editor.exists(packageInfoFile)) {
          editor.write(
            packageInfoFile,
            `${javadoc}package ${packageName};
`
          );
        }
      }
    }
  }, 'jhipster:package-info-transform');
};

export default packageInfoTransform;
