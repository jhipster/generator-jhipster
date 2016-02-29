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
public interface <%=entityClass%>Repository extends <% if (databaseType=='sql') { %>JpaRepository<% } %><% if (databaseType=='mongodb') { %>MongoRepository<% } %><<%=entityClass%>,<%= pkType %>> {<% for (idx in relationships) { %><% if (relationships[idx].relationshipType == 'many-to-one' && relationships[idx].otherEntityName == 'user') { %>

    @Query("select <%= entityInstance %> from <%= entityClass %> <%= entityInstance %> where <%= entityInstance %>.<%= relationships[idx].relationshipFieldName %>.login = ?#{principal.username}")
    List<<%= entityClass %>> findBy<%= relationships[idx].relationshipNameCapitalized %>IsCurrentUser();<% } } %>
<% if (fieldsContainOwnerManyToMany==true) { %>
    @Query("select distinct <%= entityInstance %> from <%= entityClass %> <%= entityInstance %><% for (idx in relationships) {
    if (relationships[idx].relationshipType == 'many-to-many' && relationships[idx].ownerSide == true) { %> left join fetch <%=entityInstance%>.<%=relationships[idx].relationshipFieldName%>s<%} }%>")
    List<<%=entityClass%>> findAllWithEagerRelationships();

    @Query("select <%= entityInstance %> from <%= entityClass %> <%= entityInstance %><% for (idx in relationships) {
    if (relationships[idx].relationshipType == 'many-to-many' && relationships[idx].ownerSide == true) { %> left join fetch <%=entityInstance%>.<%=relationships[idx].relationshipFieldName%>s<%} }%> where <%=entityInstance%>.id =:id")
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
        List<<%= entityClass %>> <%= entityInstancePlural %> = new ArrayList<>();
        BoundStatement stmt =  findAllStmt.bind();
        session.execute(stmt).all().stream().map(
            row -> {
                <%= entityClass %> <%= entityInstance %> = new <%= entityClass %>();
                <%= entityInstance %>.setId(row.getUUID("id"));<%
                for (idx in fields) {
                    var fieldInJavaBeanMethod = fields[idx].fieldInJavaBeanMethod;
                    var fieldName = fields[idx].fieldName;
                    if (fields[idx].fieldType == 'Integer') { %>
                <%= entityInstance %>.set<%= fieldInJavaBeanMethod %>(row.getInt("<%= fieldName %>"));<% } else if (fields[idx].fieldType == 'BigDecimal') { %>
                <%= entityInstance %>.set<%= fieldInJavaBeanMethod %>(row.getDecimal("<%= fieldName %>"));<% } else if (fields[idx].fieldType == 'Boolean') { %>
                <%= entityInstance %>.set<%= fieldInJavaBeanMethod %>(row.getBool("<%= fieldName %>"));<% } else if (fields[idx].fieldType == 'Text') { %>
                <%= entityInstance %>.set<%= fieldInJavaBeanMethod %>(row.getString("<%= fieldName %>"));<% } else { %>
                <%= entityInstance %>.set<%= fieldInJavaBeanMethod %>(row.get<%= fields[idx].fieldType %>("<%= fieldName %>"));<% } } %>
                return <%= entityInstance %>;
            }
        ).forEach(<%= entityInstancePlural %>::add);
        return <%= entityInstancePlural %>;
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
