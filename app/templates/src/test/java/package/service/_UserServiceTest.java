package <%=packageName%>.service;

import <%=packageName%>.domain.PersistentToken;
import <%=packageName%>.domain.User;
import <%=packageName%>.repository.PersistentTokenRepository;
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.test.ApplicationTestConfiguration;
import org.joda.time.LocalDate;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.ContextHierarchy;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import javax.inject.Inject;

import static org.junit.Assert.assertEquals;

/**
 * Test class for the UserResource REST controller.
 *
 * @see UserService
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextHierarchy({
        @ContextConfiguration(
                name = "root",
                classes = ApplicationTestConfiguration.class)
})
@DirtiesContext(classMode= DirtiesContext.ClassMode.AFTER_CLASS)
public class UserServiceTest {

    private static final Logger log = LoggerFactory.getLogger(UserServiceTest.class);

    @Inject
    private PersistentTokenRepository persistentTokenRepository;

    @Inject
    private UserRepository userRepository;

    @Inject
    private UserService userService;

    @Test
    public void testRemoveOldPersistentTokens() {
        assertEquals(0, persistentTokenRepository.findAll().size());
        User admin = userRepository.findOne("admin");
        generateUserToken(admin, "1111-1111", new LocalDate());
        LocalDate now = new LocalDate();
        generateUserToken(admin, "2222-2222", now.minusDays(32));
        assertEquals(2, persistentTokenRepository.findAll().size());
        userService.removeOldPersistentTokens();
        assertEquals(1, persistentTokenRepository.findAll().size());
    }

    private void generateUserToken(User user, String tokenSeries, LocalDate localDate) {
        PersistentToken token = new PersistentToken();
        token.setSeries(tokenSeries);
        token.setUser(user);
        token.setTokenValue(tokenSeries + "-data");
        token.setTokenDate(localDate);
        token.setIpAddress("127.0.0.1");
        token.setUserAgent("Test agent");
        persistentTokenRepository.saveAndFlush(token);
    }
}
