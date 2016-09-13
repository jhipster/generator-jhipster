package <%=packageName%>.web.rest;
<% if (databaseType == 'cassandra') { %>
import <%=packageName%>.AbstractCassandraTest;<% } %>
import <%=packageName%>.<%= mainClass %>;
import <%=packageName%>.domain.User;
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.service.UserService;
<% if (databaseType == 'sql') { %>
import org.apache.commons.lang3.RandomStringUtils;<% } %>
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import javax.inject.Inject;<% if (databaseType == 'sql') { %>
import javax.persistence.EntityManager;<% } %>

<%_ if (enableSocialSignIn) { _%>
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
<%_ } _%>
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the UserResource REST controller.
 *
 * @see UserResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = <%= mainClass %>.class)
public class UserResourceIntTest <% if (databaseType == 'cassandra') { %>extends AbstractCassandraTest <% } %>{

    @Inject
    private UserRepository userRepository;

    @Inject
    private UserService userService;

    private MockMvc restUserMockMvc;
<%_ if (databaseType == 'sql') { _%>

    /**
     * Create a User.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which has a required relationship to the User entity.
     */
    public static User createEntity(EntityManager em) {
        User user = new User();
        user.setLogin("test");
        user.setPassword(RandomStringUtils.random(60));
        user.setActivated(true);
        user.setEmail("test@test.com");
        user.setFirstName("test");
        user.setLastName("test");
        user.setLangKey("en");
        em.persist(user);
        em.flush();
        return user;
    }
<%_ } _%>

    @Before
    public void setup() {
        UserResource userResource = new UserResource();
        ReflectionTestUtils.setField(userResource, "userRepository", userRepository);
        ReflectionTestUtils.setField(userResource, "userService", userService);
        this.restUserMockMvc = MockMvcBuilders.standaloneSetup(userResource).build();
    }

    @Test
    public void testGetExistingUser() throws Exception {
        restUserMockMvc.perform(get("/api/users/admin")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.lastName").value("Administrator"));
    }

    @Test
    public void testGetUnknownUser() throws Exception {
        restUserMockMvc.perform(get("/api/users/unknown")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
    <%_ if (enableSocialSignIn) { _%>

    @Test
    public void testGetExistingUserWithAnEmailLogin() throws Exception {
        User user = userService.createUser("john.doe@localhost.com", "johndoe", "John", "Doe", "john.doe@localhost.com", "en-US");

        restUserMockMvc.perform(get("/api/users/john.doe@localhost.com")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
                .andExpect(jsonPath("$.login").value("john.doe@localhost.com"));

        userRepository.delete(user);
    }

    @Test
    public void testDeleteExistingUserWithAnEmailLogin() throws Exception {
        User user = userService.createUser("john.doe@localhost.com", "johndoe", "John", "Doe", "john.doe@localhost.com", "en-US");

        restUserMockMvc.perform(delete("/api/users/john.doe@localhost.com")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        assertThat(userRepository.findOneByLogin("john.doe@localhost.com").isPresent()).isFalse();

        userRepository.delete(user);
    }
    <%_ } _%>
}
