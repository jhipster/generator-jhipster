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
const AWS = require('aws-sdk'); // eslint-disable-line
const _ = require('lodash');
const spinner = require('./utils').spinner;

module.exports = class AwSSM {
    constructor(region) {
        this.ssm = new AWS.SSM({ region });
    }

    /**
     * Returns an AWS SSM managed parameter. If no property can be found, an undefined value is returned
     * @param parameterName Name of the parameter to retrieve
     */
    getSSMParameter(parameterName) {
        return spinner(
            this.ssm
                .getParameters({
                    Names: [parameterName],
                    WithDecryption: true
                })
                .promise()
                .then(resultParams => _.get(resultParams, 'Parameters[0].Value'))
        );
    }

    /**
     * Sets an AWS SSM Managed parameter
     * @param parameterName
     *  The name of the parameter to set
     * @param parameterValue
     *  The value of the parameter
     * @param description
     *  A description to associate with the parameter
     * @param parameterType
     *  The type of parameter, either "String", "StringList" or "SecureString"
     */
    setSSMParameter(parameterName, parameterValue, description = '', parameterType = 'SecureString') {
        return spinner(
            this.ssm
                .putParameter({
                    Name: parameterName,
                    Type: parameterType,
                    Description: description,
                    Value: parameterValue,
                    Overwrite: true
                })
                .promise()
        );
    }
};
