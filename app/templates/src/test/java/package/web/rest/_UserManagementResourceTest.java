package <%=packageName%>.web.rest;
<% if (databaseType == 'cassandra') { %>
import <%=packageName%>.AbstractCassandraTest;<% } %>
import <%=packageName%>.Application;<% if (databaseType == 'mongodb') { %>
import <%=packageName%>.config.MongoConfiguration;<% } %>
import <%=packageName%>.domain.User;
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.web.rest.dto.UserManagementDTO;
import <%=packageName%>.web.rest.mapper.UserManagementMapper;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
public class UserManagementResourceTest <% if (databaseType == 'cassandra') { %>extends AbstractCassandraTest <% } %>{

    private static final String UPDATED_FIRST_NAME = "UPDATED_FIRST_NAME";
    private static final String UPDATED_LAST_NAME = "UPDATED_LAST_NAME";
    private static final String UPDATED_EMAIL = "updated@email.com";
    private static final Boolean UPDATED_ACTIVATED = false;
    private static final String UPDATED_LANG_KEY = "en";

    @Inject
    private UserRepository userRepository;
    @Inject
    private UserManagementMapper userManagementMapper;

    private MockMvc restUserManagementMockMvc;

    private UserManagementDTO userManagementDTO;

    @Before
    public void setup() {
        UserManagementResource userManagementResource = new UserManagementResource();
        ReflectionTestUtils.setField(userManagementResource, "userRepository", userRepository);
        ReflectionTestUtils.setField(userManagementResource, "userManagementMapper", userManagementMapper);
        this.restUserManagementMockMvc = MockMvcBuilders.standaloneSetup(userManagementResource).build();
    }

    @Test
    public void testGetAllUser() throws Exception {
        restUserManagementMockMvc.perform(get("/api/userManagement"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[0].id").exists())
                .andExpect(jsonPath("$.[0].login").exists())
                .andExpect(jsonPath("$.[0].firstName").exists())
                .andExpect(jsonPath("$.[0].lastName").exists())
                .andExpect(jsonPath("$.[0].email").exists())
                .andExpect(jsonPath("$.[0].activated").exists())
                .andExpect(jsonPath("$.[0].langKey").exists())
                .andExpect(jsonPath("$.[0].authorities").exists())
                .andExpect(jsonPath("$.[0].createdBy").exists())
                .andExpect(jsonPath("$.[0].createdDate").exists())
                .andExpect(jsonPath("$.[0].lastModifiedDate").exists());
    }

    @Test
    public void updateUser() throws Exception {
        UserManagementDTO userManagementDTO = userManagementMapper.userToUserManagementDTO(userRepository.findOneByLogin("user").get());
        userManagementDTO.setFirstName(UPDATED_FIRST_NAME);
        userManagementDTO.setLastName(UPDATED_LAST_NAME);
        userManagementDTO.setEmail(UPDATED_EMAIL);
        userManagementDTO.setActivated(UPDATED_ACTIVATED);
        userManagementDTO.setLangKey(UPDATED_LANG_KEY);

        restUserManagementMockMvc.perform(put("/api/userManagement")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(userManagementDTO)))
                .andExpect(status().isOk());

        // Validate the Author in the database
        User user = userRepository.findOneByLogin("user").get();
        assertThat(user.getFirstName()).isEqualTo(UPDATED_FIRST_NAME);
        assertThat(user.getLastName()).isEqualTo(UPDATED_LAST_NAME);
        assertThat(user.getEmail()).isEqualTo(UPDATED_EMAIL);
        assertThat(user.getActivated()).isEqualTo(UPDATED_ACTIVATED);
        assertThat(user.getLangKey()).isEqualTo(UPDATED_LANG_KEY);
    }
}
