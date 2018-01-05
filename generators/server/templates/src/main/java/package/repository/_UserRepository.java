<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

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
<%_
let cacheManagerIsAvailable = false;
if (['ehcache', 'hazelcast', 'infinispan'].includes(cacheProvider) || applicationType === 'gateway') {
    cacheManagerIsAvailable = true;
}
_%>
package <%=packageName%>.repository;
<%_ if (databaseType === 'cassandra') { _%>

import com.datastax.driver.core.*;
import com.datastax.driver.mapping.Mapper;
import com.datastax.driver.mapping.MappingManager;
<%_ } _%>

import <%=packageName%>.domain.User;

<%_ if (cacheManagerIsAvailable === true) { _%>
import org.springframework.cache.annotation.Cacheable;
<%_ } _%>
<%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
<%_ } _%>
<%_ if (databaseType === 'sql') { _%>
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
<%_ } _%>
<%_ if (databaseType === 'mongodb') { _%>
import org.springframework.data.mongodb.repository.MongoRepository;
<%_ } _%>
import org.springframework.stereotype.Repository;
<%_ if (databaseType === 'cassandra') { _%>
import org.springframework.util.StringUtils;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.validation.Validator;
<%_ } _%>
import java.util.List;
import java.util.Optional;
<%_ if (databaseType === 'cassandra') { _%>
import java.util.Set;
<%_ } _%>
<%_ if (databaseType !== 'cassandra') { _%>
import java.time.Instant;
<%_ } _%>
<% if (databaseType === 'couchbase') { %>
import static <%=packageName%>.config.Constants.ID_DELIMITER;
<% } %>
<%_ if (databaseType === 'sql') { _%>
/**
 * Spring Data JPA repository for the User entity.
 */
<%_ } _%>
<%_ if (databaseType === 'mongodb') { _%>
/**
 * Spring Data MongoDB repository for the User entity.
 */
<%_ } _%>
<%_ if (databaseType === 'couchbase') { _%>
/**
 * Spring Data Couchbase repository for the User entity.
 */
<%_ } _%>
<%_ if (databaseType === 'cassandra') { _%>
/**
 * Cassandra repository for the User entity.
 */
<%_ } _%>
<%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
@Repository
public interface UserRepository extends <% if (databaseType === 'sql') { %>JpaRepository<User, Long><% } %><% if (databaseType === 'mongodb') { %>MongoRepository<User, String><% } %><% if (databaseType === 'couchbase') { %>N1qlCouchbaseRepository<User, String><% } %> {
    <%_ if (cacheManagerIsAvailable) { _%>

    String USERS_BY_LOGIN_CACHE = "usersByLogin";

    String USERS_BY_EMAIL_CACHE = "usersByEmail";
    <%_ } _%>
<%_ if (authenticationType !== 'oauth2') { _%>

    Optional<User> findOneByActivationKey(String activationKey);
<%_ } _%>

    List<User> findAllByActivatedIsFalseAndCreatedDateBefore(Instant dateTime);
<%_ if (authenticationType !== 'oauth2') { _%>

    Optional<User> findOneByResetKey(String resetKey);
<%_ } _%>

    <%_ if (databaseType === 'couchbase' || databaseType === 'mongodb') { _%>
        <%_ if (cacheManagerIsAvailable === true) { _%>
    @Cacheable(cacheNames = USERS_BY_EMAIL_CACHE)
        <%_ } _%>
    <%_ } _%>
    Optional<User> findOneByEmailIgnoreCase(String email);

    <%_ if (databaseType === 'couchbase') { _%>
        <%_ if (cacheManagerIsAvailable === true) { _%>
    @Cacheable(cacheNames = USERS_BY_LOGIN_CACHE)
        <%_ } _%>
    default Optional<User> findOneByLogin(String login) {
        return Optional.ofNullable(findOne(User.PREFIX + ID_DELIMITER + login));
    }
    <%_ } else if (databaseType === 'mongodb') { _%>
        <%_ if (cacheManagerIsAvailable === true) { _%>
    @Cacheable(cacheNames = USERS_BY_LOGIN_CACHE)
        <%_ } _%>
    Optional<User> findOneByLogin(String login);
    <%_ } else { _%>
    Optional<User> findOneByLogin(String login);
    <%_ } _%>
    <%_ if (databaseType === 'sql') { _%>

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesById(<%= pkType %> id);

    @EntityGraph(attributePaths = "authorities")
    <%_ if (cacheManagerIsAvailable === true) { _%>
    @Cacheable(cacheNames = USERS_BY_LOGIN_CACHE)
    <%_ } _%>
    Optional<User> findOneWithAuthoritiesByLogin(String login);

    @EntityGraph(attributePaths = "authorities")
    <%_ if (cacheManagerIsAvailable === true) { _%>
    @Cacheable(cacheNames = USERS_BY_EMAIL_CACHE)
    <%_ } _%>
    Optional<User> findOneWithAuthoritiesByEmail(String email);
<%_ } _%>

    Page<User> findAllByLoginNot(Pageable pageable, String login);
}
<%_ } else if (databaseType === 'cassandra') { _%>
@Repository
public class UserRepository {
    <%_ if (cacheManagerIsAvailable) { _%>

    public static final String USERS_BY_LOGIN_CACHE = "usersByLogin";

    public static final String USERS_BY_EMAIL_CACHE = "usersByEmail";
    <%_ } _%>

    private final Session session;

    private final Validator validator;

    private Mapper<User> mapper;

    private PreparedStatement findAllStmt;

    private PreparedStatement findOneByActivationKeyStmt;

    private PreparedStatement findOneByResetKeyStmt;

    private PreparedStatement insertByActivationKeyStmt;

    private PreparedStatement insertByResetKeyStmt;

    private PreparedStatement deleteByActivationKeyStmt;

    private PreparedStatement deleteByResetKeyStmt;

    private PreparedStatement findOneByLoginStmt;

    private PreparedStatement insertByLoginStmt;

    private PreparedStatement deleteByLoginStmt;

    private PreparedStatement findOneByEmailStmt;

    private PreparedStatement insertByEmailStmt;

    private PreparedStatement deleteByEmailStmt;

    private PreparedStatement truncateStmt;

    private PreparedStatement truncateByResetKeyStmt;

    private PreparedStatement truncateByLoginStmt;

    private PreparedStatement truncateByEmailStmt;

    public UserRepository(Session session, Validator validator) {
        this.session = session;
        this.validator = validator;
        mapper = new MappingManager(session).mapper(User.class);

        findAllStmt = session.prepare("SELECT * FROM user");

        findOneByActivationKeyStmt = session.prepare(
            "SELECT id " +
                "FROM user_by_activation_key " +
                "WHERE activation_key = :activation_key");

        findOneByResetKeyStmt = session.prepare(
            "SELECT id " +
                "FROM user_by_reset_key " +
                "WHERE reset_key = :reset_key");

        insertByActivationKeyStmt = session.prepare(
            "INSERT INTO user_by_activation_key (activation_key, id) " +
                "VALUES (:activation_key, :id)");

        insertByResetKeyStmt = session.prepare(
            "INSERT INTO user_by_reset_key (reset_key, id) " +
                "VALUES (:reset_key, :id)");

        deleteByActivationKeyStmt = session.prepare(
            "DELETE FROM user_by_activation_key " +
                "WHERE activation_key = :activation_key");

        deleteByResetKeyStmt = session.prepare(
            "DELETE FROM user_by_reset_key " +
                "WHERE reset_key = :reset_key");

        findOneByLoginStmt = session.prepare(
            "SELECT id " +
                "FROM user_by_login " +
                "WHERE login = :login");

        insertByLoginStmt = session.prepare(
            "INSERT INTO user_by_login (login, id) " +
                "VALUES (:login, :id)");

        deleteByLoginStmt = session.prepare(
            "DELETE FROM user_by_login " +
                "WHERE login = :login");

        findOneByEmailStmt = session.prepare(
            "SELECT id " +
                "FROM user_by_email " +
                "WHERE email     = :email");

        insertByEmailStmt = session.prepare(
            "INSERT INTO user_by_email (email, id) " +
                "VALUES (:email, :id)");

        deleteByEmailStmt = session.prepare(
            "DELETE FROM user_by_email " +
                "WHERE email = :email");

        truncateStmt = session.prepare("TRUNCATE user");

        truncateByResetKeyStmt = session.prepare("TRUNCATE user_by_reset_key");

        truncateByLoginStmt = session.prepare("TRUNCATE user_by_login");

        truncateByEmailStmt = session.prepare("TRUNCATE user_by_email");
    }

    public User findOne(String id) {
        return mapper.get(id);
    }

    public Optional<User> findOneByActivationKey(String activationKey) {
        BoundStatement stmt = findOneByActivationKeyStmt.bind();
        stmt.setString("activation_key", activationKey);
        return findOneFromIndex(stmt);
    }

    public Optional<User> findOneByResetKey(String resetKey) {
        BoundStatement stmt = findOneByResetKeyStmt.bind();
        stmt.setString("reset_key", resetKey);
        return findOneFromIndex(stmt);
    }

<%_ if (cacheManagerIsAvailable === true) { _%>
    @Cacheable(cacheNames = USERS_BY_EMAIL_CACHE)
<%_ } _%>
    public Optional<User> findOneByEmailIgnoreCase(String email) {
        BoundStatement stmt = findOneByEmailStmt.bind();
        stmt.setString("email", email.toLowerCase());
        return findOneFromIndex(stmt);
    }

<%_ if (cacheManagerIsAvailable === true) { _%>
    @Cacheable(cacheNames = USERS_BY_LOGIN_CACHE)
<%_ } _%>
    public Optional<User> findOneByLogin(String login) {
        BoundStatement stmt = findOneByLoginStmt.bind();
        stmt.setString("login", login);
        return findOneFromIndex(stmt);
    }

    public List<User> findAll() {
        return mapper.map(session.execute(findAllStmt.bind())).all();
    }

    public User save(User user) {
        Set<ConstraintViolation<User>> violations = validator.validate(user);
        if (violations != null && !violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        User oldUser = mapper.get(user.getId());
        if (oldUser != null) {
            if (!StringUtils.isEmpty(oldUser.getActivationKey()) && !oldUser.getActivationKey().equals(user.getActivationKey())) {
                session.execute(deleteByActivationKeyStmt.bind().setString("activation_key", oldUser.getActivationKey()));
            }
            if (!StringUtils.isEmpty(oldUser.getResetKey()) && !oldUser.getResetKey().equals(user.getResetKey())) {
                session.execute(deleteByResetKeyStmt.bind().setString("reset_key", oldUser.getResetKey()));
            }
            if (!StringUtils.isEmpty(oldUser.getLogin()) && !oldUser.getLogin().equals(user.getLogin())) {
                session.execute(deleteByLoginStmt.bind().setString("login", oldUser.getLogin()));
            }
            if (!StringUtils.isEmpty(oldUser.getEmail()) && !oldUser.getEmail().equalsIgnoreCase(user.getEmail())) {
                session.execute(deleteByEmailStmt.bind().setString("email", oldUser.getEmail().toLowerCase()));
            }
        }
        BatchStatement batch = new BatchStatement();
        batch.add(mapper.saveQuery(user));
        if (!StringUtils.isEmpty(user.getActivationKey())) {
            batch.add(insertByActivationKeyStmt.bind()
                .setString("activation_key", user.getActivationKey())
                .setString("id", user.getId()));
        }
        if (!StringUtils.isEmpty(user.getResetKey())) {
            batch.add(insertByResetKeyStmt.bind()
                .setString("reset_key", user.getResetKey())
                .setString("id", user.getId()));
        }
        batch.add(insertByLoginStmt.bind()
            .setString("login", user.getLogin())
            .setString("id", user.getId()));
        batch.add(insertByEmailStmt.bind()
            .setString("email", user.getEmail().toLowerCase())
            .setString("id", user.getId()));
        session.execute(batch);
        return user;
    }

    public void delete(User user) {
        BatchStatement batch = new BatchStatement();
        batch.add(mapper.deleteQuery(user));
        if (!StringUtils.isEmpty(user.getActivationKey())) {
            batch.add(deleteByActivationKeyStmt.bind().setString("activation_key", user.getActivationKey()));
        }
        if (!StringUtils.isEmpty(user.getResetKey())) {
            batch.add(deleteByResetKeyStmt.bind().setString("reset_key", user.getResetKey()));
        }
        batch.add(deleteByLoginStmt.bind().setString("login", user.getLogin()));
        batch.add(deleteByEmailStmt.bind().setString("email", user.getEmail().toLowerCase()));
        session.execute(batch);
    }

    private Optional<User> findOneFromIndex(BoundStatement stmt) {
        ResultSet rs = session.execute(stmt);
        if (rs.isExhausted()) {
            return Optional.empty();
        }
        return Optional.ofNullable(rs.one().getString("id"))
            .map(id -> Optional.ofNullable(mapper.get(id)))
            .get();
    }

    public void deleteAll() {
        BoundStatement truncate = truncateStmt.bind();
        session.execute(truncate);

        BoundStatement truncateByEmail = truncateByEmailStmt.bind();
        session.execute(truncateByEmail);

        BoundStatement truncateByLogin = truncateByLoginStmt.bind();
        session.execute(truncateByLogin);

        BoundStatement truncateByResetKey = truncateByResetKeyStmt.bind();
        session.execute(truncateByResetKey);
    }
}
<%_ } _%>
