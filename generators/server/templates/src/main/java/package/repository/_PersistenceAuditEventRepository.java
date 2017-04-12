<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.repository;

import <%=packageName%>.domain.PersistentAuditEvent;

import java.time.LocalDateTime;<% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.repository.JpaRepository;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.data.mongodb.repository.MongoRepository;<% } %>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

<% if (databaseType == 'sql') { %>/**
 * Spring Data JPA repository for the PersistentAuditEvent entity.
 */<% } %><% if (databaseType == 'mongodb') { %>/**
 * Spring Data MongoDB repository for the PersistentAuditEvent entity.
 */<% } %>
public interface PersistenceAuditEventRepository extends <% if (databaseType == 'sql') { %>JpaRepository<PersistentAuditEvent, Long><% } %><% if (databaseType == 'mongodb') { %>MongoRepository<PersistentAuditEvent, String><% } %> {

    List<PersistentAuditEvent> findByPrincipal(String principal);

    List<PersistentAuditEvent> findByAuditEventDateAfter(LocalDateTime after);

    List<PersistentAuditEvent> findByPrincipalAndAuditEventDateAfter(String principal, LocalDateTime after);

    List<PersistentAuditEvent> findByPrincipalAndAuditEventDateAfterAndAuditEventType(String principle, LocalDateTime after, String type);

    Page<PersistentAuditEvent> findAllByAuditEventDateBetween(LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable);
}
