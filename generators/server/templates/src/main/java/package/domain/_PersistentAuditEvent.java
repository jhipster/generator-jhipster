package <%=packageName%>.domain;
<% if (databaseType == 'mongodb') { %>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;<% } %>

import java.io.Serializable;
import java.time.LocalDateTime;<% if (databaseType == 'sql') { %>
import javax.persistence.*;<% } %>
import javax.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.Map;

/**
 * Persist AuditEvent managed by the Spring Boot actuator
 * @see org.springframework.boot.actuate.audit.AuditEvent
 */<% if (databaseType == 'sql') { %>
@Entity
@Table(name = "jhi_persistent_audit_event")<% } %><% if (databaseType == 'mongodb') { %>
@Document(collection = "jhi_persistent_audit_event")<% } %>
public class PersistentAuditEvent implements Serializable {

    @Id<% if (databaseType == 'sql') { %>
    <%_ if (prodDatabaseType == 'mysql' || prodDatabaseType == 'mariadb') { _%>
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    <%_ }  else { _%>
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    <%_ } _%>
    @Column(name = "event_id")
    private Long id;<% } else { %>
    @Field("event_id")
    private String id;<% } %>

    @NotNull<% if (databaseType == 'sql') { %>
    @Column(nullable = false)<% } %>
    private String principal;
<% if (databaseType == 'sql') { %>
    @Column(name = "event_date")<% } %>
    private LocalDateTime auditEventDate;<% if (databaseType == 'sql') { %>
    @Column(name = "event_type")<% } %><% if (databaseType == 'mongodb') { %>
    @Field("event_type")<% } %>
    private String auditEventType;
<% if (databaseType == 'sql') { %>
    @ElementCollection
    @MapKeyColumn(name = "name")
    @Column(name = "value")
    @CollectionTable(name = "jhi_persistent_audit_evt_data", joinColumns=@JoinColumn(name="event_id"))<% } %>
    private Map<String, String> data = new HashMap<>();
<% if (databaseType == 'sql') { %>
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

    public LocalDateTime getAuditEventDate() {
        return auditEventDate;
    }

    public void setAuditEventDate(LocalDateTime auditEventDate) {
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
