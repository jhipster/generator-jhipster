package <%=packageName%>.config;

import java.io.IOException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import de.flapdoodle.embed.mongo.distribution.Version;
import de.flapdoodle.embed.mongo.tests.MongodForTestsFactory;

@Configuration
public class MongoFactoryConfiguration {

    @Bean
    public MongodForTestsFactory mongodForTestsFactory() throws IOException {
        return MongodForTestsFactory.with(Version.Main.PRODUCTION);
    }
}
