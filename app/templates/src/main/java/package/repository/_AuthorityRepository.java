package <%=packageName%>.repository<% if(prodDatabaseType != 'none') { %>.jpa<% } %><% if(prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>.mongodb<% } %>;

import <%=packageName%>.domain<% if(prodDatabaseType != 'none') { %>.jpa<% } %><% if(prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>.mongodb<% } %>.Authority;<% if (prodDatabaseType != 'none') { %>
import org.springframework.data.jpa.repository.JpaRepository;<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
import org.springframework.data.mongodb.repository.MongoRepository;<% } %>

<% if (prodDatabaseType != 'none') { %>/**
 * Spring Data JPA repository for the Authority entity.
 */<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>/**
 * Spring Data MongoDB repository for the Authority entity.
 */<% } %>
public interface AuthorityRepository extends <% if (prodDatabaseType != 'none') { %>JpaRepository<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>MongoRepository<% } %><Authority, String> {
}
