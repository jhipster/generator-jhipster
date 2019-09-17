<%#
 Copyright 2013-2019 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://www.jhipster.tech/
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
<%_ if (authenticationType === 'oauth2') { _%>
import <%= packageName %>.config.TestSecurityConfiguration;
<%_ } _%>
<%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session' && !reactive) { _%>
import <%= packageName %>.domain.PersistentToken;
<%_ } _%>
<%_ if (databaseType !== 'no') { _%>
import <%= packageName %>.domain.<%= asEntity('User') %>;
<%_ } _%>
<%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session' && !reactive) { _%>
import <%= packageName %>.repository.PersistentTokenRepository;
<%_ } _%>
<%_ if (searchEngine === 'elasticsearch') { _%>
import <%= packageName %>.repository.search.UserSearchRepository;
<%_ } _%>
<%_ if (databaseType !== 'no') { _%>
import <%= packageName %>.repository<% if (reactive) { %>.reactive<% } %>.UserRepository;
<%_ } _%>
<%_ if (authenticationType === 'oauth2') { _%>
import <%= packageName %>.security.AuthoritiesConstants;
<%_ } _%>
import <%= packageName %>.service.dto.<%= asDto('User') %>;
<%_ if (authenticationType !== 'oauth2' && (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase')) { _%>
import <%= packageName %>.service.util.RandomUtil;
<%_ } _%>

<%_ if (authenticationType !== 'oauth2') { _%>
import org.apache.commons.lang3.RandomStringUtils;
<%_ } _%>
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
<%_ if (databaseType === 'sql' && authenticationType !== 'oauth2') { _%>
import org.mockito.Mock;
<%_ } _%>
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
<%_ if (databaseType === 'sql' && authenticationType !== 'oauth2') { _%>
import org.springframework.data.auditing.AuditingHandler;
import org.springframework.data.auditing.DateTimeProvider;
<%_ } _%>
<%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
    <%_ if (!reactive) { _%>
import org.springframework.data.domain.Page;
    <%_ } _%>
import org.springframework.data.domain.PageRequest;
<%_ } _%>
<%_ if (messageBroker === 'kafka') { _%>
import org.springframework.kafka.test.context.EmbeddedKafka;
<%_ } _%>
<%_ if (authenticationType === 'oauth2') { _%>
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
<%_ } _%>
<%_ if (databaseType === 'couchbase') { _%>
import org.springframework.security.test.context.support.WithAnonymousUser;
<%_ } _%>
<%_ if (databaseType === 'sql') { _%>
import org.springframework.transaction.annotation.Transactional;
<%_ } _%>

<%_ if (authenticationType !== 'oauth2' && (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase')) { _%>
import java.time.Instant;
import java.time.temporal.ChronoUnit;
<%_ } _%>
<%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session' && !reactive) { _%>
import java.time.LocalDate;
<%_ } _%>
<%_ if (databaseType === 'sql' && authenticationType !== 'oauth2') { _%>
import java.time.LocalDateTime;
import java.util.Optional;
<%_ } _%>
<%_ if (authenticationType !== 'oauth2') { _%>
import java.util.List;
<%_ } _%>
<%_ if (authenticationType === 'oauth2') { _%>
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
<%_ } _%>
<%_ if (authenticationType !== 'oauth2' && (databaseType === 'mongodb' || databaseType === 'couchbase')) { _%>
import java.util.Optional;
<%_ } _%><%_ if (databaseType === 'cassandra') { _%>
import java.util.UUID;
<%_ } _%>

<%_ if (databaseType === 'couchbase') { _%>
import static <%= packageName %>.web.rest.TestUtil.mockAuthentication;
<%_ } _%>
import static org.assertj.core.api.Assertions.assertThat;
<%_ if (searchEngine === 'elasticsearch') { _%>
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
<%_ } _%>
<%_ if (databaseType === 'sql' && authenticationType !== 'oauth2') { _%>
import static org.mockito.Mockito.when;
<%_ } _%>

/**
 * Integration tests for {@link UserService}.
 */
<%_ if (messageBroker === 'kafka') { _%>
@EmbeddedKafka
<%_ } _%>
<%_ if (authenticationType === 'oauth2') { _%>
@SpringBootTest(classes = {<%= mainClass %>.class, TestSecurityConfiguration.class})
<%_ } else { _%>
@SpringBootTest(classes = <%= mainClass %>.class)
<%_ } _%>
<%_ if (databaseType === 'sql') { _%>
@Transactional
<%_ } _%>
public class UserServiceIT <% if (databaseType === 'cassandra') { %>extends AbstractCassandraTest <% } %>{

    private static final String DEFAULT_LOGIN = "johndoe";

    private static final String DEFAULT_EMAIL = "johndoe@localhost";

    private static final String DEFAULT_FIRSTNAME = "john";

    private static final String DEFAULT_LASTNAME = "doe";

    <%_ if (databaseType !== 'cassandra') { _%>
    private static final String DEFAULT_IMAGEURL = "http://placehold.it/50x50";

    <%_ } _%>
    private static final String DEFAULT_LANGKEY = "dummy";

    <%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session' && !reactive) { _%>
    @Autowired
    private PersistentTokenRepository persistentTokenRepository;

    <%_ } _%>
    <%_ if (databaseType !== 'no') { _%>
    @Autowired
    private UserRepository userRepository;

    <%_ } _%>
    @Autowired
    private UserService userService;
    <%_ if (searchEngine === 'elasticsearch') { _%>

    /**
     * This repository is mocked in the <%=packageName%>.repository.search test package.
     *
     * @see <%= packageName %>.repository.search.UserSearchRepositoryMockConfiguration
     */
    @Autowired
    private UserSearchRepository mockUserSearchRepository;
    <%_ } _%>
    <%_ if (databaseType === 'sql' && authenticationType !== 'oauth2') { _%>

    @Autowired
    private AuditingHandler auditingHandler;

    @Mock
    private DateTimeProvider dateTimeProvider;
    <%_ } _%>
    <%_ if (databaseType !== 'no') { _%>

    private <%= asEntity('User') %> user;
    <%_ } _%>

    <%_ if (authenticationType === 'oauth2' ) { _%>
    private Map<String, Object> userDetails;

    <%_ } _%>
    @BeforeEach
    public void init() {
        <%_ if (databaseType === 'couchbase') { _%>
        mockAuthentication();
        <%_ } _%>
        <%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session' && !reactive) { _%>
        persistentTokenRepository.deleteAll();
        <%_ } _%>
        <%_ if (databaseType === 'mongodb' || databaseType === 'cassandra' || databaseType === 'couchbase') { _%>
        userRepository.deleteAll()<% if (reactive) { %>.block()<% } %>;
        <%_ } _%>
        <%_ if (databaseType !== 'no') { _%>
        user = new <%= asEntity('User') %>();
            <%_ if (databaseType === 'cassandra') { _%>
        user.setId(UUID.randomUUID().toString());
            <%_ } _%>
        user.setLogin(DEFAULT_LOGIN);
            <%_ if (authenticationType !== 'oauth2') { _%>
        user.setPassword(RandomStringUtils.random(60));
            <%_ } _%>
        user.setActivated(true);
        user.setEmail(DEFAULT_EMAIL);
        user.setFirstName(DEFAULT_FIRSTNAME);
        user.setLastName(DEFAULT_LASTNAME);
            <%_ if (databaseType !== 'cassandra') { _%>
        user.setImageUrl(DEFAULT_IMAGEURL);
            <%_ } _%>
        user.setLangKey(DEFAULT_LANGKEY);
        <%_ } _%>
        <%_ if (authenticationType === 'oauth2' ) { _%>

        userDetails = new HashMap<>();
        userDetails.put("sub", DEFAULT_LOGIN);
        userDetails.put("email", DEFAULT_EMAIL);
        userDetails.put("given_name", DEFAULT_FIRSTNAME);
        userDetails.put("family_name", DEFAULT_LASTNAME);
            <%_ if (databaseType !== 'cassandra') { _%>
        userDetails.put("picture", DEFAULT_IMAGEURL);
            <%_ } _%>
        <%_ } _%>
        <%_ if (databaseType === 'sql' && authenticationType !== 'oauth2' ) { _%>

        when(dateTimeProvider.getNow()).thenReturn(Optional.of(LocalDateTime.now()));
        auditingHandler.setDateTimeProvider(dateTimeProvider);
        <%_ } _%>
    }
    <%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session' && !reactive) { _%>

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
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user)<% if (reactive) { %>.block()<% } %>;
        Optional<<%= asEntity('User') %>> maybeUser = userService.requestPasswordReset("invalid.login@localhost")<% if (reactive) { %>.blockOptional()<% } %>;
        assertThat(maybeUser).isNotPresent();

        maybeUser = userService.requestPasswordReset(user.getEmail())<% if (reactive) { %>.blockOptional()<% } %>;
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
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user)<% if (reactive) { %>.block()<% } %>;

        Optional<<%= asEntity('User') %>> maybeUser = userService.requestPasswordReset(user.getLogin())<% if (reactive) { %>.blockOptional()<% } %>;
        assertThat(maybeUser).isNotPresent();
        userRepository.delete(user)<% if (reactive) { %>.block()<% } %>;
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
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user)<% if (reactive) { %>.block()<% } %>;

        Optional<<%= asEntity('User') %>> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey())<% if (reactive) { %>.blockOptional()<% } %>;
        assertThat(maybeUser).isNotPresent();
        userRepository.delete(user)<% if (reactive) { %>.block()<% } %>;
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
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user)<% if (reactive) { %>.block()<% } %>;

        Optional<<%= asEntity('User') %>> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey())<% if (reactive) { %>.blockOptional()<% } %>;
        assertThat(maybeUser).isNotPresent();
        userRepository.delete(user)<% if (reactive) { %>.block()<% } %>;
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
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user)<% if (reactive) { %>.block()<% } %>;

        Optional<<%= asEntity('User') %>> maybeUser = userService.completePasswordReset("johndoe2", user.getResetKey())<% if (reactive) { %>.blockOptional()<% } %>;
        assertThat(maybeUser).isPresent();
        assertThat(maybeUser.orElse(null).getResetDate()).isNull();
        assertThat(maybeUser.orElse(null).getResetKey()).isNull();
        assertThat(maybeUser.orElse(null).getPassword()).isNotEqualTo(oldPassword);

        userRepository.delete(user)<% if (reactive) { %>.block()<% } %>;
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void assertThatNotActivatedUsersWithNotNullActivationKeyCreatedBefore3DaysAreDeleted() {
        Instant now = Instant.now();
        <%_ if (databaseType === 'sql') { _%>
        when(dateTimeProvider.getNow()).thenReturn(Optional.of(now.minus(4, ChronoUnit.DAYS)));
        <%_ } _%>
        user.setActivated(false);
        user.setActivationKey(RandomStringUtils.random(20));
        <%= asEntity('User') %> dbUser = userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user)<% if (reactive) { %>.block()<% } %>;
        dbUser.setCreatedDate(now.minus(4, ChronoUnit.DAYS));
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user)<% if (reactive) { %>.block()<% } %>;
        List<<%= asEntity('User') %>> users = userRepository.findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(now.minus(3, ChronoUnit.DAYS))<% if (reactive) { %>
            .collectList().block()<% } %>;
        assertThat(users).isNotEmpty();
        userService.removeNotActivatedUsers();
        users = userRepository.findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(now.minus(3, ChronoUnit.DAYS))<% if (reactive) { %>
            .collectList().block()<% } %>;
        assertThat(users).isEmpty();
        <%_ if (searchEngine === 'elasticsearch') { _%>

        // Verify Elasticsearch mock
        verify(mockUserSearchRepository, times(1)).delete(user);
        <%_ } _%>
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void assertThatNotActivatedUsersWithNullActivationKeyCreatedBefore3DaysAreNotDeleted() {
        Instant now = Instant.now();
        <%_ if (databaseType === 'sql') { _%>
        when(dateTimeProvider.getNow()).thenReturn(Optional.of(now.minus(4, ChronoUnit.DAYS)));
        <%_ } _%>
        user.setActivated(false);
        <%= asEntity('User') %> dbUser = userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user)<% if (reactive) { %>.block()<% } %>;
        dbUser.setCreatedDate(now.minus(4, ChronoUnit.DAYS));
        userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user)<% if (reactive) { %>.block()<% } %>;
        List<<%= asEntity('User') %>> users = userRepository.findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(now.minus(3, ChronoUnit.DAYS))<% if (reactive) { %>
            .collectList().block()<% } %>;
        assertThat(users).isEmpty();
        userService.removeNotActivatedUsers();
        Optional<<%= asEntity('User') %>> maybeDbUser = userRepository.findById(dbUser.getId())<% if (reactive) { %>.blockOptional()<% } %>;
        assertThat(maybeDbUser).contains(dbUser);
        <%_ if (searchEngine === 'elasticsearch') { _%>

        // Verify Elasticsearch mock
        verify(mockUserSearchRepository, never()).delete(user);
        <%_ } _%>
    }
    <%_ } _%>
    <%_ if ((databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') && authenticationType === 'session' && !reactive) { _%>

    private void generateUserToken(<%= asEntity('User') %> user, String tokenSeries, LocalDate localDate) {
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
    <%_ if (databaseType !== 'no') { _%>

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } else if (databaseType === 'couchbase') { _%>
    @WithAnonymousUser
    <%_ } _%>
    public void assertThatAnonymousUserIsNotGet() {
        <%_ if (authenticationType === 'oauth2') { _%>
        user.setId(Constants.ANONYMOUS_USER);
        <%_ } _%>
        user.setLogin(Constants.ANONYMOUS_USER);
        if (!userRepository.findOneByLogin(Constants.ANONYMOUS_USER)<% if (reactive) { %>.blockOptional()<% } %>.isPresent()) {
            userRepository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(user)<% if (reactive) { %>.block()<% } %>;
        }<% if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { %>
        final PageRequest pageable = PageRequest.of(0, (int) userRepository.count()<% if (reactive) { %>.block().intValue()<% } %>);
        final <% if (reactive) { %>List<% } else { %>Page<% } %><<%= asDto('User') %>> allManagedUsers = userService.getAllManagedUsers(pageable)<% if (reactive) { %>
            .collectList().block()<% } %>;
        assertThat(allManagedUsers<% if (!reactive) { %>.getContent()<% } %>.stream()<% } %><% if (databaseType === 'cassandra') { %>
        final List<<%= asDto('User') %>> allManagedUsers = userService.getAllManagedUsers()<% if (reactive) { %>
            .collectList().block()<% } %>;
        assertThat(allManagedUsers.stream()<% } %>
            .noneMatch(user -> Constants.ANONYMOUS_USER.equals(user.getLogin())))
            .isTrue();
    }
    <%_ } _%>

    <%_ if (authenticationType === 'oauth2') { _%>
    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void testDefaultUserDetails() {
        OAuth2AuthenticationToken authentication = createMockOAuth2AuthenticationToken(userDetails);
        <%= asDto('User') %> userDTO = userService.getUserFromAuthentication(authentication);

        assertThat(userDTO.getLogin()).isEqualTo(DEFAULT_LOGIN);
        assertThat(userDTO.getFirstName()).isEqualTo(DEFAULT_FIRSTNAME);
        assertThat(userDTO.getLastName()).isEqualTo(DEFAULT_LASTNAME);
        assertThat(userDTO.getEmail()).isEqualTo(DEFAULT_EMAIL);
        assertThat(userDTO.isActivated()).isTrue();
        assertThat(userDTO.getLangKey()).isEqualTo(Constants.DEFAULT_LANGUAGE);
        assertThat(userDTO.getImageUrl()).isEqualTo(DEFAULT_IMAGEURL);
        assertThat(userDTO.getAuthorities()).contains(AuthoritiesConstants.ANONYMOUS);
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void testUserDetailsWithUsername() {
        userDetails.put("preferred_username", "TEST");

        OAuth2AuthenticationToken authentication = createMockOAuth2AuthenticationToken(userDetails);
        <%= asDto('User') %> userDTO = userService.getUserFromAuthentication(authentication);

        assertThat(userDTO.getLogin()).isEqualTo("test");
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void testUserDetailsWithLangKey() {
        userDetails.put("langKey", DEFAULT_LANGKEY);
        userDetails.put("locale", "en-US");

        OAuth2AuthenticationToken authentication = createMockOAuth2AuthenticationToken(userDetails);
        <%= asDto('User') %> userDTO = userService.getUserFromAuthentication(authentication);

        assertThat(userDTO.getLangKey()).isEqualTo(DEFAULT_LANGKEY);
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void testUserDetailsWithLocale() {
        userDetails.put("locale", "it-IT");

        OAuth2AuthenticationToken authentication = createMockOAuth2AuthenticationToken(userDetails);
        <%= asDto('User') %> userDTO = userService.getUserFromAuthentication(authentication);

        assertThat(userDTO.getLangKey()).isEqualTo("it");
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void testUserDetailsWithUSLocaleUnderscore() {
        userDetails.put("locale", "en_US");

        OAuth2AuthenticationToken authentication = createMockOAuth2AuthenticationToken(userDetails);
        <%= asDto('User') %> userDTO = userService.getUserFromAuthentication(authentication);

        assertThat(userDTO.getLangKey()).isEqualTo("en");
    }

    @Test
    <%_ if (databaseType === 'sql') { _%>
    @Transactional
    <%_ } _%>
    public void testUserDetailsWithUSLocaleDash() {
        userDetails.put("locale", "en-US");

        OAuth2AuthenticationToken authentication = createMockOAuth2AuthenticationToken(userDetails);
        <%= asDto('User') %> userDTO = userService.getUserFromAuthentication(authentication);

        assertThat(userDTO.getLangKey()).isEqualTo("en");
    }

    private OAuth2AuthenticationToken createMockOAuth2AuthenticationToken(Map<String, Object> userDetails) {
        Collection<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(AuthoritiesConstants.ANONYMOUS));
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(Constants.ANONYMOUS_USER, Constants.ANONYMOUS_USER, authorities);
        usernamePasswordAuthenticationToken.setDetails(userDetails);
        OAuth2User user = new DefaultOAuth2User(authorities, userDetails, "sub");

        return new OAuth2AuthenticationToken(user, authorities, "oidc");
    }
    <%_ } _%>
}
