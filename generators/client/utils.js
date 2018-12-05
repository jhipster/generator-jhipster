/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const jhipsterUtils = require('generator-jhipster/generators/utils');
const constants = require('generator-jhipster/generators/generator-constants');
const chalk = require('chalk');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;

module.exports = {
    addLanguagesToApplication,
    addLanguagesToWebPackConfiguration,
    replaceTranslation
};

function addLanguagesToApplication(generator) {
    const fullPath = `${CLIENT_MAIN_SRC_DIR}app/locale/LanguageService.vue`;
    try {
        let content = '{\n';
        if (generator.enableTranslation) {
            generator.generateLanguageOptions(generator.languages, generator.clientFramework).forEach((ln, i) => {
                content += `                        ${ln}${i !== generator.languages.length - 1 ? ',' : ''}\n`;
            });
        }
        content += '                    }';

        jhipsterUtils.rewriteFile(
            {
                file: fullPath,
                needle: 'jhipster-needle-i18n-language-key-pipe',
                splicable: [
                    // prettier-ignore
                    `${content}`
                ]
            },
            generator
        );
    } catch (e) {
        generator.log(
            chalk.yellow('\nUnable to find ')
            + fullPath
            + chalk.yellow(' or missing required jhipster-needle. Language pipe not updated with languages: ')
            + generator.languages
            + chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
        );
        generator.debug('Error:', e);
    }
}

function addLanguagesToWebPackConfiguration(generator) {
    const fullPath = `${CLIENT_WEBPACK_DIR}webpack.dev.js`;
    try {
        if (generator.enableTranslation) {
            let content = '';
            generator.languages.forEach((language, i) => {
                content += `                    { pattern: "./src/main/webapp/i18n/${language}/*.json", fileName: "./i18n/${language}.json" }${
                    i !== generator.languages.length - 1 ? ',' : ''
                }\n`;
            });

            jhipsterUtils.rewriteFile(
                {
                    file: fullPath,
                    needle: 'jhipster-needle-i18n-language-webpack',
                    splicable: [
                        // prettier-ignore
                        `${content}`
                    ]
                },
                generator
            );
        }
    } catch (e) {
        generator.log(
            chalk.yellow('\nUnable to find ')
            + fullPath
            + chalk.yellow(' or missing required jhipster-needle. Webpack language task not updated with languages: ')
            + generator.languages
            + chalk.yellow(' since block was not found. Check if you have enabled translation support.\n')
        );
        generator.debug('Error:', e);
    }
}

function replaceTranslation(generator, files) {
    for (let i = 0; i < files.length; i++) {
        const filePath = `${CLIENT_MAIN_SRC_DIR}${files[i]}`;
        jhipsterUtils.replaceContent(
            {
                file: filePath,
                pattern: /(v-text=".*?")|(v-bind:placeholder=".*?")|(v-html=".*?")|(v-bind:title=".*?")|(v-bind:label=".*?")|(v-bind:value=".*?")|(v-bind:html=".*?")/g,
                content: ''
            },
            generator
        );
    }
}
