/* eslint-disable no-template-curly-in-string */
import type { MavenDefinition } from '../../maven/types.ts';

export const mavenDefinition = ({
  graalvmReachabilityMetadata,
  reactive,
  nativeBuildToolsVersion,
  databaseTypeSql,
  userLanguage,
  languages,
}: {
  graalvmReachabilityMetadata: string;
  reactive?: boolean;
  nativeBuildToolsVersion?: string;
  databaseTypeSql?: boolean;
  userLanguage: string;
  languages: string[];
}): MavenDefinition => ({
  properties: [
    { property: 'repackage.classifier' },
    { property: 'native-image-name', value: 'native-executable' },
    { property: 'native-buildtools.version', value: nativeBuildToolsVersion },
  ],
  pluginManagement: [
    {
      groupId: 'org.graalvm.buildtools',
      artifactId: 'native-maven-plugin',
      version: '${native-buildtools.version}',
      additionalContent: `
        <configuration>
            <fallback>false</fallback>
            <classesDirectory>\${project.build.outputDirectory}</classesDirectory>
            <metadataRepository>
                <enabled>true</enabled>
                <version>${graalvmReachabilityMetadata}</version>
            </metadataRepository>
            <imageName>\${native-image-name}</imageName>
            <verbose>true</verbose>
            <buildArgs>
                <buildArg>-Duser.language=${userLanguage}</buildArg>
                <buildArg>-H:IncludeLocales=${languages.join(',')}</buildArg>
            </buildArgs>
            <jvmArgs>
                <arg>-Xms4g</arg>
                <arg>-Xmx10g</arg>
            </jvmArgs>
        </configuration>`,
    },
    ...(reactive || !databaseTypeSql
      ? []
      : [
          {
            groupId: 'org.hibernate.orm.tooling',
            artifactId: 'hibernate-enhance-maven-plugin',
            version: '${hibernate.version}',
            additionalContent: `
                <configuration>
                    <enableLazyInitialization>true</enableLazyInitialization>
                </configuration>`,
          },
        ]),
  ],
  profiles: [
    {
      id: 'native',
      content: `
        <properties>
            <repackage.classifier>exec</repackage.classifier>
            <modernizer.skip>true</modernizer.skip>
            <spring.h2.console.enabled>false</spring.h2.console.enabled>
        </properties>
        <build>
            <plugins>${
              databaseTypeSql && !reactive
                ? `
                <plugin>
                    <groupId>org.hibernate.orm.tooling</groupId>
                    <artifactId>hibernate-enhance-maven-plugin</artifactId>
                    <executions>
                        <execution>
                            <goals>
                                <goal>enhance</goal>
                            </goals>
                        </execution>
                    </executions>
                </plugin>`
                : ``
            }
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-jar-plugin</artifactId>
                    <configuration>
                        <archive>
                            <manifestEntries>
                                <Spring-Boot-Native-Processed>true</Spring-Boot-Native-Processed>
                            </manifestEntries>
                        </archive>
                    </configuration>
                </plugin>
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                    <configuration>
                        <image>
                            <builder>paketobuildpacks/builder:tiny</builder>
                            <env>
                                <BP_NATIVE_IMAGE>true</BP_NATIVE_IMAGE>
                            </env>
                        </image>
                    </configuration>
                    <executions>
                        <execution>
                            <id>process-aot</id>
                            <goals>
                                <goal>process-aot</goal>
                            </goals>
                        </execution>
                    </executions>
                </plugin>
                <plugin>
                    <groupId>org.graalvm.buildtools</groupId>
                    <artifactId>native-maven-plugin</artifactId>
                    <executions>
                        <execution>
                            <id>add-reachability-metadata</id>
                            <goals>
                                <goal>add-reachability-metadata</goal>
                            </goals>
                        </execution>
                        <execution>
                            <id>build-native</id>
                            <goals>
                                <goal>compile-no-fork</goal>
                            </goals>
                            <phase>package</phase>
                        </execution>
                        <execution>
                            <id>test-native</id>
                            <goals>
                                <goal>test</goal>
                            </goals>
                            <phase>test</phase>
                        </execution>
                    </executions>
                </plugin>
            </plugins>
        </build>`,
    },
  ],
});
