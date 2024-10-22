/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { buildToolTypes } from '../../../../lib/jhipster/index.js';
import BaseApplicationGenerator from '../../../base-application/index.js';
import { GENERATOR_GRADLE, GENERATOR_MAVEN } from '../../../generator-list.js';
import type { MavenDependency } from '../../../maven/types.js';
import { javaScopeToGradleScope } from '../../support/index.js';
import type { ConditionalJavaDefinition, JavaDependency, JavaNeedleOptions } from '../../types.js';

const { GRADLE, MAVEN } = buildToolTypes;

export default class BuildToolGenerator extends BaseApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnJHipster('jhipster:java:bootstrap');
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        const { buildTool } = this.jhipsterConfigWithDefaults;

        if (buildTool === GRADLE) {
          await this.composeWithJHipster(GENERATOR_GRADLE);
        } else if (buildTool === MAVEN) {
          await this.composeWithJHipster(GENERATOR_MAVEN);
        } else {
          throw new Error(`Build tool ${buildTool} is not supported`);
        }
      },
    });
  }

  get [BaseApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareJavaApplication({ application, source }) {
        source.addJavaDependencies = (dependencies, options) => {
          if (application.buildToolMaven) {
            const annotationProcessors = dependencies.filter(dep => dep.scope === 'annotationProcessor');
            const importDependencies = dependencies.filter(dep => dep.scope === 'import');
            const commonDependencies = dependencies.filter(dep => !['annotationProcessor', 'import'].includes(dep.scope!));
            const convertVersionToRef = ({ version, versionRef, ...artifact }: JavaDependency): MavenDependency =>
              version || versionRef ? { ...artifact, version: `\${${versionRef ?? artifact.artifactId}.version}` } : artifact;
            const removeScope = ({ scope: _scope, ...artifact }: MavenDependency) => artifact;

            source.addMavenDefinition?.({
              properties: dependencies
                .filter(dep => dep.version)
                .map(({ artifactId, version }) => ({ property: `${artifactId}.version`, value: version })),
              dependencies: [
                ...commonDependencies.map(convertVersionToRef),
                // Add a provided scope for annotation processors so that version is not required in annotationProcessor dependencies
                ...annotationProcessors.filter(dep => !dep.version).map(artifact => ({ ...artifact, scope: 'provided' as const })),
              ],
              dependencyManagement: importDependencies.map(convertVersionToRef),
              annotationProcessors: annotationProcessors.map(convertVersionToRef).map(removeScope),
            });
          }

          if (application.buildToolGradle) {
            source.addGradleDependencies?.(
              dependencies
                .filter(dep => !dep.version && !dep.versionRef)
                .map(({ scope, type, ...artifact }) => ({
                  ...artifact,
                  scope: javaScopeToGradleScope({ scope, type }),
                })),
              options,
            );
            source.addGradleDependencyCatalogLibraries?.(
              dependencies
                .filter(dep => dep.version || dep.versionRef)
                .map(({ scope, type, groupId, artifactId, version, versionRef }) => {
                  const library = {
                    libraryName: artifactId,
                    module: `${groupId}:${artifactId}`,
                    scope: javaScopeToGradleScope({ scope, type }),
                  };
                  return version ? { ...library, version } : { ...library, 'version.ref': versionRef! };
                }),
              options,
            );
          }
        };

        source.addJavaDefinition = (definition, options) => {
          const { dependencies, versions, mavenDefinition } = definition;
          if (dependencies) {
            source.addJavaDependencies!(
              dependencies.filter(dep => {
                if (dep.versionRef) {
                  return versions?.find(({ name }) => name === dep.versionRef)?.version;
                }
                return true;
              }),
              options,
            );
          }
          if (versions) {
            if (application.buildToolMaven) {
              source.addMavenDefinition!({
                properties: versions.filter(v => v.version).map(({ name, version }) => ({ property: `${name}.version`, value: version })),
              });
            }
            if (application.buildToolGradle) {
              source.addGradleDependencyCatalogVersions!(versions, options);
            }
          }
          if (application.buildToolMaven && mavenDefinition) {
            source.addMavenDefinition!(mavenDefinition);
          }
        };

        source.addJavaDefinitions = (
          optionsOrDefinition: JavaNeedleOptions | ConditionalJavaDefinition,
          ...definitions: ConditionalJavaDefinition[]
        ) => {
          let options: JavaNeedleOptions | undefined = undefined;
          if ('gradleFile' in optionsOrDefinition || 'gradleVersionCatalogFile' in optionsOrDefinition) {
            options = optionsOrDefinition;
          } else {
            definitions.unshift(optionsOrDefinition as ConditionalJavaDefinition);
          }
          for (const definition of definitions) {
            if (definition.condition ?? true) {
              source.addJavaDefinition!(definition, options);
            }
          }
        };
      },
    });
  }

  get [BaseApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }
}
