package <%=packageName%>.repository.<%= entityType%>;

import <%=packageName%>.domain.<%= entityType%>.<%= entityClass %>;<% if (entityType == 'jpa') { %>
        import org.springframework.data.jpa.repository.JpaRepository;<% } %><% if (entityType == 'mongodb') { %>
        import org.springframework.data.mongodb.repository.MongoRepository;<% } %>

<% if (entityType == 'jpa') { %>/**
 * Spring Data JPA repository for the <%= entityClass %> entity.
 */<% } %><% if (entityType == 'mongodb') { %>/**
 * Spring Data MongoDB repository for the <%= entityClass %> entity.
 */<% } %>
public interface <%= entityClass %>Repository extends <% if (entityType == 'jpa') { %>JpaRepository<% } %><% if (entityType == 'mongodb') { %>MongoRepository<% } %><<%= entityClass %>, <% if (entityType == 'jpa') { %>Long<% } %><% if (entityType == 'mongodb') { %>Long<% } %>> {

}
