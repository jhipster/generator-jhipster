package <%=packageName%>.repository;

import <%=packageName%>.domain.User;

import org.joda.time.DateTime;
<% if (databaseType == 'sql') { %>
<% if (javaVersion == '8') { %>
import org.springframework.data.repository.Repository;
    import java.util.Optional;
<% } else {%>
    import org.springframework.data.jpa.repository.JpaRepository;
<%}%>
import org.springframework.data.jpa.repository.Query;<% } %>
<% if (databaseType == 'nosql') { %>
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
 <% } %>


import java.util.List;
<% if (javaVersion == '8') { %>
    import java.util.Optional;
<%}%>

<% if (databaseType == 'sql') { %>/**
 * Spring Data JPA repository for the User entity.
 */<% } %><% if (databaseType == 'nosql') { %>/**
 * Spring Data MongoDB repository for the User entity.
 */<% } %>


<% if (javaVersion == '8') { %>
    public interface UserRepository extends <% if (databaseType == 'sql') { %>Repository<% } %><% if (databaseType == 'nosql') { %>Repository<% } %><User, String> {
    <% if (databaseType == 'sql') { %>
    @Query("select u from User u where u.activationKey = ?1")<% } %><% if (databaseType == 'nosql') { %>
    @Query("{activationKey: ?0}")<% } %>
    Optional<User> getUserByActivationKey(String activationKey);
    <% if (databaseType == 'sql') { %>
    @Query("select u from User u where u.activated = false and u.createdDate > ?1")<% } %><% if (databaseType == 'nosql') { %>
    @Query("{activation_key: 'false', createdDate: {$gt: ?0}}")<% } %>
    List<User> findNotActivatedUsersByCreationDateBefore(DateTime dateTime);


    Optional<User> findOneByEmail(String email);

    Optional<User> findOne(String id);

    Optional<User> findByLastName(String lastname);

    User save(User t);

    void delete(User t);

    }
<% } else { %>
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

<% } %>
