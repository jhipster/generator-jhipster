package <%=packageName%>.web.rest.mapper;

import javax.inject.Inject;

import org.springframework.stereotype.Component;
import <%=packageName%>.web.rest.dto.<%= entityClass %>UpdateDTO;
import <%=packageName%>.web.rest.dto.<%= entityClass %>ListDTO;<% if (relationships.length > 0) { %>
import java.util.HashSet;
import java.util.Set;
import <%=packageName%>.web.rest.dto.IdDTO;<% } %><%   
  for (idx in differentTypes) { 
    var dtype = differentTypes[idx];
    if (dtype != entityClass) { %>
import <%=packageName%>.web.rest.mapper.<%= dtype %>Mapper;<% } %>
import <%=packageName%>.domain.<%= dtype %>;
import <%=packageName%>.repository.<%= dtype %>Repository;<% } %>

/**
 * Mapper between <%= entityClass %> and <%= entityClass %>UpdateDTO and <%= entityClass %>ListDTO.
 */
@Component
public class <%= entityClass %>Mapper extends BaseMapper<<%= entityClass %>,<%= entityClass %>UpdateDTO,<%= entityClass %>ListDTO> {<%   
  for (idx in differentTypes) { 
    var dtype = differentTypes[idx]; %>
    @Inject
    private <%= dtype %>Repository <%= dtype.toLowerCase() %>Repository;<% } %>

    @Override
    public <%= entityClass %> merge(<%= entityClass %>UpdateDTO dto, <%= entityClass %> entity) {
        // do not map id<% for (fieldId in fields) { %>
        entity.set<%= fields[fieldId].fieldNameCapitalized %>(dto.get<%= fields[fieldId].fieldNameCapitalized %>());<% } 
  for (relationshipId in relationships) { 
    var jType = relationships[relationshipId].otherEntityNameCapitalized;
    var fieldName = relationships[relationshipId].otherEntityName; 
    var rType = relationships[relationshipId].relationshipType;
    var relationName = relationships[relationshipId].relationshipFieldName;
    var relationNameCapitalized = relationships[relationshipId].relationshipNameCapitalized;
    var multi = rType=='one-to-many' || rType == 'many-to-many';
    if (multi) { %>
        Set<<%= jType %>> <%= relationName %> = new HashSet<>();
        if (dto.get<%= relationNameCapitalized %>s() != null) {
            for (IdDTO id : dto.get<%= relationNameCapitalized %>s()) {
                <%= relationName %>.add(getReference(<%= jType.toLowerCase() %>Repository, id));
            }
        }
        entity.set<%= relationNameCapitalized %>s(<%= relationName %>);<% } else { %>
        entity.set<%= relationNameCapitalized %>(getReference(<%= jType.toLowerCase() %>Repository, dto.get<%= relationNameCapitalized %>())); <% 
    }
  }%>
        return entity;
    }

    public <X extends <%= entityClass %>ListDTO> X mapToDto(<%= entityClass %> entity, X dto) { 
        dto.setId(entity.getId()<% if (databaseType == 'cassandra') { %>.toString()<% } %>);<% for (fieldId in fields) { %>
        dto.set<%= fields[fieldId].fieldNameCapitalized %>(entity.get<%= fields[fieldId].fieldNameCapitalized %>());<% } %>
        return dto;
    }

    @Override
    public <%= entityClass %>ListDTO map(<%= entityClass %> entity) {
        if (entity == null) {
            return null;
        }
        return mapToDto(entity, new <%= entityClass %>ListDTO());
    }
}
