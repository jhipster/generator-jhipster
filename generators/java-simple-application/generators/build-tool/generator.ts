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
import { buildToolTypes } from '../../../../lib/jhipster/index.ts';
import { JavaApplicationGenerator } from '../../../java/generator.ts';
import { javaScopeToGradleScope } from '../../../java/support/index.ts';
import type { ConditionalJavaDefinition, JavaDependency, JavaNeedleOptions } from '../../../java/types.ts';
import type { MavenDependency } from '../maven/types.ts';

const { GRADLE, MAVEN } = buildToolTypes;

export default class BuildToolGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('java');
    }
  }

  get composing() {
    return this.asComposingTaskGroup({
      async composing() {
        const { buildTool } = this.jhipsterConfigWithDefaults;

        if (buildTool === GRADLE) {
          await this.composeWithJHipster('jhipster:java-simple-application:gradle');
        } else if (buildTool === MAVEN) {
          await this.composeWithJHipster('jhipster:java-simple-application:maven');
        } else {
          throw new Error(`Build tool ${buildTool} is not supported`);
        }
      },
    });
  }

  get [JavaApplicationGenerator.COMPOSING]() {
    return this.delegateTasksToBlueprint(() => this.composing);
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      prepareJavaApplication({ application, source }) {
        source.addJavaProperty = ({ property, value }) => {
          if (application.buildToolGradle) {
            source.addGradleProperty?.({ property, value });
          } else if (application.buildToolMaven) {
            source.addMavenProperty?.({ property, value });
          }
        };
        source.addJavaDependencies = (dependencies, options) => {
          if (application.buildToolMaven) {
            const convertVersionToMavenDependency = ({ versionRef, version, exclusions, ...artifact }: JavaDependency): MavenDependency => {
              // If a version is provided, convert to version ref using artifactId
              versionRef ??= version ? artifact.artifactId : undefined;
              version = versionRef ? `\${${versionRef}.version}` : undefined;
              const additionalContent = exclusions?.length
                ? `<exclusions>${exclusions
                    .map(
                      e => `
                <exclusion>
                    <groupId>${e.groupId}</groupId>
                    <artifactId>${e.artifactId}</artifactId>
                </exclusion>`,
                    )
                    .join('')}
                </exclusions>`
                : '';
              return additionalContent ? { ...artifact, version, additionalContent } : { ...artifact, version };
            };
            const removeScope = ({ scope: _scope, ...artifact }: JavaDependency) => artifact;

            const properties = dependencies
              .filter(dep => dep.version)
              .map(({ artifactId, version }) => ({ property: `${artifactId}.version`, value: version }));
            const annotationProcessors = dependencies
              .filter(dep => dep.scope === 'annotationProcessor')
              .map(removeScope)
              .map(convertVersionToMavenDependency);
            const dependencyManagement = dependencies.filter(dep => dep.scope === 'import').map(convertVersionToMavenDependency);
            const commonDependencies = dependencies
              .filter(dep => !['annotationProcessor', 'import'].includes(dep.scope!))
              .map(convertVersionToMavenDependency);

            source.addMavenDefinition?.({
              properties,
              dependencies: [
                ...commonDependencies,
                // Add a provided scope for annotation processors so that version is not required in annotationProcessor dependencies
                ...annotationProcessors.filter(dep => !dep.version).map(artifact => ({ ...artifact, scope: 'provided' as const })),
              ],
              dependencyManagement,
              annotationProcessors,
            });
          }

          if (application.buildToolGradle) {
            const gradleDependencies = dependencies.map(({ exclusions, ...dep }) => ({
              ...dep,
              closure: exclusions?.map(({ groupId, artifactId }) => `    exclude group: '${groupId}', module: '${artifactId}'`),
            }));
            source.addGradleDependencies?.(
              gradleDependencies
                .filter(dep => !dep.version && !dep.versionRef)
                .map(({ scope, type, ...artifact }) => ({
                  ...artifact,
                  scope: javaScopeToGradleScope({ scope, type }),
                })),
              options,
            );
            source.addGradleDependencyCatalogLibraries?.(
              gradleDependencies
                .filter(dep => dep.version || dep.versionRef)
                .map(({ scope, type, groupId, artifactId, version, versionRef, closure }) => {
                  const library = {
                    libraryName: artifactId,
                    module: `${groupId}:${artifactId}`,
                    scope: javaScopeToGradleScope({ scope, type }),
                    closure,
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
      executable({ application }) {
        application.buildToolExecutable = application.buildToolGradle ? 'gradlew' : 'mvnw';
      },
    });
  }

  get [JavaApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }
}
