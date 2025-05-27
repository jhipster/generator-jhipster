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
type GeneratorsByNamespace = {
  angular: import('./angular/generator.js').default;
  'jhipster:angular': import('./angular/generator.js').default;
  app: import('./app/generator.js').default;
  'jhipster:app': import('./app/generator.js').default;
  // @ts-ignore
  base: import('./base/generator.js').default;
  // @ts-ignore
  'jhipster:base': import('./base/generator.js').default;
  'base-application': import('./base-application/generator.js').default;
  'jhipster:base-application': import('./base-application/generator.js').default;
  // @ts-ignore
  'base-core': import('./base-core/generator.js').default;
  // @ts-ignore
  'jhipster:base-core': import('./base-core/generator.js').default;
  'base-entity-changes': import('./base-entity-changes/generator.js').default;
  'jhipster:base-entity-changes': import('./base-entity-changes/generator.js').default;
  'base-workspaces': import('./base-workspaces/generator.js').default;
  'jhipster:base-workspaces': import('./base-workspaces/generator.js').default;
  bootstrap: import('./bootstrap/generator.js').default;
  'jhipster:bootstrap': import('./bootstrap/generator.js').default;
  'bootstrap-application': import('./bootstrap-application/generator.js').default;
  'jhipster:bootstrap-application': import('./bootstrap-application/generator.js').default;
  'bootstrap-application-base': import('./bootstrap-application-base/generator.js').default;
  'jhipster:bootstrap-application-base': import('./bootstrap-application-base/generator.js').default;
  'bootstrap-application-client': import('./bootstrap-application-client/generator.js').default;
  'jhipster:bootstrap-application-client': import('./bootstrap-application-client/generator.js').default;
  'bootstrap-application-server': import('./bootstrap-application-server/generator.js').default;
  'jhipster:bootstrap-application-server': import('./bootstrap-application-server/generator.js').default;
  'bootstrap-workspaces': import('./bootstrap-workspaces/generator.js').default;
  'jhipster:bootstrap-workspaces': import('./bootstrap-workspaces/generator.js').default;
  'ci-cd': import('./ci-cd/generator.js').default;
  'jhipster:ci-cd': import('./ci-cd/generator.js').default;
  client: import('./client/generator.js').default;
  'jhipster:client': import('./client/generator.js').default;
  common: import('./common/generator.js').default;
  'jhipster:common': import('./common/generator.js').default;
  cucumber: import('./cucumber/generator.js').default;
  'jhipster:cucumber': import('./cucumber/generator.js').default;
  cypress: import('./cypress/generator.js').default;
  'jhipster:cypress': import('./cypress/generator.js').default;
  docker: import('./docker/generator.js').default;
  'jhipster:docker': import('./docker/generator.js').default;
  'docker-compose': import('./docker-compose/generator.js').default;
  'jhipster:docker-compose': import('./docker-compose/generator.js').default;
  entities: import('./entities/generator.js').default;
  'jhipster:entities': import('./entities/generator.js').default;
  entity: import('./entity/generator.js').default;
  'jhipster:entity': import('./entity/generator.js').default;
  'export-jdl': import('./export-jdl/generator.js').default;
  'jhipster:export-jdl': import('./export-jdl/generator.js').default;
  'feign-client': import('./feign-client/generator.js').default;
  'jhipster:feign-client': import('./feign-client/generator.js').default;
  gatling: import('./gatling/generator.js').default;
  'jhipster:gatling': import('./gatling/generator.js').default;
  // @ts-ignore
  'generate-blueprint': import('./generate-blueprint/generator.js').default;
  // @ts-ignore
  'jhipster:generate-blueprint': import('./generate-blueprint/generator.js').default;
  git: import('./git/generator.js').default;
  'jhipster:git': import('./git/generator.js').default;
  gradle: import('./gradle/generator.js').default;
  'jhipster:gradle': import('./gradle/generator.js').default;
  heroku: import('./heroku/generator.js').default;
  'jhipster:heroku': import('./heroku/generator.js').default;
  info: import('./info/generator.js').default;
  'jhipster:info': import('./info/generator.js').default;
  init: import('./init/generator.js').default;
  'jhipster:init': import('./init/generator.js').default;
  java: import('./java/generator.js').default;
  'jhipster:java': import('./java/generator.js').default;
  jdl: import('./jdl/generator.js').default;
  'jhipster:jdl': import('./jdl/generator.js').default;
  kubernetes: import('./kubernetes/generator.js').default;
  'jhipster:kubernetes': import('./kubernetes/generator.js').default;
  'kubernetes-helm': import('./kubernetes-helm/generator.js').default;
  'jhipster:kubernetes-helm': import('./kubernetes-helm/generator.js').default;
  'kubernetes-knative': import('./kubernetes-knative/generator.js').default;
  'jhipster:kubernetes-knative': import('./kubernetes-knative/generator.js').default;
  languages: import('./languages/generator.js').default;
  'jhipster:languages': import('./languages/generator.js').default;
  liquibase: import('./liquibase/generator.js').default;
  'jhipster:liquibase': import('./liquibase/generator.js').default;
  maven: import('./maven/generator.js').default;
  'jhipster:maven': import('./maven/generator.js').default;
  'project-name': import('./project-name/generator.js').default;
  'jhipster:project-name': import('./project-name/generator.js').default;
  react: import('./react/generator.js').default;
  'jhipster:react': import('./react/generator.js').default;
  server: import('./server/generator.js').default;
  'jhipster:server': import('./server/generator.js').default;
  'spring-boot': import('./spring-boot/generator.js').default;
  'jhipster:spring-boot': import('./spring-boot/generator.js').default;
  'spring-cache': import('./spring-cache/generator.js').default;
  'jhipster:spring-cache': import('./spring-cache/generator.js').default;
  'spring-cloud-stream': import('./spring-cloud-stream/generator.js').default;
  'jhipster:spring-cloud-stream': import('./spring-cloud-stream/generator.js').default;
  'spring-data-cassandra': import('./spring-data-cassandra/generator.js').default;
  'jhipster:spring-data-cassandra': import('./spring-data-cassandra/generator.js').default;
  'spring-data-couchbase': import('./spring-data-couchbase/generator.js').default;
  'jhipster:spring-data-couchbase': import('./spring-data-couchbase/generator.js').default;
  'spring-data-elasticsearch': import('./spring-data-elasticsearch/generator.js').default;
  'jhipster:spring-data-elasticsearch': import('./spring-data-elasticsearch/generator.js').default;
  'spring-data-mongodb': import('./spring-data-mongodb/generator.js').default;
  'jhipster:spring-data-mongodb': import('./spring-data-mongodb/generator.js').default;
  'spring-data-neo4j': import('./spring-data-neo4j/generator.js').default;
  'jhipster:spring-data-neo4j': import('./spring-data-neo4j/generator.js').default;
  'spring-data-relational': import('./spring-data-relational/generator.js').default;
  'jhipster:spring-data-relational': import('./spring-data-relational/generator.js').default;
  'spring-websocket': import('./spring-websocket/generator.js').default;
  'jhipster:spring-websocket': import('./spring-websocket/generator.js').default;
  upgrade: import('./upgrade/generator.js').default;
  'jhipster:upgrade': import('./upgrade/generator.js').default;
  vue: import('./vue/generator.js').default;
  'jhipster:vue': import('./vue/generator.js').default;
  workspaces: import('./workspaces/generator.js').default;
  'jhipster:workspaces': import('./workspaces/generator.js').default;
  'jhipster:client:common': import('./client/generators/common/generator.js').default;
  'jhipster:gradle:code-quality': import('./gradle/generators/code-quality/generator.js').default;
  'jhipster:gradle:jib': import('./gradle/generators/jib/generator.js').default;
  'jhipster:gradle:node-gradle': import('./gradle/generators/node-gradle/generator.js').default;
  'jhipster:java:bootstrap': import('./java/generators/bootstrap/generator.js').default;
  'jhipster:java:build-tool': import('./java/generators/build-tool/generator.js').default;
  'jhipster:java:code-quality': import('./java/generators/code-quality/generator.js').default;
  'jhipster:java:domain': import('./java/generators/domain/generator.js').default;
  'jhipster:java:graalvm': import('./java/generators/graalvm/generator.js').default;
  'jhipster:java:jib': import('./java/generators/jib/generator.js').default;
  'jhipster:java:node': import('./java/generators/node/generator.js').default;
  'jhipster:java:openapi-generator': import('./java/generators/openapi-generator/generator.js').default;
  'jhipster:java:server': import('./java/generators/server/generator.js').default;
  'jhipster:javascript:bootstrap': import('./javascript/generators/bootstrap/generator.js').default;
  'jhipster:javascript:eslint': import('./javascript/generators/eslint/generator.js').default;
  'jhipster:javascript:husky': import('./javascript/generators/husky/generator.js').default;
  'jhipster:javascript:prettier': import('./javascript/generators/prettier/generator.js').default;
  'jhipster:maven:code-quality': import('./maven/generators/code-quality/generator.js').default;
  'jhipster:maven:frontend-plugin': import('./maven/generators/frontend-plugin/generator.js').default;
  'jhipster:maven:jib': import('./maven/generators/jib/generator.js').default;
  'jhipster:spring-cloud:gateway': import('./spring-cloud/generators/gateway/generator.js').default;
  'jhipster:spring-cloud-stream:kafka': import('./spring-cloud-stream/generators/kafka/generator.js').default;
  'jhipster:spring-cloud-stream:pulsar': import('./spring-cloud-stream/generators/pulsar/generator.js').default;
  // jhipster-needle-add-generator-by-namespace - JHipster will add generators here
};

export default GeneratorsByNamespace;
