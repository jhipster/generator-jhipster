<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.config;
<%_ if (databaseType === 'sql') { _%>

import io.github.jhipster.config.JHipsterConstants;
import io.github.jhipster.config.liquibase.AsyncSpringLiquibase;

import liquibase.integration.spring.SpringLiquibase;
<%_ } _%>
<%_ if (databaseType === 'mongodb' && authenticationType === 'oauth2') { _%>

import <%=packageName%>.config.oauth2.OAuth2AuthenticationReadConverter;
<%_ } _%>
<%_ if (databaseType === 'mongodb') { _%>

import com.github.mongobee.Mongobee;
import com.mongodb.MongoClient;
import io.github.jhipster.config.JHipsterConstants;
import io.github.jhipster.domain.util.JSR310DateConverters.DateToZonedDateTimeConverter;
import io.github.jhipster.domain.util.JSR310DateConverters.ZonedDateTimeToDateConverter;
<%_ } _%>
<%_ if (devDatabaseType === 'h2Disk' || devDatabaseType === 'h2Memory') { _%>
import org.h2.tools.Server;
<%_ } _%>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (databaseType === 'mongodb') { %>
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoProperties;<% } %><% if (databaseType === 'sql') { %>
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;<% } %>
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;<% if (databaseType === 'mongodb') { %>
import org.springframework.context.annotation.Import;<% } %><% if (databaseType === 'mongodb' || devDatabaseType === 'h2Disk' || devDatabaseType === 'h2Memory') { %>
import org.springframework.context.annotation.Profile;<% } %><% if (databaseType === 'sql') { %>
import org.springframework.core.env.Environment;<% } %><% if (databaseType === 'mongodb') { %>
import org.springframework.core.convert.converter.Converter;<% } %><% if (searchEngine === 'elasticsearch') { %>
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;<% } %><% if (databaseType === 'mongodb') { %>
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.CustomConversions;
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;<% } %>
<%_ if (databaseType === 'sql') { _%>
import org.springframework.core.task.TaskExecutor;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
<%_ if (devDatabaseType === 'h2Disk' || devDatabaseType === 'h2Memory') { _%>
import java.sql.SQLException;
<%_ } } _%>
<%_ if (databaseType === 'mongodb') { _%>

import java.util.ArrayList;
import java.util.List;
<%_ } _%>

@Configuration<% if (databaseType === 'sql') { %>
@EnableJpaRepositories("<%=packageName%>.repository")
@EnableJpaAuditing(auditorAwareRef = "springSecurityAuditorAware")
@EnableTransactionManagement<% } %><% if (searchEngine === 'elasticsearch') { %>
@EnableElasticsearchRepositories("<%=packageName%>.repository.search")<% } %><% if (databaseType === 'mongodb') { %>
@Profile("!" + JHipsterConstants.SPRING_PROFILE_CLOUD)
@EnableMongoRepositories("<%=packageName%>.repository")
@Import(value = MongoAutoConfiguration.class)
@EnableMongoAuditing(auditorAwareRef = "springSecurityAuditorAware")<% } %>
public class DatabaseConfiguration {

    private final Logger log = LoggerFactory.getLogger(DatabaseConfiguration.class);<% if (databaseType === 'sql') { %>

    private final Environment env;

    public DatabaseConfiguration(Environment env) {
        this.env = env;
    }
<%_ if (devDatabaseType === 'h2Disk' || devDatabaseType === 'h2Memory') { _%>

    /**
     * Open the TCP port for the H2 database, so it is available remotely.
     *
     * @return the H2 database TCP server
     * @throws SQLException if the server failed to start
     */
    @Bean(initMethod = "start", destroyMethod = "stop")
    @Profile(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT)
    public Server h2TCPServer() throws SQLException {
        return Server.createTcpServer("-tcp","-tcpAllowOthers");
    }
<%_ } _%>

    @Bean
    public SpringLiquibase liquibase(@Qualifier("taskExecutor") TaskExecutor taskExecutor,
            DataSource dataSource, LiquibaseProperties liquibaseProperties) {

        // Use liquibase.integration.spring.SpringLiquibase if you don't want Liquibase to start asynchronously
        SpringLiquibase liquibase = new AsyncSpringLiquibase(taskExecutor, env);
        liquibase.setDataSource(dataSource);
        liquibase.setChangeLog("classpath:config/liquibase/master.xml");
        liquibase.setContexts(liquibaseProperties.getContexts());
        liquibase.setDefaultSchema(liquibaseProperties.getDefaultSchema());
        liquibase.setDropFirst(liquibaseProperties.isDropFirst());
        if (env.acceptsProfiles(JHipsterConstants.SPRING_PROFILE_NO_LIQUIBASE)) {
            liquibase.setShouldRun(false);
        } else {
            liquibase.setShouldRun(liquibaseProperties.isEnabled());
            log.debug("Configuring Liquibase");
        }
        return liquibase;
    }<% } %><% if (databaseType === 'mongodb') { %>

    @Bean
    public ValidatingMongoEventListener validatingMongoEventListener() {
        return new ValidatingMongoEventListener(validator());
    }

    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }

    @Bean
    public CustomConversions customConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();<% if (authenticationType === 'oauth2') { %>
        converters.add(new OAuth2AuthenticationReadConverter());<% } %>
        converters.add(DateToZonedDateTimeConverter.INSTANCE);
        converters.add(ZonedDateTimeToDateConverter.INSTANCE);
        return new CustomConversions(converters);
    }

    @Bean
    public Mongobee mongobee(MongoClient mongoClient, MongoTemplate mongoTemplate, MongoProperties mongoProperties) {
        log.debug("Configuring Mongobee");
        Mongobee mongobee = new Mongobee(mongoClient);
        mongobee.setDbName(mongoProperties.getDatabase());
        mongobee.setMongoTemplate(mongoTemplate);
        // package to scan for migrations
        mongobee.setChangeLogsScanPackage("<%=packageName%>.config.dbmigrations");
        mongobee.setEnabled(true);
        return mongobee;
    }<% } %>
}
