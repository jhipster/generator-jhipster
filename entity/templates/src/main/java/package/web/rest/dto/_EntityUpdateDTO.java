package <%=packageName%>.web.rest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import <%=packageName%>.domain.util.CustomDateTimeDeserializer;
import <%=packageName%>.domain.util.CustomDateTimeSerializer;
import <%=packageName%>.domain.util.CustomLocalDateSerializer;
import <%=packageName%>.domain.util.ISO8601LocalDateDeserializer;
import org.joda.time.LocalDate;
import org.joda.time.DateTime;
import java.io.Serializable;<% if (fieldsContainBigDecimal == true) { %>
import java.math.BigDecimal;<% } %><% if (relationships.length > 0) { %>
import java.util.List;<% } %><% if (validation) { %>
import javax.validation.constraints.*;<% } %>

/**
 * A DTO object sent by the client to update a <%= entityClass %> instance.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class <%= entityClass %>UpdateDTO implements Serializable {

    private static final long serialVersionUID = 1L;
    <% if (databaseType == 'sql') { %>
    private Long id;<% } %><% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>
    private String id;<% } %>
<% for (fieldId in fields) { %><% if (fields[fieldId].fieldValidate == true) {
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
    @Pattern(regexp = "<%= fields[fieldId].fieldValidateRulesPattern %>")<% } } %><% if (fields[fieldId].fieldType == 'LocalDate') { %>
    @JsonSerialize(using = CustomLocalDateSerializer.class)
    @JsonDeserialize(using = ISO8601LocalDateDeserializer.class)<% } else if (fields[fieldId].fieldType == 'DateTime') { %>
    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)<% } %>
    private <%= fields[fieldId].fieldType %> <%= fields[fieldId].fieldName %>;
<% } 
   for (relationshipId in relationships) { 
     var rType = relationships[relationshipId].relationshipType;
     var multi = rType=='one-to-many' || rType == 'many-to-many';
     var jType = 'IdDTO';
     var fieldName = relationships[relationshipId].relationshipName;
     if (multi) {
       jType = 'List<'+jType+'>';
       fieldName = fieldName + 's';
     }%>
    private <%= jType %> <%= fieldName %>;<% } %>

    public <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } %> id) {
        this.id = id;
    }
<% for (fieldId in fields) { %>
    public <%= fields[fieldId].fieldType %> get<%= fields[fieldId].fieldNameCapitalized %>() {
        return <%= fields[fieldId].fieldName %>;
    }

    public void set<%= fields[fieldId].fieldNameCapitalized %>(<%= fields[fieldId].fieldType %> <%= fields[fieldId].fieldName %>) {
        this.<%= fields[fieldId].fieldName %> = <%= fields[fieldId].fieldName %>;
    }
<% } 
   for (relationshipId in relationships) { 
     var rType = relationships[relationshipId].relationshipType;
     var multi = rType=='one-to-many' || rType == 'many-to-many';
     var jType = 'IdDTO';
     var fieldName = relationships[relationshipId].relationshipName;
     var methodName = relationships[relationshipId].relationshipNameCapitalized;
     if (multi) {
       jType = 'List<'+jType+'>';
       fieldName = fieldName + 's';
       methodName = methodName + 's';
     }%>
    public <%= jType %> get<%= methodName %>() {
        return <%= fieldName%>;
    }

    public void set<%= methodName %>(<%= jType %> <%= fieldName %>) {
        this.<%= fieldName %> = <%= fieldName %>;
    }
<% } %>
    @Override
    public String toString() {
        return "<%= entityClass %>UpdateDTO{" +
                "id=" + id + <% for (fieldId in fields) { %>
                ",<%= fields[fieldId].fieldName %>=" + <%= fields[fieldId].fieldName %> + <% } %>
                '}';
    }
}
