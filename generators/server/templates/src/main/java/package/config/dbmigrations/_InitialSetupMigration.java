package <%=packageName%>.config.dbmigrations;

import <%=packageName%>.domain.Authority;
import <%=packageName%>.domain.User;
import <%=packageName%>.security.AuthoritiesConstants;

import com.github.mongobee.changeset.ChangeLog;
import com.github.mongobee.changeset.ChangeSet;
import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.time.ZonedDateTime;
import java.util.*;

/**
 * Creates the initial database setup
 */
@ChangeLog(order = "001")
public class InitialSetupMigration {

<%_ if (databaseType === 'mongodb' && authenticationType === 'oauth2') { _%>
    private Map<String, String>[] grantAuthorities = new Map[] { new HashMap<>(), new HashMap<>() };

    {
        grantAuthorities[0].put("role", "ROLE_ADMIN");
        grantAuthorities[0].put("_class", "org.springframework.security.core.authority.SimpleGrantedAuthority");
        grantAuthorities[1].put("role", "ROLE_USER");
        grantAuthorities[1].put("_class", "org.springframework.security.core.authority.SimpleGrantedAuthority");
    }

<%_ } _%>
    @ChangeSet(order = "01", author = "initiator", id = "01-addAuthorities")
    public void addAuthorities(MongoTemplate mongoTemplate) {
        mongoTemplate.save(new Authority(AuthoritiesConstants.ADMIN));
        mongoTemplate.save(new Authority(AuthoritiesConstants.USER));
    }

    @ChangeSet(order = "02", author = "initiator", id = "02-addUsers")
    public void addUsers(MongoTemplate mongoTemplate) {
        Authority adminAuthority = new Authority(AuthoritiesConstants.ADMIN);
        Authority userAuthority = new Authority(AuthoritiesConstants.USER);

        User systemUser = new User();
        systemUser.setId("user-0");
        systemUser.setLogin("system");
        systemUser.setPassword("$2a$10$mE.qmcV0mFU5NcKh73TZx.z4ueI/.bDWbj0T1BYyqP481kGGarKLG");
        systemUser.setFirstName("");
        systemUser.setLastName("System");
        systemUser.setEmail("system@localhost");
        systemUser.setActivated(true);
        systemUser.setLangKey("en");
        systemUser.setCreatedBy(systemUser.getLogin());
        systemUser.setCreatedDate(ZonedDateTime.now());
        systemUser.getAuthorities().add(adminAuthority);
        systemUser.getAuthorities().add(userAuthority);
        mongoTemplate.save(systemUser);

        User anonymousUser = new User();
        anonymousUser.setId("user-1");
        anonymousUser.setLogin("anonymoususer");
        anonymousUser.setPassword("$2a$10$j8S5d7Sr7.8VTOYNviDPOeWX8KcYILUVJBsYV83Y5NtECayypx9lO");
        anonymousUser.setFirstName("Anonymous");
        anonymousUser.setLastName("User");
        anonymousUser.setEmail("anonymous@localhost");
        anonymousUser.setActivated(true);
        anonymousUser.setLangKey("en");
        anonymousUser.setCreatedBy(systemUser.getLogin());
        anonymousUser.setCreatedDate(ZonedDateTime.now());
        mongoTemplate.save(anonymousUser);

        User adminUser = new User();
        adminUser.setId("user-2");
        adminUser.setLogin("admin");
        adminUser.setPassword("$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC");
        adminUser.setFirstName("admin");
        adminUser.setLastName("Administrator");
        adminUser.setEmail("admin@localhost");
        adminUser.setActivated(true);
        adminUser.setLangKey("en");
        adminUser.setCreatedBy(systemUser.getLogin());
        adminUser.setCreatedDate(ZonedDateTime.now());
        adminUser.getAuthorities().add(adminAuthority);
        adminUser.getAuthorities().add(userAuthority);
        mongoTemplate.save(adminUser);

        User userUser = new User();
        userUser.setId("user-3");
        userUser.setLogin("user");
        userUser.setPassword("$2a$10$VEjxo0jq2YG9Rbk2HmX9S.k1uZBGYUHdUcid3g/vfiEl7lwWgOH/K");
        userUser.setFirstName("");
        userUser.setLastName("User");
        userUser.setEmail("user@localhost");
        userUser.setActivated(true);
        userUser.setLangKey("en");
        userUser.setCreatedBy(systemUser.getLogin());
        userUser.setCreatedDate(ZonedDateTime.now());
        userUser.getAuthorities().add(userAuthority);
        mongoTemplate.save(userUser);
    }
<%_ if (enableSocialSignIn) { _%>
    @ChangeSet(author = "initiator", id = "03-addSocialUserConnection", order = "03")
    public void addSocialUserConnection(DB db) {
        DBCollection socialUserConnectionCollection = db.getCollection("jhi_social_user_connection");
        socialUserConnectionCollection.createIndex(BasicDBObjectBuilder
                .start("user_id", 1)
                .add("provider_id", 1)
                .add("provider_user_id", 1)
                .get(),
            "user-prov-provusr-idx", true);
    }

<%_ } _%>
<%_ if (databaseType === 'mongodb' && authenticationType === 'oauth2') { _%>
    @ChangeSet(order = "04", author = "initiator", id = "04-addOAuthClientDetails")
    public void addOAuthClientDetails(DB db) {

        DBCollection usersCollection = db.getCollection("OAUTH_AUTHENTICATION_CLIENT_DETAILS");
        usersCollection.insert(BasicDBObjectBuilder.start()
            .add("_id", "client-1")
            .add("clientId", "<%= baseName %>app")
            .add("clientSecret", "my-secret-token-to-change-in-production")
            .add("resourceIds", Collections.singletonList("res_<%= baseName %>"))
            .add("scope", Arrays.asList("read", "write"))
            .add("authorizedGrantTypes", Arrays.asList("password", "refresh_token", "authorization_code", "implicit"))
            //.add("web_server_redirect_uri", null)
            .add("authorities", grantAuthorities)
            .add("accessTokenValiditySeconds", 1800)
            .add("refreshTokenValiditySeconds", 2000)
            //.add("autoapprove", false)
            .get()
        );

        usersCollection.insert(BasicDBObjectBuilder.start()
            .add("_id", "client-2")
            .add("clientId", "your-client-id")
            .add("clientSecret", "your-client-secret-if-required")
            .add("resourceIds", Collections.singletonList("res_<%= baseName %>"))
            .add("scope", Collections.singletonList("access"))
            .add("authorizedGrantTypes", Arrays.asList("refresh_token", "authorization_code", "implicit"))
            //.add("web_server_redirect_uri", null)
            .add("authorities", grantAuthorities)
            .add("accessTokenValiditySeconds", 1800)
            .add("refreshTokenValiditySeconds", 2000)
            //.add("autoapprove", false)
            .get()
        );
    }
<%_ } _%>
}
