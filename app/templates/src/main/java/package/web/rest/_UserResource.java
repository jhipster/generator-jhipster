package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain<% if(prodDatabaseType != 'none') { %>.jpa<% } %><% if(prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>.mongodb<% } %>.User;
import <%=packageName%>.repository<% if(prodDatabaseType != 'none') { %>.jpa<% } %><% if(prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>.mongodb<% } %>.UserRepository;
import <%=packageName%>.security.AuthoritiesConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (javaVersion == '8') { %>
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;<% } %>
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;<% if (javaVersion == '8') { %>
import java.util.Optional;<% } else { %>
import javax.servlet.http.HttpServletResponse;<% } %>

/**
 * REST controller for managing users.
 */
@RestController
@RequestMapping("/app")
public class UserResource {

    private final Logger log = LoggerFactory.getLogger(UserResource.class);

    @Inject
    private UserRepository userRepository;

    /**
     * GET  /rest/users/:login -> get the "login" user.
     */
    @RequestMapping(value = "/rest/users/{login}",
            method = RequestMethod.GET,
            produces = "application/json")
    @Timed
    @RolesAllowed(AuthoritiesConstants.ADMIN)<% if (javaVersion == '8') { %>
    ResponseEntity<User> getUser(@PathVariable String login) {
        log.debug("REST request to get User : {}", login);
        return Optional.ofNullable(userRepository.findOne(login))
                .map(user -> new ResponseEntity<>(user, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }<% } else { %>
    public User getUser(@PathVariable String login, HttpServletResponse response) {
        log.debug("REST request to get User : {}", login);
        User user = userRepository.findOne(login);
        if (user == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
        return user;
    }<% } %>
}
