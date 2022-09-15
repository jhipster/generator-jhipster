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
const { State } = require('mem-fs-editor');
const path = require('path');
const { passthrough } = require('p-transform');
const prettier = require('prettier');
const prettierPluginJava = require('prettier-plugin-java');
const prettierPluginPackagejson = require('prettier-plugin-packagejson');
const { patternSpy } = require('yeoman-environment/transform');

const { isFileStateDeleted } = State;

const prettierTransform = function (options, generator, transformOptions = {}) {
  if (typeof transformOptions === 'boolean') {
    transformOptions = { ignoreErrors: transformOptions };
  }
  const { ignoreErrors = false, extensions = generator.getPrettierExtensions() } = transformOptions;
  return patternSpy(
    async file => {
      if (isFileStateDeleted(file)) {
        return file;
      }
      if (!file.contents) {
        throw new Error(`File content doesn't exist for ${file.relative}`);
      }
      /* resolve from the projects config */
      let fileContent;
      try {
        const resolvedDestinationFileOptions = await prettier.resolveConfig(file.relative);
        const prettierOptions = {
          plugins: [],
          // Config from disk
          ...resolvedDestinationFileOptions,
          // for better errors
          filepath: file.relative,
        };
        if (options.packageJson) {
          prettierOptions.plugins.push(prettierPluginPackagejson);
        }
        if (options.java) {
          prettierOptions.plugins.push(prettierPluginJava);
        }
        fileContent = file.contents.toString('utf8');
        const data = prettier.format(fileContent, prettierOptions);
        file.contents = Buffer.from(data);
        return file;
      } catch (error) {
        let errorMessage;
        if (fileContent) {
          errorMessage = `Error parsing file ${file.relative}: ${error}

At: ${fileContent
            .split('\n')
            .map((value, idx) => `${idx + 1}: ${value}`)
            .join('\n')}`;
        } else {
          errorMessage = `Unknown prettier error: ${error}`;
        }
        if (ignoreErrors) {
          generator.warning(errorMessage);
          return file;
        }
        throw new Error(errorMessage);
      }
    },
    `**/*.{${extensions}}`,
    { dot: true }
  ).name('jhipster:prettier');
};

const generatedAnnotationTransform = generator => {
  return passthrough(file => {
    if (
      !file.path.endsWith('package-info.java') &&
      path.extname(file.path) === '.java' &&
      !isFileStateDeleted(file) &&
      !file.path.endsWith('GeneratedByJHipster.java')
    ) {
      const packageName = generator.jhipsterConfig.packageName;
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

module.exports = {
  prettierTransform,
  generatedAnnotationTransform,
};
