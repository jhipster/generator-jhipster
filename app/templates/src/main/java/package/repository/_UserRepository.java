package <%=packageName%>.repository;

import <%=packageName%>.domain.User;

import org.joda.time.DateTime;<% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.repository.JpaRepository;<% if (javaVersion == '8') { %>
import java.util.Optional;<% } %>
import org.springframework.data.jpa.repository.Query;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.data.mongodb.repository.MongoRepository;<% } %>

import java.util.List;<% if (javaVersion == '8') { %>
import java.util.Optional;<%}%>

<% if (databaseType == 'sql') { %>/**
 * Spring Data JPA repository for the User entity.
 */<% } %><% if (databaseType == 'mongodb') { %>/**
 * Spring Data MongoDB repository for the User entity.
 */<% } %><% if (javaVersion == '8') { %>
public interface UserRepository extends <% if (databaseType == 'sql') { %>JpaRepository<User, Long><% } %><% if (databaseType == 'mongodb') { %>MongoRepository<User, String><% } %> {

    Optional<User> findOneByActivationKey(String activationKey);

    List<User> findAllByActivatedIsFalseAndCreatedDateBefore(DateTime dateTime);

    Optional<User> findOneByEmail(String email);

    Optional<User> findOneByLogin(String login);

    void delete(User t);

}<% } else { %>
public interface UserRepository extends <% if (databaseType == 'sql') { %>JpaRepository<User, Long><% } %><% if (databaseType == 'mongodb') { %>MongoRepository<User, String><% } %> {

    User findOneByActivationKey(String activationKey);

    List<User> findAllByActivatedIsFalseAndCreatedDateBefore(DateTime dateTime);

    User findOneByLogin(String login);

    User findOneByEmail(String email);

}<% } %>
