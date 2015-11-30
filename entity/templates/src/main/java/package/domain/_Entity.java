package <%=packageName%>.domain;
<% if (databaseType == 'cassandra') { %>
import com.datastax.driver.mapping.annotations.*;<% } %><% if (typeof javadoc != 'undefined') { -%>
import io.swagger.annotations.ApiModel;<% } %><%
var importApiModelProperty = false;
for (relationshipId in relationships) {
    if (typeof relationships[relationshipId].javadoc != 'undefined') {
        importApiModelProperty = true;
    }
}
for (fieldId in fields) {
    if (typeof fields[fieldId].javadoc != 'undefined') {
        importApiModelProperty = true;
    }
}
if (importApiModelProperty) { %>
import io.swagger.annotations.ApiModelProperty;<% } %><%
var importJsonignore = false;
for (relationshipId in relationships) {
    if (relationships[relationshipId].relationshipType == 'one-to-many') {
        importJsonignore = true;
    } else if (relationships[relationshipId].relationshipType == 'one-to-one' && relationships[relationshipId].ownerSide == false) {
        importJsonignore = true;
    } else if (relationships[relationshipId].relationshipType == 'many-to-many' && relationships[relationshipId].ownerSide == false) {
        importJsonignore = true;
    }
}
if (importJsonignore) { %>
import com.fasterxml.jackson.annotation.JsonIgnore;<% } %><% if (hibernateCache != 'no') { %>
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %><% if (fieldsContainLocalDate == true) { %>
import java.time.LocalDate;<% } %><% if (fieldsContainZonedDateTime == true) { %>
import java.time.ZonedDateTime;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;<% } %><% if (searchEngine == 'elasticsearch') { %>
import org.springframework.data.elasticsearch.annotations.Document;<% } %>
<% if (databaseType == 'sql') { %>
import javax.persistence.*;<% } %><% if (validation) { %>
import javax.validation.constraints.*;<% } %>
import java.io.Serializable;<% if (fieldsContainBigDecimal == true) { %>
import java.math.BigDecimal;<% } %><% if (fieldsContainDate == true) { %>
import java.util.Date;<% } %><% if (relationships.length > 0) { %>
import java.util.HashSet;
import java.util.Set;<% } %>
import java.util.Objects;<% if (databaseType == 'cassandra') { %>
import java.util.UUID;<% } %><%
var uniqueEnums = {};
for (fieldId in fields) {
    if (fields[fieldId].fieldIsEnum && (
            !uniqueEnums[fields[fieldId].fieldType] || (uniqueEnums[fields[fieldId].fieldType] && fields[fieldId].fieldValues.length !== 0))) {
        uniqueEnums[fields[fieldId].fieldType] = fields[fieldId].fieldType;
    }
}
Object.keys(uniqueEnums).forEach(function(element) { %>

import <%=packageName%>.domain.enumeration.<%= element %>;<% }); %>

<% if (typeof javadoc == 'undefined') { -%>
/**
 * A <%= entityClass %>.
 */
<% } else { -%>
<%- util.formatAsClassJavadoc(javadoc) %>
@ApiModel(description = "<%- util.formatAsApiModel(javadoc) %>")
<% } -%>
<% if (databaseType == 'sql') { -%>
@Entity
@Table(name = "<%= entityTableName %>")<% if (hibernateCache != 'no') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% } %><% if (databaseType == 'mongodb') { %>
@Document(collection = "<%= entityTableName %>")<% } %><% if (databaseType == 'cassandra') { %>
@Table(name = "<%= entityInstance %>")<% } %><% if (searchEngine == 'elasticsearch') { %>
@Document(indexName = "<%= entityInstance.toLowerCase() %>")<% } %>
public class <%= entityClass %> implements Serializable {
<% if (databaseType == 'sql') { %>
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;<% } %><% if (databaseType == 'mongodb') { %>
    @Id
    private String id;<% } %><% if (databaseType == 'cassandra') { %>
    @PartitionKey
    private UUID id;<% } %>

<%_ for (fieldId in fields) {
    if (typeof fields[fieldId].javadoc != 'undefined') { _%>
<%- util.formatAsFieldJavadoc(fields[fieldId].javadoc) %>
    @ApiModelProperty(value = "<%- util.formatAsApiModelProperty(fields[fieldId].javadoc) %>")
    <%_ }
    var required = false;
    if (fields[fieldId].fieldValidate == true) {
        if (fields[fieldId].fieldValidate == true && fields[fieldId].fieldValidateRules.indexOf('required') != -1) {
            required = true;
        } _%>
    <%- include field_validators -%>
    <%_ } _%>
    <%_ if (databaseType == 'sql') {
        if (fields[fieldId].fieldIsEnum) { _%>
    @Enumerated(EnumType.STRING)
        <%_ }
        if (fields[fieldId].fieldType == 'byte[]') { _%>
    @Lob
        <%_ }
        if (fields[fieldId].fieldType == 'LocalDate' || fields[fieldId].fieldType == 'ZonedDateTime') { _%>
    @Column(name = "<%=fields[fieldId].fieldNameUnderscored %>"<% if (required) { %>, nullable = false<% } %>)
        <%_ } else if (fields[fieldId].fieldType == 'BigDecimal') { _%>
    @Column(name = "<%=fields[fieldId].fieldNameUnderscored %>", precision=10, scale=2<% if (required) { %>, nullable = false<% } %>)
        <%_ } else { _%>
    @Column(name = "<%=fields[fieldId].fieldNameUnderscored %>"<% if (fields[fieldId].fieldValidate == true) { %><% if (fields[fieldId].fieldValidateRules.indexOf('maxlength') != -1) { %>, length = <%= fields[fieldId].fieldValidateRulesMaxlength %><% } %><% if (required) { %>, nullable = false<% } %><% } %>)
    <%_     }
        } _%>
    <%_ if (databaseType == 'mongodb') { _%>
    @Field("<%=fields[fieldId].fieldNameUnderscored %>")
    <%_ } _%>
    private <%= fields[fieldId].fieldType %> <%= fields[fieldId].fieldName %>;

    <%_ if (fields[fieldId].fieldType == 'byte[]') { _%><%_ if (databaseType == 'sql') { _%>
    @Column(name = "<%=fields[fieldId].fieldNameUnderscored %>_content_type"<% if (required) { %>, nullable = false<% } %>) <%_ } _%>
    <% if (databaseType == 'mongodb') { %>@Field("<%=fields[fieldId].fieldNameUnderscored %>_content_type")
    <%_ } _%>
    private String <%= fields[fieldId].fieldName %>ContentType;
    <%_ }
    }
    for (relationshipId in relationships) {
        var otherEntityRelationshipName = relationships[relationshipId].otherEntityRelationshipName,
        relationshipName = relationships[relationshipId].relationshipName,
        joinTableName = entityTableName + '_'+ getTableName(relationshipName);
        if(prodDatabaseType === 'oracle' && joinTableName.length > 30) {
            joinTableName = getTableName(name.substring(0, 5)) + '_' + getTableName(relationshipName.substring(0, 5)) + '_MAPPING';
        }
        if (otherEntityRelationshipName != null) {
            mappedBy = otherEntityRelationshipName.charAt(0).toLowerCase() + otherEntityRelationshipName.slice(1)
        }
        if (typeof relationships[relationshipId].javadoc != 'undefined') { _%>
<%- util.formatAsFieldJavadoc(relationships[relationshipId].javadoc) %>
    @ApiModelProperty(value = "<%- util.formatAsApiModelProperty(relationships[relationshipId].javadoc) %>")
    <%_ }
        if (relationships[relationshipId].relationshipType == 'one-to-many') {
    _%>
    @OneToMany(mappedBy = "<%= relationships[relationshipId].otherEntityRelationshipName %>")
    @JsonIgnore
    <%_     if (hibernateCache != 'no') { _%>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    <%_     } _%>
    private Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>> <%= relationships[relationshipId].relationshipFieldName %>s = new HashSet<>();

    <%_ } else if (relationships[relationshipId].relationshipType == 'many-to-one') { _%>
    @ManyToOne
    @JoinColumn(name = "<%= getColumnName(relationships[relationshipId].relationshipName) %>_id")
    private <%= relationships[relationshipId].otherEntityNameCapitalized %> <%= relationships[relationshipId].relationshipFieldName %>;

    <%_ } else if (relationships[relationshipId].relationshipType == 'many-to-many') { _%>
    @ManyToMany<% if (relationships[relationshipId].ownerSide == false) { %>(mappedBy = "<%= relationships[relationshipId].otherEntityRelationshipName %>s")
    @JsonIgnore
    <%_     } else { _%>

    <%_     }
            if (hibernateCache != 'no') { _%>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    <%_     }
            if (relationships[relationshipId].ownerSide == true) { _%>
    @JoinTable(name = "<%= joinTableName %>",
               joinColumns = @JoinColumn(name="<%= getColumnName(name) %>s_id", referencedColumnName="ID"),
               inverseJoinColumns = @JoinColumn(name="<%= getColumnName(relationships[relationshipId].relationshipName) %>s_id", referencedColumnName="ID"))
    <%_     } _%>
    private Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>> <%= relationships[relationshipId].relationshipFieldName %>s = new HashSet<>();

    <%_ } else { _%>
    @OneToOne<% if (relationships[relationshipId].ownerSide == false) { %>(mappedBy = "<%= relationships[relationshipId].otherEntityRelationshipName %>")
    @JsonIgnore
    <%_} _%>
    private <%= relationships[relationshipId].otherEntityNameCapitalized %> <%= relationships[relationshipId].relationshipFieldName %>;

    <%_ } } _%>
    
    public <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb') { %>String<% } %><% if (databaseType == 'cassandra') { %>UUID<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb') { %>String<% } %><% if (databaseType == 'cassandra') { %>UUID<% } %> id) {
        this.id = id;
    }
<% for (fieldId in fields) { %>
    public <%= fields[fieldId].fieldType %> get<%= fields[fieldId].fieldInJavaBeanMethod %>() {
        return <%= fields[fieldId].fieldName %>;
    }

    public void set<%= fields[fieldId].fieldInJavaBeanMethod %>(<%= fields[fieldId].fieldType %> <%= fields[fieldId].fieldName %>) {
        this.<%= fields[fieldId].fieldName %> = <%= fields[fieldId].fieldName %>;
    }
    <%_ if (fields[fieldId].fieldType == 'byte[]') { _%>

    public String get<%= fields[fieldId].fieldInJavaBeanMethod %>ContentType() {
        return <%= fields[fieldId].fieldName %>ContentType;
    }

    public void set<%= fields[fieldId].fieldInJavaBeanMethod %>ContentType(String <%= fields[fieldId].fieldName %>ContentType) {
        this.<%= fields[fieldId].fieldName %>ContentType = <%= fields[fieldId].fieldName %>ContentType;
    }
    <%_ } _%>
<% } %><% for (relationshipId in relationships) { %><% if (relationships[relationshipId].relationshipType == 'one-to-many' || relationships[relationshipId].relationshipType == 'many-to-many') { %>
    public Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>> get<%= relationships[relationshipId].relationshipNameCapitalized %>s() {
        return <%= relationships[relationshipId].relationshipFieldName %>s;
    }

    public void set<%= relationships[relationshipId].relationshipNameCapitalized %>s(Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>> <%= relationships[relationshipId].otherEntityName %>s) {
        this.<%= relationships[relationshipId].relationshipFieldName %>s = <%= relationships[relationshipId].otherEntityName %>s;
    }<% } else { %>
    public <%= relationships[relationshipId].otherEntityNameCapitalized %> get<%= relationships[relationshipId].relationshipNameCapitalized %>() {
        return <%= relationships[relationshipId].relationshipFieldName %>;
    }

    public void set<%= relationships[relationshipId].relationshipNameCapitalized %>(<%= relationships[relationshipId].otherEntityNameCapitalized %> <%= relationships[relationshipId].otherEntityName %>) {
        this.<%= relationships[relationshipId].relationshipFieldName %> = <%= relationships[relationshipId].otherEntityName %>;
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
        return Objects.equals(id, <%= entityInstance %>.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "<%= entityClass %>{" +
            "id=" + id +
            <%_ for (fieldId in fields) { _%>
            ", <%= fields[fieldId].fieldName %>='" + <%= fields[fieldId].fieldName %> + "'" +
                <%_ if (fields[fieldId].fieldType == 'byte[]') { _%>
            ", <%= fields[fieldId].fieldName %>ContentType='" + <%= fields[fieldId].fieldName %>ContentType + "'" +
                <%_ } _%>
            <%_ } _%>
            '}';
    }
}
