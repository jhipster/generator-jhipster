package <%=packageName%>.conf.metrics;

import com.yammer.metrics.core.HealthCheck;

import javax.persistence.EntityManager;

/**
 * Metrics HealthCheck for the Database.
 */
public class DatabaseHealthCheck extends HealthCheck {

    private EntityManager em;

    public DatabaseHealthCheck(EntityManager em) {
        super("Database");
        this.em = em;
    }

    @Override
    public Result check() {
        try {
            em.createNativeQuery("SELECT 1");
            return Result.healthy();
        } catch (Exception e) {
            return Result.unhealthy("Cannot connect to Database : " + e.getMessage());
        }
    }
}
