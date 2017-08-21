<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%= packageName %>.web.rest;

<%_ if (databaseType === 'cassandra') { _%>
import <%= packageName %>.AbstractCassandraTest;
<%_ } _%>
import <%= packageName %>.<%= mainClass %>;
<%_ if (databaseType !== 'cassandra') { _%>
import <%= packageName %>.domain.Authority;
<%_ } _%>
import <%= packageName %>.domain.User;
import <%= packageName %>.repository.UserRepository;
<%_ if (searchEngine === 'elasticsearch') { _%>
import <%= packageName %>.repository.search.UserSearchRepository;
<%_ } _%>
import <%= packageName %>.security.AuthoritiesConstants;
import <%= packageName %>.service.MailService;
import <%= packageName %>.service.UserService;
import <%= packageName %>.service.dto.UserDTO;
import <%= packageName %>.service.mapper.UserMapper;
<%_ if (databaseType === 'cassandra') { _%>
import <%= packageName %>.service.util.RandomUtil;
<%_ } _%>
import <%= packageName %>.web.rest.errors.ExceptionTranslator;
import <%= packageName %>.web.rest.vm.ManagedUserVM;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
<%_ if (databaseType === 'sql') { _%>
import org.springframework.transaction.annotation.Transactional;
<%_ } _%>

<%_ if (databaseType === 'sql') { _%>
import javax.persistence.EntityManager;
<%_ } _%>
<%_ if (databaseType !== 'cassandra') { _%>
import java.time.Instant;
<%_ } _%>
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.Optional;
<%_ if (databaseType !== 'sql') { _%>
import java.util.UUID;
<%_ } _%>

<%_ if (enableSocialSignIn) { _%>
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
<%_ } _%>
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertTrue;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the UserResource REST controller.
 *
 * @see UserResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = <%= mainClass %>.class)
public class UserResourceIntTest <% if (databaseType === 'cassandra') { %>extends AbstractCassandraTest <% } %>{

    <%_ if (databaseType === 'sql') { _%>
    private static final Long DEFAULT_ID = 1L;
    <%_ } else { _%>
    private static final String DEFAULT_ID = "id1";
    <%_ } _%>

    private static final String DEFAULT_LOGIN = "johndoe";
    private static final String UPDATED_LOGIN = "jhipster";

    private static final String DEFAULT_PASSWORD = "passjohndoe";
    private static final String UPDATED_PASSWORD = "passjhipster";

    private static final String DEFAULT_EMAIL = "johndoe@localhost";
    private static final String UPDATED_EMAIL = "jhipster@localhost";

    private static final String DEFAULT_FIRSTNAME = "john";
    private static final String UPDATED_FIRSTNAME = "jhipsterFirstName";

    private static final String DEFAULT_LASTNAME = "doe";
    private static final String UPDATED_LASTNAME = "jhipsterLastName";

    <%_ if (databaseType !== 'cassandra') { _%>
    private static final String DEFAULT_IMAGEURL = "http://placehold.it/50x50";
    private static final String UPDATED_IMAGEURL = "http://placehold.it/40x40";

    <%_ } _%>
    private static final String DEFAULT_LANGKEY = "en";
    private static final String UPDATED_LANGKEY = "fr";

    @Autowired
    private UserRepository userRepository;

    <%_ if (searchEngine === 'elasticsearch') { _%>
    @Autowired
    private UserSearchRepository userSearchRepository;

    <%_ } _%>
    @Autowired
    private MailService mailService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    <%_ if (databaseType === 'sql') { _%>
    @Autowired
    private EntityManager em;

    <%_ } _%>
    private MockMvc restUserMockMvc;

    private User user;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        UserResource userResource = new UserResource(userRepository, mailService, userService<% if (searchEngine === 'elasticsearch') { %>, userSearchRepository<% } %>);
        this.restUserMockMvc = MockMvcBuilders.standaloneSetup(userResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setMessageConverters(jacksonMessageConverter)
            .build();
    }

    /**
     * Create a User.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which has a required relationship to the User entity.
     */
    public static User createEntity(<% if (databaseType === 'sql') { %>EntityManager em<% } %>) {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setLogin(DEFAULT_LOGIN);
        user.setPassword(RandomStringUtils.random(60));
        user.setActivated(true);
        user.setEmail(DEFAULT_EMAIL);
        user.setFirstName(DEFAULT_FIRSTNAME);
        user.setLastName(DEFAULT_LASTNAME);
        <%_ if (databaseType !== 'cassandra') { _%>
        user.setImageUrl(DEFAULT_IMAGEURL);
        <%_ } _%>
        user.setLangKey(DEFAULT_LANGKEY);
        return user;
    }

    @Before
    public void initTest() {
        <%_ if (databaseType !== 'sql') { _%>
        userRepository.deleteAll();
        <%_ } _%>
        user = createEntity(<% if (databaseType === 'sql') { %>em<% } %>);
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void createUser() throws Exception {
        int databaseSizeBeforeCreate = userRepository.findAll().size();

        // Create the User
        Set<String> authorities = new HashSet<>();
        authorities.add("ROLE_USER");
        ManagedUserVM managedUserVM = new ManagedUserVM(
            null,
            DEFAULT_LOGIN,
            DEFAULT_PASSWORD,
            DEFAULT_FIRSTNAME,
            DEFAULT_LASTNAME,
            DEFAULT_EMAIL,
            true,
            <%_ if (databaseType !== 'cassandra') { _%>
            DEFAULT_IMAGEURL,
            <%_ } _%>
            DEFAULT_LANGKEY,
            <%_ if (databaseType !== 'cassandra') { _%>
            null,
            null,
            null,
            null,
            <%_ } _%>
            authorities);

        restUserMockMvc.perform(post("/api/users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(managedUserVM)))
            .andExpect(status().isCreated());

        // Validate the User in the database
        List<User> userList = userRepository.findAll();
        assertThat(userList).hasSize(databaseSizeBeforeCreate + 1);
        User testUser = userList.get(userList.size() - 1);
        assertThat(testUser.getLogin()).isEqualTo(DEFAULT_LOGIN);
        assertThat(testUser.getFirstName()).isEqualTo(DEFAULT_FIRSTNAME);
        assertThat(testUser.getLastName()).isEqualTo(DEFAULT_LASTNAME);
        assertThat(testUser.getEmail()).isEqualTo(DEFAULT_EMAIL);
        <%_ if (databaseType !== 'cassandra') { _%>
        assertThat(testUser.getImageUrl()).isEqualTo(DEFAULT_IMAGEURL);
        <%_ } _%>
        assertThat(testUser.getLangKey()).isEqualTo(DEFAULT_LANGKEY);
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void createUserWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = userRepository.findAll().size();

        Set<String> authorities = new HashSet<>();
        authorities.add("ROLE_USER");
        ManagedUserVM managedUserVM = new ManagedUserVM(
            <%_ if (databaseType === 'cassandra') { _%>
            UUID.randomUUID().toString(),
            <%_ } else if (databaseType === 'mongodb') { _%>
            "1L",
            <%_ } else { _%>
            1L,
            <%_ } _%>
            DEFAULT_LOGIN,
            DEFAULT_PASSWORD,
            DEFAULT_FIRSTNAME,
            DEFAULT_LASTNAME,
            DEFAULT_EMAIL,
            true,
            <%_ if (databaseType !== 'cassandra') { _%>
            DEFAULT_IMAGEURL,
            <%_ } _%>
            DEFAULT_LANGKEY,
            <%_ if (databaseType !== 'cassandra') { _%>
            null,
            null,
            null,
            null,
            <%_ } _%>
            authorities);

        // An entity with an existing ID cannot be created, so this API call must fail
        restUserMockMvc.perform(post("/api/users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(managedUserVM)))
            .andExpect(status().isBadRequest());

        // Validate the User in the database
        List<User> userList = userRepository.findAll();
        assertThat(userList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void createUserWithExistingLogin() throws Exception {
        // Initialize the database
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        <%_ if (searchEngine === 'elasticsearch') { _%>
        userSearchRepository.save(user);
        <%_ } _%>
        int databaseSizeBeforeCreate = userRepository.findAll().size();

        Set<String> authorities = new HashSet<>();
        authorities.add("ROLE_USER");
        ManagedUserVM managedUserVM = new ManagedUserVM(
            null,
            DEFAULT_LOGIN, // this login should already be used
            DEFAULT_PASSWORD,
            DEFAULT_FIRSTNAME,
            DEFAULT_LASTNAME,
            "anothermail@localhost",
            true,
            <%_ if (databaseType !== 'cassandra') { _%>
            DEFAULT_IMAGEURL,
            <%_ } _%>
            DEFAULT_LANGKEY,
            <%_ if (databaseType !== 'cassandra') { _%>
            null,
            null,
            null,
            null,
            <%_ } _%>
            authorities);

        // Create the User
        restUserMockMvc.perform(post("/api/users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(managedUserVM)))
            .andExpect(status().isBadRequest());

        // Validate the User in the database
        List<User> userList = userRepository.findAll();
        assertThat(userList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void createUserWithExistingEmail() throws Exception {
        // Initialize the database
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        <%_ if (searchEngine === 'elasticsearch') { _%>
        userSearchRepository.save(user);
        <%_ } _%>
        int databaseSizeBeforeCreate = userRepository.findAll().size();

        Set<String> authorities = new HashSet<>();
        authorities.add("ROLE_USER");
        ManagedUserVM managedUserVM = new ManagedUserVM(
            null,
            "anotherlogin",
            DEFAULT_PASSWORD,
            DEFAULT_FIRSTNAME,
            DEFAULT_LASTNAME,
            DEFAULT_EMAIL, // this email should already be used
            true,
            <%_ if (databaseType !== 'cassandra') { _%>
            DEFAULT_IMAGEURL,
            <%_ } _%>
            DEFAULT_LANGKEY,
            <%_ if (databaseType !== 'cassandra') { _%>
            null,
            null,
            null,
            null,
            <%_ } _%>
            authorities);

        // Create the User
        restUserMockMvc.perform(post("/api/users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(managedUserVM)))
            .andExpect(status().isBadRequest());

        // Validate the User in the database
        List<User> userList = userRepository.findAll();
        assertThat(userList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void getAllUsers() throws Exception {
        // Initialize the database
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        <%_ if (searchEngine === 'elasticsearch') { _%>
        userSearchRepository.save(user);
        <%_ } _%>

        // Get all the users
        restUserMockMvc.perform(get("/api/users<% if (databaseType === 'sql') { %>?sort=id,desc<% } %>")
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].login").value(hasItem(DEFAULT_LOGIN)))
            .andExpect(jsonPath("$.[*].firstName").value(hasItem(DEFAULT_FIRSTNAME)))
            .andExpect(jsonPath("$.[*].lastName").value(hasItem(DEFAULT_LASTNAME)))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL)))
            <%_ if (databaseType !== 'cassandra') { _%>
            .andExpect(jsonPath("$.[*].imageUrl").value(hasItem(DEFAULT_IMAGEURL)))
            <%_ } _%>
            .andExpect(jsonPath("$.[*].langKey").value(hasItem(DEFAULT_LANGKEY)));
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void getUser() throws Exception {
        // Initialize the database
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        <%_ if (searchEngine === 'elasticsearch') { _%>
        userSearchRepository.save(user);
        <%_ } _%>

        // Get the user
        restUserMockMvc.perform(get("/api/users/{login}", user.getLogin()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.login").value(user.getLogin()))
            .andExpect(jsonPath("$.firstName").value(DEFAULT_FIRSTNAME))
            .andExpect(jsonPath("$.lastName").value(DEFAULT_LASTNAME))
            .andExpect(jsonPath("$.email").value(DEFAULT_EMAIL))
            <%_ if (databaseType !== 'cassandra') { _%>
            .andExpect(jsonPath("$.imageUrl").value(DEFAULT_IMAGEURL))
            <%_ } _%>
            .andExpect(jsonPath("$.langKey").value(DEFAULT_LANGKEY));
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void getNonExistingUser() throws Exception {
        restUserMockMvc.perform(get("/api/users/unknown"))
            .andExpect(status().isNotFound());
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void updateUser() throws Exception {
        // Initialize the database
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        <%_ if (searchEngine === 'elasticsearch') { _%>
        userSearchRepository.save(user);
        <%_ } _%>
        int databaseSizeBeforeUpdate = userRepository.findAll().size();

        // Update the user
        Optional<User> optionalUpdatedUser = userRepository.<%_ if (databaseType !== 'cassandra') { _%>findById<%_ } else { _%>findOne<%_ }_%>(user.getId());
        assertTrue(optionalUpdatedUser.isPresent());
        User updatedUser = optionalUpdatedUser.get();

        Set<String> authorities = new HashSet<>();
        authorities.add("ROLE_USER");
        ManagedUserVM managedUserVM = new ManagedUserVM(
            updatedUser.getId(),
            updatedUser.getLogin(),
            UPDATED_PASSWORD,
            UPDATED_FIRSTNAME,
            UPDATED_LASTNAME,
            UPDATED_EMAIL,
            updatedUser.getActivated(),
            <%_ if (databaseType !== 'cassandra') { _%>
            UPDATED_IMAGEURL,
            <%_ } _%>
            UPDATED_LANGKEY,
            <%_ if (databaseType !== 'cassandra') { _%>
            updatedUser.getCreatedBy(),
            updatedUser.getCreatedDate(),
            updatedUser.getLastModifiedBy(),
            updatedUser.getLastModifiedDate(),
            <%_ } _%>
            authorities);

        restUserMockMvc.perform(put("/api/users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(managedUserVM)))
            .andExpect(status().isOk());

        // Validate the User in the database
        List<User> userList = userRepository.findAll();
        assertThat(userList).hasSize(databaseSizeBeforeUpdate);
        User testUser = userList.get(userList.size() - 1);
        assertThat(testUser.getFirstName()).isEqualTo(UPDATED_FIRSTNAME);
        assertThat(testUser.getLastName()).isEqualTo(UPDATED_LASTNAME);
        assertThat(testUser.getEmail()).isEqualTo(UPDATED_EMAIL);
        <%_ if (databaseType !== 'cassandra') { _%>
        assertThat(testUser.getImageUrl()).isEqualTo(UPDATED_IMAGEURL);
        <%_ } _%>
        assertThat(testUser.getLangKey()).isEqualTo(UPDATED_LANGKEY);
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void updateUserLogin() throws Exception {
        // Initialize the database
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        <%_ if (searchEngine === 'elasticsearch') { _%>
        userSearchRepository.save(user);
        <%_ } _%>
        int databaseSizeBeforeUpdate = userRepository.findAll().size();

        // Update the user
        Optional<User> optionalUpdatedUser = userRepository.<%_ if (databaseType !== 'cassandra') { _%>findById<%_ } else { _%>findOne<%_ }_%>(user.getId());
        assertTrue(optionalUpdatedUser.isPresent());
        User updatedUser = optionalUpdatedUser.get();

        Set<String> authorities = new HashSet<>();
        authorities.add("ROLE_USER");
        ManagedUserVM managedUserVM = new ManagedUserVM(
            updatedUser.getId(),
            UPDATED_LOGIN,
            UPDATED_PASSWORD,
            UPDATED_FIRSTNAME,
            UPDATED_LASTNAME,
            UPDATED_EMAIL,
            updatedUser.getActivated(),
            <%_ if (databaseType !== 'cassandra') { _%>
            UPDATED_IMAGEURL,
            <%_ } _%>
            UPDATED_LANGKEY,
            <%_ if (databaseType !== 'cassandra') { _%>
            updatedUser.getCreatedBy(),
            updatedUser.getCreatedDate(),
            updatedUser.getLastModifiedBy(),
            updatedUser.getLastModifiedDate(),
            <%_ } _%>
            authorities);

        restUserMockMvc.perform(put("/api/users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(managedUserVM)))
            .andExpect(status().isOk());

        // Validate the User in the database
        List<User> userList = userRepository.findAll();
        assertThat(userList).hasSize(databaseSizeBeforeUpdate);
        User testUser = userList.get(userList.size() - 1);
        assertThat(testUser.getLogin()).isEqualTo(UPDATED_LOGIN);
        assertThat(testUser.getFirstName()).isEqualTo(UPDATED_FIRSTNAME);
        assertThat(testUser.getLastName()).isEqualTo(UPDATED_LASTNAME);
        assertThat(testUser.getEmail()).isEqualTo(UPDATED_EMAIL);
        <%_ if (databaseType !== 'cassandra') { _%>
        assertThat(testUser.getImageUrl()).isEqualTo(UPDATED_IMAGEURL);
        <%_ } _%>
        assertThat(testUser.getLangKey()).isEqualTo(UPDATED_LANGKEY);
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void updateUserExistingEmail() throws Exception {
        // Initialize the database with 2 users
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        <%_ if (searchEngine === 'elasticsearch') { _%>
        userSearchRepository.save(user);
        <%_ } _%>

        User anotherUser = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        anotherUser.setId(UUID.randomUUID().toString());
        <%_ } _%>
        anotherUser.setLogin("jhipster");
        anotherUser.setPassword(RandomStringUtils.random(60));
        anotherUser.setActivated(true);
        anotherUser.setEmail("jhipster@localhost");
        anotherUser.setFirstName("java");
        anotherUser.setLastName("hipster");
        <%_ if (databaseType !== 'cassandra') { _%>
        anotherUser.setImageUrl("");
        <%_ } _%>
        anotherUser.setLangKey("en");
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(anotherUser);
        <%_ if (searchEngine === 'elasticsearch') { _%>
        userSearchRepository.save(anotherUser);
        <%_ } _%>

        // Update the user
        Optional<User> optionalUpdatedUser = userRepository.<%_ if (databaseType !== 'cassandra') { _%>findById<%_ } else { _%>findOne<%_ }_%>(user.getId());
        assertTrue(optionalUpdatedUser.isPresent());
        User updatedUser = optionalUpdatedUser.get();

        Set<String> authorities = new HashSet<>();
        authorities.add("ROLE_USER");
        ManagedUserVM managedUserVM = new ManagedUserVM(
            updatedUser.getId(),
            updatedUser.getLogin(),
            updatedUser.getPassword(),
            updatedUser.getFirstName(),
            updatedUser.getLastName(),
            "jhipster@localhost",  // this email should already be used by anotherUser
            updatedUser.getActivated(),
            <%_ if (databaseType !== 'cassandra') { _%>
            updatedUser.getImageUrl(),
            <%_ } _%>
            updatedUser.getLangKey(),
            <%_ if (databaseType !== 'cassandra') { _%>
            updatedUser.getCreatedBy(),
            updatedUser.getCreatedDate(),
            updatedUser.getLastModifiedBy(),
            updatedUser.getLastModifiedDate(),
            <%_ } _%>
            authorities);

        restUserMockMvc.perform(put("/api/users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(managedUserVM)))
            .andExpect(status().isBadRequest());
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void updateUserExistingLogin() throws Exception {
        // Initialize the database
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        <%_ if (searchEngine === 'elasticsearch') { _%>
        userSearchRepository.save(user);
        <%_ } _%>

        User anotherUser = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        anotherUser.setId(UUID.randomUUID().toString());
        <%_ } _%>
        anotherUser.setLogin("jhipster");
        anotherUser.setPassword(RandomStringUtils.random(60));
        anotherUser.setActivated(true);
        anotherUser.setEmail("jhipster@localhost");
        anotherUser.setFirstName("java");
        anotherUser.setLastName("hipster");
        <%_ if (databaseType !== 'cassandra') { _%>
        anotherUser.setImageUrl("");
        <%_ } _%>
        anotherUser.setLangKey("en");
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(anotherUser);
        <%_ if (searchEngine === 'elasticsearch') { _%>
        userSearchRepository.save(anotherUser);
        <%_ } _%>

        // Update the user
        Optional<User> optionalUpdatedUser = userRepository.<%_ if (databaseType !== 'cassandra') { _%>findById<%_ } else { _%>findOne<%_ }_%>(user.getId());
        assertTrue(optionalUpdatedUser.isPresent());
        User updatedUser = optionalUpdatedUser.get();

        Set<String> authorities = new HashSet<>();
        authorities.add("ROLE_USER");
        ManagedUserVM managedUserVM = new ManagedUserVM(
            updatedUser.getId(),
            "jhipster", // this login should already be used by anotherUser
            updatedUser.getPassword(),
            updatedUser.getFirstName(),
            updatedUser.getLastName(),
            updatedUser.getEmail(),
            updatedUser.getActivated(),
            <%_ if (databaseType !== 'cassandra') { _%>
            updatedUser.getImageUrl(),
            <%_ } _%>
            updatedUser.getLangKey(),
            <%_ if (databaseType !== 'cassandra') { _%>
            updatedUser.getCreatedBy(),
            updatedUser.getCreatedDate(),
            updatedUser.getLastModifiedBy(),
            updatedUser.getLastModifiedDate(),
            <%_ } _%>
            authorities);

        restUserMockMvc.perform(put("/api/users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(managedUserVM)))
            .andExpect(status().isBadRequest());
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void deleteUser() throws Exception {
        // Initialize the database
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        <%_ if (searchEngine === 'elasticsearch') { _%>
        userSearchRepository.save(user);
        <%_ } _%>
        int databaseSizeBeforeDelete = userRepository.findAll().size();

        // Delete the user
        restUserMockMvc.perform(delete("/api/users/{login}", user.getLogin())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());

        // Validate the database is empty
        List<User> userList = userRepository.findAll();
        assertThat(userList).hasSize(databaseSizeBeforeDelete - 1);
    }
    <%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void getAllAuthorities() throws Exception {
        restUserMockMvc.perform(get("/api/users/authorities")
            .accept(TestUtil.APPLICATION_JSON_UTF8)
            .contentType(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").value(containsInAnyOrder("ROLE_USER", "ROLE_ADMIN")));
    }
    <%_ } _%>

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void testUserEquals() throws Exception {
        TestUtil.equalsVerifier(User.class);
        User user1 = new User();
        user1.setId(<% if (databaseType === 'sql') { %>1L<% } else { %>"id1"<% } %>);
        User user2 = new User();
        user2.setId(user1.getId());
        assertThat(user1).isEqualTo(user2);
        user2.setId(<% if (databaseType === 'sql') { %>2L<% } else { %>"id2"<% } %>);
        assertThat(user1).isNotEqualTo(user2);
        user1.setId(null);
        assertThat(user1).isNotEqualTo(user2);
    }

    @Test
    public void testUserFromId() {
        assertThat(userMapper.userFromId(DEFAULT_ID).getId()).isEqualTo(DEFAULT_ID);
        assertThat(userMapper.userFromId(null)).isNull();
    }

    @Test
    public void testUserDTOtoUser() {
        UserDTO userDTO = new UserDTO(
            DEFAULT_ID,
            DEFAULT_LOGIN,
            DEFAULT_FIRSTNAME,
            DEFAULT_LASTNAME,
            DEFAULT_EMAIL,
            true,
            <%_ if (databaseType !== 'cassandra') { _%>
            DEFAULT_IMAGEURL,
            <%_ } _%>
            DEFAULT_LANGKEY,
            <%_ if (databaseType !== 'cassandra') { _%>
            DEFAULT_LOGIN,
            null,
            DEFAULT_LOGIN,
            null,
            <%_ } _%>
            Stream.of(AuthoritiesConstants.USER).collect(Collectors.toSet()));
        User user = userMapper.userDTOToUser(userDTO);
        assertThat(user.getId()).isEqualTo(DEFAULT_ID);
        assertThat(user.getLogin()).isEqualTo(DEFAULT_LOGIN);
        assertThat(user.getFirstName()).isEqualTo(DEFAULT_FIRSTNAME);
        assertThat(user.getLastName()).isEqualTo(DEFAULT_LASTNAME);
        assertThat(user.getEmail()).isEqualTo(DEFAULT_EMAIL);
        assertThat(user.getActivated()).isEqualTo(true);
        <%_ if (databaseType !== 'cassandra') { _%>
        assertThat(user.getImageUrl()).isEqualTo(DEFAULT_IMAGEURL);
        <%_ } _%>
        assertThat(user.getLangKey()).isEqualTo(DEFAULT_LANGKEY);
        <%_ if (databaseType !== 'cassandra') { _%>
        assertThat(user.getCreatedBy()).isNull();
        assertThat(user.getCreatedDate()).isNotNull();
        assertThat(user.getLastModifiedBy()).isNull();
        assertThat(user.getLastModifiedDate()).isNotNull();
        <%_ } _%>
        assertThat(user.getAuthorities())<% if (databaseType !== 'cassandra') { %>.extracting("name")<%_ } _%>.containsExactly(AuthoritiesConstants.USER);
    }

    @Test
    public void testUserToUserDTO() {
        user.setId(DEFAULT_ID);
        <%_ if (databaseType !== 'cassandra') { _%>
        user.setCreatedBy(DEFAULT_LOGIN);
        user.setCreatedDate(Instant.now());
        user.setLastModifiedBy(DEFAULT_LOGIN);
        user.setLastModifiedDate(Instant.now());

        Set<Authority> authorities = new HashSet<>();
        Authority authority = new Authority();
        authority.setName(AuthoritiesConstants.USER);
        authorities.add(authority);
        user.setAuthorities(authorities);
        <%_ } else { _%>
        user.setAuthorities(Stream.of(AuthoritiesConstants.USER).collect(Collectors.toSet()));
        <%_ } _%>

        UserDTO userDTO = userMapper.userToUserDTO(user);

        assertThat(userDTO.getId()).isEqualTo(DEFAULT_ID);
        assertThat(userDTO.getLogin()).isEqualTo(DEFAULT_LOGIN);
        assertThat(userDTO.getFirstName()).isEqualTo(DEFAULT_FIRSTNAME);
        assertThat(userDTO.getLastName()).isEqualTo(DEFAULT_LASTNAME);
        assertThat(userDTO.getEmail()).isEqualTo(DEFAULT_EMAIL);
        assertThat(userDTO.isActivated()).isEqualTo(true);
        <%_ if (databaseType !== 'cassandra') { _%>
        assertThat(userDTO.getImageUrl()).isEqualTo(DEFAULT_IMAGEURL);
        <%_ } _%>
        assertThat(userDTO.getLangKey()).isEqualTo(DEFAULT_LANGKEY);
        <%_ if (databaseType !== 'cassandra') { _%>
        assertThat(userDTO.getCreatedBy()).isEqualTo(DEFAULT_LOGIN);
        assertThat(userDTO.getCreatedDate()).isEqualTo(user.getCreatedDate());
        assertThat(userDTO.getLastModifiedBy()).isEqualTo(DEFAULT_LOGIN);
        assertThat(userDTO.getLastModifiedDate()).isEqualTo(user.getLastModifiedDate());
        <%_ } _%>
        assertThat(userDTO.getAuthorities()).containsExactly(AuthoritiesConstants.USER);
        assertThat(userDTO.toString()).isNotNull();
    }
    <%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>

    @Test
    public void testAuthorityEquals() throws Exception {
        Authority authorityA = new Authority();
        assertThat(authorityA).isEqualTo(authorityA);
        assertThat(authorityA).isNotEqualTo(null);
        assertThat(authorityA).isNotEqualTo(new Object());
        assertThat(authorityA.hashCode()).isEqualTo(0);
        assertThat(authorityA.toString()).isNotNull();

        Authority authorityB = new Authority();
        assertThat(authorityA).isEqualTo(authorityB);

        authorityB.setName(AuthoritiesConstants.ADMIN);
        assertThat(authorityA).isNotEqualTo(authorityB);

        authorityA.setName(AuthoritiesConstants.USER);
        assertThat(authorityA).isNotEqualTo(authorityB);

        authorityB.setName(AuthoritiesConstants.USER);
        assertThat(authorityA).isEqualTo(authorityB);
        assertThat(authorityA.hashCode()).isEqualTo(authorityB.hashCode());
    }
    <%_ } _%>

}
