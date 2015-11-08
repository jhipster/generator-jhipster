package <%=packageName%>.repository;

import <%=packageName%>.domain.<%=entityClass%>;
<% if (databaseType == 'cassandra') { %>
import com.datastax.driver.core.*;
import com.datastax.driver.mapping.Mapper;
import com.datastax.driver.mapping.MappingManager;<% } %><% if (databaseType=='sql') { %>
import org.springframework.data.jpa.repository.*;<% if (fieldsContainOwnerManyToMany==true) { %>
import org.springframework.data.repository.query.Param;<% } %>

import java.util.List;<% } %><% if (databaseType=='mongodb') { %>
import org.springframework.data.mongodb.repository.MongoRepository;<% } %><% if (databaseType == 'cassandra') { %>
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;<% } %>

<% if (databaseType=='sql') { %>/**
 * Spring Data JPA repository for the <%= entityClass %> entity.
 */<% } %><% if (databaseType=='mongodb') { %>/**
 * Spring Data MongoDB repository for the <%= entityClass %> entity.
 */<% } %><% if (databaseType=='cassandra') { %>/**
 * Cassandra repository for the <%= entityClass %> entity.
 */<% } %><% if (databaseType=='sql' || databaseType=='mongodb') { %>
public interface <%=entityClass%>Repository extends <% if (databaseType=='sql') { %>JpaRepository<% } %><% if (databaseType=='mongodb') { %>MongoRepository<% } %><<%=entityClass%>,<%= pkType %>> {<% for (relationshipId in relationships) { %><% if (relationships[relationshipId].relationshipType == 'many-to-one' && relationships[relationshipId].otherEntityName == 'user') { %>

    @Query("select <%= entityInstance %> from <%= entityClass %> <%= entityInstance %> where <%= entityInstance %>.<%= relationships[relationshipId].relationshipFieldName %>.login = ?#{principal.username}")
    List<<%= entityClass %>> findBy<%= relationships[relationshipId].relationshipNameCapitalized %>IsCurrentUser();<% } } %>
<% if (fieldsContainOwnerManyToMany==true) { %>
    @Query("select distinct <%= entityInstance %> from <%= entityClass %> <%= entityInstance %><% for (relationshipId in relationships) {
    if (relationships[relationshipId].relationshipType == 'many-to-many' && relationships[relationshipId].ownerSide == true) { %> left join fetch <%=entityInstance%>.<%=relationships[relationshipId].relationshipFieldName%>s<%} }%>")
    List<<%=entityClass%>> findAllWithEagerRelationships();

    @Query("select <%= entityInstance %> from <%= entityClass %> <%= entityInstance %><% for (relationshipId in relationships) {
    if (relationships[relationshipId].relationshipType == 'many-to-many' && relationships[relationshipId].ownerSide == true) { %> left join fetch <%=entityInstance%>.<%=relationships[relationshipId].relationshipFieldName%>s<%} }%> where <%=entityInstance%>.id =:id")
    <%=entityClass%> findOneWithEagerRelationships(@Param("id") Long id);
<% } %>
}<% } %><% if (databaseType == 'cassandra') { %>
@Repository
public class <%= entityClass %>Repository {

    @Inject
    private Session session;

    private Mapper<<%= entityClass %>> mapper;

    private PreparedStatement findAllStmt;

    private PreparedStatement truncateStmt;

    @PostConstruct
    public void init() {
        mapper = new MappingManager(session).mapper(<%= entityClass %>.class);
        findAllStmt = session.prepare("SELECT * FROM <%= entityInstance %>");
        truncateStmt = session.prepare("TRUNCATE <%= entityInstance %>");
    }

    public List<<%= entityClass %>> findAll() {
        List<<%= entityClass %>> <%= entityInstance %>s = new ArrayList<>();
        BoundStatement stmt =  findAllStmt.bind();
        session.execute(stmt).all().stream().map(
            row -> {
                <%= entityClass %> <%= entityInstance %> = new <%= entityClass %>();
                <%= entityInstance %>.setId(row.getUUID("id"));<% for (fieldId in fields) { %><% if (fields[fieldId].fieldType == 'Integer') { %>
                <%= entityInstance %>.set<%= fields[fieldId].fieldInJavaBeanMethod %>(row.getInt("<%= fields[fieldId].fieldName %>"));<% } else if (fields[fieldId].fieldType == 'BigDecimal') { %>
                <%= entityInstance %>.set<%= fields[fieldId].fieldInJavaBeanMethod %>(row.getDecimal("<%= fields[fieldId].fieldName %>"));<% } else if (fields[fieldId].fieldType == 'Boolean') { %>
                <%= entityInstance %>.set<%= fields[fieldId].fieldInJavaBeanMethod %>(row.getBool("<%= fields[fieldId].fieldName %>"));<% } else { %>
                <%= entityInstance %>.set<%= fields[fieldId].fieldInJavaBeanMethod %>(row.get<%= fields[fieldId].fieldType %>("<%= fields[fieldId].fieldName %>"));<% } } %>
                return <%= entityInstance %>;
            }
        ).forEach(<%= entityInstance %>s::add);
        return <%= entityInstance %>s;
    }

    public <%= entityClass %> findOne(UUID id) {
        return mapper.get(id);
    }

    public <%= entityClass %> save(<%= entityClass %> <%= entityInstance %>) {
        if (<%= entityInstance %>.getId() == null) {
            <%= entityInstance %>.setId(UUID.randomUUID());
        }
        mapper.save(<%= entityInstance %>);
        return <%= entityInstance %>;
    }

    public void delete(UUID id) {
        mapper.delete(id);
    }

    public void deleteAll() {
        BoundStatement stmt =  truncateStmt.bind();
        session.execute(stmt);
    }
}<% } %>
