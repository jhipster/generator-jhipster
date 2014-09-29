package <%= makePackage(packageName, 'domain', entityPackage) %>;

<% if (relationships.length > 0) { %>import com.fasterxml.jackson.annotation.JsonIgnore;<% } %><% if (fieldsContainLocalDate == true) { %>
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.joda.deser.LocalDateDeserializer;
import <%=packageName%>.domain.util.CustomLocalDateSerializer;<% } %>
<% if (hibernateCache != 'no') { %>import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %><% if (fieldsContainLocalDate == true) { %><% if (databaseType == 'sql') { %>
import org.hibernate.annotations.Type;<% } %>
import org.joda.time.LocalDate;<% } %><% if (databaseType == 'nosql') { %>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;<% } %>

<% if (databaseType == 'sql') { %>import javax.persistence.*;<% } %>
import java.io.Serializable;<% if (relationships.length > 0) { %>
import java.util.HashSet;
import java.util.Set;<% } %>

/**
 * A <%= entityClass %>.
 */
<% if (databaseType == 'sql') { %>@Entity
@Table(name = "T_<%= entityClass.toUpperCase() %>")<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (databaseType == 'nosql') { %>
@Document(collection = "T_<%= entityClass.toUpperCase() %>")<% } %>
public class <%= entityClass %> implements Serializable {

    @Id<% if (databaseType == 'sql') { %>
    @GeneratedValue(strategy = GenerationType.TABLE)
    private Long id;<% } %><% if (databaseType == 'nosql') { %>
    private String id;<% } %>
<% for (fieldId in fields) { %><% if (databaseType == 'sql') { %><% if (fields[fieldId].fieldType == 'LocalDate') { %>
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentLocalDate")
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = CustomLocalDateSerializer.class)
    @Column(name = "<%=fields[fieldId].fieldNameUnderscored %>", nullable = false)<% } else { %>
    @Column(name = "<%=fields[fieldId].fieldNameUnderscored %>")<% }} %><% if (databaseType == 'nosql') { %><% if (fields[fieldId].fieldType == 'LocalDate') { %>
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = CustomLocalDateSerializer.class)<% } %>
    @Field("<%=fields[fieldId].fieldNameUnderscored %>")<% } %>
    private <%= fields[fieldId].fieldType %> <%= fields[fieldId].fieldName %>;
<% } %><% for (relationshipId in relationships) { %><% if (relationships[relationshipId].relationshipType == 'one-to-many') { %>
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "<%= entityInstance %>")
    @JsonIgnore<% if (hibernateCache != 'no') { %>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %>
    private Set<<%= relationships[relationshipId].otherEntityClass %>> <%= relationships[relationshipId].relationshipName %>s = new HashSet<>();<% } else { %>
    @ManyToOne
    private <%= relationships[relationshipId].otherEntityClass %> <%= relationships[relationshipId].relationshipName %>;<% } %>
<% } %>
    public <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'nosql') { %>String<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'nosql') { %>String<% } %> id) {
        this.id = id;
    }
<% for (fieldId in fields) { %>
    public <%= fields[fieldId].fieldType %> get<%= fields[fieldId].fieldNameCapitalized %>() {
        return <%= fields[fieldId].fieldName %>;
    }

    public void set<%= fields[fieldId].fieldNameCapitalized %>(<%= fields[fieldId].fieldType %> <%= fields[fieldId].fieldName %>) {
        this.<%= fields[fieldId].fieldName %> = <%= fields[fieldId].fieldName %>;
    }
<% } %><% for (relationshipId in relationships) { %><% if (relationships[relationshipId].relationshipType == 'one-to-many') { %>
    public Set<<%= relationships[relationshipId].otherEntityClass %>> get<%= relationships[relationshipId].otherEntityClass %>s() {
        return <%= relationships[relationshipId].relationshipName %>s;
    }

    public void set<%= relationships[relationshipId].otherEntityClass %>s(Set<<%= relationships[relationshipId].otherEntityClass %>> <%= relationships[relationshipId].relationshipName %>s) {
        this.<%= relationships[relationshipId].relationshipName %>s = <%= relationships[relationshipId].relationshipName %>s;
    }<% } else { %>
    public <%= relationships[relationshipId].otherEntityClass %> get<%= relationships[relationshipId].otherEntityClass %>() {
        return <%= relationships[relationshipId].relationshipName %>;
    }

    public void set<%= relationships[relationshipId].otherEntityClass %>(<%= relationships[relationshipId].otherEntityClass %> <%= relationships[relationshipId].relationshipName %>) {
        this.<%= relationships[relationshipId].relationshipName %> = <%= relationships[relationshipId].relationshipName %>;
    }<% } %>
<% } %>
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        <%= entityClass %> <%= entityInstance %> = (<%= entityClass %>) o;

        if (id != null ? !id.equals(<%= entityInstance %>.id) : <%= entityInstance %>.id != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return <% if (databaseType == 'sql') { %>(int) (id ^ (id >>> 32));<% } %><% if (databaseType == 'nosql') { %>id != null ? id.hashCode() : 0;<% } %>
    }

    @Override
    public String toString() {
        return "<%= entityClass %>{" +
                "id=" + id +<% for (fieldId in fields) { %>
                ", <%= fields[fieldId].fieldName %>='" + <%= fields[fieldId].fieldName %> + "'" +<% } %>
                '}';
    }
}
