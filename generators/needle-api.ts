/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import Base from './needle-base.js';
import Client from './client/needle-api/needle-client.js';
import ClientAngular from './angular/needle-api/needle-client-angular.js';
import ClientReact from './react/needle-api/needle-client-react.js';
import ClientVue from './client/needle-api/needle-client-vue.js';

export default class NeedleApi {
  base: Base;
  client: Client;
  clientAngular: ClientAngular;
  clientReact: ClientReact;
  clientVue: ClientVue;

  constructor(generator) {
    this.base = new Base(generator);
    this.client = new Client(generator);
    this.clientAngular = new ClientAngular(generator);
    this.clientReact = new ClientReact(generator);
    this.clientVue = new ClientVue(generator);
  }
}
