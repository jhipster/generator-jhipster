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

const BaseGenerator = require('../generator-base');
const Statistics = require('../statistics');
const chalk = require('chalk');


module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);

        // Shows the generator's id
        this.argument('guid', {
            type: Boolean,
            required: false,
            default: false,
            description: 'Show the generator ID'
        });

        this.showGuid = this.options.guid;
        this.stats = new Statistics();
    }

    get prompting() {
        return {
            askForLoginAndPassword() {
                if (!this.showGuid) {
                    const done = this.async();

                    const prompts = [{
                        type: 'input',
                        name: 'login',
                        message: 'JHipster online login',
                        default: undefined
                    }, {
                        type: 'password',
                        name: 'password',
                        message: 'JHipster online password',
                        default: undefined
                    }];

                    this.prompt(prompts).then((props) => {
                        this.login = props.login;
                        this.password = props.password;
                        done();
                    });
                }
            }
        };
    }

    get configuring() {
        return {
            authenticateAndLink() {
                if (!this.showGuid) {
                    authenticateAndLink(
                        this.stats.axiosClient,
                        this,
                        this.login,
                        this.password,
                        this.stats.clientId,
                        this.stats.statisticsAPIPath
                    ).catch((error) => {
                        if (this.stats.axiosProxyClient && error !== undefined) {
                            authenticateAndLink(
                                this.stats.axiosProxyClient,
                                this,
                                this.login,
                                this.password,
                                this.stats.clientId,
                                this.stats.statisticsAPIPath
                            ).catch((error) => {
                                this.log(`Could not authenticate! (with proxy ${error})`);
                            });
                        } else if (error !== undefined) {
                            this.log(`Could not authenticate! (without proxy ${error})`);
                        }
                    });
                }
            },
            displayGuid() {
                if (this.showGuid) {
                    this.log(chalk.bold('You generator ID is : '), chalk.bold.bgGreen(this.stats.clientId));
                }
            }
        };
    }
};

function authenticateAndLink(axiosClient, generator, username, password, generatorId, statisticsPath) {
    return axiosClient.post(`${generator.stats.statisticsAPIPath}authenticate`, {
        username,
        password,
        rememberMe: false
    }, true).then(answer =>
        axiosClient.post(`${generator.stats.statisticsAPIPath}s/link/${generatorId}`, {}, {
            headers: {
                Authorization: answer.headers.authorization
            }
        }).then((success) => {
            generator.log('Link successful!');
        }, (error) => {
            if (error.response.status === 409) {
                generator.log.error('It looks like this generator has already been linked to an account.');
            } else {
                generator.log.error(`Link failed! (${error})`);
            }
        }), error => Promise.reject(error)).then(error => Promise.reject(error));
}
