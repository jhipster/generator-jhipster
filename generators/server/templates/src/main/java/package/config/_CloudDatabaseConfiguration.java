package <%=packageName%>.config;
<%_ if (databaseType == 'mongodb') { _%>

import com.github.mongobee.Mongobee;

import io.github.jhipster.config.JHipsterConstants;
import io.github.jhipster.domain.util.JSR310DateConverters.*;

<%_ if (authenticationType == 'oauth2') { _%>

import <%=packageName%>.config.oauth2.OAuth2AuthenticationReadConverter;
<%_ } } else { _%>

import io.github.jhipster.config.JHipsterConstants;
<%_ } _%>

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (hibernateCache == 'hazelcast') { %>
import org.springframework.cache.CacheManager;<% } %>
import org.springframework.cloud.config.java.AbstractCloudConfig;
import org.springframework.context.annotation.*;
<%_ if (databaseType == 'mongodb') { _%>
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.convert.CustomConversions;
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
<%_ } _%>
<%_ if (databaseType == 'sql') { _%>

import javax.sql.DataSource;
<%_ } _%>
<%_ if (databaseType == 'mongodb') { _%>

import java.util.ArrayList;
import java.util.List;
<%_ } _%>

@Configuration
<%_ if (databaseType == 'mongodb') { _%>
@EnableMongoRepositories("<%=packageName%>.repository")
<%_ } _%>
@Profile(JHipsterConstants.SPRING_PROFILE_CLOUD)
public class CloudDatabaseConfiguration extends AbstractCloudConfig {

    private final Logger log = LoggerFactory.getLogger(CloudDatabaseConfiguration.class);
    <%_ if (databaseType == 'sql') { _%>

    @Bean
    public DataSource dataSource(<% if (hibernateCache == 'hazelcast') { %>CacheManager cacheManager<% } %>) {
        log.info("Configuring JDBC datasource from a cloud provider");
        return connectionFactory().dataSource();
    }
    <%_ } _%>
    <%_ if (databaseType == 'mongodb') { _%>

    @Bean
    public MongoDbFactory mongoFactory() {
        return connectionFactory().mongoDbFactory();
    }

    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }

    @Bean
    public ValidatingMongoEventListener validatingMongoEventListener() {
        return new ValidatingMongoEventListener(validator());
    }

    @Bean
    public CustomConversions customConversions() {
        List<Converter<?, ?>> converterList = new ArrayList<>();
        <%_ if (authenticationType == 'oauth2') { _%>
        converterList.add(new OAuth2AuthenticationReadConverter());
        <%_ } _%>
        converterList.add(DateToZonedDateTimeConverter.INSTANCE);
        converterList.add(ZonedDateTimeToDateConverter.INSTANCE);
        return new CustomConversions(converterList);
    }

    @Bean
    public Mongobee mongobee(MongoDbFactory mongoDbFactory) throws Exception {
        log.debug("Configuring Mongobee");
        Mongobee mongobee = new Mongobee(mongoDbFactory.getDb().getMongo());
        mongobee.setDbName(mongoDbFactory.getDb().getName());
        // package to scan for migrations
        mongobee.setChangeLogsScanPackage("<%=packageName%>.config.dbmigrations");
        mongobee.setEnabled(true);
        return mongobee;
    }
    <%_ } _%>
}
