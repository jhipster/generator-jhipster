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
import java.io.Serializable;

/**
 * A <%= entityClass %>.
 */
<% if (databaseType == 'sql') { %>@Entity
@Table(name = "T_<%= name.toUpperCase() %>")<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (databaseType == 'nosql') { %>
@Document(collection = "T_<%= name.toUpperCase() %>")<% } %>
public class <%= entityClass %> implements Serializable {

    @Id<% if (databaseType == 'sql') { %>
    @GeneratedValue(strategy = GenerationType.TABLE)
    private Long id;<% } %><% if (databaseType == 'nosql') { %>
    private String id;<% } %>

    @Size(min = 1, max = 50)<% if (databaseType == 'sql') { %>
    @Column(name = "sample_text_attribute", length = 50)<% } %><% if (databaseType == 'nosql') { %>
    @Field("sample_text_attribute")<% } %>
    private String sampleTextAttribute;

    @NotNull<% if (databaseType == 'sql') { %>
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentLocalDate")<% } %>
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = CustomLocalDateSerializer.class)<% if (databaseType == 'sql') { %>
    @Column(name = "sample_date_attribute")<% } %><% if (databaseType == 'nosql') { %>
    @Field("sample_date_attribute")<% } %>
    private LocalDate sampleDateAttribute;

    public <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'nosql') { %>String<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'nosql') { %>String<% } %> id) {
        this.id = id;
    }

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

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        <%= entityClass %> <%= entityInstance %> = (<%= entityClass %>) o;

        if <% if (databaseType == 'sql') { %>(id != <%= entityInstance %>.id)<% } %><% if (databaseType == 'nosql') { %>(!id.equals(<%= entityInstance %>.id))<% } %> {
            return false;
        }

        return true;
    }

    @Override
    public int hashCode() {
        return <% if (databaseType == 'sql') { %>(int) (id ^ (id >>> 32));<% } %><% if (databaseType == 'nosql') { %>id != null ? id.hashCode() : 0;<% } %>
    }

    @Override
    public String toString() {
        return "<%= entityClass %>{" +
                "id=" + id +
                ", sampleTextAttribute='" + sampleTextAttribute + '\'' +
                ", sampleDateAttribute=" + sampleDateAttribute +
                '}';
    }
}
