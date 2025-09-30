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
import { mutateData } from '../../../lib/utils/object.ts';
import type BaseCoreGenerator from '../../base-core/generator.ts';
import { getDockerfileContainers } from '../../docker/utils.ts';

const ELASTICSEARCH_IMAGE = 'docker.elastic.co/elasticsearch/elasticsearch';

export function loadDockerDependenciesTask<const G extends BaseCoreGenerator>(
  this: G,
  { context }: { context: { dockerContainers?: Record<string, string> } },
) {
  context.dockerContainers ??= {};
  const dockerfile = this.readTemplate(this.fetchFromInstalledJHipster('server/resources/Dockerfile')) as string;
  const springDependenciesPom = this.readTemplate(
    this.fetchFromInstalledJHipster('spring-boot/resources/spring-boot-dependencies.pom'),
  ) as string;
  const result = springDependenciesPom.match(/elasticsearch-client.version>(?<version>.+)<\/elasticsearch-client.version>/);
  const elasticsearchClientVersion = result!.groups!.version;
  mutateData(
    context.dockerContainers,
    this.prepareDependencies(
      {
        elasticsearchTag: elasticsearchClientVersion,
        elasticsearchImage: ELASTICSEARCH_IMAGE,
        elasticsearch: `${ELASTICSEARCH_IMAGE}:${elasticsearchClientVersion}`,
        ...getDockerfileContainers(dockerfile),
      },
      'docker',
    ),
  );
}
