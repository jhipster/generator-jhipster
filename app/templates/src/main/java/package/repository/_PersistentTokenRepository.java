package <%=packageName%>.repository<% if(prodDatabaseType != 'none') { %>.jpa<% } %><% if(prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>.mongodb<% } %>;

import <%=packageName%>.domain<% if(prodDatabaseType != 'none') { %>.jpa<% } %><% if(prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>.mongodb<% } %>.PersistentToken;
import <%=packageName%>.domain<% if(prodDatabaseType != 'none') { %>.jpa<% } %><% if(prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>.mongodb<% } %>.User;
import org.joda.time.LocalDate;<% if (prodDatabaseType != 'none') { %>
import org.springframework.data.jpa.repository.JpaRepository;<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
import org.springframework.data.mongodb.repository.MongoRepository;<% } %>

import java.util.List;

<% if (prodDatabaseType != 'none') { %>/**
 * Spring Data JPA repository for the PersistentToken entity.
 */<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>/**
 * Spring Data MongoDB repository for the PersistentToken entity.
 */<% } %>
public interface PersistentTokenRepository extends <% if (prodDatabaseType != 'none') { %>JpaRepository<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>MongoRepository<% } %><PersistentToken, String> {

    List<PersistentToken> findByUser(User user);

    List<PersistentToken> findByTokenDateBefore(LocalDate localDate);

}
