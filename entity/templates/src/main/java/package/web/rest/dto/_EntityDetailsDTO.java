package <%=packageName%>.web.rest.dto;

import java.io.Serializable;
import java.util.List;

/**
 * A <%= entityClass %>DetailsDTO used to send a <%= entityClass %> to the client for a detail screen or editing.
 * It will contain all the relations additionaly to the simple attributes.
 *
 */
public class <%= entityClass %>DetailsDTO extends <%= entityClass %>ListDTO implements Serializable {

    private static final long serialVersionUID = 1L;
<% for (relationshipId in relationships) { 
     var rType = relationships[relationshipId].relationshipType;
     var multi = rType=='one-to-many' || rType == 'many-to-many';
     var jType = relationships[relationshipId].otherEntityNameCapitalized+'DetailsDTO';
     var fieldName = relationships[relationshipId].relationshipName;
     if (multi) {
       jType = 'List<'+jType+'>';
       fieldName = fieldName + 's';
     }
     %>
    private <%= jType %> <%= fieldName %>;<% } %>

<%  
   for (relationshipId in relationships) { 
     var rType = relationships[relationshipId].relationshipType;
     var multi = rType=='one-to-many' || rType == 'many-to-many';
     var jType = relationships[relationshipId].otherEntityNameCapitalized+'DetailsDTO';
     var fieldName = relationships[relationshipId].relationshipName;
     var methodName = relationships[relationshipId].relationshipNameCapitalized;
     if (multi) {
       jType = 'List<'+jType+'>';
       fieldName = fieldName + 's';
       methodName = methodName + 's';
     }%>
    public <%= jType %> get<%= methodName %>() {
        return <%= fieldName %>;
    }

    public void set<%= methodName %>(<%= jType %> <%= fieldName %>) {
        this.<%= fieldName %> = <%= fieldName %>;
    }
<% } %>
}
