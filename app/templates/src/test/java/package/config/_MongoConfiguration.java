package <%=packageName%>.config;

import com.mongodb.Mongo;
import de.flapdoodle.embed.mongo.distribution.Version;
import de.flapdoodle.embed.mongo.tests.MongodForTestsFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class MongoConfiguration {

    @Bean
    public Mongo mongo() throws IOException {
        System.setProperty("DB.TRACE","true");
        return MongodForTestsFactory.with(Version.Main.PRODUCTION).newMongo();
    }
}
