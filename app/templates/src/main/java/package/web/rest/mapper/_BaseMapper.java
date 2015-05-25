package <%=packageName%>.web.rest.mapper;
<% if (databaseType == 'sql') { %>
import org.springframework.data.jpa.repository.JpaRepository;<% } else { %>
import org.springframework.data.repository.PagingAndSortingRepository;<% } %>
import <%=packageName%>.web.rest.dto.IdDTO;

/**
 * Mapper between the entity, the update dto, and the details dto.
 *
 * @param <ENTITY>
 *            the database entity
 * @param <UPDATE>
 *            the dto used for updating the entity
 * @param <DETAILS>
 *            the detailed view for the client
 */
public abstract class BaseMapper<ENTITY, UPDATE, DETAILS> extends
        AbstractMapper<ENTITY, DETAILS> implements Merger<ENTITY, UPDATE> {

<% if (databaseType == 'sql') { %>
    /**
     * Return a reference for an entity - without querying the database.
     *
     * @param repository
     *            the repository to ask for
     * @param id
     *            the id of the entity.
     * @return the reference
     */
    protected <X> X getReference(JpaRepository<X, Long> repository, IdDTO id) {
        if (id != null) {
            return repository.getOne(id.getId());
        }
        return null;
    }
<% } else { %>
    /**
     * Load an entity - with querying the database.
     *
     * @param repository
     *            the repository to ask for
     * @param id
     *            the id of the entity.
     * @return the reference
     */
    protected <X> X getReference(PagingAndSortingRepository<X, String> repository, IdDTO id) {
        if (id != null) {
            return repository.findOne(id.getId());
        }
        return null;
    }
<% } %>
}

