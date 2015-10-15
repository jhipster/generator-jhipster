package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain.<%= entityClass %>;
import <%=packageName%>.repository.<%= entityClass %>Repository;<% if (searchEngine == 'elasticsearch') { %>
import <%=packageName%>.repository.search.<%= entityClass %>SearchRepository;<% } %>
import <%=packageName%>.web.rest.util.HeaderUtil;<% if (pagination != 'no') { %>
import <%=packageName%>.web.rest.util.PaginationUtil;<% } %><% if (dto == 'mapstruct') { %>
import <%=packageName%>.web.rest.dto.<%= entityClass %>DTO;
import <%=packageName%>.web.rest.mapper.<%= entityClass %>Mapper;<% } %>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (pagination != 'no') { %>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;<% } %>
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;<% if (dto == 'mapstruct') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;<% if (validation) { %>
import javax.validation.Valid;<% } %>
import java.net.URI;
import java.net.URISyntaxException;<% if (dto == 'mapstruct') { %>
import java.util.LinkedList;<% } %>
import java.util.List;
import java.util.Optional;<% if (databaseType == 'cassandra') { %>
import java.util.UUID;<% } %><% if (searchEngine == 'elasticsearch' || dto == 'mapstruct' || fieldsContainNoOwnerOneToOne == true) { %>
import java.util.stream.Collectors;<% } %><% if (searchEngine == 'elasticsearch' || fieldsContainNoOwnerOneToOne == true) { %>
import java.util.stream.StreamSupport;<% } %><% if (searchEngine == 'elasticsearch') { %>

import static org.elasticsearch.index.query.QueryBuilders.*;<% } %>

/**
 * REST controller for managing <%= entityClass %>.
 */
@RestController
@RequestMapping("/api")
public class <%= entityClass %>Resource {

    private final Logger log = LoggerFactory.getLogger(<%= entityClass %>Resource.class);

    @Inject
    private <%= entityClass %>Repository <%= entityInstance %>Repository;<% if (dto == 'mapstruct') { %>

    @Inject
    private <%= entityClass %>Mapper <%= entityInstance %>Mapper;<% } %><% if (searchEngine == 'elasticsearch') { %>

    @Inject
    private <%= entityClass %>SearchRepository <%= entityInstance %>SearchRepository;<% } %>

    /**
     * POST  /<%= entityInstance %>s -> Create a new <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<%
    var instanceType = (dto == 'mapstruct') ? entityClass + 'DTO' : entityClass;
    var instanceName = (dto == 'mapstruct') ? entityInstance + 'DTO' : entityInstance;
    var mapper = entityInstance  + 'Mapper';
    var dtoToEntity = mapper + '.'+ entityInstance +'DTOTo' + entityClass;
    var entityToDto = mapper + '.'+ entityInstance +'To' + entityClass + 'DTO';
    %>
    public ResponseEntity<<%= instanceType %>> create<%= entityClass %>(<% if (validation) { %>@Valid <% } %>@RequestBody <%= instanceType %> <%= instanceName %>) throws URISyntaxException {
        log.debug("REST request to save <%= entityClass %> : {}", <%= instanceName %>);
        if (<%= instanceName %>.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new <%= entityInstance %> cannot already have an ID").body(null);
        }<% if (dto == 'mapstruct') { %>
        <%= entityClass %> <%= entityInstance %> = <%= dtoToEntity %>(<%= instanceName %>);<% } %>
        <%= entityClass %> result = <%= entityInstance %>Repository.save(<%= entityInstance %>);<% if (searchEngine == 'elasticsearch') { %>
        <%= entityInstance %>SearchRepository.save(result);<% } %>
        return ResponseEntity.created(new URI("/api/<%= entityInstance %>s/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("<%= entityInstance %>", result.getId().toString()))
            .body(<% if (dto == 'mapstruct') { %><%= entityToDto %>(result)<% } else { %>result<% } %>);
    }

    /**
     * PUT  /<%= entityInstance %>s -> Updates an existing <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<<%= instanceType %>> update<%= entityClass %>(<% if (validation) { %>@Valid <% } %>@RequestBody <%= instanceType %> <%= instanceName %>) throws URISyntaxException {
        log.debug("REST request to update <%= entityClass %> : {}", <%= instanceName %>);
        if (<%= instanceName %>.getId() == null) {
            return create<%= entityClass %>(<%= instanceName %>);
        }<% if (dto == 'mapstruct') { %>
        <%= entityClass %> <%= entityInstance %> = <%= entityInstance %>Mapper.<%= entityInstance %>DTOTo<%= entityClass %>(<%= instanceName %>);<% } %>
        <%= entityClass %> result = <%= entityInstance %>Repository.save(<%= entityInstance %>);<% if (searchEngine == 'elasticsearch') { %>
        <%= entityInstance %>SearchRepository.save(<%= entityInstance %>);<% } %>
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("<%= entityInstance %>", <%= instanceName %>.getId().toString()))
            .body(<% if (dto == 'mapstruct') { %><%= entityToDto %>(result)<% } else { %>result<% } %>);
    }

    /**
     * GET  /<%= entityInstance %>s -> get all the <%= entityInstance %>s.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<% if (dto == 'mapstruct') { %>
    @Transactional(readOnly = true)<% } %><% if (pagination == 'no') { %>
    public List<<%= entityClass %><% if (dto == 'mapstruct') { %>DTO<% } %>> getAll<%= entityClass %>s(<% if (fieldsContainNoOwnerOneToOne == true) { %>@RequestParam(required = false) String filter<% } %>) {<% for (idx in relationships) { if (relationships[idx].relationshipType == 'one-to-one' && relationships[idx].ownerSide != true) { %>
        if ("<%= relationships[idx].relationshipName.toLowerCase() %>-is-null".equals(filter)) {
            log.debug("REST request to get all <%= entityClass %>s where <%= relationships[idx].relationshipName %> is null");
            return StreamSupport
                .stream(<%= entityInstance %>Repository.findAll().spliterator(), false)
                .filter(<%= entityInstance %> -> <%= entityInstance %>.get<%= relationships[idx].relationshipNameCapitalized %>() == null)<% if (dto == 'mapstruct') { %>
                .map(<%= entityInstance %> -> <%= entityInstance %>Mapper.<%= entityInstance %>To<%= entityClass %>DTO(<%= entityInstance %>))
                .collect(Collectors.toCollection(LinkedList::new));<% } else { %>
                .collect(Collectors.toList());<% } %>
        }
<% } } %>
        log.debug("REST request to get all <%= entityClass %>s");
        return <%= entityInstance %>Repository.<% if (fieldsContainOwnerManyToMany == true) { %>findAllWithEagerRelationships<% } else { %>findAll<% } %>()<% if (dto == 'mapstruct') { %>.stream()
            .map(<%= entityInstance %> -> <%= entityInstance %>Mapper.<%= entityInstance %>To<%= entityClass %>DTO(<%= entityInstance %>))
            .collect(Collectors.toCollection(LinkedList::new))<% } %>;<% } %><% if (pagination != 'no') { %>
    public ResponseEntity<List<<%= entityClass %><% if (dto == 'mapstruct') { %>DTO<% } %>>> getAll<%= entityClass %>s(Pageable pageable<% if (fieldsContainNoOwnerOneToOne == true) { %>, @RequestParam(required = false) String filter<% } %>)
        throws URISyntaxException {<% for (idx in relationships) { if (relationships[idx].relationshipType == 'one-to-one' && relationships[idx].ownerSide != true) { %>
        if ("<%= relationships[idx].relationshipName.toLowerCase() %>-is-null".equals(filter)) {
            log.debug("REST request to get all <%= entityClass %>s where <%= relationships[idx].relationshipName %> is null");
            return new ResponseEntity<>(StreamSupport
                .stream(<%= entityInstance %>Repository.findAll().spliterator(), false)
                .filter(<%= entityInstance %> -> <%= entityInstance %>.get<%= relationships[idx].relationshipNameCapitalized %>() == null)<% if (dto == 'mapstruct') { %>
                .map(<%= entityInstance %> -> <%= entityInstance %>Mapper.<%= entityInstance %>To<%= entityClass %>DTO(<%= entityInstance %>))<% } %>
                .collect(Collectors.toList()), HttpStatus.OK);
        }
        <% } } %>
        Page<<%= entityClass %>> page = <%= entityInstance %>Repository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/<%= entityInstance %>s");
        return new ResponseEntity<>(page.getContent()<% if (dto == 'mapstruct') { %>.stream()
            .map(<%= entityInstance %>Mapper::<%= entityInstance %>To<%= entityClass %>DTO)
            .collect(Collectors.toCollection(LinkedList::new))<% } %>, headers, HttpStatus.OK);<% } %>
    }

    /**
     * GET  /<%= entityInstance %>s/:id -> get the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<<%= entityClass %><% if (dto == 'mapstruct') { %>DTO<% } %>> get<%= entityClass %>(@PathVariable <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } %> id) {
        log.debug("REST request to get <%= entityClass %> : {}", id);<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        return Optional.ofNullable(<%= entityInstance %>Repository.<% if (fieldsContainOwnerManyToMany == true) { %>findOneWithEagerRelationships<% } else { %>findOne<% } %>(id))<% } %><% if (databaseType == 'cassandra') { %>
        return Optional.ofNullable(<%= entityInstance %>Repository.findOne(UUID.fromString(id)))<% } %><% if (dto == 'mapstruct') { %>
            .map(<%= entityInstance %>Mapper::<%= entityInstance %>To<%= entityClass %>DTO)<% } %>
            .map(<%= entityInstance %><% if (dto == 'mapstruct') { %>DTO<% } %> -> new ResponseEntity<>(
                <%= entityInstance %><% if (dto == 'mapstruct') { %>DTO<% } %>,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /<%= entityInstance %>s/:id -> delete the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s/{id}",
        method = RequestMethod.DELETE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete<%= entityClass %>(@PathVariable <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } %> id) {
        log.debug("REST request to delete <%= entityClass %> : {}", id);<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        <%= entityInstance %>Repository.delete(id);<% } %><% if (databaseType == 'cassandra') { %>
        <%= entityInstance %>Repository.delete(UUID.fromString(id));<% } %><% if (searchEngine == 'elasticsearch') { %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        <%= entityInstance %>SearchRepository.delete(id);<% } %><% if (databaseType == 'cassandra') { %>
        <%= entityInstance %>SearchRepository.delete(UUID.fromString(id));<% } %><% } %>
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("<%= entityInstance %>", id.toString())).build();
    }<% if (searchEngine == 'elasticsearch') { %>

    /**
     * SEARCH  /_search/<%= entityInstance %>s/:query -> search for the <%= entityInstance %> corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/<%= entityInstance %>s/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<<%= entityClass %><% if (dto == 'mapstruct') { %>DTO<% } %>> search<%= entityClass %>s(@PathVariable String query) {
        return StreamSupport
            .stream(<%= entityInstance %>SearchRepository.search(queryStringQuery(query)).spliterator(), false)<% if (dto == 'mapstruct') { %>
            .map(<%= entityInstance %>Mapper::<%= entityInstance %>To<%= entityClass %>DTO)<% } %>
            .collect(Collectors.toList());
    }<% } %>
}
