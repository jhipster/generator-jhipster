package <%=packageName%>.web.rest;
<% if (databaseType == 'cassandra') { %>
import <%=packageName%>.AbstractCassandraTest;<% } %>
import <%=packageName%>.Application;<% if (databaseType == 'mongodb') { %>
import <%=packageName%>.config.MongoConfiguration;<% } %>
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.config.ApplicationMediaType;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;<% if (databaseType == 'mongodb') { %>
import org.springframework.context.annotation.Import;<% } %>
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import javax.inject.Inject;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the UserResource REST controller.
 *
 * @see UserResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest<% if (databaseType == 'mongodb') { %>
@Import(MongoConfiguration.class)<% } %>
public class UserResourceTest <% if (databaseType == 'cassandra') { %>extends AbstractCassandraTest <% } %>{

    @Inject
    private UserRepository userRepository;

    private MockMvc restUserMockMvc;

    @Before
    public void setup() {
        UserResource userResource = new UserResource();
        ReflectionTestUtils.setField(userResource, "userRepository", userRepository);
        this.restUserMockMvc = MockMvcBuilders.standaloneSetup(userResource).build();
    }

    @Test
    public void testGetExistingUser() throws Exception {
        restUserMockMvc.perform(get("/api/users/admin")
                .accept(ApplicationMediaType.APPLICATION_JSON_V1))
                .andExpect(status().isOk())
                .andExpect(content().contentType(ApplicationMediaType.APPLICATION_JSON_V1))
                .andExpect(jsonPath("$.lastName").value("Administrator"));
    }

    @Test
    public void testGetUnknownUser() throws Exception {
        restUserMockMvc.perform(get("/api/users/unknown")
                .accept(ApplicationMediaType.APPLICATION_JSON_V1))
                .andExpect(status().isNotFound());
    }
}
