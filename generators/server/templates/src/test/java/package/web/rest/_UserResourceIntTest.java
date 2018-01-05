<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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
<%_
let cacheManagerIsAvailable = false;
if (['ehcache', 'hazelcast', 'infinispan'].includes(cacheProvider) || applicationType === 'gateway') {
    cacheManagerIsAvailable = true;
}
_%>
package <%= packageName %>.web.rest;

<%_ if (databaseType === 'cassandra') { _%>
import <%= packageName %>.AbstractCassandraTest;
<%_ } _%>
import <%= packageName %>.<%= mainClass %>;
<%_ if (cacheManagerIsAvailable === true) { _%>
import <%=packageName%>.config.CacheConfiguration;
<%_ } _%>
<%_ if (databaseType !== 'cassandra' && databaseType !== 'couchbase') { _%>
import <%= packageName %>.domain.Authority;
<%_ } _%>
import <%= packageName %>.domain.User;
import <%= packageName %>.repository.UserRepository;
<%_ if (searchEngine === 'elasticsearch') { _%>
import <%= packageName %>.repository.search.UserSearchRepository;
<%_ } _%>
import <%= packageName %>.security.AuthoritiesConstants;
<%_ if (authenticationType !== 'oauth2') { _%>
import <%= packageName %>.service.MailService;<% } %>
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
<%_ if (cacheManagerIsAvailable === true) { _%>
import org.springframework.cache.CacheManager;
<%_ } _%>
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
import java.util.*;
<%_ if (databaseType === 'cassandra' || databaseType === 'couchbase') { _%>
import java.util.stream.Collectors;
import java.util.stream.Stream;
<%_ } _%>
<%_ if (databaseType === 'cassandra') { _%>
import java.util.UUID;
<%_ } _%>

<%_ if (databaseType === 'couchbase') { _%>
import static <%= packageName %>.web.rest.TestUtil.mockAuthentication;
<%_ } _%>
<%_ if (enableSocialSignIn) { _%>
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
<%_ } _%>
import static org.assertj.core.api.Assertions.assertThat;
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

    private static final String DEFAULT_LOGIN = "johndoe";
    private static final String UPDATED_LOGIN = "jhipster";

    <%_ if (databaseType === 'sql') { _%>
    private static final Long DEFAULT_ID = 1L;
    <%_ } else if (databaseType === 'couchbase'){ _%>
    private static final String DEFAULT_ID = User.PREFIX + DEFAULT_LOGIN;
    <%_ } else { _%>
    private static final String DEFAULT_ID = "id1";
    <%_ } _%>

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
    <%_ if (authenticationType !== 'oauth2') { _%>
    @Autowired
    private MailService mailService;

    <%_ } _%>
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
    <%_ if (cacheManagerIsAvailable === true) { _%>

    @Autowired
    private CacheManager cacheManager;
    <%_ } _%>

    private MockMvc restUserMockMvc;

    private User user;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        <%_ if (cacheManagerIsAvailable === true) { _%>
        cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).clear();
        cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE).clear();
        <%_ } _%>
        UserResource userResource = new UserResource(userRepository, userService<% if (authenticationType !== 'oauth2') { %>, mailService<% } %><% if (searchEngine === 'elasticsearch') { %>, userSearchRepository<% } %>);
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
        user.setLogin(DEFAULT_LOGIN<% if (databaseType === 'sql') { %> + RandomStringUtils.randomAlphabetic(5)<% } %>);
        <%_ if (authenticationType !== 'oauth2') { _%>
        user.setPassword(RandomStringUtils.random(60));
        <%_ } _%>
        user.setActivated(true);
        user.setEmail(<% if (databaseType === 'sql') { %>RandomStringUtils.randomAlphabetic(5) + <% } %>DEFAULT_EMAIL);
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
        <%_ if (databaseType === 'couchbase') { _%>
        mockAuthentication();
        <%_ } _%>
        <%_ if (databaseType !== 'sql') { _%>
        userRepository.deleteAll();
        user = createEntity();
        <%_ } _%>
        <%_ if (databaseType === 'sql') { _%>
        user = createEntity(em);
        user.setLogin(DEFAULT_LOGIN);
        user.setEmail(DEFAULT_EMAIL);
        <%_ } _%>
    }
<%_ if (authenticationType !== 'oauth2') { _%>

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void createUser() throws Exception {
        int databaseSizeBeforeCreate = userRepository.findAll().size();

        // Create the User
        ManagedUserVM managedUserVM = new ManagedUserVM();
        managedUserVM.setLogin(DEFAULT_LOGIN);
        managedUserVM.setPassword(DEFAULT_PASSWORD);
        managedUserVM.setFirstName(DEFAULT_FIRSTNAME);
        managedUserVM.setLastName(DEFAULT_LASTNAME);
        managedUserVM.setEmail(DEFAULT_EMAIL);
        managedUserVM.setActivated(true);
        <%_ if (databaseType !== 'cassandra') { _%>
        managedUserVM.setImageUrl(DEFAULT_IMAGEURL);
        <%_ } _%>
        managedUserVM.setLangKey(DEFAULT_LANGKEY);
        managedUserVM.setAuthorities(Collections.singleton(AuthoritiesConstants.USER));

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

        ManagedUserVM managedUserVM = new ManagedUserVM();
        <%_ if (databaseType === 'cassandra') { _%>
        managedUserVM.setId(UUID.randomUUID().toString());
        <%_ } else if (databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
        managedUserVM.setId("1L");
        <%_ } else { _%>
        managedUserVM.setId(1L);
        <%_ } _%>
        managedUserVM.setLogin(DEFAULT_LOGIN);
        managedUserVM.setPassword(DEFAULT_PASSWORD);
        managedUserVM.setFirstName(DEFAULT_FIRSTNAME);
        managedUserVM.setLastName(DEFAULT_LASTNAME);
        managedUserVM.setEmail(DEFAULT_EMAIL);
        managedUserVM.setActivated(true);
        <%_ if (databaseType !== 'cassandra') { _%>
        managedUserVM.setImageUrl(DEFAULT_IMAGEURL);
        <%_ } _%>
        managedUserVM.setLangKey(DEFAULT_LANGKEY);
        managedUserVM.setAuthorities(Collections.singleton(AuthoritiesConstants.USER));

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

        ManagedUserVM managedUserVM = new ManagedUserVM();
        managedUserVM.setLogin(DEFAULT_LOGIN);// this login should already be used
        managedUserVM.setPassword(DEFAULT_PASSWORD);
        managedUserVM.setFirstName(DEFAULT_FIRSTNAME);
        managedUserVM.setLastName(DEFAULT_LASTNAME);
        managedUserVM.setEmail("anothermail@localhost");
        managedUserVM.setActivated(true);
        <%_ if (databaseType !== 'cassandra') { _%>
        managedUserVM.setImageUrl(DEFAULT_IMAGEURL);
        <%_ } _%>
        managedUserVM.setLangKey(DEFAULT_LANGKEY);
        managedUserVM.setAuthorities(Collections.singleton(AuthoritiesConstants.USER));

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

        ManagedUserVM managedUserVM = new ManagedUserVM();
        managedUserVM.setLogin("anotherlogin");
        managedUserVM.setPassword(DEFAULT_PASSWORD);
        managedUserVM.setFirstName(DEFAULT_FIRSTNAME);
        managedUserVM.setLastName(DEFAULT_LASTNAME);
        managedUserVM.setEmail(DEFAULT_EMAIL);// this email should already be used
        managedUserVM.setActivated(true);
        <%_ if (databaseType !== 'cassandra') { _%>
        managedUserVM.setImageUrl(DEFAULT_IMAGEURL);
        <%_ } _%>
        managedUserVM.setLangKey(DEFAULT_LANGKEY);
        managedUserVM.setAuthorities(Collections.singleton(AuthoritiesConstants.USER));

        // Create the User
        restUserMockMvc.perform(post("/api/users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(managedUserVM)))
            .andExpect(status().isBadRequest());

        // Validate the User in the database
        List<User> userList = userRepository.findAll();
        assertThat(userList).hasSize(databaseSizeBeforeCreate);
    }
<%_ } _%>

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
        <%_ if (cacheManagerIsAvailable === true) { _%>

        assertThat(cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).get(user.getLogin())).isNull();
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
        <%_ if (cacheManagerIsAvailable === true) { _%>

        assertThat(cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).get(user.getLogin())).isNotNull();
        <%_ } _%>
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void getNonExistingUser() throws Exception {
        restUserMockMvc.perform(get("/api/users/unknown"))
            .andExpect(status().isNotFound());
    }
<%_ if (authenticationType !== 'oauth2') { _%>

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
        User updatedUser = userRepository.findOne(user.getId());

        ManagedUserVM managedUserVM = new ManagedUserVM();
        managedUserVM.setId(updatedUser.getId());
        managedUserVM.setLogin(updatedUser.getLogin());
        managedUserVM.setPassword(UPDATED_PASSWORD);
        managedUserVM.setFirstName(UPDATED_FIRSTNAME);
        managedUserVM.setLastName(UPDATED_LASTNAME);
        managedUserVM.setEmail(UPDATED_EMAIL);
        managedUserVM.setActivated(updatedUser.getActivated());
        <%_ if (databaseType !== 'cassandra') { _%>
        managedUserVM.setImageUrl(UPDATED_IMAGEURL);
        <%_ } _%>
        managedUserVM.setLangKey(UPDATED_LANGKEY);
        <%_ if (databaseType !== 'cassandra') { _%>
        managedUserVM.setCreatedBy(updatedUser.getCreatedBy());
        managedUserVM.setCreatedDate(updatedUser.getCreatedDate());
        managedUserVM.setLastModifiedBy(updatedUser.getLastModifiedBy());
        managedUserVM.setLastModifiedDate(updatedUser.getLastModifiedDate());
        <%_ } _%>
        managedUserVM.setAuthorities(Collections.singleton(AuthoritiesConstants.USER));

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
        User updatedUser = userRepository.findOne(user.getId());

        ManagedUserVM managedUserVM = new ManagedUserVM();
        managedUserVM.setId(updatedUser.getId());
        managedUserVM.setLogin(UPDATED_LOGIN);
        managedUserVM.setPassword(UPDATED_PASSWORD);
        managedUserVM.setFirstName(UPDATED_FIRSTNAME);
        managedUserVM.setLastName(UPDATED_LASTNAME);
        managedUserVM.setEmail(UPDATED_EMAIL);
        managedUserVM.setActivated(updatedUser.getActivated());
        <%_ if (databaseType !== 'cassandra') { _%>
        managedUserVM.setImageUrl(UPDATED_IMAGEURL);
        <%_ } _%>
        managedUserVM.setLangKey(UPDATED_LANGKEY);
        <%_ if (databaseType !== 'cassandra') { _%>
        managedUserVM.setCreatedBy(updatedUser.getCreatedBy());
        managedUserVM.setCreatedDate(updatedUser.getCreatedDate());
        managedUserVM.setLastModifiedBy(updatedUser.getLastModifiedBy());
        managedUserVM.setLastModifiedDate(updatedUser.getLastModifiedDate());
        <%_ } _%>
        managedUserVM.setAuthorities(Collections.singleton(AuthoritiesConstants.USER));

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
        User updatedUser = userRepository.findOne(user.getId());

        ManagedUserVM managedUserVM = new ManagedUserVM();
        managedUserVM.setId(updatedUser.getId());
        managedUserVM.setLogin(updatedUser.getLogin());
        managedUserVM.setPassword(updatedUser.getPassword());
        managedUserVM.setFirstName(updatedUser.getFirstName());
        managedUserVM.setLastName(updatedUser.getLastName());
        managedUserVM.setEmail("jhipster@localhost");// this email should already be used by anotherUser
        managedUserVM.setActivated(updatedUser.getActivated());
        <%_ if (databaseType !== 'cassandra') { _%>
        managedUserVM.setImageUrl(updatedUser.getImageUrl());
        <%_ } _%>
        managedUserVM.setLangKey(updatedUser.getLangKey());
        <%_ if (databaseType !== 'cassandra') { _%>
        managedUserVM.setCreatedBy(updatedUser.getCreatedBy());
        managedUserVM.setCreatedDate(updatedUser.getCreatedDate());
        managedUserVM.setLastModifiedBy(updatedUser.getLastModifiedBy());
        managedUserVM.setLastModifiedDate(updatedUser.getLastModifiedDate());
        <%_ } _%>
        managedUserVM.setAuthorities(Collections.singleton(AuthoritiesConstants.USER));

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
        User updatedUser = userRepository.findOne(user.getId());

        ManagedUserVM managedUserVM = new ManagedUserVM();
        managedUserVM.setId(updatedUser.getId());
        managedUserVM.setLogin("jhipster");// this login should already be used by anotherUser
        managedUserVM.setPassword(updatedUser.getPassword());
        managedUserVM.setFirstName(updatedUser.getFirstName());
        managedUserVM.setLastName(updatedUser.getLastName());
        managedUserVM.setEmail(updatedUser.getEmail());
        managedUserVM.setActivated(updatedUser.getActivated());
        <%_ if (databaseType !== 'cassandra') { _%>
        managedUserVM.setImageUrl(updatedUser.getImageUrl());
        <%_ } _%>
        managedUserVM.setLangKey(updatedUser.getLangKey());
        <%_ if (databaseType !== 'cassandra') { _%>
        managedUserVM.setCreatedBy(updatedUser.getCreatedBy());
        managedUserVM.setCreatedDate(updatedUser.getCreatedDate());
        managedUserVM.setLastModifiedBy(updatedUser.getLastModifiedBy());
        managedUserVM.setLastModifiedDate(updatedUser.getLastModifiedDate());
        <%_ } _%>
        managedUserVM.setAuthorities(Collections.singleton(AuthoritiesConstants.USER));

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
        <%_ if (cacheManagerIsAvailable === true) { _%>

        assertThat(cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE).get(user.getLogin())).isNull();
        <%_ } _%>

        // Validate the database is empty
        List<User> userList = userRepository.findAll();
        assertThat(userList).hasSize(databaseSizeBeforeDelete - 1);
    }
    <%_ } _%>
    <%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>

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
            .andExpect(jsonPath("$").value(containsInAnyOrder(AuthoritiesConstants.USER, AuthoritiesConstants.ADMIN)));
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
        UserDTO userDTO = new UserDTO();
        userDTO.setId(DEFAULT_ID);
        userDTO.setLogin(DEFAULT_LOGIN);
        userDTO.setFirstName(DEFAULT_FIRSTNAME);
        userDTO.setLastName(DEFAULT_LASTNAME);
        userDTO.setEmail(DEFAULT_EMAIL);
        userDTO.setActivated(true);
        <%_ if (databaseType !== 'cassandra') { _%>
        userDTO.setImageUrl(DEFAULT_IMAGEURL);
        <%_ } _%>
        userDTO.setLangKey(DEFAULT_LANGKEY);
        <%_ if (databaseType !== 'cassandra') { _%>
        userDTO.setCreatedBy(DEFAULT_LOGIN);
        userDTO.setLastModifiedBy(DEFAULT_LOGIN);
        <%_ } _%>
        userDTO.setAuthorities(Collections.singleton(AuthoritiesConstants.USER));

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
        assertThat(user.getAuthorities())<% if (databaseType !== 'cassandra' && databaseType !== 'couchbase') { %>.extracting("name")<%_ } _%>.containsExactly(AuthoritiesConstants.USER);
    }

    @Test
    public void testUserToUserDTO() {
        user.setId(DEFAULT_ID);
        <%_ if (databaseType !== 'cassandra') { _%>
        user.setCreatedBy(DEFAULT_LOGIN);
        user.setCreatedDate(Instant.now());
        user.setLastModifiedBy(DEFAULT_LOGIN);
        user.setLastModifiedDate(Instant.now());
        <%_ } _%>
        <%_ if (databaseType !== 'cassandra' && databaseType !== 'couchbase') { _%>
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
