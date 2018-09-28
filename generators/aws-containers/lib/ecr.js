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
const AWS = require('aws-sdk'); // eslint-disable-line
const _ = require('lodash');

module.exports = class ECR {
    constructor(region) {
        this.ecr = new AWS.ECR({ region });
    }

    /**
     * Returns the instance of the ECR class from the SDK
     * @returns {AWS.ECR|ECR}
     */
    get sdk() {
        return this.ecr;
    }

    /**
     * Fetch the URI of the ECR repository off.
     * @param respositoryName
     * @returns {Promise.<string>}
     */
    getEcrRepositoryURI(respositoryName) {
        return this.ecr
            .describeRepositories({
                repositoryNames: [respositoryName]
            })
            .promise()
            .then(result => _(result.repositories).first().repositoryUri);
    }
};
