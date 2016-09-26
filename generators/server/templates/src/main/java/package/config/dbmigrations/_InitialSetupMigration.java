package <%=packageName%>.config.dbmigrations;

import com.github.mongobee.changeset.ChangeLog;
import com.github.mongobee.changeset.ChangeSet;
import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DB;
import com.mongodb.DBCollection;

import java.util.*;

/**
 * Creates the initial database setup
 */
@ChangeLog(order = "001")
public class InitialSetupMigration {

    private Map<String, String>[] authoritiesUser = new Map[]{new HashMap<>()};

    private Map<String, String>[] authoritiesAdminAndUser = new Map[]{new HashMap<>(), new HashMap<>()};

    {
        authoritiesUser[0].put("_id", "ROLE_USER");
        authoritiesAdminAndUser[0].put("_id", "ROLE_USER");
        authoritiesAdminAndUser[1].put("_id", "ROLE_ADMIN");
    }

<%_ if (databaseType === 'mongodb' && authenticationType === 'oauth2') { _%>
    private Map<String, String>[] grantAuthorities = new Map[]{new HashMap<>(), new HashMap<>()};

    {
        grantAuthorities[0].put("role", "ROLE_ADMIN");
        grantAuthorities[0].put("_class", "org.springframework.security.core.authority.SimpleGrantedAuthority");
        grantAuthorities[1].put("role", "ROLE_USER");
        grantAuthorities[1].put("_class", "org.springframework.security.core.authority.SimpleGrantedAuthority");
    }

<%_ } _%>
    @ChangeSet(order = "01", author = "initiator", id = "01-addAuthorities")
    public void addAuthorities(DB db) {
        DBCollection authorityCollection = db.getCollection("jhi_authority");
        authorityCollection.insert(
            BasicDBObjectBuilder.start()
                .add("_id", "ROLE_ADMIN")
                .get());
        authorityCollection.insert(
            BasicDBObjectBuilder.start()
                .add("_id", "ROLE_USER")
                .get());
    }

    @ChangeSet(order = "02", author = "initiator", id = "02-addUsers")
    public void addUsers(DB db) {
        DBCollection usersCollection = db.getCollection("jhi_user");
        usersCollection.createIndex("login");
        usersCollection.createIndex("email");
        usersCollection.insert(BasicDBObjectBuilder.start()
            .add("_id", "user-0")
            .add("login", "system")
            .add("password", "$2a$10$mE.qmcV0mFU5NcKh73TZx.z4ueI/.bDWbj0T1BYyqP481kGGarKLG")
            .add("first_name", "")
            .add("last_name", "System")
            .add("email", "system@localhost")
            .add("activated", "true")
            .add("lang_key", "en")
            .add("created_by", "system")
            .add("created_date", new Date())
            .add("authorities", authoritiesAdminAndUser)
            .get()
        );
        usersCollection.insert(BasicDBObjectBuilder.start()
            .add("_id", "user-1")
            .add("login", "anonymousUser")
            .add("password", "$2a$10$j8S5d7Sr7.8VTOYNviDPOeWX8KcYILUVJBsYV83Y5NtECayypx9lO")
            .add("first_name", "Anonymous")
            .add("last_name", "User")
            .add("email", "anonymous@localhost")
            .add("activated", "true")
            .add("lang_key", "en")
            .add("created_by", "system")
            .add("created_date", new Date())
            .add("authorities", new Map[]{})
            .get()
        );
        usersCollection.insert(BasicDBObjectBuilder.start()
            .add("_id", "user-2")
            .add("login", "admin")
            .add("password", "$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC")
            .add("first_name", "admin")
            .add("last_name", "Administrator")
            .add("email", "admin@localhost")
            .add("activated", "true")
            .add("lang_key", "en")
            .add("created_by", "system")
            .add("created_date", new Date())
            .add("authorities", authoritiesAdminAndUser)
            .get()
        );
        usersCollection.insert(BasicDBObjectBuilder.start()
            .add("_id", "user-3")
            .add("login", "user")
            .add("password", "$2a$10$VEjxo0jq2YG9Rbk2HmX9S.k1uZBGYUHdUcid3g/vfiEl7lwWgOH/K")
            .add("first_name", "")
            .add("last_name", "User")
            .add("email", "user@localhost")
            .add("activated", "true")
            .add("lang_key", "en")
            .add("created_by", "system")
            .add("created_date", new Date())
            .add("authorities", authoritiesUser)
            .get()
        );
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
            .add("clientId", "mongooauthapp")
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
