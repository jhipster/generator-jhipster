<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.web.rest;

import com.codahale.metrics.annotation.Timed;

<%_ if (authenticationType === 'session') { _%>
import <%=packageName%>.domain.PersistentToken;
<%_ } _%>
<%_ if (authenticationType === 'oauth2') { _%>
import <%=packageName%>.domain.Authority;
<%_ } _%>
import <%=packageName%>.domain.User;
<%_ if (authenticationType === 'session') { _%>
import <%=packageName%>.repository.PersistentTokenRepository;
<%_ } _%>
import <%=packageName%>.repository.UserRepository;
<%_ if (authenticationType !== 'oauth2') { _%>
import <%=packageName%>.security.SecurityUtils;
import <%=packageName%>.service.MailService;
<%_ } _%>
import <%=packageName%>.service.UserService;
import <%=packageName%>.service.dto.UserDTO;
<%_ if (authenticationType !== 'oauth2') { _%>
import <%=packageName%>.web.rest.vm.KeyAndPasswordVM;
import <%=packageName%>.web.rest.vm.ManagedUserVM;
import <%=packageName%>.web.rest.util.HeaderUtil;

import org.apache.commons.lang3.StringUtils;
<%_ } _%>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
<%_ if (authenticationType !== 'oauth2') { _%>
import org.springframework.http.HttpHeaders;
<%_ } _%>
import org.springframework.http.HttpStatus;
<%_ if (authenticationType !== 'oauth2') { _%>
import org.springframework.http.MediaType;
<%_ } _%>
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
<%_ if (authenticationType === 'oauth2') { _%>
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
<%_ } _%>

import javax.servlet.http.HttpServletRequest;
<%_ if (authenticationType !== 'oauth2') { _%>
import javax.validation.Valid;
<%_ } _%>
<%_ if (authenticationType === 'session') { _%>
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
<%_ } _%>
<%_ if (authenticationType === 'oauth2') { _%>
import java.security.Principal;
import java.time.Instant;
import java.util.stream.Collectors;
<%_ } _%>
import java.util.*;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AccountResource {

    private final Logger log = LoggerFactory.getLogger(AccountResource.class);

    private final UserRepository userRepository;

    private final UserService userService;
    <%_ if (authenticationType !== 'oauth2') { _%>

    private final MailService mailService;
    <%_ } _%>
    <%_ if (authenticationType === 'session') { _%>

    private final PersistentTokenRepository persistentTokenRepository;
    <%_ } _%>
    <%_ if (authenticationType !== 'oauth2') { _%>

    private static final String CHECK_ERROR_MESSAGE = "Incorrect password";
    <%_ } _%>

    public AccountResource(UserRepository userRepository, UserService userService<% if (authenticationType !== 'oauth2') { %>, MailService mailService<% } %><% if (authenticationType === 'session') { %>, PersistentTokenRepository persistentTokenRepository<% } %>) {

        this.userRepository = userRepository;
        this.userService = userService;
        <%_ if (authenticationType !== 'oauth2') { _%>
        this.mailService = mailService;
        <%_ } _%>
        <%_ if (authenticationType === 'session') { _%>
        this.persistentTokenRepository = persistentTokenRepository;
        <%_ } _%>
    }
<%_ if (authenticationType === 'oauth2') { _%>

    /**
     * GET  /authenticate : check if the user is authenticated, and return its login.
     *
     * @param request the HTTP request
     * @return the login if the user is authenticated
     */
    @GetMapping("/authenticate")
    @Timed
    public String isAuthenticated(HttpServletRequest request) {
        log.debug("REST request to check if the current user is authenticated");
        return request.getRemoteUser();
    }

    /**
     * GET  /account : get the current user.
     *
     * @return the ResponseEntity with status 200 (OK) and the current user in body, or status 500 (Internal Server Error) if the user couldn't be returned
     */
    @GetMapping("/account")
    @Timed
    @SuppressWarnings("unchecked")
    public ResponseEntity<UserDTO> getAccount(Principal principal) {
        if (principal != null) {
            if (principal instanceof OAuth2Authentication) {
                OAuth2Authentication authentication = (OAuth2Authentication) principal;
                LinkedHashMap<String, Object> details = (LinkedHashMap) authentication.getUserAuthentication().getDetails();

                User user = new User();
                user.setLogin(details.get("preferred_username").toString());

                if (details.get("given_name") != null) {
                    user.setFirstName((String) details.get("given_name"));
                }
                if (details.get("family_name") != null) {
                    user.setFirstName((String) details.get("family_name"));
                }
                if (details.get("email_verified") != null) {
                    user.setActivated((Boolean) details.get("email_verified"));
                }
                if (details.get("email") != null) {
                    user.setEmail((String) details.get("email"));
                }
                if (details.get("locale") != null) {
                    String locale = (String) details.get("locale");
                    String langKey = locale.substring(0, locale.indexOf("-"));
                    user.setLangKey(langKey);
                }

                Set<Authority> userAuthorities;

                // get roles from details
                if (details.get("roles") != null) {
                    List<String> roles = (List) details.get("roles");
                    userAuthorities = roles.stream()
                        .filter(role -> role.startsWith("ROLE_"))
                        .map(role -> {
                            Authority userAuthority = new Authority();
                            userAuthority.setName(role);
                            return userAuthority;
                        })
                        .collect(Collectors.toSet());
                    // if roles don't exist, try groups
                } else if (details.get("groups") != null) {
                    List<String> groups = (List) details.get("groups");
                    userAuthorities = groups.stream()
                        .filter(group -> group.startsWith("ROLE_"))
                        .map(group -> {
                            Authority userAuthority = new Authority();
                            userAuthority.setName(group);
                            return userAuthority;
                        })
                        .collect(Collectors.toSet());
                } else {
                    userAuthorities = authentication.getAuthorities().stream()
                        .map(role -> {
                            Authority userAuthority = new Authority();
                            userAuthority.setName(role.getAuthority());
                            return userAuthority;
                        })
                        .collect(Collectors.toSet());
                }

                user.setAuthorities(userAuthorities);
                UserDTO userDTO = new UserDTO(user);

                // convert Authorities to GrantedAuthorities
                Set<GrantedAuthority> grantedAuthorities = new LinkedHashSet<>();
                userAuthorities.forEach(authority -> {
                    grantedAuthorities.add(new SimpleGrantedAuthority(authority.getName()));
                });

                // create UserDetails so #{principal.username} works
                UserDetails userDetails = new org.springframework.security.core.userdetails.User(user.getLogin(),
                    "N/A", grantedAuthorities);
                // update Spring Security Authorities to match groups claim from IdP
                UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                    userDetails, "N/A", grantedAuthorities);
                token.setDetails(details);
                authentication = new OAuth2Authentication(authentication.getOAuth2Request(), token);
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // save account in to sync users between IdP and JHipster's local database
                Optional<User> existingUser = userRepository.findOneByLogin(userDTO.getLogin());
                if (existingUser.isPresent()) {
                    // if IdP sends last updated information, use it to determine if an update should happen
                    if (details.get("updated_at") != null) {
                        Instant dbModifiedDate = existingUser.get().getLastModifiedDate();
                        Instant idpModifiedDate = new Date(Long.valueOf((Integer) details.get("updated_at"))).toInstant();
                        if (idpModifiedDate.isAfter(dbModifiedDate)) {
                            log.debug("Updating user '{}' in local database...", userDTO.getLogin());
                            userService.updateUser(userDTO.getFirstName(), userDTO.getLastName(), userDTO.getEmail(),
                                userDTO.getLangKey(), userDTO.getImageUrl());
                        }
                        // no last updated info, blindly update
                    } else {
                        log.debug("Updating user '{}' in local database...", userDTO.getLogin());
                        userService.updateUser(userDTO.getFirstName(), userDTO.getLastName(), userDTO.getEmail(),
                            userDTO.getLangKey(), userDTO.getImageUrl());
                    }
                } else {
                    log.debug("Saving user '{}' in local database...", userDTO.getLogin());
                    userRepository.save(user);
                }
                return new ResponseEntity<>(userDTO, HttpStatus.OK);
            } else {
                // Allow Spring Security Test to be used to mock users in the database
                return Optional.ofNullable(userService.getUserWithAuthorities())
                    .map(user -> new ResponseEntity<>(new UserDTO(user), HttpStatus.OK))
                    .orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
            }
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
<%_ } else { _%>

    /**
     * POST  /register : register the user.
     *
     * @param managedUserVM the managed user View Model
     * @return the ResponseEntity with status 201 (Created) if the user is registered or 400 (Bad Request) if the login or email is already in use
     */
    @PostMapping(path = "/register",
        produces={MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_PLAIN_VALUE})
    @Timed
    public ResponseEntity registerAccount(@Valid @RequestBody ManagedUserVM managedUserVM) {

        HttpHeaders textPlainHeaders = new HttpHeaders();
        textPlainHeaders.setContentType(MediaType.TEXT_PLAIN);
        if (!checkPasswordLength(managedUserVM.getPassword())) {
            return new ResponseEntity<>(CHECK_ERROR_MESSAGE, HttpStatus.BAD_REQUEST);
        }
        return userRepository.findOneByLogin(managedUserVM.getLogin().toLowerCase())
            .map(user -> new ResponseEntity<>("login already in use", textPlainHeaders, HttpStatus.BAD_REQUEST))
            .orElseGet(() -> userRepository.findOneByEmailIgnoreCase(managedUserVM.getEmail())
                .map(user -> new ResponseEntity<>("email address already in use", textPlainHeaders, HttpStatus.BAD_REQUEST))
                .orElseGet(() -> {
                    User user = userService.registerUser(managedUserVM);

                    mailService.sendActivationEmail(user);
                    return new ResponseEntity<>(HttpStatus.CREATED);
                })
        );
    }

    /**
     * GET  /activate : activate the registered user.
     *
     * @param key the activation key
     * @return the ResponseEntity with status 200 (OK) and the activated user in body, or status 500 (Internal Server Error) if the user couldn't be activated
     */
    @GetMapping("/activate")
    @Timed
    public ResponseEntity<String> activateAccount(@RequestParam(value = "key") String key) {
        return userService.activateRegistration(key)
            .map(user -> new ResponseEntity<String>(HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
    }

    /**
     * GET  /authenticate : check if the user is authenticated, and return its login.
     *
     * @param request the HTTP request
     * @return the login if the user is authenticated
     */
    @GetMapping("/authenticate")
    @Timed
    public String isAuthenticated(HttpServletRequest request) {
        log.debug("REST request to check if the current user is authenticated");
        return request.getRemoteUser();
    }

    /**
     * GET  /account : get the current user.
     *
     * @return the ResponseEntity with status 200 (OK) and the current user in body, or status 500 (Internal Server Error) if the user couldn't be returned
     */
    @GetMapping("/account")
    @Timed
    public ResponseEntity<UserDTO> getAccount() {
        return Optional.ofNullable(userService.getUserWithAuthorities())
            .map(user -> new ResponseEntity<>(new UserDTO(user), HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
    }

    /**
     * POST  /account : update the current user information.
     *
     * @param userDTO the current user information
     * @return the ResponseEntity with status 200 (OK), or status 400 (Bad Request) or 500 (Internal Server Error) if the user couldn't be updated
     */
    @PostMapping("/account")
    @Timed
    public ResponseEntity saveAccount(@Valid @RequestBody UserDTO userDTO) {
        final String userLogin = SecurityUtils.getCurrentUserLogin();
        Optional<User> existingUser = userRepository.findOneByEmailIgnoreCase(userDTO.getEmail());
        if (existingUser.isPresent() && (!existingUser.get().getLogin().equalsIgnoreCase(userLogin))) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("user-management", "emailexists", "Email already in use")).body(null);
        }
        return userRepository
            .findOneByLogin(userLogin)
            .map(u -> {
                userService.updateUser(userDTO.getFirstName(), userDTO.getLastName(), userDTO.getEmail(),
                    userDTO.getLangKey()<% if (databaseType === 'mongodb' || databaseType === 'sql') { %>, userDTO.getImageUrl()<% } %>);
                return new ResponseEntity(HttpStatus.OK);
            })
            .orElseGet(() -> new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
    }

    /**
     * POST  /account/change-password : changes the current user's password
     *
     * @param password the new password
     * @return the ResponseEntity with status 200 (OK), or status 400 (Bad Request) if the new password is not strong enough
     */
    @PostMapping(path = "/account/change-password",
        produces = MediaType.TEXT_PLAIN_VALUE)
    @Timed
    public ResponseEntity changePassword(@RequestBody String password) {
        if (!checkPasswordLength(password)) {
            return new ResponseEntity<>(CHECK_ERROR_MESSAGE, HttpStatus.BAD_REQUEST);
        }
        userService.changePassword(password);
        return new ResponseEntity<>(HttpStatus.OK);
    }<% if (authenticationType === 'session') { %>

    /**
     * GET  /account/sessions : get the current open sessions.
     *
     * @return the ResponseEntity with status 200 (OK) and the current open sessions in body,
     *  or status 500 (Internal Server Error) if the current open sessions couldn't be retrieved
     */
    @GetMapping("/account/sessions")
    @Timed
    public ResponseEntity<List<PersistentToken>> getCurrentSessions() {
        return userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin())
            .map(user -> new ResponseEntity<>(
                persistentTokenRepository.findByUser(user),
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
    }

    /**
     * DELETE  /account/sessions?series={series} : invalidate an existing session.
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
     *
     * @param series the series of an existing session
     * @throws UnsupportedEncodingException if the series couldnt be URL decoded
     */
    @DeleteMapping("/account/sessions/{series}")
    @Timed
    public void invalidateSession(@PathVariable String series) throws UnsupportedEncodingException {
        String decodedSeries = URLDecoder.decode(series, "UTF-8");
        userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin()).ifPresent(u ->
            persistentTokenRepository.findByUser(u).stream()
                .filter(persistentToken -> StringUtils.equals(persistentToken.getSeries(), decodedSeries))<% if (databaseType === 'sql' || databaseType === 'mongodb') { %>
                .findAny().ifPresent(t -> persistentTokenRepository.delete(decodedSeries)));<% } else { %>
                .findAny().ifPresent(persistentTokenRepository::delete));<% } %>
    }<% } %>

    /**
     * POST   /account/reset-password/init : Send an email to reset the password of the user
     *
     * @param mail the mail of the user
     * @return the ResponseEntity with status 200 (OK) if the email was sent, or status 400 (Bad Request) if the email address is not registered
     */
    @PostMapping(path = "/account/reset-password/init",
        produces = MediaType.TEXT_PLAIN_VALUE)
    @Timed
    public ResponseEntity requestPasswordReset(@RequestBody String mail) {
        return userService.requestPasswordReset(mail)
            .map(user -> {
                mailService.sendPasswordResetMail(user);
                return new ResponseEntity<>("email was sent", HttpStatus.OK);
            }).orElse(new ResponseEntity<>("email address not registered", HttpStatus.BAD_REQUEST));
    }

    /**
     * POST   /account/reset-password/finish : Finish to reset the password of the user
     *
     * @param keyAndPassword the generated key and the new password
     * @return the ResponseEntity with status 200 (OK) if the password has been reset,
     * or status 400 (Bad Request) or 500 (Internal Server Error) if the password could not be reset
     */
    @PostMapping(path = "/account/reset-password/finish",
        produces = MediaType.TEXT_PLAIN_VALUE)
    @Timed
    public ResponseEntity<String> finishPasswordReset(@RequestBody KeyAndPasswordVM keyAndPassword) {
        if (!checkPasswordLength(keyAndPassword.getNewPassword())) {
            return new ResponseEntity<>(CHECK_ERROR_MESSAGE, HttpStatus.BAD_REQUEST);
        }
        return userService.completePasswordReset(keyAndPassword.getNewPassword(), keyAndPassword.getKey())
              .map(user -> new ResponseEntity<String>(HttpStatus.OK))
              .orElse(new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR));
    }

    private boolean checkPasswordLength(String password) {
        return !StringUtils.isEmpty(password) &&
            password.length() >= ManagedUserVM.PASSWORD_MIN_LENGTH &&
            password.length() <= ManagedUserVM.PASSWORD_MAX_LENGTH;
    }
<%_ } _%>
}
