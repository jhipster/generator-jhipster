export const mavenPluginConfiguration = data => `
                <configuration>
                    <deploy.projectId><%= gcpProjectId %></deploy.projectId>
                    <deploy.version>1</deploy.version>
                </configuration>
`;

export const mavenProdProfileContent = data => `                        <properties>
          <spring.profiles.active>prod\${profile.api-docs}${
            // eslint-disable-next-line no-template-curly-in-string
            this.databaseTypeSql ? '${profile.no-liquibase},prod-gae' : ''
          }</spring.profiles.active>
      </properties>
`;

export const mavenProfileContent = data => `                        <dependencies>
          <dependency>
              <groupId>org.springframework.boot</groupId>
              <artifactId>spring-boot-starter-undertow</artifactId>
          </dependency>
      </dependencies>
      <build>
          <plugins>
              <plugin>
                  <groupId>org.springframework.boot</groupId>
                  <artifactId>spring-boot-maven-plugin</artifactId>
                  <dependencies>
                      <!-- package as a thin jar -->
                      <dependency>
                          <groupId>org.springframework.boot.experimental</groupId>
                          <artifactId>spring-boot-thin-layout</artifactId>
                          <version>1.0.23.RELEASE</version>
                      </dependency>
                  </dependencies>
              </plugin>
              <plugin>
                  <groupId>org.springframework.boot.experimental</groupId>
                  <artifactId>spring-boot-thin-maven-plugin</artifactId>
                  <version>1.0.23.RELEASE</version>
                  <configuration>
                      <outputDirectory>\${project.build.directory}/appengine-staging</outputDirectory>
                  </configuration>
                  <executions>
                      <execution>
                          <id>resolve</id>
                          <goals>
                              <goal>resolve</goal>
                          </goals>
                          <inherited>false</inherited>
                      </execution>
                  </executions>
              </plugin>
          </plugins>
      </build>
`;
