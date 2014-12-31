package <%=packageName%>.domain;

<% if (databaseType == 'sql') { %>import org.hibernate.annotations.Type;
import org.hibernate.envers.Audited;<% } %>
import org.joda.time.DateTime;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
<% if (databaseType == 'mongodb') { %>import org.springframework.data.mongodb.core.mapping.Field;
<% } %><% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import javax.persistence.Column;
import javax.persistence.EntityListeners;
import javax.persistence.MappedSuperclass;<% } %>
import javax.validation.constraints.NotNull;

/**
 * Base abstract class for entities which will hold definitions for created, last modified by and created,
 * last modified by date.
 */<% if (databaseType == 'sql') { %>
@MappedSuperclass
@Audited
@EntityListeners(AuditingEntityListener.class)<% } %>
public abstract class AbstractAuditingEntity {

    @CreatedBy<% if (databaseType == 'sql') { %>
    @NotNull
    @Column(name = "created_by", nullable = false, length = 50, updatable = false)<% } %><% if (databaseType == 'mongodb') { %>
    @Field("created_by")<% } %>
    private String createdBy;

    @CreatedDate<% if (databaseType == 'sql') { %>
    @NotNull
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @Column(name = "created_date", nullable = false)<% } %><% if (databaseType == 'mongodb') { %>
    @Field("created_date")<% } %>
    private DateTime createdDate = DateTime.now();

    @LastModifiedBy<% if (databaseType == 'sql') { %>
    @Column(name = "last_modified_by", length = 50)<% } %><% if (databaseType == 'mongodb') { %>
    @Field("last_modified_by")<% } %>
    private String lastModifiedBy;

    @LastModifiedDate<% if (databaseType == 'sql') { %>
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @Column(name = "last_modified_date")<% } %><% if (databaseType == 'mongodb') { %>
    @Field("last_modified_date  ")<% } %>
    private DateTime lastModifiedDate = DateTime.now();

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public DateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(DateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public DateTime getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(DateTime lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }
}
