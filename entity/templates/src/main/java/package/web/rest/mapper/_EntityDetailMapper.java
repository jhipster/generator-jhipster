package <%=packageName%>.web.rest.mapper;

import javax.inject.Inject;

import org.springframework.stereotype.Component;
import <%=packageName%>.web.rest.dto.<%= entityClass %>DetailsDTO;
import <%=packageName%>.web.rest.mapper.<%= entityClass %>Mapper;<%
  for (idx in differentTypes) { 
    var dtype = differentTypes[idx];
    if (dtype != entityClass) { %>
import <%=packageName%>.web.rest.mapper.<%= dtype %>DetailMapper;<% } %>
import <%=packageName%>.domain.<%= dtype %>;<% } %>

/**
 * Mapper between <%= entityClass %> and <%= entityClass %>DetailsDTO, which recursively load all the related entities.
 */
@Component
public class <%= entityClass %>DetailMapper extends AbstractMapper<<%= entityClass %>,<%= entityClass %>DetailsDTO> {

    @Inject
    private <%= entityClass %>Mapper listMapper;
<%
for (idx in differentTypes) { 
    var dtype = differentTypes[idx];
    if (dtype != entityClass) { %>
    @Inject
    private <%= dtype %>DetailMapper <%= dtype.toLowerCase() %>Mapper;<% } } %>

    @Override
    public <%= entityClass %>DetailsDTO map(<%= entityClass %> entity) {
        if (entity == null) {
            return null;
        }
        <%= entityClass %>DetailsDTO dto = listMapper.mapToDto(entity, new <%= entityClass %>DetailsDTO());<%
  for (relationshipId in relationships) { 
    var jType = relationships[relationshipId].otherEntityNameCapitalized;
    var fieldName = relationships[relationshipId].otherEntityName; 
    var rType = relationships[relationshipId].relationshipType;
    var relationNameCapitalized = relationships[relationshipId].relationshipNameCapitalized;
    var multi = rType=='one-to-many' || rType == 'many-to-many';
    var mapMethod = 'map';
    if (multi) {
      relationNameCapitalized = relationNameCapitalized + 's';
      mapMethod = 'mapList';
    }  
    var mapperName = (jType != entityClass ? fieldName + "Mapper." : "");
    %>
        dto.set<%= relationNameCapitalized %>(<%= mapperName %><%= mapMethod %>(entity.get<%= relationNameCapitalized %>()));<% 
  }%>
        return dto;
    }
}
