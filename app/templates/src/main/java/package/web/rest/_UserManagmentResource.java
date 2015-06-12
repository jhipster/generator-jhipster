package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain.User;
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.security.AuthoritiesConstants;
import <%=packageName%>.web.rest.dto.UserManagmentDTO;
import <%=packageName%>.web.rest.mapper.UserManagmentMapper;
import <%=packageName%>.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;<% if (javaVersion == '8') { %>
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;<% } %>
import org.springframework.http.MediaType;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.annotation.security.RolesAllowed;
import java.net.URISyntaxException;
import javax.inject.Inject;
import java.util.List;<% if (javaVersion == '8') { %>
import java.util.LinkedList;
import java.util.stream.Collectors;<% } %><% if (javaVersion == '7') { %>
import javax.servlet.http.HttpServletResponse;<% } %>

/**
 * REST controller for managing users.
 */
@RestController
@RequestMapping("/api")
public class UserManagmentResource {

    private final Logger log = LoggerFactory.getLogger(UserManagmentResource.class);

    @Inject
    private UserRepository userRepository;

    @Inject
    private UserManagmentMapper userManagmentMapper;

    /**
     * GET  /userManagment -> get all users to manage.
     */
    @RequestMapping(value = "/userManagment",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @RolesAllowed(AuthoritiesConstants.ADMIN)
    @Transactional(readOnly = true)
    public ResponseEntity<List<UserManagmentDTO>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                                         @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        Page<User> page = userRepository.findAll(PaginationUtil.generatePageRequest(offset, limit));
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/userManagment", offset, limit);<% if (javaVersion == '8') { %>
        return new ResponseEntity<>(page.getContent().stream()
                 .map(userManagmentMapper::userToUserManagmentDTO)
                 .collect(Collectors.toCollection(LinkedList::new)), headers, HttpStatus.OK);<% } else { %>
        List<UserManagmentDTO> usersManagmentDTO = userManagmentMapper.usersToUserManagmentsDTO(page.getContent());
        return new ResponseEntity<List<UserManagmentDTO>>(usersManagmentDTO, headers, HttpStatus.OK);<% } %>
    }

    /**
     * GET  /userManagment/:id -> get id user to manage.
     */
    @RequestMapping(value = "/userManagment/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @RolesAllowed(AuthoritiesConstants.ADMIN)
    @Transactional(readOnly = true)
    ResponseEntity<UserManagmentDTO> getUser(@PathVariable Long id) {
       log.debug("REST request to get User to manage : {}", id);<% if (javaVersion == '8') { %>
       return  userRepository.findOneWithEagerRelationships(id)
               .map(userManagmentMapper::userToUserManagmentDTO)
               .map(userManagmentDTO -> new ResponseEntity<>(
                    userManagmentDTO,
                    HttpStatus.OK))
               .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));<% } else { %>
       User user = userRepository.findOneWithEagerRelationships(id);
       if (product == null) {
           return new ResponseEntity<UserManagmentDTO>(HttpStatus.NOT_FOUND);
       }
       return new ResponseEntity<UserManagmentDTO>(userManagmentMapper.userToUserManagmentDTO(user),
                                                   HttpStatus.OK);<% } %>
    }

    /**
     * PUT  /userManagment -> Updates an existing user.
     */
    @RequestMapping(value = "/userManagment",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @RolesAllowed(AuthoritiesConstants.ADMIN)
    public ResponseEntity<Void> update(@RequestBody UserManagmentDTO userManagmentDTO) throws URISyntaxException {
        log.debug("REST request to update User : {}", userManagmentDTO);
        if (userManagmentDTO.getId() == null) {
            return ResponseEntity.badRequest().header("Failure", "You cannot create a new user").build();
        }
        User user = userManagmentMapper.userManagmentDTOToUser(userManagmentDTO);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
}
