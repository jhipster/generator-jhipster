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
import java.math.BigDecimal;<% } %><% if (fieldsContainBlob && databaseType === 'cassandra') { %>
import java.nio.ByteBuffer;<% } %><% if (fieldsContainLocalDate == true) { %>
import java.time.LocalDate;<% } %><% if (fieldsContainZonedDateTime == true) { %>
import java.time.ZonedDateTime;<% } %><% if (importSet == true) { %>
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
    <%- include ../common/field_validators -%>
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

    <%_ if ((fieldType === 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent != 'text') { _%>
      <%_ if (databaseType == 'sql' || databaseType === 'cassandra') { _%>
    @Column(name = "<%=fieldNameUnderscored %>_content_type"<% if (required && databaseType !== 'cassandra') { %>, nullable = false<% } %>)
        <%_ if (required && databaseType === 'cassandra') { _%>
    @NotNull
        <%_ } _%>
      <%_ } _%>
      <%_ if (databaseType == 'mongodb') { _%>
    @Field("<%=fieldNameUnderscored %>_content_type")
      <%_ } _%>
    private String <%= fieldName %>ContentType;

    <%_ }
    }

    for (idx in relationships) {
        var otherEntityRelationshipName = relationships[idx].otherEntityRelationshipName,
        otherEntityRelationshipNamePlural = relationships[idx].otherEntityRelationshipNamePlural,
        relationshipName = relationships[idx].relationshipName,
        relationshipFieldName = relationships[idx].relationshipFieldName,
        relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural,
        joinTableName = getJoinTableName(name, relationshipName, prodDatabaseType),
        relationshipType = relationships[idx].relationshipType,
        relationshipValidate = relationships[idx].relationshipValidate,
        otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized,
        ownerSide = relationships[idx].ownerSide;
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
    private Set<<%= otherEntityNameCapitalized %>> <%= relationshipFieldNamePlural %> = new HashSet<>();

    <%_ } else if (relationshipType == 'many-to-one') { _%>
    @ManyToOne
    <%_ if (relationshipValidate) { _%>
    <%- include relationship_validators -%>
    <%_ }_%>
    private <%= otherEntityNameCapitalized %> <%= relationshipFieldName %>;

    <%_ } else if (relationshipType == 'many-to-many') { _%>
    @ManyToMany<% if (ownerSide == false) { %>(mappedBy = "<%= otherEntityRelationshipNamePlural %>")
    @JsonIgnore
    <%_     } else { _%>

    <%_     }
            if (hibernateCache != 'no') { _%>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    <%_     }
            if (ownerSide == true) { _%>
    <%_ if (relationshipValidate) { _%>
    <%- include relationship_validators -%>
    <%_ }_%>
    @JoinTable(name = "<%= joinTableName %>",
               joinColumns = @JoinColumn(name="<%= getPluralColumnName(name) %>_id", referencedColumnName="ID"),
               inverseJoinColumns = @JoinColumn(name="<%= getPluralColumnName(relationships[idx].relationshipName) %>_id", referencedColumnName="ID"))
    <%_     } _%>
    private Set<<%= otherEntityNameCapitalized %>> <%= relationshipFieldNamePlural %> = new HashSet<>();

    <%_ } else { _%>
    <%_     if (ownerSide) { _%>
    @OneToOne
    <%_ if (relationshipValidate) { _%>
    <%- include relationship_validators -%>
    <%_ }_%>
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
<%_ for (idx in fields) {
        var fieldType = fields[idx].fieldType;
        var fieldTypeBlobContent = fields[idx].fieldTypeBlobContent;
        var fieldName = fields[idx].fieldName;
        var fieldInJavaBeanMethod = fields[idx].fieldInJavaBeanMethod; _%>

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
    <%_ if (fluentMethods) { _%>

        <%_ if (fieldTypeBlobContent != 'text') { _%>
    public <%= entityClass %> <%= fieldName %>(<%= fieldType %> <%= fieldName %>) {
        <%_ } else { _%>
    public <%= entityClass %> <%= fieldName %>(String <%= fieldName %>) {
        <%_ } _%>
        this.<%= fieldName %> = <%= fieldName %>;
        return this;
    }
    <%_ } _%>

    <%_ if (fieldTypeBlobContent != 'text') { _%>
    public void set<%= fieldInJavaBeanMethod %>(<%= fieldType %> <%= fieldName %>) {
    <%_ } else { _%>
    public void set<%= fieldInJavaBeanMethod %>(String <%= fieldName %>) {
    <%_ } _%>
        this.<%= fieldName %> = <%= fieldName %>;
    }
    <%_ if ((fieldType == 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent != 'text') { _%>

    public String get<%= fieldInJavaBeanMethod %>ContentType() {
        return <%= fieldName %>ContentType;
    }
    <%_ if (fluentMethods) { _%>

    public <%= entityClass %> <%= fieldName %>ContentType(String <%= fieldName %>ContentType) {
        this.<%= fieldName %>ContentType = <%= fieldName %>ContentType;
        return this;
    }
    <%_ } _%>

    public void set<%= fieldInJavaBeanMethod %>ContentType(String <%= fieldName %>ContentType) {
        this.<%= fieldName %>ContentType = <%= fieldName %>ContentType;
    }
    <%_ } _%>
<%_ } _%>
<%_
    for (idx in relationships) {
        var relationshipFieldName = relationships[idx].relationshipFieldName,
        relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural,
        relationshipType = relationships[idx].relationshipType,
        otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized,
        relationshipNameCapitalized = relationships[idx].relationshipNameCapitalized,
        relationshipNameCapitalizedPlural = relationships[idx].relationshipNameCapitalizedPlural,
        otherEntityName = relationships[idx].otherEntityName,
        otherEntityNamePlural = relationships[idx].otherEntityNamePlural,
        otherEntityRelationshipNameCapitalized = relationships[idx].otherEntityRelationshipNameCapitalized
        otherEntityRelationshipNameCapitalizedPlural = relationships[idx].otherEntityRelationshipNameCapitalizedPlural;
    _%>
    <%_ if (relationshipType == 'one-to-many' || relationshipType == 'many-to-many') { _%>

    public Set<<%= otherEntityNameCapitalized %>> get<%= relationshipNameCapitalizedPlural %>() {
        return <%= relationshipFieldNamePlural %>;
    }
        <%_ if (fluentMethods) { _%>

    public <%= entityClass %> <%= relationshipFieldNamePlural %>(Set<<%= otherEntityNameCapitalized %>> <%= otherEntityNamePlural %>) {
        this.<%= relationshipFieldNamePlural %> = <%= otherEntityNamePlural %>;
        return this;
    }

    public <%= entityClass %> add<%= relationshipNameCapitalized %>(<%= otherEntityNameCapitalized %> <%= otherEntityName %>) {
        <%= relationshipFieldNamePlural %>.add(<%= otherEntityName %>);
            <%_ if (relationshipType == 'one-to-many') { _%>
        <%= otherEntityName %>.set<%= otherEntityRelationshipNameCapitalized %>(this);
            <%_ } else if (otherEntityRelationshipNameCapitalizedPlural != '' && relationshipType == 'many-to-many') {
                // JHipster version < 3.6.0 didn't ask for this relationship name _%>
        <%= otherEntityName %>.get<%= otherEntityRelationshipNameCapitalizedPlural %>().add(this);
            <%_ } _%>
        return this;
    }

    public <%= entityClass %> remove<%= relationshipNameCapitalized %>(<%= otherEntityNameCapitalized %> <%= otherEntityName %>) {
        <%= relationshipFieldNamePlural %>.remove(<%= otherEntityName %>);
            <%_ if (relationshipType == 'one-to-many') { _%>
        <%= otherEntityName %>.set<%= otherEntityRelationshipNameCapitalized %>(null);
            <%_ } else if (otherEntityRelationshipNameCapitalizedPlural != '' && relationshipType == 'many-to-many') {
                // JHipster version < 3.6.0 didn't ask for this relationship name _%>
        <%= otherEntityName %>.get<%= otherEntityRelationshipNameCapitalizedPlural %>().remove(this);
            <%_ } _%>
        return this;
    }
        <%_ } _%>

    public void set<%= relationshipNameCapitalizedPlural %>(Set<<%= otherEntityNameCapitalized %>> <%= otherEntityNamePlural %>) {
        this.<%= relationshipFieldNamePlural %> = <%= otherEntityNamePlural %>;
    }
    <%_ } else { _%>

    public <%= otherEntityNameCapitalized %> get<%= relationshipNameCapitalized %>() {
        return <%= relationshipFieldName %>;
    }
        <%_ if (fluentMethods) { _%>

    public <%= entityClass %> <%= relationshipFieldName %>(<%= otherEntityNameCapitalized %> <%= otherEntityName %>) {
        this.<%= relationshipFieldName %> = <%= otherEntityName %>;
        return this;
    }
        <%_ } _%>

    public void set<%= relationshipNameCapitalized %>(<%= otherEntityNameCapitalized %> <%= otherEntityName %>) {
        this.<%= relationshipFieldName %> = <%= otherEntityName %>;
    }
    <%_ } _%>
<%_ } _%>

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
                <%_ if ((fieldType == 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent != 'text') { _%>
            ", <%= fieldName %>ContentType='" + <%= fieldName %>ContentType + "'" +
                <%_ } _%>
            <%_ } _%>
            '}';
    }
}
