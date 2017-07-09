<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
package <%=packageName%>.domain;
<%_ if (databaseType === 'mongodb') { _%>

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
<%_ } else if (databaseType === 'sql') { _%>

import javax.persistence.*;
<%_ } _%>
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Persist AuditEvent managed by the Spring Boot actuator
 * @see org.springframework.boot.actuate.audit.AuditEvent
 */<% if (databaseType === 'sql') { %>
@Entity
@Table(name = "jhi_persistent_audit_event")<% } %><% if (databaseType === 'mongodb') { %>
@Document(collection = "jhi_persistent_audit_event")<% } %>
public class PersistentAuditEvent implements Serializable {

    @Id<% if (databaseType === 'sql') { %>
    <%_ if (prodDatabaseType === 'mysql' || prodDatabaseType === 'mariadb') { _%>
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    <%_ }  else { _%>
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    <%_ } _%>
    @Column(name = "event_id")
    private Long id;<% } else { %>
    @Field("event_id")
    private String id;<% } %>

    @NotNull<% if (databaseType === 'sql') { %>
    @Column(nullable = false)<% } %>
    private String principal;
<% if (databaseType === 'sql') { %>
    @Column(name = "event_date")<% } %>
    private Instant auditEventDate;<% if (databaseType === 'sql') { %>
    @Column(name = "event_type")<% } %><% if (databaseType === 'mongodb') { %>
    @Field("event_type")<% } %>
    private String auditEventType;
<% if (databaseType === 'sql') { %>
    @ElementCollection
    @MapKeyColumn(name = "name")
    @Column(name = "value")
    @CollectionTable(name = "jhi_persistent_audit_evt_data", joinColumns=@JoinColumn(name="event_id"))<% } %>
    private Map<String, String> data = new HashMap<>();
<% if (databaseType === 'sql') { %>
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }<% } else { %>
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }<% } %>

    public String getPrincipal() {
        return principal;
    }

    public void setPrincipal(String principal) {
        this.principal = principal;
    }

    public Instant getAuditEventDate() {
        return auditEventDate;
    }

    public void setAuditEventDate(Instant auditEventDate) {
        this.auditEventDate = auditEventDate;
    }

    public String getAuditEventType() {
        return auditEventType;
    }

    public void setAuditEventType(String auditEventType) {
        this.auditEventType = auditEventType;
    }

    public Map<String, String> getData() {
        return data;
    }

    public void setData(Map<String, String> data) {
        this.data = data;
    }
}
