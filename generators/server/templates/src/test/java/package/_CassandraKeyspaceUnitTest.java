package <%=packageName%>;

import com.datastax.driver.core.*;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = <%= mainClass %>.class)
public class CassandraKeyspaceUnitTest extends AbstractCassandraTest {

    protected final Logger log = LoggerFactory.getLogger(this.getClass().getCanonicalName());

    @Autowired
    private Session session;

    @Test
    public void shouldListCassandraUnitKeyspace() throws Exception {
        Metadata metadata = session.getCluster().getMetadata();
        assertThat(metadata.getKeyspace(CASSANDRA_UNIT_KEYSPACE)).isNotNull();
    }
}
