package <%=packageName%>.domain<% if(prodDatabaseType != 'none') { %>.jpa<% } %><% if(prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>.mongodb<% } %>;

<% if (prodDatabaseType != 'none') { %>import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.annotations.Type;<% } %>
import org.joda.time.LocalDateTime;<% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;<% } %><% if (prodDatabaseType != 'none') { %>
import javax.persistence.*;<% } %>
import javax.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.Map;

/**
 * Persist AuditEvent managed by the Spring Boot actuator
 * @see org.springframework.boot.actuate.audit.AuditEvent
 */

<% if (prodDatabaseType != 'none') { %>@Entity
@Table(name = "T_PERSISTENT_AUDIT_EVENT")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
@Document(collection = "T_PERSISTENT_AUDIT_EVENT")<% } %>
public class PersistentAuditEvent  {
    <% if (prodDatabaseType != 'none') { %>
    @Id
    @GeneratedValue(strategy = GenerationType.TABLE)
    @Column(name = "event_id")<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
    @Field("event_id")<% } %>
    private long id;

    @NotNull
    private String principal;

    <% if (prodDatabaseType != 'none') { %>@Column(name = "event_date")
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentLocalDateTime")<% } %>
    private LocalDateTime auditEventDate;
    <% if (prodDatabaseType != 'none') { %>
    @Column(name = "event_type")<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
    @Field("event_type")<% } %>
    private String auditEventType;

    <% if (prodDatabaseType != 'none') { %>@ElementCollection
    @MapKeyColumn(name="name")
    @Column(name="value")
    @CollectionTable(name="T_PERSISTENT_AUDIT_EVENT_DATA", joinColumns=@JoinColumn(name="event_id"))<% } %>
    private Map<String, String> data = new HashMap<>();

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

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
