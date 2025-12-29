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
import { parseMavenPom } from '../../generators/java-simple-application/generators/maven/support/dependabot-maven.ts';
import { getPackageRoot } from '../../lib/index.ts';

export default class UpdateSpringBootGenerator extends BaseApplicationGenerator {
  version!: string;
  repository = 'https://repo1.maven.org/maven2/';
  springBootDependenciesFile!: string;
  pomContent!: string;
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
      springBootDependenciesFile() {
        const suffix = this.version.startsWith('4') ? `-${this.version}` : '';
        this.springBootDependenciesFile = this.fetchFromInstalledJHipster(`spring-boot/resources/spring-boot-dependencies${suffix}`);
      },
      async download() {
        const response = await fetch(
          `${this.repository}org/springframework/boot/spring-boot-dependencies/${this.version}/spring-boot-dependencies-${this.version}.pom`,
        );

        if (!response.ok) throw new Error(`Unexpected response ${response.statusText}`);

        this.pomContent = await response.text();
      },
      parsePom() {
        this.destinationRoot(getPackageRoot());
        const pom = parseMavenPom(this.pomContent);
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
        this.writeDestination(`${this.springBootDependenciesFile}.pom`, this.pomContent);
        this.writeDestinationJSON(`${this.springBootDependenciesFile}.json`, this.springBootJson);
      },
    });
  }
}
