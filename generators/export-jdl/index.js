/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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

module.exports = class extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        this.baseName = this.config.get('baseName');
        this.argument('jdlFile', { type: String, required: false, defaults: `${this.baseName}.jh` });
        this.jdlFile = this.options.jdlFile;
    }

    get default() {
        return {
            insight() {
                const insight = this.insight();
                insight.trackWithEvent('generator', 'export-jdl');
            },

            parseJson() {
                this.log('Parsing entities from .jhipster dir...');
                this.jdl = this.generateJDLFromEntities();
            }
        };
    }

    writing() {
        const content = `// JDL definition for application '${this.baseName}' generated with command 'jhipster export-jdl'\n\n${this.jdl.toString()}`;
        this.fs.write(this.jdlFile, content);
    }

    end() {
        this.log(chalk.green.bold('\nEntities successfully exported to JDL file\n'));
    }
};
