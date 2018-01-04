<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

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

import io.github.jhipster.config.JHipsterConstants;
<%_ if (databaseType === 'sql') { _%>
import io.github.jhipster.config.liquibase.AsyncSpringLiquibase;

import liquibase.integration.spring.SpringLiquibase;
<%_ } _%>
<%_ if (databaseType === 'mongodb') { _%>
import com.github.mongobee.Mongobee;
import com.mongodb.MongoClient;
<%_ } _%>
<%_ if (databaseType === 'couchbase') { _%>

import com.couchbase.client.java.Bucket;
import com.github.couchmove.Couchmove;
import <%=packageName%>.repository.CustomN1qlCouchbaseRepository;
import org.apache.commons.codec.binary.Base64;
<%_ } _%>
<%_ if (databaseType === 'mongodb') { _%>
import io.github.jhipster.domain.util.JSR310DateConverters.DateToZonedDateTimeConverter;
import io.github.jhipster.domain.util.JSR310DateConverters.ZonedDateTimeToDateConverter;
<%_ } _%>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (databaseType === 'mongodb') { %>
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoProperties;<% } %><% if (databaseType === 'couchbase') { %>
import org.springframework.boot.autoconfigure.couchbase.CouchbaseAutoConfiguration;<% } %><% if (databaseType === 'sql') { %>
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;<% } %>
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
<%_ if (databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
import org.springframework.context.annotation.Import;
<%_ } _%>
<%_ if (searchEngine === 'elasticsearch' && databaseType === 'mongodb') { _%>
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
<%_ } _%>
<%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || devDatabaseType === 'h2Disk' || devDatabaseType === 'h2Memory') { _%>
import org.springframework.context.annotation.Profile;<% } %><% if (databaseType === 'sql') { %>
import org.springframework.core.env.Environment;<% } %><% if (databaseType === 'mongodb' || databaseType === 'couchbase') { %>
import org.springframework.core.convert.converter.Converter;<% } %><% if (searchEngine === 'elasticsearch') { %>
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;<% } %><% if (databaseType === 'mongodb') { %>
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.CustomConversions;
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;<% } %><% if (databaseType === 'couchbase') { %>
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.couchbase.config.BeanNames;
import org.springframework.data.couchbase.core.convert.CustomConversions;
import org.springframework.data.couchbase.core.mapping.event.ValidatingCouchbaseEventListener;
import org.springframework.data.couchbase.repository.auditing.EnableCouchbaseAuditing;
import org.springframework.data.couchbase.repository.config.EnableCouchbaseRepositories;
import org.springframework.util.StringUtils;<% } %><% if (databaseType === 'mongodb' || databaseType === 'couchbase') { %>
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;<% } %>
<%_ if (databaseType === 'sql') { _%>
import org.springframework.core.task.TaskExecutor;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
<%_ if (devDatabaseType === 'h2Disk' || devDatabaseType === 'h2Memory') { _%>
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.sql.SQLException;
<%_ } } _%>
<%_ if (databaseType === 'mongodb') { _%>
import java.util.ArrayList;
import java.util.List;
<%_ } else if (databaseType === 'couchbase') { _%>

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
<%_ }_%>

@Configuration<% if (databaseType === 'sql') { %>
@EnableJpaRepositories("<%=packageName%>.repository")
@EnableJpaAuditing(auditorAwareRef = "springSecurityAuditorAware")
@EnableTransactionManagement<% } %>
<%_ if (searchEngine === 'elasticsearch' && databaseType === 'mongodb') { _%>
@EnableElasticsearchRepositories(basePackages = "<%=packageName%>.repository.search", excludeFilters = @Filter(type = FilterType.ASSIGNABLE_TYPE, value = MongoRepository.class))
@EnableMongoRepositories(basePackages = "<%=packageName%>.repository", excludeFilters = @Filter(type = FilterType.ASSIGNABLE_TYPE, value = ElasticsearchRepository.class))
<%_ } _%>
<%_ if (searchEngine === 'elasticsearch' && databaseType != 'mongodb') { _%>
@EnableElasticsearchRepositories("<%=packageName%>.repository.search")
<%_ } _%>
<%_ if (searchEngine != 'elasticsearch' && databaseType === 'mongodb') { _%>
@EnableMongoRepositories("<%=packageName%>.repository")
<%_ } _%>
<%_ if (databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
@Profile("!" + JHipsterConstants.SPRING_PROFILE_CLOUD)
<%_ } _%>
<%_ if (databaseType === 'mongodb') { _%>
@Import(value = MongoAutoConfiguration.class)
@EnableMongoAuditing(auditorAwareRef = "springSecurityAuditorAware")
<%_ } _%>
<%_ if (databaseType === 'couchbase') { _%>
@EnableCouchbaseRepositories(repositoryBaseClass = CustomN1qlCouchbaseRepository.class, basePackages = "<%=packageName%>.repository")
@Import(value = CouchbaseAutoConfiguration.class)
@EnableCouchbaseAuditing(auditorAwareRef = "springSecurityAuditorAware")
<%_ } _%>
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
    public Object h2TCPServer() throws SQLException {
        try {
            // We don't want to include H2 when we are packaging for the "prod" profile and won't
            // actually need it, so we have to load / invoke things at runtime through reflection.
            ClassLoader loader = Thread.currentThread().getContextClassLoader();
            Class<?> serverClass = Class.forName("org.h2.tools.Server", true, loader);
            Method createServer = serverClass.getMethod("createTcpServer", String[].class);
            return createServer.invoke(null, new Object[] { new String[] { "-tcp", "-tcpAllowOthers" } });

        } catch (ClassNotFoundException | LinkageError  e) {
            throw new RuntimeException("Failed to load and initialize org.h2.tools.Server", e);

        } catch (SecurityException | NoSuchMethodException e) {
            throw new RuntimeException("Failed to get method org.h2.tools.Server.createTcpServer()", e);

        } catch (IllegalAccessException | IllegalArgumentException e) {
            throw new RuntimeException("Failed to invoke org.h2.tools.Server.createTcpServer()", e);

        } catch (InvocationTargetException e) {
            Throwable t = e.getTargetException();
            if (t instanceof SQLException) {
                throw (SQLException) t;
            }
            throw new RuntimeException("Unchecked exception in org.h2.tools.Server.createTcpServer()", t);
        }
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
    }<% } %><% if (databaseType === 'couchbase') { %>

    @Bean
    public ValidatingCouchbaseEventListener validatingCouchbaseEventListener() {
        return new ValidatingCouchbaseEventListener(validator());
    }<% } %><% if (databaseType === 'mongodb' || databaseType === 'couchbase') { %>

    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }

    @Bean<% if (databaseType === 'couchbase') { %>(name = BeanNames.COUCHBASE_CUSTOM_CONVERSIONS)<% } %>
    public CustomConversions customConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();<% if (databaseType === 'couchbase') { %>
        converters.add(ZonedDateTimeToLongConverter.INSTANCE);
        converters.add(NumberToLocalDateTimeConverter.INSTANCE);
        converters.add(BigIntegerToStringConverter.INSTANCE);
        converters.add(StringToBigIntegerConverter.INSTANCE);
        converters.add(BigDecimalToStringConverter.INSTANCE);
        converters.add(StringToBigDecimalConverter.INSTANCE);
        converters.add(StringToByteConverter.INSTANCE);<% } else { %>
        converters.add(DateToZonedDateTimeConverter.INSTANCE);
        converters.add(ZonedDateTimeToDateConverter.INSTANCE);<% } %>
        return new CustomConversions(converters);
    }<% } %><% if (databaseType === 'mongodb') { %>

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
    }<% } %><% if (databaseType === 'couchbase') { %>

    @Bean
    public Couchmove couchmove(Bucket couchbaseBucket) {
        log.debug("Configuring Couchmove");
        Couchmove couchMove = new Couchmove(couchbaseBucket, "config/couchmove/changelog");
        couchMove.migrate();
        return couchMove;
    }

    /**
     * Simple singleton to convert {@link ZonedDateTime}s to their {@link Long} representation.
     */
    @WritingConverter
    public enum ZonedDateTimeToLongConverter implements Converter<ZonedDateTime, Long> {

        INSTANCE;

        @Override
        public Long convert(ZonedDateTime source) {
            return source == null ? null : Date.from(source.toInstant()).getTime();
        }
    }

    /**
     * Simple singleton to convert from {@link Number} {@link BigDecimal} representation.
     */
    @ReadingConverter
    public enum NumberToLocalDateTimeConverter implements Converter<Number, ZonedDateTime> {

        INSTANCE;

        @Override
        public ZonedDateTime convert(Number source) {
            return source == null ? null : ZonedDateTime.ofInstant(new Date(source.longValue()).toInstant(), ZoneId.systemDefault());
        }

    }

    /**
     * Simple singleton to convert {@link BigDecimal}s to their {@link String} representation.
     */
    @WritingConverter
    public enum BigDecimalToStringConverter implements Converter<BigDecimal, String> {
        INSTANCE;

        public String convert(BigDecimal source) {
            return source == null ? null : source.toString();
        }
    }

    /**
     * Simple singleton to convert from {@link String} {@link BigDecimal} representation.
     */
    @ReadingConverter
    public enum StringToBigDecimalConverter implements Converter<String, BigDecimal> {
        INSTANCE;

        public BigDecimal convert(String source) {
            return StringUtils.hasText(source) ? new BigDecimal(source) : null;
        }
    }

    /**
     * Simple singleton to convert {@link BigInteger}s to their {@link String} representation.
     */
    @WritingConverter
    public enum BigIntegerToStringConverter implements Converter<BigInteger, String> {
        INSTANCE;

        public String convert(BigInteger source) {
            return source == null ? null : source.toString();
        }
    }

    /**
     * Simple singleton to convert from {@link String} {@link BigInteger} representation.
     */
    @ReadingConverter
    public enum StringToBigIntegerConverter implements Converter<String, BigInteger> {
        INSTANCE;

        public BigInteger convert(String source) {
            return StringUtils.hasText(source) ? new BigInteger(source) : null;
        }
    }

    /**
     * Simple singleton to convert from {@link String} {@link byte[]} representation.
     */
    @ReadingConverter
    public enum StringToByteConverter implements Converter<String, byte[]> {
        INSTANCE;

        @Override
        public byte[] convert(String source) {
            return Base64.decodeBase64(source);
        }
    }<% } %>
}
