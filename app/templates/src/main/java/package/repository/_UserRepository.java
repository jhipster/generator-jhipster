package <%=packageName%>.repository;

import <%=packageName%>.domain.User;
import org.joda.time.DateTime;<% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;<% } %><% if (databaseType == 'nosql') { %>
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;<% } %>

import java.util.List;

<% if (databaseType == 'sql') { %>/**
 * Spring Data JPA repository for the User entity.
 */<% } %><% if (databaseType == 'nosql') { %>/**
 * Spring Data MongoDB repository for the User entity.
 */<% } %>
public interface UserRepository extends <% if (databaseType == 'sql') { %>JpaRepository<% } %><% if (databaseType == 'nosql') { %>MongoRepository<% } %><User, String> {
    <% if (databaseType == 'sql') { %>
    @Query("select u from User u where u.activationKey = ?1")<% } %><% if (databaseType == 'nosql') { %>
    @Query("{activationKey: ?0}")<% } %>
    User getUserByActivationKey(String activationKey);
    <% if (databaseType == 'sql') { %>
    @Query("select u from User u where u.activated = false and u.createdDate > ?1")<% } %><% if (databaseType == 'nosql') { %>
    @Query("{activation_key: 'false', createdDate: {$gt: ?0}}")<% } %>
    List<User> findNotActivatedUsersByCreationDateBefore(DateTime dateTime);

    User findOneByEmail(String email);
}
