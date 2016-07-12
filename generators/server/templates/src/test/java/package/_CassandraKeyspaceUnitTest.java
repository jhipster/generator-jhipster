package <%=packageName%>;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Session;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import javax.inject.Inject;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = <%= mainClass %>.class)
@WebAppConfiguration
public class CassandraKeyspaceUnitTest extends AbstractCassandraTest {

    protected final Logger log = LoggerFactory.getLogger(this.getClass().getCanonicalName());

    @Inject
    private Session session;

    @Test
    public void shouldListCassandraUnitKeyspace() throws Exception {
        ResultSet result = session.execute("SELECT * FROM system_schema.keyspaces;");
        assertThat(result.all())
            .extracting(row -> row.getString("keyspace_name"))
            .containsOnlyOnce((CASSANDRA_UNIT_KEYSPACE));
    }
}
