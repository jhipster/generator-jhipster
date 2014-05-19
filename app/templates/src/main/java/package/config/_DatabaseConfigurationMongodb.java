package <%=packageName%>.config;


import com.mongodb.Mongo;
import org.mongeez.Mongeez;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.bind.RelaxedPropertyResolver;
import org.springframework.context.ApplicationContextException;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import javax.inject.Inject;

@Configuration
@EnableMongoRepositories("<%=packageName%>.repository.mongodb")
@Import(value = MongoAutoConfiguration.class)
public class DatabaseConfigurationMongodb implements EnvironmentAware {

    private final Logger log = LoggerFactory.getLogger(DatabaseConfigurationMongodb.class);

    private RelaxedPropertyResolver propertyResolver;

    private Environment environment;

    @Inject
    private Mongo mongo;
    

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
        this.propertyResolver = new RelaxedPropertyResolver(environment, "spring.data.mongodb.");
    }
    
    @Bean
    public ValidatingMongoEventListener validatingMongoEventListener() {
        return new ValidatingMongoEventListener(validator());
    }

    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }

    @Bean
    public MongoTemplate mongoTemplate() {
        String user = propertyResolver.getProperty("username");
        String password = propertyResolver.getProperty("password");
        if("".equals(user.trim())){
            return new MongoTemplate(mongo, propertyResolver.getProperty("databaseName"));
        }
        return new MongoTemplate(mongo, propertyResolver.getProperty("databaseName"), new UserCredentials(user, password));
    }

    @Bean
    public Mongeez mongeez() {
        log.debug("Configuring Mongeez");
        Mongeez mongeez = new Mongeez();

        mongeez.setFile(new ClassPathResource("/config/mongeez/master.xml"));
        mongeez.setMongo(mongo);
        mongeez.setDbName(propertyResolver.getProperty("databaseName"));
        mongeez.process();

        return mongeez;
    }
    
}

