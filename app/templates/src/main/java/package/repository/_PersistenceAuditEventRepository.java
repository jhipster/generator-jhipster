package <%=packageName%>.repository;

import <%=packageName%>.domain.PersistentAuditEvent;
import org.joda.time.LocalDateTime;<% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;<% } %><% if (databaseType == 'nosql') { %>
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;<% } %>

import java.util.List;

<% if (databaseType == 'sql') { %>/**
 * Spring Data JPA repository for the PersistentAuditEvent entity.
 */<% } %><% if (databaseType == 'nosql') { %>/**
 * Spring Data MongoDB repository for the PersistentAuditEvent entity.
 */<% } %>
 public interface PersistenceAuditEventRepository extends <% if (databaseType == 'sql') { %>JpaRepository<% } %><% if (databaseType == 'nosql') { %>MongoRepository<% } %><PersistentAuditEvent, String> {

    List<PersistentAuditEvent> findByPrincipal(String principal);

    List<PersistentAuditEvent> findByPrincipalAndAuditEventDateGreaterThan(String principal, LocalDateTime after);
    <% if (databaseType == 'sql') { %>
    @Query("select p from PersistentAuditEvent p where p.auditEventDate >= ?1 and p.auditEventDate <= ?2")<% } %><% if (databaseType == 'nosql') { %>
    @Query("{auditEventDate: {$gt: ?0, $lte: ?1}}")<% } %>
    List<PersistentAuditEvent> findByDates(LocalDateTime fromDate, LocalDateTime toDate);
}
