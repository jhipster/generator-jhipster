package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain.<%= entityClass %>;
import <%=packageName%>.repository.<%= entityClass %>Repository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.inject.Inject;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * REST controller for managing <%= entityClass %>.
 */
@Controller
public class <%= entityClass %>Resource {

    private static final Logger log = LoggerFactory.getLogger(<%= entityClass %>Resource.class);

    @Inject
    private <%= entityClass %>Repository <%= entityInstance %>Repository;

    /**
     * GET  /rest/<%= entityInstance %>s -> get all the <%= entityInstance %>s.
     */
    @RequestMapping(value = "/rest/<%= entityInstance %>s",
            method = RequestMethod.GET,
            produces = "application/json")
    @ResponseBody
    @Timed
    public List<<%= entityClass %>> getAll() {
        return <%= entityInstance %>Repository.findAll();
    }

    /**
     * GET  /rest/<%= entityInstance %>s/:id -> get the "id" <%= entityInstance %>.
     */
    @RequestMapping(value = "/rest/<%= entityInstance %>s/{id}",
            method = RequestMethod.GET,
            produces = "application/json")
    @ResponseBody
    @Timed
    public <%= entityClass %> get<%= entityClass %>(@PathVariable String id, HttpServletResponse response) {
        log.debug("REST request to get <%= entityClass %> : {}", id);
        <%= entityClass %> <%= entityInstance %> = <%= entityInstance %>Repository.findOne(id);
        if (<%= entityInstance %> == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
        return <%= entityInstance %>;
    }
}
