<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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

/**
 * Mapper for the entity <%= entityClass %> and its DTO <%= entityClass %>DTO.
 */
@Mapper(componentModel = "spring", uses = {<% var existingMappings = [];
  for (idx in relationships) {
    if ((relationships[idx].relationshipType === 'many-to-many' && relationships[idx].ownerSide === true)|| relationships[idx].relationshipType === 'many-to-one' ||(relationships[idx].relationshipType === 'one-to-one' && relationships[idx].ownerSide === true)){
      // if the entity is mapped twice, we should implement the mapping once
      if (existingMappings.indexOf(relationships[idx].otherEntityNameCapitalized) === -1 && relationships[idx].otherEntityNameCapitalized !== entityClass) {
          existingMappings.push(relationships[idx].otherEntityNameCapitalized);
      %><%= relationships[idx].otherEntityNameCapitalized %>Mapper.class, <% } } } %>})
public interface <%= entityClass %>Mapper extends EntityMapper <<%= entityClass %>DTO, <%= entityClass %>> {<%
// entity -> DTO mapping
var renMapAnotEnt = false; //Render Mapping Annotation during Entity to DTO conversion?
for (idx in relationships) {
    const relationshipType = relationships[idx].relationshipType;
    const relationshipName = relationships[idx].relationshipName;
    const ownerSide = relationships[idx].ownerSide;
    if (relationshipType === 'many-to-one' || (relationshipType === 'one-to-one' && ownerSide === true)) {renMapAnotEnt = true;%>

    @Mapping(source = "<%= relationshipName %>.id", target = "<%= relationships[idx].relationshipFieldName %>Id")<% if (relationships[idx].otherEntityFieldCapitalized !='Id' && relationships[idx].otherEntityFieldCapitalized !== '') { %>
    @Mapping(source = "<%= relationshipName %>.<%= relationships[idx].otherEntityField %>", target = "<%= relationships[idx].relationshipFieldName %><%= relationships[idx].otherEntityFieldCapitalized %>")<% } } } %>
    <% if(renMapAnotEnt === true) { %><%= entityClass %>DTO toDto(<%= entityClass %> <%= entityInstance %>); <% } %><%
// DTO -> entity mapping
var renMapAnotDto = false;  //Render Mapping Annotation during DTO to Entity conversion?
for (idx in relationships) {
    const relationshipType = relationships[idx].relationshipType;
    const relationshipName = relationships[idx].relationshipName;
    const relationshipNamePlural = relationships[idx].relationshipNamePlural;
    const ownerSide = relationships[idx].ownerSide;
    if (relationshipType === 'many-to-one' || (relationshipType === 'one-to-one' && ownerSide === true)) {renMapAnotDto = true; %>

    @Mapping(source = "<%= relationshipName %>Id", target = "<%= relationshipName %>")<% } else if (relationshipType === 'many-to-many' && ownerSide === false) {renMapAnotDto = true; %>
    @Mapping(target = "<%= relationshipNamePlural %>", ignore = true)<% } else if (relationshipType === 'one-to-many') {renMapAnotDto = true; %>
    @Mapping(target = "<%= relationshipNamePlural %>", ignore = true)<% } else if (relationshipType === 'one-to-one' && ownerSide === false) {renMapAnotDto = true; %>
    @Mapping(target = "<%= relationshipName %>", ignore = true)<% } } %>
    <% if(renMapAnotDto === true) { %><%= entityClass %> toEntity(<%= entityClass%>DTO <%= entityInstance %>DTO); <% } %>
    <%_ if(databaseType === 'sql') { _%>
    default <%= entityClass %> fromId(Long id) {
        if (id == null) {
            return null;
        }
        <%= entityClass %> <%= entityInstance %> = new <%= entityClass %>();
        <%= entityInstance %>.setId(id);
        return <%= entityInstance %>;
    }<%}%>
}
