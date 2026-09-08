/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

import { APPLICATION_TYPE_GATEWAY, APPLICATION_TYPE_MONOLITH } from '../../lib/core/application-types.ts';
import { applicationOptions, databaseTypes } from '../../lib/jhipster/index.ts';
import { asPromptingTask } from '../base-application/support/task-type-inference.ts';

import type SpringBootGenerator from './generator.ts';

const { OptionNames } = applicationOptions;
const { MONGODB, NEO4J, SQL, COUCHBASE } = databaseTypes;
const { WEBSOCKET, SEARCH_ENGINE, ENABLE_SWAGGER_CODEGEN } = OptionNames;

export const askForOptionalItems = asPromptingTask(async function askForOptionalItems(this: SpringBootGenerator, { control }) {
  if (control.existingProject && !this.options.askAnswered) return;

  const { applicationType, reactive, databaseType } = this.jhipsterConfigWithDefaults;

  const choices: { name: string; value: string; checked?: boolean }[] = [];
  if (([SQL, MONGODB, NEO4J] as string[]).includes(databaseType as string)) {
    choices.push({
      name: 'Elasticsearch as search engine',
      value: 'searchEngine:elasticsearch',
    });
  }
  if (databaseType === COUCHBASE) {
    choices.push({
      name: 'Couchbase FTS as search engine',
      value: 'searchEngine:couchbase',
    });
  }
  if (!reactive && (applicationType === APPLICATION_TYPE_MONOLITH || applicationType === APPLICATION_TYPE_GATEWAY)) {
    choices.push({
      name: 'WebSockets using Spring Websocket',
      value: 'websocket:spring-websocket',
    });
  }
  choices.push(
    {
      name: 'Apache Kafka as asynchronous messages broker',
      value: 'messageBroker:kafka',
    },
    {
      name: 'Apache Pulsar as asynchronous messages broker',
      value: 'messageBroker:pulsar',
    },
    {
      name: 'API first development using OpenAPI-generator',
      value: 'enableSwaggerCodegen:true',
    },
  );

  if (choices.length > 0) {
    const selectedChoices: string[] = [WEBSOCKET, SEARCH_ENGINE, 'messageBroker', ENABLE_SWAGGER_CODEGEN]
      .map(property => [property, (this.jhipsterConfig as any)[property]] as [string, any])
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}:${value}`)
      .filter(Boolean);

    choices.forEach(choice => {
      choice.checked = selectedChoices.includes(choice.value);
    });

    const answers = await this.prompt({
      type: 'checkbox',
      name: 'serverSideOptions',
      message: 'Which other technologies would you like to use?',
      choices,
      default: selectedChoices,
    });

    Object.assign(
      this.jhipsterConfig,
      Object.fromEntries(
        (answers.serverSideOptions as string[])
          .map(it => it.split(':'))
          .map(([key, value]) => [key, ['true', 'false'].includes(value) ? value === 'true' : value]),
      ),
    );
  }
});
