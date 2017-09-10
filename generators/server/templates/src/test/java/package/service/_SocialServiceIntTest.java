<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
package <%=packageName%>.service;

import <%=packageName%>.<%= mainClass %>;
import <%=packageName%>.domain.Authority;
import <%=packageName%>.domain.User;
import <%=packageName%>.repository.AuthorityRepository;
import <%=packageName%>.repository.UserRepository;
<%_ if (searchEngine === 'elasticsearch') { _%>
import <%=packageName%>.repository.search.UserSearchRepository;
<%_ } _%>
import <%=packageName%>.service.MailService;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.social.connect.*;
import org.springframework.test.context.junit4.SpringRunner;<% if (databaseType === 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = <%= mainClass %>.class)<% if (databaseType === 'sql') { %>
@Transactional<% } %>
public class SocialServiceIntTest {

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;
    <%_ if (searchEngine === 'elasticsearch') { _%>
    @Autowired
    private UserSearchRepository userSearchRepository;

    <%_ } _%>

    @Mock
    private MailService mockMailService;

    @Mock
    private UsersConnectionRepository mockUsersConnectionRepository;

    @Mock
    private ConnectionRepository mockConnectionRepository;

    private SocialService socialService;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        doNothing().when(mockMailService).sendSocialRegistrationValidationEmail(anyObject(), anyString());
        doNothing().when(mockConnectionRepository).addConnection(anyObject());
        when(mockUsersConnectionRepository.createConnectionRepository(anyString())).thenReturn(mockConnectionRepository);

        socialService = new SocialService(mockUsersConnectionRepository, authorityRepository,
                passwordEncoder, userRepository, mockMailService<% if (searchEngine === 'elasticsearch') { %>, userSearchRepository<% } %>);
    }

    @Test
    public void testDeleteUserSocialConnection() throws Exception {
        // Setup
        Connection<?> connection = createConnection("@LOGIN",
            "mail@mail.com",
            "FIRST_NAME",
            "LAST_NAME",
            "IMAGE_URL",
            "PROVIDER");
        socialService.createSocialUser(connection, "fr");
        MultiValueMap<String, Connection<?>> connectionsByProviderId = new LinkedMultiValueMap<>();
        connectionsByProviderId.put("PROVIDER", null);
        when(mockConnectionRepository.findAllConnections()).thenReturn(connectionsByProviderId);

        // Exercise
        socialService.deleteUserSocialConnection("@LOGIN");

        // Verify
        verify(mockConnectionRepository, times(1)).removeConnections("PROVIDER");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCreateSocialUserShouldThrowExceptionIfConnectionIsNull() {
        // Exercise
        socialService.createSocialUser(null, "fr");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCreateSocialUserShouldThrowExceptionIfConnectionHasNoEmailAndNoLogin() {
        // Setup
        Connection<?> connection = createConnection("",
            "",
            "FIRST_NAME",
            "LAST_NAME",
            "IMAGE_URL",
            "PROVIDER");

        // Exercise
        socialService.createSocialUser(connection, "fr");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCreateSocialUserShouldThrowExceptionIfConnectionHasNoEmailAndLoginAlreadyExist() {
        // Setup
        User user = createExistingUser("@LOGIN",
            "mail@mail.com",
            "OTHER_FIRST_NAME",
            "OTHER_LAST_NAME",
            "OTHER_IMAGE_URL");
        Connection<?> connection = createConnection("@LOGIN",
            "",
            "FIRST_NAME",
            "LAST_NAME",
            "IMAGE_URL",
            "PROVIDER");

        // Exercise
        try {
            // Exercise
            socialService.createSocialUser(connection, "fr");
        } finally {
            // Teardown
            userRepository.delete(user);
        }
    }

    @Test
    public void testCreateSocialUserShouldCreateUserIfNotExist() {
        // Setup
        Connection<?> connection = createConnection("@LOGIN",
            "mail@mail.com",
            "FIRST_NAME",
            "LAST_NAME",
            "IMAGE_URL",
            "PROVIDER");

        // Exercise
        socialService.createSocialUser(connection, "fr");

        // Verify
        final Optional<User> user = userRepository.findOneByEmail("mail@mail.com");
        assertThat(user).isPresent();

        // Teardown
        userRepository.delete(user.get());
    }

    @Test
    public void testCreateSocialUserShouldCreateUserWithSocialInformation() {
        // Setup
        Connection<?> connection = createConnection("@LOGIN",
            "mail@mail.com",
            "FIRST_NAME",
            "LAST_NAME",
            "IMAGE_URL",
            "PROVIDER");

        // Exercise
        socialService.createSocialUser(connection, "fr");

        //Verify
        User user = userRepository.findOneByEmail("mail@mail.com").get();
        assertThat(user.getFirstName()).isEqualTo("FIRST_NAME");
        assertThat(user.getLastName()).isEqualTo("LAST_NAME");
        assertThat(user.getImageUrl()).isEqualTo("IMAGE_URL");

        // Teardown
        userRepository.delete(user);
    }

    @Test
    public void testCreateSocialUserShouldCreateActivatedUserWithRoleUserAndPassword() {
        // Setup
        Connection<?> connection = createConnection("@LOGIN",
            "mail@mail.com",
            "FIRST_NAME",
            "LAST_NAME",
            "IMAGE_URL",
            "PROVIDER");

        // Exercise
        socialService.createSocialUser(connection, "fr");

        //Verify
        User user = userRepository.findOneByEmail("mail@mail.com").get();
        assertThat(user.getActivated()).isEqualTo(true);
        assertThat(user.getPassword()).isNotEmpty();
        Authority userAuthority = authorityRepository.findOne("ROLE_USER");
        assertThat(user.getAuthorities().toArray()).containsExactly(userAuthority);

        // Teardown
        userRepository.delete(user);
    }

    @Test
    public void testCreateSocialUserShouldCreateUserWithExactLangKey() {
        // Setup
        Connection<?> connection = createConnection("@LOGIN",
            "mail@mail.com",
            "FIRST_NAME",
            "LAST_NAME",
            "IMAGE_URL",
            "PROVIDER");

        // Exercise
        socialService.createSocialUser(connection, "fr");

        //Verify
        final User user = userRepository.findOneByEmail("mail@mail.com").get();
        assertThat(user.getLangKey()).isEqualTo("fr");

        // Teardown
        userRepository.delete(user);
    }

    @Test
    public void testCreateSocialUserShouldCreateUserWithLoginSameAsEmailIfNotTwitter() {
        // Setup
        Connection<?> connection = createConnection("@LOGIN",
            "mail@mail.com",
            "FIRST_NAME",
            "LAST_NAME",
            "IMAGE_URL",
            "PROVIDER_OTHER_THAN_TWITTER");

        // Exercise
        socialService.createSocialUser(connection, "fr");

        //Verify
        User user = userRepository.findOneByEmail("mail@mail.com").get();
        assertThat(user.getLogin()).isEqualTo("mail@mail.com");

        // Teardown
        userRepository.delete(user);
    }

    @Test
    public void testCreateSocialUserShouldCreateUserWithSocialLoginWhenIsTwitter() {
        // Setup
        Connection<?> connection = createConnection("@LOGIN",
            "mail@mail.com",
            "FIRST_NAME",
            "LAST_NAME",
            "IMAGE_URL",
            "twitter");

        // Exercise
        socialService.createSocialUser(connection, "fr");

        //Verify
        User user = userRepository.findOneByEmail("mail@mail.com").get();
        assertThat(user.getLogin()).isEqualToIgnoringCase("@LOGIN");

        // Teardown
        userRepository.delete(user);
    }

    @Test
    public void testCreateSocialUserShouldCreateSocialConnection() {
        // Setup
        Connection<?> connection = createConnection("@LOGIN",
            "mail@mail.com",
            "FIRST_NAME",
            "LAST_NAME",
            "IMAGE_URL",
            "PROVIDER");

        // Exercise
        socialService.createSocialUser(connection, "fr");

        //Verify
        verify(mockConnectionRepository, times(1)).addConnection(connection);

        // Teardown
        User userToDelete = userRepository.findOneByEmail("mail@mail.com").get();
        userRepository.delete(userToDelete);
    }

    @Test
    public void testCreateSocialUserShouldNotCreateUserIfEmailAlreadyExist() {
        // Setup
        createExistingUser("@OTHER_LOGIN",
            "mail@mail.com",
            "OTHER_FIRST_NAME",
            "OTHER_LAST_NAME",
            "OTHER_IMAGE_URL");
        long initialUserCount = userRepository.count();
        Connection<?> connection = createConnection("@LOGIN",
            "mail@mail.com",
            "FIRST_NAME",
            "LAST_NAME",
            "IMAGE_URL",
            "PROVIDER");

        // Exercise
        socialService.createSocialUser(connection, "fr");

        //Verify
        assertThat(userRepository.count()).isEqualTo(initialUserCount);

        // Teardown
        User userToDelete = userRepository.findOneByEmail("mail@mail.com").get();
        userRepository.delete(userToDelete);
    }

    @Test
    public void testCreateSocialUserShouldNotChangeUserIfEmailAlreadyExist() {
        // Setup
        createExistingUser("@OTHER_LOGIN",
            "mail@mail.com",
            "OTHER_FIRST_NAME",
            "OTHER_LAST_NAME",
            "OTHER_IMAGE_URL");
        Connection<?> connection = createConnection("@LOGIN",
            "mail@mail.com",
            "FIRST_NAME",
            "LAST_NAME",
            "IMAGE_URL",
            "PROVIDER");

        // Exercise
        socialService.createSocialUser(connection, "fr");

        //Verify
        User userToVerify = userRepository.findOneByEmail("mail@mail.com").get();
        assertThat(userToVerify.getLogin()).isEqualTo("@other_login");
        assertThat(userToVerify.getFirstName()).isEqualTo("OTHER_FIRST_NAME");
        assertThat(userToVerify.getLastName()).isEqualTo("OTHER_LAST_NAME");
        assertThat(userToVerify.getImageUrl()).isEqualTo("OTHER_IMAGE_URL");
        // Teardown
        userRepository.delete(userToVerify);
    }

    @Test
    public void testCreateSocialUserShouldSendRegistrationValidationEmail() {
        // Setup
        Connection<?> connection = createConnection("@LOGIN",
            "mail@mail.com",
            "FIRST_NAME",
            "LAST_NAME",
            "IMAGE_URL",
            "PROVIDER");

        // Exercise
        socialService.createSocialUser(connection, "fr");

        //Verify
        verify(mockMailService, times(1)).sendSocialRegistrationValidationEmail(anyObject(), anyString());

        // Teardown
        User userToDelete = userRepository.findOneByEmail("mail@mail.com").get();
        userRepository.delete(userToDelete);
    }

    private Connection<?> createConnection(String login,
                                           String email,
                                           String firstName,
                                           String lastName,
                                           String imageUrl,
                                           String providerId) {
        UserProfile userProfile = mock(UserProfile.class);
        when(userProfile.getEmail()).thenReturn(email);
        when(userProfile.getUsername()).thenReturn(login);
        when(userProfile.getFirstName()).thenReturn(firstName);
        when(userProfile.getLastName()).thenReturn(lastName);

        Connection<?> connection = mock(Connection.class);
        ConnectionKey key = new ConnectionKey(providerId, "PROVIDER_USER_ID");
        when(connection.fetchUserProfile()).thenReturn(userProfile);
        when(connection.getKey()).thenReturn(key);
        when(connection.getImageUrl()).thenReturn(imageUrl);

        return connection;
    }

    private User createExistingUser(String login,
                                    String email,
                                    String firstName,
                                    String lastName,
                                    String imageUrl) {
        User user = new User();
        user.setLogin(login);
        user.setPassword(passwordEncoder.encode("password"));
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setImageUrl(imageUrl);
        return userRepository.<% if (databaseType === 'sql') { %>saveAndFlush<% } else if (databaseType === 'mongodb') { %>save<% } %>(user);
    }
}
