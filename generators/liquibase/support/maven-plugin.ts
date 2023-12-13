export default function mavenPluginContent({
  backendTypeSpringBoot,
  reactive,
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
      <password>${password}</password>${reactive || !backendTypeSpringBoot ? '' : `
      <referenceUrl>hibernate:spring:${packageName}.domain?dialect=${hibernateDialect}&amp;hibernate.physical_naming_strategy=org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy&amp;hibernate.implicit_naming_strategy=org.springframework.boot.orm.jpa.hibernate.SpringImplicitNamingStrategy</referenceUrl>`}
      <verbose>true</verbose>
      <logging>debug</logging>
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
      </dependency>${backendTypeSpringBoot ? `
      <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
        <version>\${spring-boot.version}</version>
      </dependency>
      <dependency>
        <groupId>jakarta.validation</groupId>
        <artifactId>jakarta.validation-api</artifactId>
        <version>\${validation-api.version}</version>
      </dependency>` : ''}${devDatabaseTypeH2Any? `
      <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
        <version>\${h2.version}</version>
      </dependency>`: ''}
    </dependencies>`;
}
