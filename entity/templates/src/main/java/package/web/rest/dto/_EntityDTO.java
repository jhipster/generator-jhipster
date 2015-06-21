package <%=packageName%>.web.rest.dto;
<% if (fieldsContainCustomTime == true) { %>
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;<% } %><% if (fieldsContainLocalDate == true) { %>
import <%=packageName%>.domain.util.CustomLocalDateSerializer;
import <%=packageName%>.domain.util.ISO8601LocalDateDeserializer;<% } %><% if (fieldsContainDateTime == true) { %>
import <%=packageName%>.domain.util.CustomDateTimeDeserializer;
import <%=packageName%>.domain.util.CustomDateTimeSerializer;<% } %><% if (fieldsContainLocalDate == true) { %>
import org.joda.time.LocalDate;<% } %><% if (fieldsContainDateTime == true) { %>
import org.joda.time.DateTime;<% } %><% if (validation) { %>
import javax.validation.constraints.*;<% } %>
import java.io.Serializable;<% if (fieldsContainBigDecimal == true) { %>
import java.math.BigDecimal;<% } %><% if (fieldsContainDate == true) { %>
import java.util.Date;<% } %><% if (relationships.length > 0) { %>
import java.util.HashSet;
import java.util.Set;<% } %>
import java.util.Objects;<% if (databaseType == 'cassandra') { %>
import java.util.UUID;<% } %>
<% for (fieldId in fields) { if (fields[fieldId].fieldIsEnum == true) { %>
import <%=packageName%>.domain.enumeration.<%= fields[fieldId].fieldType %>;<% } } %>

/**
 * A DTO for the <%= entityClass %> entity.
 */
public class <%= entityClass %>DTO implements Serializable {
<% if (databaseType == 'sql') { %>
    private Long id;<% } %><% if (databaseType == 'mongodb') { %>
    private String id;<% } %><% if (databaseType == 'cassandra') { %>
    private UUID id;<% } %><% for (fieldId in fields) { %>
<% if (fields[fieldId].fieldValidate == true) {
    var required = false;
    if (fields[fieldId].fieldValidate == true && fields[fieldId].fieldValidateRules.indexOf('required') != -1) {
        required = true;
    }
    if (required) { %>
    @NotNull<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('minlength') != -1 && fields[fieldId].fieldValidateRules.indexOf('maxlength') == -1) { %>
    @Size(min = <%= fields[fieldId].fieldValidateRulesMinlength %>)<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('maxlength') != -1 && fields[fieldId].fieldValidateRules.indexOf('minlength') == -1) { %>
    @Size(max = <%= fields[fieldId].fieldValidateRulesMaxlength %>)<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('minlength') != -1 && fields[fieldId].fieldValidateRules.indexOf('maxlength') != -1) { %>
    @Size(min = <%= fields[fieldId].fieldValidateRulesMinlength %>, max = <%= fields[fieldId].fieldValidateRulesMaxlength %>)<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('min') != -1) { %>
    @Min(value = <%= fields[fieldId].fieldValidateRulesMin %>)<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('max') != -1) { %>
    @Max(value = <%= fields[fieldId].fieldValidateRulesMax %>)<% } %><% if (fields[fieldId].fieldValidateRules.indexOf('pattern') != -1) { %>
    @Pattern(regexp = "<%= fields[fieldId].fieldValidateRulesPattern %>")<% } } %><% if (fields[fieldId].fieldType == 'DateTime') { %>
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)<% } else if (fields[fieldId].fieldType == 'LocalDate') { %>
    @JsonSerialize(using = CustomLocalDateSerializer.class)
    @JsonDeserialize(using = ISO8601LocalDateDeserializer.class)<% } %>
    private <%= fields[fieldId].fieldType %> <%= fields[fieldId].fieldName %>;<% } %><% for (relationshipId in relationships) {
    otherEntityRelationshipName = relationships[relationshipId].otherEntityRelationshipName;%><% if (relationships[relationshipId].relationshipType == 'many-to-many' && relationships[relationshipId].ownerSide == true) { %>
    private Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>DTO> <%= relationships[relationshipId].relationshipFieldName %>s = new HashSet<>();<% } else if (relationships[relationshipId].relationshipType == 'many-to-one') { %>

    private Long <%= relationships[relationshipId].relationshipFieldName %>Id;<% if (relationships[relationshipId].otherEntityFieldCapitalized !='Id' && relationships[relationshipId].otherEntityFieldCapitalized != '') { %>

    private String <%= relationships[relationshipId].relationshipFieldName %><%= relationships[relationshipId].otherEntityFieldCapitalized %>;<% } } } %>

    public <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb') { %>String<% } %><% if (databaseType == 'cassandra') { %>UUID<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb') { %>String<% } %><% if (databaseType == 'cassandra') { %>UUID<% } %> id) {
        this.id = id;
    }<% for (fieldId in fields) { %>

    public <%= fields[fieldId].fieldType %> get<%= fields[fieldId].fieldInJavaBeanMethod %>() {
        return <%= fields[fieldId].fieldName %>;
    }

    public void set<%= fields[fieldId].fieldInJavaBeanMethod %>(<%= fields[fieldId].fieldType %> <%= fields[fieldId].fieldName %>) {
        this.<%= fields[fieldId].fieldName %> = <%= fields[fieldId].fieldName %>;
    }<% } %><% for (relationshipId in relationships) { %><% if (relationships[relationshipId].relationshipType == 'many-to-many' && relationships[relationshipId].ownerSide == true) { %>

    public Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>DTO> get<%= relationships[relationshipId].relationshipNameCapitalized %>s() {
        return <%= relationships[relationshipId].relationshipFieldName %>s;
    }

    public void set<%= relationships[relationshipId].relationshipNameCapitalized %>s(Set<<%= relationships[relationshipId].otherEntityNameCapitalized %>DTO> <%= relationships[relationshipId].otherEntityName %>s) {
        this.<%= relationships[relationshipId].relationshipFieldName %>s = <%= relationships[relationshipId].otherEntityName %>s;
    }<% } else if (relationships[relationshipId].relationshipType == 'many-to-one') { %>

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
    }<% } } } %>

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
