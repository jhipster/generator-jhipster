package <%=packageName%>.repository;
<% if (databaseType == 'cassandra') { %>
import com.datastax.driver.core.*;
import com.datastax.driver.mapping.Mapper;
import com.datastax.driver.mapping.MappingManager;<% } %>
import <%=packageName%>.domain.User;

import org.joda.time.DateTime;<% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.repository.JpaRepository;<% if (javaVersion == '8') { %>
import java.util.Optional;<% } %>
import org.springframework.data.jpa.repository.Query;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.data.mongodb.repository.MongoRepository;<% } %>

import java.util.List;<% if (javaVersion == '8') { %>
import java.util.Optional;<%}%><% if (databaseType == 'cassandra') { %>
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;<%}%>

<% if (databaseType == 'sql') { %>/**
 * Spring Data JPA repository for the User entity.
 */<% } %><% if (databaseType == 'mongodb') { %>/**
 * Spring Data MongoDB repository for the User entity.
 */<% } %><% if (databaseType == 'cassandra') { %>/**
 * Cassandra repository for the User entity.
 */<% } %><% if ((databaseType == 'sql' || databaseType == 'mongodb') && javaVersion == '8') { %>
public interface UserRepository extends <% if (databaseType == 'sql') { %>JpaRepository<User, Long><% } %><% if (databaseType == 'mongodb') { %>MongoRepository<User, String><% } %> {

    Optional<User> findOneByActivationKey(String activationKey);

    List<User> findAllByActivatedIsFalseAndCreatedDateBefore(DateTime dateTime);

    Optional<User> findOneByEmail(String email);

    Optional<User> findOneByLogin(String login);

    void delete(User t);

}<% } else if ((databaseType == 'sql' || databaseType == 'mongodb') && javaVersion == '7') { %>
public interface UserRepository extends <% if (databaseType == 'sql') { %>JpaRepository<User, Long><% } %><% if (databaseType == 'mongodb') { %>MongoRepository<User, String><% } %> {

    User findOneByActivationKey(String activationKey);

    List<User> findAllByActivatedIsFalseAndCreatedDateBefore(DateTime dateTime);

    User findOneByLogin(String login);

    User findOneByEmail(String email);

}<% } else if (databaseType == 'cassandra') { %>
@Repository
public class UserRepository {

    @Inject
    private Session session;

    private Mapper<User> mapper;

    private PreparedStatement findAllStmt;

    private PreparedStatement findOneByActivationKeyStmt;

    private PreparedStatement insertByActivationKeyStmt;

    private PreparedStatement deleteByActivationKeyStmt;

    private PreparedStatement findOneByLoginStmt;

    private PreparedStatement insertByLoginStmt;

    private PreparedStatement deleteByLoginStmt;

    private PreparedStatement findOneByEmailStmt;

    private PreparedStatement insertByEmailStmt;

    private PreparedStatement deleteByEmailStmt;

    @PostConstruct
    public void init() {
        mapper = new MappingManager(session).mapper(User.class);

        findAllStmt = session.prepare("SELECT * FROM user");

        findOneByActivationKeyStmt = session.prepare(
            "SELECT id " +
            "FROM user_by_activation_key " +
            "WHERE activation_key = :activation_key");

        insertByActivationKeyStmt = session.prepare(
            "INSERT INTO user_by_activation_key (activation_key, id) " +
            "VALUES (:activation_key, :id)");

        deleteByActivationKeyStmt = session.prepare(
            "DELETE FROM user_by_activation_key " +
            "WHERE activation_key = :activation_key");

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
    }

    public Optional<User> findOneByActivationKey(String activationKey) {
        BoundStatement stmt = findOneByActivationKeyStmt.bind();
        stmt.setString("activation_key", activationKey);
        return findOneFromIndex(stmt);
    }

    public Optional<User> findOneByEmail(String email) {
        BoundStatement stmt = findOneByEmailStmt.bind();
        stmt.setString("email", email);
        return findOneFromIndex(stmt);
    }

    public Optional<User> findOneByLogin(String login) {
        BoundStatement stmt = findOneByLoginStmt.bind();
        stmt.setString("login", login);
        return findOneFromIndex(stmt);
    }

    public List<User> findAll() {
        return mapper.map(session.execute(findAllStmt.bind())).all();
    }

    public void save(User user) {
        User oldUser = mapper.get(user.getId());
        if (oldUser != null) {
            if (!StringUtils.isEmpty(oldUser.getActivationKey()) && !oldUser.getActivationKey().equals(user.getActivationKey())) {
                session.execute(deleteByActivationKeyStmt.bind().setString("activation_key", oldUser.getActivationKey()));
            }
            if (!StringUtils.isEmpty(oldUser.getLogin()) && !oldUser.getLogin().equals(user.getLogin())) {
                session.execute(deleteByLoginStmt.bind().setString("login", oldUser.getLogin()));
            }
            if (!StringUtils.isEmpty(oldUser.getEmail()) && !oldUser.getEmail().equals(user.getEmail())) {
                session.execute(deleteByEmailStmt.bind().setString("email", oldUser.getEmail()));
            }
        }
        BatchStatement batch = new BatchStatement();
        batch.add(mapper.saveQuery(user));
        if (!StringUtils.isEmpty(user.getActivationKey())) {
            batch.add(insertByActivationKeyStmt.bind()
                .setString("activation_key", user.getActivationKey())
                .setString("id", user.getId()));
        }
        batch.add(insertByLoginStmt.bind()
            .setString("login", user.getLogin())
            .setString("id", user.getId()));
        batch.add(insertByEmailStmt.bind()
            .setString("email", user.getEmail())
            .setString("id", user.getId()));
        session.execute(batch);
    }

    public void delete(User user) {
        BatchStatement batch = new BatchStatement();
        batch.add(mapper.deleteQuery(user));
        if (!StringUtils.isEmpty(user.getActivationKey())) {
            batch.add(deleteByActivationKeyStmt.bind().setString("activation_key", user.getActivationKey()));
        }
        batch.add(deleteByLoginStmt.bind().setString("login", user.getLogin()));
        batch.add(deleteByEmailStmt.bind().setString("email", user.getEmail()));
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
}<% } %>
