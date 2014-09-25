package <%=packageName%>.domain;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.joda.deser.LocalDateDeserializer;
import <%=packageName%>.domain.util.CustomLocalDateSerializer;
<% if (hibernateCache != 'no') { %>import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %><% if (databaseType == 'sql') { %>
import org.hibernate.annotations.Type;<% } %>
import org.joda.time.LocalDate;<% if (databaseType == 'nosql') { %>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;<% } %>

<% if (databaseType == 'sql') { %>
import javax.persistence.*;<% } %>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * A <%= entityClass %>.
 */<% if (databaseType == 'sql') { %>
@Entity<% } %><% if (databaseType == 'sql' && hibernateCache != 'no') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (databaseType == 'nosql') { %>
@Document<% } %>
public class <%= entityClass %> extends AbstractAuditingEntity {
	
	private static final long serialVersionUID = <%= Math.floor(Math.random() * 0x10000000000000) %>L;
	
    @Size(min = 1, max = 50)
    private String sampleTextAttribute;

    @NotNull<% if (databaseType == 'sql') { %>
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentLocalDate")<% } %>
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = CustomLocalDateSerializer.class)<% if (databaseType == 'sql') { %>
    @Column(name = "sample_date_attribute", nullable = false)<% } %><% if (databaseType == 'nosql') { %>
    @Field("sample_date_attribute")<% } %>
    private LocalDate sampleDateAttribute;

    public String getSampleTextAttribute() {
        return sampleTextAttribute;
    }

    public void setSampleTextAttribute(String sampleTextAttribute) {
        this.sampleTextAttribute = sampleTextAttribute;
    }

    public LocalDate getSampleDateAttribute() {
        return sampleDateAttribute;
    }

    public void setSampleDateAttribute(LocalDate sampleDateAttribute) {
        this.sampleDateAttribute = sampleDateAttribute;
    }
}
