package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain.<%= entityClass %>;<% if (service != 'no') { %>
import <%=packageName%>.service.<%= entityClass %>Service;<% } else { %>
import <%=packageName%>.repository.<%= entityClass %>Repository;<% if (searchEngine == 'elasticsearch') { %>
import <%=packageName%>.repository.search.<%= entityClass %>SearchRepository;<% }} %>
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
    <% var viaService = service != 'no';
    var instanceType = (dto == 'mapstruct') ? entityClass + 'DTO' : entityClass;
    var instanceName = (dto == 'mapstruct') ? entityInstance + 'DTO' : entityInstance; -%>
    <%- include('../../common/inject_template', {viaService: viaService}); -%>
    /**
     * POST  /<%= entityInstance %>s -> Create a new <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<<%= instanceType %>> create<%= entityClass %>(<% if (validation) { %>@Valid <% } %>@RequestBody <%= instanceType %> <%= instanceName %>) throws URISyntaxException {
        log.debug("REST request to save <%= entityClass %> : {}", <%= instanceName %>);
        if (<%= instanceName %>.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("<%= entityInstance %>", "idexists", "A new <%= entityInstance %> cannot already have an ID")).body(null);
        }<%- include('../../common/save_template', {viaService: viaService}); -%>
        return ResponseEntity.created(new URI("/api/<%= entityInstance %>s/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("<%= entityInstance %>", result.getId().toString()))
            .body(result);
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
        }<%- include('../../common/save_template', {viaService: viaService}); -%>
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("<%= entityInstance %>", <%= instanceName %>.getId().toString()))
            .body(result);
    }

    /**
     * GET  /<%= entityInstance %>s -> get all the <%= entityInstance %>s.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<%- include('../../common/get_all_template', {viaService: viaService}); -%>

    /**
     * GET  /<%= entityInstance %>s/:id -> get the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<<%= instanceType %>> get<%= entityClass %>(@PathVariable <%= pkType %> id) {
        log.debug("REST request to get <%= entityClass %> : {}", id);<%- include('../../common/get_template', {viaService: viaService}); -%>
        return Optional.ofNullable(<%= instanceName %>)
            .map(result -> new ResponseEntity<>(
                result,
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
    public ResponseEntity<Void> delete<%= entityClass %>(@PathVariable <%= pkType %> id) {
        log.debug("REST request to delete <%= entityClass %> : {}", id);<%- include('../../common/delete_template', {viaService: viaService}); -%>
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
    public List<<%= instanceType %>> search<%= entityClass %>s(@PathVariable String query) {<%- include('../../common/search_template', {viaService: viaService}); -%>
    }<% } %>
}
