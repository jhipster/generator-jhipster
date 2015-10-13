package <%=packageName%>.repository;

import <%=packageName%>.domain.PersistentAuditEvent;

import java.time.LocalDateTime;<% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.repository.JpaRepository;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.data.mongodb.repository.MongoRepository;<% } %>

import java.util.List;

<% if (databaseType == 'sql') { %>/**
 * Spring Data JPA repository for the PersistentAuditEvent entity.
 */<% } %><% if (databaseType == 'mongodb') { %>/**
 * Spring Data MongoDB repository for the PersistentAuditEvent entity.
 */<% } %>
public interface PersistenceAuditEventRepository extends <% if (databaseType == 'sql') { %>JpaRepository<PersistentAuditEvent, Long><% } %><% if (databaseType == 'mongodb') { %>MongoRepository<PersistentAuditEvent, String><% } %> {

    List<PersistentAuditEvent> findByPrincipal(String principal);

    List<PersistentAuditEvent> findByPrincipalAndAuditEventDateAfter(String principal, LocalDateTime after);

    List<PersistentAuditEvent> findAllByAuditEventDateBetween(LocalDateTime fromDate, LocalDateTime toDate);
}
