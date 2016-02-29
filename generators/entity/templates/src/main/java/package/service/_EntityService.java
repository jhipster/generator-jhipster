package <%=packageName%>.service;
<%  var instanceType = (dto == 'mapstruct') ? entityClass + 'DTO' : entityClass;
    var instanceName = (dto == 'mapstruct') ? entityInstance + 'DTO' : entityInstance; %>
import <%=packageName%>.domain.<%= entityClass %>;<% if (dto == 'mapstruct') { %>
import <%=packageName%>.web.rest.dto.<%= entityClass %>DTO;<% } if (pagination != 'no') { %>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;<% } %>
<% if (dto == 'mapstruct') { %>
import java.util.LinkedList;<% } %>
import java.util.List;

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
     *  Get all the <%= entityInstancePlural %>.
     *  <% if (pagination != 'no') { %>
     *  @param pageable the pagination information<% } %>
     *  @return the list of entities
     */
    <% if (pagination != 'no') { %>Page<<%= entityClass %><% } else { %>List<<%= instanceType %><% } %>> findAll(<% if (pagination != 'no') { %>Pageable pageable<% } %>);
<% for (idx in relationships) { if (relationships[idx].relationshipType == 'one-to-one' && relationships[idx].ownerSide != true) { -%>
    /**
     *  Get all the <%= entityInstancePlural %> where <%= relationships[idx].relationshipNameCapitalized %> is null.
     *  
     *  @return the list of entities
     */
    List<<%= instanceType %>> findAllWhere<%= relationships[idx].relationshipNameCapitalized %>IsNull();
<% } } -%>

    /**
     *  Get the "id" <%= entityInstance %>.
     *  
     *  @param id the id of the entity
     *  @return the entity
     */
    <%= instanceType %> findOne(<%= pkType %> id);

    /**
     *  Delete the "id" <%= entityInstance %>.
     *  
     *  @param id the id of the entity
     */
    void delete(<%= pkType %> id);<% if (searchEngine == 'elasticsearch') { %>

    /**
     * Search for the <%= entityInstance %> corresponding to the query.
     * 
     *  @param query the query of the search
     *  @return the list of entities
     */
    <% if (pagination != 'no') { %>Page<<%= entityClass %><% } else { %>List<<%= instanceType %><% } %>> search(String query<% if (pagination != 'no') { %>, Pageable pageable<% } %>);<% } %>
}
