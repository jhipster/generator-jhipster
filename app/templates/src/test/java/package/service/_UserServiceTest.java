package <%=packageName%>.service;

import <%=packageName%>.Application;<% if (databaseType == 'mongodb') { %>
import <%=packageName%>.config.MongoConfiguration;<% } %><% if (authenticationType == 'cookie') { %>
import <%=packageName%>.domain.PersistentToken;<% } %>
import <%=packageName%>.domain.User;<% if (authenticationType == 'cookie') { %>
import <%=packageName%>.repository.PersistentTokenRepository;<% } %>
import <%=packageName%>.repository.UserRepository;
import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;<% if (databaseType == 'mongodb') { %>
import org.springframework.context.annotation.Import;<% } %><% if (databaseType == 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import javax.inject.Inject;<% if (javaVersion == '8') { %>
import java.util.Optional;<%}%>
import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Test class for the UserResource REST controller.
 *
 * @see UserService
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest<% if (databaseType == 'mongodb') { %>
@Import(MongoConfiguration.class)<% } %><% if (databaseType == 'sql') { %>
@Transactional<% } %>
public class UserServiceTest {<% if (authenticationType == 'cookie') { %>

    @Inject
    private PersistentTokenRepository persistentTokenRepository;<% } %>

    @Inject
    private UserRepository userRepository;

    @Inject
    private UserService userService;<% if (authenticationType == 'cookie') { %>

    @Test
    public void testRemoveOldPersistentTokens() {<% if (javaVersion == '8') { %>
        User admin = userRepository.findOneByLogin("admin").get();<% } else { %>
        User admin = userRepository.findOneByLogin("admin");<% } %>
        int existingCount = persistentTokenRepository.findByUser(admin).size();
        generateUserToken(admin, "1111-1111", new LocalDate());
        LocalDate now = new LocalDate();
        generateUserToken(admin, "2222-2222", now.minusDays(32));
        assertThat(persistentTokenRepository.findByUser(admin)).hasSize(existingCount + 2);
        userService.removeOldPersistentTokens();
        assertThat(persistentTokenRepository.findByUser(admin)).hasSize(existingCount + 1);
    }<% } %>

    @Test
    public void testFindNotActivatedUsersByCreationDateBefore() {
        userService.removeNotActivatedUsers();
        DateTime now = new DateTime();
        List<User> users = userRepository.findAllByActivatedIsFalseAndCreatedDateBefore(now.minusDays(3));
        assertThat(users).isEmpty();
    }<% if (authenticationType == 'cookie') { %>

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
}
