package <%=packageName%>.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import liquibase.integration.spring.SpringLiquibase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.bind.RelaxedPropertyResolver;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableJpaRepositories("<%=packageName%>.repository")
@EnableTransactionManagement
public class DatabaseConfiguration implements EnvironmentAware {

    private final Logger log = LoggerFactory.getLogger(DatabaseConfiguration.class);

    private RelaxedPropertyResolver env;

    @Override
    public void setEnvironment(Environment environment) {
        this.env = new RelaxedPropertyResolver(environment, "spring.datasource.");
    }

    @Bean
    public DataSource dataSource() {
        log.debug("Configuring Datasource");
        HikariConfig config = new HikariConfig();
        config.setDataSourceClassName(env.getProperty("dataSourceClassName"));
        if (env.getProperty("url") == null || "".equals(env.getProperty("url"))) {
            config.addDataSourceProperty("databaseName", env.getProperty("databaseName"));
            config.addDataSourceProperty("serverName", env.getProperty("serverName"));
        } else {
            config.addDataSourceProperty("url", env.getProperty("url"));
        }
        config.addDataSourceProperty("user", env.getProperty("username"));
        config.addDataSourceProperty("password", env.getProperty("password"));
        return new HikariDataSource(config);
    }

    @Bean(name = {"org.springframework.boot.autoconfigure.AutoConfigurationUtils.basePackages"})
    public List<String> getBasePackages() {
        List<String> basePackages = new ArrayList<String>();
        basePackages.add("<%=packageName%>.domain");
        return basePackages;
    }

    @Bean
    public SpringLiquibase liquibase() {
        log.debug("Configuring Liquibase");
        SpringLiquibase liquibase = new SpringLiquibase();
        liquibase.setDataSource(dataSource());
        liquibase.setChangeLog("classpath:META-INF/master.xml");
        liquibase.setContexts("development, production");
        return liquibase;
    }
}

