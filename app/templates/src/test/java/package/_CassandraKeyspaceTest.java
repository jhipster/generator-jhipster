package <%=packageName%>;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Session;
import org.cassandraunit.CassandraCQLUnit;
import org.cassandraunit.dataset.cql.ClassPathCQLDataSet;
import org.junit.ClassRule;
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
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
public class CassandraKeyspaceTest {

    protected final Logger log = LoggerFactory.getLogger(this.getClass().getCanonicalName());

    @ClassRule
    public static CassandraCQLUnit cassandra = new CassandraCQLUnit(new ClassPathCQLDataSet("config/cql/create-tables.cql", true, "<%= baseName %>"));

    @Inject
    private Session session;

    @Test
    public void shouldHaveUserTableCreated() throws Exception {
        ResultSet result = session.execute("select * from user");
        assertThat(result.all()).hasSize(4);
    }
}
