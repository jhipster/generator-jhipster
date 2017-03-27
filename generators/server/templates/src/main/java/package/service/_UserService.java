package <%=packageName%>.service;
<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.domain.Authority;<% } %>
import <%=packageName%>.domain.User;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.repository.AuthorityRepository;<% if (authenticationType == 'session') { %>
import <%=packageName%>.repository.PersistentTokenRepository;<% } %><% } %>
import <%=packageName%>.config.Constants;
import <%=packageName%>.repository.UserRepository;<% if (searchEngine == 'elasticsearch') { %>
import <%=packageName%>.repository.search.UserSearchRepository;<% } %>
import <%=packageName%>.security.AuthoritiesConstants;
import <%=packageName%>.security.SecurityUtils;
import <%=packageName%>.service.util.RandomUtil;
import <%=packageName%>.service.dto.UserDTO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;<% } %>
import org.springframework.security.crypto.password.PasswordEncoder;
<%_ if (databaseType == 'sql' && authenticationType == 'oauth2') { _%>
import org.springframework.security.oauth2.provider.token.store.JdbcTokenStore;
<%_ } _%>
import org.springframework.stereotype.Service;<% if (databaseType == 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>

<%_ if ((databaseType == 'sql' || databaseType == 'mongodb') && authenticationType == 'session') { _%>
import java.time.LocalDate;
<%_ } _%>
import java.time.ZonedDateTime;
import java.util.*;<% if (databaseType == 'cassandra') { %>
import java.util.stream.Collectors;<% } %>

/**
 * Service class for managing users.
 */
@Service<% if (databaseType == 'sql') { %>
@Transactional<% } %>
public class UserService {

    private final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;
    <%_ if (enableSocialSignIn) { _%>

    private final SocialService socialService;
    <%_ } _%>
    <%_ if (databaseType == 'sql' && authenticationType == 'oauth2') { _%>

    public final JdbcTokenStore jdbcTokenStore;
    <%_ } _%>
    <%_ if (searchEngine == 'elasticsearch') { _%>

    private final UserSearchRepository userSearchRepository;
    <%_ } _%>
    <%_ if (databaseType == 'sql' || databaseType == 'mongodb') { _%>
        <%_ if (authenticationType == 'session') { _%>

    private final PersistentTokenRepository persistentTokenRepository;
        <%_ } _%>

    private final AuthorityRepository authorityRepository;
    <%_ } _%>

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder<% if (enableSocialSignIn) { %>, SocialService socialService<% } %><% if (databaseType == 'sql' && authenticationType == 'oauth2') { %>, JdbcTokenStore jdbcTokenStore<% } %><% if (searchEngine == 'elasticsearch') { %>, UserSearchRepository userSearchRepository<% } %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %><% if (authenticationType == 'session') { %>, PersistentTokenRepository persistentTokenRepository<% } %>, AuthorityRepository authorityRepository<% } %>) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        <%_ if (enableSocialSignIn) { _%>
        this.socialService = socialService;
        <%_ } _%>
        <%_ if (databaseType == 'sql' && authenticationType == 'oauth2') { _%>
        this.jdbcTokenStore = jdbcTokenStore;
        <%_ } _%>
        <%_ if (searchEngine == 'elasticsearch') { _%>
        this.userSearchRepository = userSearchRepository;
        <%_ } _%>
        <%_ if (databaseType == 'sql' || databaseType == 'mongodb') { _%>
            <%_ if (authenticationType == 'session') { _%>
        this.persistentTokenRepository = persistentTokenRepository;
            <%_ } _%>
        this.authorityRepository = authorityRepository;
        <%_ } _%>
    }

    public Optional<User> activateRegistration(String key) {
        log.debug("Activating user for activation key {}", key);
        return userRepository.findOneByActivationKey(key)
            .map(user -> {
                // activate given user for the registration key.
                user.setActivated(true);
                user.setActivationKey(null);
                <%_ if (databaseType == 'mongodb' || databaseType == 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                <%_ if (searchEngine == 'elasticsearch') { _%>
                userSearchRepository.save(user);
                <%_ } _%>
                log.debug("Activated user: {}", user);
                return user;
            });
    }

    public Optional<User> completePasswordReset(String newPassword, String key) {
       log.debug("Reset user password for reset key {}", key);

       return userRepository.findOneByResetKey(key)
            .filter(user -> {
                ZonedDateTime oneDayAgo = ZonedDateTime.now().minusHours(24);
                return user.getResetDate()<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>.isAfter(oneDayAgo);<% } %><% if (databaseType == 'cassandra') { %>.after(Date.from(oneDayAgo.toInstant()));<% } %>
           })
           .map(user -> {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetKey(null);
                user.setResetDate(null);
                <%_ if (databaseType == 'mongodb' || databaseType == 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                return user;
           });
    }

    public Optional<User> requestPasswordReset(String mail) {
        return userRepository.findOneByEmail(mail)
            .filter(User::getActivated)
            .map(user -> {
                user.setResetKey(RandomUtil.generateResetKey());
                user.<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>setResetDate(ZonedDateTime.now());<% } %><% if (databaseType == 'cassandra') { %>setResetDate(new Date());<% } %>
                <%_ if (databaseType == 'mongodb' || databaseType == 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                return user;
            });
    }

    public User createUser(String login, String password, String firstName, String lastName, String email<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>,
        String imageUrl<% } %>, String langKey) {

        User newUser = new User();<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        Authority authority = authorityRepository.findOne(AuthoritiesConstants.USER);
        Set<Authority> authorities = new HashSet<>();<% } %><% if (databaseType == 'cassandra') { %>
        newUser.setId(UUID.randomUUID().toString());
        Set<String> authorities = new HashSet<>();<% } %>
        String encryptedPassword = passwordEncoder.encode(password);
        newUser.setLogin(login);
        // new user gets initially a generated password
        newUser.setPassword(encryptedPassword);
        newUser.setFirstName(firstName);
        newUser.setLastName(lastName);
        newUser.setEmail(email);
        <%_ if (databaseType == 'sql' || databaseType == 'mongodb') { _%>
        newUser.setImageUrl(imageUrl);
        <%_ } _%>
        newUser.setLangKey(langKey);
        // new user is not active
        newUser.setActivated(false);
        // new user gets registration key
        newUser.setActivationKey(RandomUtil.generateActivationKey());
        <%_ if (databaseType == 'sql' || databaseType == 'mongodb') { _%>
        authorities.add(authority);
        <%_ } _%>
        <%_ if (databaseType == 'cassandra') { _%>
        authorities.add(AuthoritiesConstants.USER);
        <%_ } _%>
        newUser.setAuthorities(authorities);
        userRepository.save(newUser);<% if (searchEngine == 'elasticsearch') { %>
        userSearchRepository.save(newUser);<% } %>
        log.debug("Created Information for User: {}", newUser);
        return newUser;
    }

    public User createUser(UserDTO userDTO) {
        User user = new User();<% if (databaseType == 'cassandra') { %>
        user.setId(UUID.randomUUID().toString());<% } %>
        user.setLogin(userDTO.getLogin());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        <%_ if (databaseType == 'sql' || databaseType == 'mongodb') { _%>
        user.setImageUrl(userDTO.getImageUrl());
        <%_ } _%>
        if (userDTO.getLangKey() == null) {
            user.setLangKey("<%= nativeLanguage %>"); // default language
        } else {
            user.setLangKey(userDTO.getLangKey());
        }
        <%_ if (databaseType == 'sql' || databaseType == 'mongodb') { _%>
        if (userDTO.getAuthorities() != null) {
            Set<Authority> authorities = new HashSet<>();
            userDTO.getAuthorities().forEach(
                authority -> authorities.add(authorityRepository.findOne(authority))
            );
            user.setAuthorities(authorities);
        }
        <%_ } _%>
        <%_ if (databaseType == 'cassandra') { _%>
        user.setAuthorities(userDTO.getAuthorities());
        <%_ } _%>
        String encryptedPassword = passwordEncoder.encode(RandomUtil.generatePassword());
        user.setPassword(encryptedPassword);
        user.setResetKey(RandomUtil.generateResetKey());
        user.<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>setResetDate(ZonedDateTime.now());<% } %><% if (databaseType == 'cassandra') { %>setResetDate(new Date());<% } %>
        user.setActivated(true);
        userRepository.save(user);<% if (searchEngine == 'elasticsearch') { %>
        userSearchRepository.save(user);<% } %>
        log.debug("Created Information for User: {}", user);
        return user;
    }

    /**
     * Update basic information (first name, last name, email, language) for the current user.
     *
     * @param firstName first name of user
     * @param lastName last name of user
     * @param email email id of user
     * @param langKey language key
     <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
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
            <%_ if (databaseType == 'mongodb' || databaseType == 'cassandra') { _%>
            userRepository.save(user);
            <%_ } _%>
            <%_ if (searchEngine == 'elasticsearch') { _%>
            userSearchRepository.save(user);
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
                <%_ if (databaseType == 'sql' || databaseType == 'mongodb') { _%>
                user.setImageUrl(userDTO.getImageUrl());
                <%_ } _%>
                user.setActivated(userDTO.isActivated());
                user.setLangKey(userDTO.getLangKey());
                <%_ if (databaseType == 'sql' || databaseType == 'mongodb') { _%>
                Set<Authority> managedAuthorities = user.getAuthorities();
                managedAuthorities.clear();
                userDTO.getAuthorities().stream()
                    .map(authorityRepository::findOne)
                    .forEach(managedAuthorities::add);
                <%_ } else { // Cassandra _%>
                user.setAuthorities(userDTO.getAuthorities());
                <%_ } _%>
                <%_ if (databaseType == 'mongodb' || databaseType == 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                log.debug("Changed Information for User: {}", user);
                return user;
            })
            .map(UserDTO::new);
    }

    public void deleteUser(String login) {
        <%_ if (databaseType == 'sql' && authenticationType == 'oauth2') { _%>
        jdbcTokenStore.findTokensByUserName(login).forEach(token ->
            jdbcTokenStore.removeAccessToken(token));
        <%_ } _%>
        userRepository.findOneByLogin(login).ifPresent(user -> {
            <%_ if (enableSocialSignIn) { _%>
            socialService.deleteUserSocialConnection(user.getLogin());
            <%_ } _%>
            userRepository.delete(user);
            <%_ if (searchEngine == 'elasticsearch') { _%>
            userSearchRepository.delete(user);
            <%_ } _%>
            log.debug("Deleted User: {}", user);
        });
    }

    public void changePassword(String password) {
        userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin()).ifPresent(user -> {
            String encryptedPassword = passwordEncoder.encode(password);
            user.setPassword(encryptedPassword);
            <%_ if (databaseType == 'mongodb' || databaseType == 'cassandra') { _%>
            userRepository.save(user);
            <%_ } _%>
            log.debug("Changed password for User: {}", user);
        });
    }

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

    <%_ if (databaseType == 'sql') { _%>
    @Transactional(readOnly = true)
    <%_ } _%>
    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
        <%_ if (databaseType == 'sql') { _%>
        return userRepository.findOneWithAuthoritiesByLogin(login);
        <%_ } else { // MongoDB and Cassandra _%>
        return userRepository.findOneByLogin(login);
        <%_ } _%>
    }

    <%_ if (databaseType == 'sql') { _%>
    @Transactional(readOnly = true)
    <%_ } _%>
    public User getUserWithAuthorities(<%= pkType %> id) {
        <%_ if (databaseType == 'sql') { _%>
        return userRepository.findOneWithAuthoritiesById(id);
        <%_ } else { // MongoDB and Cassandra _%>
        return userRepository.findOne(id);
        <%_ } _%>
    }

    <%_ if (databaseType == 'sql') { _%>
    @Transactional(readOnly = true)
    <%_ } _%>
    public User getUserWithAuthorities() {
        <%_ if (databaseType == 'sql') { _%>
        return userRepository.findOneWithAuthoritiesByLogin(SecurityUtils.getCurrentUserLogin()).orElse(null);
        <%_ } else { // MongoDB and Cassandra _%>
        return userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin()).orElse(null);
        <%_ } _%>
    }
    <%_ if ((databaseType == 'sql' || databaseType == 'mongodb') && authenticationType == 'session') { _%>

    /**
     * Persistent Token are used for providing automatic authentication, they should be automatically deleted after
     * 30 days.
     * <p>
     * This is scheduled to get fired everyday, at midnight.
     * </p>
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void removeOldPersistentTokens() {
        LocalDate now = LocalDate.now();
        persistentTokenRepository.findByTokenDateBefore(now.minusMonths(1)).forEach(token -> {
            log.debug("Deleting token {}", token.getSeries());<% if (databaseType == 'sql') { %>
            User user = token.getUser();
            user.getPersistentTokens().remove(token);<% } %>
            persistentTokenRepository.delete(token);
        });
    }<% } %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %>

    /**
     * Not activated users should be automatically deleted after 3 days.
     * <p>
     * This is scheduled to get fired everyday, at 01:00 (am).
     * </p>
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers() {
        ZonedDateTime now = ZonedDateTime.now();
        List<User> users = userRepository.findAllByActivatedIsFalseAndCreatedDateBefore(now.minusDays(3));
        for (User user : users) {
            log.debug("Deleting not activated user {}", user.getLogin());
            userRepository.delete(user);<% if (searchEngine == 'elasticsearch') { %>
            userSearchRepository.delete(user);<% } %>
        }
    }<% } %>
}
