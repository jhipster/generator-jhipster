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
import chalk from 'chalk';
import type { ExecaError } from 'execa';

import { isWin32 } from '../../../base-core/support/os.ts';
import { JavaApplicationGenerator } from '../../generator.ts';
import { GRADLE_BUILD_SRC_MAIN_DIR } from '../../../generator-constants.ts';

// TODO adjust type
export default class NodeGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrap('java');
      await this.dependsOnJHipster('jhipster:java-simple-application:build-tool');
    }
  }

  get preparing() {
    return this.asPreparingTaskGroup({
      async javaNodeBuildPaths({ application }) {
        const { buildToolMaven, srcMainWebapp, javaNodeBuildPaths, clientDistDir } = application;

        javaNodeBuildPaths.push(srcMainWebapp, 'package-lock.json', 'package.json');
        if (buildToolMaven) {
          // Gradle throws an error if the directory does not exist
          javaNodeBuildPaths.push(clientDistDir!);
        }
      },
    });
  }

  get [JavaApplicationGenerator.PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.preparing);
  }

  get postPreparing() {
    return this.asPostPreparingTaskGroup({
      sortBuildFiles({ application }) {
        const { javaNodeBuildPaths } = application;
        if (javaNodeBuildPaths) {
          const files = [...new Set(javaNodeBuildPaths)];
          javaNodeBuildPaths.splice(0, javaNodeBuildPaths.length, ...files.sort());
        }
      },
      useNpmWrapper({ application }) {
        if (application.useNpmWrapper) {
          this.useNpmWrapperInstallTask();
        }
      },
    });
  }

  get [JavaApplicationGenerator.POST_PREPARING]() {
    return this.delegateTasksToBlueprint(() => this.postPreparing);
  }

  get writing() {
    return this.asWritingTaskGroup({
      async writing({ application }) {
        await this.writeFiles({
          blocks: [
            {
              condition: (ctx: any) => ctx.useNpmWrapper,
              templates: ['npmw', 'npmw.cmd'],
            },
            {
              condition: () => application.buildToolGradle,
              templates: [`${GRADLE_BUILD_SRC_MAIN_DIR}/jhipster.node-gradle-conventions.gradle`],
            },
          ],
          context: application,
        });
      },
    });
  }

  get [JavaApplicationGenerator.WRITING]() {
    return this.delegateTasksToBlueprint(() => this.writing);
  }

  useNpmWrapperInstallTask() {
    this.setFeatures({
      customInstallTask: async (preferredPm, defaultInstallTask) => {
        const buildTool = this.jhipsterConfigWithDefaults.buildTool;
        if (
          (preferredPm && preferredPm !== 'npm') ||
          (this.jhipsterConfig as any).skipClient ||
          (buildTool !== 'gradle' && buildTool !== 'maven')
        ) {
          await defaultInstallTask();
          return;
        }

        const npmCommand = isWin32 ? 'npmw' : './npmw';
        try {
          await this.spawn(npmCommand, ['install'], { preferLocal: true, stdio: 'inherit' });
        } catch (error: unknown) {
          this.log.error(
            chalk.red(`Error executing '${npmCommand} install', please execute it yourself. (${(error as ExecaError).shortMessage})`),
          );
        }
      },
    });
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      nodeGradlePlugin({ application, source }) {
        if (!application.buildToolGradle) return;
        source.addGradlePlugin!({ id: 'jhipster.node-gradle-conventions' });
        source.addGradleBuildSrcDependencyCatalogLibraries!([
          {
            libraryName: 'node-gradle',
            module: 'com.github.node-gradle:gradle-node-plugin',
            version: application.javaDependencies!['node-gradle'],
            scope: 'implementation',
          },
        ]);

        source.addGradleProperty!({ property: 'nodeInstall', comment: 'Install and use a local version of node and npm.' });
      },
      frontendMavenPlugin({ application, source }) {
        if (!application.buildToolMaven) return;
        const { javaDependencies, nodeDependencies, nodeVersion } = application;

        source.addMavenDefinition!({
          properties: [
            { property: 'node.version', value: `v${nodeVersion}` },
            { property: 'npm.version', value: nodeDependencies.npm },
            {
              property: 'frontend-maven-plugin.version',
              value: javaDependencies!['frontend-maven-plugin'],
            },
            {
              property: 'checksum-maven-plugin.version',
              value: javaDependencies!['checksum-maven-plugin'],
            },
            {
              property: 'maven-antrun-plugin.version',
              value: javaDependencies!['maven-antrun-plugin'],
            },
          ],
          pluginManagement: [
            {
              groupId: 'com.github.eirslett',
              artifactId: 'frontend-maven-plugin',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${frontend-maven-plugin.version}',
              additionalContent: `<configuration>
    <installDirectory>target</installDirectory>
    <nodeVersion>\${node.version}</nodeVersion>
    <npmVersion>\${npm.version}</npmVersion>
</configuration>`,
            },
            {
              groupId: 'net.nicoulaj.maven.plugins',
              artifactId: 'checksum-maven-plugin',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${checksum-maven-plugin.version}',
            },
            {
              groupId: 'org.apache.maven.plugins',
              artifactId: 'maven-antrun-plugin',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${maven-antrun-plugin.version}',
            },
          ],
          plugins: [
            {
              inProfile: 'webapp',
              groupId: 'net.nicoulaj.maven.plugins',
              artifactId: 'checksum-maven-plugin',
              additionalContent: `
                  <executions>
                      <execution>
                          <id>create-pre-compiled-webapp-checksum</id>
                          <goals>
                              <goal>files</goal>
                          </goals>
                          <phase>generate-resources</phase>
                      </execution>
                      <execution>
                          <id>create-compiled-webapp-checksum</id>
                          <goals>
                              <goal>files</goal>
                          </goals>
                          <phase>compile</phase>
                          <configuration>
                              <csvSummaryFile>checksums.csv.old</csvSummaryFile>
                          </configuration>
                      </execution>
                  </executions>
                  <configuration>
                      <fileSets>
                          <fileSet>
                              <directory>\${project.basedir}</directory>
                              <includes>${application.javaNodeBuildPaths
                                ?.map(
                                  file => `
                                  <include>${file.endsWith('/') ? `${file}**/*.*` : file}</include>`,
                                )
                                .join('')}
                              </includes>
                              <excludes>
                                  <exclude>**/app/**/service-worker.js</exclude>
                                  <exclude>**/app/**/vendor.css</exclude>
                              </excludes>
                          </fileSet>
                      </fileSets>
                      <failOnError>false</failOnError>
                      <failIfNoFiles>false</failIfNoFiles>
                      <individualFiles>false</individualFiles>
                      <algorithms>
                          <algorithm>SHA-1</algorithm>
                      </algorithms>
                      <includeRelativePath>true</includeRelativePath>
                      <quiet>true</quiet>
                  </configuration>`,
            },
            {
              inProfile: 'webapp',
              groupId: 'org.apache.maven.plugins',
              artifactId: 'maven-antrun-plugin',
              additionalContent: `
                  <executions>
                      <execution>
                          <id>eval-frontend-checksum</id>
                          <phase>generate-resources</phase>
                          <goals>
                              <goal>run</goal>
                          </goals>
                          <configuration>
                              <target>
                                  <condition property="skip.npm" value="true" else="false" >
                                      <and>
                                          <available file="checksums.csv" filepath="\${project.build.directory}" />
                                          <available file="checksums.csv.old" filepath="\${project.build.directory}" />
                                          <filesmatch file1="\${project.build.directory}/checksums.csv" file2="\${project.build.directory}/checksums.csv.old" />
                                      </and>
                                  </condition>
                              </target>
                              <exportAntProperties>true</exportAntProperties>
                          </configuration>
                      </execution>
                  </executions>
`,
            },
            {
              inProfile: 'webapp',
              groupId: 'com.github.eirslett',
              artifactId: 'frontend-maven-plugin',
              additionalContent: `
                  <executions>
                      <execution>
                          <id>install-node-and-npm</id>
                          <goals>
                              <goal>install-node-and-npm</goal>
                          </goals>
                      </execution>
                      <execution>
                          <id>npm install</id>
                          <goals>
                              <goal>npm</goal>
                          </goals>
                      </execution>
                      <execution>
                          <id>webapp build dev</id>
                          <goals>
                              <goal>npm</goal>
                          </goals>
                          <phase>generate-resources</phase>
                          <configuration>
                              <arguments>run webapp:build</arguments>
                              <environmentVariables>
                                  <APP_VERSION>\${project.version}</APP_VERSION>
                              </environmentVariables>
                              <npmInheritsProxyConfigFromMaven>false</npmInheritsProxyConfigFromMaven>
                          </configuration>
                      </execution>
                  </executions>`,
            },
            {
              inProfile: 'prod',
              groupId: 'com.github.eirslett',
              artifactId: 'frontend-maven-plugin',
              additionalContent: `
                  <executions>
                      <execution>
                          <id>install-node-and-npm</id>
                          <goals>
                              <goal>install-node-and-npm</goal>
                          </goals>
                      </execution>
                      <execution>
                          <id>npm install</id>
                          <goals>
                              <goal>npm</goal>
                          </goals>
                      </execution>
                      <execution>
                          <id>webapp build test</id>
                          <goals>
                              <goal>npm</goal>
                          </goals>
                          <phase>test</phase>
                          <configuration>
                              <arguments>run webapp:test</arguments>
                              <npmInheritsProxyConfigFromMaven>false</npmInheritsProxyConfigFromMaven>
                          </configuration>
                      </execution>
                      <execution>
                          <id>webapp build prod</id>
                          <goals>
                              <goal>npm</goal>
                          </goals>
                          <phase>generate-resources</phase>
                          <configuration>
                              <arguments>run webapp:prod</arguments>
                              <environmentVariables>
                                  <APP_VERSION>\${project.version}</APP_VERSION>
                              </environmentVariables>
                              <npmInheritsProxyConfigFromMaven>false</npmInheritsProxyConfigFromMaven>
                          </configuration>
                      </execution>
                  </executions>`,
            },
          ],
        });
      },
    });
  }

  get [JavaApplicationGenerator.POST_WRITING]() {
    return this.delegateTasksToBlueprint(() => this.postWriting);
  }
}
