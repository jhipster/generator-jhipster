package <%=packageName%>.web.rest;

import <%=packageName%>.domain.PersistentToken;
import <%=packageName%>.domain.User;
import <%=packageName%>.repository.PersistentTokenRepository;
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.security.SecurityUtils;
import com.yammer.metrics.annotation.Timed;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.inject.Inject;
import javax.servlet.http.HttpServletResponse;
import java.util.List;

/**
 * REST controller for managing the current user's account.
 */
@Controller
public class AccountResource {

    @Inject
    private UserRepository userRepository;
    
    @Inject
    private PersistentTokenRepository persistentTokenRepository;

    /**
     * GET  /rest/account -> get the current user
     */
    @RequestMapping(value = "/rest/account",
            method = RequestMethod.GET,
            produces = "application/json")
    @ResponseBody
    @Timed
    public User getAccount(HttpServletResponse response) {
        User user = userRepository.findOne(SecurityUtils.getCurrentLogin());
        if (user == null) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        return user;
    }

    /**
     * GET  /rest/account/sessions -> get the current open sessions
     */
    @RequestMapping(value = "/rest/account/sessions",
            method = RequestMethod.GET,
            produces = "application/json")
    @ResponseBody
    @Timed
    public List<PersistentToken> getCurrentSessions(HttpServletResponse response) {
        User user = userRepository.findOne(SecurityUtils.getCurrentLogin());
        if (user == null) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
        return persistentTokenRepository.findByUser(user);
    }
}
