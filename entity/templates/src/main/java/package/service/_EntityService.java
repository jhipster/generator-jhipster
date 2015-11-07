package <%=packageName%>.service;
<%
    var dtoType = entityClass + 'DTO' ;
    var mapper = entityInstance  + 'Mapper';
    var dtoToEntity = mapper + '.'+ entityInstance +'DTOTo' + entityClass;
    var entityToDto = mapper + '.'+ entityInstance +'To' + entityClass + 'DTO';
    var entityToDtoReference = mapper + '::'+ entityInstance +'To' + entityClass + 'DTO';
    var repository = entityInstance  + 'Repository';
    var searchRepository = entityInstance  + 'SearchRepository'; %>
import java.util.List;
import java.util.Optional;<% if (databaseType == 'cassandra') { %>
import java.util.UUID;<% } %>
import java.util.stream.Collectors;<% if (searchEngine == 'elasticsearch' || fieldsContainNoOwnerOneToOne == true) { %>
import java.util.stream.StreamSupport;<% } %>

import javax.inject.Inject;

import org.apache.commons.lang3.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import <%=packageName%>.domain.<%= entityClass %>;
import <%=packageName%>.repository.<%= entityClass %>Repository;<% if (searchEngine == 'elasticsearch') { %>
import <%=packageName%>.repository.search.<%= entityClass %>SearchRepository;<% } %>
import <%=packageName%>.web.rest.dto.<%= dtoType %>;
import <%=packageName%>.web.rest.mapper.<%= entityClass %>Mapper;<% if (searchEngine == 'elasticsearch') { %>

import static org.elasticsearch.index.query.QueryBuilders.*;<% } %>

/**
 * Service to handle <%= entityClass %> related functionalities.
 *
 */
@Service<% if (databaseType == 'sql') { %>
@Transactional(readOnly = true)<% } %>
public class <%=entityClass%>Service {

    private final Logger log = LoggerFactory.getLogger(<%= entityClass %>Service.class);

    @Inject
    private <%= entityClass %>Repository <%= repository %>;<% if (dto == 'mapstruct') { %>

    @Inject
    private <%= entityClass %>Mapper <%= mapper %>;<% } %><% if (searchEngine == 'elasticsearch') { %>

    @Inject
    private <%= entityClass %>SearchRepository <%= searchRepository %>;<% } %>

    /**
     * Creates or updates one <%= entityClass %> in the database.
     *
     * @param input the <%= entityClass %>
     * @return the persisted entity
     */<% if (databaseType == 'sql') { %>
    @Transactional(readOnly = false)<% } %>
    public <%= dtoType %> save(<%= dtoType %> input) {<% if (dto == 'mapstruct') { %>
        <%= entityClass %> <%= entityInstance %>;
        if (input.getId() == null) {
            <%= entityInstance %> = <%= dtoToEntity %>(input);
        } else {
            <%= entityClass %> loaded = <%= repository %>.findOne(input.getId());
            Validate.notNull(loaded, "missing <%= entityClass %> with id=" + input.getId());
            <%= entityInstance %> = <%= mapper %>.update(input, loaded);
        }
        <% } %>
        log.debug("saving {}", <%= entityInstance %>);
        <%= entityClass %> saved = <%= entityInstance %>Repository.save(<%= entityInstance %>);<% if (searchEngine == 'elasticsearch') { %>
        <%= entityInstance %>SearchRepository.save(saved);<% } %>
        return <% if (dto == 'mapstruct') { %><%= entityToDto %>(saved)<% } else { %>saved<% } %>;
    }

    /**
     * @return all the stored entities
     */
    public List<<%= dtoType %>> findAll() {
        return <%=entityInstance%>Repository.findAll().stream()
            .map(<%= entityToDtoReference %>)
            .collect(Collectors.toList());
    }

    /**
     * @return one page of entities
     */
    public Page<<%=dtoType%>> findOnePage(Pageable page, String filter) {
        Page<<%= entityClass %>> result = <%= repository %>.findAll(page);
        List<<%= dtoType %>> dtoList = result.getContent().stream()
            .map(<%= entityToDtoReference %>)
            .collect(Collectors.toList());
        return new PageImpl<<%= dtoType %>>(dtoList, page, result.getTotalPages());
    }

    /**
     * @return the entity wrapped in an optional, or Optional.none, if not found.
     */
    public Optional<<%= dtoType %>> findOne(<%= pkType %> id) {
        return Optional.ofNullable(id)<% if (databaseType == 'cassandra') { %>
            .map(UUID::fromString)<% } %>
            .map(<%= repository %>::<% if (fieldsContainOwnerManyToMany == true) { %>findOneWithEagerRelationships<% } else { %>findOne<% } %>)
            .map(<%= entityToDtoReference %>);
    }

    /**
     * Deletes the entity
     */<% if (databaseType == 'sql') { %>
    @Transactional(readOnly = false)<% } %>
    public void delete(<%= pkType %> id) {
        Optional.ofNullable(id)<% if (databaseType == 'cassandra') { %>
            .map(UUID::fromString)<% } %>
            .ifPresent(entityId -> {
                <%=repository%>.delete(entityId);<% if (searchEngine == 'elasticsearch') { %>
                <%= searchRepository %>.delete(entityId);<% } %>
                });
    }
<% if (searchEngine == 'elasticsearch') { %>

    /**
     * Search for the <%= entityInstance %> corresponding to the query.
     */
    public List<<%= dtoType %>> search(String query) {
        return StreamSupport
            .stream(<%= entityInstance %>SearchRepository.search(queryString(query)).spliterator(), false)
            .map(<%= entityToDtoReference %>)
            .collect(Collectors.toList());
    }<% } %>
}
