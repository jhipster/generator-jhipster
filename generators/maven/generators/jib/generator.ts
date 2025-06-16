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
import { JavaApplicationGenerator } from '../../../java/generator.ts';
import type { Application as DockerApplication } from '../../../docker/index.ts';
import type { Application as SpringCacheApplication } from '../../../spring-cache/index.ts';

export default class JibGenerator extends JavaApplicationGenerator {
  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints();
    }

    if (!this.delegateToBlueprint) {
      await this.dependsOnBootstrapApplication();
      await this.dependsOnJHipster('maven');
    }
  }

  get postWriting() {
    return this.asPostWritingTaskGroup({
      addJibPlugin({ application, source }) {
        const { baseName, serverPort, javaDependencies } = application;
        const { dockerContainers, dockerServicesDir } = application as DockerApplication;
        const { cacheProviderHazelcast, cacheProviderInfinispan } = application as SpringCacheApplication;
        source.addMavenDefinition?.({
          properties: [
            { property: 'jib-maven-plugin.version', value: javaDependencies!['jib-maven-plugin'] },
            { property: 'jib-maven-plugin.image', value: dockerContainers!.javaJre },
            { property: 'jib-maven-plugin.architecture', value: 'amd64' },
          ],
          plugins: [{ groupId: 'com.google.cloud.tools', artifactId: 'jib-maven-plugin' }],
          pluginManagement: [
            {
              groupId: 'com.google.cloud.tools',
              artifactId: 'jib-maven-plugin',
              // eslint-disable-next-line no-template-curly-in-string
              version: '${jib-maven-plugin.version}',
              additionalContent: `<configuration>
    <from>
        <image>\${jib-maven-plugin.image}</image>
        <platforms>
            <platform>
                <architecture>\${jib-maven-plugin.architecture}</architecture>
                <os>linux</os>
            </platform>
        </platforms>
    </from>
    <to>
        <image>${baseName.toLowerCase()}:latest</image>
    </to>
    <container>
        <entrypoint>
            <shell>bash</shell>
            <option>-c</option>
            <arg>/entrypoint.sh</arg>
        </entrypoint>
        <ports>
            <port>${serverPort}</port>${
              cacheProviderHazelcast
                ? `
            <port>5701/udp</port>
`
                : ''
            }
        </ports>
        <environment>${
          cacheProviderInfinispan
            ? `
            <JAVA_OPTS>-Djgroups.tcp.address=NON_LOOPBACK -Djava.net.preferIPv4Stack=true</JAVA_OPTS>
`
            : ''
        }
            <SPRING_OUTPUT_ANSI_ENABLED>ALWAYS</SPRING_OUTPUT_ANSI_ENABLED>
            <JHIPSTER_SLEEP>0</JHIPSTER_SLEEP>
        </environment>
        <creationTime>USE_CURRENT_TIMESTAMP</creationTime>
        <user>1000</user>
    </container>
    <extraDirectories>
        <paths>${dockerServicesDir}jib</paths>
        <permissions>
            <permission>
                <file>/entrypoint.sh</file>
                <mode>755</mode>
            </permission>
        </permissions>
    </extraDirectories>${
      application.backendTypeSpringBoot
        ? `
    <pluginExtensions>
        <pluginExtension>
            <implementation>com.google.cloud.tools.jib.maven.extension.springboot.JibSpringBootExtension</implementation>
        </pluginExtension>
    </pluginExtensions>
`
        : ''
    }
</configuration>${
                application.backendTypeSpringBoot
                  ? `
<dependencies>
    <dependency>
        <groupId>com.google.cloud.tools</groupId>
        <artifactId>jib-spring-boot-extension-maven</artifactId>
        <version>${application.javaDependencies!['jib-spring-boot-extension-maven']}</version>
    </dependency>
</dependencies>
`
                  : ''
              }
`,
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
