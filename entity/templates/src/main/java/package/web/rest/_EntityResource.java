package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain.<%= entityClass %>;
import <%=packageName%>.repository.<%= entityClass %>Repository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;<% if (javaVersion == '7') { %>
import javax.servlet.http.HttpServletResponse;<% } %>
import java.util.List;<% if (javaVersion == '8') { %>
import java.util.Optional;<% } %><% if (primaryKeyField.fieldType == 'LocalDate') { %>
import org.joda.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;<% } %><% if (primaryKeyField.fieldType == 'DateTime') { %>
import org.joda.time.DateTime;
import org.springframework.format.annotation.DateTimeFormat;<% } %><% if (primaryKeyField.fieldType == 'BigDecimal') { %>
import java.math.BigDecimal;<% } %>

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
    public void create(@RequestBody <%= entityClass %> <%= entityInstance %>) {
        log.debug("REST request to save <%= entityClass %> : {}", <%= entityInstance %>);
        <%= entityInstance %>Repository.save(<%= entityInstance %>);
    }

    /**
     * GET  /<%= entityInstance %>s -> get all the <%= entityInstance %>s.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<<%= entityClass %>> getAll() {
        log.debug("REST request to get all <%= entityClass %>s");
        return <%= entityInstance %>Repository.findAll();
    }

    /**
     * GET  /<%= entityInstance %>s/:<%= primaryKeyField.fieldName %> -> get the "<%= primaryKeyField.fieldName %>" <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s/{<%= primaryKeyField.fieldName %>}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<<%= entityClass %>> get(@PathVariable <% if (databaseType == 'sql') { %><% if (primaryKeyField.fieldType == 'LocalDate') { %>@DateTimeFormat(pattern="yyyy-MM-dd")<% } %><% if (primaryKeyField.fieldType == 'DateTime') { %>@DateTimeFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")<% } %><%= primaryKeyField.fieldType %><% } %><% if (databaseType == 'mongodb') { %>String<% } %> <%= primaryKeyField.fieldName %><% if (javaVersion == '7') { %>, HttpServletResponse response<% } %>) {
        log.debug("REST request to get <%= entityClass %> : {}", <%= primaryKeyField.fieldName %>);<% if (javaVersion == '8') { %>
        return Optional.ofNullable(<%= entityInstance %>Repository.<% if (fieldsContainOwnerManyToMany == true) { %>findOneWithEagerRelationships<% } else { %>findOne<% } %>(<%= primaryKeyField.fieldName %>))
            .map(<%= entityInstance %> -> new ResponseEntity<>(
                <%= entityInstance %>,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));<% } else { %>
        <%= entityClass %> <%= entityInstance %> = <%= entityInstance %>Repository.<% if (fieldsContainOwnerManyToMany == true) { %>findOneWithEagerRelationships<% } else { %>findOne<% } %>(<%= primaryKeyField.fieldName %>);
        if (<%= entityInstance %> == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(<%= entityInstance %>, HttpStatus.OK);<% } %>
    }

    /**
     * DELETE  /<%= entityInstance %>s/:<%= primaryKeyField.fieldName %> -> delete the "<%= primaryKeyField.fieldName %>" <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s/{<%= primaryKeyField.fieldName %>}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable <% if (databaseType == 'sql') { %><% if (primaryKeyField.fieldType == 'LocalDate') { %>@DateTimeFormat(pattern="yyyy-MM-dd")<% } %><% if (primaryKeyField.fieldType == 'DateTime') { %>@DateTimeFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")<% } %><%= primaryKeyField.fieldType %><% } %><% if (databaseType == 'mongodb') { %>String<% } %> <%= primaryKeyField.fieldName %>) {
        log.debug("REST request to delete <%= entityClass %> : {}", <%= primaryKeyField.fieldName %>);
        <%= entityInstance %>Repository.delete(<%= primaryKeyField.fieldName %>);
    }
}
