package <%=packageName%>.domain.<%= entityType%>;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.joda.deser.LocalDateDeserializer;
import <%=packageName%>.domain.util.CustomLocalDateSerializer;
<% if (hibernateCache != 'no') { %>import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %><% if (prodDatabaseType != 'none') { %>
import org.hibernate.annotations.Type;<% } %>
import org.joda.time.LocalDate;<% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;<% } %>

<% if (prodDatabaseType != 'none') { %>
import javax.persistence.*;<% } %>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;

/**
 * A <%= entityClass %>.
 */
<% if (prodDatabaseType != 'none') { %>@Entity
@Table(name = "T_<%= name.toUpperCase() %>")<% } %><% if (hibernateCache != 'no' && prodDatabaseType != 'none') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
@Document(collection = "T_<%= name.toUpperCase() %>")<% } %>
public class <%= entityClass %> implements Serializable {

    @Id<% if (prodDatabaseType != 'none') { %>
    @GeneratedValue(strategy = GenerationType.TABLE)
    private long id;<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
    private String id;<% } %>

    @Size(min = 1, max = 50)<% if (prodDatabaseType != 'none') { %>
    @Column(name = "sample_text_attribute")<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
    @Field("sample_text_attribute")<% } %>
    private String sampleTextAttribute;

    @NotNull<% if (prodDatabaseType != 'none') { %>
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentLocalDate")<% } %>
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = CustomLocalDateSerializer.class)<% if (prodDatabaseType != 'none') { %>
    @Column(name = "sample_date_attribute")<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
    @Field("sample_date_attribute")<% } %>
    private LocalDate sampleDateAttribute;

    public <% if (prodDatabaseType != 'none') { %>long<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>String<% } %> getId() {
        return id;
    }

    public void setId(<% if (prodDatabaseType != 'none') { %>long<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>String<% } %> id) {
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

        if <% if (prodDatabaseType != 'none') { %>(id != <%= entityInstance %>.id)<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>(!id.equals(<%= entityInstance %>.id))<% } %> {
            return false;
        }

        return true;
    }

    @Override
    public int hashCode() {
        return <% if (prodDatabaseType != 'none') { %>(int) (id ^ (id >>> 32));<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>id != null ? id.hashCode() : 0;<% } %>
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
