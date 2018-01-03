<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

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
package <%=packageName%>.service;
<%  const instanceType = (dto === 'mapstruct') ? entityClass + 'DTO' : entityClass;
    const instanceName = (dto === 'mapstruct') ? entityInstance + 'DTO' : entityInstance; %>
<%_ if (dto === 'mapstruct') { _%>
import <%=packageName%>.service.dto.<%= entityClass %>DTO;
<%_ } else { _%>
import <%=packageName%>.domain.<%= entityClass %>;
<%_ } _%>
<%_ if (pagination !== 'no') { _%>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
<%_ } _%>
<%_ if (pagination === 'no' || fieldsContainNoOwnerOneToOne === true) { _%>
import java.util.List;
<%_ } _%>

/**
 * Service Interface for managing <%= entityClass %>.
 */
public interface <%= entityClass %>Service {

    /**
     * Save a <%= entityInstance %>.
     *
     * @param <%= instanceName %> the entity to save
     * @return the persisted entity
     */
    <%= instanceType %> save(<%= instanceType %> <%= instanceName %>);

    /**
     * Get all the <%= entityInstancePlural %>.
     *<% if (pagination !== 'no') { %>
     * @param pageable the pagination information<% } %>
     * @return the list of entities
     */
    <% if (pagination !== 'no') { %>Page<<%= instanceType %><% } else { %>List<<%= instanceType %><% } %>> findAll(<% if (pagination !== 'no') { %>Pageable pageable<% } %>);
<% for (idx in relationships) { if (relationships[idx].relationshipType === 'one-to-one' && relationships[idx].ownerSide !== true) { -%>
    /**
     * Get all the <%= entityClass %>DTO where <%= relationships[idx].relationshipNameCapitalized %> is null.
     *
     * @return the list of entities
     */
    List<<%= instanceType %>> findAllWhere<%= relationships[idx].relationshipNameCapitalized %>IsNull();
<% } } -%>

    /**
     * Get the "id" <%= entityInstance %>.
     *
     * @param id the id of the entity
     * @return the entity
     */
    <%= instanceType %> findOne(<%= pkType %> id);

    /**
     * Delete the "id" <%= entityInstance %>.
     *
     * @param id the id of the entity
     */
    void delete(<%= pkType %> id);<% if (searchEngine === 'elasticsearch') { %>

    /**
     * Search for the <%= entityInstance %> corresponding to the query.
     *
     * @param query the query of the search
     * <% if (pagination !== 'no') { %>
     * @param pageable the pagination information<% } %>
     * @return the list of entities
     */
    <% if (pagination !== 'no') { %>Page<<%= instanceType %><% } else { %>List<<%= instanceType %><% } %>> search(String query<% if (pagination !== 'no') { %>, Pageable pageable<% } %>);<% } %>
}
