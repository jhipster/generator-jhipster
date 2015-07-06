package <%=packageName%>.web.rest;
<% if (databaseType == 'cassandra') { %>
import <%=packageName%>.AbstractCassandraTest;<% } %>
import <%=packageName%>.Application;<% if (databaseType == 'mongodb') { %>
import <%=packageName%>.config.MongoConfiguration;<% } %>
import <%=packageName%>.web.rest.dto.UserManagementDTO;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;<% if (databaseType == 'mongodb') { %>
import org.springframework.context.annotation.Import;<% } %>
import org.springframework.http.MediaType;
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
public class AuthorityResourceTest <% if (databaseType == 'cassandra') { %>extends AbstractCassandraTest <% } %>{
    private MockMvc restAuthorityMockMvc;

    @Before
    public void setup() {
        this.restAuthorityMockMvc = MockMvcBuilders.standaloneSetup(userAuthorhityResource).build();
    }

    @Test
    public void testGetAllUser() throws Exception {
        restUserManagementMockMvc.perform(get("/api/authorities")
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[0].name").exists());
    }

    @Test
    public void testGetUser() throws Exception {
        restUserManagementMockMvc.perform(get("/api/authorities/{name}", "ROLE_ADMIN")
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").isEqualTo("ROLE_ADMIN"));
    }

    @Test
    public void updateUser() throws Exception {
        userManagementDTO = new UserManagementDTO();
        userManagementDTO.setFirstName(UPDATED_FIRST_NAME);
        userManagementDTO.setLastName(UPDATED_LAST_NAME);
        userManagementDTO.setEmail(UPDATED_EMAIL);
        userManagementDTO.setActivated(UPDATED_ACTIVATED);
        userManagementDTO.setLangKey(UPDATED_LANG_KEY);

        restAuthorMockMvc.perform(put("/api/userManagement")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(userManagementDTO)))
                .andExpect(status().isOk());

        // Validate the Author in the database
        User user = userRepository.findOneByLogin();
        assertThat(user.getFirstName()).isEqualTo(UPDATED_FIRST_NAME);
        assertThat(user.getLastName()).isEqualTo(UPDATED_LAST_NAME);
        assertThat(user.getEmail()).isEqualTo(UPDATED_EMAIL);
        assertThat(user.isActivated()).isEqualTo(UPDATED_ACTIVATED);
        assertThat(user.getLangKey()).isEqualTo(UPDATED_LANG_KEY);
    }
}
