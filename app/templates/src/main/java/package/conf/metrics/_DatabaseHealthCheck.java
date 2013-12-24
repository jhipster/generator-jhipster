package <%=packageName%>.conf.metrics;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.codahale.metrics.health.HealthCheck;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

/**
 * Metrics HealthCheck for the Database.
 */
public class DatabaseHealthCheck extends HealthCheck {

    private static final Logger log = LoggerFactory.getLogger(HealthCheck.class);

    private JdbcTemplate jdbcTemplate;

    public DatabaseHealthCheck(DataSource dataSource) {
        jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @Override
    public Result check() {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return Result.healthy();
        } catch (Exception e) {
            log.debug("Cannot connect to Database: {}", e);
            return Result.unhealthy("Cannot connect to Database : " + e.getMessage());
        }
    }
}
