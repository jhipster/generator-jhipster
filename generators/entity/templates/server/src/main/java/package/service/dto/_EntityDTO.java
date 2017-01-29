package <%=packageName%>.service.dto;

<%_ if (fieldsContainLocalDate == true) { _%>
import java.time.LocalDate;<% } %><% if (fieldsContainZonedDateTime == true) { %>
import java.time.ZonedDateTime;<% } %><% if (validation) { %>
import javax.validation.constraints.*;<% } %>
import java.io.Serializable;<% if (fieldsContainBigDecimal == true) { %>
import java.math.BigDecimal;<% } %><% if (fieldsContainBlob && databaseType === 'cassandra') { %>
import java.nio.ByteBuffer;<% } %><% if (relationships.length > 0) { %>
import java.util.HashSet;
import java.util.Set;<% } %>
import java.util.Objects;<% if (databaseType == 'cassandra') { %>
import java.util.UUID;<% } %><% if (fieldsContainBlob && databaseType === 'sql') { %>
import javax.persistence.Lob;<% } %>
<%_ for (idx in fields) { if (fields[idx].fieldIsEnum == true) { _%>
import <%=packageName%>.domain.enumeration.<%= fields[idx].fieldType %>;
<%_ } } _%>

/**
 * A DTO for the <%= entityClass %> entity.
 */
public class <%= entityClass %>DTO implements Serializable {
<% if (databaseType == 'sql') { %>
    private Long id;<% } %><% if (databaseType == 'mongodb') { %>
    private String id;<% } %><% if (databaseType == 'cassandra') { %>
    private UUID id;<% } %>
    <%_ for (idx in fields) {
        var fieldValidate = fields[idx].fieldValidate;
        var fieldValidateRules = fields[idx].fieldValidateRules;
        var fieldValidateRulesMinlength = fields[idx].fieldValidateRulesMinlength;
        var fieldValidateRulesMaxlength = fields[idx].fieldValidateRulesMaxlength;
        var fieldValidateRulesMinbytes = fields[idx].fieldValidateRulesMinbytes;
        var fieldValidateRulesMaxbytes = fields[idx].fieldValidateRulesMaxbytes;
        var fieldValidateRulesMin = fields[idx].fieldValidateRulesMin;
        var fieldValidateRulesMax = fields[idx].fieldValidateRulesMax;
        var fieldValidateRulesPatternJava = fields[idx].fieldValidateRulesPatternJava;
        var fieldType = fields[idx].fieldType;
        var fieldTypeBlobContent = fields[idx].fieldTypeBlobContent;
        var fieldName = fields[idx].fieldName;_%>

    <%_ if (fieldValidate == true) {
            var required = false;
            if (fieldValidate == true && fieldValidateRules.indexOf('required') != -1) {
                required = true;
            } _%>
    <%- include ../../common/field_validators -%>
    <%_ } _%>
    <%_ if (fieldType == 'byte[]' && databaseType === 'sql') { _%>
    @Lob
    <%_ } _%>
    <%_ if (fieldTypeBlobContent != 'text') { _%>
    private <%= fieldType %> <%= fieldName %>;
    <%_ } else { _%>
    private String <%= fieldName %>;
    <%_ } _%>
    <%_ if ((fieldType == 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent != 'text') { _%>
    private String <%= fieldName %>ContentType;
        <%_ } _%>
    <%_ } _%>
    <%_ for (idx in relationships) {
        var otherEntityRelationshipName = relationships[idx].otherEntityRelationshipName,
        relationshipFieldName = relationships[idx].relationshipFieldName,
        relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural,
        relationshipType = relationships[idx].relationshipType,
        otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized,
        otherEntityFieldCapitalized = relationships[idx].otherEntityFieldCapitalized,
        ownerSide = relationships[idx].ownerSide; _%>
    <%_ if (relationshipType == 'many-to-many' && ownerSide == true) { _%>

    private Set<<%= otherEntityNameCapitalized %>DTO> <%= relationshipFieldNamePlural %> = new HashSet<>();
    <%_ } else if (relationshipType == 'many-to-one' || (relationshipType == 'one-to-one' && ownerSide == true)) { _%>

    private Long <%= relationshipFieldName %>Id;
    <%_ if (otherEntityFieldCapitalized !='Id' && otherEntityFieldCapitalized != '') { _%>

    private String <%= relationshipFieldName %><%= otherEntityFieldCapitalized %>;
    <%_ } } } _%>

    public <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb') { %>String<% } %><% if (databaseType == 'cassandra') { %>UUID<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb') { %>String<% } %><% if (databaseType == 'cassandra') { %>UUID<% } %> id) {
        this.id = id;
    }
    <%_ for (idx in fields) {
        var fieldType = fields[idx].fieldType;
        var fieldTypeBlobContent = fields[idx].fieldTypeBlobContent;
        var fieldInJavaBeanMethod = fields[idx].fieldInJavaBeanMethod;
        var fieldName = fields[idx].fieldName; _%>
    <%_ if(fieldTypeBlobContent != 'text') { _%>
    public <%= fieldType %> get<%= fieldInJavaBeanMethod %>() {
    <%_ } else { _%>
    public String get<%= fieldInJavaBeanMethod %>() {
    <%_ } _%>
        return <%= fieldName %>;
    }

    <%_ if(fieldTypeBlobContent != 'text') { _%>
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

    public void set<%= fieldInJavaBeanMethod %>ContentType(String <%= fieldName %>ContentType) {
        this.<%= fieldName %>ContentType = <%= fieldName %>ContentType;
    }
    <%_ } } _%>
    <%_ for (idx in relationships) {
        relationshipFieldName = relationships[idx].relationshipFieldName,
        relationshipFieldNamePlural = relationships[idx].relationshipFieldNamePlural,
        otherEntityName = relationships[idx].otherEntityName,
        otherEntityNamePlural = relationships[idx].otherEntityNamePlural,
        relationshipType = relationships[idx].relationshipType,
        otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized,
        otherEntityFieldCapitalized = relationships[idx].otherEntityFieldCapitalized,
        relationshipNameCapitalized = relationships[idx].relationshipNameCapitalized,
        relationshipNameCapitalizedPlural = relationships[idx].relationshipNameCapitalizedPlural,
        ownerSide = relationships[idx].ownerSide;
        if (relationshipType == 'many-to-many' && ownerSide == true) { _%>

    public Set<<%= otherEntityNameCapitalized %>DTO> get<%= relationshipNameCapitalizedPlural %>() {
        return <%= relationshipFieldNamePlural %>;
    }

    public void set<%= relationshipNameCapitalizedPlural %>(Set<<%= otherEntityNameCapitalized %>DTO> <%= otherEntityNamePlural %>) {
        this.<%= relationshipFieldNamePlural %> = <%= otherEntityNamePlural %>;
    }
    <%_ } else if (relationshipType == 'many-to-one' || (relationshipType == 'one-to-one' && ownerSide == true)) { _%>

    <%_ if (relationshipNameCapitalized.length > 1) { _%>
    public Long get<%= relationshipNameCapitalized %>Id() {
        return <%= relationshipFieldName %>Id;
    }

    public void set<%= relationshipNameCapitalized %>Id(Long <%= otherEntityName %>Id) {
        this.<%= relationshipFieldName %>Id = <%= otherEntityName %>Id;
    }
    <%_ } else { // special case when the entity name has one character _%>
    public Long get<%= relationshipNameCapitalized.toLowerCase() %>Id() {
        return <%= relationshipFieldName %>Id;
    }

    public void set<%= relationshipNameCapitalized.toLowerCase() %>Id(Long <%= otherEntityName %>Id) {
        this.<%= relationshipFieldName %>Id = <%= otherEntityName %>Id;
    }
    <%_ } _%>
    <%_ if (otherEntityFieldCapitalized !='Id' && otherEntityFieldCapitalized != '') { _%>

    public String get<%= relationshipNameCapitalized %><%= otherEntityFieldCapitalized %>() {
        return <%= relationshipFieldName %><%= otherEntityFieldCapitalized %>;
    }

    public void set<%= relationshipNameCapitalized %><%= otherEntityFieldCapitalized %>(String <%= otherEntityName %><%= otherEntityFieldCapitalized %>) {
        this.<%= relationshipFieldName %><%= otherEntityFieldCapitalized %> = <%= otherEntityName %><%= otherEntityFieldCapitalized %>;
    }
    <%_ } } } _%>

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        <%= entityClass %>DTO <%= entityInstance %>DTO = (<%= entityClass %>DTO) o;

        if ( ! Objects.equals(id, <%= entityInstance %>DTO.id)) { return false; }

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "<%= entityClass %>DTO{" +
            "id=" + id +<% for (idx in fields) {
                var fieldName = fields[idx].fieldName; %>
            ", <%= fieldName %>='" + <%= fieldName %> + "'" +<% } %>
            '}';
    }
}
