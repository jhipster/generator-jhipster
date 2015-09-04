package <%=packageName%>.config;

import com.mongodb.Mongo;<% if (authenticationType == 'oauth2') { %>
import <%=packageName%>.config.oauth2.OAuth2AuthenticationReadConverter;<% } %><% if (javaVersion != '7') { %>
import <%=packageName%>.domain.util.JSR310DateConverters.DateToLocalDateConverter;
import <%=packageName%>.domain.util.JSR310DateConverters.LocalDateToDateConverter;
import <%=packageName%>.domain.util.JSR310DateConverters.DateToZonedDateTimeConverter;
import <%=packageName%>.domain.util.JSR310DateConverters.ZonedDateTimeToDateConverter;<% } %>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.config.AbstractMongoConfiguration;
import org.springframework.data.mongodb.core.convert.CustomConversions;
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableMongoRepositories("<%=packageName%>.repository")
@Profile(Constants.SPRING_PROFILE_CLOUD)
public class CloudMongoDbConfiguration extends AbstractMongoConfiguration  {

    private final Logger log = LoggerFactory.getLogger(CloudDatabaseConfiguration.class);

    @Inject
    private MongoDbFactory mongoDbFactory;

    @Bean
    public ValidatingMongoEventListener validatingMongoEventListener() {
        return new ValidatingMongoEventListener(validator());
    }

    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }<% if (authenticationType == 'oauth2' || javaVersion != '7') { %>

    @Bean
    public CustomConversions customConversions() {
        List<Converter<?, ?>> converterList = new ArrayList<>();<% if (authenticationType == 'oauth2') { %>
        converterList.add(new OAuth2AuthenticationReadConverter());<% } %><% if (javaVersion != '7') { %>
        converterList.add(DateToZonedDateTimeConverter.INSTANCE);
        converterList.add(ZonedDateTimeToDateConverter.INSTANCE);
        converterList.add(DateToLocalDateConverter.INSTANCE);
        converterList.add(LocalDateToDateConverter.INSTANCE);<% } %>
        return new CustomConversions(converterList);
    }<% } %>

    @Override
    protected String getDatabaseName() {
        return mongoDbFactory.getDb().getName();
    }

    @Override
    public Mongo mongo() throws Exception {
        return mongoDbFactory().getDb().getMongo();
    }
}
