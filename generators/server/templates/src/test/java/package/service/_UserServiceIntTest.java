package <%=packageName%>.service;
<% if (databaseType == 'cassandra') { %>
import <%=packageName%>.AbstractCassandraTest;<% } %>
import <%=packageName%>.<%= mainClass %>;<% if ((databaseType == 'sql' || databaseType == 'mongodb') && authenticationType == 'session') { %>
import <%=packageName%>.domain.PersistentToken;<% } %>
import <%=packageName%>.domain.User;<% if ((databaseType == 'sql' || databaseType == 'mongodb') && authenticationType == 'session') { %>
import <%=packageName%>.repository.PersistentTokenRepository;<% } %>
import <%=packageName%>.config.Constants;
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.service.dto.UserDTO;
import java.time.ZonedDateTime;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.service.util.RandomUtil;<% } %><% if ((databaseType == 'sql' || databaseType == 'mongodb') && authenticationType == 'session') { %>
import java.time.LocalDate;<% } %>
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;<% if (databaseType == 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>
import org.springframework.test.context.junit4.SpringRunner;
<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import java.util.Optional;<%}%>
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Test class for the UserResource REST controller.
 *
 * @see UserService
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = <%= mainClass %>.class)<% if (databaseType == 'sql') { %>
@Transactional<% } %>
public class UserServiceIntTest <% if (databaseType == 'cassandra') { %>extends AbstractCassandraTest <% } %>{<% if ((databaseType == 'sql' || databaseType == 'mongodb') && authenticationType == 'session') { %>

    @Autowired
    private PersistentTokenRepository persistentTokenRepository;<% } %>

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;<% if ((databaseType == 'sql' || databaseType == 'mongodb') && authenticationType == 'session') { %>

    @Test
    public void testRemoveOldPersistentTokens() {
        User admin = userRepository.findOneByLogin("admin").get();
        int existingCount = persistentTokenRepository.findByUser(admin).size();
        generateUserToken(admin, "1111-1111", LocalDate.now());
        LocalDate now = LocalDate.now();
        generateUserToken(admin, "2222-2222", now.minusDays(32));
        assertThat(persistentTokenRepository.findByUser(admin)).hasSize(existingCount + 2);
        userService.removeOldPersistentTokens();
        assertThat(persistentTokenRepository.findByUser(admin)).hasSize(existingCount + 1);
    }<% } %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %>

    @Test
    public void assertThatUserMustExistToResetPassword() {
        Optional<User> maybeUser = userService.requestPasswordReset("john.doe@localhost");
        assertThat(maybeUser.isPresent()).isFalse();

        maybeUser = userService.requestPasswordReset("admin@localhost");
        assertThat(maybeUser.isPresent()).isTrue();

        assertThat(maybeUser.get().getEmail()).isEqualTo("admin@localhost");
        assertThat(maybeUser.get().getResetDate()).isNotNull();
        assertThat(maybeUser.get().getResetKey()).isNotNull();
    }

    @Test
    public void assertThatOnlyActivatedUserCanRequestPasswordReset() {
        User user = userService.createUser("johndoe", "johndoe", "John", "Doe", "john.doe@localhost", "http://placehold.it/50x50", "en-US");
        Optional<User> maybeUser = userService.requestPasswordReset("john.doe@localhost");
        assertThat(maybeUser.isPresent()).isFalse();
        userRepository.delete(user);
    }

    @Test
    public void assertThatResetKeyMustNotBeOlderThan24Hours() {
        User user = userService.createUser("johndoe", "johndoe", "John", "Doe", "john.doe@localhost", "http://placehold.it/50x50", "en-US");

        ZonedDateTime daysAgo = ZonedDateTime.now().minusHours(25);
        String resetKey = RandomUtil.generateResetKey();
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey(resetKey);

        userRepository.save(user);

        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey());

        assertThat(maybeUser.isPresent()).isFalse();

        userRepository.delete(user);
    }

    @Test
    public void assertThatResetKeyMustBeValid() {
        User user = userService.createUser("johndoe", "johndoe", "John", "Doe", "john.doe@localhost", "http://placehold.it/50x50", "en-US");

        ZonedDateTime daysAgo = ZonedDateTime.now().minusHours(25);
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey("1234");
        userRepository.save(user);
        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey());
        assertThat(maybeUser.isPresent()).isFalse();
        userRepository.delete(user);
    }

    @Test
    public void assertThatUserCanResetPassword() {
        User user = userService.createUser("johndoe", "johndoe", "John", "Doe", "john.doe@localhost", "http://placehold.it/50x50", "en-US");
        String oldPassword = user.getPassword();
        ZonedDateTime daysAgo = ZonedDateTime.now().minusHours(2);
        String resetKey = RandomUtil.generateResetKey();
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey(resetKey);
        userRepository.save(user);
        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey());
        assertThat(maybeUser.isPresent()).isTrue();
        assertThat(maybeUser.get().getResetDate()).isNull();
        assertThat(maybeUser.get().getResetKey()).isNull();
        assertThat(maybeUser.get().getPassword()).isNotEqualTo(oldPassword);

        userRepository.delete(user);
    }

    @Test
    public void testFindNotActivatedUsersByCreationDateBefore() {
        userService.removeNotActivatedUsers();
        ZonedDateTime now = ZonedDateTime.now();
        List<User> users = userRepository.findAllByActivatedIsFalseAndCreatedDateBefore(now.minusDays(3));
        assertThat(users).isEmpty();
    }<% } %><% if ((databaseType == 'sql' || databaseType == 'mongodb') && authenticationType == 'session') { %>

    private void generateUserToken(User user, String tokenSeries, LocalDate localDate) {
        PersistentToken token = new PersistentToken();
        token.setSeries(tokenSeries);
        token.setUser(user);
        token.setTokenValue(tokenSeries + "-data");
        token.setTokenDate(localDate);
        token.setIpAddress("127.0.0.1");
        token.setUserAgent("Test agent");<% if (databaseType == 'sql') { %>
        persistentTokenRepository.saveAndFlush(token);<% } %><% if (databaseType == 'mongodb') { %>
        persistentTokenRepository.save(token);<% } %>
    }<% } %>

    @Test
    public void assertThatAnonymousUserIsNotGet() {<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        final PageRequest pageable = new PageRequest(0, (int) userRepository.count());
        final Page<UserDTO> allManagedUsers = userService.getAllManagedUsers(pageable);
        assertThat(allManagedUsers.getContent().stream()<% } %><% if (databaseType == 'cassandra') { %>
        final List<UserDTO> allManagedUsers = userService.getAllManagedUsers();
        assertThat(allManagedUsers.stream()<% } %>
            .noneMatch(user -> Constants.ANONYMOUS_USER.equals(user.getLogin())))
            .isTrue();
    }
}
