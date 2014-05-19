package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain.<%= entityType%>.<%= entityClass %>;
import <%=packageName%>.repository.<%= entityType%>.<%= entityClass %>Repository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * REST controller for managing <%= entityClass %>.
 */
@RestController
@RequestMapping("/app")
public class <%= entityClass %>Resource {

    private final Logger log = LoggerFactory.getLogger(<%= entityClass %>Resource.class);

    @Inject
    private <%= entityClass %>Repository <%= entityInstance %>Repository;

    /**
     * POST  /rest/<%= entityInstance %>s -> Create a new <%= entityInstance %>.
     */
    @RequestMapping(value = "/rest/<%= entityInstance %>s",
            method = RequestMethod.POST,
            produces = "application/json")
    @Timed
    public void create(@RequestBody <%= entityClass %> <%= entityInstance %>) {
        log.debug("REST request to save <%= entityClass %> : {}", <%= entityInstance %>);
        <%= entityInstance %>Repository.save(<%= entityInstance %>);
    }

    /**
     * GET  /rest/<%= entityInstance %>s -> get all the <%= entityInstance %>s.
     */
    @RequestMapping(value = "/rest/<%= entityInstance %>s",
            method = RequestMethod.GET,
            produces = "application/json")
    @Timed
    public List<<%= entityClass %>> getAll() {
        log.debug("REST request to get all <%= entityClass %>s");
        return <%= entityInstance %>Repository.findAll();
    }

    /**
     * GET  /rest/<%= entityInstance %>s/:id -> get the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/rest/<%= entityInstance %>s/{id}",
            method = RequestMethod.GET,
            produces = "application/json")
    @Timed
    public <%= entityClass %> get(@PathVariable <% if (prodDatabaseType != 'none') { %>Long<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>String<% } %> id, HttpServletResponse response) {
        log.debug("REST request to get <%= entityClass %> : {}", id);
        <%= entityClass %> <%= entityInstance %> = <%= entityInstance %>Repository.findOne(id);
        if (<%= entityInstance %> == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
        return <%= entityInstance %>;
    }

    /**
     * DELETE  /rest/<%= entityInstance %>s/:id -> delete the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/rest/<%= entityInstance %>s/{id}",
            method = RequestMethod.DELETE,
            produces = "application/json")
    @Timed
    public void delete(@PathVariable <% if (prodDatabaseType != 'none') { %>Long<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>String<% } %> id, HttpServletResponse response) {
        log.debug("REST request to delete <%= entityClass %> : {}", id);
        <%= entityInstance %>Repository.delete(id);
    }
}
