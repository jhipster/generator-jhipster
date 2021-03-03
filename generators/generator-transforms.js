/**
 * Copyright 2013-2021 the original author or authors from the JHipster project.
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
const path = require('path');
const through = require('through2');
const prettier = require('prettier');
const prettierPluginJava = require('prettier-plugin-java');
const prettierPluginPackagejson = require('prettier-plugin-packagejson');

const prettierTransform = function (options, generator, ignoreErrors = false) {
  return through.obj((file, encoding, callback) => {
    if (file.state === 'deleted') {
      callback(null, file);
      return;
    }
    /* resolve from the projects config */
    let fileContent;
    prettier
      .resolveConfig(file.relative)
      .then(function (resolvedDestinationFileOptions) {
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
        callback(null, file);
      })
      .catch(error => {
        const errorMessage = `Error parsing file ${file.relative}: ${error}

At: ${fileContent}`;
        if (ignoreErrors) {
          generator.warning(errorMessage);
          callback(null, file);
        } else {
          callback(new Error(errorMessage));
        }
      });
  });
};

const generatedAnnotationTransform = generator => {
  return through.obj(function (file, encoding, callback) {
    if (
      !file.path.endsWith('package-info.java') &&
      !file.path.endsWith('MavenWrapperDownloader.java') &&
      path.extname(file.path) === '.java' &&
      file.state !== 'deleted' &&
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
    this.push(file);
    callback();
  });
};

module.exports = {
  prettierTransform,
  generatedAnnotationTransform,
};
