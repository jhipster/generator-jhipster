/* eslint-disable @typescript-eslint/consistent-type-imports */
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
// jhipster-needle-add-generator-with-bootstrap-start
export type GeneratorsWithBootstrap =
  | 'app'
  | 'base-application'
  | 'base-simple-application'
  | 'client'
  | 'common'
  | 'java'
  | 'javascript'
  | 'jdl'
  | 'kubernetes'
  | 'languages'
  | 'server'
  | 'spring-boot';
// jhipster-needle-add-generator-with-bootstrap

type GeneratorsByNamespace = {
  // jhipster-needle-add-generator-by-namespace-start
  angular: import('./angular/generator.ts').default;
  'jhipster:angular': import('./angular/generator.ts').default;
  app: import('./app/generator.ts').default;
  'jhipster:app': import('./app/generator.ts').default;
  'jhipster:app:bootstrap': import('./app/generators/bootstrap/generator.ts').default;
  'jhipster:base-application:bootstrap': import('./base-application/generators/bootstrap/generator.ts').default;
  'jhipster:base-simple-application:bootstrap': import('./base-simple-application/generators/bootstrap/generator.ts').default;
  bootstrap: import('./bootstrap/generator.ts').default;
  'jhipster:bootstrap': import('./bootstrap/generator.ts').default;
  'bootstrap-application': import('./bootstrap-application/generator.ts').default;
  'jhipster:bootstrap-application': import('./bootstrap-application/generator.ts').default;
  'bootstrap-application-base': import('./bootstrap-application-base/generator.ts').default;
  'jhipster:bootstrap-application-base': import('./bootstrap-application-base/generator.ts').default;
  'bootstrap-application-client': import('./bootstrap-application-client/generator.ts').default;
  'jhipster:bootstrap-application-client': import('./bootstrap-application-client/generator.ts').default;
  'bootstrap-application-server': import('./bootstrap-application-server/generator.ts').default;
  'jhipster:bootstrap-application-server': import('./bootstrap-application-server/generator.ts').default;
  'bootstrap-workspaces': import('./bootstrap-workspaces/generator.ts').default;
  'jhipster:bootstrap-workspaces': import('./bootstrap-workspaces/generator.ts').default;
  'ci-cd': import('./ci-cd/generator.ts').default;
  'jhipster:ci-cd': import('./ci-cd/generator.ts').default;
  client: import('./client/generator.ts').default;
  'jhipster:client': import('./client/generator.ts').default;
  'jhipster:client:bootstrap': import('./client/generators/bootstrap/generator.ts').default;
  'jhipster:client:common': import('./client/generators/common/generator.ts').default;
  common: import('./common/generator.ts').default;
  'jhipster:common': import('./common/generator.ts').default;
  'jhipster:common:bootstrap': import('./common/generators/bootstrap/generator.ts').default;
  cucumber: import('./cucumber/generator.ts').default;
  'jhipster:cucumber': import('./cucumber/generator.ts').default;
  cypress: import('./cypress/generator.ts').default;
  'jhipster:cypress': import('./cypress/generator.ts').default;
  docker: import('./docker/generator.ts').default;
  'jhipster:docker': import('./docker/generator.ts').default;
  'docker-compose': import('./docker-compose/generator.ts').default;
  'jhipster:docker-compose': import('./docker-compose/generator.ts').default;
  entities: import('./entities/generator.ts').default;
  'jhipster:entities': import('./entities/generator.ts').default;
  entity: import('./entity/generator.ts').default;
  'jhipster:entity': import('./entity/generator.ts').default;
  'export-jdl': import('./export-jdl/generator.ts').default;
  'jhipster:export-jdl': import('./export-jdl/generator.ts').default;
  'feign-client': import('./feign-client/generator.ts').default;
  'jhipster:feign-client': import('./feign-client/generator.ts').default;
  gatling: import('./gatling/generator.ts').default;
  'jhipster:gatling': import('./gatling/generator.ts').default;
  'generate-blueprint': import('./generate-blueprint/generator.ts').default;
  'jhipster:generate-blueprint': import('./generate-blueprint/generator.ts').default;
  git: import('./git/generator.ts').default;
  'jhipster:git': import('./git/generator.ts').default;
  gradle: import('./gradle/generator.ts').default;
  'jhipster:gradle': import('./gradle/generator.ts').default;
  'jhipster:gradle:code-quality': import('./gradle/generators/code-quality/generator.ts').default;
  'jhipster:gradle:jib': import('./gradle/generators/jib/generator.ts').default;
  'jhipster:gradle:node-gradle': import('./gradle/generators/node-gradle/generator.ts').default;
  heroku: import('./heroku/generator.ts').default;
  'jhipster:heroku': import('./heroku/generator.ts').default;
  info: import('./info/generator.ts').default;
  'jhipster:info': import('./info/generator.ts').default;
  init: import('./init/generator.ts').default;
  'jhipster:init': import('./init/generator.ts').default;
  java: import('./java/generator.ts').default;
  'jhipster:java': import('./java/generator.ts').default;
  'jhipster:java:bootstrap': import('./java/generators/bootstrap/generator.ts').default;
  'jhipster:java:build-tool': import('./java/generators/build-tool/generator.ts').default;
  'jhipster:java:code-quality': import('./java/generators/code-quality/generator.ts').default;
  'jhipster:java:domain': import('./java/generators/domain/generator.ts').default;
  'jhipster:java:graalvm': import('./java/generators/graalvm/generator.ts').default;
  'jhipster:java:jib': import('./java/generators/jib/generator.ts').default;
  'jhipster:java:node': import('./java/generators/node/generator.ts').default;
  'jhipster:java:openapi-generator': import('./java/generators/openapi-generator/generator.ts').default;
  'jhipster:java:server': import('./java/generators/server/generator.ts').default;
  'jhipster:javascript:bootstrap': import('./javascript/generators/bootstrap/generator.ts').default;
  'jhipster:javascript:eslint': import('./javascript/generators/eslint/generator.ts').default;
  'jhipster:javascript:husky': import('./javascript/generators/husky/generator.ts').default;
  'jhipster:javascript:prettier': import('./javascript/generators/prettier/generator.ts').default;
  jdl: import('./jdl/generator.ts').default;
  'jhipster:jdl': import('./jdl/generator.ts').default;
  'jhipster:jdl:bootstrap': import('./jdl/generators/bootstrap/generator.ts').default;
  kubernetes: import('./kubernetes/generator.ts').default;
  'jhipster:kubernetes': import('./kubernetes/generator.ts').default;
  'kubernetes-helm': import('./kubernetes-helm/generator.ts').default;
  'jhipster:kubernetes-helm': import('./kubernetes-helm/generator.ts').default;
  'kubernetes-knative': import('./kubernetes-knative/generator.ts').default;
  'jhipster:kubernetes-knative': import('./kubernetes-knative/generator.ts').default;
  'jhipster:kubernetes:bootstrap': import('./kubernetes/generators/bootstrap/generator.ts').default;
  languages: import('./languages/generator.ts').default;
  'jhipster:languages': import('./languages/generator.ts').default;
  'jhipster:languages:bootstrap': import('./languages/generators/bootstrap/generator.ts').default;
  liquibase: import('./liquibase/generator.ts').default;
  'jhipster:liquibase': import('./liquibase/generator.ts').default;
  maven: import('./maven/generator.ts').default;
  'jhipster:maven': import('./maven/generator.ts').default;
  'jhipster:maven:code-quality': import('./maven/generators/code-quality/generator.ts').default;
  'jhipster:maven:frontend-plugin': import('./maven/generators/frontend-plugin/generator.ts').default;
  'jhipster:maven:jib': import('./maven/generators/jib/generator.ts').default;
  'project-name': import('./project-name/generator.ts').default;
  'jhipster:project-name': import('./project-name/generator.ts').default;
  react: import('./react/generator.ts').default;
  'jhipster:react': import('./react/generator.ts').default;
  server: import('./server/generator.ts').default;
  'jhipster:server': import('./server/generator.ts').default;
  'jhipster:server:bootstrap': import('./server/generators/bootstrap/generator.ts').default;
  'spring-boot': import('./spring-boot/generator.ts').default;
  'jhipster:spring-boot': import('./spring-boot/generator.ts').default;
  'jhipster:spring-boot:bootstrap': import('./spring-boot/generators/bootstrap/generator.ts').default;
  'spring-cache': import('./spring-cache/generator.ts').default;
  'jhipster:spring-cache': import('./spring-cache/generator.ts').default;
  'spring-cloud-stream': import('./spring-cloud-stream/generator.ts').default;
  'jhipster:spring-cloud-stream': import('./spring-cloud-stream/generator.ts').default;
  'jhipster:spring-cloud-stream:kafka': import('./spring-cloud-stream/generators/kafka/generator.ts').default;
  'jhipster:spring-cloud-stream:pulsar': import('./spring-cloud-stream/generators/pulsar/generator.ts').default;
  'jhipster:spring-cloud:gateway': import('./spring-cloud/generators/gateway/generator.ts').default;
  'spring-data-cassandra': import('./spring-data-cassandra/generator.ts').default;
  'jhipster:spring-data-cassandra': import('./spring-data-cassandra/generator.ts').default;
  'spring-data-couchbase': import('./spring-data-couchbase/generator.ts').default;
  'jhipster:spring-data-couchbase': import('./spring-data-couchbase/generator.ts').default;
  'spring-data-elasticsearch': import('./spring-data-elasticsearch/generator.ts').default;
  'jhipster:spring-data-elasticsearch': import('./spring-data-elasticsearch/generator.ts').default;
  'spring-data-mongodb': import('./spring-data-mongodb/generator.ts').default;
  'jhipster:spring-data-mongodb': import('./spring-data-mongodb/generator.ts').default;
  'spring-data-neo4j': import('./spring-data-neo4j/generator.ts').default;
  'jhipster:spring-data-neo4j': import('./spring-data-neo4j/generator.ts').default;
  'spring-data-relational': import('./spring-data-relational/generator.ts').default;
  'jhipster:spring-data-relational': import('./spring-data-relational/generator.ts').default;
  'spring-websocket': import('./spring-websocket/generator.ts').default;
  'jhipster:spring-websocket': import('./spring-websocket/generator.ts').default;
  upgrade: import('./upgrade/generator.ts').default;
  'jhipster:upgrade': import('./upgrade/generator.ts').default;
  vue: import('./vue/generator.ts').default;
  'jhipster:vue': import('./vue/generator.ts').default;
  workspaces: import('./workspaces/generator.ts').default;
  'jhipster:workspaces': import('./workspaces/generator.ts').default;
  // jhipster-needle-add-generator-by-namespace - JHipster will add generators here
};

export default GeneratorsByNamespace;
