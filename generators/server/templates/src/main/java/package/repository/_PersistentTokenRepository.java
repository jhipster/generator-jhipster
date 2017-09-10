<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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
package <%=packageName%>.repository;
<% if (databaseType === 'cassandra') { %>
import com.datastax.driver.core.*;
import com.datastax.driver.mapping.Mapper;
import com.datastax.driver.mapping.MappingManager;<% } %>
import <%=packageName%>.domain.PersistentToken;
import <%=packageName%>.domain.User;<% if (databaseType === 'sql') { %>
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;
<% } %><% if (databaseType === 'mongodb') { %>
import java.time.LocalDate;
import org.springframework.data.mongodb.repository.MongoRepository;
<% } %><% if (databaseType === 'cassandra') { %>
import org.springframework.stereotype.Repository;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.Validator;

import java.util.ArrayList;<% } %>
import java.util.List;
<%_ if (databaseType === 'cassandra') { _%>
import java.util.Set;
<%_ } _%>

<% if (databaseType === 'sql') { %>/**
 * Spring Data JPA repository for the PersistentToken entity.
 */<% } %><% if (databaseType === 'mongodb') { %>/**
 * Spring Data MongoDB repository for the PersistentToken entity.
 */<% } %><% if (databaseType === 'cassandra') { %>/**
 * Cassandra repository for the PersistentToken entity.
 */<% } %><% if (databaseType === 'sql' || databaseType === 'mongodb') { %>
public interface PersistentTokenRepository extends <% if (databaseType === 'sql') { %>JpaRepository<% } %><% if (databaseType === 'mongodb') { %>MongoRepository<% } %><PersistentToken, String> {

    List<PersistentToken> findByUser(User user);

    List<PersistentToken> findByTokenDateBefore(LocalDate localDate);

}<% } else if (databaseType === 'cassandra') { %>
@Repository
public class PersistentTokenRepository {

    private final Session session;

    private final Validator validator;

    Mapper<PersistentToken> mapper;

    private PreparedStatement findPersistentTokenSeriesByUserIdStmt;

    private PreparedStatement insertPersistentTokenSeriesByUserIdStmt;

    private PreparedStatement insertPersistentTokenStmt;

    private PreparedStatement deletePersistentTokenSeriesByUserIdStmt;

    public PersistentTokenRepository(Session session, Validator validator) {
        this.session = session;
        this.validator = validator;
        mapper = new MappingManager(session).mapper(PersistentToken.class);

        findPersistentTokenSeriesByUserIdStmt = session.prepare(
            "SELECT persistent_token_series " +
            "FROM persistent_token_by_user " +
            "WHERE user_id = :user_id");

        insertPersistentTokenSeriesByUserIdStmt = session.prepare(
            "INSERT INTO persistent_token_by_user (user_id, persistent_token_series) " +
                "VALUES (:user_id, :persistent_token_series) " +
                "USING TTL 2592000"); // 30 days

        insertPersistentTokenStmt = session.prepare(
            "INSERT INTO persistent_token (series, token_date, user_agent, token_value, login, user_id, ip_address) " +
                "VALUES (:series, :token_date, :user_agent, :token_value, :login, :user_id, :ip_address) " +
                "USING TTL 2592000"); // 30 days

        deletePersistentTokenSeriesByUserIdStmt = session.prepare(
            "DELETE FROM persistent_token_by_user WHERE user_id = :user_id AND persistent_token_series = :persistent_token_series"
        );
    }

    public PersistentToken findOne(String presentedSeries) {
        return mapper.get(presentedSeries);
    }

    public List<PersistentToken> findByUser(User user) {
        BoundStatement stmt = findPersistentTokenSeriesByUserIdStmt.bind();
        stmt.setString("user_id", user.getId());
        ResultSet rs = session.execute(stmt);
        List<PersistentToken> persistentTokens = new ArrayList<>();
        rs.all().stream()
            .map(row -> row.getString("persistent_token_series"))
            .map(token -> mapper.get(token))
            .forEach(persistentTokens::add);

        return persistentTokens;
    }

    public void save(PersistentToken token) {
        Set<ConstraintViolation<PersistentToken>> violations = validator.validate(token);
        if (violations != null && !violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        BatchStatement batch = new BatchStatement();
        batch.add(insertPersistentTokenStmt.bind()
            .setString("series", token.getSeries())
            .setTimestamp("token_date", token.getTokenDate())
            .setString("user_agent", token.getUserAgent())
            .setString("token_value", token.getTokenValue())
            .setString("login", token.getLogin())
            .setString("user_id", token.getUserId())
            .setString("ip_address", token.getIpAddress()));
        batch.add(insertPersistentTokenSeriesByUserIdStmt.bind()
            .setString("user_id", token.getUserId())
            .setString("persistent_token_series", token.getSeries()));
        session.execute(batch);
    }

    public void delete(PersistentToken token) {
        mapper.delete(token);
        session.execute(deletePersistentTokenSeriesByUserIdStmt.bind()
            .setString("user_id", token.getUserId())
            .setString("persistent_token_series", token.getSeries()));
    }
}<% } %>
