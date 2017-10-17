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
<%_
let cacheManagerIsAvailable = false;
if (hibernateCache === 'ehcache' || hibernateCache === 'hazelcast' || hibernateCache === 'infinispan' || clusteredHttpSession === 'hazelcast' || applicationType === 'gateway') {
    cacheManagerIsAvailable = true;
}
_%>
package <%=packageName%>.service;
<% if (databaseType === 'sql' || databaseType === 'mongodb') { %>
import <%=packageName%>.domain.Authority;<% } %>
import <%=packageName%>.domain.User;<% if (databaseType === 'sql' || databaseType === 'mongodb') { %>
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
import <%=packageName%>.web.rest.vm.ManagedUserVM;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
<%_ if (cacheManagerIsAvailable === true) { _%>
import org.springframework.cache.CacheManager;
<%_ } _%>
<%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
    <%_ if (authenticationType !== 'oauth2') { _%>
import org.springframework.scheduling.annotation.Scheduled;
    <%_ } _%>
<%_ } _%>
<%_ if (authenticationType !== 'oauth2') { _%>
import org.springframework.security.crypto.password.PasswordEncoder;
<%_ } _%>
import org.springframework.stereotype.Service;<% if (databaseType === 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>

<%_ if ((databaseType === 'sql' || databaseType === 'mongodb') && authenticationType === 'session') { _%>
import java.time.LocalDate;
<%_ } _%>
<%_ if (authenticationType !== 'oauth2') { _%>
import java.time.Instant;
<%_ } _%>
<%_ if (authenticationType !== 'oauth2' && (databaseType === 'sql' || databaseType === 'mongodb')) { _%>
import java.time.temporal.ChronoUnit;
<%_ } _%>
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service class for managing users.
 */
@Service<% if (databaseType === 'sql') { %>
@Transactional<% } %>
public class UserService {

    private final Logger log = LoggerFactory.getLogger(UserService.class);
    <%_ if (cacheManagerIsAvailable === true) { _%>

    private static final String USERS_CACHE = "users";
    <%_ } _%>

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
    <%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
        <%_ if (authenticationType === 'session') { _%>

    private final PersistentTokenRepository persistentTokenRepository;
        <%_ } _%>

    private final AuthorityRepository authorityRepository;
    <%_ } _%>
    <%_ if (cacheManagerIsAvailable === true) { _%>

    private final CacheManager cacheManager;
    <%_ } _%>

    public UserService(UserRepository userRepository<% if (authenticationType !== 'oauth2') { %>, PasswordEncoder passwordEncoder<% } %><% if (enableSocialSignIn) { %>, SocialService socialService<% } %><% if (searchEngine === 'elasticsearch') { %>, UserSearchRepository userSearchRepository<% } %><% if (databaseType === 'sql' || databaseType === 'mongodb') { %><% if (authenticationType === 'session') { %>, PersistentTokenRepository persistentTokenRepository<% } %>, AuthorityRepository authorityRepository<% } %><% if (cacheManagerIsAvailable === true) { %>, CacheManager cacheManager<% } %>) {
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
        <%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
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
                <%_ if (databaseType === 'mongodb' || databaseType === 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                <%_ if (searchEngine === 'elasticsearch') { _%>
                userSearchRepository.save(user);
                <%_ } _%>
                <%_ if (cacheManagerIsAvailable === true) { _%>
                cacheManager.getCache(USERS_CACHE).evict(user.getLogin());
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
                <%_ if (databaseType === 'mongodb' || databaseType === 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                <%_ if (cacheManagerIsAvailable === true) { _%>
                cacheManager.getCache(USERS_CACHE).evict(user.getLogin());
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
                <%_ if (databaseType === 'mongodb' || databaseType === 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                <%_ if (cacheManagerIsAvailable === true) { _%>
                cacheManager.getCache(USERS_CACHE).evict(user.getLogin());
                <%_ } _%>
                return user;
            });
    }

    public User registerUser(ManagedUserVM userDTO) {

        User newUser = new User();<% if (databaseType === 'sql' || databaseType === 'mongodb') { %>
        Authority authority = authorityRepository.findOne(AuthoritiesConstants.USER);
        Set<Authority> authorities = new HashSet<>();<% } %><% if (databaseType === 'cassandra') { %>
        newUser.setId(UUID.randomUUID().toString());
        Set<String> authorities = new HashSet<>();<% } %>
        String encryptedPassword = passwordEncoder.encode(userDTO.getPassword());
        newUser.setLogin(userDTO.getLogin());
        // new user gets initially a generated password
        newUser.setPassword(encryptedPassword);
        newUser.setFirstName(userDTO.getFirstName());
        newUser.setLastName(userDTO.getLastName());
        newUser.setEmail(userDTO.getEmail());
        <%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
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
        <%_ if (databaseType === 'cassandra') { _%>
        authorities.add(AuthoritiesConstants.USER);
        <%_ } _%>
        newUser.setAuthorities(authorities);
        userRepository.save(newUser);<% if (searchEngine === 'elasticsearch') { %>
        userSearchRepository.save(newUser);<% } %>
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
        <%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
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
        <%_ if (databaseType === 'cassandra') { _%>
        user.setAuthorities(userDTO.getAuthorities());
        <%_ } _%>
        String encryptedPassword = passwordEncoder.encode(RandomUtil.generatePassword());
        user.setPassword(encryptedPassword);
        user.setResetKey(RandomUtil.generateResetKey());
        user.setResetDate(Instant.now());
        user.setActivated(true);
        userRepository.save(user);<% if (searchEngine === 'elasticsearch') { %>
        userSearchRepository.save(user);<% } %>
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
     <%_ if (databaseType === 'mongodb' || databaseType === 'sql') { _%>
     * @param imageUrl image URL of user
     <%_ } _%>
     */
    public void updateUser(String firstName, String lastName, String email, String langKey<% if (databaseType === 'mongodb' || databaseType === 'sql') { %>, String imageUrl<% } %>) {
        userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin()).ifPresent(user -> {
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setLangKey(langKey);
            <%_ if (databaseType === 'mongodb' || databaseType === 'sql') { _%>
            user.setImageUrl(imageUrl);
            <%_ } _%>
            <%_ if (databaseType === 'mongodb' || databaseType === 'cassandra') { _%>
            userRepository.save(user);
            <%_ } _%>
            <%_ if (searchEngine === 'elasticsearch') { _%>
            userSearchRepository.save(user);
            <%_ } _%>
            <%_ if (cacheManagerIsAvailable === true) { _%>
            cacheManager.getCache(USERS_CACHE).evict(user.getLogin());
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
                user.setLogin(userDTO.getLogin());
                user.setFirstName(userDTO.getFirstName());
                user.setLastName(userDTO.getLastName());
                user.setEmail(userDTO.getEmail());
                <%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
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
                <%_ } else { // Cassandra _%>
                user.setAuthorities(userDTO.getAuthorities());
                <%_ } _%>
                <%_ if (databaseType === 'mongodb' || databaseType === 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                <%_ if (searchEngine === 'elasticsearch') { _%>
                userSearchRepository.save(user);
                <%_ } _%>
                <%_ if (cacheManagerIsAvailable === true) { _%>
                cacheManager.getCache(USERS_CACHE).evict(user.getLogin());
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
            cacheManager.getCache(USERS_CACHE).evict(login);
            <%_ } _%>
            log.debug("Deleted User: {}", user);
        });
    }
<%_ if (authenticationType !== 'oauth2') { _%>

    public void changePassword(String password) {
        userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin()).ifPresent(user -> {
            String encryptedPassword = passwordEncoder.encode(password);
            user.setPassword(encryptedPassword);
            <%_ if (databaseType === 'mongodb' || databaseType === 'cassandra') { _%>
            userRepository.save(user);
            <%_ } _%>
            <%_ if (cacheManagerIsAvailable === true) { _%>
            cacheManager.getCache(USERS_CACHE).evict(user.getLogin());
            <%_ } _%>
            log.debug("Changed password for User: {}", user);
        });
    }
<%_ } _%>

    <%_ if (databaseType === 'sql') { _%>
    @Transactional(readOnly = true)
    <%_ } _%>
    <%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
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
        <%_ } else { // MongoDB and Cassandra _%>
        return userRepository.findOneByLogin(login);
        <%_ } _%>
    }

    <%_ if (databaseType === 'sql') { _%>
    @Transactional(readOnly = true)
    <%_ } _%>
    public User getUserWithAuthorities(<%= pkType %> id) {
        <%_ if (databaseType === 'sql') { _%>
        return userRepository.findOneWithAuthoritiesById(id);
        <%_ } else { // MongoDB and Cassandra _%>
        return userRepository.findOne(id);
        <%_ } _%>
    }

    <%_ if (databaseType === 'sql') { _%>
    @Transactional(readOnly = true)
    <%_ } _%>
    public User getUserWithAuthorities() {
        <%_ if (databaseType === 'sql') { _%>
        return userRepository.findOneWithAuthoritiesByLogin(SecurityUtils.getCurrentUserLogin()).orElse(null);
        <%_ } else { // MongoDB and Cassandra _%>
        return userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin()).orElse(null);
        <%_ } _%>
    }
    <%_ if ((databaseType === 'sql' || databaseType === 'mongodb') && authenticationType === 'session') { _%>

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
    <%_ if (authenticationType !== 'oauth2' && (databaseType === 'sql' || databaseType === 'mongodb')) { _%>

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
            cacheManager.getCache(USERS_CACHE).evict(user.getLogin());
            <%_ } _%>
        }
    }
    <%_ } if (databaseType === 'sql' || databaseType === 'mongodb') { _%>

    /**
     * @return a list of all the authorities
     */
    public List<String> getAuthorities() {
        return authorityRepository.findAll().stream().map(Authority::getName).collect(Collectors.toList());
    }
    <%_ } _%>
}
