package <%=packageName%>.web.rest;

import <%=packageName%>.domain.User;
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.security.AuthoritiesConstants;
import com.yammer.metrics.annotation.Timed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.inject.Inject;
import javax.servlet.http.HttpServletResponse;

/**
 * REST controller for managing the current user's account.
 */
@Controller
public class AccountResource {

    private static final Logger log = LoggerFactory.getLogger(AccountResource.class);

    @Inject
    private UserRepository userRepository;

    /**
     * GET  /rest/account -> get the current user
     */
    @RequestMapping(value = "/rest/account",
            method = RequestMethod.GET,
            produces = "application/json")
    @ResponseBody
    @Timed
    public User getAccount(HttpServletResponse response) {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        UserDetails springSecurityUser =
                (UserDetails) securityContext
                        .getAuthentication().getPrincipal();

        User user = userRepository.findByLogin(springSecurityUser.getUsername());
        if (user == null) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        return user;
    }
}
