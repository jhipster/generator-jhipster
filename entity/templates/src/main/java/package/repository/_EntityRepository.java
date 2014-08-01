package <%=packageName%>.repository;

import <%=packageName%>.domain.<%= entityClass %>;<% if (databaseType == 'sql') { %>
        import org.springframework.data.jpa.repository.JpaRepository;<% } %><% if (databaseType == 'nosql') { %>
        import org.springframework.data.mongodb.repository.MongoRepository;<% } %>

<% if (databaseType == 'sql') { %>/**
 * Spring Data JPA repository for the <%= entityClass %> entity.
 */<% } %><% if (databaseType == 'nosql') { %>/**
 * Spring Data MongoDB repository for the <%= entityClass %> entity.
 */<% } %>
public interface <%= entityClass %>Repository extends <% if (databaseType == 'sql') { %>JpaRepository<% } %><% if (databaseType == 'nosql') { %>MongoRepository<% } %><<%= entityClass %>, <%= primaryKeyAsObjectType %>> {

}
