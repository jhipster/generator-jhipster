package <%=packageName%>.service;
<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.domain.Authority;<% if (authenticationType == 'session') { %>
import <%=packageName%>.domain.PersistentToken;<% } %><% } %>
import <%=packageName%>.domain.User;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.repository.AuthorityRepository;<% } %><% if (authenticationType == 'session') { %>
import <%=packageName%>.repository.PersistentTokenRepository;<% } %>
import <%=packageName%>.repository.UserRepository;<% if (searchEngine == 'elasticsearch') { %>
import <%=packageName%>.repository.search.UserSearchRepository;<% } %><% if (databaseType == 'cassandra') { %>
import <%=packageName%>.security.AuthoritiesConstants;<% } %>
import <%=packageName%>.security.SecurityUtils;
import <%=packageName%>.service.util.RandomUtil;
import org.joda.time.DateTime;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import org.joda.time.LocalDate;<% } %>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;<% if (databaseType == 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>

import javax.inject.Inject;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import java.util.HashSet;
import java.util.List;<% if (javaVersion == '8') { %>
import java.util.Optional;<% } %>
import java.util.Set;<% } %><% if (databaseType == 'cassandra') { %>
import java.util.*;<% } %>

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
    private UserSearchRepository userSearchRepository;<% } %><% if (authenticationType == 'session') { %>

    @Inject
    private PersistentTokenRepository persistentTokenRepository;<% } %>
<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
    @Inject
    private AuthorityRepository authorityRepository;<% } %>
<% if (javaVersion == '8') { %>
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
               DateTime oneDayAgo = DateTime.now().minusHours(24);
               return user.getResetDate()<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>.isAfter(oneDayAgo.toInstant().getMillis());<% } %><% if (databaseType == 'cassandra') { %>.after(oneDayAgo.toDate());<% } %>
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
           .filter(user -> user.getActivated() == true)
           .map(user -> {
               user.setResetKey(RandomUtil.generateResetKey());
               user.<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>setResetDate(DateTime.now());<% } %><% if (databaseType == 'cassandra') { %>setResetDate(new Date());<% } %>
               userRepository.save(user);
               return user;
           });
    }<% } else { %>
    public  User activateRegistration(String key) {
        log.debug("Activating user for activation key {}", key);
        User user = userRepository.findOneByActivationKey(key);
        // activate given user for the registration key.
        if (user != null) {
            user.setActivated(true);
            user.setActivationKey(null);
            userRepository.save(user);<% if (searchEngine == 'elasticsearch') { %>
            userSearchRepository.save(user);<% } %>
            log.debug("Activated user: {}", user);
        }
        return user;
    }

    public User completePasswordReset(String newPassword, String key) {
        log.debug("Reset user password for reset key {}", key);
        User user = userRepository.findOneByResetKey(key);
        DateTime oneDayAgo = DateTime.now().minusHours(24);
        if (user != null && user.getActivated()) {
            if (user.getResetDate().isAfter(oneDayAgo.toInstant().getMillis())) {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetKey(null);
                user.setResetDate(null);
                userRepository.save(user);
                return user;
            } else {
                return null;
            }
        }
        return null;
    }

    public User requestPasswordReset(String mail) {
        User user = userRepository.findOneByEmail(mail);
        if (user != null && user.getActivated()) {
            user.setResetKey(RandomUtil.generateResetKey());
            user.setResetDate(DateTime.now());
            userRepository.save(user);
            return user;
        }
        return null;
    }<% } %>

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

    public void updateUserInformation(String firstName, String lastName, String email, String langKey) {<% if (javaVersion == '8') { %>
        userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).ifPresent(u -> {
            u.setFirstName(firstName);
            u.setLastName(lastName);
            u.setEmail(email);
            u.setLangKey(langKey);
            userRepository.save(u);<% if (searchEngine == 'elasticsearch') { %>
            userSearchRepository.save(u);<% } %>
            log.debug("Changed Information for User: {}", u);
        });<%} else {%>
        User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentLogin());
        currentUser.setFirstName(firstName);
        currentUser.setLastName(lastName);
        currentUser.setEmail(email);
        currentUser.setLangKey(langKey);
        userRepository.save(currentUser);<% if (searchEngine == 'elasticsearch') { %>
        userSearchRepository.save(user);<% } %>
        log.debug("Changed Information for User: {}", currentUser);<%}%>
    }

    public void changePassword(String password) {<% if (javaVersion == '8') { %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).ifPresent(u-> {<% } %><% if (databaseType == 'cassandra') { %>
        userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).ifPresent(u -> {<% } %>
            String encryptedPassword = passwordEncoder.encode(password);
            u.setPassword(encryptedPassword);
            userRepository.save(u);
            log.debug("Changed password for User: {}", u);
        });<%} else {%>
        User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentLogin());
        String encryptedPassword = passwordEncoder.encode(password);
        currentUser.setPassword(encryptedPassword);
        userRepository.save(currentUser);<% if (searchEngine == 'elasticsearch') { %>
        userSearchRepository.save(user);<% } %>
        log.debug("Changed password for User: {}", currentUser);<% } %>
    }
<% if (databaseType == 'sql') { %>
    @Transactional(readOnly = true)<% } %>
    public User getUserWithAuthorities() {<% if (javaVersion == '8') { %>
        User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentLogin()).get();
        currentUser.getAuthorities().size(); // eagerly load the association<% } else { %>
        User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentLogin());
        currentUser.getAuthorities().size(); // eagerly load the association<% } %>
        return currentUser;
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
        LocalDate now = new LocalDate();<% if (javaVersion == '8') { %>
        persistentTokenRepository.findByTokenDateBefore(now.minusMonths(1)).stream().forEach(token ->{
            log.debug("Deleting token {}", token.getSeries());<% if (databaseType == 'sql') { %>
            User user = token.getUser();
            user.getPersistentTokens().remove(token);<% } %>
            persistentTokenRepository.delete(token);
        });<% }else { %>
        List<PersistentToken> tokens = persistentTokenRepository.findByTokenDateBefore(now.minusMonths(1));
        for (PersistentToken token : tokens) {
            log.debug("Deleting token {}", token.getSeries());<% if (databaseType == 'sql') { %>
            User user = token.getUser();
            user.getPersistentTokens().remove(token);<% } %>
            persistentTokenRepository.delete(token);
        }<% } %>
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
        DateTime now = new DateTime();
        List<User> users = userRepository.findAllByActivatedIsFalseAndCreatedDateBefore(now.minusDays(3));
        for (User user : users) {
            log.debug("Deleting not activated user {}", user.getLogin());
            userRepository.delete(user);<% if (searchEngine == 'elasticsearch') { %>
            userSearchRepository.delete(user);<% } %>
        }
    }<% } %>
}
