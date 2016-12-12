package <%=packageName%>.repository;

import <%=packageName%>.<%= mainClass %>;
import <%=packageName%>.domain.SocialUserConnection;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.social.connect.*;
import org.springframework.social.connect.support.ConnectionFactoryRegistry;
import org.springframework.social.connect.support.OAuth1ConnectionFactory;
import org.springframework.social.connect.support.OAuth2ConnectionFactory;
import org.springframework.social.oauth1.OAuth1Operations;
import org.springframework.social.oauth1.OAuth1ServiceProvider;
import org.springframework.social.oauth2.*;
import org.springframework.test.context.junit4.SpringRunner;<% if (databaseType === 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = <%= mainClass %>.class)<% if (databaseType === 'sql') { %>
@Transactional<% } %>
public class CustomSocialUsersConnectionRepositoryIntTest {

    private ConnectionFactoryRegistry connectionFactoryRegistry;

    private TestFacebookConnectionFactory connectionFactory;

    private CustomSocialUsersConnectionRepository usersConnectionRepository;

    private ConnectionRepository connectionRepository;

    @Autowired
    private SocialUserConnectionRepository socialUserConnectionRepository;

    @Before
    public void setUp() {
		socialUserConnectionRepository.deleteAll();

        connectionFactoryRegistry = new ConnectionFactoryRegistry();
        connectionFactory = new TestFacebookConnectionFactory();
        connectionFactoryRegistry.addConnectionFactory(connectionFactory);
        usersConnectionRepository = new CustomSocialUsersConnectionRepository(socialUserConnectionRepository, connectionFactoryRegistry);
        connectionRepository = usersConnectionRepository.createConnectionRepository("1");
    }

    @Test
    public void findUserIdWithConnection() {
        insertFacebookConnection();
        List<String> userIds = usersConnectionRepository.findUserIdsWithConnection(connectionRepository.getPrimaryConnection(TestFacebookApi.class));
        assertEquals("1", userIds.get(0));
    }

    @Test
    public void findUserIdWithConnectionNoSuchConnection() {
        Connection<TestFacebookApi> connection = connectionFactory.createConnection(new AccessGrant("12345"));
        assertEquals(0, usersConnectionRepository.findUserIdsWithConnection(connection).size());
    }

    @Test
    public void findUserIdWithConnectionMultipleConnectionsToSameProviderUser() {
        insertFacebookConnection();
        insertFacebookConnectionSameFacebookUser();
        List<String> localUserIds = usersConnectionRepository.findUserIdsWithConnection(connectionRepository.getPrimaryConnection(TestFacebookApi.class));
        assertEquals(2, localUserIds.size());
        assertEquals("1", localUserIds.get(0));
        assertEquals("2", localUserIds.get(1));
    }

    @Test
    public void findUserIdsConnectedTo() {
        insertFacebookConnection();
        insertFacebookConnection3();
        Set<String> localUserIds = usersConnectionRepository.findUserIdsConnectedTo("facebook", new HashSet<>(Arrays.asList("9", "11")));
        assertEquals(2, localUserIds.size());
        assertTrue(localUserIds.contains("1"));
        assertTrue(localUserIds.contains("2"));
    }

    @Test
    @SuppressWarnings("unchecked")
    public void findAllConnections() {
        connectionFactoryRegistry.addConnectionFactory(new TestTwitterConnectionFactory());
        insertTwitterConnection();
        insertFacebookConnection();
        MultiValueMap<String, Connection<?>> connections = connectionRepository.findAllConnections();
        assertEquals(2, connections.size());
        Connection<TestFacebookApi> facebook = (Connection<TestFacebookApi>) connections.getFirst("facebook");
        assertFacebookConnection(facebook);
        Connection<TestTwitterApi> twitter = (Connection<TestTwitterApi>) connections.getFirst("twitter");
        assertTwitterConnection(twitter);
    }

    @Test
    public void findAllConnectionsMultipleConnectionResults() {
        connectionFactoryRegistry.addConnectionFactory(new TestTwitterConnectionFactory());
        insertTwitterConnection();
        insertFacebookConnection();
        insertFacebookConnection2();
        MultiValueMap<String, Connection<?>> connections = connectionRepository.findAllConnections();
        assertEquals(2, connections.size());
        assertEquals(2, connections.get("facebook").size());
        assertEquals(1, connections.get("twitter").size());
    }

    @Test
    public void findAllConnectionsEmptyResult() {
        connectionFactoryRegistry.addConnectionFactory(new TestTwitterConnectionFactory());
        MultiValueMap<String, Connection<?>> connections = connectionRepository.findAllConnections();
        assertEquals(2, connections.size());
        assertEquals(0, connections.get("facebook").size());
        assertEquals(0, connections.get("twitter").size());
    }

    @Test(expected = IllegalArgumentException.class)
    public void noSuchConnectionFactory() {
        insertTwitterConnection();
        connectionRepository.findAllConnections();
    }

    @Test
    @SuppressWarnings("unchecked")
    public void findConnectionsByProviderId() {
        connectionFactoryRegistry.addConnectionFactory(new TestTwitterConnectionFactory());
        insertTwitterConnection();
        List<Connection<?>> connections = connectionRepository.findConnections("twitter");
        assertEquals(1, connections.size());
        assertTwitterConnection((Connection<TestTwitterApi>) connections.get(0));
    }

    @Test
    public void findConnectionsByProviderIdEmptyResult() {
        assertTrue(connectionRepository.findConnections("facebook").isEmpty());
    }

    @Test
    public void findConnectionsByApi() {
        insertFacebookConnection();
        insertFacebookConnection2();
        List<Connection<TestFacebookApi>> connections = connectionRepository.findConnections(TestFacebookApi.class);
        assertEquals(2, connections.size());
        assertFacebookConnection(connections.get(0));
    }

    @Test
    public void findConnectionsByApiEmptyResult() {
        assertTrue(connectionRepository.findConnections(TestFacebookApi.class).isEmpty());
    }

    @Test
    @SuppressWarnings("unchecked")
    public void findConnectionsToUsers() {
        connectionFactoryRegistry.addConnectionFactory(new TestTwitterConnectionFactory());
        insertTwitterConnection();
        insertFacebookConnection();
        insertFacebookConnection2();
        MultiValueMap<String, String> providerUsers = new LinkedMultiValueMap<>();
        providerUsers.add("facebook", "10");
        providerUsers.add("facebook", "9");
        providerUsers.add("twitter", "1");
        MultiValueMap<String, Connection<?>> connectionsForUsers = connectionRepository.findConnectionsToUsers(providerUsers);
        assertEquals(2, connectionsForUsers.size());
        String providerId=connectionsForUsers.getFirst("facebook").getKey().getProviderUserId();
        assertTrue("10".equals(providerId) || "9".equals(providerId) );
        assertFacebookConnection((Connection<TestFacebookApi>) connectionRepository.getConnection(new ConnectionKey("facebook", "9")));
        assertTwitterConnection((Connection<TestTwitterApi>) connectionsForUsers.getFirst("twitter"));
    }

    @Test
    public void findConnectionsToUsersEmptyResult() {
        MultiValueMap<String, String> providerUsers = new LinkedMultiValueMap<>();
        providerUsers.add("facebook", "1");
        assertTrue(connectionRepository.findConnectionsToUsers(providerUsers).isEmpty());
    }

    @Test(expected = IllegalArgumentException.class)
    public void findConnectionsToUsersEmptyInput() {
        MultiValueMap<String, String> providerUsers = new LinkedMultiValueMap<>();
        connectionRepository.findConnectionsToUsers(providerUsers);
    }

    @Test
    @SuppressWarnings("unchecked")
    public void findConnectionByKey() {
        insertFacebookConnection();
        assertFacebookConnection((Connection<TestFacebookApi>) connectionRepository.getConnection(new ConnectionKey("facebook", "9")));
    }

    @Test(expected = NoSuchConnectionException.class)
    public void findConnectionByKeyNoSuchConnection() {
        connectionRepository.getConnection(new ConnectionKey("facebook", "bogus"));
    }

    @Test
    public void findConnectionByApiToUser() {
        insertFacebookConnection();
        insertFacebookConnection2();
        assertFacebookConnection(connectionRepository.getConnection(TestFacebookApi.class, "9"));
        assertEquals("10", connectionRepository.getConnection(TestFacebookApi.class, "10").getKey().getProviderUserId());
    }

    @Test(expected = NoSuchConnectionException.class)
    public void findConnectionByApiToUserNoSuchConnection() {
        assertFacebookConnection(connectionRepository.getConnection(TestFacebookApi.class, "9"));
    }

    @Test
    public void findPrimaryConnection() {
        insertFacebookConnection();
        assertFacebookConnection(connectionRepository.getPrimaryConnection(TestFacebookApi.class));
    }

    @Test
    public void findPrimaryConnectionSelectFromMultipleByRank() {
        insertFacebookConnection2();
        insertFacebookConnection();
        assertFacebookConnection(connectionRepository.getPrimaryConnection(TestFacebookApi.class));
    }

    @Test(expected = NotConnectedException.class)
    public void findPrimaryConnectionNotConnected() {
        connectionRepository.getPrimaryConnection(TestFacebookApi.class);
    }

    @Test
    public void removeConnections() {
        SocialUserConnection facebookConnection = insertFacebookConnection();
        insertFacebookConnection2();
        assertThat(socialUserConnectionRepository.findOne(facebookConnection.getId())).isNotNull();
        connectionRepository.removeConnections("facebook");
        assertThat(socialUserConnectionRepository.findOne(facebookConnection.getId())).isNull();
    }

    @Test
    public void removeConnectionsToProviderNoOp() {
        connectionRepository.removeConnections("twitter");
    }

    @Test
    public void removeConnection() {
        SocialUserConnection facebookConnection = insertFacebookConnection();
        assertThat(socialUserConnectionRepository.findOne(facebookConnection.getId())).isNotNull();
        connectionRepository.removeConnection(new ConnectionKey("facebook", "9"));
        assertThat(socialUserConnectionRepository.findOne(facebookConnection.getId())).isNull();
    }

    @Test
    public void removeConnectionNoOp() {
        connectionRepository.removeConnection(new ConnectionKey("facebook", "1"));
    }

    @Test
    public void addConnection() {
        Connection<TestFacebookApi> connection = connectionFactory.createConnection(new AccessGrant("123456789", null, "987654321", 3600L));
        connectionRepository.addConnection(connection);
        Connection<TestFacebookApi> restoredConnection = connectionRepository.getPrimaryConnection(TestFacebookApi.class);
        assertEquals(connection, restoredConnection);
        assertNewConnection(restoredConnection);
    }

    @Test(expected = DataIntegrityViolationException.class)
    public void addConnectionDuplicate() {
        Connection<TestFacebookApi> connection = connectionFactory.createConnection(new AccessGrant("123456789", null, "987654321", 3600L));
        connectionRepository.addConnection(connection);
        connectionRepository.addConnection(connection);<% if (databaseType === 'sql') { %>
        socialUserConnectionRepository.flush();<% } %>
    }

    @Test
    public void updateConnectionProfileFields() {
        connectionFactoryRegistry.addConnectionFactory(new TestTwitterConnectionFactory());
        insertTwitterConnection();
        Connection<TestTwitterApi> twitter = connectionRepository.getPrimaryConnection(TestTwitterApi.class);
        assertEquals("http://twitter.com/kdonald/picture", twitter.getImageUrl());
        twitter.sync();
        assertEquals("http://twitter.com/kdonald/a_new_picture", twitter.getImageUrl());
        connectionRepository.updateConnection(twitter);
        Connection<TestTwitterApi> twitter2 = connectionRepository.getPrimaryConnection(TestTwitterApi.class);
        assertEquals("http://twitter.com/kdonald/a_new_picture", twitter2.getImageUrl());
    }

    @Test
    public void updateConnectionAccessFields() {
        insertFacebookConnection();
        Connection<TestFacebookApi> facebook = connectionRepository.getPrimaryConnection(TestFacebookApi.class);
        assertEquals("234567890", facebook.getApi().getAccessToken());
        facebook.refresh();
        connectionRepository.updateConnection(facebook);
        Connection<TestFacebookApi> facebook2 = connectionRepository.getPrimaryConnection(TestFacebookApi.class);
        assertEquals("765432109", facebook2.getApi().getAccessToken());
        ConnectionData data = facebook.createData();
        assertEquals("654321098", data.getRefreshToken());
    }

    @Test
    public void findPrimaryConnection_afterRemove() {
        insertFacebookConnection();
        insertFacebookConnection2();
        // 9 is the providerUserId of the first Facebook connection
        connectionRepository.removeConnection(new ConnectionKey("facebook", "9"));
        assertEquals(1, connectionRepository.findConnections(TestFacebookApi.class).size());
        assertNotNull(connectionRepository.findPrimaryConnection(TestFacebookApi.class));
    }

    private SocialUserConnection insertTwitterConnection() {
        return createExistingSocialUserConnection(
            "1",
            "twitter",
            "1",
            1L,
            "@kdonald",
            "http://twitter.com/kdonald",
            "http://twitter.com/kdonald/picture",
            "123456789",
            "987654321",
            null,
            null
        );
    }

    private SocialUserConnection insertFacebookConnection() {
        return createExistingSocialUserConnection(
            "1",
            "facebook",
            "9",
            1L,
            null,
            null,
            null,
            "234567890",
            null,
            "345678901",
            System.currentTimeMillis() + 3600000);
    }

    private SocialUserConnection insertFacebookConnection2() {
        return createExistingSocialUserConnection(
            "1",
            "facebook",
            "10",
            2L,
            null,
            null,
            null,
            "456789012",
            null,
            "56789012",
            System.currentTimeMillis() + 3600000);
    }

    private SocialUserConnection insertFacebookConnection3() {
        return createExistingSocialUserConnection(
            "2",
            "facebook",
            "11", 2L,
            null,
            null,
            null,
            "456789012",
            null,
            "56789012",
            System.currentTimeMillis() + 3600000);
    }

    private SocialUserConnection insertFacebookConnectionSameFacebookUser() {
        return createExistingSocialUserConnection(
            "2",
            "facebook",
            "9",
            1L,
            null,
            null,
            null,
            "234567890",
            null,
            "345678901",
            System.currentTimeMillis() + 3600000);
    }

    private SocialUserConnection createExistingSocialUserConnection(String userId,
                                                                    String providerId,
                                                                    String providerUserId,
                                                                    Long rank,
                                                                    String displayName,
                                                                    String profileURL,
                                                                    String imageURL,
                                                                    String accessToken,
                                                                    String secret,
                                                                    String refreshToken,
                                                                    Long expireTime) {
        SocialUserConnection socialUserConnectionToSabe = new SocialUserConnection(
            userId,
            providerId,
            providerUserId,
            rank,
            displayName,
            profileURL,
            imageURL,
            accessToken,
            secret,
            refreshToken,
            expireTime);
        return socialUserConnectionRepository.save(socialUserConnectionToSabe);
    }

    private void assertNewConnection(Connection<TestFacebookApi> connection) {
        assertEquals("facebook", connection.getKey().getProviderId());
        assertEquals("9", connection.getKey().getProviderUserId());
        assertEquals("Keith Donald", connection.getDisplayName());
        assertEquals("http://facebook.com/keith.donald", connection.getProfileUrl());
        assertEquals("http://facebook.com/keith.donald/picture", connection.getImageUrl());
        assertTrue(connection.test());
        TestFacebookApi api = connection.getApi();
        assertNotNull(api);
        assertEquals("123456789", api.getAccessToken());
        assertEquals("123456789", connection.createData().getAccessToken());
        assertEquals("987654321", connection.createData().getRefreshToken());
    }

    private void assertTwitterConnection(Connection<TestTwitterApi> twitter) {
        assertEquals(new ConnectionKey("twitter", "1"), twitter.getKey());
        assertEquals("@kdonald", twitter.getDisplayName());
        assertEquals("http://twitter.com/kdonald", twitter.getProfileUrl());
        assertEquals("http://twitter.com/kdonald/picture", twitter.getImageUrl());
        TestTwitterApi twitterApi = twitter.getApi();
        assertEquals("123456789", twitterApi.getAccessToken());
        assertEquals("987654321", twitterApi.getSecret());
        twitter.sync();
        assertEquals("http://twitter.com/kdonald/a_new_picture", twitter.getImageUrl());
    }

    private void assertFacebookConnection(Connection<TestFacebookApi> facebook) {
        assertEquals(new ConnectionKey("facebook", "9"), facebook.getKey());
        assertEquals(null, facebook.getDisplayName());
        assertEquals(null, facebook.getProfileUrl());
        assertEquals(null, facebook.getImageUrl());
        TestFacebookApi facebookApi = facebook.getApi();
        assertEquals("234567890", facebookApi.getAccessToken());
        facebook.sync();
        assertEquals("Keith Donald", facebook.getDisplayName());
        assertEquals("http://facebook.com/keith.donald", facebook.getProfileUrl());
        assertEquals("http://facebook.com/keith.donald/picture", facebook.getImageUrl());
    }

    // test facebook provider
    private static class TestFacebookConnectionFactory extends OAuth2ConnectionFactory<TestFacebookApi> {

        public TestFacebookConnectionFactory() {
            super("facebook", new TestFacebookServiceProvider(), new TestFacebookApiAdapter());
        }
    }

    private static class TestFacebookServiceProvider implements OAuth2ServiceProvider<TestFacebookApi> {

        public OAuth2Operations getOAuthOperations() {
            return new OAuth2Operations() {
                public String buildAuthorizeUrl(GrantType grantType, OAuth2Parameters params) {
                    return null;
                }

                public String buildAuthenticateUrl(GrantType grantType, OAuth2Parameters params) {
                    return null;
                }

                public String buildAuthorizeUrl(OAuth2Parameters params) {
                    return null;
                }

                public String buildAuthenticateUrl(OAuth2Parameters params) {
                    return null;
                }

                public AccessGrant exchangeForAccess(String authorizationGrant, String redirectUri, MultiValueMap<String, String> additionalParameters) {
                    return null;
                }

                public AccessGrant exchangeCredentialsForAccess(String username, String password, MultiValueMap<String, String> additionalParameters) {
                    return null;
                }

                public AccessGrant refreshAccess(String refreshToken, MultiValueMap<String, String> additionalParameters) {
                    return new AccessGrant("765432109", "read", "654321098", 3600L);
                }

                @Deprecated
                public AccessGrant refreshAccess(String refreshToken, String scope, MultiValueMap<String, String> additionalParameters) {
                    return new AccessGrant("765432109", "read", "654321098", 3600L);
                }

                public AccessGrant authenticateClient() {
                    return null;
                }

                public AccessGrant authenticateClient(String scope) {
                    return null;
                }
            };
        }

        public TestFacebookApi getApi(final String accessToken) {
            return () -> accessToken;
        }

    }

    public interface TestFacebookApi {

        String getAccessToken();

    }

    private static class TestFacebookApiAdapter implements ApiAdapter<TestFacebookApi> {

        private String accountId = "9";

        private String name = "Keith Donald";

        private String profileUrl = "http://facebook.com/keith.donald";

        private String profilePictureUrl = "http://facebook.com/keith.donald/picture";

        public boolean test(TestFacebookApi api) {
            return true;
        }

        public void setConnectionValues(TestFacebookApi api, ConnectionValues values) {
            values.setProviderUserId(accountId);
            values.setDisplayName(name);
            values.setProfileUrl(profileUrl);
            values.setImageUrl(profilePictureUrl);
        }

        public UserProfile fetchUserProfile(TestFacebookApi api) {
            return new UserProfileBuilder().setName(name).setEmail("keith@interface21.com").setUsername("Keith.Donald").build();
        }

        public void updateStatus(TestFacebookApi api, String message) {

        }
    }

    // test twitter provider
    private static class TestTwitterConnectionFactory extends OAuth1ConnectionFactory<TestTwitterApi> {

        public TestTwitterConnectionFactory() {
            super("twitter", new TestTwitterServiceProvider(), new TestTwitterApiAdapter());
        }
    }

    private static class TestTwitterServiceProvider implements OAuth1ServiceProvider<TestTwitterApi> {

        public OAuth1Operations getOAuthOperations() {
            return null;
        }

        public TestTwitterApi getApi(final String accessToken, final String secret) {
            return new TestTwitterApi() {
                public String getAccessToken() {
                    return accessToken;
                }

                public String getSecret() {
                    return secret;
                }
            };
        }

    }

    public interface TestTwitterApi {

        String getAccessToken();

        String getSecret();

    }

    private static class TestTwitterApiAdapter implements ApiAdapter<TestTwitterApi> {

        private String accountId = "1";

        private String name = "@kdonald";

        private String profileUrl = "http://twitter.com/kdonald";

        private String profilePictureUrl = "http://twitter.com/kdonald/a_new_picture";

        public boolean test(TestTwitterApi api) {
            return true;
        }

        public void setConnectionValues(TestTwitterApi api, ConnectionValues values) {
            values.setProviderUserId(accountId);
            values.setDisplayName(name);
            values.setProfileUrl(profileUrl);
            values.setImageUrl(profilePictureUrl);
        }

        public UserProfile fetchUserProfile(TestTwitterApi api) {
            return new UserProfileBuilder().setName(name).setUsername("kdonald").build();
        }

        public void updateStatus(TestTwitterApi api, String message) {
        }

    }
}
