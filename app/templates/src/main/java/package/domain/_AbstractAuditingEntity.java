package <%=packageName%>.domain;
<% if (databaseType == 'sql') { %>
import javax.persistence.EntityListeners;
import javax.persistence.MappedSuperclass;<% } %>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;<% if (databaseType == 'sql') { %>
import org.hibernate.envers.Audited;<% } %>
import org.joda.time.DateTime;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;<% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.domain.support.AuditingEntityListener;<% } %>

/**
 * Base abstract class for entities which will hold definitions for created, last modified by and created,
 * last modified by date.
 */<% if (databaseType == 'sql') { %>
@MappedSuperclass
@Audited
@EntityListeners(AuditingEntityListener.class)<% } %>
public abstract class AbstractAuditingEntity extends AbstractEntity {
	
	private static final long serialVersionUID = <%= Math.floor(Math.random() * 0x10000000000000) %>L;
	
    @CreatedBy
    @NotNull
    @Size(min=2, max=50)
    private String createdBy;

    @CreatedDate
    @NotNull
    private DateTime createdDate = DateTime.now();

    @LastModifiedBy
    @Size(min=2, max=50)
    private String lastModifiedBy;

    @LastModifiedDate
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
