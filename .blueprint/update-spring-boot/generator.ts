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
import BaseApplicationGenerator from '../../generators/base-core/index.ts';
import { parseMavenPom } from '../../generators/maven/support/dependabot-maven.ts';
import { getPackageRoot } from '../../lib/index.ts';

export default class UpdateSpringBootGenerator extends BaseApplicationGenerator {
  springBootJson!: {
    versions: Record<string, string>;
    properties: Record<string, string>;
    modules: Record<string, string>;
  };

  async beforeQueue() {
    await this.composeWithJHipster('bootstrap');
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.asAnyTaskGroup({
      parsePom() {
        this.destinationRoot(getPackageRoot());
        const springDependenciesPom = this.readTemplate(
          this.fetchFromInstalledJHipster('spring-boot/resources/spring-boot-dependencies.pom'),
        ) as string;
        const pom = parseMavenPom(springDependenciesPom);
        this.springBootJson = {
          versions: {
            [pom.project.artifactId]: pom.project.version,
            ...Object.fromEntries(
              Object.entries(pom.project.properties!)
                .filter(([property]) => property.endsWith('.version'))
                .map(([property, value]) => [property.slice(0, -8), value]),
            ),
          },
          properties: pom.project.properties ?? {},
          modules: Object.fromEntries(
            pom.project.dependencyManagement?.dependencies.dependency
              .filter(dep => dep.groupId === 'org.springframework.boot')
              .map(dep => [dep.artifactId, '']) ?? [],
          ),
        };
      },
    });
  }

  get [BaseApplicationGenerator.WRITING]() {
    return this.asAnyTaskGroup({
      async writing() {
        this.writeDestinationJSON('generators/spring-boot/resources/spring-boot-dependencies.json', this.springBootJson);
      },
    });
  }
}
