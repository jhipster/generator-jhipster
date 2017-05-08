<%#
 Copyright 2013-2017 the original author or authors.

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
package <%=packageName%>.web.rest;
<% if (databaseType == 'cassandra') { %>
import <%=packageName%>.AbstractCassandraTest;<% } %>
import <%=packageName%>.<%= mainClass %>;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.domain.Authority;<% } %><% if (authenticationType == 'session') { %>
import <%=packageName%>.domain.PersistentToken;<% } %>
import <%=packageName%>.domain.User;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.repository.AuthorityRepository;<% } %>
<%_ if (authenticationType == 'session') { _%>
import <%=packageName%>.repository.PersistentTokenRepository;
<%_ } _%>
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.security.AuthoritiesConstants;
import <%=packageName%>.service.MailService;
import <%=packageName%>.service.UserService;
import <%=packageName%>.service.dto.UserDTO;
import <%=packageName%>.web.rest.vm.KeyAndPasswordVM;
import <%=packageName%>.web.rest.vm.ManagedUserVM;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;<% if (databaseType == 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>

import java.time.Instant;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import java.time.LocalDate;<% } %>
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Matchers.anyObject;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the AccountResource REST controller.
 *
 * @see AccountResource
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = <%= mainClass %>.class)
public class AccountResourceIntTest <% if (databaseType == 'cassandra') { %>extends AbstractCassandraTest <% } %>{

    @Autowired
    private UserRepository userRepository;
<%_ if (databaseType == 'sql' || databaseType == 'mongodb') { _%>

    @Autowired
    private AuthorityRepository authorityRepository;
<%_ } _%>

    @Autowired
    private UserService userService;
<%_ if (authenticationType == 'session') { _%>

    @Autowired
    private PersistentTokenRepository persistentTokenRepository;
<%_ } _%>

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private HttpMessageConverter[] httpMessageConverters;

    @Mock
    private UserService mockUserService;

    @Mock
    private MailService mockMailService;

    private MockMvc restUserMockMvc;

    private MockMvc restMvc;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        doNothing().when(mockMailService).sendActivationEmail(anyObject());

        AccountResource accountResource =
            new AccountResource(userRepository, userService, mockMailService<% if (authenticationType == 'session') { %>, persistentTokenRepository<% } %>);

        AccountResource accountUserMockResource =
            new AccountResource(userRepository, mockUserService, mockMailService<% if (authenticationType == 'session') { %>, persistentTokenRepository<% } %>);

        this.restMvc = MockMvcBuilders.standaloneSetup(accountResource)
            .setMessageConverters(httpMessageConverters)
            .build();
        this.restUserMockMvc = MockMvcBuilders.standaloneSetup(accountUserMockResource).build();
    }

    @Test
    public void testNonAuthenticatedUser() throws Exception {
        restUserMockMvc.perform(get("/api/authenticate")
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().string(""));
    }

    @Test
    public void testAuthenticatedUser() throws Exception {
        restUserMockMvc.perform(get("/api/authenticate")
            .with(request -> {
                request.setRemoteUser("test");
                return request;
            })
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().string("test"));
    }

    @Test
    public void testGetExistingAccount() throws Exception {<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        Set<Authority> authorities = new HashSet<>();
        Authority authority = new Authority();
        authority.setName(AuthoritiesConstants.ADMIN);
        authorities.add(authority);<% } %><% if (databaseType == 'cassandra') { %>
        Set<String> authorities = new HashSet<>();
        authorities.add(AuthoritiesConstants.ADMIN);<% } %>

        User user = new User();
        user.setLogin("test");
        user.setFirstName("john");
        user.setLastName("doe");
        user.setEmail("john.doe@jhipster.com");
        <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
        user.setImageUrl("http://placehold.it/50x50");
        <%_ } _%>
        user.setLangKey("en");
        user.setAuthorities(authorities);
        when(mockUserService.getUserWithAuthorities()).thenReturn(user);

        restUserMockMvc.perform(get("/api/account")
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.login").value("test"))
            .andExpect(jsonPath("$.firstName").value("john"))
            .andExpect(jsonPath("$.lastName").value("doe"))
            .andExpect(jsonPath("$.email").value("john.doe@jhipster.com"))
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            .andExpect(jsonPath("$.imageUrl").value("http://placehold.it/50x50"))
            <%_ } _%>
            .andExpect(jsonPath("$.langKey").value("en"))
            .andExpect(jsonPath("$.authorities").value(AuthoritiesConstants.ADMIN));
    }

    @Test
    public void testGetUnknownAccount() throws Exception {
        when(mockUserService.getUserWithAuthorities()).thenReturn(null);

        restUserMockMvc.perform(get("/api/account")
            .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isInternalServerError());
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void testRegisterValid() throws Exception {
        ManagedUserVM validUser = new ManagedUserVM(
            null,                   // id
            "joe",                  // login
            "password",             // password
            "Joe",                  // firstName
            "Shmoe",                // lastName
            "joe@example.com",      // email
            true,                   // activated
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            "http://placehold.it/50x50", //imageUrl
            <%_ } _%>
            "<%= nativeLanguage %>",                   // langKey
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            null,                   // createdBy
            null,                   // createdDate
            null,                   // lastModifiedBy
            null,                   // lastModifiedDate
            <%_ } _%>
            new HashSet<>(Collections.singletonList(AuthoritiesConstants.USER)));

        restMvc.perform(
            post("/api/register")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(validUser)))
            .andExpect(status().isCreated());

        Optional<User> user = userRepository.findOneByLogin("joe");
        assertThat(user.isPresent()).isTrue();
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void testRegisterInvalidLogin() throws Exception {
        ManagedUserVM invalidUser = new ManagedUserVM(
            null,                   // id
            "funky-log!n",          // login <-- invalid
            "password",             // password
            "Funky",                // firstName
            "One",                  // lastName
            "funky@example.com",    // email
            true,                   // activated
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            "http://placehold.it/50x50", //imageUrl
            <%_ } _%>
            "<%= nativeLanguage %>",                   // langKey
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            null,                   // createdBy
            null,                   // createdDate
            null,                   // lastModifiedBy
            null,                   // lastModifiedDate
            <%_ } _%>
            new HashSet<>(Collections.singletonList(AuthoritiesConstants.USER)));

        restUserMockMvc.perform(
            post("/api/register")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(invalidUser)))
            .andExpect(status().isBadRequest());

        Optional<User> user = userRepository.findOneByEmail("funky@example.com");
        assertThat(user.isPresent()).isFalse();
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void testRegisterInvalidEmail() throws Exception {
        ManagedUserVM invalidUser = new ManagedUserVM(
            null,               // id
            "bob",              // login
            "password",         // password
            "Bob",              // firstName
            "Green",            // lastName
            "invalid",          // email <-- invalid
            true,               // activated
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            "http://placehold.it/50x50", //imageUrl
            <%_ } _%>
            "<%= nativeLanguage %>",                   // langKey
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            null,                   // createdBy
            null,                   // createdDate
            null,                   // lastModifiedBy
            null,                   // lastModifiedDate
            <%_ } _%>
            new HashSet<>(Collections.singletonList(AuthoritiesConstants.USER)));

        restUserMockMvc.perform(
            post("/api/register")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(invalidUser)))
            .andExpect(status().isBadRequest());

        Optional<User> user = userRepository.findOneByLogin("bob");
        assertThat(user.isPresent()).isFalse();
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void testRegisterInvalidPassword() throws Exception {
        ManagedUserVM invalidUser = new ManagedUserVM(
            null,               // id
            "bob",              // login
            "123",              // password with only 3 digits
            "Bob",              // firstName
            "Green",            // lastName
            "bob@example.com",  // email
            true,               // activated
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            "http://placehold.it/50x50", //imageUrl
            <%_ } _%>
            "<%= nativeLanguage %>",                   // langKey
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            null,                   // createdBy
            null,                   // createdDate
            null,                   // lastModifiedBy
            null,                   // lastModifiedDate
            <%_ } _%>
            new HashSet<>(Collections.singletonList(AuthoritiesConstants.USER)));

        restUserMockMvc.perform(
            post("/api/register")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(invalidUser)))
            .andExpect(status().isBadRequest());

        Optional<User> user = userRepository.findOneByLogin("bob");
        assertThat(user.isPresent()).isFalse();
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void testRegisterDuplicateLogin() throws Exception {
        // Good
        ManagedUserVM validUser = new ManagedUserVM(
            null,                   // id
            "alice",                // login
            "password",             // password
            "Alice",                // firstName
            "Something",            // lastName
            "alice@example.com",    // email
            true,                   // activated
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            "http://placehold.it/50x50", //imageUrl
            <%_ } _%>
            "<%= nativeLanguage %>",                   // langKey
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            null,                   // createdBy
            null,                   // createdDate
            null,                   // lastModifiedBy
            null,                   // lastModifiedDate
            <%_ } _%>
            new HashSet<>(Collections.singletonList(AuthoritiesConstants.USER)));

        // Duplicate login, different email
        ManagedUserVM duplicatedUser = new ManagedUserVM(validUser.getId(), validUser.getLogin(), validUser.getPassword(), validUser.getFirstName(), validUser.getLastName(),
            "alicejr@example.com", true<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>, validUser.getImageUrl()<% } %>, validUser.getLangKey()<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>, validUser.getCreatedBy(), validUser.getCreatedDate(), validUser.getLastModifiedBy(), validUser.getLastModifiedDate()<% } %>, validUser.getAuthorities());

        // Good user
        restMvc.perform(
            post("/api/register")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(validUser)))
            .andExpect(status().isCreated());

        // Duplicate login
        restMvc.perform(
            post("/api/register")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(duplicatedUser)))
            .andExpect(status().is4xxClientError());

        Optional<User> userDup = userRepository.findOneByEmail("alicejr@example.com");
        assertThat(userDup.isPresent()).isFalse();
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void testRegisterDuplicateEmail() throws Exception {
        // Good
        ManagedUserVM validUser = new ManagedUserVM(
            null,                   // id
            "john",                 // login
            "password",             // password
            "John",                 // firstName
            "Doe",                  // lastName
            "john@example.com",     // email
            true,                   // activated
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            "http://placehold.it/50x50", //imageUrl
            <%_ } _%>
            "<%= nativeLanguage %>",                   // langKey
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            null,                   // createdBy
            null,                   // createdDate
            null,                   // lastModifiedBy
            null,                   // lastModifiedDate
            <%_ } _%>
            new HashSet<>(Collections.singletonList(AuthoritiesConstants.USER)));

        // Duplicate email, different login
        ManagedUserVM duplicatedUser = new ManagedUserVM(validUser.getId(), "johnjr", validUser.getPassword(), validUser.getLogin(), validUser.getLastName(),
            validUser.getEmail(), true<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>, validUser.getImageUrl()<% } %>, validUser.getLangKey()<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>, validUser.getCreatedBy(), validUser.getCreatedDate(), validUser.getLastModifiedBy(), validUser.getLastModifiedDate()<% } %>, validUser.getAuthorities());

        // Good user
        restMvc.perform(
            post("/api/register")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(validUser)))
            .andExpect(status().isCreated());

        // Duplicate email
        restMvc.perform(
            post("/api/register")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(duplicatedUser)))
            .andExpect(status().is4xxClientError());

        Optional<User> userDup = userRepository.findOneByLogin("johnjr");
        assertThat(userDup.isPresent()).isFalse();
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void testRegisterAdminIsIgnored() throws Exception {
        ManagedUserVM validUser = new ManagedUserVM(
            null,                   // id
            "badguy",               // login
            "password",             // password
            "Bad",                  // firstName
            "Guy",                  // lastName
            "badguy@example.com",   // email
            true,                   // activated
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            "http://placehold.it/50x50", //imageUrl
            <%_ } _%>
            "<%= nativeLanguage %>",                   // langKey
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            null,                   // createdBy
            null,                   // createdDate
            null,                   // lastModifiedBy
            null,                   // lastModifiedDate
            <%_ } _%>
            new HashSet<>(Collections.singletonList(AuthoritiesConstants.ADMIN)));

        restMvc.perform(
            post("/api/register")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(validUser)))
            .andExpect(status().isCreated());

        Optional<User> userDup = userRepository.findOneByLogin("badguy");
        assertThat(userDup.isPresent()).isTrue();
        assertThat(userDup.get().getAuthorities()).hasSize(1)
            .containsExactly(<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>authorityRepository.findOne(AuthoritiesConstants.USER)<% } %><% if (databaseType == 'cassandra') { %>AuthoritiesConstants.USER<% } %>);
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void testActivateAccount() throws Exception {
        final String activationKey = "some activation key";
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setLogin("activate-account");
        user.setEmail("activate-account@example.com");
        user.setPassword(RandomStringUtils.random(60));
        user.setActivated(false);
        user.setActivationKey(activationKey);

        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        restMvc.perform(get("/api/activate?key={activationKey}", activationKey))
            .andExpect(status().isOk());

        user = userRepository.findOneByLogin(user.getLogin()).orElse(null);
        assertThat(user.getActivated()).isTrue();
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void testActivateAccountWithWrongKey() throws Exception {
        restMvc.perform(get("/api/activate?key=wrongActivationKey"))
            .andExpect(status().isInternalServerError());
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    @WithMockUser("save-account")
    public void testSaveAccount() throws Exception {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setLogin("save-account");
        user.setEmail("save-account@example.com");
        user.setPassword(RandomStringUtils.random(60));
        user.setActivated(true);

        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        UserDTO userDTO = new UserDTO(
            null,                   // id
            "not-used",          // login
            "firstname",                // firstName
            "lastname",                  // lastName
            "save-account@example.com",    // email
            false,                   // activated
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            "http://placehold.it/50x50", //imageUrl
            <%_ } _%>
            "<%= nativeLanguage %>",                   // langKey
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            null,                   // createdBy
            null,                   // createdDate
            null,                   // lastModifiedBy
            null,                   // lastModifiedDate
            <%_ } _%>
            new HashSet<>(Collections.singletonList(AuthoritiesConstants.ADMIN))
        );

        restMvc.perform(
            post("/api/account")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(userDTO)))
            .andExpect(status().isOk());

        User updatedUser = userRepository.findOneByLogin(user.getLogin()).orElse(null);
        assertThat(updatedUser.getFirstName()).isEqualTo(userDTO.getFirstName());
        assertThat(updatedUser.getLastName()).isEqualTo(userDTO.getLastName());
        assertThat(updatedUser.getEmail()).isEqualTo(userDTO.getEmail());
        assertThat(updatedUser.getLangKey()).isEqualTo(userDTO.getLangKey());
        assertThat(updatedUser.getPassword()).isEqualTo(user.getPassword());<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>
        assertThat(updatedUser.getImageUrl()).isEqualTo(userDTO.getImageUrl());<% } %>
        assertThat(updatedUser.getActivated()).isEqualTo(true);
        assertThat(updatedUser.getAuthorities()).isEmpty();
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    @WithMockUser("save-invalid-email")
    public void testSaveInvalidEmail() throws Exception {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setLogin("save-invalid-email");
        user.setEmail("save-invalid-email@example.com");
        user.setPassword(RandomStringUtils.random(60));
        user.setActivated(true);

        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        UserDTO userDTO = new UserDTO(
            null,                   // id
            "not-used",          // login
            "firstname",                // firstName
            "lastname",                  // lastName
            "invalid email",    // email
            false,                   // activated
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            "http://placehold.it/50x50", //imageUrl
            <%_ } _%>
            "<%= nativeLanguage %>",                   // langKey
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            null,                   // createdBy
            null,                   // createdDate
            null,                   // lastModifiedBy
            null,                   // lastModifiedDate
            <%_ } _%>
            new HashSet<>(Collections.singletonList(AuthoritiesConstants.ADMIN))
        );

        restMvc.perform(
            post("/api/account")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(userDTO)))
            .andExpect(status().isBadRequest());

        assertThat(userRepository.findOneByEmail("invalid email")).isNotPresent();
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    @WithMockUser("save-existing-email")
    public void testSaveExistingEmail() throws Exception {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setLogin("save-existing-email");
        user.setEmail("save-existing-email@example.com");
        user.setPassword(RandomStringUtils.random(60));
        user.setActivated(true);

        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        User anotherUser = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        anotherUser.setId(UUID.randomUUID().toString());
        <%_ } _%>
        anotherUser.setLogin("save-existing-email2");
        anotherUser.setEmail("save-existing-email2@example.com");
        anotherUser.setPassword(RandomStringUtils.random(60));
        anotherUser.setActivated(true);

        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(anotherUser);

        UserDTO userDTO = new UserDTO(
            null,                   // id
            "not-used",          // login
            "firstname",                // firstName
            "lastname",                  // lastName
            "save-existing-email2@example.com",    // email
            false,                   // activated
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            "http://placehold.it/50x50", //imageUrl
            <%_ } _%>
            "<%= nativeLanguage %>",                   // langKey
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            null,                   // createdBy
            null,                   // createdDate
            null,                   // lastModifiedBy
            null,                   // lastModifiedDate
            <%_ } _%>
            new HashSet<>(Collections.singletonList(AuthoritiesConstants.ADMIN))
        );

        restMvc.perform(
            post("/api/account")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(userDTO)))
            .andExpect(status().isBadRequest());

        User updatedUser = userRepository.findOneByLogin("save-existing-email").orElse(null);
        assertThat(updatedUser.getEmail()).isEqualTo("save-existing-email@example.com");
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    @WithMockUser("save-existing-email-and-login")
    public void testSaveExistingEmailAndLogin() throws Exception {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setLogin("save-existing-email-and-login");
        user.setEmail("save-existing-email-and-login@example.com");
        user.setPassword(RandomStringUtils.random(60));
        user.setActivated(true);

        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        User anotherUser = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        anotherUser.setId(UUID.randomUUID().toString());
        <%_ } _%>
        anotherUser.setLogin("save-existing-email-and-login");
        anotherUser.setEmail("save-existing-email-and-login@example.com");
        anotherUser.setPassword(RandomStringUtils.random(60));
        anotherUser.setActivated(true);

        UserDTO userDTO = new UserDTO(
            null,                   // id
            "not-used",          // login
            "firstname",                // firstName
            "lastname",                  // lastName
            "save-existing-email-and-login@example.com",    // email
            false,                   // activated
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            "http://placehold.it/50x50", //imageUrl
            <%_ } _%>
            "<%= nativeLanguage %>",                   // langKey
            <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
            null,                   // createdBy
            null,                   // createdDate
            null,                   // lastModifiedBy
            null,                   // lastModifiedDate
            <%_ } _%>
            new HashSet<>(Collections.singletonList(AuthoritiesConstants.ADMIN))
        );

        restMvc.perform(
            post("/api/account")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(userDTO)))
            .andExpect(status().isOk());

        User updatedUser = userRepository.findOneByLogin("save-existing-email-and-login").orElse(null);
        assertThat(updatedUser.getEmail()).isEqualTo("save-existing-email-and-login@example.com");
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    @WithMockUser("change-password")
    public void testChangePassword() throws Exception {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setPassword(RandomStringUtils.random(60));
        user.setLogin("change-password");
        user.setEmail("change-password@example.com");
        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        restMvc.perform(post("/api/account/change_password").content("new password"))
            .andExpect(status().isOk());

        User updatedUser = userRepository.findOneByLogin("change-password").orElse(null);
        assertThat(passwordEncoder.matches("new password", updatedUser.getPassword())).isTrue();
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    @WithMockUser("change-password-too-small")
    public void testChangePasswordTooSmall() throws Exception {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setPassword(RandomStringUtils.random(60));
        user.setLogin("change-password-too-small");
        user.setEmail("change-password-too-small@example.com");
        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        restMvc.perform(post("/api/account/change_password").content("new"))
            .andExpect(status().isBadRequest());

        User updatedUser = userRepository.findOneByLogin("change-password-too-small").orElse(null);
        assertThat(updatedUser.getPassword()).isEqualTo(user.getPassword());
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    @WithMockUser("change-password-too-long")
    public void testChangePasswordTooLong() throws Exception {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setPassword(RandomStringUtils.random(60));
        user.setLogin("change-password-too-long");
        user.setEmail("change-password-too-long@example.com");
        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        restMvc.perform(post("/api/account/change_password").content(RandomStringUtils.random(101)))
            .andExpect(status().isBadRequest());

        User updatedUser = userRepository.findOneByLogin("change-password-too-long").orElse(null);
        assertThat(updatedUser.getPassword()).isEqualTo(user.getPassword());
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    @WithMockUser("change-password-empty")
    public void testChangePasswordEmpty() throws Exception {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setPassword(RandomStringUtils.random(60));
        user.setLogin("change-password-empty");
        user.setEmail("change-password-empty@example.com");
        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        restMvc.perform(post("/api/account/change_password").content(RandomStringUtils.random(0)))
            .andExpect(status().isBadRequest());

        User updatedUser = userRepository.findOneByLogin("change-password-empty").orElse(null);
        assertThat(updatedUser.getPassword()).isEqualTo(user.getPassword());
    }
    <%_ if (authenticationType == 'session') { _%>

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    @WithMockUser("current-sessions")
    public void testGetCurrentSessions()  throws Exception {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setPassword(RandomStringUtils.random(60));
        user.setLogin("current-sessions");
        user.setEmail("current-sessions@example.com");
        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        PersistentToken token = new PersistentToken();
        token.setSeries("current-sessions");<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        token.setUser(user);<% } else { %>
        token.setUserId(user.getId());
        token.setLogin(user.getLogin());<% } %>
        token.setTokenValue("current-session-data");<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        token.setTokenDate(LocalDate.of(2017, 3, 23));<% } else { %>
        token.setTokenDate(new Date(1490714757123L));<% } %>
        token.setIpAddress("127.0.0.1");
        token.setUserAgent("Test agent");
        persistentTokenRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(token);

        restMvc.perform(get("/api/account/sessions"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.[*].series").value(hasItem(token.getSeries())))
            .andExpect(jsonPath("$.[*].ipAddress").value(hasItem(token.getIpAddress())))
            .andExpect(jsonPath("$.[*].userAgent").value(hasItem(token.getUserAgent())))
            .andExpect(jsonPath("$.[*].tokenDate").value(hasItem(<% if (databaseType == 'cassandra') { %>"2017-03-28T15:25:57.123+0000"<% } else { %>token.getTokenDate().toString()<% } %>)));
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    @WithMockUser("invalidate-session")
    public void testInvalidateSession() throws Exception {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setPassword(RandomStringUtils.random(60));
        user.setLogin("invalidate-session");
        user.setEmail("invalidate-session@example.com");
        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        PersistentToken token = new PersistentToken();
        token.setSeries("invalidate-session");<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        token.setUser(user);<% } else { %>
        token.setUserId(user.getId());
        token.setLogin(user.getLogin());<% } %>
        token.setTokenValue("invalidate-data");<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
        token.setTokenDate(LocalDate.of(2017, 3, 23));<% } else { %>
        token.setTokenDate(new Date(1490714757123L));<% } %>
        token.setIpAddress("127.0.0.1");
        token.setUserAgent("Test agent");
        persistentTokenRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(token);

        assertThat(persistentTokenRepository.findByUser(user)).hasSize(1);

        restMvc.perform(delete("/api/account/sessions/invalidate-session"))
            .andExpect(status().isOk());

        assertThat(persistentTokenRepository.findByUser(user)).isEmpty();
    }
    <%_ } _%>

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void testRequestPasswordReset() throws Exception {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setPassword(RandomStringUtils.random(60));
        user.setActivated(true);
        user.setLogin("password-reset");
        user.setEmail("password-reset@example.com");
        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        restMvc.perform(post("/api/account/reset_password/init")
            .content("password-reset@example.com"))
            .andExpect(status().isOk());
    }

    @Test
    public void testRequestPasswordResetWrongEmail() throws Exception {
        restMvc.perform(
            post("/api/account/reset_password/init")
                .content("password-reset-wrong-email@example.com"))
            .andExpect(status().isBadRequest());
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void testFinishPasswordReset() throws Exception {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setPassword(RandomStringUtils.random(60));
        user.setLogin("finish-password-reset");
        user.setEmail("finish-password-reset@example.com");
        user.setResetDate(Instant.now().plusSeconds(60));
        user.setResetKey("reset key");
        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        KeyAndPasswordVM keyAndPassword = new KeyAndPasswordVM();
        keyAndPassword.setKey(user.getResetKey());
        keyAndPassword.setNewPassword("new password");

        restMvc.perform(
            post("/api/account/reset_password/finish")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(keyAndPassword)))
            .andExpect(status().isOk());

        User updatedUser = userRepository.findOneByLogin(user.getLogin()).orElse(null);
        assertThat(passwordEncoder.matches(keyAndPassword.getNewPassword(), updatedUser.getPassword())).isTrue();
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void testFinishPasswordResetTooSmall() throws Exception {
        User user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setPassword(RandomStringUtils.random(60));
        user.setLogin("finish-password-reset-too-small");
        user.setEmail("finish-password-reset-too-small@example.com");
        user.setResetDate(Instant.now().plusSeconds(60));
        user.setResetKey("reset key too small");
        userRepository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(user);

        KeyAndPasswordVM keyAndPassword = new KeyAndPasswordVM();
        keyAndPassword.setKey(user.getResetKey());
        keyAndPassword.setNewPassword("foo");

        restMvc.perform(
            post("/api/account/reset_password/finish")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(keyAndPassword)))
            .andExpect(status().isBadRequest());

        User updatedUser = userRepository.findOneByLogin(user.getLogin()).orElse(null);
        assertThat(passwordEncoder.matches(keyAndPassword.getNewPassword(), updatedUser.getPassword())).isFalse();
    }


    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void testFinishPasswordResetWrongKey() throws Exception {
        KeyAndPasswordVM keyAndPassword = new KeyAndPasswordVM();
        keyAndPassword.setKey("wrong reset key");
        keyAndPassword.setNewPassword("new password");

        restMvc.perform(
            post("/api/account/reset_password/finish")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(keyAndPassword)))
            .andExpect(status().isInternalServerError());
    }
}
