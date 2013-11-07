package <%=packageName%>.conf.metrics;

import com.codahale.metrics.health.HealthCheck;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

/**
 * Metrics HealthCheck for the Database.
 */
public class DatabaseHealthCheck extends HealthCheck {

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
            return Result.unhealthy("Cannot connect to Database : " + e.getMessage());
        }
    }
}
