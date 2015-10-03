package <%=packageName%>.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (hibernateCache == 'hazelcast') { %>
import org.springframework.cache.CacheManager;<% } %>
import org.springframework.boot.bind.RelaxedPropertyResolver;
import org.springframework.context.ApplicationContextException;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.*;
import org.springframework.core.env.Environment;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
@Profile(Constants.SPRING_PROFILE_HEROKU)
public class HerokuDatabaseConfiguration implements EnvironmentAware {

    private final Logger log = LoggerFactory.getLogger(HerokuDatabaseConfiguration.class);

    private RelaxedPropertyResolver dataSourcePropertyResolver;

    private RelaxedPropertyResolver jhipsterPropertyResolver;

    @Override
    public void setEnvironment(Environment environment) {
        this.dataSourcePropertyResolver = new RelaxedPropertyResolver(environment, "spring.datasource.");
        this.jhipsterPropertyResolver = new RelaxedPropertyResolver(environment, "jhipster.datasource.");
    }

    @Bean
    public DataSource dataSource(<% if (hibernateCache == 'hazelcast') { %>CacheManager cacheManager<% } %>) {
        log.debug("Configuring Heroku Datasource");

        String herokuUrl = System.getenv("JDBC_DATABASE_URL");
        if (herokuUrl != null) {
	    HikariConfig config = new HikariConfig();

	    //MySQL optimizations, see https://github.com/brettwooldridge/HikariCP/wiki/MySQL-Configuration
	    if ("com.mysql.jdbc.jdbc2.optional.MysqlDataSource".equals(dataSourcePropertyResolver.getProperty("driver-class-name"))) {
                config.addDataSourceProperty("cachePrepStmts", jhipsterPropertyResolver.getProperty("cachePrepStmts", "true"));
                config.addDataSourceProperty("prepStmtCacheSize", jhipsterPropertyResolver.getProperty("prepStmtCacheSize", "250"));
                config.addDataSourceProperty("prepStmtCacheSqlLimit", jhipsterPropertyResolver.getProperty("prepStmtCacheSqlLimit", "2048"));
            }

            config.setDataSourceClassName(dataSourcePropertyResolver.getProperty("driver-class-name"));
            config.addDataSourceProperty("url", herokuUrl);
            return new HikariDataSource(config);
        } else {
            throw new ApplicationContextException("Heroku database URL is not configured, you must set $JDBC_DATABASE_URL");
        }
    }
}
