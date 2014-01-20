package <%=packageName%>.config.metrics;

import com.codahale.metrics.health.HealthCheck;
import <%=packageName%>.config.MetricsConfiguration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

/**
 * Metrics HealthCheck for the Database.
 */
@Configuration("database")
@AutoConfigureAfter(MetricsConfiguration.class)
public class DatabaseHealthCheck extends HealthCheck {

    private final Logger log = LoggerFactory.getLogger(HealthCheck.class);

    private static Map<String, String> queries = new HashMap<String, String>();

    static {
        queries.put("HSQL Database Engine",
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.SYSTEM_USERS");
        queries.put("Oracle", "SELECT 'Hello' from DUAL");
        queries.put("Apache Derby", "SELECT 1 FROM SYSIBM.SYSDUMMY1");
        queries.put("MySQL", "SELECT 1");
        queries.put("PostgreSQL", "SELECT 1");
        queries.put("Microsoft SQL Server", "SELECT 1");
    }

    private static String DEFAULT_QUERY = "SELECT 'Hello'";

    private JdbcTemplate jdbcTemplate;
    private String query = null;

    @Inject
    private DataSource dataSource;

    public DatabaseHealthCheck() {
    }

    @PostConstruct
    private void init() {
        log.debug("Initializing Database Metrics healthcheck");
        jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @Override
    public Result check() {
        try {
            String dataBaseProductName = this.jdbcTemplate.execute(new ConnectionCallback<String>() {
                @Override
                public String doInConnection(Connection connection)
                        throws SQLException, DataAccessException {
                    return connection.getMetaData().getDatabaseProductName();
                }
            });

            query = detectQuery(dataBaseProductName);

            return Result.healthy(dataBaseProductName);
        } catch (Exception e) {
            log.debug("Cannot connect to Database: {}", e);
            return Result.unhealthy("Cannot connect to Database : " + e.getMessage());
        }
    }

    protected String detectQuery(String product) {
        String query = this.query;
        if (!StringUtils.hasText(query)) {
            query = queries.get(product);
        }
        if (!StringUtils.hasText(query)) {
            query = DEFAULT_QUERY;
        }
        return query;
    }

}
