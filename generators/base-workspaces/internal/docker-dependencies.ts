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
import type BaseCoreGenerator from '../../base-core/generator.ts';
import { dockerContainers as elasticDockerContainer } from '../../generator-constants.js';
import { getDockerfileContainers } from '../../docker/utils.js';

export async function loadDockerDependenciesTask<const G extends BaseCoreGenerator>(this: G, { context = this }: { context?: any } = {}) {
  const dockerfile = this.readTemplate(this.jhipsterTemplatePath('../../server/resources/Dockerfile')) as string;
  context.dockerContainers = this.prepareDependencies(
    {
      ...elasticDockerContainer,
      ...getDockerfileContainers(dockerfile),
    },
    'docker',
  );
}
