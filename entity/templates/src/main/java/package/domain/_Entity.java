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
import java.util.Objects;

/**
 * A <%= entityClass %>.
 */
<% if (databaseType == 'sql') { %>@Entity
@Table(name = "T_<%= name.toUpperCase() %>")<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (databaseType == 'nosql') { %>
@Document(collection = "T_<%= name.toUpperCase() %>")<% } %>
public class <%= entityClass %> implements Serializable {

    @Id<% if (databaseType == 'sql') { %>
    @GeneratedValue(strategy = GenerationType.TABLE)<% } %>
    private <%= primaryKeyType %> id;

    @Size(min = 1, max = 50)<% if (databaseType == 'sql') { %>
    @Column(name = "sample_text_attribute")<% } %><% if (databaseType == 'nosql') { %>
    @Field("sample_text_attribute")<% } %>
    private String sampleTextAttribute;

    @NotNull<% if (databaseType == 'sql') { %>
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentLocalDate")<% } %>
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = CustomLocalDateSerializer.class)<% if (databaseType == 'sql') { %>
    @Column(name = "sample_date_attribute")<% } %><% if (databaseType == 'nosql') { %>
    @Field("sample_date_attribute")<% } %>
    private LocalDate sampleDateAttribute;

    public <%= primaryKeyType %> getId() {
        return id;
    }

    public void setId(<%= primaryKeyType %> id) {
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

        <% if (primaryKeyType == 'long') { %>
		return id != <%= entityInstance %>.id;<% } else { %>
		return Objects.equals(id,<%= entityInstance %>.id);<% } %>
    }

    @Override
    public int hashCode() {
	return <% if (primaryKeyType == 'long') { %>(int) (id ^ (id >>> 32));<% } else { %>Objects.hashCode(id);<% } %>
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
