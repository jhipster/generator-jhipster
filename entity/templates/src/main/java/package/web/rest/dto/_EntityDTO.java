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
        if (fields[fieldId].fieldValidate == true) {
            var required = false;
            var MAX_VALUE = 2147483647;
            if (fields[fieldId].fieldValidate == true && fields[fieldId].fieldValidateRules.indexOf('required') != -1) {
                required = true;
            }
            if (required) { _%>

    @NotNull<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('minlength') != -1 && fields[fieldId].fieldValidateRules.indexOf('maxlength') == -1) { %>
    @Size(min = <%= fields[fieldId].fieldValidateRulesMinlength %>)<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('maxlength') != -1 && fields[fieldId].fieldValidateRules.indexOf('minlength') == -1) { %>
    @Size(max = <%= fields[fieldId].fieldValidateRulesMaxlength %>)<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('minlength') != -1 && fields[fieldId].fieldValidateRules.indexOf('maxlength') != -1) { %>
    @Size(min = <%= fields[fieldId].fieldValidateRulesMinlength %>, max = <%= fields[fieldId].fieldValidateRulesMaxlength %>)<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('minbytes') != -1 && fields[fieldId].fieldValidateRules.indexOf('maxbytes') == -1) { %>
    @Size(min = <%= fields[fieldId].fieldValidateRulesMinbytes %>)<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('maxbytes') != -1 && fields[fieldId].fieldValidateRules.indexOf('minbytes') == -1) { %>
    @Size(max = <%= fields[fieldId].fieldValidateRulesMaxbytes %>)<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('minbytes') != -1 && fields[fieldId].fieldValidateRules.indexOf('maxbytes') != -1) { %>
    @Size(min = <%= fields[fieldId].fieldValidateRulesMinbytes %>, max = <%= fields[fieldId].fieldValidateRulesMaxbytes %>)<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('min') != -1) { %>
    @Min(value = <%= fields[fieldId].fieldValidateRulesMin %>)<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('max') != -1) { %>
    @Max(value = <%= fields[fieldId].fieldValidateRulesMax %><%= (fields[fieldId].fieldValidateRulesMax > MAX_VALUE) ? 'L' : '' %>)<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('pattern') != -1) { %>
    @Pattern(regexp = "<%= fields[fieldId].fieldValidateRulesPatternJava %>")<% } } %><% if (fields[fieldId].fieldType == 'byte[]') { %>
    @Lob<% } %>
    private <%= fields[fieldId].fieldType %> <%= fields[fieldId].fieldName %>;
        <%_ if (fields[fieldId].fieldType == 'byte[]') { _%>

    private String <%= fields[fieldId].fieldName %>ContentType;
        <%_ } _%>
    <%_ } _%>
    <%_ for (relationshipId in relationships) {
    otherEntityRelationshipName = relationships[relationshipId].otherEntityRelationshipName;%><% if (relationships[relationshipId].relationshipType == 'many-to-many' && relationships[relationshipId].ownerSide == true) { _%>

    private Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>DTO> <%= relationships[relationshipId].relationshipFieldName %>s = new HashSet<>();
    <%_ } else if (relationships[relationshipId].relationshipType == 'many-to-one' || (relationships[relationshipId].relationshipType == 'one-to-one' && relationships[relationshipId].ownerSide == true)) { _%>

    private Long <%= relationships[relationshipId].relationshipFieldName %>Id;<% if (relationships[relationshipId].otherEntityFieldCapitalized !='Id' && relationships[relationshipId].otherEntityFieldCapitalized != '') { %>

    private String <%= relationships[relationshipId].relationshipFieldName %><%= relationships[relationshipId].otherEntityFieldCapitalized %>;
    <%_ } } } _%>

    public <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb') { %>String<% } %><% if (databaseType == 'cassandra') { %>UUID<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb') { %>String<% } %><% if (databaseType == 'cassandra') { %>UUID<% } %> id) {
        this.id = id;
    }
    <%_ for (fieldId in fields) { _%>

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
    <%_ } } _%>
    <%_ for (relationshipId in relationships) {
        if (relationships[relationshipId].relationshipType == 'many-to-many' && relationships[relationshipId].ownerSide == true) { _%>

    public Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>DTO> get<%= relationships[relationshipId].relationshipNameCapitalized %>s() {
        return <%= relationships[relationshipId].relationshipFieldName %>s;
    }

    public void set<%= relationships[relationshipId].relationshipNameCapitalized %>s(Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>DTO> <%= relationships[relationshipId].otherEntityName %>s) {
        this.<%= relationships[relationshipId].relationshipFieldName %>s = <%= relationships[relationshipId].otherEntityName %>s;
    }
    <%_ } else if (relationships[relationshipId].relationshipType == 'many-to-one' || (relationships[relationshipId].relationshipType == 'one-to-one' && relationships[relationshipId].ownerSide == true)) { _%>

    public Long get<%= relationships[relationshipId].relationshipNameCapitalized %>Id() {
        return <%= relationships[relationshipId].relationshipFieldName %>Id;
    }

    public void set<%= relationships[relationshipId].relationshipNameCapitalized %>Id(Long <%= relationships[relationshipId].otherEntityName %>Id) {
        this.<%= relationships[relationshipId].relationshipFieldName %>Id = <%= relationships[relationshipId].otherEntityName %>Id;
    }<% if (relationships[relationshipId].otherEntityFieldCapitalized !='Id' && relationships[relationshipId].otherEntityFieldCapitalized != '') { %>

    public String get<%= relationships[relationshipId].relationshipNameCapitalized %><%= relationships[relationshipId].otherEntityFieldCapitalized %>() {
        return <%= relationships[relationshipId].relationshipFieldName %><%= relationships[relationshipId].otherEntityFieldCapitalized %>;
    }

    public void set<%= relationships[relationshipId].relationshipNameCapitalized %><%= relationships[relationshipId].otherEntityFieldCapitalized %>(String <%= relationships[relationshipId].otherEntityName %><%= relationships[relationshipId].otherEntityFieldCapitalized %>) {
        this.<%= relationships[relationshipId].relationshipFieldName %><%= relationships[relationshipId].otherEntityFieldCapitalized %> = <%= relationships[relationshipId].otherEntityName %><%= relationships[relationshipId].otherEntityFieldCapitalized %>;
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
            "id=" + id +<% for (fieldId in fields) { %>
            ", <%= fields[fieldId].fieldName %>='" + <%= fields[fieldId].fieldName %> + "'" +<% } %>
            '}';
    }
}
