package <%=packageName%>.conf.metrics;

import com.yammer.metrics.core.HealthCheck;

/**
 * Metrics HealthCheck for the Database.
 */
public class DatabaseHealthCheck extends HealthCheck {

    public DatabaseHealthCheck() {
        super("Database");
    }

    @Override
    public Result check() throws Exception {
        try {
            
            return Result.healthy();
        } catch (Exception e) {
            return Result.unhealthy("Cannot connect to Database : " + e.getMessage());
        }
    }
}
