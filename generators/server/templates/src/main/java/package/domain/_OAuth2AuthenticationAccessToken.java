<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
package <%=packageName%>.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.PersistenceConstructor;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;

import java.io.Serializable;
import java.util.UUID;

@Document(collection = "OAUTH_AUTHENTICATION_ACCESS_TOKEN")
public class OAuth2AuthenticationAccessToken implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    private String tokenId;

    private OAuth2AccessToken oAuth2AccessToken;

    private String authenticationId;

    private String userName;

    private String clientId;

    private OAuth2Authentication authentication;

    private String refreshToken;

    @PersistenceConstructor
    public OAuth2AuthenticationAccessToken(OAuth2AccessToken oAuth2AccessToken, OAuth2Authentication authentication, String authenticationId) {
        this.id = UUID.randomUUID().toString();
        this.tokenId = oAuth2AccessToken.getValue();
        this.oAuth2AccessToken = oAuth2AccessToken;
        this.authenticationId = authenticationId;
        this.userName = authentication.getName();
        this.clientId = authentication.getOAuth2Request().getClientId();
        this.authentication = authentication;
        if(oAuth2AccessToken.getRefreshToken() != null) {
            this.refreshToken = oAuth2AccessToken.getRefreshToken().getValue();
        }
    }

    public String getTokenId() {
        return tokenId;
    }

    public OAuth2AccessToken getoAuth2AccessToken() {
        return oAuth2AccessToken;
    }

    public String getAuthenticationId() {
        return authenticationId;
    }

    public String getUserName() {
        return userName;
    }

    public String getClientId() {
        return clientId;
    }

    public OAuth2Authentication getAuthentication() {
        return authentication;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) { return true; }
        if (o == null || getClass() != o.getClass()) { return false; }

        OAuth2AuthenticationAccessToken that = (OAuth2AuthenticationAccessToken) o;

        if (id != null ? !id.equals(that.id) : that.id != null) { return false; }

        return true;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
