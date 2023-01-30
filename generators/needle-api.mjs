/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Base from './needle-base.mjs';
import Client from './client/needle-api/needle-client.mjs';
import ClientAngular from './angular/needle-api/needle-client-angular.mjs';
import ClientReact from './react/needle-api/needle-client-react.mjs';
import ClientVue from './client/needle-api/needle-client-vue.mjs';
import ClientWebpack from './client/needle-api/needle-client-webpack.mjs';
import ClientI18n from './client/needle-api/needle-client-i18n.mjs';
import ServerMaven from './server/needle-api/needle-server-maven.mjs';
import ServerGradle from './server/needle-api/needle-server-gradle.mjs';
import ServerCache from './server/needle-api/needle-server-cache.mjs';
import ServerLiquibase from './server/needle-api/needle-server-liquibase.mjs';
import ServerLog from './server/needle-api/needle-server-logback-spring.mjs';

export default class NeedleApi {
  constructor(generator) {
    this.base = new Base(generator);
    this.client = new Client(generator);
    this.clientAngular = new ClientAngular(generator);
    this.clientReact = new ClientReact(generator);
    this.clientVue = new ClientVue(generator);
    this.clientWebpack = new ClientWebpack(generator);
    this.clientI18n = new ClientI18n(generator);
    this.serverMaven = new ServerMaven(generator);
    this.serverCache = new ServerCache(generator);
    this.serverLiquibase = new ServerLiquibase(generator);
    this.serverGradle = new ServerGradle(generator);
    this.serverLog = new ServerLog(generator);
  }
}
