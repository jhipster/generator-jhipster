package <%=packageName%>.config;

<% if (databaseType == 'sql') { %>import com.codahale.metrics.MetricRegistry;
import com.fasterxml.jackson.datatype.hibernate4.Hibernate4Module;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import liquibase.integration.spring.SpringLiquibase;<% } %><% if (databaseType == 'mongodb' && authenticationType == 'token') { %>
import <%=packageName%>.config.oauth2.OAuth2AuthenticationReadConverter;<% } %><% if (databaseType == 'mongodb') { %>
import com.mongodb.Mongo;
import org.mongeez.Mongeez;<% } %>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (databaseType == 'sql') { %>
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoProperties;<% } %><% if (databaseType == 'sql') { %>
import org.springframework.boot.bind.RelaxedPropertyResolver;
import org.springframework.context.ApplicationContextException;
import org.springframework.context.EnvironmentAware;<% } %>
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;<% if (databaseType == 'mongodb') { %>
import org.springframework.context.annotation.Import;<% } %><% if (databaseType == 'sql') { %>
import org.springframework.core.env.Environment;<% } %><% if (databaseType == 'mongodb' && authenticationType == 'token') { %>
import org.springframework.core.convert.converter.Converter;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.config.AbstractMongoConfiguration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;<% } %><% if (databaseType == 'mongodb' && authenticationType == 'token') { %>
import org.springframework.data.mongodb.core.convert.CustomConversions;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;<% } %><% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.Arrays;<% } %><% if (databaseType == 'mongodb') { %>
import javax.inject.Inject;<% } %><% if (databaseType == 'mongodb' && authenticationType == 'token') { %>
import java.util.ArrayList;
import java.util.List;<% } %>

@Configuration<% if (databaseType == 'sql') { %>
@EnableJpaRepositories("<%=packageName%>.repository")
@EnableJpaAuditing(auditorAwareRef = "springSecurityAuditorAware")
@EnableTransactionManagement<% } %><% if (databaseType == 'mongodb') { %>
@Profile("!cloud")
@EnableMongoRepositories("<%=packageName%>.repository")
@Import(value = MongoAutoConfiguration.class)
@EnableMongoAuditing(auditorAwareRef = "springSecurityAuditorAware")<% } %>
public class DatabaseConfiguration <% if (databaseType == 'sql') { %>implements EnvironmentAware<% } %><% if (databaseType == 'mongodb') { %>extends AbstractMongoConfiguration <% } %> {

    private final Logger log = LoggerFactory.getLogger(DatabaseConfiguration.class);<% if (databaseType == 'sql') { %>

    private RelaxedPropertyResolver propertyResolver;

    private Environment env;

    @Autowired(required = false)
    private MetricRegistry metricRegistry;<% } %><% if (databaseType == 'mongodb') { %>

    @Inject
    private Mongo mongo;

    @Inject
    private MongoProperties mongoProperties;<% } %><% if (databaseType == 'sql') { %>

    @Override
    public void setEnvironment(Environment env) {
        this.env = env;
        this.propertyResolver = new RelaxedPropertyResolver(env, "spring.datasource.");
    }

    @Bean(destroyMethod = "shutdown")
    @ConditionalOnMissingClass(name = "<%=packageName%>.config.HerokuDatabaseConfiguration")
    @Profile("!" + Constants.SPRING_PROFILE_CLOUD)
    public DataSource dataSource() {
        log.debug("Configuring Datasource");
        if (propertyResolver.getProperty("url") == null && propertyResolver.getProperty("databaseName") == null) {
            log.error("Your database connection pool configuration is incorrect! The application" +
                    "cannot start. Please check your Spring profile, current profiles are: {}",
                    Arrays.toString(env.getActiveProfiles()));

            throw new ApplicationContextException("Database connection pool is not configured correctly");
        }
        HikariConfig config = new HikariConfig();
        config.setDataSourceClassName(propertyResolver.getProperty("dataSourceClassName"));
        if (propertyResolver.getProperty("url") == null || "".equals(propertyResolver.getProperty("url"))) {
            config.addDataSourceProperty("databaseName", propertyResolver.getProperty("databaseName"));
            config.addDataSourceProperty("serverName", propertyResolver.getProperty("serverName"));
        } else {
            config.addDataSourceProperty("url", propertyResolver.getProperty("url"));
        }
        config.addDataSourceProperty("user", propertyResolver.getProperty("username"));
        config.addDataSourceProperty("password", propertyResolver.getProperty("password"));
<% if (prodDatabaseType == 'mysql' || devDatabaseType == 'mysql') { %>
        //MySQL optimizations, see https://github.com/brettwooldridge/HikariCP/wiki/MySQL-Configuration
        if ("com.mysql.jdbc.jdbc2.optional.MysqlDataSource".equals(propertyResolver.getProperty("dataSourceClassName"))) {
            config.addDataSourceProperty("cachePrepStmts", propertyResolver.getProperty("cachePrepStmts", "true"));
            config.addDataSourceProperty("prepStmtCacheSize", propertyResolver.getProperty("prepStmtCacheSize", "250"));
            config.addDataSourceProperty("prepStmtCacheSqlLimit", propertyResolver.getProperty("prepStmtCacheSqlLimit", "2048"));
            config.addDataSourceProperty("useServerPrepStmts", propertyResolver.getProperty("useServerPrepStmts", "true"));
        }<% } %>
        if (metricRegistry != null) {
            config.setMetricRegistry(metricRegistry);
        }
        return new HikariDataSource(config);
    }

    @Bean
    public SpringLiquibase liquibase(DataSource dataSource) {
        SpringLiquibase liquibase = new SpringLiquibase();
        liquibase.setDataSource(dataSource);
        liquibase.setChangeLog("classpath:config/liquibase/master.xml");
        liquibase.setContexts("development, production");
        if (env.acceptsProfiles(Constants.SPRING_PROFILE_FAST)) {
            liquibase.setShouldRun(false);
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
    }<% if (authenticationType == 'token') { %>

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
