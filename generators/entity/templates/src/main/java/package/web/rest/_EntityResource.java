package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
<%_ if (dto != 'mapstruct' || service == 'no') { _%>
import <%=packageName%>.domain.<%= entityClass %>;
<%_ } _%>
<%_ if (service != 'no') { _%>
import <%=packageName%>.service.<%= entityClass %>Service;<% } else { %>
import <%=packageName%>.repository.<%= entityClass %>Repository;<% if (searchEngine == 'elasticsearch') { %>
import <%=packageName%>.repository.search.<%= entityClass %>SearchRepository;<% }} %>
import <%=packageName%>.web.rest.util.HeaderUtil;<% if (pagination != 'no') { %>
import <%=packageName%>.web.rest.util.PaginationUtil;<% } %>
<%_ if (dto == 'mapstruct') { _%>
import <%=packageName%>.service.dto.<%= entityClass %>DTO;
<%_ if (service == 'no') { _%>
import <%=packageName%>.service.mapper.<%= entityClass %>Mapper;
<%_ } } _%>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (pagination != 'no') { %>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;<% } %>
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
     * POST  /<%= entityApiUrl %> : Create a new <%= entityInstance %>.
     *
     * @param <%= instanceName %> the <%= instanceName %> to create
     * @return the ResponseEntity with status 201 (Created) and with body the new <%= instanceName %>, or with status 400 (Bad Request) if the <%= entityInstance %> has already an ID
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @RequestMapping(value = "/<%= entityApiUrl %>",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<<%= instanceType %>> create<%= entityClass %>(<% if (validation) { %>@Valid <% } %>@RequestBody <%= instanceType %> <%= instanceName %>) throws URISyntaxException {
        log.debug("REST request to save <%= entityClass %> : {}", <%= instanceName %>);
        if (<%= instanceName %>.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("<%= entityInstance %>", "idexists", "A new <%= entityInstance %> cannot already have an ID")).body(null);
        }<%- include('../../common/save_template', {viaService: viaService}); -%>
        return ResponseEntity.created(new URI("/api/<%= entityApiUrl %>/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert("<%= entityInstance %>", result.getId().toString()))
            .body(result);
    }

    /**
     * PUT  /<%= entityApiUrl %> : Updates an existing <%= entityInstance %>.
     *
     * @param <%= instanceName %> the <%= instanceName %> to update
     * @return the ResponseEntity with status 200 (OK) and with body the updated <%= instanceName %>,
     * or with status 400 (Bad Request) if the <%= instanceName %> is not valid,
     * or with status 500 (Internal Server Error) if the <%= instanceName %> couldnt be updated
     * @throws URISyntaxException if the Location URI syntax is incorrect
     */
    @RequestMapping(value = "/<%= entityApiUrl %>",
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
     * GET  /<%= entityApiUrl %> : get all the <%= entityInstancePlural %>.
     *<% if (pagination != 'no') { %>
     * @param pageable the pagination information<% } if (fieldsContainNoOwnerOneToOne) { %>
     * @param filter the filter of the request<% } %>
     * @return the ResponseEntity with status 200 (OK) and the list of <%= entityInstancePlural %> in body<% if (pagination != 'no') { %>
     * @throws URISyntaxException if there is an error to generate the pagination HTTP headers<% } %>
     */
    @RequestMapping(value = "/<%= entityApiUrl %>",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<%- include('../../common/get_all_template', {viaService: viaService}); -%>

    /**
     * GET  /<%= entityApiUrl %>/:id : get the "id" <%= entityInstance %>.
     *
     * @param id the id of the <%= instanceName %> to retrieve
     * @return the ResponseEntity with status 200 (OK) and with body the <%= instanceName %>, or with status 404 (Not Found)
     */
    @RequestMapping(value = "/<%= entityApiUrl %>/{id}",
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
     * DELETE  /<%= entityApiUrl %>/:id : delete the "id" <%= entityInstance %>.
     *
     * @param id the id of the <%= instanceName %> to delete
     * @return the ResponseEntity with status 200 (OK)
     */
    @RequestMapping(value = "/<%= entityApiUrl %>/{id}",
        method = RequestMethod.DELETE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> delete<%= entityClass %>(@PathVariable <%= pkType %> id) {
        log.debug("REST request to delete <%= entityClass %> : {}", id);<%- include('../../common/delete_template', {viaService: viaService}); -%>
        return ResponseEntity.ok().headers(HeaderUtil.createEntityDeletionAlert("<%= entityInstance %>", id.toString())).build();
    }<% if (searchEngine == 'elasticsearch') { %>

    /**
     * SEARCH  /_search/<%= entityApiUrl %>?query=:query : search for the <%= entityInstance %> corresponding
     * to the query.
     *
     * @param query the query of the <%= entityInstance %> search <% if (pagination != 'no') { %>
     * @param pageable the pagination information<% } %>
     * @return the result of the search<% if (pagination != 'no') { %>
     * @throws URISyntaxException if there is an error to generate the pagination HTTP headers<% } %>
     */
    @RequestMapping(value = "/_search/<%= entityApiUrl %>",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<%- include('../../common/search_template', {viaService: viaService}); -%><% } %>

}
