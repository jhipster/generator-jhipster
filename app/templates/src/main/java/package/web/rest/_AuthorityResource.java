package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain.Authority;
import <%=packageName%>.repository.AuthorityRepository;
import <%=packageName%>.security.AuthoritiesConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import java.util.List;<% if (javaVersion == '8') { %>
import java.util.Optional;<% } %>

/**
 * REST controller for managing Authority.
 */
@RestController
@RequestMapping("/api")
public class AuthorityResource {

    private final Logger log = LoggerFactory.getLogger(AuthorityResource.class);

    @Inject
    private AuthorityRepository authorityRepository;


    /**
     * GET  /authorities -> get all the authorities.
     */
    @RequestMapping(value = "/authorities",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @RolesAllowed(AuthoritiesConstants.ADMIN)
    public List<Authority> getAll() {
        log.debug("REST request to get all Authorities");
        return authorityRepository.findAll();
    }

    /**
     * GET  /authorities/:name -> get the "name" authority.
     */
    @RequestMapping(value = "/authorities/{name}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @RolesAllowed(AuthoritiesConstants.ADMIN)
    public ResponseEntity<Authority> get(@PathVariable String name) {
        log.debug("REST request to get Authority : {}", name);<% if (javaVersion == '8') { %>
        return Optional.ofNullable(authorityRepository.findOne(name))
            .map(authority -> new ResponseEntity<>(
                authority,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));<% } else { %>
        Authority authority = authorityRepository.findOne(name);
        if (authority == null) {
          return new ResponseEntity<Authority>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<Authority>(authority, HttpStatus.OK);<% } %>
    }
}
