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
  | 'angular'
  | 'app'
  | 'base-application'
  | 'base-simple-application'
  | 'base-workspaces'
  | 'ci-cd'
  | 'client'
  | 'common'
  | 'docker'
  | 'java-simple-application'
  | 'java'
  | 'javascript-simple-application'
  | 'jdl'
  | 'kubernetes'
  | 'languages'
  | 'project-name'
  | 'react'
  | 'server'
  | 'spring-boot'
  | 'vue';
// jhipster-needle-add-generator-with-bootstrap

type GeneratorsByNamespace = {
  // jhipster-needle-add-generator-by-namespace-start
  angular: import('./angular/generator.ts').default;
  'jhipster:angular': import('./angular/generator.ts').default;
  'jhipster:angular:bootstrap': import('./angular/generators/bootstrap/generator.ts').default;
  app: import('./app/generator.ts').default;
  'jhipster:app': import('./app/generator.ts').default;
  'jhipster:app:bootstrap': import('./app/generators/bootstrap/generator.ts').default;
  'jhipster:base-application:bootstrap': import('./base-application/generators/bootstrap/generator.ts').default;
  'jhipster:base-simple-application:bootstrap': import('./base-simple-application/generators/bootstrap/generator.ts').default;
  'jhipster:base-workspaces:bootstrap': import('./base-workspaces/generators/bootstrap/generator.ts').default;
  bootstrap: import('./bootstrap/generator.ts').default;
  'jhipster:bootstrap': import('./bootstrap/generator.ts').default;
  'ci-cd': import('./ci-cd/generator.ts').default;
  'jhipster:ci-cd': import('./ci-cd/generator.ts').default;
  'jhipster:ci-cd:bootstrap': import('./ci-cd/generators/bootstrap/generator.ts').default;
  client: import('./client/generator.ts').default;
  'jhipster:client': import('./client/generator.ts').default;
  'jhipster:client:bootstrap': import('./client/generators/bootstrap/generator.ts').default;
  'jhipster:client:common': import('./client/generators/common/generator.ts').default;
  'jhipster:client:encode-csrf-token': import('./client/generators/encode-csrf-token/generator.ts').default;
  'jhipster:client:i18n': import('./client/generators/i18n/generator.ts').default;
  common: import('./common/generator.ts').default;
  'jhipster:common': import('./common/generator.ts').default;
  'jhipster:common:bootstrap': import('./common/generators/bootstrap/generator.ts').default;
  cypress: import('./cypress/generator.ts').default;
  'jhipster:cypress': import('./cypress/generator.ts').default;
  docker: import('./docker/generator.ts').default;
  'jhipster:docker': import('./docker/generator.ts').default;
  'docker-compose': import('./docker-compose/generator.ts').default;
  'jhipster:docker-compose': import('./docker-compose/generator.ts').default;
  'jhipster:docker:bootstrap': import('./docker/generators/bootstrap/generator.ts').default;
  entities: import('./entities/generator.ts').default;
  'jhipster:entities': import('./entities/generator.ts').default;
  entity: import('./entity/generator.ts').default;
  'jhipster:entity': import('./entity/generator.ts').default;
  'export-jdl': import('./export-jdl/generator.ts').default;
  'jhipster:export-jdl': import('./export-jdl/generator.ts').default;
  'generate-blueprint': import('./generate-blueprint/generator.ts').default;
  'jhipster:generate-blueprint': import('./generate-blueprint/generator.ts').default;
  git: import('./git/generator.ts').default;
  'jhipster:git': import('./git/generator.ts').default;
  heroku: import('./heroku/generator.ts').default;
  'jhipster:heroku': import('./heroku/generator.ts').default;
  info: import('./info/generator.ts').default;
  'jhipster:info': import('./info/generator.ts').default;
  init: import('./init/generator.ts').default;
  'jhipster:init': import('./init/generator.ts').default;
  java: import('./java/generator.ts').default;
  'jhipster:java': import('./java/generator.ts').default;
  'java-simple-application': import('./java-simple-application/generator.ts').default;
  'jhipster:java-simple-application': import('./java-simple-application/generator.ts').default;
  'jhipster:java-simple-application:bootstrap': import('./java-simple-application/generators/bootstrap/generator.ts').default;
  'jhipster:java-simple-application:build-tool': import('./java-simple-application/generators/build-tool/generator.ts').default;
  'jhipster:java-simple-application:code-quality': import('./java-simple-application/generators/code-quality/generator.ts').default;
  'jhipster:java-simple-application:graalvm': import('./java-simple-application/generators/graalvm/generator.ts').default;
  'jhipster:java-simple-application:gradle': import('./java-simple-application/generators/gradle/generator.ts').default;
  'jhipster:java-simple-application:jib': import('./java-simple-application/generators/jib/generator.ts').default;
  'jhipster:java-simple-application:maven': import('./java-simple-application/generators/maven/generator.ts').default;
  'jhipster:java-simple-application:openapi-generator': import('./java-simple-application/generators/openapi-generator/generator.ts').default;
  'jhipster:java:bootstrap': import('./java/generators/bootstrap/generator.ts').default;
  'jhipster:java:domain': import('./java/generators/domain/generator.ts').default;
  'jhipster:java:gatling': import('./java/generators/gatling/generator.ts').default;
  'jhipster:java:i18n': import('./java/generators/i18n/generator.ts').default;
  'jhipster:java:node': import('./java/generators/node/generator.ts').default;
  'jhipster:java:server': import('./java/generators/server/generator.ts').default;
  'javascript-simple-application': import('./javascript-simple-application/generator.ts').default;
  'jhipster:javascript-simple-application': import('./javascript-simple-application/generator.ts').default;
  'jhipster:javascript-simple-application:bootstrap': import('./javascript-simple-application/generators/bootstrap/generator.ts').default;
  'jhipster:javascript-simple-application:eslint': import('./javascript-simple-application/generators/eslint/generator.ts').default;
  'jhipster:javascript-simple-application:husky': import('./javascript-simple-application/generators/husky/generator.ts').default;
  'jhipster:javascript-simple-application:prettier': import('./javascript-simple-application/generators/prettier/generator.ts').default;
  jdl: import('./jdl/generator.ts').default;
  'jhipster:jdl': import('./jdl/generator.ts').default;
  'jhipster:jdl:bootstrap': import('./jdl/generators/bootstrap/generator.ts').default;
  kubernetes: import('./kubernetes/generator.ts').default;
  'jhipster:kubernetes': import('./kubernetes/generator.ts').default;
  'jhipster:kubernetes:bootstrap': import('./kubernetes/generators/bootstrap/generator.ts').default;
  'jhipster:kubernetes:helm': import('./kubernetes/generators/helm/generator.ts').default;
  'jhipster:kubernetes:knative': import('./kubernetes/generators/knative/generator.ts').default;
  languages: import('./languages/generator.ts').default;
  'jhipster:languages': import('./languages/generator.ts').default;
  'jhipster:languages:bootstrap': import('./languages/generators/bootstrap/generator.ts').default;
  liquibase: import('./liquibase/generator.ts').default;
  'jhipster:liquibase': import('./liquibase/generator.ts').default;
  'project-name': import('./project-name/generator.ts').default;
  'jhipster:project-name': import('./project-name/generator.ts').default;
  'jhipster:project-name:bootstrap': import('./project-name/generators/bootstrap/generator.ts').default;
  react: import('./react/generator.ts').default;
  'jhipster:react': import('./react/generator.ts').default;
  'jhipster:react:bootstrap': import('./react/generators/bootstrap/generator.ts').default;
  server: import('./server/generator.ts').default;
  'jhipster:server': import('./server/generator.ts').default;
  'jhipster:server:bootstrap': import('./server/generators/bootstrap/generator.ts').default;
  'spring-boot': import('./spring-boot/generator.ts').default;
  'jhipster:spring-boot': import('./spring-boot/generator.ts').default;
  'jhipster:spring-boot:bootstrap': import('./spring-boot/generators/bootstrap/generator.ts').default;
  'jhipster:spring-boot:cucumber': import('./spring-boot/generators/cucumber/generator.ts').default;
  'jhipster:spring-boot:feign-client': import('./spring-boot/generators/feign-client/generator.ts').default;
  'jhipster:spring-boot:jwt': import('./spring-boot/generators/jwt/generator.ts').default;
  'jhipster:spring-boot:oauth2': import('./spring-boot/generators/oauth2/generator.ts').default;
  'jhipster:spring-boot:websocket': import('./spring-boot/generators/websocket/generator.ts').default;
  'spring-cache': import('./spring-cache/generator.ts').default;
  'jhipster:spring-cache': import('./spring-cache/generator.ts').default;
  'spring-cloud': import('./spring-cloud/generator.ts').default;
  'jhipster:spring-cloud': import('./spring-cloud/generator.ts').default;
  'jhipster:spring-cloud:gateway': import('./spring-cloud/generators/gateway/generator.ts').default;
  'jhipster:spring-cloud:kafka': import('./spring-cloud/generators/kafka/generator.ts').default;
  'jhipster:spring-cloud:pulsar': import('./spring-cloud/generators/pulsar/generator.ts').default;
  'spring-data': import('./spring-data/generator.ts').default;
  'jhipster:spring-data': import('./spring-data/generator.ts').default;
  'jhipster:spring-data:cassandra': import('./spring-data/generators/cassandra/generator.ts').default;
  'jhipster:spring-data:couchbase': import('./spring-data/generators/couchbase/generator.ts').default;
  'jhipster:spring-data:elasticsearch': import('./spring-data/generators/elasticsearch/generator.ts').default;
  'jhipster:spring-data:mongodb': import('./spring-data/generators/mongodb/generator.ts').default;
  'jhipster:spring-data:neo4j': import('./spring-data/generators/neo4j/generator.ts').default;
  'jhipster:spring-data:relational': import('./spring-data/generators/relational/generator.ts').default;
  upgrade: import('./upgrade/generator.ts').default;
  'jhipster:upgrade': import('./upgrade/generator.ts').default;
  vue: import('./vue/generator.ts').default;
  'jhipster:vue': import('./vue/generator.ts').default;
  'jhipster:vue:bootstrap': import('./vue/generators/bootstrap/generator.ts').default;
  workspaces: import('./workspaces/generator.ts').default;
  'jhipster:workspaces': import('./workspaces/generator.ts').default;
  // jhipster-needle-add-generator-by-namespace - JHipster will add generators here
};

export default GeneratorsByNamespace;
