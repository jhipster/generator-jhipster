package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain.<%= entityClass %>;
import <%=packageName%>.repository.<%= entityClass %>Repository;<% if (searchEngine == 'elasticsearch') { %>
import <%=packageName%>.repository.search.<%= entityClass %>SearchRepository;<% } %><% if (pagination != 'no') { %>
import <%=packageName%>.web.rest.util.PaginationUtil;<% } %><% if (generateDto == 'yes') { %>
import <%=packageName%>.web.rest.dto.<%= entityClass %>DetailsDTO;
import <%=packageName%>.web.rest.dto.<%= entityClass %>ListDTO;
import <%=packageName%>.web.rest.dto.<%= entityClass %>UpdateDTO;
import <%=packageName%>.web.rest.mapper.<%= entityClass %>Mapper;
import <%=packageName%>.web.rest.mapper.<%= entityClass %>DetailMapper;<% } %>

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (pagination != 'no') { %>
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;<% } %>
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;<% if (databaseType == 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;<% if (validation) { %>
import javax.validation.Valid;<% } %>
import java.net.URI;
import java.net.URISyntaxException;<% if (javaVersion == '7') { %>
import javax.servlet.http.HttpServletResponse;<% } %>
import java.util.List;<% if (javaVersion == '8') { %>
import java.util.Optional;<% } %><% if (databaseType == 'cassandra') { %>
import java.util.UUID;<% } %><% if (searchEngine == 'elasticsearch') { %>
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;<% } %>

<%
  var inputParam, listResultType, detailResultType;
  if (generateDto == 'yes') {
    inputParam = entityClass + 'UpdateDTO';
    listResultType = entityClass + 'ListDTO';
    detailResultType = entityClass + 'DetailsDTO';
  } else {
    inputParam = entityClass;
    listResultType = entityClass;
    detailResultType = entityClass;
  }
%>
/**
 * REST controller for managing <%= entityClass %>.
 */
@RestController
@RequestMapping("/api")
public class <%= entityClass %>Resource {

    private final Logger log = LoggerFactory.getLogger(<%= entityClass %>Resource.class);

    @Inject
    private <%= entityClass %>Repository <%= entityInstance %>Repository;<% if (searchEngine == 'elasticsearch') { %>

    @Inject
    private <%= entityClass %>SearchRepository <%= entityInstance %>SearchRepository;<% } %><% if (generateDto == 'yes') { %>

    @Inject
    private <%= entityClass %>Mapper <%= entityInstance %>Mapper;

    @Inject
    private <%= entityClass %>DetailMapper <%= entityInstance %>DetailMapper;<% } %>
    
    /**
     * POST  /<%= entityInstance %>s -> Create a new <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<% if (databaseType == 'sql') { %>
    @Transactional(readOnly = false)<% } %>
    public ResponseEntity<Void> create(<% if (validation) { %>@Valid <% } %>@RequestBody <%= inputParam %> input) throws URISyntaxException {
        log.debug("REST request to save <%= entityClass %> : {}", input);
        if (input.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new <%= entityInstance %> cannot already have an ID").build();
        }<% if (generateDto == 'yes') { %>
        final <%= entityClass %> updated = <%= entityInstance %>Mapper.merge(input, new <%= entityClass %>());
        final <%= entityClass %> persisted = <%= entityInstance %>Repository.save(updated);<% } else { %>
        final <%= entityClass %> persisted = <%= entityInstance %>Repository.save(input);<% } %><% if (searchEngine == 'elasticsearch') { %>
        <%= entityInstance %>SearchRepository.save(<%= persisted %>);<% } %>
        return ResponseEntity.created(new URI("/api/<%= entityInstance %>s/" + persisted.getId())).build();
    }

    /**
     * PUT  /<%= entityInstance %>s -> Updates an existing <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<% if (databaseType == 'sql') { %>
    @Transactional(readOnly = false)<% } %>
    public ResponseEntity<Void> update(<% if (validation) { %>@Valid <% } %>@RequestBody <%= inputParam %> input) throws URISyntaxException {
        log.debug("REST request to update <%= entityClass %> : {}", input);
        if (input.getId() == null) {
            return create(input);
        }<% if (generateDto == 'yes') { %>
        final <%= entityClass %> entity = <%= entityInstance %>Repository.findOne(input.getId());
        final <%= entityClass %> updated = <%= entityInstance %>Mapper.merge(input, entity);
        <%= entityInstance %>Repository.save(updated);<% if (searchEngine == 'elasticsearch') { %>
        <%= entityInstance %>SearchRepository.save(updated);<% } %><% } else { %>
        <%= entityInstance %>Repository.save(input);<% if (searchEngine == 'elasticsearch') { %>
        <%= entityInstance %>SearchRepository.save(input);<% } %><% } %>
        return ResponseEntity.ok().build();
    }

    /**
     * GET  /<%= entityInstance %>s -> get all the <%= entityInstance %>s.
     */
    @RequestMapping(value = "/<%= entityInstance %>s",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<% if (pagination == 'no') { %>
    public List<<%= listResultType %>> getAll() {
        log.debug("REST request to get all <%= entityClass %>s");
        return <%= entityInstance %>Mapper.mapList(<%= entityInstance %>Repository.findAll());<% } %><% if (pagination != 'no') { %>
    public ResponseEntity<List<<%= listResultType %>>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                  @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        Page<<%= entityClass %>> page = <%= entityInstance %>Repository.findAll(PaginationUtil.generatePageRequest(offset, limit));
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/<%= entityInstance %>s", offset, limit);
        final List<<%= listResultType %>> result = <% if (generateDto == 'yes') { %><%= entityInstance %>Mapper.mapList(page.getContent());<% } else { %>page.getContent();<% } %>
        return new ResponseEntity<<% if (javaVersion == '7') { %>List<<%= listResultType %>><% } %>>(result, headers, HttpStatus.OK);<% } %>
    }

    /**
     * GET  /<%= entityInstance %>s/:id -> get the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<% if (databaseType == 'sql') { %>
    @Transactional(readOnly = true)<% } %>
    public ResponseEntity<<%= detailResultType %>> get(@PathVariable <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } %> id<% if (javaVersion == '7') { %>, HttpServletResponse response<% } %>) {
        log.debug("REST request to get <%= entityClass %> : {}", id);<% if (javaVersion == '8') { %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        return Optional.ofNullable(<%= entityInstance %>Repository.<% if (fieldsContainOwnerManyToMany == true) { %>findOneWithEagerRelationships<% } else { %>findOne<% } %>(id))<% } %><% if (databaseType == 'cassandra') { %>
        return Optional.ofNullable(<%= entityInstance %>Repository.findOne(UUID.fromString(id)))<% } %><% if (generateDto == 'yes') { %>
            .map(<%= entityInstance %>DetailMapper::map)<% } %>
            .map(<%= entityInstance %> -> new ResponseEntity<>(<%= entityInstance %>,HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));<% } else { %>
        <%= entityClass %> <%= entityInstance %> = <%= entityInstance %>Repository.<% if (fieldsContainOwnerManyToMany == true) { %>findOneWithEagerRelationships<% } else { %>findOne<% } %>(id);
        if (<%= entityInstance %> == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(<% if (generateDto == 'yes') { %><%= entityInstance %>DetailMapper.map(<%= entityInstance %>)<% } else {%><%= entityInstance %><% } %>, HttpStatus.OK);<% } %>
    }

    /**
     * DELETE  /<%= entityInstance %>s/:id -> delete the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/<%= entityInstance %>s/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<% if (databaseType == 'sql') { %>
    @Transactional(readOnly = false)<% } %>
    public void delete(@PathVariable <% if (databaseType == 'sql') { %>Long<% } %><% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } %> id) {
        log.debug("REST request to delete <%= entityClass %> : {}", id);<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        <%= entityInstance %>Repository.delete(id);<% } %><% if (databaseType == 'cassandra') { %>
        <%= entityInstance %>Repository.delete(UUID.fromString(id));<% } %><% if (searchEngine == 'elasticsearch') { %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        <%= entityInstance %>SearchRepository.delete(id);<% } %><% if (databaseType == 'cassandra') { %>
        <%= entityInstance %>SearchRepository.delete(UUID.fromString(id));<% } %><% } %>
    }<% if (searchEngine == 'elasticsearch') { %>

    /**
     * SEARCH  /_search/<%= entityInstance %>s/:query -> search for the <%= entityInstance %> corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/<%= entityInstance %>s/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<<%= entityClass %>> search(@PathVariable String query) {
        return StreamSupport
            .stream(<%= entityInstance %>SearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }<% } %>
}
