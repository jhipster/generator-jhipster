package com.mycompany.myapp.config.metrics;

import org.springframework.boot.actuate.health.AbstractHealthIndicator;
import org.springframework.boot.actuate.health.Health;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

/**
 * SpringBoot Actuator HealthIndicator check for the Database.
 */
public class DatabaseHealthIndicator extends AbstractHealthIndicator {
    
    private DataSource dataSource;

    private JdbcTemplate jdbcTemplate;

    private static Map<String, String> queries = new HashMap<>();

    static {
        queries.put("HSQL Database Engine",
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.SYSTEM_USERS");
        queries.put("Oracle", "SELECT 'Hello' from DUAL");
        queries.put("Apache Derby", "SELECT 1 FROM SYSIBM.SYSDUMMY1");
        queries.put("MySQL", "SELECT 1");
        queries.put("PostgreSQL", "SELECT 1");
        queries.put("Microsoft SQL Server", "SELECT 1");
    }

    private static String DEFAULT_QUERY = "SELECT 1";

    private String query = null;

    public DatabaseHealthIndicator(DataSource dataSource) {
        this.dataSource = dataSource;
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }

    @Override
    protected void doHealthCheck(Health.Builder builder) throws Exception {
        String product = getProduct();
        builder.up().withDetail("database", product);
        String query = detectQuery(product);
        if (StringUtils.hasText(query)) {
            try {
                builder.withDetail("hello",
                    this.jdbcTemplate.queryForObject(query, Object.class));
            } catch (Exception ex) {
                builder.down(ex);
            }
        }
    }

    private String getProduct() {
        return this.jdbcTemplate.execute(new ConnectionCallback<String>() {
            @Override
            public String doInConnection(Connection connection) throws SQLException,
                DataAccessException {

                return connection.getMetaData().getDatabaseProductName();
            }
        });
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

    public void setQuery(String query) {
        this.query = query;
    }
}
