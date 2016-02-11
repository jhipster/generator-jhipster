package <%=packageName%>.web.rest.dto;
<% if (fieldsContainLocalDate == true) { %>
import java.time.LocalDate;<% } %><% if (fieldsContainZonedDateTime == true) { %>
import java.time.ZonedDateTime;<% } %><% if (validation) { %>
import javax.validation.constraints.*;<% } %>
import java.io.Serializable;<% if (fieldsContainBigDecimal == true) { %>
import java.math.BigDecimal;<% } %><% if (fieldsContainDate == true) { %>
import java.util.Date;<% } %><% if (relationships.length > 0) { %>
import java.util.HashSet;
import java.util.Set;<% } %>
import java.util.Objects;<% if (databaseType == 'cassandra') { %>
import java.util.UUID;<% } %><% if (fieldsContainBlob == true) { %>
import javax.persistence.Lob;<% } %>
<% for (fieldId in fields) { if (fields[fieldId].fieldIsEnum == true) { %>
import <%=packageName%>.domain.enumeration.<%= fields[fieldId].fieldType %>;<% } } %>

/**
 * A DTO for the <%= entityClass %> entity.
 */
public class <%= entityClass %>DTO implements Serializable {
<% if (databaseType == 'sql') { %>
    private Long id;<% } %><% if (databaseType == 'mongodb') { %>
    private String id;<% } %><% if (databaseType == 'cassandra') { %>
    private UUID id;<% } %>
    <%_ for (fieldId in fields) {
        var fieldValidate = fields[fieldId].fieldValidate;
        var fieldValidateRules = fields[fieldId].fieldValidateRules;
        var fieldValidateRulesMinlength = fields[fieldId].fieldValidateRulesMinlength;
        var fieldValidateRulesMaxlength = fields[fieldId].fieldValidateRulesMaxlength;
        var fieldValidateRulesMinbytes = fields[fieldId].fieldValidateRulesMinbytes;
        var fieldValidateRulesMaxbytes = fields[fieldId].fieldValidateRulesMaxbytes;
        var fieldValidateRulesMin = fields[fieldId].fieldValidateRulesMin;
        var fieldValidateRulesMax = fields[fieldId].fieldValidateRulesMax;
        var fieldValidateRulesPatternJava = fields[fieldId].fieldValidateRulesPatternJava;
        var fieldType = fields[fieldId].fieldType;
        var fieldTypeBlobContent = fields[fieldId].fieldTypeBlobContent;
        var fieldName = fields[fieldId].fieldName;
        if (fieldValidate == true) {
            var required = false;
            var MAX_VALUE = 2147483647;
            if (fieldValidate == true && fieldValidateRules.indexOf('required') != -1) {
                required = true;
            }
            if (required) { _%>

    @NotNull<% } %><% if (fieldValidateRules.indexOf('minlength') != -1 && fieldValidateRules.indexOf('maxlength') == -1) { %>
    @Size(min = <%= fieldValidateRulesMinlength %>)<% } %><% if (fieldValidateRules.indexOf('maxlength') != -1 && fieldValidateRules.indexOf('minlength') == -1) { %>
    @Size(max = <%= fieldValidateRulesMaxlength %>)<% } %><% if (fieldValidateRules.indexOf('minlength') != -1 && fieldValidateRules.indexOf('maxlength') != -1) { %>
    @Size(min = <%= fieldValidateRulesMinlength %>, max = <%= fieldValidateRulesMaxlength %>)<% } %><% if (fieldValidateRules.indexOf('minbytes') != -1 && fieldValidateRules.indexOf('maxbytes') == -1) { %>
    @Size(min = <%= fieldValidateRulesMinbytes %>)<% } %><% if (fieldValidateRules.indexOf('maxbytes') != -1 && fieldValidateRules.indexOf('minbytes') == -1) { %>
    @Size(max = <%= fieldValidateRulesMaxbytes %>)<% } %><% if (fieldValidateRules.indexOf('minbytes') != -1 && fieldValidateRules.indexOf('maxbytes') != -1) { %>
    @Size(min = <%= fieldValidateRulesMinbytes %>, max = <%= fieldValidateRulesMaxbytes %>)<% } %><% if (fieldValidateRules.indexOf('min') != -1) { %>
    @Min(value = <%= fieldValidateRulesMin %>)<% } %><% if (fieldValidateRules.indexOf('max') != -1) { %>
    @Max(value = <%= fieldValidateRulesMax %><%= (fieldValidateRulesMax > MAX_VALUE) ? 'L' : '' %>)<% } %><% if (fieldValidateRules.indexOf('pattern') != -1) { %>
    @Pattern(regexp = "<%= fieldValidateRulesPatternJava %>")<% } } %><% if (fieldType == 'byte[]') { %>
    @Lob<% } %>
    <%_ if (fieldTypeBlobContent != 'text') { _%>
    private <%= fieldType %> <%= fieldName %>;
    <%_ } else { _%>
    private String <%= fieldName %>;
    <%_ } %>
    <%_ if (fieldType == 'byte[]' && fieldTypeBlobContent != 'text') { _%>
    private String <%= fieldName %>ContentType;
        <%_ } _%>
    <%_ } _%>
    <%_ for (relationshipId in relationships) {
        var otherEntityRelationshipName = relationships[relationshipId].otherEntityRelationshipName,
        relationshipFieldName = relationships[relationshipId].relationshipFieldName,
        relationshipType = relationships[relationshipId].relationshipType,
        otherEntityNameCapitalized = relationships[relationshipId].otherEntityNameCapitalized,
        otherEntityFieldCapitalized = relationships[relationshipId].otherEntityFieldCapitalized,
        ownerSide = relationships[relationshipId].ownerSide; %><% if (relationshipType == 'many-to-many' && ownerSide == true) { _%>

    private Set<<%= otherEntityNameCapitalized %>DTO> <%= relationshipFieldName %>s = new HashSet<>();
    <%_ } else if (relationshipType == 'many-to-one' || (relationshipType == 'one-to-one' && ownerSide == true)) { _%>

    private Long <%= relationshipFieldName %>Id;<% if (otherEntityFieldCapitalized !='Id' && otherEntityFieldCapitalized != '') { %>

    private String <%= relationshipFieldName %><%= otherEntityFieldCapitalized %>;
    <%_ } } } _%>

    public <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb') { %>String<% } %><% if (databaseType == 'cassandra') { %>UUID<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb') { %>String<% } %><% if (databaseType == 'cassandra') { %>UUID<% } %> id) {
        this.id = id;
    }
    <%_ for (fieldId in fields) {
        var fieldType = fields[fieldId].fieldType;
        var fieldTypeBlobContent = fields[fieldId].fieldTypeBlobContent;
        var fieldInJavaBeanMethod = fields[fieldId].fieldInJavaBeanMethod;
        var fieldName = fields[fieldId].fieldName; _%>
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
    <%_ if (fieldType == 'byte[]' && fieldTypeBlobContent != 'text') { _%>

    public String get<%= fieldInJavaBeanMethod %>ContentType() {
        return <%= fieldName %>ContentType;
    }

    public void set<%= fieldInJavaBeanMethod %>ContentType(String <%= fieldName %>ContentType) {
        this.<%= fieldName %>ContentType = <%= fieldName %>ContentType;
    }
    <%_ } } _%>
    <%_ for (relationshipId in relationships) {
        relationshipFieldName = relationships[relationshipId].relationshipFieldName,
        otherEntityName = relationships[relationshipId].otherEntityName,
        relationshipType = relationships[relationshipId].relationshipType,
        otherEntityNameCapitalized = relationships[relationshipId].otherEntityNameCapitalized,
        otherEntityFieldCapitalized = relationships[relationshipId].otherEntityFieldCapitalized,
        relationshipNameCapitalized = relationships[relationshipId].relationshipNameCapitalized,
        ownerSide = relationships[relationshipId].ownerSide;
        if (relationshipType == 'many-to-many' && ownerSide == true) { _%>

    public Set<<%= otherEntityNameCapitalized %>DTO> get<%= relationshipNameCapitalized %>s() {
        return <%= relationshipFieldName %>s;
    }

    public void set<%= relationshipNameCapitalized %>s(Set<<%= otherEntityNameCapitalized %>DTO> <%= otherEntityName %>s) {
        this.<%= relationshipFieldName %>s = <%= otherEntityName %>s;
    }
    <%_ } else if (relationshipType == 'many-to-one' || (relationshipType == 'one-to-one' && ownerSide == true)) { _%>

    public Long get<%= relationshipNameCapitalized %>Id() {
        return <%= relationshipFieldName %>Id;
    }

    public void set<%= relationshipNameCapitalized %>Id(Long <%= otherEntityName %>Id) {
        this.<%= relationshipFieldName %>Id = <%= otherEntityName %>Id;
    }<% if (otherEntityFieldCapitalized !='Id' && otherEntityFieldCapitalized != '') { %>

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

        if ( ! Objects.equals(id, <%= entityInstance %>DTO.id)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "<%= entityClass %>DTO{" +
            "id=" + id +<% for (fieldId in fields) {
                var fieldName = fields[fieldId].fieldName; %>
            ", <%= fieldName %>='" + <%= fieldName %> + "'" +<% } %>
            '}';
    }
}
