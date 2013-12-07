package <%=packageName%>.conf;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import liquibase.integration.spring.SpringLiquibase;
import org.hibernate.ejb.HibernatePersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.hibernate4.HibernateExceptionTranslator;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaDialect;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.inject.Inject;
import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import java.util.Properties;

@Configuration
@PropertySource({"classpath:/META-INF/<%= baseName %>/<%= baseName %>.properties"})
@EnableJpaRepositories("<%=packageName%>.repository")
@EnableTransactionManagement
public class DatabaseConfiguration {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfiguration.class);

    @Inject
    private Environment env;

    @Bean
    public DataSource dataSource() {
        log.debug("Configuring Datasource");
        HikariConfig config = new HikariConfig();
        config.setDataSourceClassName(env.getProperty("datasource.datasourceclassname"));
        if (env.getProperty("datasource.url") == null || "".equals(env.getProperty("datasource.url"))) {
            config.addDataSourceProperty("databaseName", env.getProperty("datasource.databaseName"));
            config.addDataSourceProperty("serverName", env.getProperty("datasource.serverName"));
        } else {
            config.addDataSourceProperty("url", env.getProperty("datasource.url"));
        }
        config.addDataSourceProperty("user", env.getProperty("datasource.username"));
        config.addDataSourceProperty("password", env.getProperty("datasource.password"));
        return new HikariDataSource(config);
    }

    @Bean
    public EntityManagerFactory entityManagerFactory() {
        log.debug("Configuring EntityManager");
        LocalContainerEntityManagerFactoryBean lcemfb = new LocalContainerEntityManagerFactoryBean();
        lcemfb.setPersistenceProvider(new HibernatePersistence());
        lcemfb.setPersistenceUnitName("persistenceUnit");
        lcemfb.setDataSource(dataSource());
        lcemfb.setJpaDialect(new HibernateJpaDialect());
        lcemfb.setJpaVendorAdapter(jpaVendorAdapter());

        Properties jpaProperties = new Properties();
        jpaProperties.put("hibernate.cache.use_second_level_cache", true);
        jpaProperties.put("hibernate.cache.use_query_cache", false);
        jpaProperties.put("hibernate.generate_statistics",
                env.getProperty("hibernate.generate_statistics", Boolean.class));

        jpaProperties.put("hibernate.cache.region.factory_class",
                "org.hibernate.cache.ehcache.SingletonEhCacheRegionFactory");

        lcemfb.setJpaProperties(jpaProperties);

        lcemfb.setPackagesToScan("<%=packageName%>.domain");
        lcemfb.afterPropertiesSet();
        return lcemfb.getObject();
    }

    @Bean
    public JpaVendorAdapter jpaVendorAdapter() {
        HibernateJpaVendorAdapter jpaVendorAdapter = new HibernateJpaVendorAdapter();
        jpaVendorAdapter.setShowSql(env.getProperty("hibernate.show_sql", Boolean.class));
        jpaVendorAdapter.setDatabasePlatform(env.getProperty("hibernate.dialect"));
        return jpaVendorAdapter;
    }

    @Bean
    public HibernateExceptionTranslator hibernateExceptionTranslator() {
        return new HibernateExceptionTranslator();
    }

    @Bean(name = "transactionManager")
    public PlatformTransactionManager annotationDrivenTransactionManager() {
        JpaTransactionManager jpaTransactionManager = new JpaTransactionManager();
        jpaTransactionManager.setEntityManagerFactory(entityManagerFactory());
        return jpaTransactionManager;
    }

    @Bean
    public SpringLiquibase liquibase() {
        log.debug("Configuring Liquibase");
        SpringLiquibase liquibase = new SpringLiquibase();
        liquibase.setDataSource(dataSource());
        liquibase.setChangeLog("classpath:META-INF/liquibase/db-changelog.xml");
        liquibase.setContexts("development, production");
        return liquibase;
    }
}

