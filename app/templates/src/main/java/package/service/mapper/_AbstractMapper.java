package <%=packageName%>.service.mapper;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;

import <%=packageName%>.web.rest.dto.PageDTO;

/**
 * Mapper between source and destination type.
 *
 * @param <SOURCE>
 *            the database entity
 * @param <DETAILS>
 *            the view sent to the client
 */
public abstract class AbstractMapper<SOURCE, DESTINATION> {

    /**
     * Create DESTINATION object from the SOURCE object.
     * 
     * @param object
     *            the source object
     * @return the converted object 
     */
    public abstract DESTINATION map(SOURCE object);

    /**
     * Map a collection of source objects to a list of destination objects.
     *
     * @param objects
     *            the collection of source objects
     * @return the list of mapped objects.
     */
    public List<DESTINATION> mapList(Collection<SOURCE> objects) {
        if (objects == null) {
            return null;
        }
        final List<DESTINATION> details = new ArrayList<>(objects.size());
        for (final SOURCE entity : objects) {
            details.add(map(entity));
        }
        return details;
    }

    /**
     * Map a collection of source objects to a set of destination objects.
     *
     * @param objects
     *            the collection of source objects
     * @return the set of mapped objects.
     */
    public Set<DESTINATION> mapSet(Set<SOURCE> objects) {
        final Set<DESTINATION> details = new HashSet<>(objects.size());
        for (final SOURCE entity : objects) {
            details.add(map(entity));
        }
        return details;
    }

    /**
     * Map a spring data page of objects to a PageDTO which contains the destination objects.
     *
     * @param pageOfObjects
     *            a page of objects coming from Spring Data.
     * @return the page dto containing the mapped DTOs.
     */
    public PageDTO<DESTINATION> mapPage(Page<SOURCE> pageOfObjects) {
        return new PageDTO<DESTINATION>(
            pageOfObjects.getTotalElements(),
            pageOfObjects.getSize(),
            pageOfObjects.getTotalPages(),
            pageOfObjects.getNumber() + 1, // because the client use 1 based numbering ...
            mapList(pageOfObjects.getContent()));
    }

}
