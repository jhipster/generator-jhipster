package  <%=packageName%>.config.metrics;

import com.datastax.driver.core.ResultSet;
import com.datastax.driver.core.querybuilder.QueryBuilder;
import com.datastax.driver.core.querybuilder.Select;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.boot.actuate.health.AbstractHealthIndicator;
import org.springframework.boot.actuate.health.Health;
import org.springframework.data.cassandra.core.CassandraAdminOperations;
import org.springframework.util.Assert;

/**
 * Simple implementation of a {@link org.springframework.boot.actuate.health.HealthIndicator} returning status information for
 * Cassandra data stores.
 */
public class CassandraHealthIndicator extends AbstractHealthIndicator {

    private static Log logger = LogFactory.getLog(CassandraHealthIndicator.class);

    private CassandraAdminOperations cassandraTemplate;

    public CassandraHealthIndicator(CassandraAdminOperations cassandraTemplate) {
        Assert.notNull(cassandraTemplate, "cassandraTemplate must not be null");
        this.cassandraTemplate = cassandraTemplate;
    }

    @Override
    protected void doHealthCheck(Health.Builder builder) throws Exception {
        logger.debug("Initializing Cassandra health indicator");
        try {
            Select select = QueryBuilder.select("release_version").from("system", "local");
            ResultSet results = cassandraTemplate.query(select);
            if (results.isExhausted()) {
                builder.up();
            } else {
                builder.up().withDetail("version", results.one().getString(0));
            }
        } catch (Exception e) {
            logger.debug("Cannot connect to Cassandra cluster. Error: {}", e);
            builder.down(e);
        }
    }
}
