<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.gateway.ratelimiting;

import java.util.Date;

import com.datastax.driver.core.*;

/**
 * Repository storing data used by the gateway's rate limiting filter.
 */
public class RateLimitingRepository {

    private final Session session;

    private PreparedStatement rateLimitingIncrement;

    private PreparedStatement rateLimitingCount;

    public RateLimitingRepository(Session session) {
        this.session = session;
        this.rateLimitingIncrement = session.prepare(
            "UPDATE gateway_ratelimiting\n" +
                "  SET value = value + 1\n" +
                "  WHERE id = :id AND time_unit = :time_unit AND time = :time");

        this.rateLimitingCount = session.prepare(
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
