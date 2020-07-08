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
                try {
                    const str = file.contents.toString('utf8');
                    const data = prettier.format(str, options);
                    file.contents = Buffer.from(data);
                } catch (error) {
                    throw new Error(`Error parsing file ${file.relative}: ${error.message}`);
                }
            }
            callback(null, file);
        });
    });
};

module.exports = {
    prettierTransform,
    prettierJavaOptions,
};
