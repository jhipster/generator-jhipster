package <%=packageName%>.service;
<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.domain.Authority;<% } %>
import <%=packageName%>.domain.User;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.repository.AuthorityRepository;<% if (authenticationType == 'session') { %>
import <%=packageName%>.repository.PersistentTokenRepository;<% } %><% } %>
import <%=packageName%>.repository.UserRepository;<% if (searchEngine == 'elasticsearch') { %>
import <%=packageName%>.repository.search.UserSearchRepository;<% } %>
import <%=packageName%>.security.AuthoritiesConstants;
import <%=packageName%>.security.SecurityUtils;
import <%=packageName%>.service.util.RandomUtil;
import <%=packageName%>.web.rest.vm.ManagedUserVM;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
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
import javax.inject.Inject;
import java.util.*;

/**
 * Service class for managing users.
 */
@Service<% if (databaseType == 'sql') { %>
@Transactional<% } %>
public class UserService {

    private final Logger log = LoggerFactory.getLogger(UserService.class);
    <%_ if (enableSocialSignIn) { _%>

    @Inject
    private SocialService socialService;
    <%_ } _%>

    @Inject
    private PasswordEncoder passwordEncoder;
    <%_ if (databaseType == 'sql' && authenticationType == 'oauth2') { _%>

    @Inject
    public JdbcTokenStore jdbcTokenStore;
    <%_ } _%>

    @Inject
    private UserRepository userRepository;<% if (searchEngine == 'elasticsearch') { %>

    @Inject
    private UserSearchRepository userSearchRepository;<% } %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %><% if (authenticationType == 'session') { %>

    @Inject
    private PersistentTokenRepository persistentTokenRepository;<% } %><% } %>
<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
    @Inject
    private AuthorityRepository authorityRepository;<% } %>

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

    public User createUser(String login, String password, String firstName, String lastName, String email,
        String langKey) {

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
        newUser.setLangKey(langKey);
        // new user is not active
        newUser.setActivated(false);
        // new user gets registration key
        newUser.setActivationKey(RandomUtil.generateActivationKey());<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        authorities.add(authority);<% } %><% if (databaseType == 'cassandra') { %>
        authorities.add(AuthoritiesConstants.USER);<% } %>
        newUser.setAuthorities(authorities);
        userRepository.save(newUser);<% if (searchEngine == 'elasticsearch') { %>
        userSearchRepository.save(newUser);<% } %>
        log.debug("Created Information for User: {}", newUser);
        return newUser;
    }

    public User createUser(ManagedUserVM managedUserVM) {
        User user = new User();<% if (databaseType == 'cassandra') { %>
        user.setId(UUID.randomUUID().toString());<% } %>
        user.setLogin(managedUserVM.getLogin());
        user.setFirstName(managedUserVM.getFirstName());
        user.setLastName(managedUserVM.getLastName());
        user.setEmail(managedUserVM.getEmail());
        if (managedUserVM.getLangKey() == null) {
            user.setLangKey("<%= nativeLanguage %>"); // default language
        } else {
            user.setLangKey(managedUserVM.getLangKey());
        }<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        if (managedUserVM.getAuthorities() != null) {
            Set<Authority> authorities = new HashSet<>();
            managedUserVM.getAuthorities().forEach(
                authority -> authorities.add(authorityRepository.findOne(authority))
            );
            user.setAuthorities(authorities);
        }<% } %><% if (databaseType == 'cassandra') { %>
        user.setAuthorities(managedUserVM.getAuthorities());<% } %>
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

    public void updateUser(String firstName, String lastName, String email, String langKey) {
        userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin()).ifPresent(user -> {
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setLangKey(langKey);
            <%_ if (databaseType == 'mongodb' || databaseType == 'cassandra') { _%>
            userRepository.save(user);
            <%_ } _%>
            <%_ if (searchEngine == 'elasticsearch') { _%>
            userSearchRepository.save(user);
            <%_ } _%>
            log.debug("Changed Information for User: {}", user);
        });
    }

    public void updateUser(<% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } else { %>Long<% } %> id, String login, String firstName, String lastName, String email,
        boolean activated, String langKey, Set<String> authorities) {

        Optional.of(userRepository
            .findOne(id))
            .ifPresent(user -> {
                user.setLogin(login);
                user.setFirstName(firstName);
                user.setLastName(lastName);
                user.setEmail(email);
                user.setActivated(activated);
                user.setLangKey(langKey);
                <%_ if (databaseType == 'sql' || databaseType == 'mongodb') { _%>
                Set<Authority> managedAuthorities = user.getAuthorities();
                managedAuthorities.clear();
                authorities.forEach(
                    authority -> managedAuthorities.add(authorityRepository.findOne(authority))
                );
                <%_ } else { // Cassandra _%>
                user.setAuthorities(authorities);
                <%_ } _%>
                <%_ if (databaseType == 'mongodb' || databaseType == 'cassandra') { _%>
                userRepository.save(user);
                <%_ } _%>
                log.debug("Changed Information for User: {}", user);
            });
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

    <%_ if (databaseType == 'sql') { _%>
    @Transactional(readOnly = true)
    <%_ } _%>
    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
        <%_ if (databaseType == 'sql') { _%>
        return userRepository.findOneByLogin(login).map(user -> {
            user.getAuthorities().size();
            return user;
        });
        <%_ } else { // MongoDB and Cassandra _%>
        return userRepository.findOneByLogin(login);
        <%_ } _%>
    }

    <%_ if (databaseType == 'sql') { _%>
    @Transactional(readOnly = true)
    <%_ } _%>
    public User getUserWithAuthorities(<%= pkType %> id) {
        User user = userRepository.findOne(id);
        <%_ if (databaseType == 'sql') { _%>
        user.getAuthorities().size(); // eagerly load the association
        <%_ } _%>
        return user;
    }

    <%_ if (databaseType == 'sql') { _%>
    @Transactional(readOnly = true)
    <%_ } _%>
    public User getUserWithAuthorities() {
        Optional<User> optionalUser = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin());
        User user = null;
        if (optionalUser.isPresent()) {
          user = optionalUser.get();
          <%_ if (databaseType == 'sql') { _%>
            user.getAuthorities().size(); // eagerly load the association
          <%_ } _%>
         }
         return user;
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
