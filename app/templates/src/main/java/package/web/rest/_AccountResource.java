package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;
import <%=packageName%>.domain.Authority;<% if (authenticationType == 'cookie') { %>
import <%=packageName%>.domain.PersistentToken;<% } %>
import <%=packageName%>.domain.User;<% if (authenticationType == 'cookie') { %>
import <%=packageName%>.repository.PersistentTokenRepository;<% } %>
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.security.SecurityUtils;
import <%=packageName%>.service.MailService;
import <%=packageName%>.service.UserService;
import <%=packageName%>.web.rest.dto.UserDTO;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.thymeleaf.context.IWebContext;
import org.thymeleaf.spring4.SpringTemplateEngine;
import org.thymeleaf.spring4.context.SpringWebContext;

import javax.inject.Inject;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.*;<% if (javaVersion == '8') { %>
import java.util.stream.Collectors;<% } %>

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/app")
public class AccountResource {

    private final Logger log = LoggerFactory.getLogger(AccountResource.class);

    @Inject
    private ServletContext servletContext;

    @Inject
    private ApplicationContext applicationContext;

    @Inject
    private SpringTemplateEngine templateEngine;

    @Inject
    private UserRepository userRepository;

    @Inject
    private UserService userService;<% if (authenticationType == 'cookie') { %>

    @Inject
    private PersistentTokenRepository persistentTokenRepository;<% } %>

    @Inject
    private MailService mailService;

    /**
     * POST  /rest/register -> register the user.
     */
    @RequestMapping(value = "/rest/register",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<?> registerAccount(@Valid @RequestBody UserDTO userDTO, HttpServletRequest request,
                                             HttpServletResponse response) {<% if (javaVersion == '8') { %>
        return Optional.ofNullable(userRepository.findOne(userDTO.getLogin()))
            .map(user -> new ResponseEntity<String>("login already in use", HttpStatus.BAD_REQUEST))
            .orElseGet(() -> {
                if (userRepository.findOneByEmail(userDTO.getEmail()) != null) {
                    return new ResponseEntity<String>("e-mail address already in use", HttpStatus.BAD_REQUEST);
                }
                User user = userService.createUserInformation(userDTO.getLogin(), userDTO.getPassword(),
                        userDTO.getFirstName(), userDTO.getLastName(), userDTO.getEmail().toLowerCase(),
                        userDTO.getLangKey());
                final Locale locale = Locale.forLanguageTag(user.getLangKey());
                String content = createHtmlContentFromTemplate(user, locale, request, response);
                mailService.sendActivationEmail(user.getEmail(), content, locale);
                return new ResponseEntity<>(HttpStatus.CREATED);});<% } else { %>
        User user = userRepository.findOne(userDTO.getLogin());
        if (user != null) {
            return new ResponseEntity<String>("login already in use", HttpStatus.BAD_REQUEST);
        } else {
            if (userRepository.findOneByEmail(userDTO.getEmail()) != null) {
                return new ResponseEntity<String>("e-mail address already in use", HttpStatus.BAD_REQUEST);
            }
            user = userService.createUserInformation(userDTO.getLogin(), userDTO.getPassword(), userDTO.getFirstName(),
                    userDTO.getLastName(), userDTO.getEmail().toLowerCase(), userDTO.getLangKey());
            final Locale locale = Locale.forLanguageTag(user.getLangKey());
            String content = createHtmlContentFromTemplate(user, locale, request, response);
            mailService.sendActivationEmail(user.getEmail(), content, locale);
            return new ResponseEntity<>(HttpStatus.CREATED);
        }<% } %>
    }
    /**
     * GET  /rest/activate -> activate the registered user.
     */
    @RequestMapping(value = "/rest/activate",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<String> activateAccount(@RequestParam(value = "key") String key) {<% if (javaVersion == '8') { %>
        return Optional.ofNullable(userService.activateRegistration(key))
            .map(user -> new ResponseEntity<String>(
                    user.getLogin(),
                    HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));<% } else { %>
        User user = userService.activateRegistration(key);
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<String>(user.getLogin(), HttpStatus.OK);<% } %>
    }

    /**
     * GET  /rest/authenticate -> check if the user is authenticated, and return its login.
     */
    @RequestMapping(value = "/rest/authenticate",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public String isAuthenticated(HttpServletRequest request) {
        log.debug("REST request to check if the current user is authenticated");
        return request.getRemoteUser();
    }

    /**
     * GET  /rest/account -> get the current user.
     */
    @RequestMapping(value = "/rest/account",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<UserDTO> getAccount() {<% if (javaVersion == '8') { %>
        return Optional.ofNullable(userService.getUserWithAuthorities())
            .map(user -> new ResponseEntity<>(
                new UserDTO(
                    user.getLogin(),
                    null,
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getLangKey(),
                    user.getAuthorities().stream().map(Authority::getName).collect(Collectors.toList())),
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));<% } else { %>
        User user = userService.getUserWithAuthorities();
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        List<String> roles = new ArrayList<>();
        for (Authority authority : user.getAuthorities()) {
            roles.add(authority.getName());
        }
        return new ResponseEntity<>(
            new UserDTO(
                user.getLogin(),
                null,
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getLangKey(),
                roles),
            HttpStatus.OK);<% } %>
    }

    /**
     * POST  /rest/account -> update the current user information.
     */
    @RequestMapping(value = "/rest/account",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<?> saveAccount(@RequestBody UserDTO userDTO) {
        User userHavingThisEmail = userRepository.findOneByEmail(userDTO.getEmail());
        if (userHavingThisEmail != null && !userHavingThisEmail.getLogin().equals(SecurityUtils.getCurrentLogin())) {
            return new ResponseEntity<String>("e-mail address already in use", HttpStatus.BAD_REQUEST);
        }
        userService.updateUserInformation(userDTO.getFirstName(), userDTO.getLastName(), userDTO.getEmail());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * POST  /rest/change_password -> changes the current user's password
     */
    @RequestMapping(value = "/rest/account/change_password",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<?> changePassword(@RequestBody String password) {
        if (StringUtils.isEmpty(password)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        userService.changePassword(password);
        return new ResponseEntity<>(HttpStatus.OK);
    }<% if (authenticationType == 'cookie') { %>

    /**
     * GET  /rest/account/sessions -> get the current open sessions.
     */
    @RequestMapping(value = "/rest/account/sessions",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<PersistentToken>> getCurrentSessions() {<% if (javaVersion == '8') { %>
        return Optional.ofNullable(userRepository.findOne(SecurityUtils.getCurrentLogin()))
            .map(user -> new ResponseEntity<>(
                persistentTokenRepository.findByUser(user),
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));<% } else { %>
        User user = userRepository.findOne(SecurityUtils.getCurrentLogin());
        if (user == null) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(
            persistentTokenRepository.findByUser(user),
            HttpStatus.OK);<% } %>
    }

    /**
     * DELETE  /rest/account/sessions?series={series} -> invalidate an existing session.
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
    @RequestMapping(value = "/rest/account/sessions/{series}",
            method = RequestMethod.DELETE)
    @Timed
    public void invalidateSession(@PathVariable String series) throws UnsupportedEncodingException {
        String decodedSeries = URLDecoder.decode(series, "UTF-8");
        User user = userRepository.findOne(SecurityUtils.getCurrentLogin());<% if (javaVersion == '8') { %>
        if (persistentTokenRepository.findByUser(user).stream()
                .filter(persistentToken -> StringUtils.equals(persistentToken.getSeries(), decodedSeries))
                .count() > 0) {

            persistentTokenRepository.delete(decodedSeries);
        }<% } else { %>
        List<PersistentToken> persistentTokens = persistentTokenRepository.findByUser(user);
        for (PersistentToken persistentToken : persistentTokens) {
            if (StringUtils.equals(persistentToken.getSeries(), decodedSeries)) {
                persistentTokenRepository.delete(decodedSeries);
            }
        }<% } %>
    }<% } %>

    private String createHtmlContentFromTemplate(final User user, final Locale locale, final HttpServletRequest request,
                                                 final HttpServletResponse response) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("user", user);
        variables.put("baseUrl", request.getScheme() + "://" +   // "http" + "://
                                 request.getServerName() +       // "myhost"
                                 ":" + request.getServerPort());
        IWebContext context = new SpringWebContext(request, response, servletContext,
                locale, variables, applicationContext);
        return templateEngine.process("activationEmail", context);
    }
}
