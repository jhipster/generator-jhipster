package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.domain.Authority;<% } %><% if (authenticationType == 'session') { %>
import <%=packageName%>.domain.PersistentToken;<% } %>
import <%=packageName%>.domain.User;<% if (authenticationType == 'session') { %>
import <%=packageName%>.repository.PersistentTokenRepository;<% } %>
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.security.SecurityUtils;
import <%=packageName%>.service.MailService;
import <%=packageName%>.service.UserService;
import <%=packageName%>.web.rest.dto.KeyAndPasswordDTO;
import <%=packageName%>.web.rest.dto.UserDTO;
import <%=packageName%>.web.rest.util.HeaderUtil;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.*;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AccountResource {

    private final Logger log = LoggerFactory.getLogger(AccountResource.class);

    @Inject
    private UserRepository userRepository;

    @Inject
    private UserService userService;<% if (authenticationType == 'session') { %>

    @Inject
    private PersistentTokenRepository persistentTokenRepository;<% } %>

    @Inject
    private MailService mailService;

    /**
     * POST  /register -> register the user.
     */
    @RequestMapping(value = "/register",
        method = RequestMethod.POST,
        produces = MediaType.TEXT_PLAIN_VALUE)
    @Timed
    public ResponseEntity<?> registerAccount(@Valid @RequestBody UserDTO userDTO, HttpServletRequest request) {
        return userRepository.findOneByLogin(userDTO.getLogin())
            .map(user -> new ResponseEntity<>("login already in use", HttpStatus.BAD_REQUEST))
            .orElseGet(() -> userRepository.findOneByEmail(userDTO.getEmail())
                .map(user -> new ResponseEntity<>("e-mail address already in use", HttpStatus.BAD_REQUEST))
                .orElseGet(() -> {
                    User user = userService.createUserInformation(userDTO.getLogin(), userDTO.getPassword(),
                    userDTO.getFirstName(), userDTO.getLastName(), userDTO.getEmail().toLowerCase(),
                    userDTO.getLangKey());
                    String baseUrl = request.getScheme() + // "http"
                    "://" +                                // "://"
                    request.getServerName() +              // "myhost"
                    ":" +                                  // ":"
                    request.getServerPort() +              // "80"
                    request.getContextPath();              // "/myContextPath" or "" if deployed in root context

                    mailService.sendActivationEmail(user, baseUrl);
                    return new ResponseEntity<>(HttpStatus.CREATED);
                })
        );
    }

    /**
     * GET  /activate -> activate the registered user.
     */
    @RequestMapping(value = "/activate",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<String> activateAccount(@RequestParam(value = "key") String key) {
        return Optional.ofNullable(userService.activateRegistration(key))
            .map(user -> new ResponseEntity<String>(HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
    }

    /**
     * GET  /authenticate -> check if the user is authenticated, and return its login.
     */
    @RequestMapping(value = "/authenticate",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public String isAuthenticated(HttpServletRequest request) {
        log.debug("REST request to check if the current user is authenticated");
        return request.getRemoteUser();
    }

    /**
     * GET  /account -> get the current user.
     */
    @RequestMapping(value = "/account",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<UserDTO> getAccount() {
        return Optional.ofNullable(userService.getUserWithAuthorities())
            .map(user -> new ResponseEntity<>(new UserDTO(user), HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
    }

    /**
     * POST  /account -> update the current user information.
     */
    @RequestMapping(value = "/account",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<String> saveAccount(@RequestBody UserDTO userDTO) {
        Optional<User> existingUser = userRepository.findOneByEmail(userDTO.getEmail());
        if (existingUser.isPresent() && (!existingUser.get().getLogin().equalsIgnoreCase(userDTO.getLogin()))) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("user-management", "emailexists", "Email already in use")).body(null);
        }
        return userRepository
            .findOneByLogin(SecurityUtils.getCurrentUser().getUsername())
            .map(u -> {
                userService.updateUserInformation(userDTO.getFirstName(), userDTO.getLastName(), userDTO.getEmail(),
                    userDTO.getLangKey());
                return new ResponseEntity<String>(HttpStatus.OK);
            })
            .orElseGet(() -> new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
    }

    /**
     * POST  /change_password -> changes the current user's password
     */
    @RequestMapping(value = "/account/change_password",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<?> changePassword(@RequestBody String password) {
        if (!checkPasswordLength(password)) {
            return new ResponseEntity<>("Incorrect password", HttpStatus.BAD_REQUEST);
        }
        userService.changePassword(password);
        return new ResponseEntity<>(HttpStatus.OK);
    }<% if (authenticationType == 'session') { %>

    /**
     * GET  /account/sessions -> get the current open sessions.
     */
    @RequestMapping(value = "/account/sessions",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<PersistentToken>> getCurrentSessions() {
        return userRepository.findOneByLogin(SecurityUtils.getCurrentUser().getUsername())
            .map(user -> new ResponseEntity<>(
                persistentTokenRepository.findByUser(user),
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
    }

    /**
     * DELETE  /account/sessions?series={series} -> invalidate an existing session.
     *
     * - You can only delete your own sessions, not any other user's session
     * - If you delete one of your existing sessions, and that you are currently logged in on that session, you will
     *   still be able to use that session, until you quit your browser: it does not work in real time (there is
     *   no API for that), it only removes the "remember me" cookie
     * - This is also true if you invalidate your current session: you will still be able to use it until you close
     *   your browser or that the session times out. But automatic login (the "remember me" cookie) will not work
     *   anymore.
     *   There is an API to invalidate the current session, but there is no API to check which session uses which
     *   cookie.
     */
    @RequestMapping(value = "/account/sessions/{series}",
        method = RequestMethod.DELETE)
    @Timed
    public void invalidateSession(@PathVariable String series) throws UnsupportedEncodingException {
        String decodedSeries = URLDecoder.decode(series, "UTF-8");
        userRepository.findOneByLogin(SecurityUtils.getCurrentUser().getUsername()).ifPresent(u -> {
            persistentTokenRepository.findByUser(u).stream()
                .filter(persistentToken -> StringUtils.equals(persistentToken.getSeries(), decodedSeries))
                .findAny().ifPresent(t -> persistentTokenRepository.delete(decodedSeries));
        });
    }<% } %>

    @RequestMapping(value = "/account/reset_password/init",
        method = RequestMethod.POST,
        produces = MediaType.TEXT_PLAIN_VALUE)
    @Timed
    public ResponseEntity<?> requestPasswordReset(@RequestBody String mail, HttpServletRequest request) {
        return userService.requestPasswordReset(mail)
            .map(user -> {
                String baseUrl = request.getScheme() +
                    "://" +
                    request.getServerName() +
                    ":" +
                    request.getServerPort() +
                    request.getContextPath();
                mailService.sendPasswordResetMail(user, baseUrl);
                return new ResponseEntity<>("e-mail was sent", HttpStatus.OK);
            }).orElse(new ResponseEntity<>("e-mail address not registered", HttpStatus.BAD_REQUEST));
    }

    @RequestMapping(value = "/account/reset_password/finish",
        method = RequestMethod.POST,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<String> finishPasswordReset(@RequestBody KeyAndPasswordDTO keyAndPassword) {
        if (!checkPasswordLength(keyAndPassword.getNewPassword())) {
            return new ResponseEntity<>("Incorrect password", HttpStatus.BAD_REQUEST);
        }
        return userService.completePasswordReset(keyAndPassword.getNewPassword(), keyAndPassword.getKey())
              .map(user -> new ResponseEntity<String>(HttpStatus.OK)).orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
    }

    private boolean checkPasswordLength(String password) {
        return (!StringUtils.isEmpty(password) &&
            password.length() >= UserDTO.PASSWORD_MIN_LENGTH &&
            password.length() <= UserDTO.PASSWORD_MAX_LENGTH);
    }
}
