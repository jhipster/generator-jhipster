package <%=packageName%>.web.rest.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import <%=packageName%>.domain.util.CustomDateTimeDeserializer;
import <%=packageName%>.domain.util.CustomDateTimeSerializer;
import <%=packageName%>.domain.util.CustomLocalDateSerializer;
import <%=packageName%>.domain.util.ISO8601LocalDateDeserializer;
import org.joda.time.LocalDate;
import org.joda.time.DateTime;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;<% if (fieldsContainBigDecimal == true) { %>
import java.math.BigDecimal;<% } %>

/**
 * A <%= entityClass %>ListDTO used to send a list of entities to the client, 
 * For performance reasons no relation is sent - to avoid extra selects.
 *
 */<% var pkType = (databaseType == 'sql') ? "Long" : "String"; %>
public class <%= entityClass %>ListDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    protected <%= pkType %> id;
<% for (fieldId in fields) { %><% if (fields[fieldId].fieldType == 'LocalDate') { %>
    @JsonSerialize(using = CustomLocalDateSerializer.class)
    @JsonDeserialize(using = ISO8601LocalDateDeserializer.class)<% } else if (fields[fieldId].fieldType == 'DateTime') { %>
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @JsonSerialize(using = CustomDateTimeSerializer.class)<% } %>
    protected <%= fields[fieldId].fieldType %> <%= fields[fieldId].fieldName %>;
<% } %>
    public <%= pkType %> getId() {
        return id;
    }

    public void setId(<%= pkType %> id) {
        this.id = id;
    }
<% for (fieldId in fields) { %>
    public <%= fields[fieldId].fieldType %> get<%= fields[fieldId].fieldNameCapitalized %>() {
        return <%= fields[fieldId].fieldName %>;
    }

    public void set<%= fields[fieldId].fieldNameCapitalized %>(<%= fields[fieldId].fieldType %> <%= fields[fieldId].fieldName %>) {
        this.<%= fields[fieldId].fieldName %> = <%= fields[fieldId].fieldName %>;
    }
<% } %>

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + "{" +
                "id=" + id + <% for (fieldId in fields) { %>
                ",<%= fields[fieldId].fieldName %>=" + <%= fields[fieldId].fieldName %> + <% } %>
                '}';
    }
}
