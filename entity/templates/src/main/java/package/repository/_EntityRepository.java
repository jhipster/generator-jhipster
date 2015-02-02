package <%=packageName%>.repository;

import <%=packageName%>.domain.<%=entityClass%>;<%if(databaseType=='sql'){%>
import org.springframework.data.jpa.repository.JpaRepository;<%if(fieldsContainOwnerManyToMany==true){%>
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;<%}}%><%if(databaseType=='mongodb'){%>
import org.springframework.data.mongodb.repository.MongoRepository;<%}%><% if (primaryKeyField.fieldType == 'LocalDate') { %>
import org.joda.time.LocalDate;<% } %><% if (primaryKeyField.fieldType == 'DateTime') { %>
import org.joda.time.DateTime;<% } %><% if (primaryKeyField.fieldType == 'BigDecimal') { %>
import java.math.BigDecimal;<% } %>
<% if (databaseType=='sql') { %>/**
 * Spring Data JPA repository for the <%= entityClass %> entity.
 */<% } %><% if (databaseType=='mongodb') { %>/**
 * Spring Data MongoDB repository for the <%= entityClass %> entity.
 */<% } %>

public interface <%=entityClass%>Repository extends <% if (databaseType=='sql') { %>JpaRepository<% } %><% if (databaseType=='mongodb') { %>MongoRepository<% } %><<%= entityClass %>, <% if (databaseType=='sql') { %><%= primaryKeyField.fieldType %><% } %><% if (databaseType=='mongodb') { %>String<% } %>> {
<% if (fieldsContainOwnerManyToMany == true) { %>
    @Query("select <%= entityInstance %> from <%= entityClass %> <%= entityInstance %> <% for (relationshipId in relationships) {
        if (relationships[relationshipId].relationshipType == 'many-to-many' && relationships[relationshipId].ownerSide == true) { %>left join fetch <%= entityInstance %>.<%= relationships[relationshipId].otherEntityName %>s <% } } %>where <%= entityInstance %>.<%= primaryKeyField.fieldName %> = :<%= primaryKeyField.fieldName %>")
    <%= entityClass %> findOneWithEagerRelationships(@Param("<%= primaryKeyField.fieldName %>") <%= primaryKeyField.fieldType %> <%= primaryKeyField.fieldName %>);
<% } %>
}
