package <%=packageName%>.web.rest.mapper;

/**
 * Interface to merge an update DTO to an entity
 *
 * @param <ENTITY>
 *            the entity type
 * @param <DTO>
 *            the update dto type
 */
public interface Merger<ENTITY, DTO> {

    /**
     * Updates the entity from the DTO.
     *
     * @param dto
     *            the dto coming from the client
     * @param entity
     *            the entity to be updated
     * @return the updated entity
     */
    public abstract ENTITY merge(DTO dto, ENTITY entity);

}
