package <%=packageName%>.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;<% if (databaseType == 'cassandra') { %>
import java.util.UUID;<% } %>

import javax.inject.Inject;<% if (validation) { %>
import javax.validation.Valid;<% } %>

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (pagination != 'no') { %>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;<% } %>
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.service.<%= entityClass %>Service;
import <%=packageName%>.web.rest.dto.<%= entityClass %>DTO;
import <%=packageName%>.web.rest.util.HeaderUtil;<% if (pagination != 'no') { %>
import <%=packageName%>.web.rest.util.PaginationUtil;<% } %>

/**
 * REST controller for managing <%= entityClass %>.
 */
@RestController
@RequestMapping("/api")
<%
  var dtoType = entityClass + 'DTO';
  var dtoName = entityInstance + 'DTO';
  var serviceName = entityInstance + 'Service';%>
public class <%= entityClass %>Resource {

    private final Logger log = LoggerFactory.getLogger(<%= entityClass %>Resource.class);

    @Inject
    private <%= entityClass %>Service <%= serviceName %>;

    /**
     * POST  /<%= entityInstance %>s -> Create a new <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<<%= dtoType %>> create(<% if (validation) { %>@Valid <% } %>@RequestBody <%= dtoType %> <%= dtoName %>) throws URISyntaxException {
        log.debug("REST request to save <%= entityClass %> : {}", <%= dtoName %>);
        if (<%= dtoName %>.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new <%= entityInstance %> cannot already have an ID").body(null);
        }
        <%= dtoType %> result = <%= serviceName %>.save(<%= dtoName %>);
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
    public ResponseEntity<<%= dtoType %>> update(<% if (validation) { %>@Valid <% } %>@RequestBody <%= dtoType %> <%= dtoName %>) throws URISyntaxException {
        log.debug("REST request to update <%= entityClass %> : {}", <%= dtoName %>);
        if (<%= dtoName %>.getId() == null) {
            return create(<%= dtoName %>);
        }
        <%= dtoType %> result = <%= serviceName %>.save(<%= dtoName %>);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert("<%= entityInstance %>", result.getId().toString()))
            .body(result);
    }

    /**
     * GET  /<%= entityInstance %>s -> get all the <%= entityInstance %>s.
     * @throws URISyntaxException
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<<%= dtoType %>>> getAll<%= entityClass %>s(Pageable pageable, @RequestParam(required = false) String filter) throws URISyntaxException { 
        log.debug("REST request to get all <%= entityClass %>s");
        Page<<%= dtoType %>> page = <%= serviceName %>.findOnePage(pageable, filter);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/<%= entityInstance %>s");
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /<%= entityInstance %>s/:id -> get the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s/{id}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<<%= dtoType %>> get<%= entityClass %>(@PathVariable <%= pkType %> id) {
        log.debug("REST request to get <%= entityClass %> : {}", id);
        return <%= serviceName %>.findOne(id)
            .map(dto -> new ResponseEntity<>(dto,HttpStatus.OK))
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
        log.debug("REST request to delete <%= entityClass %> : {}", id);
        <%= serviceName %>.delete(id);
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
    public List<<%= dtoType %>> search<%= entityClass %>s(@PathVariable String query) {
        return <%= serviceName %>.search(query);
    }<% } %>
}
