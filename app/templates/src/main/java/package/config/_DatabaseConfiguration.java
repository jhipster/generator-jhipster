package <%=packageName%>.config;
<% if (databaseType == 'sql') { %>
import <%=packageName%>.config.liquibase.AsyncSpringLiquibase;
import com.codahale.metrics.MetricRegistry;
import com.fasterxml.jackson.datatype.hibernate4.Hibernate4Module;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import liquibase.integration.spring.SpringLiquibase;<% } %><% if (databaseType == 'mongodb' && authenticationType == 'oauth2') { %>
import <%=packageName%>.config.oauth2.OAuth2AuthenticationReadConverter;<% } %><% if (databaseType == 'mongodb') { %>
import com.mongodb.Mongo;
import org.mongeez.Mongeez;<% } %>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (databaseType == 'sql') { %><% if (hibernateCache == 'hazelcast') { %>
import org.springframework.cache.CacheManager;<% } %>
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoProperties;<% } %><% if (databaseType == 'sql') { %>
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties;
import org.springframework.context.ApplicationContextException;<% } %>
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;<% if (databaseType == 'mongodb') { %>
import org.springframework.context.annotation.Import;<% } %><% if (databaseType == 'sql') { %>
import org.springframework.core.env.Environment;<% } %><% if (databaseType == 'mongodb' && authenticationType == 'oauth2') { %>
import org.springframework.core.convert.converter.Converter;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.core.io.ClassPathResource;<% } %><% if (searchEngine == 'elasticsearch') { %>
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.data.mongodb.config.AbstractMongoConfiguration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;<% } %><% if (databaseType == 'mongodb' && authenticationType == 'oauth2') { %>
import org.springframework.data.mongodb.core.convert.CustomConversions;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;<% } %><% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;
import org.springframework.util.StringUtils;

import javax.inject.Inject;
import javax.sql.DataSource;
import java.util.Arrays;<% } %><% if (databaseType == 'mongodb') { %>
import javax.inject.Inject;<% } %><% if (databaseType == 'mongodb' && authenticationType == 'oauth2') { %>
import java.util.ArrayList;
import java.util.List;<% } %>

@Configuration<% if (databaseType == 'sql') { %>
@EnableJpaRepositories("<%=packageName%>.repository")
@EnableJpaAuditing(auditorAwareRef = "springSecurityAuditorAware")
@EnableTransactionManagement<% } %><% if (searchEngine == 'elasticsearch') { %>
@EnableElasticsearchRepositories("<%=packageName%>.repository.search")<% } %><% if (databaseType == 'mongodb') { %>
@Profile("!" + Constants.SPRING_PROFILE_CLOUD)
@EnableMongoRepositories("<%=packageName%>.repository")
@Import(value = MongoAutoConfiguration.class)
@EnableMongoAuditing(auditorAwareRef = "springSecurityAuditorAware")<% } %>
public class DatabaseConfiguration <% if (databaseType == 'mongodb') { %>extends AbstractMongoConfiguration <% } %> {

    private final Logger log = LoggerFactory.getLogger(DatabaseConfiguration.class);<% if (databaseType == 'sql') { %>

    @Inject
    private Environment env;

    @Autowired(required = false)
    private MetricRegistry metricRegistry;<% } %><% if (databaseType == 'mongodb') { %>

    @Inject
    private Mongo mongo;

    @Inject
    private MongoProperties mongoProperties;<% } %><% if (databaseType == 'sql') { %>

    @Bean(destroyMethod = "close")
    @ConditionalOnExpression("#{!environment.acceptsProfiles('cloud') && !environment.acceptsProfiles('heroku')}")
    public DataSource dataSource(DataSourceProperties dataSourceProperties, JHipsterProperties jHipsterProperties<% if (hibernateCache == 'hazelcast') { %>, CacheManager cacheManager<% } %>) {
        log.debug("Configuring Datasource");
        String databaseName = env.getProperty("spring.datasource.name"); // Standard property not available in DataSourceProperties
        if (dataSourceProperties.getUrl() == null && databaseName == null) {
            log.error("Your database connection pool configuration is incorrect! The application" +
                    " cannot start. Please check your Spring profile, current profiles are: {}",
                    Arrays.toString(env.getActiveProfiles()));

            throw new ApplicationContextException("Database connection pool is not configured correctly");
        }
        HikariConfig config = new HikariConfig();
        config.setDataSourceClassName(dataSourceProperties.getDriverClassName());
        if(StringUtils.isEmpty(dataSourceProperties.getUrl())) {
            config.addDataSourceProperty("databaseName", databaseName);
            config.addDataSourceProperty("serverName", jHipsterProperties.getDatasource().getServerName());
        } else {
            config.addDataSourceProperty("url", dataSourceProperties.getUrl());
        }
        if (dataSourceProperties.getUsername() != null) {
            config.addDataSourceProperty("user", dataSourceProperties.getUsername());
        } else {
            config.addDataSourceProperty("user", ""); // HikariCP doesn't allow null user
        }
        if (dataSourceProperties.getPassword() != null) {
            config.addDataSourceProperty("password", dataSourceProperties.getPassword());
        } else {
            config.addDataSourceProperty("password", ""); // HikariCP doesn't allow null password
        }
<% if (prodDatabaseType == 'mysql' || devDatabaseType == 'mysql') { %>
        //MySQL optimizations, see https://github.com/brettwooldridge/HikariCP/wiki/MySQL-Configuration
        if ("com.mysql.jdbc.jdbc2.optional.MysqlDataSource".equals(dataSourceProperties.getDriverClassName())) {
            config.addDataSourceProperty("cachePrepStmts", jHipsterProperties.getDatasource().isCachePrepStmts());
            config.addDataSourceProperty("prepStmtCacheSize", jHipsterProperties.getDatasource().getPrepStmtCacheSize());
            config.addDataSourceProperty("prepStmtCacheSqlLimit", jHipsterProperties.getDatasource().getPrepStmtCacheSqlLimit());
        }<% } %>
        if (metricRegistry != null) {
            config.setMetricRegistry(metricRegistry);
        }
        return new HikariDataSource(config);
    }

    @Bean
    public SpringLiquibase liquibase(DataSource dataSource, DataSourceProperties dataSourceProperties,
        LiquibaseProperties liquibaseProperties) {

        // Use liquibase.integration.spring.SpringLiquibase if you don't want Liquibase to start asynchronously
        SpringLiquibase liquibase = new AsyncSpringLiquibase();
        liquibase.setDataSource(dataSource);
        liquibase.setChangeLog("classpath:config/liquibase/master.xml");
        liquibase.setContexts(liquibaseProperties.getContexts());
        if (env.acceptsProfiles(Constants.SPRING_PROFILE_FAST)) {
            if ("org.h2.jdbcx.JdbcDataSource".equals(dataSourceProperties.getDriverClassName())) {
                liquibase.setShouldRun(true);
                log.warn("Using '{}' profile with H2 database in memory is not optimal, you should consider switching to" +
                    " MySQL or Postgresql to avoid rebuilding your database upon each start.", Constants.SPRING_PROFILE_FAST);
            } else {
                liquibase.setShouldRun(false);
            }
        } else {
            log.debug("Configuring Liquibase");
        }
        return liquibase;
    }

    @Bean
    public Hibernate4Module hibernate4Module() {
        return new Hibernate4Module();
    }<% } %><% if (databaseType == 'mongodb') { %>

    @Bean
    public ValidatingMongoEventListener validatingMongoEventListener() {
        return new ValidatingMongoEventListener(validator());
    }

    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }

    @Override
    protected String getDatabaseName() {
        return mongoProperties.getDatabase();
    }

    @Override
    public Mongo mongo() throws Exception {
        return mongo;
    }<% if (authenticationType == 'oauth2') { %>

    @Bean
    public CustomConversions customConversions() {
        List<Converter<?, ?>> converterList = new ArrayList<>();
        OAuth2AuthenticationReadConverter converter = new OAuth2AuthenticationReadConverter();
        converterList.add(converter);
        return new CustomConversions(converterList);
    }<% } %>

    @Bean
    @Profile("!" + Constants.SPRING_PROFILE_FAST)
    public Mongeez mongeez() {
        log.debug("Configuring Mongeez");
        Mongeez mongeez = new Mongeez();
        mongeez.setFile(new ClassPathResource("/config/mongeez/master.xml"));
        mongeez.setMongo(mongo);
        mongeez.setDbName(mongoProperties.getDatabase());
        mongeez.process();
        return mongeez;
    }<% } %>
}
