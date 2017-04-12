<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.service.mapper;

import <%=packageName%>.domain.*;
import <%=packageName%>.service.dto.<%= entityClass %>DTO;

import org.mapstruct.*;
import java.util.List;

/**
 * Mapper for the entity <%= entityClass %> and its DTO <%= entityClass %>DTO.
 */
@Mapper(componentModel = "spring", uses = {<% var existingMappings = [];
  for (idx in relationships) {
    if ((relationships[idx].relationshipType == 'many-to-many' && relationships[idx].ownerSide == true)|| relationships[idx].relationshipType == 'many-to-one' ||(relationships[idx].relationshipType == 'one-to-one' && relationships[idx].ownerSide == true)){
      // if the entity is mapped twice, we should implement the mapping once
      if (existingMappings.indexOf(relationships[idx].otherEntityNameCapitalized) == -1 && relationships[idx].otherEntityNameCapitalized !== entityClass) {
          existingMappings.push(relationships[idx].otherEntityNameCapitalized);
      %><%= relationships[idx].otherEntityNameCapitalized %>Mapper.class, <% } } } %>})
public interface <%= entityClass %>Mapper {
<%
// entity -> DTO mapping
for (idx in relationships) {
    const relationshipType = relationships[idx].relationshipType;
    const relationshipName = relationships[idx].relationshipName;
    const ownerSide = relationships[idx].ownerSide;
    if (relationshipType == 'many-to-one' || (relationshipType == 'one-to-one' && ownerSide == true)) {
    %>
    @Mapping(source = "<%= relationshipName %>.id", target = "<%= relationships[idx].relationshipFieldName %>Id")<% if (relationships[idx].otherEntityFieldCapitalized !='Id' && relationships[idx].otherEntityFieldCapitalized != '') { %>
    @Mapping(source = "<%= relationshipName %>.<%= relationships[idx].otherEntityField %>", target = "<%= relationships[idx].relationshipFieldName %><%= relationships[idx].otherEntityFieldCapitalized %>")<% } } } %>
    <%= entityClass %>DTO <%= entityInstance %>To<%= entityClass %>DTO(<%= entityClass %> <%= entityInstance %>);

    List<<%= entityClass %>DTO> <%= entityInstancePlural %>To<%= entityClass %>DTOs(List<<%= entityClass %>> <%= entityInstancePlural %>);
<%
// DTO -> entity mapping
for (idx in relationships) {
    const relationshipType = relationships[idx].relationshipType;
    const relationshipName = relationships[idx].relationshipName;
    const relationshipNamePlural = relationships[idx].relationshipNamePlural;
    const ownerSide = relationships[idx].ownerSide;
    if (relationshipType == 'many-to-one' || (relationshipType == 'one-to-one' && ownerSide == true)) { %>
    @Mapping(source = "<%= relationshipName %>Id", target = "<%= relationshipName %>")<% } else if (relationshipType == 'many-to-many' && ownerSide == false) { %>
    @Mapping(target = "<%= relationshipNamePlural %>", ignore = true)<% } else if (relationshipType == 'one-to-many') { %>
    @Mapping(target = "<%= relationshipNamePlural %>", ignore = true)<% } else if (relationshipType == 'one-to-one' && ownerSide == false) { %>
    @Mapping(target = "<%= relationshipName %>", ignore = true)<% } } %>
    <%= entityClass %> <%= entityInstance %>DTOTo<%= entityClass %>(<%= entityClass %>DTO <%= entityInstance %>DTO);

    List<<%= entityClass %>> <%= entityInstance %>DTOsTo<%= entityClassPlural %>(List<<%= entityClass %>DTO> <%= entityInstance %>DTOs);
    /**
     * generating the fromId for all mappers if the databaseType is sql, as the class has relationship to it might need it, instead of
     * creating a new attribute to know if the entity has any relationship from some other entity
     *
     * @param id id of the entity
     * @return the entity instance
     */
     <%if(databaseType === 'sql') { %>
    default <%= entityClass %> <%= entityInstance %>FromId(Long id) {
        if (id == null) {
            return null;
        }
        <%= entityClass %> <%= entityInstance %> = new <%= entityClass %>();
        <%= entityInstance %>.setId(id);
        return <%= entityInstance %>;
    }
    <%}%>

}
