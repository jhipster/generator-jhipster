package <%=packageName%>.config;

import <%=packageName%>.config.cassandra.CassandraConfiguration;
import org.apache.cassandra.config.DatabaseDescriptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.cassandra.CassandraProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile(Constants.SPRING_PROFILE_TEST)
public class CassandraTestConfiguration extends CassandraConfiguration {

    private final Logger log = LoggerFactory.getLogger(CassandraTestConfiguration.class);

    /**
     * Override how to get the port to connect to the Cassandra cluster
     * When deployed, the port is read by properties
     * For the tests we need to read the port dynamically to discover on which random port Cassandra-unit has started the
     * embedded cluster
     * @param properties
     * @return
     */
    @Override
    protected int getPort(CassandraProperties properties) {
        int port = properties.getPort();
        if (port == 0) {
            // random port for the tests
            int randomPort = DatabaseDescriptor.getNativeTransportPort();
            log.info("Starting the cassandra cluster connection to a random port for the tests: {}", randomPort);
            return randomPort;
        } else {
            return port;
        }
    }
}
