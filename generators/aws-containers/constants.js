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

const AWS_SSM_VERSION = '1.11.247';
const SPRING_CLOUD_CTX_VERSION = '1.3.0.RELEASE';

const configuration = {
    aws: 'aws'
};

const constants = {
    conf: configuration,
    AWS_SSM_VERSION,
    SPRING_CLOUD_CTX_VERSION
};

module.exports = constants;
