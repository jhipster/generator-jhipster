package <%=packageName%>.repository;

import <%=packageName%>.domain.PersistentToken;
import <%=packageName%>.domain.User;
import org.joda.time.LocalDate;<% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.repository.JpaRepository;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.data.mongodb.repository.MongoRepository;<% } %>

import java.util.List;

<% if (databaseType == 'sql') { %>/**
 * Spring Data JPA repository for the PersistentToken entity.
 */<% } %><% if (databaseType == 'mongodb') { %>/**
 * Spring Data MongoDB repository for the PersistentToken entity.
 */<% } %>
public interface PersistentTokenRepository extends <% if (databaseType == 'sql') { %>JpaRepository<% } %><% if (databaseType == 'mongodb') { %>MongoRepository<% } %><PersistentToken, String> {

    List<PersistentToken> findByUser(User user);

    List<PersistentToken> findByTokenDateBefore(LocalDate localDate);

}
