/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
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
const prettierJava = require('prettier-plugin-java');

const prettierJavaOptions = {
    plugins: [prettierJava],
};

const prettierTransform = function (defaultOptions) {
    return through.obj((file, encoding, callback) => {
        /* resolve from the projects config */
        prettier.resolveConfig(file.relative).then(resolvedDestinationFileOptions => {
            if (file.state !== 'deleted') {
                const options = {
                    ...defaultOptions,
                    // Config from disk
                    ...resolvedDestinationFileOptions,
                    // for better errors
                    filepath: file.relative,
                };
                const str = file.contents.toString('utf8');
                try {
                    const data = prettier.format(str, options);
                    file.contents = Buffer.from(data);
                } catch (error) {
                    callback(
                        new Error(`Error parsing file ${file.relative}: ${error}
                    At: ${str}`)
                    );
                    return;
                }
            }
            callback(null, file);
        });
    });
};

const generatedAnnotationTransform = generator => {
    return through.obj(function (file, encoding, callback) {
        if (path.extname(file.path) === '.java' && file.state !== 'deleted' && !file.path.endsWith('GeneratedByJHipster.java')) {
            const packageName = generator.jhipsterConfig.packageName;
            const content = file.contents.toString('utf8');

            if (!new RegExp(`import ${packageName.replace('.', '\\.')}.GeneratedByJHipster;`).test(content)) {
                const newContent = content
                    // add the import statement just after the package statement, prettier will arrange it correctly
                    .replace(/(package [\w.]+;\n)/, `$1import ${packageName}.GeneratedByJHipster;\n`)
                    // add the annotation before class or interface
                    .replace(/\n([a-w ]*(class|interface) )/g, '\n@GeneratedByJHipster\n$1');
                file.contents = Buffer.from(newContent);
            }
        }
        this.push(file);
        callback();
    });
};

module.exports = {
    prettierTransform,
    prettierJavaOptions,
    generatedAnnotationTransform,
};
