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
module.exports = {
    askForPage,
};

function askForPage(meta) {
    if (!meta && this.existingProject) return;

    const prompts = {
        type: 'input',
        name: 'pageName',
        message: 'What is the name of your page?',
        default: 'MyPage',
        validate: input => (/^([A-Z][a-zA-Z]*)$/.test(input) ? true : 'This is not a valid page name (ex: MyPage).'),
    };

    if (meta) return prompts; // eslint-disable-line consistent-return

    const done = this.async();

    this.prompt(prompts).then(prompt => {
        this.pageName = prompt.pageName;
        done();
    });
}
