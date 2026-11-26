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
import { type TranslationConditions, prepareTranslation } from '../../../../languages/generators/i18n-bootstrap/support/index.ts';

/** The values of the application a translation takes, written {name} in its text. */
export type TranslationNames = {
  capitalizedBaseName: string;
  hipsterName: string;
  hipsterProductName: string;
  hipsterHomePageProductName: string;
  hipsterStackOverflowProductName: string;
  hipsterBugTrackerProductName: string;
  hipsterChatProductName: string;
  hipsterTwitterUsername: string;
};

/** The options of the application whose keys a translation has only when they hold. */
export type TranslationOptions = TranslationNames & {
  applicationTypeGateway?: boolean;
  serviceDiscoveryAny?: boolean;
  serviceDiscoveryConsul?: boolean;
  reactive?: boolean;
  searchEngineElasticsearch?: boolean;
  messageBrokerAny?: boolean;
  cacheProviderHazelcast?: boolean;
  databaseTypeSql?: boolean;
  databaseTypeMongodb?: boolean;
  databaseTypeCassandra?: boolean;
  databaseTypeCouchbase?: boolean;
  databaseTypeNeo4j?: boolean;
};

const withDiscovery = ({ applicationTypeGateway, serviceDiscoveryAny }: TranslationOptions) =>
  applicationTypeGateway || serviceDiscoveryAny;

/** The keys of each translation file of the client, by their path, that the file has only when their condition holds. */
const CLIENT_TRANSLATION_CONDITIONS: Record<string, TranslationConditions<TranslationOptions>> = {
  global: {
    'global.menu.admin.gateway': ({ applicationTypeGateway }) => applicationTypeGateway,
    'error.querySyntaxError': ({ searchEngineElasticsearch }) => searchEngineElasticsearch,
  },
  health: {
    'health.indicator.binders': ({ messageBrokerAny }) => messageBrokerAny,
    'health.indicator.discoveryComposite': withDiscovery,
    'health.indicator.refreshScope': withDiscovery,
    'health.indicator.clientConfigServer': withDiscovery,
    'health.indicator.hystrix': withDiscovery,
    'health.indicator.consul': options => withDiscovery(options) && options.serviceDiscoveryConsul,
    'health.indicator.reactiveDiscoveryClients': options => withDiscovery(options) && !options.serviceDiscoveryConsul && options.reactive,
    'health.indicator.hazelcast': ({ cacheProviderHazelcast }) => cacheProviderHazelcast,
    'health.indicator.elasticsearch': ({ searchEngineElasticsearch }) => searchEngineElasticsearch,
    'health.indicator.db': ({ databaseTypeSql, reactive }) => databaseTypeSql && !reactive,
    'health.indicator.r2dbc': ({ databaseTypeSql, reactive }) => databaseTypeSql && reactive,
    'health.indicator.mongo': ({ databaseTypeMongodb }) => databaseTypeMongodb,
    'health.indicator.cassandra': ({ databaseTypeCassandra }) => databaseTypeCassandra,
    'health.indicator.couchbase': ({ databaseTypeCouchbase }) => databaseTypeCouchbase,
    'health.indicator.neo4j': ({ databaseTypeNeo4j }) => databaseTypeNeo4j,
  },
};

const CLIENT_TRANSLATION_NAMES: (keyof TranslationNames)[] = [
  'capitalizedBaseName',
  'hipsterName',
  'hipsterProductName',
  'hipsterHomePageProductName',
  'hipsterStackOverflowProductName',
  'hipsterBugTrackerProductName',
  'hipsterChatProductName',
  'hipsterTwitterUsername',
];

/**
 * The content of a translation file of the client, from the file of the language: with the names of the application,
 * without the keys whose options do not hold.
 */
export const prepareClientTranslation = (
  file: string,
  translation: Record<string, any>,
  options: TranslationOptions,
): Record<string, any> =>
  prepareTranslation(translation, {
    names: Object.fromEntries(CLIENT_TRANSLATION_NAMES.map(name => [name, options[name]])),
    conditions: CLIENT_TRANSLATION_CONDITIONS[file],
    options,
  });
