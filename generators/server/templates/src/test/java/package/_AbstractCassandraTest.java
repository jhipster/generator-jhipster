package <%=packageName%>;

import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.Session;
import org.apache.cassandra.exceptions.ConfigurationException;
import org.apache.thrift.transport.TTransportException;
import org.cassandraunit.CQLDataLoader;
import org.cassandraunit.dataset.cql.ClassPathCQLDataSet;
import org.cassandraunit.utils.EmbeddedCassandraServerHelper;
import org.junit.AfterClass;
import org.junit.BeforeClass;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


/**
 * Base class for starting/stopping Cassandra during tests.
 */
public class AbstractCassandraTest {

    public static final String CASSANDRA_UNIT_KEYSPACE = "cassandra_unit_keyspace";

    public static final long CASSANDRA_TIMEOUT = 30000L;

    @BeforeClass
    public static void startServer() throws InterruptedException, TTransportException, ConfigurationException, IOException, URISyntaxException  {
        EmbeddedCassandraServerHelper.startEmbeddedCassandra(CASSANDRA_TIMEOUT);
        Cluster cluster = new Cluster.Builder().addContactPoints("127.0.0.1").withPort(9142).build();
        Session session = cluster.connect();
        String createQuery = "CREATE KEYSPACE " + CASSANDRA_UNIT_KEYSPACE + " WITH replication={'class' : 'SimpleStrategy', 'replication_factor':1}";
        session.execute(createQuery);
        String useKeyspaceQuery = "USE " + CASSANDRA_UNIT_KEYSPACE;
        session.execute(useKeyspaceQuery);
        CQLDataLoader dataLoader = new CQLDataLoader(session);
        applyScripts(dataLoader, "config/cql/changelog/", "*.cql");
    }

    private static void applyScripts(CQLDataLoader dataLoader, String cqlDir, String pattern) throws IOException, URISyntaxException {
        URL dirUrl = ClassLoader.getSystemResource(cqlDir);
        if (dirUrl == null) { // protect for empty directory
            return;
        }

        List<String> scripts = new ArrayList<>();
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(Paths.get(dirUrl.toURI()), pattern)) {
            for (Path entry : stream) {
                scripts.add(entry.getFileName().toString());
            }
        }
        Collections.sort(scripts);

        for (String fileName : scripts) {
            dataLoader.load(new ClassPathCQLDataSet(cqlDir + fileName, false, false, CASSANDRA_UNIT_KEYSPACE));
        }
    }

    @AfterClass
    public static void cleanupServer() {
        EmbeddedCassandraServerHelper.cleanEmbeddedCassandra();
    }
}
