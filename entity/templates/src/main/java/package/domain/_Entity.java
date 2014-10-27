package <%=packageName%>.domain;
<% if (relationships.length > 0) { %>
import com.fasterxml.jackson.annotation.JsonIgnore;<% } %><% if (fieldsContainLocalDate == true) { %>
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.joda.deser.LocalDateDeserializer;
import <%=packageName%>.domain.util.CustomLocalDateSerializer;<% } %><% if (hibernateCache != 'no') { %>
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %><% if (fieldsContainLocalDate == true) { %><% if (databaseType == 'sql') { %>
import org.hibernate.annotations.Type;<% } %>
import org.joda.time.LocalDate;<% } %><% if (databaseType == 'nosql') { %>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;<% } %>
<% if (databaseType == 'sql') { %>
import javax.persistence.*;<% } %>
import java.io.Serializable;<% if (fieldsContainBigDecimal == true) { %>
import java.math.BigDecimal;<% } %><% if (relationships.length > 0) { %>
import java.util.HashSet;
import java.util.Set;<% } %>

/**
 * A <%= entityClass %>.
 */
<% if (databaseType == 'sql') { %>@Entity
@Table(name = "T_<%= name.toUpperCase() %>")<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (databaseType == 'nosql') { %>
@Document(collection = "T_<%= name.toUpperCase() %>")<% } %>
public class <%= entityClass %> implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id<% if (databaseType == 'sql') { %>
    @GeneratedValue(strategy = GenerationType.TABLE)
    private Long id;<% } %><% if (databaseType == 'nosql') { %>
    private String id;<% } %>
<% for (fieldId in fields) { %><% if (databaseType == 'sql') { %><% if (fields[fieldId].fieldType == 'LocalDate') { %>
    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentLocalDate")
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = CustomLocalDateSerializer.class)
    @Column(name = "<%=fields[fieldId].fieldNameUnderscored %>", nullable = false)<% } else if (fields[fieldId].fieldType == 'BigDecimal') { %>
    @Column(name = "<%=fields[fieldId].fieldNameUnderscored %>", precision=10, scale=2)<% } else { %>
    @Column(name = "<%=fields[fieldId].fieldNameUnderscored %>")<% }} %><% if (databaseType == 'nosql') { %><% if (fields[fieldId].fieldType == 'LocalDate') { %>
    @JsonDeserialize(using = LocalDateDeserializer.class)
    @JsonSerialize(using = CustomLocalDateSerializer.class)<% } %>
    @Field("<%=fields[fieldId].fieldNameUnderscored %>")<% } %>
    private <%= fields[fieldId].fieldType %> <%= fields[fieldId].fieldName %>;
<% } %><% for (relationshipId in relationships) { %><% if (relationships[relationshipId].relationshipType == 'one-to-many') { %>
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "<%= entityInstance %>")
    @JsonIgnore<% if (hibernateCache != 'no') { %>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %>
    private Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>> <%= relationships[relationshipId].otherEntityName %>s = new HashSet<>();<% } else if (relationships[relationshipId].relationshipType == 'many-to-one') { %>
    @ManyToOne
    private <%= relationships[relationshipId].otherEntityNameCapitalized %> <%= relationships[relationshipId].otherEntityName %>;<% } else if (relationships[relationshipId].relationshipType == 'many-to-many') { %>
    @ManyToMany(cascade = CascadeType.ALL<% if (relationships[relationshipId].ownerSide == false) { %>, mappedBy = "<%= entityInstance %>s"<% } %>)
    @JsonIgnore<% if (hibernateCache != 'no') { %>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %>
    private Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>> <%= relationships[relationshipId].otherEntityName %>s = new HashSet<>();<% } else { %>
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true<% if (relationships[relationshipId].ownerSide == false) { %>, mappedBy = "<%= entityInstance %>"<% } %>)
    private <%= relationships[relationshipId].otherEntityNameCapitalized %> <%= relationships[relationshipId].otherEntityName %>;<% } %>
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
<% } %><% for (relationshipId in relationships) { %><% if (relationships[relationshipId].relationshipType == 'one-to-many' || relationships[relationshipId].relationshipType == 'many-to-many') { %>
    public Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>> get<%= relationships[relationshipId].otherEntityNameCapitalized %>s() {
        return <%= relationships[relationshipId].otherEntityName %>s;
    }

    public void set<%= relationships[relationshipId].otherEntityNameCapitalized %>s(Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>> <%= relationships[relationshipId].otherEntityName %>s) {
        this.<%= relationships[relationshipId].otherEntityName %>s = <%= relationships[relationshipId].otherEntityName %>s;
    }<% } else { %>
    public <%= relationships[relationshipId].otherEntityNameCapitalized %> get<%= relationships[relationshipId].otherEntityNameCapitalized %>() {
        return <%= relationships[relationshipId].otherEntityName %>;
    }

    public void set<%= relationships[relationshipId].otherEntityNameCapitalized %>(<%= relationships[relationshipId].otherEntityNameCapitalized %> <%= relationships[relationshipId].otherEntityName %>) {
        this.<%= relationships[relationshipId].otherEntityName %> = <%= relationships[relationshipId].otherEntityName %>;
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
