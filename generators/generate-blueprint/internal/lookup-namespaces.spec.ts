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
import { describe, expect, it } from 'esmocha';

import { lookupGeneratorsNamespaces } from './lookup-namespaces.ts';

describe('lookupGeneratorsNamespaces', () => {
  it('should return the correct generator namespaces', () => {
    expect(lookupGeneratorsNamespaces()).toMatchInlineSnapshot(`
[
  "angular",
  "angular:bootstrap",
  "app",
  "app:bootstrap",
  "base",
  "base-application",
  "base-application:bootstrap",
  "base-core",
  "base-entity-changes",
  "base-simple-application",
  "base-simple-application:bootstrap",
  "base-workspaces",
  "base-workspaces:bootstrap",
  "bootstrap",
  "bootstrap-application",
  "bootstrap-application-base",
  "bootstrap-application-client",
  "bootstrap-application-server",
  "bootstrap-workspaces",
  "ci-cd",
  "ci-cd:bootstrap",
  "client",
  "client:bootstrap",
  "client:common",
  "client:i18n",
  "common",
  "common:bootstrap",
  "cypress",
  "docker",
  "docker-compose",
  "docker:bootstrap",
  "entities",
  "entity",
  "export-jdl",
  "gatling",
  "generate-blueprint",
  "git",
  "gradle",
  "gradle:code-quality",
  "gradle:jib",
  "gradle:node-gradle",
  "heroku",
  "info",
  "init",
  "java",
  "java-simple-application",
  "java-simple-application:bootstrap",
  "java-simple-application:build-tool",
  "java-simple-application:code-quality",
  "java-simple-application:graalvm",
  "java-simple-application:jib",
  "java-simple-application:openapi-generator",
  "java:bootstrap",
  "java:domain",
  "java:i18n",
  "java:node",
  "java:server",
  "javascript-simple-application",
  "javascript-simple-application:bootstrap",
  "javascript-simple-application:eslint",
  "javascript-simple-application:husky",
  "javascript-simple-application:prettier",
  "jdl",
  "jdl:bootstrap",
  "kubernetes",
  "kubernetes-helm",
  "kubernetes-knative",
  "kubernetes:bootstrap",
  "languages",
  "languages:bootstrap",
  "liquibase",
  "maven",
  "project-name",
  "project-name:bootstrap",
  "react",
  "react:bootstrap",
  "server",
  "server:bootstrap",
  "spring-boot",
  "spring-boot:bootstrap",
  "spring-boot:cucumber",
  "spring-boot:feign-client",
  "spring-boot:jwt",
  "spring-boot:oauth2",
  "spring-boot:websocket",
  "spring-cache",
  "spring-cloud-stream",
  "spring-cloud-stream:kafka",
  "spring-cloud-stream:pulsar",
  "spring-cloud:gateway",
  "spring-data",
  "spring-data:cassandra",
  "spring-data:couchbase",
  "spring-data:elasticsearch",
  "spring-data:mongodb",
  "spring-data:neo4j",
  "spring-data:relational",
  "upgrade",
  "vue",
  "vue:bootstrap",
  "workspaces",
]
`);
  });
});
