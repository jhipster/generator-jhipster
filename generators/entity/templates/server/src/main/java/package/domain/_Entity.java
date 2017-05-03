<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.domain;<%
let importApiModelProperty = false;
let importJsonignore = false;
let importSet = false;
const uniqueEnums = {}; %><%- include imports -%>
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
import java.nio.ByteBuffer;<% } %><% if (fieldsContainInstant == true) { %>
import java.time.Instant;<% } %><% if (fieldsContainLocalDate == true) { %>
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
@ApiModel(description = "<%- formatAsApiDescription(javadoc) %>")
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
    <%_ if (prodDatabaseType == 'mysql' || prodDatabaseType == 'mariadb') { _%>
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    <%_ }  else { _%>
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    <%_ } _%>
    private Long id;<% } %><% if (databaseType == 'mongodb') { %>
    @Id
    private String id;<% } %><% if (databaseType == 'cassandra') { %>
    @PartitionKey
    private UUID id;<% } %>

<%_ for (idx in fields) {
    if (typeof fields[idx].javadoc != 'undefined') { _%>
<%- formatAsFieldJavadoc(fields[idx].javadoc) %>
    <%_ }
    let required = false;
    const fieldValidate = fields[idx].fieldValidate;
    const fieldValidateRules = fields[idx].fieldValidateRules;
    const fieldValidateRulesMaxlength = fields[idx].fieldValidateRulesMaxlength;
    const fieldType = fields[idx].fieldType;
    const fieldTypeBlobContent = fields[idx].fieldTypeBlobContent;
    const fieldName = fields[idx].fieldName;
    const fieldNameUnderscored = fields[idx].fieldNameUnderscored;
    const fieldNameAsDatabaseColumn = fields[idx].fieldNameAsDatabaseColumn;
    if (fieldValidate == true) {
        if (fieldValidate == true && fieldValidateRules.indexOf('required') != -1) {
            required = true;
        } _%>
    <%- include ../common/field_validators -%>
    <%_ } _%>
    <%_ if (typeof fields[idx].javadoc != 'undefined') { _%>
    @ApiModelProperty(value = "<%- formatAsApiDescription(fields[idx].javadoc) %>"<% if (required) { %>, required = true<% } %>)
    <%_ } _%>
    <%_ if (databaseType == 'sql') {
        if (fields[idx].fieldIsEnum) { _%>
    @Enumerated(EnumType.STRING)
        <%_ }
        if (fieldType == 'byte[]') { _%>
    @Lob
        <%_ }
        if (['Instant', 'ZonedDateTime', 'LocalDate'].includes(fieldType)) { _%>
    @Column(name = "<%-fieldNameAsDatabaseColumn %>"<% if (required) { %>, nullable = false<% } %>)
        <%_ } else if (fieldType == 'BigDecimal') { _%>
    @Column(name = "<%-fieldNameAsDatabaseColumn %>", precision=10, scale=2<% if (required) { %>, nullable = false<% } %>)
        <%_ } else { _%>
    @Column(name = "<%-fieldNameAsDatabaseColumn %>"<% if (fieldValidate == true) { %><% if (fieldValidateRules.indexOf('maxlength') != -1) { %>, length = <%= fieldValidateRulesMaxlength %><% } %><% if (required) { %>, nullable = false<% } %><% } %>)
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
    @Column(name = "<%-fieldNameAsDatabaseColumn %>_content_type"<% if (required && databaseType !== 'cassandra') { %>, nullable = false<% } %>)
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
        const otherEntityRelationshipName = relationships[idx].otherEntityRelationshipName;
        const otherEntityRelationshipNamePlural = relationships[idx].otherEntityRelationshipNamePlural;
        const relationshipName = relationships[idx].relationshipName;
        const relationshipFieldName = relationships[idx].relationshipFieldName;
        const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
        const joinTableName = getJoinTableName(name, relationshipName, prodDatabaseType);
        const relationshipType = relationships[idx].relationshipType;
        const relationshipValidate = relationships[idx].relationshipValidate;
        const relationshipRequired = relationships[idx].relationshipRequired;
        const otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized;
        const ownerSide = relationships[idx].ownerSide;
        if (otherEntityRelationshipName != null) {
            mappedBy = otherEntityRelationshipName.charAt(0).toLowerCase() + otherEntityRelationshipName.slice(1)
        }
        if (typeof relationships[idx].javadoc != 'undefined') { _%>
<%- formatAsFieldJavadoc(relationships[idx].javadoc) %>
    @ApiModelProperty(value = "<%- formatAsApiDescription(relationships[idx].javadoc) %>")
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
    @ManyToOne<% if (relationshipRequired) { %>(optional = false)<% } %>
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
               joinColumns = @JoinColumn(name="<%= getPluralColumnName(name) %>_id", referencedColumnName="id"),
               inverseJoinColumns = @JoinColumn(name="<%= getPluralColumnName(relationships[idx].relationshipName) %>_id", referencedColumnName="id"))
    <%_     } _%>
    private Set<<%= otherEntityNameCapitalized %>> <%= relationshipFieldNamePlural %> = new HashSet<>();

    <%_ } else { _%>
    <%_     if (ownerSide) { _%>
    @OneToOne<% if (relationshipRequired) { %>(optional = false)<% } %>
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
        const fieldType = fields[idx].fieldType;
        const fieldTypeBlobContent = fields[idx].fieldTypeBlobContent;
        const fieldName = fields[idx].fieldName;
        const fieldInJavaBeanMethod = fields[idx].fieldInJavaBeanMethod; _%>

    <%_ if (fieldTypeBlobContent != 'text') { _%>
    public <%= fieldType %> <% if (fieldType.toLowerCase() == 'boolean') { %>is<% } else { %>get<%_ } _%><%= fieldInJavaBeanMethod %>() {
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
        const relationshipFieldName = relationships[idx].relationshipFieldName;
        const relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural;
        const relationshipType = relationships[idx].relationshipType;
        const otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized;
        const relationshipNameCapitalized = relationships[idx].relationshipNameCapitalized;
        const relationshipNameCapitalizedPlural = relationships[idx].relationshipNameCapitalizedPlural;
        const otherEntityName = relationships[idx].otherEntityName;
        const otherEntityNamePlural = relationships[idx].otherEntityNamePlural;
        const otherEntityRelationshipNameCapitalized = relationships[idx].otherEntityRelationshipNameCapitalized;
        const otherEntityRelationshipNameCapitalizedPlural = relationships[idx].otherEntityRelationshipNameCapitalizedPlural;
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
        this.<%= relationshipFieldNamePlural %>.add(<%= otherEntityName %>);
            <%_ if (relationshipType == 'one-to-many') { _%>
        <%= otherEntityName %>.set<%= otherEntityRelationshipNameCapitalized %>(this);
            <%_ } else if (otherEntityRelationshipNameCapitalizedPlural != '' && relationshipType == 'many-to-many') {
                // JHipster version < 3.6.0 didn't ask for this relationship name _%>
        <%= otherEntityName %>.get<%= otherEntityRelationshipNameCapitalizedPlural %>().add(this);
            <%_ } _%>
        return this;
    }

    public <%= entityClass %> remove<%= relationshipNameCapitalized %>(<%= otherEntityNameCapitalized %> <%= otherEntityName %>) {
        this.<%= relationshipFieldNamePlural %>.remove(<%= otherEntityName %>);
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
        if (<%= entityInstance %>.getId() == null || getId() == null) {
            return false;
        }
        return Objects.equals(getId(), <%= entityInstance %>.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "<%= entityClass %>{" +
            "id=" + getId() +
            <%_ for (idx in fields) {
                const fieldType = fields[idx].fieldType;
                const fieldTypeBlobContent = fields[idx].fieldTypeBlobContent;
                const fieldName = fields[idx].fieldName;
                const fieldNameCapitalized = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) _%>
            ", <%= fieldName %>='" + <% if (fieldType.toLowerCase() == 'boolean') { %>is<% } else { %>get<%_ } _%><%= fieldNameCapitalized %>() + "'" +
                <%_ if ((fieldType == 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent != 'text') { _%>
            ", <%= fieldName %>ContentType='" + <%= fieldName %>ContentType + "'" +
                <%_ } _%>
            <%_ } _%>
            "}";
    }
}
