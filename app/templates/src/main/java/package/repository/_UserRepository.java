package <%=packageName%>.repository;

import <%=packageName%>.domain.User;

import org.joda.time.DateTime;<% if (databaseType == 'sql') { %><% if (javaVersion == '8') { %>
import org.springframework.data.repository.Repository;
import java.util.Optional;<% } else {%>
import org.springframework.data.jpa.repository.JpaRepository;<%}%>
import org.springframework.data.jpa.repository.Query;<% } %><% if (databaseType == 'nosql') { %>
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;<% } %>

import java.util.List;<% if (javaVersion == '8') { %>
import java.util.Optional;<%}%>

<% if (databaseType == 'sql') { %>/**
 * Spring Data JPA repository for the User entity.
 */<% } %><% if (databaseType == 'nosql') { %>/**
 * Spring Data MongoDB repository for the User entity.
 */<% } %><% if (javaVersion == '8') { %>
public interface UserRepository extends <% if (databaseType == 'sql') { %>Repository<% } %><% if (databaseType == 'nosql') { %>MongoRepository<% } %><User, String> {

    Optional<User> findOneByActivationKey(String activationKey);

    List<User> findAllByActivatedIsFalseAndCreatedDateBefore(DateTime dateTime);

    Optional<User> findOneByEmail(String email);

    Optional<User> findOneByLogin(String login);

    Optional<User> save(User t);

    void delete(User t);

}<% } else { %>
public interface UserRepository extends <% if (databaseType == 'sql') { %>JpaRepository<% } %><% if (databaseType == 'nosql') { %>MongoRepository<% } %><User, String> {

    User findOneByActivationKey(String activationKey);

    List<User> findAllByActivatedIsFalseAndCreatedDateBefore(DateTime dateTime);

    User findOneByLogin(String login);

    User findOneByEmail(String email);

}<% } %>
