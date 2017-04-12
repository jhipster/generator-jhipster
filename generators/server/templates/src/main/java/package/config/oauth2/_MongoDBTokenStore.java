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
package <%=packageName%>.config.oauth2;

import <%=packageName%>.domain.OAuth2AuthenticationAccessToken;
import <%=packageName%>.domain.OAuth2AuthenticationRefreshToken;
import <%=packageName%>.repository.OAuth2AccessTokenRepository;
import <%=packageName%>.repository.OAuth2RefreshTokenRepository;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.OAuth2RefreshToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.token.AuthenticationKeyGenerator;
import org.springframework.security.oauth2.provider.token.DefaultAuthenticationKeyGenerator;
import org.springframework.security.oauth2.provider.token.TokenStore;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * A MongoDB implementation of the TokenStore.
 */
public class MongoDBTokenStore implements TokenStore {

    private final OAuth2AccessTokenRepository oAuth2AccessTokenRepository;

    private final OAuth2RefreshTokenRepository oAuth2RefreshTokenRepository;

    private AuthenticationKeyGenerator authenticationKeyGenerator = new DefaultAuthenticationKeyGenerator();

    public MongoDBTokenStore(final OAuth2AccessTokenRepository oAuth2AccessTokenRepository,
                             final OAuth2RefreshTokenRepository oAuth2RefreshTokenRepository) {
        this.oAuth2AccessTokenRepository = oAuth2AccessTokenRepository;
        this.oAuth2RefreshTokenRepository = oAuth2RefreshTokenRepository;
    }

    @Override
    public OAuth2Authentication readAuthentication(OAuth2AccessToken token) {
        return readAuthentication(token.getValue());
    }

    @Override
    public OAuth2Authentication readAuthentication(String tokenValue) {
        OAuth2AuthenticationAccessToken token = oAuth2AccessTokenRepository.findByTokenId(tokenValue);
        return token == null ? null : token.getAuthentication();
    }

    @Override
    public void storeAccessToken(OAuth2AccessToken token, OAuth2Authentication authentication) {
        OAuth2AuthenticationAccessToken oAuth2AuthenticationAccessToken = new OAuth2AuthenticationAccessToken(token,
                authentication, authenticationKeyGenerator.extractKey(authentication));
        oAuth2AccessTokenRepository.save(oAuth2AuthenticationAccessToken);
    }

    @Override
    public OAuth2AccessToken readAccessToken(String tokenValue) {
        OAuth2AuthenticationAccessToken token = oAuth2AccessTokenRepository.findByTokenId(tokenValue);
        return token == null ? null : token.getoAuth2AccessToken();
    }

    @Override
    public void removeAccessToken(OAuth2AccessToken token) {
        OAuth2AuthenticationAccessToken accessToken = oAuth2AccessTokenRepository.findByTokenId(token.getValue());
        if (accessToken != null) {
            oAuth2AccessTokenRepository.delete(accessToken);
        }
    }

    @Override
    public void storeRefreshToken(OAuth2RefreshToken refreshToken, OAuth2Authentication authentication) {
        oAuth2RefreshTokenRepository.save(new OAuth2AuthenticationRefreshToken(refreshToken, authentication));
    }

    @Override
    public OAuth2RefreshToken readRefreshToken(String tokenValue) {
        OAuth2AuthenticationRefreshToken token = oAuth2RefreshTokenRepository.findByTokenId(tokenValue);
        return token == null ? null : token.getoAuth2RefreshToken();
    }

    @Override
    public OAuth2Authentication readAuthenticationForRefreshToken(OAuth2RefreshToken token) {
        OAuth2AuthenticationRefreshToken refreshToken = oAuth2RefreshTokenRepository.findByTokenId(token.getValue());
        return refreshToken == null ? null : refreshToken.getAuthentication();
    }

    @Override
    public void removeRefreshToken(OAuth2RefreshToken token) {
        OAuth2AuthenticationRefreshToken refreshToken = oAuth2RefreshTokenRepository.findByTokenId(token.getValue());
        if (refreshToken != null) {
            oAuth2RefreshTokenRepository.delete(refreshToken);
        }
    }

    @Override
    public void removeAccessTokenUsingRefreshToken(OAuth2RefreshToken refreshToken) {
        OAuth2AuthenticationAccessToken accessToken = oAuth2AccessTokenRepository.findByRefreshToken(refreshToken.getValue());
        if(accessToken != null) {
            oAuth2AccessTokenRepository.delete(accessToken);
        }
    }

    @Override
    public OAuth2AccessToken getAccessToken(OAuth2Authentication authentication) {
        OAuth2AuthenticationAccessToken token =  oAuth2AccessTokenRepository.findByAuthenticationId(authenticationKeyGenerator.extractKey(authentication));
        return token == null ? null : token.getoAuth2AccessToken();
    }

    @Override
    public Collection<OAuth2AccessToken> findTokensByClientId(String clientId) {
        List<OAuth2AuthenticationAccessToken> tokens = oAuth2AccessTokenRepository.findByClientId(clientId);
        return extractAccessTokens(tokens);
    }

    @Override
    public Collection<OAuth2AccessToken> findTokensByClientIdAndUserName(String clientId, String userName) {
        List<OAuth2AuthenticationAccessToken> tokens = oAuth2AccessTokenRepository.findByClientIdAndUserName(clientId, userName);
        return extractAccessTokens(tokens);
    }

    private Collection<OAuth2AccessToken> extractAccessTokens(List<OAuth2AuthenticationAccessToken> tokens) {
        List<OAuth2AccessToken> accessTokens = new ArrayList<>();
        for(OAuth2AuthenticationAccessToken token : tokens) {
            accessTokens.add(token.getoAuth2AccessToken());
        }
        return accessTokens;
    }
}
