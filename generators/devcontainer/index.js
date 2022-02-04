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
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const chalk = require('chalk');
const writeFiles = require('./files').writeFiles;
const BaseDockerGenerator = require('../generator-base-docker');

module.exports = class extends BaseDockerGenerator {
    constructor(args, opts) {
        super(args, opts);
        this.registerPrettierTransform();
    }

    get initializing() {
        return {
            ...super.initializing,
        };
    }

    get prompting() {
        if (this.abort) return undefined;
        return super.prompting;
    }

    get configuring() {
        return {
            sayHello() {
                this.log(chalk.white(`${chalk.bold('👾')}  Welcome to the JHipster .devcontainer Sub-Generator ${chalk.bold('👾')}`));
                this.log(chalk.white(`Files will be generated in folder: ${chalk.yellow(this.destinationRoot())}`));
            },

            ...super.configuring,
        };
    }

    get writing() {
        return writeFiles();
    }

    end() {
        if (this.warning) {
            this.log('An issue has occured generating the .devcontainer files:');
            this.log(chalk.red(this.warningMessage));
        } else {
            this.log(`\n${chalk.bold.green('.devcontainer folder was successfully generated!')}`);
        }
    }
};
