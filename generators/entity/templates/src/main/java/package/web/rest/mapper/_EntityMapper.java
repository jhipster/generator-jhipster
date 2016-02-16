package <%=packageName%>.web.rest.mapper;

import <%=packageName%>.domain.*;
import <%=packageName%>.web.rest.dto.<%= entityClass %>DTO;

import org.mapstruct.*;
import java.util.List;

/**
 * Mapper for the entity <%= entityClass %> and its DTO <%= entityClass %>DTO.
 */
@Mapper(componentModel = "spring", uses = {<% for (relationshipId in relationships) {
    if ((relationships[relationshipId].relationshipType == 'many-to-many' && relationships[relationshipId].ownerSide == true) || relationships[relationshipId].otherEntityNameCapitalized == 'User') { %><%= relationships[relationshipId].otherEntityNameCapitalized %>Mapper.class, <% } } %>})
public interface <%= entityClass %>Mapper {
<%
// entity -> DTO mapping
for (relationshipId in relationships) {
    var relationshipType = relationships[relationshipId].relationshipType;
    var relationshipName = relationships[relationshipId].relationshipName;
    var ownerSide = relationships[relationshipId].ownerSide;
    if (relationshipType == 'many-to-one' || (relationshipType == 'one-to-one' && ownerSide == true)) {
    %>
    @Mapping(source = "<%= relationshipName %>.id", target = "<%= relationships[relationshipId].relationshipFieldName %>Id")<% if (relationships[relationshipId].otherEntityFieldCapitalized !='Id' && relationships[relationshipId].otherEntityFieldCapitalized != '') { %>
    @Mapping(source = "<%= relationshipName %>.<%= relationships[relationshipId].otherEntityField %>", target = "<%= relationships[relationshipId].relationshipFieldName %><%= relationships[relationshipId].otherEntityFieldCapitalized %>")<% } } } %>
    <%= entityClass %>DTO <%= entityInstance %>To<%= entityClass %>DTO(<%= entityClass %> <%= entityInstance %>);

    List<<%= entityClass %>DTO> <%= entityInstancePlural %>To<%= entityClass %>DTOs(List<<%= entityClass %>> <%= entityInstancePlural %>);
<%
// DTO -> entity mapping
for (relationshipId in relationships) {
    var relationshipType = relationships[relationshipId].relationshipType;
    var relationshipName = relationships[relationshipId].relationshipName;
    var ownerSide = relationships[relationshipId].ownerSide;
    if (relationshipType == 'many-to-one' || (relationshipType == 'one-to-one' && ownerSide == true)) { %>
    @Mapping(source = "<%= relationshipName %>Id", target = "<%= relationshipName %>")<% } else if (relationshipType == 'many-to-many' && ownerSide == false) { %>
    @Mapping(target = "<%= relationshipName %>s", ignore = true)<% } else if (relationshipType == 'one-to-many') { %>
    @Mapping(target = "<%= relationshipName %>s", ignore = true)<% } else if (relationshipType == 'one-to-one' && ownerSide == false) { %>
    @Mapping(target = "<%= relationshipName %>", ignore = true)<% } } %>
    <%= entityClass %> <%= entityInstance %>DTOTo<%= entityClass %>(<%= entityClass %>DTO <%= entityInstance %>DTO);

    List<<%= entityClass %>> <%= entityInstance %>DTOsTo<%= entityClassPlural %>(List<<%= entityClass %>DTO> <%= entityInstance %>DTOs);<%

// the user mapping is imported in the @Mapper annotation
var existingMappings = ['user'];
for (relationshipId in relationships) {
    var relationshipType = relationships[relationshipId].relationshipType;
    var otherEntityName = relationships[relationshipId].otherEntityName;
    var otherEntityNameCapitalized = relationships[relationshipId].otherEntityNameCapitalized;
    var ownerSide = relationships[relationshipId].ownerSide;
    if (relationshipType == 'many-to-one' || (relationshipType == 'one-to-one' && ownerSide == true) || (relationshipType == 'many-to-many' && ownerSide == true)) {
        // if the entity is mapped twice, we should implement the mapping once
        if (existingMappings.indexOf(otherEntityName) == -1) {
            existingMappings.push(otherEntityName);
    %>

    default <%= otherEntityNameCapitalized %> <%= otherEntityName %>FromId(Long id) {
        if (id == null) {
            return null;
        }
        <%= otherEntityNameCapitalized %> <%= otherEntityName %> = new <%= otherEntityNameCapitalized %>();
        <%= otherEntityName %>.setId(id);
        return <%= otherEntityName %>;
    }<% } } } %>
}
