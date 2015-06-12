package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain.User;
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.security.AuthoritiesConstants;
import <%=packageName%>.web.rest.dto.userManagementDTO;
import <%=packageName%>.web.rest.mapper.userManagementMapper;
import <%=packageName%>.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
public class userManagementResource {

    private final Logger log = LoggerFactory.getLogger(userManagementResource.class);

    @Inject
    private UserRepository userRepository;

    @Inject
    private userManagementMapper userManagementMapper;

    /**
     * GET  /userManagement -> get all users to manage.
     */
    @RequestMapping(value = "/userManagement",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @RolesAllowed(AuthoritiesConstants.ADMIN)
    @Transactional(readOnly = true)
    public ResponseEntity<List<userManagementDTO>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                                         @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        Page<User> page = userRepository.findAll(PaginationUtil.generatePageRequest(offset, limit));
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/userManagement", offset, limit);<% if (javaVersion == '8') { %>
        return new ResponseEntity<>(page.getContent().stream()
                 .map(userManagementMapper::userTouserManagementDTO)
                 .collect(Collectors.toCollection(LinkedList::new)), headers, HttpStatus.OK);<% } else { %>
        List<userManagementDTO> usersManagementDTO = userManagementMapper.usersTouserManagementsDTO(page.getContent());
        return new ResponseEntity<List<userManagementDTO>>(usersManagementDTO, headers, HttpStatus.OK);<% } %>
    }

    /**
     * GET  /userManagement/:id -> get id user to manage.
     */
    @RequestMapping(value = "/userManagement/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @RolesAllowed(AuthoritiesConstants.ADMIN)
    @Transactional(readOnly = true)
    ResponseEntity<userManagementDTO> getUser(@PathVariable Long id) {
       log.debug("REST request to get User to manage : {}", id);<% if (javaVersion == '8') { %>
       return  userRepository.findOneWithEagerRelationships(id)
               .map(userManagementMapper::userTouserManagementDTO)
               .map(userManagementDTO -> new ResponseEntity<>(
                    userManagementDTO,
                    HttpStatus.OK))
               .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));<% } else { %>
       User user = userRepository.findOneWithEagerRelationships(id);
       if (user == null) {
           return new ResponseEntity<userManagementDTO>(HttpStatus.NOT_FOUND);
       }
       return new ResponseEntity<userManagementDTO>(userManagementMapper.userTouserManagementDTO(user),
                                                   HttpStatus.OK);<% } %>
    }

    /**
     * PUT  /userManagement -> Updates an existing user.
     */
    @RequestMapping(value = "/userManagement",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @RolesAllowed(AuthoritiesConstants.ADMIN)
    public ResponseEntity<Void> update(@RequestBody userManagementDTO userManagementDTO) throws URISyntaxException {
        log.debug("REST request to update User : {}", userManagementDTO);
        if (userManagementDTO.getId() == null) {
            return ResponseEntity.badRequest().header("Failure", "You cannot create a new user").build();
        }
        User user = userManagementMapper.userManagementDTOToUser(userManagementDTO);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
}
