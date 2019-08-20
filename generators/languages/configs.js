/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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

module.exports = {
    languages: {
        i18n: {
            persistent: true,
            varName: 'enableTranslation',
            otherVars: ['nativeLanguage'],
            async prompt(generator, repository) {
                const languageOptions = generator.getAllSupportedLanguageOptions();

                const done = generator.async();
                const prompts = [
                    {
                        type: 'confirm',
                        name: 'enableTranslation',
                        message: 'Would you like to enable internationalization support?',
                        default: true
                    },
                    {
                        when: response => response.enableTranslation === true,
                        type: 'list',
                        name: 'nativeLanguage',
                        message: 'Please choose the native language of the application',
                        choices: languageOptions,
                        default: 'en',
                        store: true
                    }
                ];

                const answers = await generator.prompt(prompts);
                repository.enableTranslation = answers.enableTranslation;
                if (repository.enableTranslation) {
                    repository.nativeLanguage = answers.nativeLanguage;
                }
                done();
            }
        },
        languages: {
            persistent: true,
            varName: 'languages',
            cli: true,
            cliName: 'languages',
            spec: {
                desc: 'Languages',
                type: Array,
                required: false
            },
            dependsOn: ['languages.i18n'],
            validatePrompt(repository) {
                if (repository.nativeLanguage === undefined) return;
                if (repository.languages === undefined) repository.languages = [repository.nativeLanguage];
                if (!Array.isArray(repository.languages)) repository.languages = [repository.languages];
                if (!repository.languages.includes(repository.nativeLanguage))
                    repository.languages = [repository.nativeLanguage, ...repository.languages];
            },
            async prompt(generator, repository) {
                if (!repository.enableTranslation) return;
                const languageOptions = generator.getAllSupportedLanguageOptions();

                const done = generator.async();
                const prompts = [
                    {
                        type: 'checkbox',
                        name: 'languages',
                        message: 'Please choose additional languages to install',
                        choices: response => generator._.filter(languageOptions, o => o.value !== repository.nativeLanguage)
                    }
                ];

                const answers = await generator.prompt(prompts);
                repository.languages = [repository.nativeLanguage].concat(answers.languages);
                done();
            }
        }
    }
};
