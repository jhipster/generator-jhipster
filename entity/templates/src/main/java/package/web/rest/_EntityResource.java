package <%= packageName %>.web.rest<%= entityPackageSuffix %>;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain<%= entityPackageSuffix %>.<%= entityClass %>;
import <%=packageName%>.repository<%= entityPackageSuffix %>.<%= entityClass %>Repository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;<% if (javaVersion == '7') { %>
import javax.servlet.http.HttpServletResponse;<% } %>
import java.util.List;<% if (javaVersion == '8') { %>
import java.util.Optional;<% } %>

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
            produces = MediaType.APPLICATION_JSON_VALUE)
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
            produces = MediaType.APPLICATION_JSON_VALUE)
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
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<<%= entityClass %>> get(@PathVariable <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'nosql') { %>String<% } %> id<% if (javaVersion == '7') { %>, HttpServletResponse response<% } %>) {
        log.debug("REST request to get <%= entityClass %> : {}", id);<% if (javaVersion == '8') { %>
        return Optional.ofNullable(<%= entityInstance %>Repository.findOne(id))
            .map(<%= entityInstance %> -> new ResponseEntity<>(
                <%= entityInstance %>,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));<% } else { %>
        <%= entityClass %> <%= entityInstance %> = <%= entityInstance %>Repository.findOne(id);
        if (<%= entityInstance %> == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(<%= entityInstance %>, HttpStatus.OK);<% } %>
    }

    /**
     * DELETE  /rest/<%= entityInstance %>s/:id -> delete the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/rest/<%= entityInstance %>s/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'nosql') { %>String<% } %> id) {
        log.debug("REST request to delete <%= entityClass %> : {}", id);
        <%= entityInstance %>Repository.delete(id);
    }
}
