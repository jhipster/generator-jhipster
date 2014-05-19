package <%=packageName%>.repository<% if(prodDatabaseType != 'none') { %>.jpa<% } %><% if(prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>.mongodb<% } %>;

import <%=packageName%>.domain<% if(prodDatabaseType != 'none') { %>.jpa<% } %><% if(prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>.mongodb<% } %>.PersistentAuditEvent;
import org.joda.time.LocalDateTime;<% if (prodDatabaseType != 'none') { %>
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;<% } %>

import java.util.List;

<% if (prodDatabaseType != 'none') { %>/**
 * Spring Data JPA repository for the PersistentAuditEvent entity.
 */<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>/**
 * Spring Data MongoDB repository for the PersistentAuditEvent entity.
 */<% } %>
 public interface PersistenceAuditEventRepository extends <% if (prodDatabaseType != 'none') { %>JpaRepository<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>MongoRepository<% } %><PersistentAuditEvent, String> {

    List<PersistentAuditEvent> findByPrincipal(String principal);

    List<PersistentAuditEvent> findByPrincipalAndAuditEventDateGreaterThan(String principal, LocalDateTime after);
    <% if (prodDatabaseType != 'none') { %>
    @Query("select p from PersistentAuditEvent p where p.auditEventDate >= ?1 and p.auditEventDate <= ?2")<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
    @Query("{auditEventDate: {$gt: ?0, $lte: ?1}}")<% } %>
    List<PersistentAuditEvent> findByDates(LocalDateTime fromDate, LocalDateTime toDate);
}