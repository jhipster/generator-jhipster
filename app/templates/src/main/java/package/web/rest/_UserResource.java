package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.domain.Authority;<% } %>
import <%=packageName%>.domain.User;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.repository.AuthorityRepository;<% } %>
import <%=packageName%>.repository.UserRepository;<% if (searchEngine == 'elasticsearch') { %>
import <%=packageName%>.repository.search.UserSearchRepository;<% } %>
import <%=packageName%>.security.AuthoritiesConstants;
import <%=packageName%>.service.UserService;
import <%=packageName%>.web.rest.dto.ManagedUserDTO;
import <%=packageName%>.web.rest.dto.UserDTO;
import <%=packageName%>.web.rest.util.HeaderUtil;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.web.rest.util.PaginationUtil;<% } %>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;<% } %>
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;<% if (databaseType == 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;<% if (javaVersion == '8') { %>
import java.util.stream.Collectors;<% } %><% if (searchEngine == 'elasticsearch') { %>
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;<% } %>

/**
 * REST controller for managing users.
 *
 * <p>This class accesses the User entity, and needs to fetch its collection of authorities.</p>
 * <p>
 * For a normal use-case, it would be better to have an eager relationship between User and Authority,
 * and send everything to the client side: there would be no DTO, a lot less code, and an outer-join
 * which would be good for performance.
 * </p>
 * <p>
 * We use a DTO for 3 reasons:
 * <ul>
 * <li>We want to keep a lazy association between the user and the authorities, because people will
 * quite often do relationships with the user, and we don't want them to get the authorities all
 * the time for nothing (for performance reasons). This is the #1 goal: we should not impact our users'
 * application because of this use-case.</li>
 * <li> Not having an outer join causes n+1 requests to the database. This is not a real issue as
 * we have by default a second-level cache. This means on the first HTTP call we do the n+1 requests,
 * but then all authorities come from the cache, so in fact it's much better than doing an outer join
 * (which will get lots of data from the database, for each HTTP call).</li>
 * <li> As this manages users, for security reasons, we'd rather have a DTO layer.</li>
 * </p>
 * <p>Another option would be to have a specific JPA entity graph to handle this case.</p>
 */
@RestController
@RequestMapping("/api")
public class UserResource {

    private final Logger log = LoggerFactory.getLogger(UserResource.class);

    @Inject
    private UserRepository userRepository;
<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
    @Inject
    private AuthorityRepository authorityRepository;<% } %>

    @Inject
    private UserService userService;<% if (searchEngine == 'elasticsearch') { %>

    @Inject
    private UserSearchRepository userSearchRepository;<% } %>

    /**
     * POST  /users -> Create a new user.
     */
    @RequestMapping(value = "/users",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @Secured(AuthoritiesConstants.ADMIN)
    public ResponseEntity<User> createUser(@RequestBody User user) throws URISyntaxException {
        log.debug("REST request to save User : {}", user);
        if (user.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new user cannot already have an ID").body(null);
        }
        User result = userRepository.save(user);
        return ResponseEntity.created(new URI("/api/users/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("user", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT  /users -> Updates an existing User.
     */
    @RequestMapping(value = "/users",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    @Secured(AuthoritiesConstants.ADMIN)
    public ResponseEntity<ManagedUserDTO> updateUser(@RequestBody ManagedUserDTO managedUserDTO) throws URISyntaxException {
        log.debug("REST request to update User : {}", managedUserDTO);<% if (javaVersion == '8') { %><% if (databaseType == 'cassandra') { %>
        return userRepository
            .findOne(managedUserDTO.getId())<% } else { %>
        return Optional.of(userRepository
            .findOne(managedUserDTO.getId()))<% } %>
            .map(user -> {
                user.setLogin(managedUserDTO.getLogin());
                user.setFirstName(managedUserDTO.getFirstName());
                user.setLastName(managedUserDTO.getLastName());
                user.setEmail(managedUserDTO.getEmail());
                user.setActivated(managedUserDTO.isActivated());
                user.setLangKey(managedUserDTO.getLangKey());<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
                Set<Authority> authorities = user.getAuthorities();
                authorities.clear();
                managedUserDTO.getAuthorities().stream().forEach(
                    authority -> authorities.add(authorityRepository.findOne(authority))
                );<% if (databaseType == 'mongodb') { %>
                userRepository.save(user);<% } %>
                return ResponseEntity.ok()
                    .headers(HeaderUtil.createEntityUpdateAlert("user", managedUserDTO.getLogin()))
                    .body(new ManagedUserDTO(userRepository
                        .findOne(managedUserDTO.getId())));<% } else { %>
                user.setAuthorities(managedUserDTO.getAuthorities());
                userRepository.save(user);
                return ResponseEntity.ok()
                    .headers(HeaderUtil.createEntityUpdateAlert("user", managedUserDTO.getLogin()))
                    .body(new ManagedUserDTO(userRepository
                        .findOne(managedUserDTO.getId())<% if (databaseType == 'cassandra') { %>.get()<% } %>));<% } %>
            })
            .orElseGet(() -> new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));<% } else {%>
        User user = userRepository.findOne(managedUserDTO.getId());
        if (user != null) {
            user.setId(managedUserDTO.getId());
            user.setFirstName(managedUserDTO.getFirstName());
            user.setLastName(managedUserDTO.getLastName());
            user.setEmail(managedUserDTO.getEmail());
            user.setActivated(managedUserDTO.isActivated());
            user.setLangKey(managedUserDTO.getLangKey());
            Set<Authority> authorities = user.getAuthorities();
            authorities.clear();
            for (String authority : managedUserDTO.getAuthorities()) {
                authorities.add(authorityRepository.findOne(authority));
            }
            return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("user", managedUserDTO.getLogin()))
                .body(new ManagedUserDTO(userRepository
                    .findOne(managedUserDTO.getId())));
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }<% } %>
    }

    /**
     * GET  /users -> get all users.
     */
    @RequestMapping(value = "/users",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<% if (databaseType == 'sql') { %>
    @Transactional(readOnly = true)<% } %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
    public ResponseEntity<List<ManagedUserDTO>> getAllUsers(Pageable pageable)
        throws URISyntaxException {
        Page<User> page = userRepository.findAll(pageable);<% if (javaVersion == '8') { %>
        List<ManagedUserDTO> managedUserDTOs = page.getContent().stream()
            .map(user -> new ManagedUserDTO(user))
            .collect(Collectors.toList());<% } else { %>
        List<ManagedUserDTO> managedUserDTOs = new ArrayList<>();
        for (User user : page.getContent()) {
            ManagedUserDTO managedUserDTO = new ManagedUserDTO(user);
            managedUserDTOs.add(managedUserDTO);
        }<% } %>
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/users");
        return new ResponseEntity<>(managedUserDTOs, headers, HttpStatus.OK);
    }<% } else { %>
    public ResponseEntity<List<ManagedUserDTO>> getAllUsers()
        throws URISyntaxException {
        List<User> users = userRepository.findAll();
        List<ManagedUserDTO> managedUserDTOs = users.stream()
            .map(user -> new ManagedUserDTO(user))
            .collect(Collectors.toList());
        return new ResponseEntity<>(managedUserDTOs, HttpStatus.OK);
    }<% } %>

    /**
     * GET  /users/:login -> get the "login" user.
     */
    @RequestMapping(value = "/users/{login}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed<% if (javaVersion == '8') { %>
    public ResponseEntity<ManagedUserDTO> getUser(@PathVariable String login) {
        log.debug("REST request to get User : {}", login);
        return userService.getUserWithAuthoritiesByLogin(login)
                .map(user -> new ManagedUserDTO(user))
                .map(managedUserDTO -> new ResponseEntity<>(managedUserDTO, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }<% } else { %>
    public ResponseEntity<ManagedUserDTO> getUser(@PathVariable String login) {
        log.debug("REST request to get User : {}", login);
        User user = userService.getUserWithAuthoritiesByLogin(login);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(new ManagedUserDTO(user), HttpStatus.OK);
    }<% } %><% if (searchEngine == 'elasticsearch') { %>

    /**
     * SEARCH  /_search/users/:query -> search for the User corresponding
     * to the query.
     */
    @RequestMapping(value = "/_search/users/{query}",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<User> search(@PathVariable String query) {
        return StreamSupport
            .stream(userSearchRepository.search(queryString(query)).spliterator(), false)
            .collect(Collectors.toList());
    }<% } %>
}
