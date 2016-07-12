package <%=packageName%>.gateway.ratelimiting;

import java.util.Date;
import javax.annotation.PostConstruct;
import javax.inject.Inject;

import com.datastax.driver.core.*;

/**
 * Repository storing data used by the gateway's rate limiting filter.
 */
public class RateLimitingRepository {

    @Inject
    private Session session;

    private PreparedStatement rateLimitingIncrement;

    private PreparedStatement rateLimitingCount;

    @PostConstruct
    public void init() {
        rateLimitingIncrement = session.prepare(
            "UPDATE gateway_ratelimiting\n" +
                "  SET value = value + 1\n" +
                "  WHERE id = :id AND time_unit = :time_unit AND time = :time");

        rateLimitingCount = session.prepare(
            "SELECT value\n" +
                "  FROM gateway_ratelimiting\n" +
                "  WHERE id = :id AND time_unit = :time_unit AND time = :time"
        );
    }

    public void incrementCounter(String id, String timeUnit, Date time) {
        BoundStatement stmt = rateLimitingIncrement.bind();
        stmt.setString("id", id);
        stmt.setString("time_unit", timeUnit);
        stmt.setTimestamp("time", time);
        session.executeAsync(stmt);
    }

    public long getCounter(String id, String timeUnit, Date time) {
        BoundStatement stmt = rateLimitingCount.bind();
        stmt.setString("id", id);
        stmt.setString("time_unit", timeUnit);
        stmt.setTimestamp("time", time);
        ResultSet rs = session.execute(stmt);
        if (rs.isExhausted()) {
            return 0;
        }
        return rs.one().getLong(0);
    }
}
