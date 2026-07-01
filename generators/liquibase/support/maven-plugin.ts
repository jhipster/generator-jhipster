/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
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

export default function mavenPluginContent({
  backendTypeSpringBoot,
  hibernateNamingPhysicalStrategy,
  hibernateNamingImplicitStrategy,
  packageName,
  srcMainResources,
  authenticationTypeOauth2,
  devDatabaseTypeH2Any,
  driver,
  url,
  username,
  password,
  hibernateDialect,
  defaultSchemaName = '',
}: {
  backendTypeSpringBoot: boolean;
  hibernateNamingPhysicalStrategy?: string;
  hibernateNamingImplicitStrategy?: string;
  packageName: string;
  srcMainResources: string;
  authenticationTypeOauth2: boolean;
  devDatabaseTypeH2Any: boolean;
  driver: string;
  url: string;
  username: string;
  password: string;
  hibernateDialect: string;
  defaultSchemaName?: string;
}): string {
  // prettier-ignore
  return `
    <configuration>
      <changeLogFile>config/liquibase/master.xml</changeLogFile>
      <diffChangeLogFile>\${project.basedir}/${srcMainResources}config/liquibase/changelog/\${maven.build.timestamp}_changelog.xml</diffChangeLogFile>
      <driver>${driver}</driver>
      <url>${url}</url>
      <defaultSchemaName>${defaultSchemaName}</defaultSchemaName>
      <username>${username}</username>
      <password>${password}</password>${!hibernateNamingPhysicalStrategy || !hibernateNamingImplicitStrategy ? '' : `
      <referenceUrl>hibernate:spring:${packageName}.domain?dialect=${hibernateDialect}&amp;hibernate.physical_naming_strategy=${hibernateNamingPhysicalStrategy}&amp;hibernate.implicit_naming_strategy=${hibernateNamingImplicitStrategy}</referenceUrl>`}
      <verbose>true</verbose>
      <contexts>!test</contexts>${authenticationTypeOauth2 ? `
      <diffExcludeObjects>oauth_access_token, oauth_approvals, oauth_client_details, oauth_client_token, oauth_code, oauth_refresh_token</diffExcludeObjects>`: ''}
    </configuration>
    <dependencies>
      <dependency>
        <groupId>org.liquibase</groupId>
        <artifactId>liquibase-core</artifactId>
        <version>\${liquibase.version}</version>
      </dependency>
      <dependency>
        <groupId>org.liquibase.ext</groupId>
        <artifactId>liquibase-hibernate6</artifactId>
        <version>\${liquibase.version}</version>
      </dependency>
      <dependency>
        <groupId>jakarta.persistence</groupId>
        <artifactId>jakarta.persistence-api</artifactId>
        <version>\${jakarta-persistence.version}</version>
      </dependency>
      <dependency>
        <groupId>jakarta.validation</groupId>
        <artifactId>jakarta.validation-api</artifactId>
        <version>\${jakarta-validation.version}</version>
      </dependency>
      <dependency>
        <groupId>org.jboss.logging</groupId>
        <artifactId>jboss-logging</artifactId>
        <version>\${jboss-logging.version}</version>
      </dependency>${backendTypeSpringBoot ? `
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
        <version>\${spring-boot.version}</version>
      </dependency>` : ''}${devDatabaseTypeH2Any? `
      <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <version>\${h2.version}</version>
      </dependency>`: ''}
    </dependencies>`;
}
