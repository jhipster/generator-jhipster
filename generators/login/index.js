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

const chalk = require('chalk');

const BaseGenerator = require('../generator-base');
const statistics = require('../statistics');

module.exports = class extends BaseGenerator {
    get prompting() {
        return {
            askForLoginAndPassword() {
                if (statistics.isLinked) {
                    this.log(`Generator already linked with clientId: ${statistics.clientId}`);
                    return;
                }

                const done = this.async();

                const prompts = [
                    {
                        type: 'input',
                        name: 'login',
                        message: 'JHipster online login',
                        default: undefined
                    },
                    {
                        type: 'password',
                        name: 'password',
                        message: 'JHipster online password',
                        default: undefined
                    }
                ];

                this.prompt(prompts).then(props => {
                    this.login = props.login;
                    this.password = props.password;
                    done();
                });
            }
        };
    }

    get configuring() {
        return {
            authenticateAndLink() {
                if (statistics.isLinked) {
                    return;
                }
                const done = this.async();
                authenticateAndLink(statistics.axiosClient, this, this.login, this.password, done).catch(error => {
                    if (statistics.axiosProxyClient && error !== undefined) {
                        authenticateAndLink(statistics.axiosProxyClient, this, this.login, this.password, done).catch(error => {
                            this.log(`Could not authenticate! (with proxy ${error})`);
                            done();
                        });
                    } else if (error !== undefined) {
                        this.log(`Could not authenticate! (without proxy ${error})`);
                        done();
                    }
                });
            }
        };
    }
};

function authenticateAndLink(axiosClient, generator, username, password, done) {
    return axiosClient
        .post(
            `${statistics.statisticsAPIPath}/authenticate`,
            {
                username,
                password,
                rememberMe: false
            },
            true
        )
        .then(
            answer =>
                axiosClient
                    .post(
                        `${statistics.statisticsAPIPath}/s/link/${statistics.clientId}`,
                        {},
                        {
                            headers: {
                                Authorization: answer.headers.authorization
                            }
                        }
                    )
                    .then(
                        success => {
                            generator.log(chalk.green('Link successful!'), 'Your generator ID is :', chalk.bold(statistics.clientId));
                            generator.log(
                                `Go to ${statistics.jhipsterOnlineUrl}/#/your-generators to manage your JHipster Online personal data.`
                            );
                            done();
                            statistics.setLinkedStatus(true);
                        },
                        error => {
                            if (error.response.status === 409) {
                                generator.log.error('It looks like this generator has already been linked to an account.');
                                done();
                            } else {
                                generator.log.error(`Link failed! (${error})`);
                                done();
                            }
                        }
                    ),
            error => Promise.reject(error)
        )
        .then(error => Promise.reject(error));
}
