// eslint-disable-next-line import/prefer-default-export
export const mavenProfileContent = data => {
  let dialect;
  if (data.prodDatabaseTypeMysql) {
    dialect = 'org.hibernate.dialect.MySQL8Dialect';
  } else if (data.prodDatabaseTypeMariadb) {
    dialect = 'org.hibernate.dialect.MariaDB103Dialect';
  } else if (data.prodDatabaseTypePostgres) {
    dialect = 'org.hibernate.dialect.PostgreSQLDialect';
  } else if (data.prodDatabaseTypeH2Disk) {
    dialect = 'org.hibernate.dialect.H2Dialect';
  } else if (data.prodDatabaseTypeOracle) {
    dialect = 'org.hibernate.dialect.Oracle12cDialect';
  } else if (data.prodDatabaseTypeMssql) {
    dialect = 'org.hibernate.dialect.SQLServer2012Dialect';
  }
  return `
            <!-- force dependency version as used bonsai add-on as of now only supports 7.10.x -->
            <!-- https://github.com/jhipster/generator-jhipster/issues/18650 -->
            <properties>
                <bonsai.elasticsearch.version>7.10.2</bonsai.elasticsearch.version>
            </properties>
            <dependencyManagement>
                <dependencies>
                    <dependency>
                        <groupId>org.elasticsearch.client</groupId>
                        <artifactId>elasticsearch-rest-client</artifactId>
                        <version>\${bonsai.elasticsearch.version}</version>
                    </dependency>
                    <dependency>
                        <groupId>org.elasticsearch.client</groupId>
                        <artifactId>elasticsearch-rest-high-level-client</artifactId>
                        <version>\${bonsai.elasticsearch.version}</version>
                    </dependency>
                    <dependency>
                        <groupId>org.elasticsearch</groupId>
                        <artifactId>elasticsearch</artifactId>
                        <version>\${bonsai.elasticsearch.version}</version>
                    </dependency>
                    <dependency>
                        <groupId>org.elasticsearch.plugin</groupId>
                        <artifactId>transport-netty4-client</artifactId>
                        <version>\${bonsai.elasticsearch.version}</version>
                    </dependency>
                </dependencies>
            </dependencyManagement>
            <build>
                <plugins>
                    <plugin>
                        <groupId>org.liquibase</groupId>
                        <artifactId>liquibase-maven-plugin</artifactId>
                        <configuration combine.self="override">
                            <changeLogFile>src/main/resources/config/liquibase/master.xml</changeLogFile>
                            <diffChangeLogFile>src/main/resources/config/liquibase/changelog/\${maven.build.timestamp}_changelog.xml</diffChangeLogFile>
                            <driver></driver>
                            <url>\${env.JDBC_DATABASE_URL}</url>
                            <defaultSchemaName></defaultSchemaName>
                            <username>\${env.JDBC_DATABASE_USERNAME}</username>
                            <password>\${env.JDBC_DATABASE_PASSWORD}</password>
                            <referenceUrl>hibernate:spring:${data.packageName}.domain?dialect=${dialect}&amp;hibernate.physical_naming_strategy=org.springframework.boot.orm.jpa.hibernate.SpringPhysicalNamingStrategy&amp;hibernate.implicit_naming_strategy=org.springframework.boot.orm.jpa.hibernate.SpringImplicitNamingStrategy</referenceUrl>
                            <verbose>true</verbose>
                            <logging>debug</logging>
                            <promptOnNonLocalDatabase>false</promptOnNonLocalDatabase>
                        </configuration>
                    </plugin>
                    <plugin>
                        <artifactId>maven-clean-plugin</artifactId>
                        <version>\${maven-clean-plugin.version}</version>
                        <executions>
                            <execution>
                                <id>clean-artifacts</id>
                                <phase>install</phase>
                                <goals>
                                    <goal>clean</goal>
                                </goals>
                                <configuration>
                                    <excludeDefaultDirectories>true</excludeDefaultDirectories>
                                    <filesets>
                                        <fileset>
                                            <directory>target</directory>
                                            <excludes>
                                                <exclude>*.jar</exclude>
                                            </excludes>
                                            <followSymlinks>false</followSymlinks>
                                        </fileset>
                                        <fileset>
                                            <directory>node_modules</directory>
                                            <followSymlinks>false</followSymlinks>
                                        </fileset>
                                    </filesets>
                                </configuration>
                            </execution>
                        </executions>
                    </plugin>
                </plugins>
            </build>
`;
};
