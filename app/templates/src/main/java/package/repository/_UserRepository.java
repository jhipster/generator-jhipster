package <%=packageName%>.repository;

import <%=packageName%>.domain.User;
import org.joda.time.DateTime;<% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.repository.JpaRepository;<% } %><% if (databaseType == 'nosql') { %>
import org.springframework.data.mongodb.repository.MongoRepository;<% } %>

import java.util.List;
<% if (javaVersion == '8') { %>
    import java.util.Optional;
<%}%>

<% if (databaseType == 'sql') { %>/**
 * Spring Data JPA repository for the User entity.
 */<% } %><% if (databaseType == 'nosql') { %>/**
 * Spring Data MongoDB repository for the User entity.
 */<% } %>
public interface UserRepository extends <% if (databaseType == 'sql') { %>JpaRepository<% } %><% if (databaseType == 'nosql') { %>MongoRepository<% } %><User, String> {

<% if (javaVersion == '8') { %>
    Optional<User> findOneByActivationKey(String activationKey);
<%} else {%>
    User findOneByActivationKey(String activationKey);
    <%}%>

    List<User> findAllByActivatedIsFalseAndCreatedDateBefore(DateTime dateTime);

    User findOneByLogin(String login);

    User findOneByEmail(String email);
}
