<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

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
<%_
let cacheManagerIsAvailable = false;
if (['ehcache', 'hazelcast', 'infinispan'].includes(cacheProvider) || applicationType === 'gateway') {
    cacheManagerIsAvailable = true;
}
_%>
package <%=packageName%>.service;

<%_ if (cacheManagerIsAvailable === true) { _%>
import <%=packageName%>.config.CacheConfiguration;
<%_ } _%>
<%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
import <%=packageName%>.domain.Authority;<% } %>
import <%=packageName%>.domain.User;<% if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { %>
import <%=packageName%>.repository.AuthorityRepository;<% if (authenticationType === 'session') { %>
import <%=packageName%>.repository.PersistentTokenRepository;<% } %><% } %>
import <%=packageName%>.config.Constants;
import <%=packageName%>.repository.UserRepository;<% if (searchEngine === 'elasticsearch') { %>
import <%=packageName%>.repository.search.UserSearchRepository;<% } %>
<%_ if (authenticationType !== 'oauth2') { _%>
import <%=packageName%>.security.AuthoritiesConstants;
<%_ } _%>
import <%=packageName%>.security.SecurityUtils;
<%_ if (authenticationType !== 'oauth2') { _%>
import <%=packageName%>.service.util.RandomUtil;
<%_ } _%>
import <%=packageName%>.service.dto.UserDTO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
<%_ if (cacheManagerIsAvailable === true) { _%>
import org.springframework.cache.CacheManager;
<%_ } _%>
<%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
    <%_ if (authenticationType !== 'oauth2') { _%>
import org.springframework.scheduling.annotation.Scheduled;
    <%_ } _%>
<%_ } _%>
<%_ if (authenticationType === 'oauth2' && applicationType === 'monolith') { _%>
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
<%_ } _%>
<%_ if (authenticationType !== 'oauth2') { _%>
import org.springframework.security.crypto.password.PasswordEncoder;
<%_ } _%>
import org.springframework.stereotype.Service;<% if (databaseType === 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>

<%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { _%>
import java.time.LocalDate;
<%_ } _%>
<%_ if (authenticationType !== 'oauth2' || applicationType === 'monolith') { _%>
import java.time.Instant;
<%_ } _%>
<%_ if (authenticationType !== 'oauth2' && (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase')) { _%>
import java.time.temporal.ChronoUnit;
<%_ } _%>
import java.util.*;
import java.util.stream.Collectors;
<%_ if (authenticationType === 'oauth2' && applicationType === 'monolith') { _%>
import java.util.stream.Stream;
<%_ } _%>

/**
 * Service class for managing users.
 */
@Service<% if (databaseType === 'sql') { %>
@Transactional<% } %>
public class UserService {

    private final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    <%_ if (authenticationType !== 'oauth2') { _%>

    private final PasswordEncoder passwordEncoder;
    <%_ } _%>
    <%_ if (enableSocialSignIn) { _%>

    private final SocialService socialService;
    <%_ } _%>
    <%_ if (searchEngine === 'elasticsearch') { _%>

    private final UserSearchRepository userSearchRepository;
    <%_ } _%>
    <%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
        <%_ if (authenticationType === 'session') { _%>

    private final PersistentTokenRepository persistentTokenRepository;
        <%_ } _%>

    private final AuthorityRepository authorityRepository;
    <%_ } _%>
    <%_ if (cacheManagerIsAvailable === true) { _%>

    private final CacheManager cacheManager;
    <%_ } _%>

    public UserService(UserRepository userRepository<% if (authenticationType !== 'oauth2') { %>, PasswordEncoder passwordEncoder<% } %><% if (enableSocialSignIn) { %>, SocialService socialService<% } %><% if (searchEngine === 'elasticsearch') { %>, UserSearchRepository userSearchRepository<% } %><% if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { %><% if (authenticationType === 'session') { %>, PersistentTokenRepository persistentTokenRepository<% } %>, AuthorityRepository authorityRepository<% } %><% if (cacheManagerIsAvailable === true) { %>, CacheManager cacheManager<% } %>) {
        this.userRepository = userRepository;
        <%_ if (authenticationType !== 'oauth2') { _%>
        this.passwordEncoder = passwordEncoder;
        <%_ } _%>
        <%_ if (enableSocialSignIn) { _%>
        this.socialService = socialService;
        <%_ } _%>
        <%_ if (searchEngine === 'elasticsearch') { _%>
        this.userSearchRepository = userSearchRepository;
        <%_ } _%>
        <%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
            <%_ if (authenticationType === 'session') { _%>
        this.persistentTokenRepository = persistentTokenRepository;
            <%_ } _%>
        this.authorityRepository = authorityRepository;
        <%_ } _%>
        <%_ if (cacheManagerIsAvailable === true) { _%>
        this.cacheManager = cacheManager;
        <%_ } _%>
    }
<%_ if (authenticationType !== 'oauth2') { _%>

    public Optional<User> activateRegistration(String key) {
        log.debug("Activating user for activation key {}", key);
        return userRepository.findOneByActivationKey(key)
            .map(user -> {
                // activate given user for the registration key.
                user.setActivated(true);
                user.setActivationKey(null);
                <%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                <%_ if (searchEngine === 'elasticsearch') { _%>
                userSearchRepository.save(user);
                <%_ } _%>
                <%_ if (cacheManagerIsAvailable === true) { _%>
                cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).evict(user.getLogin());
                cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE).evict(user.getEmail());
                <%_ } _%>
                log.debug("Activated user: {}", user);
                return user;
            });
    }

    public Optional<User> completePasswordReset(String newPassword, String key) {
       log.debug("Reset user password for reset key {}", key);

       return userRepository.findOneByResetKey(key)
           .filter(user -> user.getResetDate().isAfter(Instant.now().minusSeconds(86400)))
           .map(user -> {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetKey(null);
                user.setResetDate(null);
                <%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                <%_ if (cacheManagerIsAvailable === true) { _%>
                cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).evict(user.getLogin());
                cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE).evict(user.getEmail());
                <%_ } _%>
                return user;
           });
    }

    public Optional<User> requestPasswordReset(String mail) {
        return userRepository.findOneByEmailIgnoreCase(mail)
            .filter(User::getActivated)
            .map(user -> {
                user.setResetKey(RandomUtil.generateResetKey());
                user.setResetDate(Instant.now());
                <%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                <%_ if (cacheManagerIsAvailable === true) { _%>
                cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).evict(user.getLogin());
                cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE).evict(user.getEmail());
                <%_ } _%>
                return user;
            });
    }

    public User registerUser(UserDTO userDTO, String password) {

        User newUser = new User();<% if (databaseType === 'sql' || databaseType === 'mongodb') { %>
        Authority authority = authorityRepository.findOne(AuthoritiesConstants.USER);
        Set<Authority> authorities = new HashSet<>();<% } %><% if (databaseType === 'cassandra') { %>
        newUser.setId(UUID.randomUUID().toString());<% } %><% if (databaseType === 'cassandra' || databaseType === 'couchbase') { %>
        Set<String> authorities = new HashSet<>();<% } %>
        String encryptedPassword = passwordEncoder.encode(password);
        newUser.setLogin(userDTO.getLogin());
        // new user gets initially a generated password
        newUser.setPassword(encryptedPassword);
        newUser.setFirstName(userDTO.getFirstName());
        newUser.setLastName(userDTO.getLastName());
        newUser.setEmail(userDTO.getEmail());
        <%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
        newUser.setImageUrl(userDTO.getImageUrl());
        <%_ } _%>
        newUser.setLangKey(userDTO.getLangKey());
        // new user is not active
        newUser.setActivated(false);
        // new user gets registration key
        newUser.setActivationKey(RandomUtil.generateActivationKey());
        <%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
        authorities.add(authority);
        <%_ } _%>
        <%_ if (databaseType === 'cassandra' || databaseType === 'couchbase') { _%>
        authorities.add(AuthoritiesConstants.USER);
        <%_ } _%>
        newUser.setAuthorities(authorities);
        userRepository.save(newUser);<% if (searchEngine === 'elasticsearch') { %>
        userSearchRepository.save(newUser);<% } %>
        <%_ if (cacheManagerIsAvailable === true) { _%>
        cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).evict(newUser.getLogin());
        cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE).evict(newUser.getEmail());
        <%_ } _%>
        log.debug("Created Information for User: {}", newUser);
        return newUser;
    }

    public User createUser(UserDTO userDTO) {
        User user = new User();<% if (databaseType === 'cassandra') { %>
        user.setId(UUID.randomUUID().toString());<% } %>
        user.setLogin(userDTO.getLogin());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        <%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
        user.setImageUrl(userDTO.getImageUrl());
        <%_ } _%>
        if (userDTO.getLangKey() == null) {
            user.setLangKey(Constants.DEFAULT_LANGUAGE); // default language
        } else {
            user.setLangKey(userDTO.getLangKey());
        }
        <%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
        if (userDTO.getAuthorities() != null) {
            Set<Authority> authorities = userDTO.getAuthorities().stream()
                .map(authorityRepository::findOne)
                .collect(Collectors.toSet());
            user.setAuthorities(authorities);
        }
        <%_ } _%>
        <%_ if (databaseType === 'cassandra' || databaseType === 'couchbase') { _%>
        user.setAuthorities(userDTO.getAuthorities());
        <%_ } _%>
        String encryptedPassword = passwordEncoder.encode(RandomUtil.generatePassword());
        user.setPassword(encryptedPassword);
        user.setResetKey(RandomUtil.generateResetKey());
        user.setResetDate(Instant.now());
        user.setActivated(true);
        userRepository.save(user);<% if (searchEngine === 'elasticsearch') { %>
        userSearchRepository.save(user);<% } %>
        <%_ if (cacheManagerIsAvailable === true) { _%>
        cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).evict(user.getLogin());
        cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE).evict(user.getEmail());
        <%_ } _%>
        log.debug("Created Information for User: {}", user);
        return user;
    }
<%_ } _%>

    /**
     * Update basic information (first name, last name, email, language) for the current user.
     *
     * @param firstName first name of user
     * @param lastName last name of user
     * @param email email id of user
     * @param langKey language key
     <%_ if (databaseType === 'mongodb' || databaseType === 'sql' || databaseType === 'couchbase') { _%>
     * @param imageUrl image URL of user
     <%_ } _%>
     */
    public void updateUser(String firstName, String lastName, String email, String langKey<% if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'sql') { %>, String imageUrl<% } %>) {
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setEmail(email);
                user.setLangKey(langKey);
                <%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'sql') { _%>
                user.setImageUrl(imageUrl);
                <%_ } _%>
                <%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                <%_ if (searchEngine === 'elasticsearch') { _%>
                userSearchRepository.save(user);
                <%_ } _%>
                <%_ if (cacheManagerIsAvailable === true) { _%>
                cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).evict(user.getLogin());
                cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE).evict(user.getEmail());
                <%_ } _%>
                log.debug("Changed Information for User: {}", user);
            });
    }

    /**
     * Update all information for a specific user, and return the modified user.
     *
     * @param userDTO user to update
     * @return updated user
     */
    public Optional<UserDTO> updateUser(UserDTO userDTO) {
        return Optional.of(userRepository
            .findOne(userDTO.getId()))
            .map(user -> {
                <%_ if (databaseType === 'couchbase') { _%>
                if (!user.getLogin().equals(userDTO.getLogin())) {
                    userRepository.delete(userDTO.getId());
                }
                <%_ } _%>
                user.setLogin(userDTO.getLogin());
                user.setFirstName(userDTO.getFirstName());
                user.setLastName(userDTO.getLastName());
                user.setEmail(userDTO.getEmail());
                <%_ if (databaseType === 'sql' || databaseType === 'mongodb'|| databaseType === 'couchbase') { _%>
                user.setImageUrl(userDTO.getImageUrl());
                <%_ } _%>
                user.setActivated(userDTO.isActivated());
                user.setLangKey(userDTO.getLangKey());
                <%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
                Set<Authority> managedAuthorities = user.getAuthorities();
                managedAuthorities.clear();
                userDTO.getAuthorities().stream()
                    .map(authorityRepository::findOne)
                    .forEach(managedAuthorities::add);
                <%_ } else { // Cassandra & Couchbase _%>
                user.setAuthorities(userDTO.getAuthorities());
                <%_ } _%>
                <%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                <%_ if (searchEngine === 'elasticsearch') { _%>
                userSearchRepository.save(user);
                <%_ } _%>
                <%_ if (cacheManagerIsAvailable === true) { _%>
                cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).evict(user.getLogin());
                cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE).evict(user.getEmail());
                <%_ } _%>
                log.debug("Changed Information for User: {}", user);
                return user;
            })
            .map(UserDTO::new);
    }

    public void deleteUser(String login) {
        userRepository.findOneByLogin(login).ifPresent(user -> {
            <%_ if (enableSocialSignIn) { _%>
            socialService.deleteUserSocialConnection(user.getLogin());
            <%_ } _%>
            userRepository.delete(user);
            <%_ if (searchEngine === 'elasticsearch') { _%>
            userSearchRepository.delete(user);
            <%_ } _%>
            <%_ if (cacheManagerIsAvailable === true) { _%>
            cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).evict(user.getLogin());
            cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE).evict(user.getEmail());
            <%_ } _%>
            log.debug("Deleted User: {}", user);
        });
    }
<%_ if (authenticationType !== 'oauth2') { _%>

    public void changePassword(String password) {
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                String encryptedPassword = passwordEncoder.encode(password);
                user.setPassword(encryptedPassword);
                <%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                <%_ if (cacheManagerIsAvailable === true) { _%>
                cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).evict(user.getLogin());
                cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE).evict(user.getEmail());
                <%_ } _%>
                log.debug("Changed password for User: {}", user);
            });
    }
<%_ } _%>

    <%_ if (databaseType === 'sql') { _%>
    @Transactional(readOnly = true)
    <%_ } _%>
    <%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
    public Page<UserDTO> getAllManagedUsers(Pageable pageable) {
        return userRepository.findAllByLoginNot(pageable, Constants.ANONYMOUS_USER).map(UserDTO::new);
    }<% } else { // Cassandra %>
    public List<UserDTO> getAllManagedUsers() {
        return userRepository.findAll().stream()
            .filter(user -> !Constants.ANONYMOUS_USER.equals(user.getLogin()))
            .map(UserDTO::new)
            .collect(Collectors.toList());
    }<% } %>

    <%_ if (databaseType === 'sql') { _%>
    @Transactional(readOnly = true)
    <%_ } _%>
    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
        <%_ if (databaseType === 'sql') { _%>
        return userRepository.findOneWithAuthoritiesByLogin(login);
        <%_ } else { // MongoDB, Couchbase and Cassandra _%>
        return userRepository.findOneByLogin(login);
        <%_ } _%>
    }

    <%_ if (databaseType === 'sql') { _%>
    @Transactional(readOnly = true)
    <%_ } _%>
    public Optional<User> getUserWithAuthorities(<%= pkType %> id) {
        <%_ if (databaseType === 'sql') { _%>
        return userRepository.findOneWithAuthoritiesById(id);
        <%_ } else { // MongoDB, Couchbase and and Cassandra _%>
        return Optional.ofNullable(userRepository.findOne(id));
        <%_ } _%>
    }

    <%_ if (databaseType === 'sql') { _%>
    @Transactional(readOnly = true)
    <%_ } _%>
    public Optional<User> getUserWithAuthorities() {
        return SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOne<% if (databaseType === 'sql') { %>WithAuthorities<% } %>ByLogin);
    }
    <%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { _%>

    /**
     * Persistent Token are used for providing automatic authentication, they should be automatically deleted after
     * 30 days.
     * <p>
     * This is scheduled to get fired everyday, at midnight.
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void removeOldPersistentTokens() {
        LocalDate now = LocalDate.now();
        persistentTokenRepository.findByTokenDateBefore(now.minusMonths(1)).forEach(token -> {
            log.debug("Deleting token {}", token.getSeries());<% if (databaseType === 'sql') { %>
            User user = token.getUser();
            user.getPersistentTokens().remove(token);<% } %>
            persistentTokenRepository.delete(token);
        });
    }
    <%_ } _%>
    <%_ if (authenticationType !== 'oauth2' && (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase')) { _%>

    /**
     * Not activated users should be automatically deleted after 3 days.
     * <p>
     * This is scheduled to get fired everyday, at 01:00 (am).
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers() {
        List<User> users = userRepository.findAllByActivatedIsFalseAndCreatedDateBefore(Instant.now().minus(3, ChronoUnit.DAYS));
        for (User user : users) {
            log.debug("Deleting not activated user {}", user.getLogin());
            userRepository.delete(user);
            <%_ if (searchEngine === 'elasticsearch') { _%>
            userSearchRepository.delete(user);
            <%_ } _%>
            <%_ if (cacheManagerIsAvailable === true) { _%>
            cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).evict(user.getLogin());
            cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE).evict(user.getEmail());
            <%_ } _%>
        }
    }
    <%_ } if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>

    /**
     * @return a list of all the authorities
     */
    public List<String> getAuthorities() {
        return authorityRepository.findAll().stream().map(Authority::getName).collect(Collectors.toList());
    }
    <%_ } _%>
    <%_ if (authenticationType === 'oauth2' && applicationType === 'monolith') { _%>

    /**
     * Returns the user for a OAuth2 authentication.
     * Synchronizes the user in the local repository
     *
     * @param authentication OAuth2 authentication
     * @return the user from the authentication
     */
    public UserDTO getUserFromAuthentication(OAuth2Authentication authentication) {
        Map<String, Object> details = (Map<String, Object>) authentication.getUserAuthentication().getDetails();
        User user = getUser(details);
        Set<<% if (databaseType === 'couchbase') { %>String<% } else { %>Authority<% } %>> userAuthorities = extractAuthorities(authentication, details);
        user.setAuthorities(userAuthorities);

        // convert Authorities to GrantedAuthorities
        Set<GrantedAuthority> grantedAuthorities = userAuthorities.stream()
        <%_ if (databaseType !== 'couchbase') { _%>
            .map(Authority::getName)
        <%_ } _%>
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toSet());

        UsernamePasswordAuthenticationToken token = getToken(details, user, grantedAuthorities);
        authentication = new OAuth2Authentication(authentication.getOAuth2Request(), token);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return new UserDTO(syncUserWithIdP(details, user));
    }

    private User syncUserWithIdP(Map<String, Object> details, User user) {
        // save account in to sync users between IdP and JHipster's local database
        Optional<User> existingUser = userRepository.findOneByLogin(user.getLogin());
        if (existingUser.isPresent()) {
            // if IdP sends last updated information, use it to determine if an update should happen
            if (details.get("updated_at") != null) {
                Instant dbModifiedDate = existingUser.get().getLastModifiedDate();
                Instant idpModifiedDate = new Date(Long.valueOf((Integer) details.get("updated_at"))).toInstant();
                if (idpModifiedDate.isAfter(dbModifiedDate)) {
                    log.debug("Updating user '{}' in local database...", user.getLogin());
                    updateUser(user.getFirstName(), user.getLastName(), user.getEmail(),
                        user.getLangKey(), user.getImageUrl());
                }
                // no last updated info, blindly update
            } else {
                log.debug("Updating user '{}' in local database...", user.getLogin());
                updateUser(user.getFirstName(), user.getLastName(), user.getEmail(),
                    user.getLangKey(), user.getImageUrl());
            }
        } else {
            log.debug("Saving user '{}' in local database...", user.getLogin());
            userRepository.save(user);
            <%_ if (cacheManagerIsAvailable === true) { _%>
            cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).evict(user.getLogin());
            cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE).evict(user.getEmail());
            <%_ } _%>
        }
        return user;
    }

    private static UsernamePasswordAuthenticationToken getToken(Map<String, Object> details, User user, Set<GrantedAuthority> grantedAuthorities) {
        // create UserDetails so #{principal.username} works
        UserDetails userDetails =
            new org.springframework.security.core.userdetails.User(user.getLogin(),
            "N/A", grantedAuthorities);
        // update Spring Security Authorities to match groups claim from IdP
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
            userDetails, "N/A", grantedAuthorities);
        token.setDetails(details);
        return token;
    }

    private static Set<<% if (databaseType === 'couchbase') { %>String<% } else { %>Authority<% } %>> extractAuthorities(OAuth2Authentication authentication, Map<String, Object> details) {
        Set<<% if (databaseType === 'couchbase') { %>String<% } else { %>Authority<% } %>> userAuthorities;
        // get roles from details
        if (details.get("roles") != null) {
            userAuthorities = extractAuthorities((List<String>) details.get("roles"));
            // if roles don't exist, try groups
        } else if (details.get("groups") != null) {
            userAuthorities = extractAuthorities((List<String>) details.get("groups"));
        } else {
            userAuthorities = authoritiesFromStringStream(
                authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
            );
        }
        return userAuthorities;
    }

    private static User getUser(Map<String, Object> details) {
        User user = new User();
        user.setLogin((String) details.get("preferred_username"));
        if (details.get("given_name") != null) {
            user.setFirstName((String) details.get("given_name"));
        }
        if (details.get("family_name") != null) {
            user.setLastName((String) details.get("family_name"));
        }
        if (details.get("email_verified") != null) {
            user.setActivated((Boolean) details.get("email_verified"));
        }
        if (details.get("email") != null) {
            user.setEmail((String) details.get("email"));
        }
        if (details.get("langKey") != null) {
            user.setLangKey((String) details.get("langKey"));
        } else if (details.get("locale") != null) {
            String locale = (String) details.get("locale");
            String langKey = locale.substring(0, locale.indexOf("-"));
            user.setLangKey(langKey);
        }
        if (details.get("picture") != null) {
            user.setImageUrl((String) details.get("picture"));
        }
        return user;
    }

    private static Set<<% if (databaseType === 'couchbase') { %>String<% } else { %>Authority<% } %>> extractAuthorities(List<String> values) {
        return authoritiesFromStringStream(
            values.stream().filter(role -> role.startsWith("ROLE_"))
        );
    }

    private static Set<<% if (databaseType === 'couchbase') { %>String<% } else { %>Authority<% } %>> authoritiesFromStringStream(Stream<String> strings) {
        return strings<% if (databaseType !== 'couchbase') { %>
                    .map(string -> {
                        Authority auth = new Authority();
                        auth.setName(string);
                        return auth;
                    })<% } %>.collect(Collectors.toSet());
    }
    <%_ } _%>

}
