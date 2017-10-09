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
<% if (databaseType === 'cassandra') { %>
import <%=packageName%>.AbstractCassandraTest;<% } %>
import <%=packageName%>.<%= mainClass %>;<% if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { %>
import <%=packageName%>.domain.PersistentToken;<% } %>
<%_ if (authenticationType !== 'oauth2') { _%>
import <%=packageName%>.domain.User;<%_ } _%>
<%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { _%>
import <%=packageName%>.repository.PersistentTokenRepository;<% } %>
import <%=packageName%>.config.Constants;
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.service.dto.UserDTO;<% if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType !== 'oauth2') { %>
import <%=packageName%>.service.util.RandomUtil;<% } %>
import <%=packageName%>.web.rest.vm.ManagedUserVM;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;<% if (databaseType === 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>
import org.springframework.test.context.junit4.SpringRunner;
<%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
<%_ } _%><%_ if (databaseType === 'couchbase') { _%>
import org.springframework.security.test.context.support.WithAnonymousUser;
<%_ } _%>
<%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { _%>
import java.time.LocalDate;
<%_ } _%>
<%_ if (authenticationType !== 'oauth2') { _%>
import java.time.Instant;
<%_ } _%>
<%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType !== 'oauth2') { _%>
import java.time.temporal.ChronoUnit;
import java.util.Optional;
<%_ } _%>
<%_ if (authenticationType !== 'oauth2') { _%>
import java.util.List;
<%_ } _%>

import static org.assertj.core.api.Assertions.*;

/**
 * Test class for the UserResource REST controller.
 *
 * @see UserService
 */
@RunWith(SpringRunner.class)
@SpringBootTest(classes = <%= mainClass %>.class)<% if (databaseType === 'sql') { %>
@Transactional<% } %>
public class UserServiceIntTest <% if (databaseType === 'cassandra') { %>extends AbstractCassandraTest <% } %>{<% if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { %>

    @Autowired
    private PersistentTokenRepository persistentTokenRepository;<% } %>

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;<% if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { %>

    @Test
    public void testRemoveOldPersistentTokens() {
        User admin = userRepository.findOneByLogin("admin").get();
        int existingCount = persistentTokenRepository.findByUser(admin).size();
        generateUserToken(admin, "1111-1111", LocalDate.now());
        LocalDate now = LocalDate.now();
        generateUserToken(admin, "2222-2222", now.minusDays(32));
        assertThat(persistentTokenRepository.findByUser(admin)).hasSize(existingCount + 2);
        userService.removeOldPersistentTokens();
        assertThat(persistentTokenRepository.findByUser(admin)).hasSize(existingCount + 1);
    }<% } %><% if (authenticationType !== 'oauth2' && (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase')) { %>

    @Test
    public void assertThatUserMustExistToResetPassword() {
        Optional<User> maybeUser = userService.requestPasswordReset("john.doe@localhost");
        assertThat(maybeUser.isPresent()).isFalse();

        maybeUser = userService.requestPasswordReset("admin@localhost");
        assertThat(maybeUser.isPresent()).isTrue();

        assertThat(maybeUser.get().getEmail()).isEqualTo("admin@localhost");
        assertThat(maybeUser.get().getResetDate()).isNotNull();
        assertThat(maybeUser.get().getResetKey()).isNotNull();
    }

    @Test
    public void assertThatOnlyActivatedUserCanRequestPasswordReset() {
        User user = createUser("johndoe", "johndoe", "John", "Doe", "john.doe@localhost", "http://placehold.it/50x50", "en-US");
        Optional<User> maybeUser = userService.requestPasswordReset("john.doe@localhost");
        assertThat(maybeUser.isPresent()).isFalse();
        userRepository.delete(user);
    }

    @Test
    public void assertThatResetKeyMustNotBeOlderThan24Hours() {
        User user = createUser("johndoe", "johndoe", "John", "Doe", "john.doe@localhost", "http://placehold.it/50x50", "en-US");

        Instant daysAgo = Instant.now().minus(25, ChronoUnit.HOURS);
        String resetKey = RandomUtil.generateResetKey();
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey(resetKey);

        userRepository.save(user);

        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey());

        assertThat(maybeUser.isPresent()).isFalse();

        userRepository.delete(user);
    }

    @Test
    public void assertThatResetKeyMustBeValid() {
        User user = createUser("johndoe", "johndoe", "John", "Doe", "john.doe@localhost", "http://placehold.it/50x50", "en-US");

        Instant daysAgo = Instant.now().minus(25, ChronoUnit.HOURS);
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey("1234");
        userRepository.save(user);
        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey());
        assertThat(maybeUser.isPresent()).isFalse();
        userRepository.delete(user);
    }

    @Test
    public void assertThatUserCanResetPassword() {
        User user = createUser("johndoe", "johndoe", "John", "Doe", "john.doe@localhost", "http://placehold.it/50x50", "en-US");
        String oldPassword = user.getPassword();
        Instant daysAgo = Instant.now().minus(2, ChronoUnit.HOURS);
        String resetKey = RandomUtil.generateResetKey();
        user.setActivated(true);
        user.setResetDate(daysAgo);
        user.setResetKey(resetKey);
        userRepository.save(user);
        Optional<User> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey());
        assertThat(maybeUser.isPresent()).isTrue();
        assertThat(maybeUser.get().getResetDate()).isNull();
        assertThat(maybeUser.get().getResetKey()).isNull();
        assertThat(maybeUser.get().getPassword()).isNotEqualTo(oldPassword);

        userRepository.delete(user);
    }

    @Test
    public void testFindNotActivatedUsersByCreationDateBefore() {
        userService.removeNotActivatedUsers();
        Instant now = Instant.now();
        List<User> users = userRepository.findAllByActivatedIsFalseAndCreatedDateBefore(now.minus(3, ChronoUnit.DAYS));
        assertThat(users).isEmpty();
    }<% } %><% if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session') { %>

    private void generateUserToken(User user, String tokenSeries, LocalDate localDate) {
        PersistentToken token = new PersistentToken();
        token.setSeries(tokenSeries);<% if (databaseType === 'couchbase') { %>
        token.setLogin(user.getLogin());<% } else { %>
        token.setUser(user);<% } %>
        token.setTokenValue(tokenSeries + "-data");
        token.setTokenDate(localDate);
        token.setIpAddress("127.0.0.1");
        token.setUserAgent("Test agent");<% if (databaseType === 'sql') { %>
        persistentTokenRepository.saveAndFlush(token);<% } %><% if (databaseType === 'mongodb' || databaseType === 'couchbase') { %>
        persistentTokenRepository.save(token);<% } %>
    }<% } %>

    @Test
    <% if (databaseType === 'couchbase') { %>@WithAnonymousUser<% } %>
    public void assertThatAnonymousUserIsNotGet() {<% if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { %>
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
    public void testRemoveNotActivatedUsers() {
        User user = createUser("johndoe", "johndoe", "John", "Doe", "john.doe@localhost", "http://placehold.it/50x50", "en-US");
        user.setActivated(false);
        user.setCreatedDate(Instant.now().minus(30, ChronoUnit.DAYS));
        userRepository.save(user);
        assertThat(userRepository.findOneByLogin("johndoe")).isPresent();
        userService.removeNotActivatedUsers();
        assertThat(userRepository.findOneByLogin("johndoe")).isNotPresent();
    }

    private User createUser(String login, String password, String firstName, String lastName, String email, String imageUrl, String langKey) {
        return userService.registerUser(new ManagedUserVM(null, login, password, firstName, lastName, email, true, imageUrl, langKey, null, null, null, null, null));
    }
    <%_ } _%>

}
