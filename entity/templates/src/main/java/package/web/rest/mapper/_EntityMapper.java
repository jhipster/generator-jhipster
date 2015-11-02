package <%=packageName%>.web.rest.mapper;

import <%=packageName%>.domain.*;
import <%=packageName%>.web.rest.dto.<%= entityClass %>DTO;

import org.mapstruct.*;

/**
 * Mapper for the entity <%= entityClass %> and its DTO <%= entityClass %>DTO.
 */
@Mapper(componentModel = "spring", uses = {<% for (relationshipId in relationships) {
    if (relationships[relationshipId].relationshipType == 'many-to-many' && relationships[relationshipId].ownerSide == true) { %><%= relationships[relationshipId].otherEntityNameCapitalized %>Mapper.class, <% } } %>})
public interface <%= entityClass %>Mapper {
<%
// entity -> DTO mapping
for (relationshipId in relationships) {
        if (relationships[relationshipId].relationshipType == 'many-to-one' || (relationships[relationshipId].relationshipType == 'one-to-one' && relationships[relationshipId].ownerSide == true)) {
        %>
    @Mapping(source = "<%= relationships[relationshipId].relationshipName %>.id", target = "<%= relationships[relationshipId].relationshipFieldName %>Id")<% if (relationships[relationshipId].otherEntityFieldCapitalized !='Id' && relationships[relationshipId].otherEntityFieldCapitalized != '') { %>
    @Mapping(source = "<%= relationships[relationshipId].relationshipName %>.<%=relationships[relationshipId].otherEntityField %>", target = "<%= relationships[relationshipId].relationshipFieldName %><%= relationships[relationshipId].otherEntityFieldCapitalized %>")<% } } } %>
    <%= entityClass %>DTO <%= entityInstance %>To<%= entityClass %>DTO(<%= entityClass %> <%= entityInstance %>);
<%
// DTO -> entity mapping
for (relationshipId in relationships) {
        if (relationships[relationshipId].relationshipType == 'many-to-one' || (relationships[relationshipId].relationshipType == 'one-to-one' && relationships[relationshipId].ownerSide == true)) { %>
    @Mapping(source = "<%= relationships[relationshipId].relationshipName %>Id", target = "<%= relationships[relationshipId].relationshipName %>")<% } else if (relationships[relationshipId].relationshipType == 'many-to-many' && relationships[relationshipId].ownerSide == false) { %>
    @Mapping(target = "<%= relationships[relationshipId].relationshipName %>s", ignore = true)<% } else if (relationships[relationshipId].relationshipType == 'one-to-many') { %>
    @Mapping(target = "<%= relationships[relationshipId].relationshipName %>s", ignore = true)<% } else if (relationships[relationshipId].relationshipType == 'one-to-one' && relationships[relationshipId].ownerSide == false) { %>
    @Mapping(target = "<%= relationships[relationshipId].relationshipName %>", ignore = true)<% } } %>
    <%= entityClass %> <%= entityInstance %>DTOTo<%= entityClass %>(<%= entityClass %>DTO <%= entityInstance %>DTO);<%

for (relationshipId in relationships) {
    var existingMappings = [];
    if (relationships[relationshipId].relationshipType == 'many-to-one' || (relationships[relationshipId].relationshipType == 'one-to-one' && relationships[relationshipId].ownerSide == true) || (relationships[relationshipId].relationshipType == 'many-to-many' && relationships[relationshipId].ownerSide == true)) {
        // if the entity is mapped twice, we should implement the mapping once
        if (existingMappings.indexOf(relationships[relationshipId].otherEntityName) == -1) {
            existingMappings.push(relationships[relationshipId].otherEntityName);
    %>

    default <%= relationships[relationshipId].otherEntityNameCapitalized %> <%= relationships[relationshipId].otherEntityName %>FromId(Long id) {
        if (id == null) {
            return null;
        }
        <%= relationships[relationshipId].otherEntityNameCapitalized %> <%= relationships[relationshipId].otherEntityName %> = new <%= relationships[relationshipId].otherEntityNameCapitalized %>();
        <%= relationships[relationshipId].otherEntityName %>.setId(id);
        return <%= relationships[relationshipId].otherEntityName %>;
    }<% } } } %>
}
