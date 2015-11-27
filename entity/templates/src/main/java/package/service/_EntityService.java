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
     * @return the persisted entity
     */
    public <%= instanceType %> save(<%= instanceType %> <%= instanceName %>);

    /**
     *  get all the <%= entityInstance %>s.
     *  @return the list of entities
     */
    public <% if (pagination != 'no') { %>Page<<%= entityClass %><% } else { %>List<<%= instanceType %><% } %>> findAll(<% if (pagination != 'no') { %>Pageable pageable<% } %>);
<% for (idx in relationships) { if (relationships[idx].relationshipType == 'one-to-one' && relationships[idx].ownerSide != true) { -%>
    /**
     *  get all the <%= entityInstance %>s where <%= relationships[idx].relationshipNameCapitalized %> is null.
     *  @return the list of entities
     */
    public List<<%= instanceType %>> findAllWhere<%= relationships[idx].relationshipNameCapitalized %>IsNull();
<% } } -%>

    /**
     *  get the "id" <%= entityInstance %>.
     *  @return the entity
     */
    public <%= instanceType %> findOne(<%= pkType %> id);

    /**
     *  delete the "id" <%= entityInstance %>.
     */
    public void delete(<%= pkType %> id);<% if (searchEngine == 'elasticsearch') { %>

    /**
     * search for the <%= entityInstance %> corresponding
     * to the query.
     */
    public List<<%= instanceType %>> search(String query);<% } %>
}
