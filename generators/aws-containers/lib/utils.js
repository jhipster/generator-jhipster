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
const _ = require('lodash');
const ora = require('ora');

/**
 * Wraps the promise in a CLI spinner
 * @param promise
 * @param text
 * @param spinnerIcon
 */
function spinner(promise, text = 'loading', spinnerIcon = 'monkey') {
    const spinner = ora({ spinner: spinnerIcon, text }).start();
    return new Promise((resolve, reject) => {
        promise
            .then(resolved => {
                spinner.stop();
                resolve(resolved);
            })
            .catch(err => {
                spinner.stop();
                reject(err);
            });
    });
}

function formatRDSUsername(username) {
    return _.chain(username)
        .replace('_', '')
        .truncate({ length: 16, omission: '' })
        .value();
}

module.exports = {
    spinner,
    formatRDSUsername
};
