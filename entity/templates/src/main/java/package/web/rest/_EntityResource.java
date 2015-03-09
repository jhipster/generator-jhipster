package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain.<%= entityClass %>;
import <%=packageName%>.repository.<%= entityClass %>Repository;<% if (pagination != 'no') { %>
import <%=packageName%>.web.rest.util.PaginationUtil;<% } %>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (pagination != 'no') { %>
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;<% } %>
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;<% if (validation) { %>
import javax.validation.Valid;<% } %>
import java.net.URI;
import java.net.URISyntaxException;<% if (javaVersion == '7') { %>
import javax.servlet.http.HttpServletResponse;<% } %>
import java.util.List;<% if (javaVersion == '8') { %>
import java.util.Optional;<% } %><% if (databaseType == 'cassandra') { %>
import java.util.UUID;<% } %>

/**
 * REST controller for managing <%= entityClass %>.
 */
@RestController
@RequestMapping("/api")
public class <%= entityClass %>Resource {

    private final Logger log = LoggerFactory.getLogger(<%= entityClass %>Resource.class);

    @Inject
    private <%= entityClass %>Repository <%= entityInstance %>Repository;

    /**
     * POST  /<%= entityInstance %>s -> Create a new <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> create(<% if (validation) { %>@Valid <% } %>@RequestBody <%= entityClass %> <%= entityInstance %>) throws URISyntaxException {
        log.debug("REST request to save <%= entityClass %> : {}", <%= entityInstance %>);
        if (<%= entityInstance %>.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new <%= entityInstance %> cannot already have an ID").build();
        }
        <%= entityInstance %>Repository.save(<%= entityInstance %>);
        return ResponseEntity.created(new URI("/api/<%= entityInstance %>s/" + <%= entityInstance %>.getId())).build();
    }

    /**
     * PUT  /<%= entityInstance %>s -> Updates an existing <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> update(<% if (validation) { %>@Valid <% } %>@RequestBody <%= entityClass %> <%= entityInstance %>) throws URISyntaxException {
        log.debug("REST request to update <%= entityClass %> : {}", <%= entityInstance %>);
        if (<%= entityInstance %>.getId() == null) {
            return create(<%= entityInstance %>);
        }
        <%= entityInstance %>Repository.save(<%= entityInstance %>);
        return ResponseEntity.ok().build();
    }

    /**
     * GET  /<%= entityInstance %>s -> get all the <%= entityInstance %>s.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<% if (pagination == 'no') { %>
    public List<<%= entityClass %>> getAll() {
        log.debug("REST request to get all <%= entityClass %>s");
        return <%= entityInstance %>Repository.findAll();<% } %><% if (pagination != 'no') { %>
    public ResponseEntity<List<<%= entityClass %>>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                  @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        Page<<%= entityClass %>> page = <%= entityInstance %>Repository.findAll(PaginationUtil.generatePageRequest(offset, limit));
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/<%= entityInstance %>s", offset, limit);
        return new ResponseEntity<<% if (javaVersion == '7') { %>List<<%= entityClass %>><% } %>>(page.getContent(), headers, HttpStatus.OK);<% } %>
    }

    /**
     * GET  /<%= entityInstance %>s/:id -> get the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<<%= entityClass %>> get(@PathVariable <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } %> id<% if (javaVersion == '7') { %>, HttpServletResponse response<% } %>) {
        log.debug("REST request to get <%= entityClass %> : {}", id);<% if (javaVersion == '8') { %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        return Optional.ofNullable(<%= entityInstance %>Repository.<% if (fieldsContainOwnerManyToMany == true) { %>findOneWithEagerRelationships<% } else { %>findOne<% } %>(id))<% } %><% if (databaseType == 'cassandra') { %>
        return Optional.ofNullable(<%= entityInstance %>Repository.findOne(UUID.fromString(id)))<% } %>
            .map(<%= entityInstance %> -> new ResponseEntity<>(
                <%= entityInstance %>,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));<% } else { %>
        <%= entityClass %> <%= entityInstance %> = <%= entityInstance %>Repository.<% if (fieldsContainOwnerManyToMany == true) { %>findOneWithEagerRelationships<% } else { %>findOne<% } %>(id);
        if (<%= entityInstance %> == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(<%= entityInstance %>, HttpStatus.OK);<% } %>
    }

    /**
     * DELETE  /<%= entityInstance %>s/:id -> delete the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } %> id) {
        log.debug("REST request to delete <%= entityClass %> : {}", id);<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        <%= entityInstance %>Repository.delete(id);<% } %><% if (databaseType == 'cassandra') { %>
        <%= entityInstance %>Repository.delete(UUID.fromString(id));<% } %>
    }
}
