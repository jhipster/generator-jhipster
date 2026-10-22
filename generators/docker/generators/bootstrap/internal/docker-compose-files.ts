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
import type { Application as SpringDataRelationalApplication } from '../../../../spring-boot/generators/data-relational/index.ts';
import type { Application as SpringBootApplication } from '../../../../spring-boot/index.ts';
import type { Application as DockerApplication, DockerComposeServiceConfig } from '../../../types.ts';

/** An application with docker compose files: its docker data and the backend choices its services depend on. */
export type DockerComposeApplication = DockerApplication & SpringDataRelationalApplication<any> & SpringBootApplication<any>;

/**
 * Adds a docker compose file to the application: its template, named after it, and the data merged into it, with the
 * project name of the application.
 */
export const addDockerComposeFile = (
  application: DockerComposeApplication,
  name: string,
  services: Record<string, DockerComposeServiceConfig>,
) => {
  application.dockerComposeFiles[name] = {
    source: `${name}.yml.ejs`,
    data: { name: application.lowercaseBaseName, services },
  };
};

/** Spring Boot docker compose support ignores the service. */
export const springBootIgnore = (ignore: boolean | undefined): DockerComposeServiceConfig =>
  ignore ? { labels: { 'org.springframework.boot.ignore': true } } : {};

/**
 * The variables of the `app` service: the ones of the application, then the Spring Boot ones of its services, named by
 * their host with the prefix.
 */
export const applicationEnvironment = (
  app: DockerComposeApplication,
  variables: Record<string, string | undefined>,
  hostPrefix: string,
): string[] => {
  const springBoot = app.backendTypeSpringBoot;
  return [
    ...Object.entries(variables).map(([key, value]) => `${key}=${value ?? ''}`),
    ...(springBoot && app.cacheProviderMemcached ? [`JHIPSTER_CACHE_MEMCACHED_SERVERS=${hostPrefix}memcached:11211`] : []),
    ...(springBoot && app.cacheProviderRedis ?
      [`JHIPSTER_CACHE_REDIS_SERVER=redis://${hostPrefix}redis:6379`, 'JHIPSTER_CACHE_REDIS_CLUSTER=false']
    : []),
    ...(springBoot && app.searchEngineElasticsearch ? [`SPRING_ELASTICSEARCH_URIS=http://${hostPrefix}elasticsearch:9200`] : []),
    // The message brokers are shared by the applications of a deployment: their host keeps its name.
    ...(springBoot && app.messageBrokerKafka ? ['SPRING_CLOUD_STREAM_KAFKA_BINDER_BROKERS=kafka:9092'] : []),
    ...(springBoot && app.messageBrokerPulsar ?
      ['SPRING_PULSAR_CLIENT_SERVICE_URL=pulsar://pulsar:6650', 'SPRING_PULSAR_ADMINISTRATION_SERVICE_URL=http://pulsar:8080']
    : []),
    ...(app.cacheProviderInfinispan ? ['JAVA_OPTS=-Djgroups.tcp.address=NON_LOOPBACK -Djava.net.preferIPv4Stack=true'] : []),
  ];
};
