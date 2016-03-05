package <%=packageName%>.domain;<%
var importApiModelProperty = false;
var importJsonignore = false;
var importSet = false;
var uniqueEnums = {}; %><%- include imports -%>
<% if (databaseType == 'cassandra') { %>
import com.datastax.driver.mapping.annotations.*;<% } %><% if (importJsonignore == true) { %>
import com.fasterxml.jackson.annotation.JsonIgnore;<% } %><% if (typeof javadoc != 'undefined') { %>
import io.swagger.annotations.ApiModel;<% } %><% if (importApiModelProperty == true) { %>
import io.swagger.annotations.ApiModelProperty;<% } %><% if (hibernateCache != 'no') { %>
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %><% if (databaseType == 'mongodb') { %>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;<% } %><% if (searchEngine == 'elasticsearch') { %>
import org.springframework.data.elasticsearch.annotations.Document;<% } %>
<% if (databaseType == 'sql') { %>
import javax.persistence.*;<% } %><% if (validation) { %>
import javax.validation.constraints.*;<% } %>
import java.io.Serializable;<% if (fieldsContainBigDecimal == true) { %>
import java.math.BigDecimal;<% } %><% if (fieldsContainLocalDate == true) { %>
import java.time.LocalDate;<% } %><% if (fieldsContainZonedDateTime == true) { %>
import java.time.ZonedDateTime;<% } %><% if (fieldsContainDate == true) { %>
import java.util.Date;<% } %><% if (importSet == true) { %>
import java.util.HashSet;
import java.util.Set;<% } %>
import java.util.Objects;<% if (databaseType == 'cassandra') { %>
import java.util.UUID;<% } %><% Object.keys(uniqueEnums).forEach(function(element) { %>

import <%=packageName%>.domain.enumeration.<%= element %>;<% }); %>

<% if (typeof javadoc == 'undefined') { -%>
/**
 * A <%= entityClass %>.
 */
<% } else { -%>
<%- formatAsClassJavadoc(javadoc) %>
@ApiModel(description = "<%- formatAsApiModel(javadoc) %>")
<% } -%>
<% if (databaseType == 'sql') { -%>
@Entity
@Table(name = "<%= entityTableName %>")<% if (hibernateCache != 'no') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% } %><% if (databaseType == 'mongodb') { %>
@Document(collection = "<%= entityTableName %>")<% } %><% if (databaseType == 'cassandra') { %>
@Table(name = "<%= entityInstance %>")<% } %><% if (searchEngine == 'elasticsearch') { %>
@Document(indexName = "<%= entityInstance.toLowerCase() %>")<% } %>
public class <%= entityClass %> implements Serializable {

    private static final long serialVersionUID = 1L;
<% if (databaseType == 'sql') { %>
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;<% } %><% if (databaseType == 'mongodb') { %>
    @Id
    private String id;<% } %><% if (databaseType == 'cassandra') { %>
    @PartitionKey
    private UUID id;<% } %>

<%_ for (idx in fields) {
    if (typeof fields[idx].javadoc != 'undefined') { _%>
<%- formatAsFieldJavadoc(fields[idx].javadoc) %>
    @ApiModelProperty(value = "<%- formatAsApiModelProperty(fields[idx].javadoc) %>")
    <%_ }
    var required = false;
    var fieldValidate = fields[idx].fieldValidate;
    var fieldValidateRules = fields[idx].fieldValidateRules;
    var fieldValidateRulesMaxlength = fields[idx].fieldValidateRulesMaxlength;
    var fieldType = fields[idx].fieldType;
    var fieldTypeBlobContent = fields[idx].fieldTypeBlobContent;
    var fieldName = fields[idx].fieldName;
    var fieldNameUnderscored = fields[idx].fieldNameUnderscored;
    if (fieldValidate == true) {
        if (fieldValidate == true && fieldValidateRules.indexOf('required') != -1) {
            required = true;
        } _%>
    <%- include field_validators -%>
    <%_ } _%>
    <%_ if (databaseType == 'sql') {
        if (fields[idx].fieldIsEnum) { _%>
    @Enumerated(EnumType.STRING)
        <%_ }
        if (fieldType == 'byte[]') { _%>
    @Lob
        <%_ }
        if (fieldType == 'LocalDate' || fieldType == 'ZonedDateTime') { _%>
    @Column(name = "<%=fieldNameUnderscored %>"<% if (required) { %>, nullable = false<% } %>)
        <%_ } else if (fieldType == 'BigDecimal') { _%>
    @Column(name = "<%=fieldNameUnderscored %>", precision=10, scale=2<% if (required) { %>, nullable = false<% } %>)
        <%_ } else { _%>
    @Column(name = "<%=fieldNameUnderscored %>"<% if (fieldValidate == true) { %><% if (fieldValidateRules.indexOf('maxlength') != -1) { %>, length = <%= fieldValidateRulesMaxlength %><% } %><% if (required) { %>, nullable = false<% } %><% } %>)
    <%_     }
        } _%>
    <%_ if (databaseType == 'mongodb') { _%>
    @Field("<%=fieldNameUnderscored %>")
    <%_ } _%>
    <%_ if (fieldTypeBlobContent != 'text') { _%>
    private <%= fieldType %> <%= fieldName %>;
    <%_ } else { _%>
    private String <%= fieldName %>;
    <%_ } _%>

    <%_ if (fieldType == 'byte[]' && fieldTypeBlobContent != 'text') { _%><%_ if (databaseType == 'sql') { _%>
    @Column(name = "<%=fieldNameUnderscored %>_content_type"<% if (required) { %>, nullable = false<% } %>) <%_ } _%>
    <% if (databaseType == 'mongodb') { %>@Field("<%=fieldNameUnderscored %>_content_type")
    <%_ } _%>

    private String <%= fieldName %>ContentType;

    <%_ }
    }
    for (idx in relationships) {
        var otherEntityRelationshipName = relationships[idx].otherEntityRelationshipName,
        relationshipName = relationships[idx].relationshipName,
        relationshipFieldName = relationships[idx].relationshipFieldName,
        joinTableName = entityTableName + '_'+ getTableName(relationshipName),
        relationshipType = relationships[idx].relationshipType,
        otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized,
        ownerSide = relationships[idx].ownerSide;
        if(prodDatabaseType === 'oracle' && joinTableName.length > 30) {
            joinTableName = getTableName(name.substring(0, 5)) + '_' + getTableName(relationshipName.substring(0, 5)) + '_MAPPING';
        }
        if(prodDatabaseType === 'mysql' && joinTableName.length > 64) {
            joinTableName = getTableName(name.substring(0, 10)) + '_' + getTableName(relationshipName.substring(0, 10)) + '_MAPPING';
        }
        if (otherEntityRelationshipName != null) {
            mappedBy = otherEntityRelationshipName.charAt(0).toLowerCase() + otherEntityRelationshipName.slice(1)
        }
        if (typeof relationships[idx].javadoc != 'undefined') { _%>
<%- formatAsFieldJavadoc(relationships[idx].javadoc) %>
    @ApiModelProperty(value = "<%- formatAsApiModelProperty(relationships[idx].javadoc) %>")
    <%_ }
        if (relationshipType == 'one-to-many') {
    _%>
    @OneToMany(mappedBy = "<%= otherEntityRelationshipName %>")
    @JsonIgnore
    <%_     if (hibernateCache != 'no') { _%>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    <%_     } _%>
    private Set<<%= otherEntityNameCapitalized %>> <%= relationshipFieldName %>s = new HashSet<>();

    <%_ } else if (relationshipType == 'many-to-one') { _%>
    @ManyToOne
    private <%= otherEntityNameCapitalized %> <%= relationshipFieldName %>;

    <%_ } else if (relationshipType == 'many-to-many') { _%>
    @ManyToMany<% if (ownerSide == false) { %>(mappedBy = "<%= otherEntityRelationshipName %>s")
    @JsonIgnore
    <%_     } else { _%>

    <%_     }
            if (hibernateCache != 'no') { _%>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    <%_     }
            if (ownerSide == true) { _%>
    @JoinTable(name = "<%= joinTableName %>",
               joinColumns = @JoinColumn(name="<%= getColumnName(name) %>s_id", referencedColumnName="ID"),
               inverseJoinColumns = @JoinColumn(name="<%= getColumnName(relationships[idx].relationshipName) %>s_id", referencedColumnName="ID"))
    <%_     } _%>
    private Set<<%= otherEntityNameCapitalized %>> <%= relationshipFieldName %>s = new HashSet<>();

    <%_ } else { _%>
    <%_     if (ownerSide) { _%>
    @OneToOne
    @JoinColumn(unique = true)
    <%_    } else { _%>
    @OneToOne(mappedBy = "<%= otherEntityRelationshipName %>")
    @JsonIgnore
    <%_    } _%>
    private <%= otherEntityNameCapitalized %> <%= relationshipFieldName %>;

    <%_ } } _%>
    public <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb') { %>String<% } %><% if (databaseType == 'cassandra') { %>UUID<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb') { %>String<% } %><% if (databaseType == 'cassandra') { %>UUID<% } %> id) {
        this.id = id;
    }
<% for (idx in fields) {
        var fieldType = fields[idx].fieldType;
        var fieldTypeBlobContent = fields[idx].fieldTypeBlobContent;
        var fieldName = fields[idx].fieldName;
        var fieldInJavaBeanMethod = fields[idx].fieldInJavaBeanMethod; %>
    <%_ if (fieldTypeBlobContent != 'text') { _%>
        <%_ if (fieldType.toLowerCase() == 'boolean') { _%>
    public <%= fieldType %> is<%= fieldInJavaBeanMethod %>() {
        <%_ } else { _%>
    public <%= fieldType %> get<%= fieldInJavaBeanMethod %>() {
        <%_ } _%>
    <%_ } else { _%>
    public String get<%= fieldInJavaBeanMethod %>() {
    <%_ } _%>
        return <%= fieldName %>;
    }

    <%_ if (fieldTypeBlobContent != 'text') { _%>
    public void set<%= fieldInJavaBeanMethod %>(<%= fieldType %> <%= fieldName %>) {
    <%_ } else { _%>
    public void set<%= fieldInJavaBeanMethod %>(String <%= fieldName %>) {
    <%_ } _%>
        this.<%= fieldName %> = <%= fieldName %>;
    }
    <%_ if (fieldType == 'byte[]' && fieldTypeBlobContent != 'text') { _%>

    public String get<%= fieldInJavaBeanMethod %>ContentType() {
        return <%= fieldName %>ContentType;
    }

    public void set<%= fieldInJavaBeanMethod %>ContentType(String <%= fieldName %>ContentType) {
        this.<%= fieldName %>ContentType = <%= fieldName %>ContentType;
    }
    <%_ } _%>
<% } %><%
    for (idx in relationships) {
        var relationshipFieldName = relationships[idx].relationshipFieldName,
        relationshipType = relationships[idx].relationshipType,
        otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized,
        relationshipNameCapitalized = relationships[idx].relationshipNameCapitalized,
        otherEntityName = relationships[idx].otherEntityName;
    %><% if (relationshipType == 'one-to-many' || relationshipType == 'many-to-many') { %>
    public Set<<%= otherEntityNameCapitalized %>> get<%= relationshipNameCapitalized %>s() {
        return <%= relationshipFieldName %>s;
    }

    public void set<%= relationshipNameCapitalized %>s(Set<<%= otherEntityNameCapitalized %>> <%= otherEntityName %>s) {
        this.<%= relationshipFieldName %>s = <%= otherEntityName %>s;
    }<% } else { %>
    public <%= otherEntityNameCapitalized %> get<%= relationshipNameCapitalized %>() {
        return <%= relationshipFieldName %>;
    }

    public void set<%= relationshipNameCapitalized %>(<%= otherEntityNameCapitalized %> <%= otherEntityName %>) {
        this.<%= relationshipFieldName %> = <%= otherEntityName %>;
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
        if(<%= entityInstance %>.id == null || id == null) {
            return false;
        }
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
            <%_ for (idx in fields) {
                var fieldType = fields[idx].fieldType;
                var fieldTypeBlobContent = fields[idx].fieldTypeBlobContent;
                var fieldName = fields[idx].fieldName; _%>
            ", <%= fieldName %>='" + <%= fieldName %> + "'" +
                <%_ if (fieldType == 'byte[]' && fieldTypeBlobContent != 'text') { _%>
            ", <%= fieldName %>ContentType='" + <%= fieldName %>ContentType + "'" +
                <%_ } _%>
            <%_ } _%>
            '}';
    }
}
