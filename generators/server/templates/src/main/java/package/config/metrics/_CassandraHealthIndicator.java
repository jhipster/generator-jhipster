package  <%=packageName%>.config.metrics;

import com.datastax.driver.core.PreparedStatement;
import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.Session;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.boot.actuate.health.AbstractHealthIndicator;
import org.springframework.boot.actuate.health.Health;
import org.springframework.util.Assert;

/**
 * Simple implementation of a {@link org.springframework.boot.actuate.health.HealthIndicator} returning status information for
 * Cassandra data stores.
 */
public class CassandraHealthIndicator extends AbstractHealthIndicator {

    private static Log log = LogFactory.getLog(CassandraHealthIndicator.class);

    private Session session;

    private PreparedStatement validationStmt;

    public CassandraHealthIndicator(Session session) {
        Assert.notNull(session, "Cassandra session must not be null");
        this.session = session;
        this.validationStmt = session.prepare(
            "SELECT release_version FROM system.local");
    }

    @Override
    protected void doHealthCheck(Health.Builder builder) throws Exception {
        log.debug("Initializing Cassandra health indicator");
        try {
            ResultSet results = session.execute(validationStmt.bind());
            if (results.isExhausted()) {
                builder.up();
            } else {
                builder.up().withDetail("version", results.one().getString(0));
            }
        } catch (Exception e) {
            log.debug("Cannot connect to Cassandra cluster. Error: {}", e);
            builder.down(e);
        }
    }
}
