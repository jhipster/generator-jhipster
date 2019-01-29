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
const Base = require('./needle-base');
const ClientAngular = require('./needle-client-angular');
const ClientReact = require('./needle-client-react');
const ClientWebpack = require('./needle-client-webpack');
const ClientI18n = require('./needle-client-i18n');
const ServerMaven = require('./needle-server-maven');
const ServerGradle = require('./needle-server-gradle');
const ServerCache = require('./needle-server-cache');
const ServerLiquibase = require('./needle-server-liquibase');

module.exports = class NeedleApi {
    constructor(generator) {
        this.base = new Base(generator);
        this.serverMaven = new ServerMaven(generator);
        this.clientAngular = new ClientAngular(generator);
        this.clientReact = new ClientReact(generator);
        this.clientWebpack = new ClientWebpack(generator);
        this.clientI18n = new ClientI18n(generator);
        this.serverCache = new ServerCache(generator);
        this.serverLiquibase = new ServerLiquibase(generator);
        this.serverGradle = new ServerGradle(generator);
    }
};
