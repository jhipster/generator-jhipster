package <%=packageName%>.service;
<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.domain.Authority;<% if (authenticationType == 'session') { %>
import <%=packageName%>.domain.PersistentToken;<% } %><% } %>
import <%=packageName%>.domain.User;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.repository.AuthorityRepository;<% if (authenticationType == 'session') { %>
import <%=packageName%>.repository.PersistentTokenRepository;<% } %><% } %>
import <%=packageName%>.repository.UserRepository;<% if (searchEngine == 'elasticsearch') { %>
import <%=packageName%>.repository.search.UserSearchRepository;<% } %><% if (databaseType == 'cassandra') { %>
import <%=packageName%>.security.AuthoritiesConstants;<% } %>
import <%=packageName%>.security.SecurityUtils;
import <%=packageName%>.service.util.RandomUtil;
import <%=packageName%>.web.rest.dto.ManagedUserDTO;
import java.time.ZonedDateTime;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import java.time.LocalDate;<% } %>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;<% if (databaseType == 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>

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

    @Inject
    private PasswordEncoder passwordEncoder;

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
        userRepository.findOneByActivationKey(key)
            .map(user -> {
                // activate given user for the registration key.
                user.setActivated(true);
                user.setActivationKey(null);
                userRepository.save(user);<% if (searchEngine == 'elasticsearch') { %>
                userSearchRepository.save(user);<% } %>
                log.debug("Activated user: {}", user);
                return user;
            });
        return Optional.empty();
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
                userRepository.save(user);
                return user;
           });
    }

    public Optional<User> requestPasswordReset(String mail) {
        return userRepository.findOneByEmail(mail)
            .filter(User::getActivated)
            .map(user -> {
                user.setResetKey(RandomUtil.generateResetKey());
                user.<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>setResetDate(ZonedDateTime.now());<% } %><% if (databaseType == 'cassandra') { %>setResetDate(new Date());<% } %>
                userRepository.save(user);
                return user;
            });
    }

    public User createUserInformation(String login, String password, String firstName, String lastName, String email,
        String langKey) {

        User newUser = new User();<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        Authority authority = authorityRepository.findOne("ROLE_USER");
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

    public User createUser(ManagedUserDTO managedUserDTO) {
        User user = new User();<% if (databaseType == 'cassandra') { %>
        user.setId(UUID.randomUUID().toString());<% } %>
        user.setLogin(managedUserDTO.getLogin());
        user.setFirstName(managedUserDTO.getFirstName());
        user.setLastName(managedUserDTO.getLastName());
        user.setEmail(managedUserDTO.getEmail());
        if (managedUserDTO.getLangKey() == null) {
            user.setLangKey("en"); // default language is English
        } else {
            user.setLangKey(managedUserDTO.getLangKey());
        }<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        Set<Authority> authorities = new HashSet<>();
        managedUserDTO.getAuthorities().stream().forEach(
            authority -> authorities.add(authorityRepository.findOne(authority))
        );
        user.setAuthorities(authorities);<% } %><% if (databaseType == 'cassandra') { %>
        user.setAuthorities(managedUserDTO.getAuthorities());<% } %>
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

    public void updateUserInformation(String firstName, String lastName, String email, String langKey) {
        userRepository.findOneByLogin(SecurityUtils.getCurrentUser().getUsername()).ifPresent(u -> {
            u.setFirstName(firstName);
            u.setLastName(lastName);
            u.setEmail(email);
            u.setLangKey(langKey);
            userRepository.save(u);<% if (searchEngine == 'elasticsearch') { %>
            userSearchRepository.save(u);<% } %>
            log.debug("Changed Information for User: {}", u);
        });
    }

    public void deleteUserInformation(String login) {
        userRepository.findOneByLogin(login).ifPresent(u -> {
            userRepository.delete(u);<% if (searchEngine == 'elasticsearch') { %>
            userSearchRepository.delete(u);<% } %>
            log.debug("Deleted User: {}", u);
        });
    }

    public void changePassword(String password) {
        userRepository.findOneByLogin(SecurityUtils.getCurrentUser().getUsername()).ifPresent(u -> {
            String encryptedPassword = passwordEncoder.encode(password);
            u.setPassword(encryptedPassword);
            userRepository.save(u);
            log.debug("Changed password for User: {}", u);
        });
    }
<% if (databaseType == 'sql') { %>
    @Transactional(readOnly = true)<% } %>
    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
        return userRepository.findOneByLogin(login).map(u -> {
            u.getAuthorities().size();
            return u;
        });
    }
<% if (databaseType == 'sql') { %>
    @Transactional(readOnly = true)<% } %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
    public User getUserWithAuthorities(<%= pkType %> id) {
        User user = userRepository.findOne(id);
        user.getAuthorities().size(); // eagerly load the association
        return user;
    }<% } %>
<% if (databaseType == 'sql') { %>
    @Transactional(readOnly = true)<% } %>
    public User getUserWithAuthorities() {
        User user = userRepository.findOneByLogin(SecurityUtils.getCurrentUser().getUsername()).get();
        user.getAuthorities().size(); // eagerly load the association
        return user;
    }<% if ((databaseType == 'sql' || databaseType == 'mongodb') && authenticationType == 'session') { %>

    /**
     * Persistent Token are used for providing automatic authentication, they should be automatically deleted after
     * 30 days.
     * <p/>
     * <p>
     * This is scheduled to get fired everyday, at midnight.
     * </p>
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void removeOldPersistentTokens() {
        LocalDate now = LocalDate.now();
        persistentTokenRepository.findByTokenDateBefore(now.minusMonths(1)).stream().forEach(token -> {
            log.debug("Deleting token {}", token.getSeries());<% if (databaseType == 'sql') { %>
            User user = token.getUser();
            user.getPersistentTokens().remove(token);<% } %>
            persistentTokenRepository.delete(token);
        });
    }<% } %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %>

    /**
     * Not activated users should be automatically deleted after 3 days.
     * <p/>
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
