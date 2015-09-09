package <%=packageName%>.web.rest;

import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

import javax.inject.Inject;
import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain.Authority;
import <%=packageName%>.security.AuthoritiesConstants;
import <%=packageName%>.service.UserManagementService;
import <%=packageName%>.web.rest.dto.PageDTO;
import <%=packageName%>.web.rest.dto.UserManagementDTO;
import <%=packageName%>.web.rest.util.PaginationUtil;


/**
 * REST controller for managing users.
 */
@RestController
@RequestMapping("/api")
public class UserManagementResource {

    private final Logger log = LoggerFactory.getLogger(UserManagementResource.class);

    @Inject
    private UserManagementService userService;


    /**
     * GET  /userManagement -> get all users to manage.
     */
    @RequestMapping(value = "/userManagement",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @Secured(AuthoritiesConstants.ADMIN)
    public ResponseEntity<List<UserManagementDTO>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                                         @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        final PageDTO<UserManagementDTO> page = userService.findOnePageOfPart(PaginationUtil.generatePageRequest(offset, limit));
        final HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/userManagement");
        return new ResponseEntity<>(page.getEntities(), headers, HttpStatus.OK);
    }


    /**
     * GET  /userManagement/:id -> get id user to manage.
     */
    @RequestMapping(value = "/userManagement/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @Secured(AuthoritiesConstants.ADMIN)
    public ResponseEntity<UserManagementDTO> getUser(@PathVariable Long id) {
       log.debug("REST request to get User to manage : {}", id);
       return  Optional.ofNullable(userService.getUserWithAuthorities(id))
               .map(userManagementDTO -> new ResponseEntity<>(
                    userManagementDTO,
                    HttpStatus.OK))
               .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * PUT  /userManagement -> Updates an existing user.
     */
    @RequestMapping(value = "/userManagement",
        method = {RequestMethod.PUT, RequestMethod.POST},
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @Secured(AuthoritiesConstants.ADMIN)
    public ResponseEntity<UserManagementDTO> update(@RequestBody @Valid UserManagementDTO userManagementDTO) throws URISyntaxException {
        log.debug("REST request to update User : {}", userManagementDTO);
        final UserManagementDTO user = userService.update(userManagementDTO);
        return ResponseEntity.ok().body(user);
    }

    /**
     * GET /userManagement/authorities -> get all the authorities.
     */
    @RequestMapping(value = "/userManagement/authorities", 
            method = RequestMethod.GET, 
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    @Secured(AuthoritiesConstants.ADMIN)
    public List<Authority> getAll() {
        log.debug("REST request to get all Authorities");
        return userService.getAllAuthority();
    }

}
