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
package <%= packageName %>.service;

<%_ if (databaseType === 'cassandra') { _%>
import <%= packageName %>.AbstractCassandraTest;
<%_ } _%>
import <%= packageName %>.<%= mainClass %>;
import <%= packageName %>.config.Constants;
<%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { _%>
import <%= packageName %>.domain.PersistentToken;
<%_ } _%>
import <%= packageName %>.domain.User;
<%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { _%>
import <%= packageName %>.repository.PersistentTokenRepository;
<%_ } _%>
import <%= packageName %>.repository.UserRepository;
import <%= packageName %>.service.dto.UserDTO;
<%_ if (authenticationType !== 'oauth2' && (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase')) { _%>
import <%= packageName %>.service.util.RandomUtil;
<%_ } _%>

<%_ if (authenticationType !== 'oauth2') { _%>
import org.apache.commons.lang3.RandomStringUtils;
<%_ } _%>
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
<%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
<%_ } _%><%_ if (databaseType === 'couchbase') { _%>
import org.springframework.security.test.context.support.WithAnonymousUser;
<%_ } _%>
import org.springframework.test.context.junit4.SpringRunner;
<%_ if (databaseType === 'sql') { _%>
import org.springframework.transaction.annotation.Transactional;
<%_ } _%>

<%_ if (authenticationType !== 'oauth2') { _%>
import java.time.Instant;
import java.time.temporal.ChronoUnit;
<%_ } _%>
<%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { _%>
import java.time.LocalDate;
<%_ } _%>
<%_ if (authenticationType !== 'oauth2') { _%>
import java.util.List;
<%_ } _%>
<%_ if (authenticationType !== 'oauth2' && (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase')) { _%>
import java.util.Optional;
<%_ } _%><%_ if (databaseType === 'cassandra') { _%>
import java.util.UUID;
<%_ } _%>

<%_ if (databaseType === 'couchbase') { _%>
import static <%= packageName %>.web.rest.TestUtil.mockAuthentication;
<%_ } _%>
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test class for the UserResource REST controller.
 *
 * @see UserService
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = <%= mainClass %>.class)<% if (databaseType === 'sql') { %>
@Transactional<% } %>
public class UserServiceIntTest <% if (databaseType === 'cassandra') { %>extends AbstractCassandraTest <% } %>{

    <%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { _%>
    @Autowired
    private PersistentTokenRepository persistentTokenRepository;

    <%_ } _%>
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    private User user;

    @Before
    public void init() {
        <%_ if (databaseType === 'couchbase') { _%>
        mockAuthentication();
        <%_ } _%>
        <%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { _%>
        persistentTokenRepository.deleteAll();
        <%_ } _%>
        <%_ if (databaseType !== 'sql') { _%>
        userRepository.deleteAll();
        <%_ } _%>
        user = new User();
        <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
        <%_ } _%>
        user.setLogin("johndoe");
        <%_ if (authenticationType !== 'oauth2') { _%>
        user.setPassword(RandomStringUtils.random(60));
        <%_ } _%>
        user.setActivated(true);
        user.setEmail("johndoe@localhost");
        user.setFirstName("john");
        user.setLastName("doe");
        <%_ if (databaseType !== 'cassandra') { _%>
        user.setImageUrl("http://placehold.it/50x50");
        <%_ } _%>
        user.setLangKey("en");
    }
    <%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { _%>

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void testRemoveOldPersistentTokens() {
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        int existingCount = persistentTokenRepository.findByUser(user).size();
        LocalDate today = LocalDate.now();
        generateUserToken(user, "1111-1111", today);
        generateUserToken(user, "2222-2222", today.minusDays(32));
        assertThat(persistentTokenRepository.findByUser(user)).hasSize(existingCount + 2);
        userService.removeOldPersistentTokens();
        assertThat(persistentTokenRepository.findByUser(user)).hasSize(existingCount + 1);
    }
    <%_ } _%>
    <%_ if (authenticationType !== 'oauth2' && (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase')) { _%>

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void assertThatUserMustExistToResetPassword() {
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        Optional<User> maybeUser = userService.requestPasswordReset("invalid.login@localhost");
        assertThat(maybeUser).isNotPresent();

        maybeUser = userService.requestPasswordReset(user.getEmail());
        assertThat(maybeUser).isPresent();
        assertThat(maybeUser.orElse(null).getEmail()).isEqualTo(user.getEmail());
        assertThat(maybeUser.orElse(null).getResetDate()).isNotNull();
        assertThat(maybeUser.orElse(null).getResetKey()).isNotNull();
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void assertThatOnlyActivatedUserCanRequestPasswordReset() {
        user.setActivated(false);
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);

        Optional<User> maybeUser = userService.requestPasswordReset(user.getLogin());
        assertThat(maybeUser).isNotPresent();
        userRepository.delete(user);
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void assertThatResetKeyMustNotBeOlderThan24Hours() {
        Instant daysAgo = Instant.now().minus(25, ChronoUnit.HOURS);
        String resetKey = RandomUtil.generateResetKey();
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey(resetKey);
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);

        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey());
        assertThat(maybeUser).isNotPresent();
        userRepository.delete(user);
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void assertThatResetKeyMustBeValid() {
        Instant daysAgo = Instant.now().minus(25, ChronoUnit.HOURS);
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey("1234");
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);

        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey());
        assertThat(maybeUser).isNotPresent();
        userRepository.delete(user);
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void assertThatUserCanResetPassword() {
        String oldPassword = user.getPassword();
        Instant daysAgo = Instant.now().minus(2, ChronoUnit.HOURS);
        String resetKey = RandomUtil.generateResetKey();
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey(resetKey);
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);

        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey());
        assertThat(maybeUser).isPresent();
        assertThat(maybeUser.orElse(null).getResetDate()).isNull();
        assertThat(maybeUser.orElse(null).getResetKey()).isNull();
        assertThat(maybeUser.orElse(null).getPassword()).isNotEqualTo(oldPassword);

        userRepository.delete(user);
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void testFindNotActivatedUsersByCreationDateBefore() {
        Instant now = Instant.now();
        user.setActivated(false);
        User dbUser = userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        dbUser.setCreatedDate(now.minus(4, ChronoUnit.DAYS));
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        List<User> users = userRepository.findAllByActivatedIsFalseAndCreatedDateBefore(now.minus(3, ChronoUnit.DAYS));
        assertThat(users).isNotEmpty();
        userService.removeNotActivatedUsers();
        users = userRepository.findAllByActivatedIsFalseAndCreatedDateBefore(now.minus(3, ChronoUnit.DAYS));
        assertThat(users).isEmpty();
    }
    <%_ } _%>
    <%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { _%>

    private void generateUserToken(User user, String tokenSeries, LocalDate localDate) {
        PersistentToken token = new PersistentToken();
        token.setSeries(tokenSeries);<% if (databaseType === 'couchbase') { %>
        token.setLogin(user.getLogin());<% } else { %>
        token.setUser(user);<% } %>
        token.setTokenValue(tokenSeries + "-data");
        token.setTokenDate(localDate);
        token.setIpAddress("127.0.0.1");
        token.setUserAgent("Test agent");
        persistentTokenRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(token);
    }
    <%_ } _%>

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } else if (databaseType === 'couchbase') { _%>
    @WithAnonymousUser
    <%_ } _%>
    public void assertThatAnonymousUserIsNotGet() {
        user.setLogin(Constants.ANONYMOUS_USER);
        if (!userRepository.findOneByLogin(Constants.ANONYMOUS_USER).isPresent()) {
            userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        }<% if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { %>
        final PageRequest pageable = new PageRequest(0, (int) userRepository.count());
        final Page<UserDTO> allManagedUsers = userService.getAllManagedUsers(pageable);
        assertThat(allManagedUsers.getContent().stream()<% } %><% if (databaseType === 'cassandra') { %>
        final List<UserDTO> allManagedUsers = userService.getAllManagedUsers();
        assertThat(allManagedUsers.stream()<% } %>
            .noneMatch(user -> Constants.ANONYMOUS_USER.equals(user.getLogin())))
            .isTrue();
    }
    <%_ if (authenticationType !== 'oauth2' && (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase')) { _%>

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void testRemoveNotActivatedUsers() {
        user.setActivated(false);
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);
        // Let the audit first set the creation date but then update it
        user.setCreatedDate(Instant.now().minus(30, ChronoUnit.DAYS));
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user);

        assertThat(userRepository.findOneByLogin("johndoe")).isPresent();
        userService.removeNotActivatedUsers();
        assertThat(userRepository.findOneByLogin("johndoe")).isNotPresent();
    }
    <%_ } _%>

}
