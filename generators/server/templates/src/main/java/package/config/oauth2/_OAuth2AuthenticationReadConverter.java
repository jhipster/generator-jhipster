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
package <%=packageName%>.config.oauth2;

<%_ if (databaseType === 'couchbase') { _%>
import org.springframework.data.couchbase.core.mapping.CouchbaseDocument;
import org.springframework.data.couchbase.core.mapping.CouchbaseList;
<%_ } else { _%>
import com.mongodb.DBObject;
<% } %>
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.OAuth2Request;

import java.io.Serializable;
import java.util.*;

/**
 * Converter to deserialize back into an OAuth2Authentication Object made necessary because
 * Spring <% if (databaseType === 'couchbase') { %>Couchbase<% } else { %>Mongo<% } %> can't map clientAuthentication to authorizationRequest.
 */
@ReadingConverter
public class OAuth2AuthenticationReadConverter implements Converter<<% if (databaseType === 'couchbase') { %>CouchbaseDocument<% } else { %>DBObject<% } %>, OAuth2Authentication> {

    @Override
    @SuppressWarnings("unchecked")
    public OAuth2Authentication convert(<% if (databaseType === 'couchbase') { %>CouchbaseDocument<% } else { %>DBObject<% } %> source) {
        <%_ if (databaseType === 'couchbase') { _%>
        Map<String, Object> storedRequest = ((CouchbaseDocument) source.get("storedRequest")).export();
        <%_ } else { _%>
        DBObject storedRequest = (DBObject) source.get("storedRequest");
        <%_ } _%>
        OAuth2Request oAuth2Request = new OAuth2Request(
            (Map<String, String>) storedRequest.get("requestParameters"),
            (String) storedRequest.get("clientId"),
            getAuthorities((List<Map<String, String>>) storedRequest.get("authorities")),
            (boolean) storedRequest.get("approved"),
            new HashSet<>((List<String>) storedRequest.get("scope")),
            new HashSet<>((List<String>) storedRequest.get("resourceIds")),
            (String) storedRequest.get("redirectUri"),
            new HashSet<>((List<String>) storedRequest.get("responseTypes")),
            (Map<String, Serializable>) storedRequest.get("extensionProperties"));

        <% if (databaseType === 'couchbase') { %>CouchbaseDocument<% } else { %>DBObject<% } %> userAuthorization = (<% if (databaseType === 'couchbase') { %>CouchbaseDocument<% } else { %>DBObject<% } %>) source.get("userAuthentication");
        Object principal = getPrincipalObject(userAuthorization.get("principal"));
        Authentication userAuthentication = new UsernamePasswordAuthenticationToken(principal, userAuthorization.get("credentials"),
        <%_ if (databaseType === 'couchbase') { _%>
            getAuthorities((List) ((CouchbaseList) userAuthorization.get("authorities")).export()));
        <%_ } else { _%>
            getAuthorities((List<Map<String, String>>) userAuthorization.get("authorities")));
        <%_ } _%>

        return new OAuth2Authentication(oAuth2Request,  userAuthentication);
    }

@SuppressWarnings("unchecked")
    private Object getPrincipalObject(Object principal) {
        if(principal instanceof <% if (databaseType === 'couchbase') { %>CouchbaseDocument<% } else { %>DBObject<% } %>) {
            <%_ if (databaseType === 'couchbase') { _%>
            Map<String, Object> principalDBObject = ((CouchbaseDocument) principal).export();
            <%_ } else { _%>
            DBObject principalDBObject = (DBObject) principal;
            <%_ } _%>

            String userName = (String) principalDBObject.get("username");
            String password = "";
            boolean enabled = (boolean) principalDBObject.get("enabled");
            boolean accountNonExpired = (boolean) principalDBObject.get("accountNonExpired");
            boolean credentialsNonExpired = (boolean) principalDBObject.get("credentialsNonExpired");
            boolean accountNonLocked = (boolean) principalDBObject.get("accountNonLocked");

            return new org.springframework.security.core.userdetails.User(userName, password, enabled,
                    accountNonExpired, credentialsNonExpired, accountNonLocked, getAuthorities((List<Map<String, String>>) principalDBObject.get("authorities")));
        } else {
            return principal;
        }
    }

    private Collection<GrantedAuthority> getAuthorities(List<Map<String, String>> authorities) {
        Set<GrantedAuthority> grantedAuthorities = new HashSet<>(authorities.size());
        for (Map<String, String> authority : authorities) {
            grantedAuthorities.add(new SimpleGrantedAuthority(authority.get("role")));
        }
        return grantedAuthorities;
    }
}
