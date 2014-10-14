package <%=packageName%>.config;

import java.net.UnknownHostException;

import javax.inject.Inject;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.mongodb.Mongo;
import de.flapdoodle.embed.mongo.tests.MongodForTestsFactory;

@Configuration
public class MongoConfiguration {

    @Inject
    private MongodForTestsFactory mongodForTestsFactory;

    @Bean
    public Mongo mongo() throws UnknownHostException {
        System.setProperty("DB.TRACE","true");
        return mongodForTestsFactory.newMongo();
    }
}
