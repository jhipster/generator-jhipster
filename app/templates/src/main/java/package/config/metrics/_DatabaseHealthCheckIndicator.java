package <%=packageName%>.config.metrics;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
<% if (databaseType == 'sql') { %>
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;<% } %><% if (databaseType == 'nosql') { %>
import org.springframework.data.mongodb.core.MongoTemplate;<% } %>

/**
 * SpringBoot Actuator HealthIndicator check for the Database.
 */
public class DatabaseHealthCheckIndicator extends HealthCheckIndicator {

    public static final String DATABASE_HEALTH_INDICATOR = "database";
	
    private final Logger log = LoggerFactory.getLogger(DatabaseHealthCheckIndicator.class);
    <% if (databaseType == 'sql') { %>
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

    private static String DEFAULT_QUERY = "SELECT 'Hello'";

    private JdbcTemplate jdbcTemplate;
    private String query = null;<% } %><% if (databaseType == 'nosql') { %>
    private MongoTemplate mongoTemplate;<% } %>

    public DatabaseHealthCheckIndicator() {
    }
    <% if (databaseType == 'sql') { %>
    public void setDataSource(DataSource dataSource) {
        this.jdbcTemplate = new JdbcTemplate(dataSource);
    }<% } %><% if (databaseType == 'nosql') { %>
    public void setMongoTemplate(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }<% } %>

    @Override
    protected String getHealthCheckIndicatorName() {
        return DATABASE_HEALTH_INDICATOR;
    }

    @Override
    protected Result check() throws Exception {
        log.debug("Initializing Database health indicator");
        try {
            <% if (databaseType == 'sql') { %>String dataBaseProductName = jdbcTemplate.execute(new ConnectionCallback<String>() {
                @Override
                public String doInConnection(Connection connection)
                        throws SQLException, DataAccessException {
                    return connection.getMetaData().getDatabaseProductName();
                }
            });
            query = detectQuery(dataBaseProductName);
            return healthy();<% } %><% if (databaseType == 'nosql') { %>
            if (mongoTemplate.getDb().getStats().ok()) {
                return healthy();
            }

            return unhealthy("Cannot connect to database.");<% } %>
        } catch (Exception e) {
            log.debug("Cannot connect to Database.", e);
            return unhealthy("Cannot connect to database.", e);
        }
    }<% if (databaseType == 'sql') { %>

    protected String detectQuery(String product) {
        String query = this.query;
        if (!StringUtils.hasText(query)) {
            query = queries.get(product);
        }
        if (!StringUtils.hasText(query)) {
            query = DEFAULT_QUERY;
        }
        return query;
    }<% } %>
}
